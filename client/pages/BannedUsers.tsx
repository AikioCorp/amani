import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import DashboardLayout from "../components/DashboardLayout";
import {
  UserCheck,
  Search,
  Filter,
  Ban,
  RotateCcw,
  User,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle,
  Eye,
  MoreVertical,
} from "lucide-react";

export default function BannedUsers() {
  const { user, hasPermission } = useAuth();
  const { success, error, warning } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterReason, setFilterReason] = useState("all");

  // Check permissions after all hooks
  if (!user || !hasPermission("ban_users")) {
    return (
      <DashboardLayout
        title="Accès refusé"
        subtitle="Vous n'avez pas les permissions nécessaires"
      >
        <div className="flex items-center justify-center py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-amani-primary mb-4">
              Accès refusé
            </h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas les permissions nécessaires pour gérer les utilisateurs bannis.
            </p>
            <Link
              to="/dashboard"
              className="bg-amani-primary text-white px-6 py-2 rounded-lg hover:bg-amani-primary/90 transition-colors"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const bannedUsers = [
    {
      id: "1",
      firstName: "Ahmed",
      lastName: "Dubois",
      email: "ahmed.dubois@example.com",
      reason: "spam",
      bannedBy: "Mariama Sy",
      bannedAt: "2024-01-10",
      duration: "permanent",
      description: "Publication répétée de contenu spam et liens malveillants",
      reports: 8,
      lastActive: "2024-01-09",
    },
    {
      id: "2",
      firstName: "Sarah",
      lastName: "Martin",
      email: "sarah.martin@example.com",
      reason: "harassment",
      bannedBy: "Fatou Diallo",
      bannedAt: "2024-01-12",
      duration: "30 jours",
      description: "Harcèlement d'autres utilisateurs dans les commentaires",
      reports: 5,
      lastActive: "2024-01-11",
    },
    {
      id: "3",
      firstName: "Mohamed",
      lastName: "Konate",
      email: "mohamed.konate@example.com",
      reason: "inappropriate",
      bannedBy: "Amadou Traoré",
      bannedAt: "2024-01-08",
      duration: "7 jours",
      description: "Contenu inapproprié et violation des conditions d'utilisation",
      reports: 3,
      lastActive: "2024-01-07",
    },
    {
      id: "4",
      firstName: "Lisa",
      lastName: "Johnson",
      email: "lisa.johnson@example.com",
      reason: "fake_news",
      bannedBy: "Ibrahim Diarra",
      bannedAt: "2024-01-14",
      duration: "permanent",
      description: "Diffusion répétée de fausses informations économiques",
      reports: 12,
      lastActive: "2024-01-13",
    },
    {
      id: "5",
      firstName: "David",
      lastName: "Traore",
      email: "david.traore@example.com",
      reason: "violence",
      bannedBy: "Adjoa Kone",
      bannedAt: "2024-01-11",
      duration: "90 jours",
      description: "Incitation à la violence et langage haineux",
      reports: 6,
      lastActive: "2024-01-10",
    },
  ];

  const reasons = [
    { id: "all", label: "Toutes les raisons" },
    { id: "spam", label: "Spam" },
    { id: "harassment", label: "Harcèlement" },
    { id: "inappropriate", label: "Contenu inapproprié" },
    { id: "fake_news", label: "Fausses informations" },
    { id: "violence", label: "Violence/Haine" },
  ];

  const stats = [
    {
      label: "Utilisateurs bannis",
      value: bannedUsers.length.toString(),
      icon: Ban,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      label: "Bannissements permanents",
      value: bannedUsers.filter(u => u.duration === "permanent").length.toString(),
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      label: "Bannissements temporaires",
      value: bannedUsers.filter(u => u.duration !== "permanent").length.toString(),
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Signalements totaux",
      value: bannedUsers.reduce((sum, u) => sum + u.reports, 0).toString(),
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "spam":
        return "bg-yellow-100 text-yellow-800";
      case "harassment":
        return "bg-red-100 text-red-800";
      case "inappropriate":
        return "bg-orange-100 text-orange-800";
      case "fake_news":
        return "bg-purple-100 text-purple-800";
      case "violence":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReasonLabel = (reason: string) => {
    const reasonMap: { [key: string]: string } = {
      spam: "Spam",
      harassment: "Harcèlement",
      inappropriate: "Contenu inapproprié",
      fake_news: "Fausses informations",
      violence: "Violence/Haine",
    };
    return reasonMap[reason] || reason;
  };

  const filteredUsers = bannedUsers.filter((bannedUser) => {
    const matchesSearch =
      bannedUser.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bannedUser.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bannedUser.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bannedUser.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason =
      filterReason === "all" || bannedUser.reason === filterReason;
    return matchesSearch && matchesReason;
  });

  const handleUnbanUser = (id: string, name: string) => {
    success("Utilisateur débanné", `${name} a été débanní avec succès`);
  };

  const handleViewDetails = (id: string) => {
    success("Détails", `Affichage des détails pour l'utilisateur ${id}`);
  };

  return (
    <DashboardLayout
      title="Utilisateurs bannis"
      subtitle="Gérez les utilisateurs suspendus ou bannis de la plateforme"
      actions={
        <>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
            >
              {reasons.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>
        </>
      }
    >
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

        {/* Banned Users List */}
        <div className="bg-white rounded-2xl shadow-lg border border-white/50">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-amani-primary">
                Utilisateurs bannis ({filteredUsers.length})
              </h2>
            </div>
          </div>

          <div className="p-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun utilisateur banni trouvé
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterReason !== "all"
                    ? "Aucun utilisateur ne correspond à vos critères."
                    : "Aucun utilisateur n'est actuellement banni."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredUsers.map((bannedUser) => (
                  <div
                    key={bannedUser.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                            {bannedUser.firstName[0]}
                            {bannedUser.lastName[0]}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {bannedUser.firstName} {bannedUser.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{bannedUser.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonColor(
                                bannedUser.reason,
                              )}`}
                            >
                              {getReasonLabel(bannedUser.reason)}
                            </span>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              {bannedUser.duration}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4">{bannedUser.description}</p>

                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Banni par {bannedUser.bannedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(bannedUser.bannedAt).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {bannedUser.reports} signalements
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Dernière activité: {new Date(bannedUser.lastActive).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-6">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUnbanUser(bannedUser.id, `${bannedUser.firstName} ${bannedUser.lastName}`)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Débannir"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewDetails(bannedUser.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
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
    </DashboardLayout>
  );
}
