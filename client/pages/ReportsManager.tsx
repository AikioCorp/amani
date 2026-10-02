import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import DashboardLayout from "../components/DashboardLayout";
import {
  FileSpreadsheet,
  Flag,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreVertical,
  BarChart3,
  Globe,
  TrendingUp,
  FileText,
  Users,
  Shield,
  Target,
  Activity,
} from "lucide-react";

export default function ReportsManager() {
  const { user, hasPermission } = useAuth();
  const { success, error, warning } = useToast();
  const [activeTab, setActiveTab] = useState(
    hasPermission("create_economic_reports") ? "economic" : "moderation",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  // Check permissions
  const canViewEconomicReports =
    hasPermission("create_economic_reports") || hasPermission("view_analytics");
  const canViewModerationReports =
    hasPermission("manage_user_reports") || hasPermission("moderate_comments");

  if (!user || (!canViewEconomicReports && !canViewModerationReports)) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto text-center border border-white/50">
          <h2 className="text-2xl font-bold text-amani-primary mb-4">
            Accès refusé
          </h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder aux
            rapports.
          </p>
        </div>
      </div>
    );
  }

  // Mock data - Economic Reports
  const economicReports = [
    {
      id: "econ-1",
      title: "Rapport économique mensuel - Janvier 2024",
      description:
        "Analyse complète des indicateurs économiques du Sahel pour le mois de janvier",
      type: "monthly",
      status: "published",
      author: "Ibrahim Touré",
      createdDate: "2024-01-15",
      publishDate: "2024-01-16",
      downloads: 1540,
      size: "2.8 MB",
      format: "PDF",
      categories: ["Économie générale", "Indicateurs macro"],
      countries: ["Mali", "Burkina Faso", "Niger"],
    },
    {
      id: "econ-2",
      title: "Évolution du secteur minier - Q4 2023",
      description:
        "Rapport trimestriel sur les performances du secteur minier dans la région",
      type: "quarterly",
      status: "draft",
      author: "Salif Keita",
      createdDate: "2024-01-10",
      publishDate: "2024-01-20",
      downloads: 0,
      size: "1.9 MB",
      format: "PDF",
      categories: ["Industrie minière", "Ressources naturelles"],
      countries: ["Mali", "Burkina Faso"],
    },
    {
      id: "econ-3",
      title: "Analyse BRVM - Performance 2023",
      description:
        "Bilan annuel des performances de la Bourse Régionale des Valeurs Mobilières",
      type: "annual",
      status: "published",
      author: "Fatou Diallo",
      createdDate: "2024-01-05",
      publishDate: "2024-01-08",
      downloads: 890,
      size: "4.2 MB",
      format: "PDF",
      categories: ["Marchés financiers", "Investissement"],
      countries: ["UEMOA"],
    },
  ];

  // Mock data - Moderation Reports
  const moderationReports = [
    {
      id: "mod-1",
      type: "comment",
      title: "Commentaire inapproprié",
      description:
        "Commentaire contenant des propos offensants sur l'article 'Économie malienne'",
      reportedContent: "Ce commentaire contient du langage inapproprié...",
      reporter: "user123@example.com",
      reportedUser: "problematic@example.com",
      reason: "Langage offensant",
      status: "pending",
      priority: "high",
      createdDate: "2024-01-15",
      assignedTo: "Aïcha Koné",
      category: "Harcèlement",
    },
    {
      id: "mod-2",
      type: "article",
      title: "Article avec désinformation",
      description: "Article contenant des informations économiques erronées",
      reportedContent:
        "L'article affirme que le taux d'inflation est de 15%...",
      reporter: "analyst@example.com",
      reportedUser: "author@example.com",
      reason: "Désinformation",
      status: "in_review",
      priority: "medium",
      createdDate: "2024-01-14",
      assignedTo: "Amadou Sanogo",
      category: "Contenu inexact",
    },
    {
      id: "mod-3",
      type: "user",
      title: "Comportement de spam",
      description: "Utilisateur postant de manière répétitive le même contenu",
      reportedContent: "Utilisateur créant plusieurs comptes pour spam...",
      reporter: "moderator@example.com",
      reportedUser: "spammer@example.com",
      reason: "Spam",
      status: "resolved",
      priority: "low",
      createdDate: "2024-01-12",
      assignedTo: "Aïcha Koné",
      category: "Spam",
    },
  ];

  const stats = {
    economic: {
      total: economicReports.length,
      published: economicReports.filter((r) => r.status === "published").length,
      draft: economicReports.filter((r) => r.status === "draft").length,
      totalDownloads: economicReports.reduce((sum, r) => sum + r.downloads, 0),
    },
    moderation: {
      total: moderationReports.length,
      pending: moderationReports.filter((r) => r.status === "pending").length,
      inReview: moderationReports.filter((r) => r.status === "in_review")
        .length,
      resolved: moderationReports.filter((r) => r.status === "resolved").length,
    },
  };

  const handleReportSelect = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId],
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedReports.length === 0) {
      error("Erreur", "Aucun rapport sélectionné");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    switch (action) {
      case "publish":
        success(
          "Rapports publiés",
          `${selectedReports.length} rapport(s) publié(s)`,
        );
        break;
      case "download":
        success(
          "Téléchargement",
          `${selectedReports.length} rapport(s) télécharg��(s)`,
        );
        break;
      case "resolve":
        success(
          "Signalements traités",
          `${selectedReports.length} signalement(s) résolu(s)`,
        );
        break;
      case "assign":
        success(
          "Attribution",
          `${selectedReports.length} signalement(s) attribué(s)`,
        );
        break;
      case "delete":
        error(
          "Rapports supprimés",
          `${selectedReports.length} rapport(s) supprimé(s)`,
        );
        break;
    }
    setSelectedReports([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "in_review":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-amber-600 bg-amber-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const filteredEconomicReports = economicReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    const matchesType = filterType === "all" || report.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredModerationReports = moderationReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    const matchesType = filterType === "all" || report.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rapports et signalements</h1>
          <p className="text-slate-500 mt-1">Gérez les rapports économiques et les signalements de modération</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "economic" && hasPermission("create_economic_reports") && (
            <Link
              to="/dashboard/reports/new"
              className="flex items-center gap-2 px-4 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau rapport
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeTab === "economic" ? (
            <>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amani-primary mb-1">
                  {stats.economic.total}
                </div>
                <div className="text-sm text-gray-600">Total rapports</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amani-primary mb-1">
                  {stats.economic.published}
                </div>
                <div className="text-sm text-gray-600">Publiés</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Edit className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amani-primary mb-1">
                  {stats.economic.draft}
                </div>
                <div className="text-sm text-gray-600">Brouillons</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Download className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amani-primary mb-1">
                  {stats.economic.totalDownloads.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Téléchargements</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amani-primary mb-1">
                  {stats.moderation.pending}
                </div>
                <div className="text-sm text-gray-600">En attente</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amani-primary mb-1">
                  {stats.moderation.inReview}
                </div>
                <div className="text-sm text-gray-600">En révision</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amani-primary mb-1">
                  {stats.moderation.resolved}
                </div>
                <div className="text-sm text-gray-600">Résolus</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Flag className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amani-primary mb-1">
                  {stats.moderation.total}
                </div>
                <div className="text-sm text-gray-600">Total signalements</div>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-white/50">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {canViewEconomicReports && (
                <button
                  onClick={() => setActiveTab("economic")}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "economic"
                      ? "border-amani-primary text-amani-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Rapports économiques ({economicReports.length})
                </button>
              )}
              {canViewModerationReports && (
                <button
                  onClick={() => setActiveTab("moderation")}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "moderation"
                      ? "border-amani-primary text-amani-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  Signalements ({moderationReports.length})
                </button>
              )}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    {activeTab === "economic" ? (
                      <>
                        <option value="published">Publié</option>
                        <option value="draft">Brouillon</option>
                      </>
                    ) : (
                      <>
                        <option value="pending">En attente</option>
                        <option value="in_review">En révision</option>
                        <option value="resolved">Résolu</option>
                      </>
                    )}
                  </select>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                >
                  <option value="all">Tous les types</option>
                  {activeTab === "economic" ? (
                    <>
                      <option value="monthly">Mensuel</option>
                      <option value="quarterly">Trimestriel</option>
                      <option value="annual">Annuel</option>
                    </>
                  ) : (
                    <>
                      <option value="comment">Commentaire</option>
                      <option value="article">Article</option>
                      <option value="user">Utilisateur</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedReports.length > 0 && (
            <div className="p-4 bg-amani-primary text-white">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {selectedReports.length} élément(s) sélectionné(s)
                </span>
                <div className="flex items-center gap-2">
                  {activeTab === "economic" ? (
                    <>
                      {hasPermission("publish_articles") && (
                        <button
                          onClick={() => handleBulkAction("publish")}
                          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                        >
                          Publier
                        </button>
                      )}
                      <button
                        onClick={() => handleBulkAction("download")}
                        className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                      >
                        Télécharger
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleBulkAction("resolve")}
                        className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                      >
                        Résoudre
                      </button>
                      <button
                        onClick={() => handleBulkAction("assign")}
                        className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                      >
                        Attribuer
                      </button>
                    </>
                  )}
                  {hasPermission("delete_articles") && (
                    <button
                      onClick={() => handleBulkAction("delete")}
                      className="px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="divide-y divide-gray-200">
            {activeTab === "economic"
              ? filteredEconomicReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={() => handleReportSelect(report.id)}
                        className="mt-2 h-4 w-4 text-amani-primary focus:ring-amani-primary border-gray-300 rounded"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-amani-primary mb-1">
                              {report.title}
                            </h4>
                            <p className="text-gray-600 text-sm mb-2">
                              {report.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                            >
                              {report.status === "published"
                                ? "Publié"
                                : "Brouillon"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Auteur:</span>{" "}
                            {report.author}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span>{" "}
                            {report.type}
                          </div>
                          <div>
                            <span className="font-medium">Taille:</span>{" "}
                            {report.size}
                          </div>
                          <div>
                            <span className="font-medium">
                              Téléchargements:
                            </span>{" "}
                            {report.downloads}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {report.categories.map((category, index) => (
                              <span
                                key={index}
                                className="text-xs bg-amani-secondary/20 text-amani-primary px-2 py-1 rounded"
                              >
                                {category}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            {hasPermission("edit_articles") && (
                              <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : filteredModerationReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={() => handleReportSelect(report.id)}
                        className="mt-2 h-4 w-4 text-amani-primary focus:ring-amani-primary border-gray-300 rounded"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-amani-primary mb-1">
                              {report.title}
                            </h4>
                            <p className="text-gray-600 text-sm mb-2">
                              {report.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(report.priority)}`}
                            >
                              Priorité {report.priority}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                            >
                              {report.status === "pending"
                                ? "En attente"
                                : report.status === "in_review"
                                  ? "En révision"
                                  : "Résolu"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Signalé par:</span>{" "}
                            {report.reporter}
                          </div>
                          <div>
                            <span className="font-medium">Utilisateur:</span>{" "}
                            {report.reportedUser}
                          </div>
                          <div>
                            <span className="font-medium">Raison:</span>{" "}
                            {report.reason}
                          </div>
                          <div>
                            <span className="font-medium">Assigné à:</span>{" "}
                            {report.assignedTo}
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-1">
                            Contenu signalé:
                          </h5>
                          <p className="text-sm text-gray-600">
                            {report.reportedContent}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {report.category} • {report.createdDate}
                          </div>

                          <div className="flex items-center gap-2">
                            <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
