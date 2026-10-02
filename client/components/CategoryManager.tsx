import React, { useState } from 'react';
import { useContentCategories, ContentCategory } from '../hooks/useContentCategories';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

export const CategoryManager: React.FC = () => {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useContentCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<Partial<ContentCategory>>({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
    icon: '',
    content_types: ['article', 'podcast'],
    sort_order: 0,
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        setEditingId(null);
      } else {
        await createCategory(formData as Omit<ContentCategory, 'id' | 'created_at' | 'updated_at'>);
        setShowCreateForm(false);
      }
      resetForm();
    } catch (error) {
      console.error('Erreur sauvegarde catégorie:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
      icon: '',
      content_types: ['article', 'podcast'],
      sort_order: 0,
      is_active: true
    });
  };

  const startEdit = (category: ContentCategory) => {
    setEditingId(category.id);
    setFormData(category);
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowCreateForm(false);
    resetForm();
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  if (loading) {
    return <div className="p-4">Chargement des catégories...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Catégories</h2>
        <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm || !!editingId}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Catégorie
        </Button>
      </div>

      {/* Formulaire de création/édition */}
      {(showCreateForm || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Nom de la catégorie"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug</label>
                  <Input
                    value={formData.slug || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="slug-automatique"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de la catégorie"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Couleur</label>
                  <Input
                    type="color"
                    value={formData.color || '#3B82F6'}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Icône</label>
                  <Input
                    value={formData.icon || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="TrendingUp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ordre</label>
                  <Input
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Types de contenu</label>
                <div className="flex gap-2">
                  {['article', 'podcast', 'indice'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.content_types?.includes(type) || false}
                        onChange={(e) => {
                          const types = formData.content_types || [];
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, content_types: [...types, type] }));
                          } else {
                            setFormData(prev => ({ ...prev, content_types: types.filter(t => t !== type) }));
                          }
                        }}
                        className="mr-1"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des catégories */}
      <div className="grid gap-4">
        {categories.map(category => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="font-semibold">{category.name}</h3>
                    <Badge variant="outline">{category.slug}</Badge>
                    {!category.is_active && (
                      <Badge variant="destructive">Inactif</Badge>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                  )}
                  <div className="flex gap-1">
                    {category.content_types.map(type => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(category)}
                    disabled={editingId !== null || showCreateForm}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteCategory(category.id)}
                    disabled={editingId !== null || showCreateForm}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
