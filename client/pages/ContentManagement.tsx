import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useArticles } from "../hooks/useArticles";
import { usePodcasts } from "../hooks/usePodcasts";
import { API_BASE_URL } from "../services/apiConfig";
import { getSessionToken } from "../services/authService";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  FileText,
  Image,
  Video,
  BarChart3,
  Search,
  Filter,
  TrendingUp,
  Mic,
  Settings,
  ExternalLink,
  Star,
  Crown,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const ContentManagement = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { success, error, warning } = useToast();

  const [selectedSection, setSelectedSection] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Données temps réel depuis Supabase
  const { articles, loading: loadingArticles, error: errorArticles } = useArticles({ status: 'all', limit: 50 });
  const { podcasts, loading: loadingPodcasts, error: errorPodcasts } = usePodcasts({ status: 'all', limit: 50 });

  // Vérification des permissions
  if (!user || !hasPermission("create_articles")) {
    return (
      <>
        <div className="flex items-center justify-center py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Accès refusé
            </h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas les permissions nécessaires pour gérer le contenu.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Construire les éléments à partir des données réelles
  const itemsFromArticles = (articles || []).map((a) => ({
    id: a.id,
    title: a.title,
    section: a.category_info?.name || 'Général',
    type: 'Article' as const,
    status: a.status === 'published' ? 'Publié' : (a.status === 'draft' ? 'Brouillon' : a.status === 'review' ? 'En révision' : a.status),
    author: a.author?.first_name ? `${a.author.first_name} ${a.author.last_name || ''}`.trim() : 'Auteur',
    date: a.created_at,
    views: `${a.views ?? 0}`,
    featured: Boolean(a.article_data && (a.article_data as any).featured),
    is_premium: Boolean((a as any).is_premium),
    editPath: `/dashboard/articles/edit/${a.id}`,
    viewPath: `/article/${a.slug || a.id}`,
  }));

  const itemsFromPodcasts = (podcasts || []).map((p) => ({
    id: p.id,
    title: p.title,
    section: p.categories?.name || 'Podcasts',
    type: 'Podcast' as const,
    status: p.status === 'published' ? 'Publié' : (p.status === 'draft' ? 'Brouillon' : p.status === 'scheduled' ? 'Programmé' : p.status),
    author: 'Podcast',
    date: p.created_at,
    views: `${p.views ?? 0}`,
    featured: Boolean(p.podcast_data && p.podcast_data.rating && p.podcast_data.rating >= 4.5),
    is_premium: Boolean((p as any).is_premium),
    editPath: `/dashboard/podcasts/edit/${p.id}`,
    viewPath: `/podcast`,
  }));

  const contentItems = [...itemsFromArticles, ...itemsFromPodcasts];

  const totalPublished = contentItems.filter(ci => ci.status === 'Publié').length;
  const contentStats = [
    {
      title: "Articles Publiés",
      value: `${itemsFromArticles.filter(a => a.status === 'Publié').length}`,
      change: "",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Podcasts",
      value: `${itemsFromPodcasts.length}`,
      change: "",
      icon: Mic,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Contenu total",
      value: `${contentItems.length}`,
      change: "",
      icon: Eye,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Publiés",
      value: `${totalPublished}`,
      change: "",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  const distinctSections = Array.from(new Set(contentItems.map(ci => ci.section))).filter(Boolean);
  const contentSections = [
    { id: 'all', name: 'Tout le contenu', icon: FileText, color: 'text-gray-600', count: contentItems.length },
    ...distinctSections.map((name) => ({ id: name.toLowerCase(), name, icon: Tag, color: 'text-blue-600', count: contentItems.filter(ci => ci.section.toLowerCase() === String(name).toLowerCase()).length }))
  ];

  // Affichage: gestion du chargement/erreur simple
  if (errorArticles || errorPodcasts) {
    return (
      <>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Une erreur est survenue lors du chargement du contenu.
        </div>
      </>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Publié":
        return "bg-green-100 text-green-800";
      case "Brouillon":
        return "bg-gray-100 text-gray-800";
      case "En révision":
        return "bg-yellow-100 text-yellow-800";
      case "Archivé":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Article":
        return FileText;
      case "Podcast":
        return Mic;
      case "Indice":
        return BarChart3;
      case "Image":
        return Image;
      default:
        return FileText;
    }
  };

  const filteredContent = contentItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection =
      selectedSection === "all" ||
      item.section.toLowerCase() === selectedSection;
    const matchesStatus =
      statusFilter === "all" || item.status.toLowerCase() === statusFilter;
    const matchesType =
      typeFilter === "all" || item.type.toLowerCase() === typeFilter;
    return matchesSearch && matchesSection && matchesStatus && matchesType;
  });

  const handleCreateNew = (type: string) => {
    switch (type) {
      case "article":
        navigate("/dashboard/articles/new");
        break;
      case "podcast":
        navigate("/dashboard/podcasts/new");
        break;
      case "indice":
        navigate("/dashboard/indices/new");
        break;
      default:
        warning("Non implémenté", `Création de ${type} bientôt disponible`);
    }
  };

  const handleEdit = (item: any) => {
    navigate(item.editPath);
  };

  const handleDelete = (item: any) => {
    warning("Suppression", `${item.type} "${item.title}" supprimé`);
  };

  const handleView = (item: any) => {
    if (item.viewPath) {
      navigate(item.viewPath);
    } else {
      success("Aperçu", `Affichage de \"${item.title}\"`);
    }
  };

  return (
    <>
      {/* Actions bar previously in DashboardLayout */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <Button
          onClick={() => handleCreateNew("article")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Article
        </Button>
        <Button onClick={() => handleCreateNew("podcast")} variant="outline">
          <Mic className="h-4 w-4 mr-2" />
          Nouveau Podcast
        </Button>
      </div>
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contentStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sections de contenu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Sections de Contenu
            </CardTitle>
            <CardDescription>
              Filtrez par catégorie pour voir le contenu spécifique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {contentSections.map((section) => (
                <Button
                  key={section.id}
                  variant={
                    selectedSection === section.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedSection(section.id)}
                  className="flex items-center gap-2 h-10"
                >
                  <section.icon
                    className={`h-4 w-4 ${selectedSection === section.id ? "text-white" : section.color}`}
                  />
                  {section.name}
                  <Badge variant="secondary" className="ml-1">
                    {section.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recherche et filtres */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par titre, auteur, contenu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="publié">Publié</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="en révision">En révision</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les types</option>
                  <option value="article">Article</option>
                  <option value="podcast">Podcast</option>
                  <option value="indice">Indice</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste du contenu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Contenu ({filteredContent.length})</span>
              {filteredContent.length > 0 && (
                <Badge variant="outline">
                  {
                    filteredContent.filter((item) => item.status === "Publié")
                      .length
                  }{" "}
                  publiés
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredContent.map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all hover:border-blue-300"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <TypeIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                            {item.title}
                          </h3>
                          {item.featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {item.section}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.date).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.views} vues
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          try {
                            const token = getSessionToken();
                            const res = await fetch(`${API_BASE_URL}/admin/contents/${item.id}/premium`, {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                              },
                              body: JSON.stringify({ is_premium: !item.is_premium }),
                            });
                            const json = await res.json();
                              if (json.success) {
                                success("Contenu mis à jour", json.message);
                              item.is_premium = !item.is_premium;
                              // re-render
                              setStatusFilter(statusFilter);
                            }
                          } catch (e) {}
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border transition-all ${
                          item.is_premium
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-amber-50 hover:text-amber-700"
                        }`}
                        title={item.is_premium ? "Rendre Gratuit" : "Marquer comme Premium Exclusif"}
                      >
                        <Crown className={`w-3.5 h-3.5 ${item.is_premium ? "text-amber-600" : "text-gray-400"}`} />
                        {item.is_premium ? "Accès Premium" : "Gratuit"}
                      </button>

                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredContent.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun contenu trouvé
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Essayez de modifier vos filtres ou créez du nouveau contenu.
                  </p>
                  <Button onClick={() => handleCreateNew("article")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer du contenu
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>
              Créez rapidement du nouveau contenu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto p-4 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => handleCreateNew("article")}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Nouvel Article</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Créer un article avec résumé obligatoire
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4 hover:bg-purple-50 hover:border-purple-300"
                onClick={() => handleCreateNew("podcast")}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Nouveau Podcast</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ajouter un podcast avec liens externes
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4 hover:bg-green-50 hover:border-green-300"
                onClick={() => handleCreateNew("indice")}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Nouvel Indice</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Créer un indice économique
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ContentManagement;
