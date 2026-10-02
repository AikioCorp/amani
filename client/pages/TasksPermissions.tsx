import React, { useState } from 'react';
import { Users, Shield, CheckCircle, Clock, AlertCircle, Plus, Search, Filter, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import DashboardLayout from '../components/DashboardLayout';

const TasksPermissions = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const permissions = [
    { id: 'content_create', name: 'Créer du contenu', description: 'Peut créer de nouveaux articles et contenus' },
    { id: 'content_edit', name: 'Modifier le contenu', description: 'Peut modifier le contenu existant' },
    { id: 'content_delete', name: 'Supprimer le contenu', description: 'Peut supprimer du contenu' },
    { id: 'content_publish', name: 'Publier du contenu', description: 'Peut publier et dépublier du contenu' },
    { id: 'user_manage', name: 'Gérer les utilisateurs', description: 'Peut créer et gérer les comptes utilisateurs' },
    { id: 'analytics_view', name: 'Voir les analytics', description: 'Accès aux statistiques et rapports' },
    { id: 'system_admin', name: 'Administration système', description: 'Accès complet à l\'administration' }
  ];

  const users = [
    {
      id: 1,
      name: 'Dr. Amina Kone',
      email: 'a.kone@amani.com',
      role: 'Éditeur en Chef',
      permissions: ['content_create', 'content_edit', 'content_publish', 'analytics_view'],
      lastActive: '2024-03-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jean-Baptiste Ouédraogo',
      email: 'jb.ouedraogo@amani.com',
      role: 'Rédacteur Senior',
      permissions: ['content_create', 'content_edit'],
      lastActive: '2024-03-14',
      status: 'active'
    },
    {
      id: 3,
      name: 'Sarah Diallo',
      email: 's.diallo@amani.com',
      role: 'Journaliste',
      permissions: ['content_create'],
      lastActive: '2024-03-13',
      status: 'active'
    },
    {
      id: 4,
      name: 'Mohamed El Fassi',
      email: 'm.elfassi@amani.com',
      role: 'Analyste',
      permissions: ['content_create', 'analytics_view'],
      lastActive: '2024-03-10',
      status: 'inactive'
    }
  ];

  const tasks = [
    {
      id: 1,
      title: 'Rédiger l\'article sur l\'économie numérique',
      assignedTo: 'Jean-Baptiste Ouédraogo',
      assignedBy: 'Dr. Amina Kone',
      section: 'Tech',
      priority: 'Haute',
      status: 'En cours',
      dueDate: '2024-03-20',
      description: 'Analyser l\'impact de la transformation numérique sur l\'économie africaine'
    },
    {
      id: 2,
      title: 'Mise à jour des données du marché boursier',
      assignedTo: 'Sarah Diallo',
      assignedBy: 'Dr. Amina Kone',
      section: 'Marché',
      priority: 'Moyenne',
      status: 'Terminée',
      dueDate: '2024-03-18',
      description: 'Actualiser les données et graphiques du tableau de bord marché'
    },
    {
      id: 3,
      title: 'Enregistrement podcast avec expert fintech',
      assignedTo: 'Mohamed El Fassi',
      assignedBy: 'Sarah Diallo',
      section: 'Podcast',
      priority: 'Haute',
      status: 'En attente',
      dueDate: '2024-03-25',
      description: 'Préparer et enregistrer un épisode sur les innovations fintech'
    },
    {
      id: 4,
      title: 'Révision article investissements agricoles',
      assignedTo: 'Dr. Amina Kone',
      assignedBy: 'Jean-Baptiste Ouédraogo',
      section: 'Investissement',
      priority: 'Basse',
      status: 'En révision',
      dueDate: '2024-03-22',
      description: 'Relecture et validation de l\'article sur les opportunités agricoles'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminée': return 'text-green-600 bg-green-100';
      case 'En cours': return 'text-blue-600 bg-blue-100';
      case 'En attente': return 'text-yellow-600 bg-yellow-100';
      case 'En révision': return 'text-purple-600 bg-purple-100';
      case 'En retard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Haute': return 'text-red-600 bg-red-100';
      case 'Moyenne': return 'text-yellow-600 bg-yellow-100';
      case 'Basse': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Terminée': return CheckCircle;
      case 'En cours': return Clock;
      case 'En attente': return AlertCircle;
      default: return Clock;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || task.status.toLowerCase().includes(selectedFilter);
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tâches & Permissions</h1>
            <p className="text-gray-600 mt-2">Gérez les tâches assignées et les permissions des utilisateurs</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter Utilisateur
            </Button>
            <Button className="bg-[#373B3A] hover:bg-gray-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Tâche
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Card>
          <CardContent className="p-0">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'tasks'
                    ? 'border-b-2 border-[#373B3A] text-[#373B3A]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Gestion des Tâches
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'permissions'
                    ? 'border-b-2 border-[#373B3A] text-[#373B3A]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Permissions & Utilisateurs
              </button>
            </div>
          </CardContent>
        </Card>

        {activeTab === 'tasks' && (
          <>
            {/* Task Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tâches</p>
                      <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">En Cours</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {tasks.filter(t => t.status === 'En cours').length}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Terminées</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {tasks.filter(t => t.status === 'Terminée').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Haute Priorité</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {tasks.filter(t => t.priority === 'Haute').length}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Rechercher des tâches..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#373B3A] focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="en cours">En cours</option>
                    <option value="en attente">En attente</option>
                    <option value="terminée">Terminée</option>
                    <option value="en révision">En révision</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Tasks List */}
            <Card>
              <CardHeader>
                <CardTitle>Tâches Assignées ({filteredTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTasks.map((task) => {
                    const StatusIcon = getStatusIcon(task.status);
                    return (
                      <div key={task.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <StatusIcon className="h-5 w-5 text-gray-400" />
                              <h3 className="font-semibold text-gray-900">{task.title}</h3>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{task.description}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <span><strong>Assignée à:</strong> {task.assignedTo}</span>
                              <span><strong>Par:</strong> {task.assignedBy}</span>
                              <span><strong>Section:</strong> {task.section}</span>
                              <span><strong>Échéance:</strong> {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'permissions' && (
          <>
            {/* Users List */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Utilisateurs & Permissions</CardTitle>
                    <CardDescription>Gérez les utilisateurs et leurs permissions d'accès</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher des utilisateurs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[#373B3A] rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-gray-600">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status === 'active' ? 'Actif' : 'Inactif'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            Dernière connexion: {new Date(user.lastActive).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                        <div className="flex flex-wrap gap-2">
                          {user.permissions.map((permId) => {
                            const permission = permissions.find(p => p.id === permId);
                            return permission ? (
                              <Badge key={permId} variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                {permission.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm">
                          Modifier Permissions
                        </Button>
                        <Button variant="outline" size="sm">
                          Assigner Tâche
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Permissions Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Référence des Permissions</CardTitle>
                <CardDescription>Liste complète des permissions disponibles dans le système</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-[#373B3A]" />
                        <h4 className="font-medium text-gray-900">{permission.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TasksPermissions;
