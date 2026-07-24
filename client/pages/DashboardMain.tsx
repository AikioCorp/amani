import { Link } from "react-router-dom";
import { API_BASE_URL as API_BASE } from "../services/apiConfig";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { getContents } from "../services/contentService";
import { getSessionToken } from "../services/authService";
import {
  FileText,
  Mic,
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Calendar,
  Plus,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Globe,
  Target,
  Zap,
  Sparkles,
} from "lucide-react";

export default function DashboardMain() {
  const { user, hasPermission } = useAuth();
  
  // Dashboard state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    articles: { total: 0, thisMonth: 0, growth: 0 },
    podcasts: { total: 0, thisMonth: 0, growth: 0 },
    indices: { total: 0, thisMonth: 0, growth: 0 },
    users: { total: 0, thisMonth: 0, growth: 0 },
    views: { total: 0, thisWeek: 0, growth: 0 },
    reports: { pending: 0, resolved: 0, total: 0 },
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    type: string;
    title: string;
    description?: string | null;
    time: string;
    user?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }>>([]);
  const [personal, setPersonal] = useState({
    myArticles: 0,
    myPodcasts: 0,
    myIndices: 0,
  });

  useEffect(() => {
    let isMounted = true;


    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = getSessionToken();
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

        // Lancer toutes les requêtes en parallèle pour optimiser le temps de chargement
        const fetchCounts = async (type: "article" | "podcast" | "indice") => {
          // Just request 1 item to get the count
          const result = await getContents({ type, limit: 1 });
          return result.count || 0;
        };

        const fetchIndices = async () => {
          try {
            const resp = await fetch(`${API_BASE}/brvm`);
            if (resp.ok) {
              const resData = await resp.json();
              if (resData.success && resData.data) {
                return resData.data.length;
              }
            }
          } catch (e) {}
          return 0;
        };

        const fetchUsersCount = async () => {
          try {
            const resp = await fetch(`${API_BASE}/users?limit=1`, { headers: authHeaders });
            if (resp.ok) {
              const resData = await resp.json();
              if (resData.success && resData.data) {
                // If API returns count, use it. Otherwise rely on data length (which might just be 1 if limit is applied, 
                // but let's assume API returns count or we just use length if it didn't respect limit)
                return resData.count || resData.data.length;
              }
            }
          } catch (err) {
            console.error("Error fetching users count:", err);
          }
          return 0;
        };

        const fetchMyStats = async (type: "article" | "podcast" | "indice") => {
          if (!user?.id) return 0;
          const res = await getContents({ type, authorId: user.id, limit: 1 });
          return res.count || 0;
        };

        const fetchDashboardStats = async () => {
          try {
            const resp = await fetch(`${API_BASE}/contents/dashboard-stats`);
            if (resp.ok) {
              const resJson = await resp.json();
              if (resJson.success && resJson.data) {
                return resJson.data;
              }
            }
          } catch (e) {}
          return null;
        };

        // Exécuter toutes les promesses en même temps !
        const [
          artTotal,
          podTotal,
          indTotal,
          usersTotal,
          recentRes,
          myArt,
          myPod,
          myInd,
          dbStats,
        ] = await Promise.all([
          fetchCounts("article"),
          fetchCounts("podcast"),
          fetchIndices(),
          fetchUsersCount(),
          getContents({ limit: 6 }),
          fetchMyStats("article"),
          fetchMyStats("podcast"),
          fetchMyStats("indice"),
          fetchDashboardStats(),
        ]);

        setStats((prev) => ({
          ...prev,
          articles: { ...prev.articles, total: artTotal },
          podcasts: { ...prev.podcasts, total: podTotal },
          indices: { ...prev.indices, total: indTotal },
          users: { ...prev.users, total: usersTotal },
          views: dbStats?.views || prev.views,
          reports: dbStats?.reports || prev.reports,
        }));

        const recent = recentRes.data || [];
        const mapped = recent.map((r) => {
          const t = r.type as string;
          const icon = t === "article" ? FileText : t === "podcast" ? Mic : t === "indice" ? BarChart3 : Activity;
          const color = t === "article" ? "text-blue-600" : t === "podcast" ? "text-purple-600" : t === "indice" ? "text-green-600" : "text-gray-600";
          const when = new Date(r.created_at);
          const time = when.toLocaleDateString();
          return {
            id: r.id as string,
            slug: r.slug as string,
            type: t,
            title: r.title as string,
            description: r.excerpt || r.summary || null,
            time,
            user: undefined,
            icon,
            color,
          };
        });
        setRecentActivity(mapped);

        setPersonal({
          myArticles: myArt,
          myPodcasts: myPod,
          myIndices: myInd,
        });

      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Erreur lors du chargement du tableau de bord");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [user?.id]);

  const quickActions = [
    {
      label: "Nouvel article",
      path: "/dashboard/articles/new",
      icon: FileText,
      permission: "create_articles",
      color: "bg-blue-500",
    },
    {
      label: "Nouveau podcast",
      path: "/dashboard/podcasts/new",
      icon: Mic,
      permission: "create_podcasts",
      color: "bg-purple-500",
    },
    {
      label: "Nouvel indice",
      path: "/dashboard/indices/new",
      icon: BarChart3,
      permission: "create_indices",
      color: "bg-green-500",
    },
    {
      label: "Nouvel utilisateur",
      path: "/dashboard/users/new",
      icon: Users,
      permission: "create_users",
      color: "bg-amber-500",
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 17) return "Bon après-midi";
    return "Bonsoir";
  };

  const renderStatCard = (
    title: string,
    value: string | number,
    change: number | null,
    icon: React.ComponentType<{ className?: string }>,
    permission?: string,
    linkTo?: string,
  ) => {
    if (permission && !hasPermission(permission)) return null;
    const Icon = icon;

    const Content = () => (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
          <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-4">
          <span className="text-3xl font-black text-slate-900">{typeof value === "number" ? value.toLocaleString() : value}</span>
          {change !== null && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${change >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 'bg-red-50 text-red-700 border-red-200/50'}`}>
              {change >= 0 ? "+" : ""}{change}%
            </span>
          )}
        </div>
      </div>
    );

    return linkTo ? (
      <Link to={linkTo} className="block h-full">
        <Content />
      </Link>
    ) : (
      <Content />
    );
  };

  // Subscriber state
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const isStaff = hasPermission("create_articles") || hasPermission("manage_users") || hasPermission("create_indices");

  useEffect(() => {
    if (!isStaff && user) {
      const token = getSessionToken();
      setLoadingRequests(true);
      fetch(`${API_BASE}/investments/my-requests`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setMyRequests(json.data || []);
        })
        .catch((e) => console.error("Error loading my-requests", e))
        .finally(() => setLoadingRequests(false));
    }
  }, [isStaff, user?.id]);

  // Subscriber View
  if (!isStaff) {
    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-[#373B3A] text-white p-6 md:p-8 rounded-3xl shadow-sm border border-[#9C8464]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#9C8464]/20 border border-[#9C8464]/40 rounded-full text-xs font-bold text-[#9C8464]">
              <Sparkles className="w-3.5 h-3.5" />
              Espace Membre Amani
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Bonjour, {user?.firstName || user?.first_name || "Abonné"} !
            </h1>
            <p className="text-xs md:text-sm text-gray-300 max-w-xl leading-relaxed">
              Bienvenue sur votre portail. Consultez vos options d'investissement engagées, suivez l'avancement de vos demandes et accédez aux outils financiers exclusifs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {user?.is_premium ? (
              <span className="px-4 py-2.5 bg-[#9C8464] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm">
                <Star className="w-4 h-4 fill-white" /> Membre Premium
              </span>
            ) : (
              <Link
                to="/pricing"
                className="px-4 py-2.5 bg-[#9C8464] hover:bg-[#857053] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Zap className="w-4 h-4" /> Passer à Premium
              </Link>
            )}
            <Link
              to="/investissement"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all"
            >
              Voir les opportunités
            </Link>
          </div>
        </div>

        {/* Section 1: Mes Suivis d'Investissement */}
        <div className="bg-white rounded-3xl shadow-xs p-6 md:p-8 border border-gray-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#373B3A] flex items-center gap-2">
                <Target className="w-5 h-5 text-[#9C8464]" /> Mes Options & Demandes d'Investissement
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Suivi en temps réel de vos intentions et dossiers transmis à l'équipe Amani.
              </p>
            </div>
            <Link
              to="/investissement"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#9C8464] hover:text-[#373B3A] uppercase tracking-wider transition-colors"
            >
              + Nouvelle souscription →
            </Link>
          </div>

          {loadingRequests ? (
            <div className="py-8 text-center text-xs text-gray-500">Chargement de vos demandes...</div>
          ) : myRequests.length === 0 ? (
            <div className="bg-[#FDFBF9] border border-[#E5DDD5]/80 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-[#9C8464]/10 rounded-full flex items-center justify-center mx-auto text-[#9C8464]">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#373B3A] text-sm">Vous n'avez pas encore formulé d'option d'investissement.</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Explorez nos opportunités d'investissement dans la santé, l'agrobusiness, la fintech et l'industrie en Afrique de l'Ouest.
              </p>
              <Link
                to="/investissement"
                className="inline-block px-5 py-2.5 bg-[#373B3A] hover:bg-[#9C8464] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs mt-2"
              >
                Découvrir les projets
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-[#373B3A] uppercase text-[10px] tracking-wider font-extrabold bg-[#FDFBF9]">
                    <th className="py-3 px-4">Projet / Opportunité</th>
                    <th className="py-3 px-4">Montant Engagé</th>
                    <th className="py-3 px-4">Profil Investisseur</th>
                    <th className="py-3 px-4">Date de soumission</th>
                    <th className="py-3 px-4">Statut Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#373B3A]">
                        {req.opportunity?.title || req.opportunity_id || "Opportunité Amani"}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#9C8464]">
                        {req.amount}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        {req.investor_type || "Particulier"}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">
                        {new Date(req.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3.5 px-4">
                        {req.status === "PENDING" || req.status === "pending" ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-[10px] uppercase">
                            En cours de revue
                          </span>
                        ) : req.status === "APPROVED" || req.status === "approved" ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px] uppercase">
                            Validé & Transmis
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-full font-bold text-[10px] uppercase">
                            Traitement Amani
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Outils Financiers & Accès Rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/calculateur"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-[#9C8464] hover:shadow-md transition-all space-y-2 group"
          >
            <div className="w-10 h-10 bg-[#9C8464]/10 rounded-xl flex items-center justify-center text-[#9C8464] group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#373B3A] group-hover:text-[#9C8464] transition-colors">
              Calculateur de Rendement
            </h4>
            <p className="text-xs text-gray-500 font-medium">
              Simulez vos placements et gains potentiels.
            </p>
          </Link>

          <Link
            to="/guide-debutant"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-[#9C8464] hover:shadow-md transition-all space-y-2 group"
          >
            <div className="w-10 h-10 bg-[#9C8464]/10 rounded-xl flex items-center justify-center text-[#9C8464] group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#373B3A] group-hover:text-[#9C8464] transition-colors">
              Guide de l'Investisseur
            </h4>
            <p className="text-xs text-gray-500 font-medium">
              Apprenez les bases de la BRVM et du capital-risque.
            </p>
          </Link>

          <Link
            to="/marche"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-[#9C8464] hover:shadow-md transition-all space-y-2 group"
          >
            <div className="w-10 h-10 bg-[#9C8464]/10 rounded-xl flex items-center justify-center text-[#9C8464] group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#373B3A] group-hover:text-[#9C8464] transition-colors">
              Cours BRVM en Direct
            </h4>
            <p className="text-xs text-gray-500 font-medium">
              Suivez l'évolution des indices et actions.
            </p>
          </Link>

          <Link
            to="/podcast"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-[#9C8464] hover:shadow-md transition-all space-y-2 group"
          >
            <div className="w-10 h-10 bg-[#9C8464]/10 rounded-xl flex items-center justify-center text-[#9C8464] group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#373B3A] group-hover:text-[#9C8464] transition-colors">
              Podcasts Financiers
            </h4>
            <p className="text-xs text-gray-500 font-medium">
              Écoutez nos interviews et analyses audio.
            </p>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {loading && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-sm text-gray-600">Chargement des données...</div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 text-sm">{error}</div>
        )}
        {/* Welcome Message & User Roles */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Tableau de bord - {user?.organization}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {`${getGreeting()}, ${user?.firstName}!`}
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Gérez votre contenu et suivez les performances de la plateforme.
            </p>
            {user?.roles && user.roles.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold"
                  >
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100/50 shadow-inner">
              <Activity className="w-10 h-10 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderStatCard(
            "Articles totaux",
            stats.articles.total,
            null, // Removed fake growth metric
            FileText,
            "view_analytics",
            "/dashboard/articles"
          )}
          {renderStatCard(
            "Podcasts",
            stats.podcasts.total,
            null, // Removed fake growth metric
            Mic,
            "view_analytics",
            "/dashboard/podcasts"
          )}
          {renderStatCard(
            "Indices économiques",
            stats.indices.total,
            null, // Removed fake growth metric
            BarChart3,
            "view_indices",
            "/dashboard/indices-management"
          )}
          {renderStatCard(
            "Utilisateurs actifs",
            stats.users.total,
            null, // Removed fake growth metric
            Users,
            "view_user_activity",
            "/dashboard/users"
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-slate-200/80">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Actions rapides
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              if (action.permission && !hasPermission(action.permission)) {
                return null;
              }

              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-slate-200 hover:border-indigo-600 hover:shadow-md transition-all group bg-slate-50/50 hover:bg-white"
                >
                  <div
                    className={`w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:shadow transition-transform`}
                  >
                    <action.icon className="w-5 h-5 text-slate-700 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors text-center">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-slate-200/80">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Activité récente
                </h3>
                <Link
                  to="/dashboard/activity"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors"
                >
                  Voir tout →
                </Link>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <Link
                    key={activity.id}
                    to={`/article/${activity.slug || activity.id}`}
                    className="flex items-start gap-4 p-4 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl transition-all block group"
                  >
                    <div className={`p-2.5 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-105 transition-transform`}>
                      <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {activity.title}
                      </div>
                      <div className="text-sm text-slate-500 truncate mt-0.5">
                        {activity.description}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {activity.user && <span>Par {activity.user}</span>}
                        {activity.user && <span>•</span>}
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Performance Overview */}
            {hasPermission("view_analytics") && (
              <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-200/80">
                <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Vues cette semaine
                    </span>
                    <span className="font-bold text-amani-primary">
                      {(stats.views?.thisWeek || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amani-primary h-2 rounded-full"
                      style={{ width: "68%" }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">
                      +{stats.views?.growth || 0}%
                    </span>
                    <span className="text-gray-500">vs semaine dernière</span>
                  </div>
                </div>
              </div>
            )}

            {/* Moderation Tasks */}
            {hasPermission("moderate_comments") && (
              <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-200/80">
                <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Modération
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium">En attente</span>
                    </div>
                    <span className="font-bold text-amber-600">
                      {stats.reports.pending}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Traités</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {stats.reports.resolved}
                    </span>
                  </div>
                  <Link
                    to="/dashboard/moderation"
                    className="block w-full text-center py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors text-sm"
                  >
                    Aller à la modération
                  </Link>
                </div>
              </div>
            )}

            {/* Personal Stats */}
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-200/80">
              <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Mes statistiques
              </h3>
              <div className="space-y-4">
                {hasPermission("create_articles") && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Articles créés
                    </span>
                    <span className="font-bold text-amani-primary">{personal.myArticles}</span>
                  </div>
                )}
                {hasPermission("create_podcasts") && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Podcasts publiés
                    </span>
                    <span className="font-bold text-amani-primary">{personal.myPodcasts}</span>
                  </div>
                )}
                {hasPermission("create_indices") && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Indices mis à jour
                    </span>
                    <span className="font-bold text-amani-primary">{personal.myIndices}</span>
                  </div>
                )}
                {/* Additional personal stats can be added here */}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
