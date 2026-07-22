import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import DashboardLayout from "../components/DashboardLayout";
import {
  Globe,
  Plus,
  Search,
  Filter,
  Settings,
  Power,
  PowerOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Key,
  Database,
  Mail,
  Webhook,
  Shield,
  Zap,
  BarChart3,
  FileText,
  Users,
  MessageSquare,
  Bell,
  ExternalLink,
  RefreshCw,
  Trash2,
  Edit,
} from "lucide-react";

export default function Integrations() {
  const { user, hasPermission } = useAuth();
  const { success, error, warning } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Check permissions after all hooks
  if (!user || !hasPermission("manage_integrations")) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center border border-white/50">
            <h2 className="text-2xl font-bold text-amani-primary mb-4">
              Accès refusé
            </h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas les permissions nécessaires pour gérer les
              intégrations.
            </p>
            <Link
              to="/dashboard"
              className="bg-amani-primary text-white px-6 py-2 rounded-lg hover:bg-amani-primary/90 transition-colors"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const integrations = [
    {
      id: "1",
      name: "BCEAO API",
      description:
        "Intégration avec l'API de la Banque Centrale pour les données monétaires",
      category: "financial",
      status: "active",
      provider: "BCEAO",
      version: "v2.1",
      lastSync: "2024-01-15 14:30",
      endpoint: "https://api.bceao.int/v2",
      authentication: "API Key",
      dataTypes: ["Taux de change", "Statistiques monétaires", "Indices"],
      icon: Database,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "2",
      name: "UEMOA Data Hub",
      description:
        "Accès aux données économiques de l'Union Économique et Monétaire Ouest Africaine",
      category: "economic",
      status: "active",
      provider: "UEMOA",
      version: "v1.3",
      lastSync: "2024-01-15 12:15",
      endpoint: "https://data.uemoa.int/api",
      authentication: "OAuth 2.0",
      dataTypes: ["PIB", "Commerce", "Investissements"],
      icon: BarChart3,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "3",
      name: "Email Service",
      description: "Service d'envoi d'emails pour notifications et newsletters",
      category: "communication",
      status: "active",
      provider: "SendGrid",
      version: "v3.0",
      lastSync: "2024-01-15 16:45",
      endpoint: "https://api.sendgrid.com/v3",
      authentication: "API Key",
      dataTypes: ["Emails", "Analytics", "Templates"],
      icon: Mail,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "4",
      name: "Slack Notifications",
      description: "Notifications vers les channels Slack pour alertes système",
      category: "communication",
      status: "inactive",
      provider: "Slack",
      version: "v1.7",
      lastSync: "2024-01-10 09:20",
      endpoint: "https://hooks.slack.com/services",
      authentication: "Webhook",
      dataTypes: ["Notifications", "Alerts"],
      icon: MessageSquare,
      color: "bg-amber-100 text-amber-600",
    },
    {
      id: "5",
      name: "Google Analytics",
      description: "Suivi des performances et analytics du site web",
      category: "analytics",
      status: "pending",
      provider: "Google",
      version: "GA4",
      lastSync: "N/A",
      endpoint: "https://analytics.google.com/analytics",
      authentication: "OAuth 2.0",
      dataTypes: ["Visites", "Comportement", "Conversions"],
      icon: BarChart3,
      color: "bg-red-100 text-red-600",
    },
    {
      id: "6",
      name: "World Bank API",
      description: "Données économiques mondiales de la Banque Mondiale",
      category: "economic",
      status: "active",
      provider: "World Bank",
      version: "v2",
      lastSync: "2024-01-14 20:30",
      endpoint: "https://api.worldbank.org/v2",
      authentication: "Public",
      dataTypes: ["Indicateurs", "Pays", "Projets"],
      icon: Globe,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      id: "7",
      name: "Security Scanner",
      description: "Service de scan de sécurité et détection de vulnérabilités",
      category: "security",
      status: "active",
      provider: "Snyk",
      version: "v1.0",
      lastSync: "2024-01-15 06:00",
      endpoint: "https://api.snyk.io/v1",
      authentication: "API Key",
      dataTypes: ["Vulnérabilités", "Dépendances"],
      icon: Shield,
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: "8",
      name: "Webhook Processor",
      description:
        "Traitement des webhooks entrants pour synchronisation données",
      category: "automation",
      status: "pending",
      provider: "Custom",
      version: "v1.0",
      lastSync: "N/A",
      endpoint: "https://webhooks.amani.demo/process",
      authentication: "API Key",
      dataTypes: ["Events", "Callbacks"],
      icon: Webhook,
      color: "bg-cyan-100 text-cyan-600",
    },
  ];

  const categories = [
    { id: "all", label: "Toutes catégories" },
    { id: "financial", label: "Financier" },
    { id: "economic", label: "Économique" },
    { id: "communication", label: "Communication" },
    { id: "analytics", label: "Analytics" },
    { id: "security", label: "Sécurité" },
    { id: "automation", label: "Automation" },
  ];

  const stats = [
    {
      label: "Intégrations actives",
      value: integrations
        .filter((int) => int.status === "active")
        .length.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "En configuration",
      value: integrations
        .filter((int) => int.status === "pending")
        .length.toString(),
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Inactives",
      value: integrations
        .filter((int) => int.status === "inactive")
        .length.toString(),
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      label: "Providers",
      value: new Set(integrations.map((int) => int.provider)).size.toString(),
      icon: Globe,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Power className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-600" />;
      case "inactive":
        return <PowerOff className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      integration.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || integration.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || integration.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleToggleIntegration = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    success(
      "Intégration mise à jour",
      `Intégration ${newStatus === "active" ? "activée" : "désactivée"}`,
    );
  };

  const handleConfigureIntegration = (id: string) => {
    success("Configuration", `Configuration de l'intégration ${id}`);
  };

  const handleSyncIntegration = (id: string) => {
    warning(
      "Synchronisation",
      `Synchronisation de l'intégration ${id} en cours`,
    );
  };

  const handleDeleteIntegration = (id: string) => {
    error("Suppression", `Intégration ${id} supprimée`);
  };

  const handleAddIntegration = () => {
    success(
      "Nouvelle intégration",
      "Assistant de création d'intégration lancé",
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des intégrations</h1>
          <p className="text-slate-500 mt-1">Configurez et gérez les intégrations avec les services externes</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher une intégration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="pending">En configuration</option>
              <option value="inactive">Inactives</option>
            </select>
          </div>
          <button
            onClick={handleAddIntegration}
            className="flex items-center gap-2 px-4 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle intégration
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-white/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-amani-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Integrations List */}
        <div className="bg-white rounded-2xl shadow-lg border border-white/50">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-amani-primary">
                Intégrations ({filteredIntegrations.length})
              </h2>
            </div>
          </div>

          <div className="p-6">
            {filteredIntegrations.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune intégration trouvée
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ||
                  filterCategory !== "all" ||
                  filterStatus !== "all"
                    ? "Aucune intégration ne correspond à vos critères."
                    : "Commencez par ajouter votre première intégration."}
                </p>
                <button
                  onClick={handleAddIntegration}
                  className="flex items-center gap-2 px-4 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle intégration
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${integration.color}`}
                          >
                            <integration.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              {integration.name}
                              <span className="text-sm text-gray-500">
                                {integration.version}
                              </span>
                            </h3>
                            <p className="text-sm text-gray-600">
                              {integration.provider} •{" "}
                              {integration.authentication}
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4">
                          {integration.description}
                        </p>

                        <div className="space-y-3">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-gray-600">
                              <Globe className="w-4 h-4" />
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {integration.endpoint}
                              </code>
                            </span>
                            <a
                              href={integration.endpoint}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amani-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Voir
                            </a>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {integration.dataTypes.map((type, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                              >
                                {type}
                              </span>
                            ))}
                          </div>

                          <div className="text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Dernière sync:{" "}
                              {integration.lastSync === "N/A"
                                ? "Jamais"
                                : new Date(integration.lastSync).toLocaleString(
                                    "fr-FR",
                                  )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-6">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(integration.status)}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              integration.status,
                            )}`}
                          >
                            {integration.status === "active" && "Active"}
                            {integration.status === "pending" &&
                              "Configuration"}
                            {integration.status === "inactive" && "Inactive"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleToggleIntegration(
                                integration.id,
                                integration.status,
                              )
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              integration.status === "active"
                                ? "text-red-600 hover:bg-red-100"
                                : "text-green-600 hover:bg-green-100"
                            }`}
                            title={
                              integration.status === "active"
                                ? "Désactiver"
                                : "Activer"
                            }
                          >
                            {integration.status === "active" ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleSyncIntegration(integration.id)
                            }
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Synchroniser"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleConfigureIntegration(integration.id)
                            }
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Configurer"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteIntegration(integration.id)
                            }
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
