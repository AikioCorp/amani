import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useUsers } from "../hooks/useUsers";
import {
  getRoleDisplayName,
  getRoleColor,
} from "../lib/demoAccounts";
import {
  ArrowLeft,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Eye,
  Mail,
  Calendar,
  Users as UsersIcon,
  Download,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  X,
  Lock,
  AlertCircle,
} from "lucide-react";

export default function Users() {
  const { user, hasPermission } = useAuth();
  const { success, error, warning, info } = useToast();
  const { users, isLoading, error: usersError, stats, deleteUser: deleteUserFn, updateUserRoles } = useUsers();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);
  const [newBulkRole, setNewBulkRole] = useState("user");

  // Check permissions
  if (!user || !hasPermission("manage_users")) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-amani-primary mb-4">
            Accès refusé
          </h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour gérer les
            utilisateurs.
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

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.organization?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === "all" || u.roles?.includes(selectedRole);

    return matchesSearch && matchesRole;
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const handleViewUser = (userId: string) => {
    const userToView = users.find((u) => u.id === userId);
    if (userToView) {
      setSelectedUser(userToView);
      setShowUserModal(true);
      info(
        "Détails de l'utilisateur",
        `Affichage des informations de ${userToView.first_name} ${userToView.last_name}`,
      );
    }
  };

  const handleEditUser = (userId: string) => {
    const userToEdit = users.find((u) => u.id === userId);
    if (userToEdit) {
      navigate(`/dashboard/users/edit/${userId}`);
      info(
        "Modification",
        `Redirection vers l'édition de ${userToEdit.first_name} ${userToEdit.last_name}`,
      );
    }
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (userToDelete) {
      setUserToDelete(userToDelete);
      setShowDeleteConfirm(true);
      warning(
        "Suppression",
        "Confirmation requise pour supprimer l'utilisateur",
      );
    }
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUserFn(userToDelete.id);
        success(
          "Utilisateur supprimé",
          `${userToDelete.first_name} ${userToDelete.last_name} a été supprimé avec succès`,
        );
        setShowDeleteConfirm(false);
        setUserToDelete(null);
      } catch (err) {
        error("Erreur", "Impossible de supprimer l'utilisateur");
      }
    }
  };

  const handleBulkRoleChange = () => {
    if (selectedUsers.length === 0) {
      warning(
        "Aucune sélection",
        "Veuillez sélectionner au moins un utilisateur",
      );
      return;
    }
    setShowBulkRoleModal(true);
  };

  const confirmBulkRoleChange = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Bulk role change:", selectedUsers, "to role:", newBulkRole);
    success(
      "Rôles modifiés",
      `Le rôle de ${selectedUsers.length} utilisateur(s) a été modifié vers ${getRoleDisplayName(newBulkRole)}`,
    );
    setShowBulkRoleModal(false);
    setSelectedUsers([]);
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      warning(
        "Aucune sélection",
        "Veuillez sélectionner au moins un utilisateur",
      );
      return;
    }

    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateur(s) ? Cette action est irréversible.`,
      )
    ) {
      // Simulate API call
      setTimeout(() => {
        console.log("Bulk deleting users:", selectedUsers);
        success(
          "Utilisateurs supprimés",
          `${selectedUsers.length} utilisateur(s) ont été supprimés avec succès`,
        );
        setSelectedUsers([]);
      }, 1000);
    }
  };

  const handleSendPasswordReset = async (userId: string) => {
    const userToReset = users.find((u) => u.id === userId);
    if (userToReset) {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      success(
        "Email envoyé",
        `Un email de réinitialisation a été envoyé à ${userToReset.email}`,
      );
    }
  };

  const handleSendMessage = (userId: string) => {
    const userToMessage = users.find((u) => u.id === userId);
    if (userToMessage) {
      info(
        "Message",
        `Fonctionnalité de messagerie avec ${userToMessage.first_name} ${userToMessage.last_name} en développement`,
      );
    }
  };

  const handleSuspendUser = async (userId: string) => {
    const userToSuspend = users.find((u) => u.id === userId);
    if (userToSuspend) {
      if (
        confirm(
          `Êtes-vous sûr de vouloir suspendre le compte de ${userToSuspend.first_name} ${userToSuspend.last_name} ?`,
        )
      ) {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        warning(
          "Compte suspendu",
          `Le compte de ${userToSuspend.first_name} ${userToSuspend.last_name} a été suspendu`,
        );
      }
    }
  };

  const handleExportUsers = () => {
    // Simulate export
    setTimeout(() => {
      success(
        "Export terminé",
        "La liste des utilisateurs a été exportée au format CSV",
      );
    }, 1500);
    info("Export en cours", "Génération du fichier CSV en cours...");
  };

  const roles = [
    "admin",
    "editeur",
    "analyste",
    "moderateur",
    "abonne",
    "visiteur",
  ];

  // Utiliser les stats du hook useUsers
  const userStats = {
    total: stats.total,
    active: users.length, // Tous les utilisateurs sont considérés actifs
    admins: stats.admins,
    premium: stats.users,
  };

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amani-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si nécessaire
  if (usersError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-red-50 rounded-2xl shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-6">{usersError}</p>
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-amani-primary">Gestion des utilisateurs</h1>
          <p className="text-gray-600">Gérez les comptes utilisateurs, rôles et permissions</p>
        </div>
        {/* Navigation */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-amani-primary hover:text-amani-primary/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex gap-3">
              <button
                onClick={handleExportUsers}
                className="flex items-center gap-2 px-4 py-2 border border-amani-primary text-amani-primary rounded-lg hover:bg-amani-secondary/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
              <Link
                to="/dashboard/users/new"
                className="flex items-center gap-2 px-4 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Nouvel utilisateur
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total</h3>
              <UsersIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-amani-primary">
              {userStats.total}
            </div>
            <div className="text-sm text-gray-600">utilisateurs</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Actifs</h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-amani-primary">
              {userStats.active}
            </div>
            <div className="text-sm text-gray-600">cette semaine</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Admins</h3>
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-amani-primary">
              {userStats.admins}
            </div>
            <div className="text-sm text-gray-600">administrateurs</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Premium</h3>
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-amani-primary">
              {userStats.premium}
            </div>
            <div className="text-sm text-gray-600">abonnés</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-white/50">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, email ou organisation..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
              >
                <option value="all">Tous les rôles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </option>
                ))}
              </select>
              <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                Filtres
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-amani-primary text-white rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {selectedUsers.length} utilisateur(s) sélectionné(s)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkRoleChange}
                  className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  Modifier le rôle
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-white/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-amani-primary focus:ring-amani-primary border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => {
                  const isRecent = new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  const userRole = u.roles?.[0] || 'user';
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u.id)}
                          onChange={() => handleSelectUser(u.id)}
                          className="h-4 w-4 text-amani-primary focus:ring-amani-primary border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-amani-primary to-amani-primary/80 rounded-full flex items-center justify-center text-white font-semibold">
                            {u.first_name?.charAt(0) || 'U'}
                            {u.last_name?.charAt(0) || ''}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-amani-primary">
                              {u.first_name} {u.last_name}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole)}`}
                        >
                          {getRoleDisplayName(userRole)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {u.organization || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(u.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {isRecent ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                          <span
                            className={`text-sm ${isRecent ? "text-green-600" : "text-gray-600"}`}
                          >
                            {isRecent ? "En ligne" : "Hors ligne"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleViewUser(u.id)}
                            className="text-amani-primary hover:text-amani-primary/80 p-1 rounded hover:bg-amani-secondary/20 transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(u.id)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Modifier l'utilisateur"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Supprimer l'utilisateur"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="relative group">
                            <button className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {/* Dropdown menu */}
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                              <button
                                onClick={() => handleSendPasswordReset(u.id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Réinitialiser le mot de passe
                              </button>
                              <button
                                onClick={() => handleSendMessage(u.id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Envoyer un message
                              </button>
                              <button
                                onClick={() => handleSuspendUser(u.id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Suspendre le compte
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions Management */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 border border-white/50">
          <h2 className="text-2xl font-bold text-amani-primary mb-6">
            Gestion des permissions par rôle
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const roleUsers = users.filter((u) => u.roles?.includes(role));
              const sampleUser = roleUsers[0];

              return (
                <div
                  key={role}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-amani-primary">
                      {getRoleDisplayName(role)}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getRoleColor(role)}`}
                    >
                      {roleUsers.length} utilisateur(s)
                    </span>
                  </div>
                  {sampleUser && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Informations:
                      </h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-gray-600">
                            {sampleUser.first_name} {sampleUser.last_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-600">
                            {sampleUser.email}
                          </span>
                        </div>
                        {sampleUser.organization && (
                          <div className="flex items-center gap-2 text-xs">
                            <Shield className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-600">
                              {sampleUser.organization}
                            </span>
                          </div>
                        )}
                      </div>
                      <button className="w-full mt-4 text-amani-primary text-sm font-medium hover:underline">
                        Voir tous les utilisateurs
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-amani-primary">
                    Détails de l'utilisateur
                  </h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amani-primary to-amani-primary/80 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedUser.firstName.charAt(0)}
                      {selectedUser.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-amani-primary">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-gray-600">{selectedUser.email}</p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}
                      >
                        {getRoleDisplayName(selectedUser.role)}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Informations personnelles
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Organisation:</span>{" "}
                          {selectedUser.organization}
                        </div>
                        <div>
                          <span className="font-medium">
                            Dernière connexion:
                          </span>{" "}
                          {selectedUser.lastLogin}
                        </div>
                        <div>
                          <span className="font-medium">Compte créé:</span>{" "}
                          Janvier 2024
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Préférences
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Newsletter:</span>{" "}
                          {selectedUser.preferences.newsletter
                            ? "Activée"
                            : "Désactivée"}
                        </div>
                        <div>
                          <span className="font-medium">Alertes:</span>{" "}
                          {selectedUser.preferences.alerts
                            ? "Activées"
                            : "Désactivées"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sectors */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Secteurs d'intérêt
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.preferences.sectors.map(
                        (sector: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-amani-secondary/50 text-amani-primary rounded text-xs"
                          >
                            {sector}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Countries */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Pays suivis
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.preferences.countries.map(
                        (country: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {country}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Permissions
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedUser.permissions.map(
                        (permission: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs"
                          >
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-gray-600">
                              {permission.replace(/_/g, " ")}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleEditUser(selectedUser.id);
                      setShowUserModal(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleSendPasswordReset(selectedUser.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Réinitialiser le mot de passe
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteUser(selectedUser.id);
                      setShowUserModal(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && userToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Confirmer la suppression
                    </h3>
                    <p className="text-gray-600">
                      Cette action est irréversible
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6">
                  Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                  <span className="font-semibold">
                    {userToDelete.firstName} {userToDelete.lastName}
                  </span>{" "}
                  ({userToDelete.email}) ?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Role Change Modal */}
        {showBulkRoleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Modifier le rôle en lot
                    </h3>
                    <p className="text-gray-600">
                      {selectedUsers.length} utilisateur(s) sélectionné(s)
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau rôle
                  </label>
                  <select
                    value={newBulkRole}
                    onChange={(e) => setNewBulkRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                  >
                    <option value="visiteur">Visiteur</option>
                    <option value="abonne">Abonné Premium</option>
                    <option value="moderateur">Modérateur</option>
                    <option value="analyste">Analyste</option>
                    <option value="editeur">Éditeur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowBulkRoleModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmBulkRoleChange}
                    className="px-4 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors"
                  >
                    Modifier les rôles
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
