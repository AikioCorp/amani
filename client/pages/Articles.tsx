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
  Calendar
} from "lucide-react";

export default function Articles() {
  const { user, hasPermission } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // Fetch articles
  const { 
    articles: supabaseArticles = [], 
    loading, 
    error: articlesError,
    deleteArticle
  } = useArticles({
    status: filterStatus === "all" ? "all" : filterStatus as any,
    limit: 100,
    offset: 0
  });

  // Check permissions
  if (!user || !hasPermission("create_articles")) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-amani-primary mb-4">
            Accès refusé
          </h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour voir les articles.
          </p>
          <Link
            to="/dashboard"
            className="bg-amani-primary text-white px-6 py-2 rounded-lg hover:bg-amani-primary/90 transition-colors"
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
      categoryName: article.category_info?.name || 'Non catégorisé',
      categorySlug: article.category_info?.slug || '',
      status: article.status,
      views: article.views || 0,
      commentsCount: article._count?.comments || 0,
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
    
    // We count articles with draft status as review candidate if needed or dynamic count
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

  // Dynamic Editorial Velocity
  const editorialVelocity = useMemo(() => {
    const days = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    articles.forEach(art => {
      const date = art.publishedAtRaw ? new Date(art.publishedAtRaw) : new Date(art.createdAtRaw);
      if (date && !isNaN(date.getTime())) {
        const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday...
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
      height: `${Math.max((d.count / maxCount) * 100, 8)}%` // ensure at least 8% height for visual aesthetics
    }));
  }, [articles]);

  // Dynamic Notifications from Database Contents
  const notifications = useMemo(() => {
    const list: Array<{ id: string; message: string; date: string; type: 'info' | 'success' | 'draft'; title: string; meta?: string }> = [];
    
    // Sort articles by created_at desc
    const sorted = [...articles].sort((a, b) => {
      const aTime = a.createdAtRaw ? new Date(a.createdAtRaw).getTime() : 0;
      const bTime = b.createdAtRaw ? new Date(b.createdAtRaw).getTime() : 0;
      return bTime - aTime;
    });

    sorted.slice(0, 5).forEach((art) => {
      if (art.status === 'draft') {
        list.push({
          id: `draft-${art.id}`,
          title: `Nouvelle ébauche`,
          message: `"${art.title}" a été créé par ${art.authorName} et est en attente de validation.`,
          date: art.publishedAt !== 'Non publié' ? art.publishedAt : 'Brouillon',
          type: 'draft',
          meta: art.categoryName
        });
      } else {
        list.push({
          id: `views-${art.id}`,
          title: `Performance de publication`,
          message: `L'article "${art.title}" est en ligne et comptabilise déjà ${art.views} vues.`,
          date: art.publishedAt,
          type: 'success',
          meta: art.categoryName
        });
      }
    });

    if (list.length === 0) {
      list.push({
        id: 'welcome',
        title: 'Système',
        message: 'Bienvenue dans le tableau de bord de gestion des articles. Prêt à publier ?',
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      try {
        await deleteArticle(id);
        success("Suppression", "Article supprimé avec succès");
      } catch (err) {
        error("Erreur", "Impossible de supprimer l'article");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin h-10 w-10 text-[#9C8464]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des articles</h1>
        <button 
          onClick={() => navigate('/dashboard/articles/new')}
          className="flex items-center gap-2 bg-gray-900 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau article
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Articles */}
        <div className="bg-white border border-[#EAEAEA] rounded p-6 shadow-sm flex flex-col justify-between h-32">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Total Articles
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-gray-900">{String(stats.total).padStart(2, '0')}</span>
            <span className="text-[10px] font-bold bg-[#EAF7F0] text-[#2E7D32] px-2 py-1 rounded-full">
              +2 cette semaine
            </span>
          </div>
        </div>

        {/* Brouillons */}
        <div className="bg-white border border-[#EAEAEA] rounded p-6 shadow-sm flex flex-col justify-between h-32">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Brouillons
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-gray-900">{String(stats.drafts).padStart(2, '0')}</span>
            <span className="text-[10px] font-bold text-gray-400">
              En attente
            </span>
          </div>
        </div>

        {/* En Révision */}
        <div className="bg-white border border-[#EAEAEA] rounded p-6 shadow-sm flex flex-col justify-between h-32">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            En Révision
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-gray-900">{String(stats.review).padStart(2, '0')}</span>
            <span className="text-[10px] font-bold bg-[#FFF8E1] text-[#F57F17] px-2 py-1 rounded-full">
              Priorité haute
            </span>
          </div>
        </div>

        {/* Vues Totales */}
        <div className="bg-white border border-[#EAEAEA] rounded p-6 shadow-sm flex flex-col justify-between h-32">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Vues Totales
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-gray-900">{stats.formattedViews}</span>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#EAEAEA] rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F9F9F9] border border-[#EAEAEA] rounded pl-9 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#9C8464] transition-colors"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-white border border-[#EAEAEA] rounded px-4 py-2 pr-8 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#9C8464] cursor-pointer"
            >
              <option value="all">Tous les états</option>
              <option value="published">Publiés</option>
              <option value="draft">Brouillons</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none bg-white border border-[#EAEAEA] rounded px-4 py-2 pr-8 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#9C8464] cursor-pointer"
            >
              <option value="all">Toutes les catégories</option>
              {categoriesList.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="bg-white border border-[#EAEAEA] rounded px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <span>Date</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button className="bg-white border border-[#EAEAEA] rounded px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <span>Plus de filtres</span>
          </button>
        </div>
      </div>

      {/* Error indicator */}
      {articlesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Erreur lors du chargement de certains articles</span>
        </div>
      )}

      {/* Main Tabular Content */}
      <div className="bg-white border border-[#EAEAEA] rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAEAEA] bg-[#F9F9F9] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300 text-[#9C8464] focus:ring-[#9C8464]" />
                </th>
                <th className="p-4">Titre</th>
                <th className="p-4">Auteur</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => {
                const formattedViews = article.views >= 1000 
                  ? `${(article.views / 1000).toFixed(1)}k` 
                  : article.views.toString();

                return (
                  <tr 
                    key={article.id} 
                    className="border-b border-[#EAEAEA] hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/dashboard/articles/edit/${article.id}`)}
                  >
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-[#9C8464] focus:ring-[#9C8464]" />
                    </td>
                    <td className="p-4 max-w-sm">
                      <div className="font-bold text-gray-900 group-hover:text-[#9C8464] transition-colors leading-tight mb-1">
                        {article.title}
                      </div>
                      <div className="text-[11px] text-gray-400 line-clamp-1">
                        {article.summary}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-700 whitespace-nowrap">
                      {article.authorName}
                    </td>
                    <td className="p-4 text-sm font-bold text-[#9C8464] whitespace-nowrap">
                      {article.categoryName}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {article.status === 'published' ? (
                        <span className="text-[10px] font-bold bg-[#EAF7F0] text-[#2E7D32] px-3 py-1.5 rounded uppercase tracking-wider">
                          Publié
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-3 py-1.5 rounded uppercase tracking-wider">
                          Brouillon
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      {article.publishedAt}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap flex items-center justify-end gap-3">
                      <div>
                        <div className="font-extrabold text-gray-900">{formattedViews}</div>
                        <div className="text-[10px] text-gray-400">
                          {article.commentsCount} commentaires
                        </div>
                      </div>
                      <button 
                        onClick={(e) => handleDelete(article.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded transition-opacity"
                        title="Supprimer l'article"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredArticles.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                    Aucun article ne correspond à vos critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 flex items-center justify-between border-t border-[#EAEAEA] text-xs font-semibold text-gray-500 bg-[#F9F9F9]">
          <div>
            Affichage de 1 à {filteredArticles.length} sur {filteredArticles.length} articles
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 border border-[#EAEAEA] bg-white rounded text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 bg-gray-900 text-white rounded flex items-center justify-center font-bold">
              1
            </button>
            <button className="p-1.5 border border-[#EAEAEA] bg-white rounded text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editorial Velocity Card */}
        <div className="lg:col-span-1 bg-white border border-[#EAEAEA] rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#9C8464]" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Vélocité Éditoriale</h3>
              </div>
              <span className="text-[10px] font-bold bg-[#F9F9F9] border border-[#EAEAEA] text-gray-600 px-2 py-0.5 rounded">
                7 Derniers Jours
              </span>
            </div>
            
            <p className="text-xs text-gray-500 mb-6">
              Volume hebdomadaire des publications réparties par jour.
            </p>

            {/* vertical chart (Dynamic) */}
            <div className="flex items-end justify-between h-40 px-2 mt-4">
              {editorialVelocity.map((day, idx) => {
                const isMax = day.count > 0 && day.count === Math.max(...editorialVelocity.map(d => d.count));
                return (
                  <div key={idx} className="flex flex-col items-center gap-2.5 flex-1 group">
                    <div className="relative w-full flex justify-center">
                      {/* Tooltip on hover */}
                      <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        {day.count} art.
                      </span>
                      <div 
                        className={`w-6 rounded-t-md transition-all duration-300 ${
                          isMax 
                            ? 'bg-gradient-to-t from-[#8E7554] to-[#9C8464]' 
                            : day.count > 0 
                              ? 'bg-gradient-to-t from-gray-300 to-gray-400' 
                              : 'bg-gray-100'
                        }`} 
                        style={{ height: day.height }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${isMax ? 'text-[#9C8464]' : 'text-gray-400'}`}>
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dernières Notifications Card */}
        <div className="lg:col-span-2 bg-white border border-[#EAEAEA] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#9C8464]" />
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Activité & Notifications</h3>
            </div>
            <span className="text-[10px] font-bold text-[#9C8464] hover:underline cursor-pointer">
              Tout marquer comme lu
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div key={notif.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 group transition-colors">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  notif.type === 'success' 
                    ? 'bg-[#EAF7F0] text-[#2E7D32]' 
                    : notif.type === 'draft' 
                      ? 'bg-[#FFF8E1] text-[#F57F17]' 
                      : 'bg-blue-50 text-blue-600'
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
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {notif.title}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
                      {notif.date}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.meta && (
                    <span className="inline-block mt-1.5 text-[9px] font-bold bg-gray-50 border border-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {notif.meta}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
