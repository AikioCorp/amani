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
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Gérez les comptes utilisateurs, rôles et permissions</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </Link>
        <div className="flex gap-3">
          <button
            onClick={handleExportUsers}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors uppercase tracking-widest"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <Link
            to="/dashboard/users/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold hover:bg-black transition-colors uppercase tracking-widest"
          >
            <UserPlus className="w-4 h-4" />
            Nouvel utilisateur
          </Link>
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total</h3>
              <UsersIcon className="w-5 h-5 text-gray-900" />
            </div>
            <div className="text-4xl font-black text-gray-900 tracking-tight">
              {userStats.total}
            </div>
            <div className="text-sm font-medium text-gray-500 mt-2">utilisateurs</div>
          </div>

          <div className="bg-white border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Actifs</h3>
              <CheckCircle className="w-5 h-5 text-gray-900" />
            </div>
            <div className="text-4xl font-black text-gray-900 tracking-tight">
              {userStats.active}
            </div>
            <div className="text-sm font-medium text-gray-500 mt-2">cette semaine</div>
          </div>

          <div className="bg-white border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Admins</h3>
              <Shield className="w-5 h-5 text-gray-900" />
            </div>
            <div className="text-4xl font-black text-gray-900 tracking-tight">
              {userStats.admins}
            </div>
            <div className="text-sm font-medium text-gray-500 mt-2">administrateurs</div>
          </div>

          <div className="bg-white border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Premium</h3>
              <Eye className="w-5 h-5 text-gray-900" />
            </div>
            <div className="text-4xl font-black text-gray-900 tracking-tight">
              {userStats.premium}
            </div>
            <div className="text-sm font-medium text-gray-500 mt-2">abonnés</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="RECHERCHER PAR NOM, EMAIL OU ORGANISATION..."
                className="w-full pl-10 pr-4 py-3 border-0 border-b-2 border-gray-200 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors placeholder-gray-400 text-sm font-medium uppercase tracking-wider"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 border-0 border-b-2 border-gray-200 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 text-sm font-bold text-gray-900 uppercase tracking-widest cursor-pointer"
              >
                <option value="all">TOUS LES RÔLES</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {getRoleDisplayName(role).toUpperCase()}
                  </option>
                ))}
              </select>
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 text-sm font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest">
                <Filter className="w-4 h-4" />
                Filtres
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-gray-900 text-white p-4 mb-6 flex items-center justify-between">
            <span className="font-bold text-sm uppercase tracking-widest">
              {selectedUsers.length} utilisateur(s) sélectionné(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkRoleChange}
                className="px-5 py-2.5 bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors uppercase tracking-widest"
              >
                Modifier le rôle
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors uppercase tracking-widest"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        {/* Users Table */}
        <div className="bg-white border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left border-b border-gray-200">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded-none cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                    Organisation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const isRecent = new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  const userRole = u.roles?.[0] || 'user';
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u.id)}
                          onChange={() => handleSelectUser(u.id)}
                          className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded-none cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-900 rounded-none flex items-center justify-center text-white font-bold tracking-widest text-sm">
                            {u.first_name?.charAt(0) || 'U'}
                            {u.last_name?.charAt(0) || ''}
                          </div>
                          <div>
                            <div className="font-black text-gray-900 tracking-tight">
                              {u.first_name} {u.last_name}
                            </div>
                            <div className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-none text-xs font-bold uppercase tracking-widest ${getRoleColor(userRole)}`}
                        >
                          {getRoleDisplayName(userRole)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500 uppercase tracking-widest">
                        {u.organization || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(u.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isRecent ? (
                            <CheckCircle className="w-4 h-4 text-gray-900" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300" />
                          )}
                          <span
                            className={`text-xs font-bold uppercase tracking-widest ${isRecent ? "text-gray-900" : "text-gray-400"}`}
                          >
                            {isRecent ? "En ligne" : "Hors ligne"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleViewUser(u.id)}
                            className="text-gray-400 hover:text-gray-900 p-2 border border-transparent hover:border-gray-200 transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(u.id)}
                            className="text-gray-400 hover:text-gray-900 p-2 border border-transparent hover:border-gray-200 transition-colors"
                            title="Modifier l'utilisateur"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-400 hover:text-red-600 p-2 border border-transparent hover:border-red-200 transition-colors"
                            title="Supprimer l'utilisateur"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="relative group">
                            <button className="text-gray-400 hover:text-gray-900 p-2 border border-transparent hover:border-gray-200 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {/* Dropdown menu */}
                            <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 shadow-2xl z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                              <button
                                onClick={() => handleSendPasswordReset(u.id)}
                                className="w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors border-b border-gray-100"
                              >
                                Réinitialiser MDP
                              </button>
                              <button
                                onClick={() => handleSendMessage(u.id)}
                                className="w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors border-b border-gray-100"
                              >
                                Envoyer message
                              </button>
                              <button
                                onClick={() => handleSuspendUser(u.id)}
                                className="w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors"
                              >
                                Suspendre
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
        <div className="mt-8 bg-white border border-gray-200 p-8">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">
            Gestion des permissions par rôle
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const roleUsers = users.filter((u) => u.roles?.includes(role));
              const sampleUser = roleUsers[0];

              return (
                <div
                  key={role}
                  className="border border-gray-200 p-8 bg-gray-50/30 hover:bg-white transition-colors"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">
                      {getRoleDisplayName(role)}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-none text-xs font-bold uppercase tracking-widest ${getRoleColor(role)}`}
                    >
                      {roleUsers.length} usager(s)
                    </span>
                  </div>
                  {sampleUser && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">
                        Échantillon
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <CheckCircle className="w-4 h-4 text-gray-900" />
                          <span className="font-bold text-gray-900">
                            {sampleUser.first_name} {sampleUser.last_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-600">
                            {sampleUser.email}
                          </span>
                        </div>
                        {sampleUser.organization && (
                          <div className="flex items-center gap-3 text-sm">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-600 uppercase tracking-widest">
                              {sampleUser.organization}
                            </span>
                          </div>
                        )}
                      </div>
                      <button className="w-full mt-6 px-4 py-3 border border-gray-200 text-gray-900 text-xs font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-colors">
                        Voir tout
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
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-none">
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">
                    Détails utilisateur
                  </h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-8">
                  {/* User Info */}
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gray-900 rounded-none flex items-center justify-center text-white font-black text-2xl tracking-widest">
                      {selectedUser.firstName.charAt(0)}
                      {selectedUser.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-gray-500 font-medium mb-3">{selectedUser.email}</p>
                      <span
                        className={`px-3 py-1 rounded-none text-xs font-bold uppercase tracking-widest ${getRoleColor(selectedUser.role)}`}
                      >
                        {getRoleDisplayName(selectedUser.role)}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">
                        Infos Personnelles
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
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">
                        Préférences
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                          <span className="font-medium text-gray-500 uppercase tracking-widest text-xs">Newsletter:</span>
                          <span className="font-bold text-gray-900">
                            {selectedUser.preferences.newsletter ? "Activée" : "Désactivée"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                          <span className="font-medium text-gray-500 uppercase tracking-widest text-xs">Alertes:</span>
                          <span className="font-bold text-gray-900">
                            {selectedUser.preferences.alerts ? "Activées" : "Désactivées"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-8 mt-8 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleEditUser(selectedUser.id);
                        setShowUserModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 text-gray-900 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleSendPasswordReset(selectedUser.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      Réinitialiser MDP
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteUser(selectedUser.id);
                        setShowUserModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && userToDelete && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-200 shadow-2xl max-w-md w-full rounded-none">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-50 rounded-none flex items-center justify-center border border-red-100">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">
                      Confirmation
                    </h3>
                    <p className="text-sm font-medium text-red-600 mt-1 uppercase tracking-widest">
                      Action irréversible
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                  <span className="font-bold text-gray-900">
                    {userToDelete.firstName} {userToDelete.lastName}
                  </span>{" "}
                  ({userToDelete.email}) ?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-3 border border-gray-200 text-gray-900 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    className="px-6 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
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
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-200 shadow-2xl max-w-md w-full rounded-none">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gray-50 border border-gray-200 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">
                      Modification en lot
                    </h3>
                    <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">
                      {selectedUsers.length} usager(s) sélectionné(s)
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Nouveau rôle
                  </label>
                  <select
                    value={newBulkRole}
                    onChange={(e) => setNewBulkRole(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-none focus:outline-none focus:ring-0 focus:border-gray-900 bg-transparent text-sm font-bold text-gray-900 uppercase tracking-widest cursor-pointer"
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
                    className="px-6 py-3 border border-gray-200 text-gray-900 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmBulkRoleChange}
                    className="px-6 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
