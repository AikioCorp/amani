import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleDisplayName, getRoleColor } from "../lib/demoAccounts";
import {
  BarChart3,
  Users,
  FileText,
  Settings,
  Eye,
  Edit,
  Plus,
  TrendingUp,
  Calendar,
  Bell,
  Download,
  MessageSquare,
  Shield,
  Database,
  Mic,
} from "lucide-react";

export default function Dashboard() {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-amani-primary mb-4">Accès refusé</h2>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour accéder au tableau de bord.
          </p>
          <Link
            to="/login"
            className="bg-amani-primary text-white px-6 py-2 rounded-lg hover:bg-amani-primary/90 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const quickStats = [
    {
      title: "Articles vus",
      value: "2,847",
      change: "+12%",
      icon: Eye,
      color: "blue",
    },
    {
      title: "Rapports générés",
      value: "23",
      change: "+8%",
      icon: FileText,
      color: "green",
    },
    {
      title: "Alertes actives",
      value: "5",
      change: "0%",
      icon: Bell,
      color: "orange",
    },
    {
      title: "Favoris",
      value: "67",
      change: "+3%",
      icon: TrendingUp,
      color: "purple",
    },
  ];

  const recentActivities = [
    {
      action: "Article créé",
      title: "Mali : Nouveau projet d'infrastructure",
      time: "Il y a 2h",
      category: "Économie",
    },
    {
      action: "Indice mis à jour",
      title: "BRVM Composite",
      time: "Il y a 4h",
      category: "Marché",
    },
    {
      action: "Podcast publié",
      title: "L'avenir de l'économie sahélienne",
      time: "Il y a 1j",
      category: "Podcast",
    },
    {
      action: "Rapport exporté",
      title: "Analyse mensuelle des indices",
      time: "Il y a 2j",
      category: "Rapport",
    },
  ];

  const quickActions = [
    hasPermission("create_articles") && {
      title: "Créer un article",
      icon: Plus,
      href: "/dashboard/articles/new",
      color: "bg-blue-500",
    },
    hasPermission("create_indices") && {
      title: "Ajouter un indice",
      icon: Database,
      href: "/dashboard/indices/new",
      color: "bg-green-500",
    },
    hasPermission("create_podcasts") && {
      title: "Nouveau podcast",
      icon: Mic,
      href: "/dashboard/podcasts/new",
      color: "bg-purple-500",
    },
    hasPermission("view_analytics") && {
      title: "Voir les analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
      color: "bg-orange-500",
    },
    hasPermission("manage_users") && {
      title: "Gérer les utilisateurs",
      icon: Users,
      href: "/dashboard/users",
      color: "bg-red-500",
    },
    hasPermission("moderate_comments") && {
      title: "Modérer le contenu",
      icon: Shield,
      href: "/dashboard/moderation",
      color: "bg-yellow-500",
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#E5DDD2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-amani-primary mb-2">
                Tableau de bord
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  Bienvenue, {user.firstName} {user.lastName}
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}
                >
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Dernière connexion</div>
                <div className="font-medium text-amani-primary">
                  {user.lastLogin}
                </div>
              </div>
              <Link
                to="/dashboard/settings"
                className="p-2 text-gray-600 hover:text-amani-primary"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-white/50"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                <div className="text-sm text-green-600">{stat.change}</div>
              </div>
              <div className="text-2xl font-bold text-amani-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-white/50">
            <h2 className="text-xl font-semibold text-amani-primary mb-6">
              Actions rapides
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div
                    className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-center text-gray-700 group-hover:text-amani-primary">
                    {action.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-amani-primary">
                Activités récentes
              </h2>
              <Link
                to="/dashboard/activity"
                className="text-amani-primary hover:underline text-sm"
              >
                Voir tout
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-amani-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-amani-primary">
                        {activity.action}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                    <div className="text-gray-700">{activity.title}</div>
                    <span className="text-xs bg-amani-secondary/50 text-amani-primary px-2 py-1 rounded mt-2 inline-block">
                      {activity.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Info & Preferences */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
            <h2 className="text-xl font-semibold text-amani-primary mb-6">
              Mon profil
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Organisation
                </label>
                <div className="text-amani-primary">{user.organization}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Secteurs d'intérêt
                </label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.preferences.sectors.map((sector, i) => (
                    <span
                      key={i}
                      className="text-xs bg-amani-secondary/50 text-amani-primary px-2 py-1 rounded"
                    >
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Pays suivis
                </label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.preferences.countries.map((country, i) => (
                    <span
                      key={i}
                      className="text-xs bg-amani-secondary/50 text-amani-primary px-2 py-1 rounded"
                    >
                      {country}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Newsletter</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${user.preferences.newsletter ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {user.preferences.newsletter ? "Activée" : "Désactivée"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Alertes</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${user.preferences.alerts ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {user.preferences.alerts ? "Activées" : "Désactivées"}
                  </span>
                </div>
              </div>
              <Link
                to="/dashboard/profile"
                className="w-full bg-amani-primary text-white py-2 px-4 rounded-lg hover:bg-amani-primary/90 transition-colors text-center block mt-4"
              >
                Modifier le profil
              </Link>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-white/50">
          <h2 className="text-xl font-semibold text-amani-primary mb-6">
            Permissions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {user.permissions.map((permission, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-800">
                  {permission.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
