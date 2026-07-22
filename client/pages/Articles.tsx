import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useArticles } from "../hooks/useArticles";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  TrendingUp,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  Sparkles,
  Bell,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Play,
  Pause,
  Eye,
  MessageSquare,
  Image as ImageIcon,
  UserCheck,
  Tag,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";

export default function Articles() {
  const { user, hasPermission } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);

  // Fetch articles
  const { 
    articles: supabaseArticles = [], 
    loading, 
    error: articlesError,
    deleteArticle,
    updateArticle
  } = useArticles({
    status: filterStatus === "all" ? "all" : filterStatus as any,
    limit: 100,
    offset: 0
  });

  // Check permissions
  if (!user || !hasPermission("create_articles")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center border border-slate-100">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Accès restreint
          </h2>
          <p className="text-slate-500 mb-6 text-sm">
            Vous n'avez pas les permissions nécessaires pour accéder à la gestion des articles.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors text-sm shadow-sm"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  // Map database articles
  const articles = useMemo(() => {
    return supabaseArticles.map(article => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      summary: article.summary || '',
      authorName: article.author ? `${article.author.first_name[0]}. ${article.author.last_name}` : 'Auteur inconnu',
      categoryName: article.category_info?.name || 'Économie',
      categorySlug: article.category_info?.slug || '',
      status: article.status,
      views: article.views || 0,
      commentsCount: (article as any)._count?.comments || 0,
      featured_image: article.featured_image || (article as any).image_url || '',
      publishedAt: article.published_at 
        ? new Date(article.published_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        : 'Non publié',
      publishedAtRaw: article.published_at,
      createdAtRaw: article.created_at
    }));
  }, [supabaseArticles]);

  // Client side filtering for search & category
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === "all" || article.categorySlug === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, filterCategory]);

  // Dynamic Statistics
  const stats = useMemo(() => {
    const total = articles.length;
    const drafts = articles.filter(a => a.status === 'draft').length;
    const review = articles.filter(a => a.status !== 'published').length;
    const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
    
    const formattedViews = totalViews >= 1000000 
      ? `${(totalViews / 1000000).toFixed(1)}M` 
      : totalViews >= 1000 
        ? `${(totalViews / 1000).toFixed(1)}k` 
        : totalViews.toString();

    return {
      total,
      drafts,
      review,
      formattedViews
    };
  }, [articles]);

  // Dynamic Editorial Velocity (Last 7 Days)
  const editorialVelocity = useMemo(() => {
    const days = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    articles.forEach(art => {
      const date = art.publishedAtRaw ? new Date(art.publishedAtRaw) : new Date(art.createdAtRaw);
      if (date && !isNaN(date.getTime()) && date >= sevenDaysAgo) {
        const dayIndex = date.getDay();
        days[dayIndex]++;
      }
    });

    const reordered = [
      { label: "LUN", count: days[1] },
      { label: "MAR", count: days[2] },
      { label: "MER", count: days[3] },
      { label: "JEU", count: days[4] },
      { label: "VEN", count: days[5] },
      { label: "SAM", count: days[6] },
      { label: "DIM", count: days[0] }
    ];

    const maxCount = Math.max(...reordered.map(d => d.count), 1);
    return reordered.map(d => ({
      ...d,
      height: `${Math.max((d.count / maxCount) * 100, 10)}%`
    }));
  }, [articles]);

  // Dynamic Notifications from Database Contents
  const notifications = useMemo(() => {
    const list: Array<{ id: string; message: string; date: string; type: 'info' | 'success' | 'draft'; title: string; meta?: string }> = [];
    
    const sorted = [...articles].sort((a, b) => {
      const aTime = a.createdAtRaw ? new Date(a.createdAtRaw).getTime() : 0;
      const bTime = b.createdAtRaw ? new Date(b.createdAtRaw).getTime() : 0;
      return bTime - aTime;
    });

    sorted.slice(0, 5).forEach((art) => {
      if (art.status === 'draft') {
        list.push({
          id: `draft-${art.id}`,
          title: `Brouillon créé`,
          message: `"${art.title}" a été préparé et est en attente de révision.`,
          date: art.publishedAt !== 'Non publié' ? art.publishedAt : 'En cours',
          type: 'draft',
          meta: art.categoryName
        });
      } else {
        list.push({
          id: `views-${art.id}`,
          title: `Performance de publication`,
          message: `L'article "${art.title}" cumule déjà ${art.views} lectures.`,
          date: art.publishedAt,
          type: 'success',
          meta: art.categoryName
        });
      }
    });

    if (list.length === 0) {
      list.push({
        id: 'welcome',
        title: 'Système Éditorial',
        message: 'Bienvenue dans l\'espace de rédaction. Tous les systèmes sont opérationnels.',
        date: 'Aujourd\'hui',
        type: 'info'
      });
    }

    return list.slice(0, 3);
  }, [articles]);

  // Extract unique categories for filter
  const categoriesList = useMemo(() => {
    const map = new Map();
    articles.forEach(a => {
      if (a.categorySlug) {
        map.set(a.categorySlug, a.categoryName);
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ id: slug, label: name }));
  }, [articles]);

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;
    try {
      setActionLoading(articleToDelete);
      await deleteArticle(articleToDelete);
      success("Suppression", "Article supprimé avec succès");
    } catch (err) {
      error("Erreur", "Impossible de supprimer l'article");
    } finally {
      setActionLoading(null);
      setArticleToDelete(null);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: any) => {
    try {
      setActionLoading(id);
      await updateArticle(id, { status: newStatus });
      success("Mise à jour", `Statut mis à jour : ${newStatus === 'published' ? 'Publié' : newStatus === 'archived' ? 'En Pause' : 'Brouillon'}`);
    } catch (err) {
      error("Erreur", "Impossible de mettre à jour le statut");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedArticles(filteredArticles.map(a => a.id));
    } else {
      setSelectedArticles([]);
    }
  };

  const handleSelectRow = (id: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    setSelectedArticles(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Rédaction & Contenus
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Gestion des articles
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gérez, éditez et suivez l'impact de vos publications en temps réel.
          </p>
        </div>

        <button 
          onClick={() => navigate('/dashboard/articles/new')}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 py-3.5 rounded-2xl shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Rédiger un nouvel article
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Articles */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Articles</span>
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-black text-slate-900">{stats.total === 0 ? "0" : String(stats.total).padStart(2, '0')}</span>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200/50">
              Actifs
            </span>
          </div>
        </div>

        {/* Brouillons */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brouillons</span>
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Edit2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-black text-slate-900">{stats.drafts === 0 ? "0" : String(stats.drafts).padStart(2, '0')}</span>
            <span className="text-xs font-medium text-slate-400">
              En cours de rédaction
            </span>
          </div>
        </div>

        {/* En Révision */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">En Révision</span>
            <div className="w-9 h-9 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-black text-slate-900">{stats.review === 0 ? "0" : String(stats.review).padStart(2, '0')}</span>
            <span className="text-xs font-bold bg-orange-50 text-orange-800 px-2.5 py-1 rounded-full border border-orange-200/50">
              Priorité haute
            </span>
          </div>
        </div>

        {/* Vues Totales */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vues Cumulées</span>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-black text-slate-900">{stats.formattedViews}</span>
            <span className="text-xs font-medium text-slate-400">Lectures</span>
          </div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, résumé ou auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Status Select */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-9 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
            >
              <option value="all">Tous les états</option>
              <option value="published">Publiés</option>
              <option value="draft">Brouillons</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Category Select */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-9 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
            >
              <option value="all">Toutes les catégories</option>
              {categoriesList.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Quick Actions (Visible only when items are selected) */}
        {selectedArticles.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
            <span className="text-xs font-bold text-indigo-600 mr-2 bg-indigo-50 px-2 py-1 rounded-md">
              {selectedArticles.length} sélectionné{selectedArticles.length > 1 ? 's' : ''}
            </span>
            <button 
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer
            </button>
            <button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-3 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              Publier
            </button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {articlesError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-xs font-medium text-red-800">Une erreur s'est produite lors de la synchronisation de certains articles.</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                  />
                </th>
                <th className="py-4 px-4">Article</th>
                <th className="py-4 px-4">Auteur</th>
                <th className="py-4 px-4">Catégorie</th>
                <th className="py-4 px-4">Statut</th>
                <th className="py-4 px-4">Publication</th>
                <th className="py-4 px-4 text-right">Audience</th>
                <th className="py-4 px-4 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredArticles.map((article) => {
                const formattedViews = article.views >= 1000 
                  ? `${(article.views / 1000).toFixed(1)}k` 
                  : article.views.toString();

                return (
                  <tr 
                    key={article.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/dashboard/articles/edit/${article.id}`)}
                  >
                    <td className="py-4 px-4 text-center" onClick={(e) => handleSelectRow(article.id, e)}>
                      <input 
                        type="checkbox" 
                        checked={selectedArticles.includes(article.id)}
                        onChange={(e) => handleSelectRow(article.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                      />
                    </td>

                    {/* Article Thumbnail + Title */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 max-w-md">
                        {article.featured_image ? (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-14 h-14 object-cover object-top rounded-xl border border-slate-200 shadow-xs flex-shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug mb-1 line-clamp-2 text-sm">
                            {article.title}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {article.summary}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="py-4 px-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                          {article.authorName.charAt(0)}
                        </div>
                        <span>{article.authorName}</span>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg">
                        <Tag className="w-3 h-3 text-indigo-500" />
                        {article.categoryName}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {article.status === 'published' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 border border-emerald-200/60 text-emerald-700 px-3 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Publié
                        </span>
                      )}
                      {article.status === 'draft' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 border border-amber-200/60 text-amber-700 px-3 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Brouillon
                        </span>
                      )}
                      {article.status === 'archived' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          En Pause
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {article.publishedAt}
                      </div>
                    </td>

                    {/* Engagement */}
                    <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-800">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {formattedViews}
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-xs font-semibold text-slate-500">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                          {article.commentsCount}
                        </div>
                      </div>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-4 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {actionLoading === article.id ? (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 z-50">
                            <DropdownMenuItem 
                              onClick={() => navigate(`/dashboard/articles/edit/${article.id}`)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Modifier l'article</span>
                            </DropdownMenuItem>

                            {article.status !== 'published' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(article.id, 'published')}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                              >
                                <Play className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Publier l'article</span>
                              </DropdownMenuItem>
                            )}

                            {article.status !== 'draft' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(article.id, 'draft')}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                              >
                                <Pause className="w-3.5 h-3.5 text-amber-600" />
                                <span>Mettre en brouillon</span>
                              </DropdownMenuItem>
                            )}

                            {article.status !== 'archived' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(article.id, 'archived')}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                              >
                                <Pause className="w-3.5 h-3.5 text-slate-400" />
                                <span>Mettre en pause</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="my-1 border-t border-slate-100" />

                            <DropdownMenuItem 
                              onClick={() => {
                                setArticleToDelete(article.id);
                                setDeleteConfirmOpen(true);
                              }}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Supprimer définitivement</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredArticles.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-600 text-sm">Aucun article ne correspond à vos critères.</p>
                    <p className="text-xs text-slate-400 mt-1">Essayez de réinitialiser la recherche ou les filtres de catégorie.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 flex items-center justify-between border-t border-slate-100 text-xs font-semibold text-slate-500 bg-slate-50/50">
          <div>
            Affichage de <span className="text-slate-900 font-bold">{filteredArticles.length}</span> sur <span className="text-slate-900 font-bold">{articles.length}</span> articles
          </div>
          <div className="flex items-center gap-1.5">
            <button className="p-2 border border-slate-200 bg-white rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-xs">
              1
            </button>
            <button className="p-2 border border-slate-200 bg-white rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Editorial Velocity & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editorial Velocity Card */}
        <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Vélocité Éditoriale</h3>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                7 Derniers Jours
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-6">
              Volume des publications hebdomadaires par jour.
            </p>

            <div className="flex items-end justify-between h-36 px-2 mt-4">
              {editorialVelocity.map((day, idx) => {
                const isMax = day.count > 0 && day.count === Math.max(...editorialVelocity.map(d => d.count));
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="relative w-full flex justify-center">
                      <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                        {day.count} art.
                      </span>
                      <div 
                        className={`w-6 rounded-t-lg transition-all duration-300 ${
                          isMax 
                            ? 'bg-indigo-600' 
                            : day.count > 0 
                              ? 'bg-slate-400' 
                              : 'bg-slate-100'
                        }`} 
                        style={{ height: day.height }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${isMax ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notifications & Activity */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Activité & Notifications</h3>
            </div>
            <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer">
              Tout marquer comme lu
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div key={notif.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5 group">
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                  notif.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : notif.type === 'draft' 
                      ? 'bg-amber-50 text-amber-600' 
                      : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {notif.type === 'success' ? (
                    <Sparkles className="w-4 h-4" />
                  ) : notif.type === 'draft' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {notif.title}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                      {notif.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.meta && (
                    <span className="inline-block mt-1.5 text-[9px] font-bold bg-slate-50 border border-slate-200/60 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {notif.meta}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sleek Custom Alert Dialog for Deletion Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md p-6 z-[100]">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement cet article ? Cette action est irréversible et effacera l'article de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
