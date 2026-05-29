import { useState, useEffect, useCallback } from 'react';

export interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  content_types: string[];
  created_at: string;
  updated_at: string;
}

const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'));

const API_BASE = isLocal ? 'http://localhost:5000/api' : '/api';

export const useContentCategories = () => {
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Récupérer toutes les catégories
  const fetchCategories = useCallback(async (activeOnly = true) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('active_only', activeOnly ? 'true' : 'false');

      const resp = await fetch(`${API_BASE}/categories?${params}`);
      if (!resp.ok) throw new Error('Erreur lors de la récupération des catégories');
      const result = await resp.json();

      setCategories(result.data || []);
    } catch (err) {
      console.error('Erreur récupération catégories:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer une nouvelle catégorie
  const createCategory = useCallback(async (categoryData: Omit<ContentCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const resp = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      if (!resp.ok) throw new Error('Erreur lors de la création de la catégorie');
      const result = await resp.json();

      setCategories(prev => [...prev, result.data]);
      return result.data;
    } catch (err) {
      console.error('Erreur création catégorie:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour une catégorie
  const updateCategory = useCallback(async (id: string, updates: Partial<ContentCategory>) => {
    try {
      setLoading(true);
      setError(null);

      const resp = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!resp.ok) throw new Error('Erreur lors de la mise à jour de la catégorie');
      const result = await resp.json();

      setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...result.data } : cat));
      return result.data;
    } catch (err) {
      console.error('Erreur mise à jour catégorie:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Supprimer une catégorie
  const deleteCategory = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const resp = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Erreur lors de la suppression de la catégorie');

      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      console.error('Erreur suppression catégorie:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer une catégorie par slug
  const getCategoryBySlug = useCallback(async (slug: string): Promise<ContentCategory | null> => {
    try {
      const resp = await fetch(`${API_BASE}/categories/${slug}`);
      if (resp.status === 404) return null;
      if (!resp.ok) throw new Error('Erreur lors de la récupération de la catégorie');
      const result = await resp.json();
      return result.data;
    } catch (err) {
      console.error('Erreur récupération catégorie par slug:', err);
      return null;
    }
  }, []);

  // Charger les catégories au montage
  useEffect(() => {
    fetchCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryBySlug,
  };
};
