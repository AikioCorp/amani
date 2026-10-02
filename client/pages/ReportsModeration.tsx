import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  AlertTriangle,
  Eye,
  Check,
  X,
  Clock,
  User,
  MessageSquare,
  Flag,
  Calendar,
  ChevronDown,
  Search,
  Filter,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  FileText,
  Mic,
  AlertCircle,
} from "lucide-react";

interface Report {
  id: string;
  type:
    | "spam"
    | "inappropriate"
    | "harassment"
    | "fake_news"
    | "copyright"
    | "other";
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "urgent";
  contentType: "article" | "podcast" | "comment" | "user";
  contentTitle: string;
  contentId: string;
  reportedBy: string;
  reportedUser?: string;
  reason: string;
  description: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  moderatorNotes?: string;
}

export default function ReportsModeration() {
  const { user, hasPermission } = useAuth();
  const { success, error, warning } = useToast();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Vérification des permissions
  if (!user || !hasPermission("manage_user_reports")) {
    return (
      <>
        <div className="flex items-center justify-center py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Accès refusé
            </h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas les permissions nécessaires pour gérer les
              signalements.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </>
    );
  }

  // Données de demo
  const reports: Report[] = [
    {
      id: "1",
      type: "inappropriate",
      status: "pending",
      priority: "high",
      contentType: "article",
      contentTitle: "Article sur l'économie malienne",
      contentId: "art-123",
      reportedBy: "user@example.com",
      reportedUser: "author@example.com",
      reason: "Contenu inapproprié",
      description:
        "Cet article contient des informations trompeuses sur l'économie",
      createdAt: "2024-03-15T10:30:00Z",
    },
    {
      id: "2",
      type: "spam",
      status: "reviewed",
      priority: "medium",
      contentType: "comment",
      contentTitle: "Commentaire sur podcast économique",
      contentId: "com-456",
      reportedBy: "moderator@example.com",
      reportedUser: "spammer@example.com",
      reason: "Spam",
      description: "Commentaire répétitif avec liens suspects",
      createdAt: "2024-03-14T15:20:00Z",
      reviewedAt: "2024-03-14T16:00:00Z",
      reviewedBy: "Modérateur Principal",
      moderatorNotes: "Confirmé comme spam, utilisateur averti",
    },
    {
      id: "3",
      type: "harassment",
      status: "pending",
      priority: "urgent",
      contentType: "podcast",
      contentTitle: "Podcast Économie Africaine #12",
      contentId: "pod-789",
      reportedBy: "victim@example.com",
      reportedUser: "harasser@example.com",
      reason: "Harcèlement",
      description: "Commentaires offensants répétés ciblant l'auteur",
      createdAt: "2024-03-15T09:15:00Z",
    },
  ];

  const getReportTypeLabel = (type: string) => {
    const types = {
      spam: "Spam",
      inappropriate: "Contenu inapproprié",
      harassment: "Harcèlement",
      fake_news: "Fausses informations",
      copyright: "Violation de droits d'auteur",
      other: "Autre",
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "dismissed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return FileText;
      case "podcast":
        return Mic;
      case "comment":
        return MessageSquare;
      case "user":
        return User;
      default:
        return AlertTriangle;
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.contentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesPriority =
      priorityFilter === "all" || report.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const handleResolveReport = (reportId: string) => {
    success("Résolution", `Signalement ${reportId} marqué comme résolu`);
  };

  const handleDismissReport = (reportId: string) => {
    success("Rejet", `Signalement ${reportId} rejeté`);
  };

  const handleBanUser = (reportId: string) => {
    warning(
      "Bannissement",
      `Utilisateur banni suite au signalement ${reportId}`,
    );
  };

  const stats = [
    {
      label: "En attente",
      value: reports.filter((r) => r.status === "pending").length.toString(),
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Urgent",
      value: reports.filter((r) => r.priority === "urgent").length.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      label: "Résolus",
      value: reports.filter((r) => r.status === "resolved").length.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Total",
      value: reports.length.toString(),
      icon: Flag,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  return (
    <>
      {/* Actions bar previously in DashboardLayout */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 min-w-[300px]">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un signalement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="reviewed">Révisés</option>
          <option value="resolved">Résolus</option>
          <option value="dismissed">Rejetés</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toutes priorités</option>
          <option value="urgent">🔴 Urgent</option>
          <option value="high">🟠 Élevée</option>
          <option value="medium">🟡 Moyenne</option>
          <option value="low">🟢 Faible</option>
        </select>
      </div>
      <div className="space-y-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
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

        {/* Liste des signalements */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Signalements ({filteredReports.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => {
              const ContentIcon = getContentTypeIcon(report.contentType);
              return (
                <div
                  key={report.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ContentIcon className="w-5 h-5 text-gray-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {report.contentTitle}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}
                          >
                            {report.priority.toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                          >
                            {report.status}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Type:</strong>{" "}
                          {getReportTypeLabel(report.type)} •
                          <strong> Signalé par:</strong> {report.reportedBy} •
                          <strong> Date:</strong>{" "}
                          {new Date(report.createdAt).toLocaleDateString(
                            "fr-FR",
                          )}
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                          <strong>Raison:</strong> {report.description}
                        </p>

                        {report.moderatorNotes && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-blue-800">
                              <strong>Notes du modérateur:</strong>{" "}
                              {report.moderatorNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {report.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleResolveReport(report.id)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="Résoudre"
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDismissReport(report.id)}
                            className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Rejeter"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleBanUser(report.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Bannir l'utilisateur"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredReports.length === 0 && (
              <div className="p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun signalement trouvé
                </h3>
                <p className="text-gray-600">
                  Aucun signalement ne correspond à vos critères de recherche.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
