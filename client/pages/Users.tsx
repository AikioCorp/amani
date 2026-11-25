import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useUsers } from "../hooks/useUsers";
import { API_BASE_URL } from "../services/apiConfig";
import { getSessionToken } from "../services/authService";
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
  Crown,
  X,
  Lock,
  AlertCircle,
  Check,
  Building,
  Loader2,
  Key,
  Copy,
  Send,
  RefreshCw,
  EyeOff,
} from "lucide-react";

export default function Users() {
  const { user, hasPermission } = useAuth();
  const { success, error, warning, info } = useToast();
  const { users, setUsers, isLoading, error: usersError, stats, deleteUser: deleteUserFn } = useUsers();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [premiumFilter, setPremiumFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);
  const [newBulkRole, setNewBulkRole] = useState("subscriber");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal Accès & Sécurité (rôle, mot de passe, lien de réinitialisation)
  const [modalRole, setModalRole] = useState("subscriber");
  const [modalActive, setModalActive] = useState(true);
  const [modalPassword, setModalPassword] = useState("");
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [generatedResetLink, setGeneratedResetLink] = useState("");
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState<"idle" | "sent" | "failed">("idle");
  const [modalBusy, setModalBusy] = useState(false);

  // Check permissions
  if (!user || !hasPermission("manage_users")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 max-w-md text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Accès Refusé</h2>
          <p className="text-sm text-gray-500">
            Vous n'avez pas les permissions nécessaires pour accéder à la gestion des utilisateurs.
          </p>
          <Link
            to="/dashboard"
            className="inline-block bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-black transition-all text-xs"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      (u.first_name && u.first_name.toLowerCase().includes(query)) ||
      (u.last_name && u.last_name.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.organization && u.organization.toLowerCase().includes(query));

    const matchesRole = selectedRole === "all" || (u.roles && u.roles.includes(selectedRole));
    const matchesPremium =
      premiumFilter === "all" ||
      (premiumFilter === "premium" && u.is_premium) ||
      (premiumFilter === "free" && !u.is_premium);

    return matchesSearch && matchesRole && matchesPremium;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
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
      setModalRole(userToView.role || userToView.roles?.[0] || "subscriber");
      setModalActive(userToView.is_active !== false);
      setModalPassword("");
      setShowModalPassword(false);
      setGeneratedResetLink("");
      setEmailDeliveryStatus("idle");
      setShowUserModal(true);
    }
  };

  const handleGenerateTempPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let pwd = "Am";
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setModalPassword(pwd);
    setShowModalPassword(true);
  };

  const handleSaveAccessAndPassword = async () => {
    if (!selectedUser) return;
    if (modalPassword.trim().length > 0 && modalPassword.trim().length < 6) {
      error("Mot de passe trop court", "Minimum 6 caractères requis.");
      return;
    }

    setModalBusy(true);
    try {
      const token = getSessionToken();
      const payload: Record<string, any> = {
        role: modalRole,
        is_active: modalActive,
      };
      if (modalPassword.trim().length >= 6) {
        payload.password = modalPassword.trim();
      }

      const res = await fetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Erreur serveur (${res.status})`);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, role: modalRole, roles: [modalRole], is_active: modalActive }
            : u
        )
      );
      setSelectedUser((prev: any) =>
        prev ? { ...prev, role: modalRole, roles: [modalRole], is_active: modalActive } : prev
      );

      success(
        "Accès mis à jour",
        modalPassword.trim()
          ? "Le rôle, le statut et le nouveau mot de passe ont été enregistrés."
          : "Le rôle et le statut d'accès ont été enregistrés."
      );
      setModalPassword("");
    } catch (err: any) {
      error("Erreur", err.message || "Impossible d'enregistrer les modifications.");
    } finally {
      setModalBusy(false);
    }
  };

  const handleGenerateOrSendResetLink = async (sendEmail: boolean) => {
    if (!selectedUser) return;
    setModalBusy(true);
    setEmailDeliveryStatus("idle");
    try {
      const token = getSessionToken();
      const res = await fetch(`${API_BASE_URL}/users/${selectedUser.id}/reset-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ sendEmail }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success || !json.data?.resetLink) {
        throw new Error(json.error || "Impossible de générer le lien de réinitialisation.");
      }

      setGeneratedResetLink(json.data.resetLink);
      if (sendEmail) {
        if (json.data.emailSent) {
          setEmailDeliveryStatus("sent");
          success("Lien généré & envoyé", `E-mail transmis à ${selectedUser.email}`);
        } else {
          setEmailDeliveryStatus("failed");
          warning(
            "Lien généré (SMTP indisponible)",
            "L'envoi par e-mail a échoué, mais vous pouvez copier le lien ci-dessous."
          );
        }
      } else {
        success("Lien généré", "Lien de réinitialisation prêt à être copié (valide 1h).");
      }
    } catch (err: any) {
      error("Erreur", err.message || "Impossible de générer le lien.");
    } finally {
      setModalBusy(false);
    }
  };

  const handleEditUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    navigate(`/dashboard/users/edit/${userId}`, { state: { user: targetUser } });
  };

  const handleDeleteUser = (userId: string) => {
    const userToDel = users.find((u) => u.id === userId);
    if (userToDel) {
      setUserToDelete(userToDel);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUserFn(userToDelete.id);
        success("Utilisateur supprimé", `${userToDelete.first_name || ""} ${userToDelete.last_name || ""} a été supprimé.`);
        setShowDeleteConfirm(false);
        setUserToDelete(null);
      } catch (err) {
        error("Erreur", "Impossible de supprimer l'utilisateur");
      }
    }
  };

  const handleTogglePremium = async (u: any) => {
    const newStatus = !u.is_premium;
    // Optimistic Update
    setUsers((prev) =>
      prev.map((item) => (item.id === u.id ? { ...item, is_premium: newStatus } : item))
    );

    try {
      const token = getSessionToken();
      const res = await fetch(`${API_BASE_URL}/admin/users/${u.id}/premium`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ is_premium: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        success("Statut Mis à Jour", json.message);
      } else {
        // Rollback
        setUsers((prev) =>
          prev.map((item) => (item.id === u.id ? { ...item, is_premium: !newStatus } : item))
        );
        error("Erreur", json.error || "Échec du changement de statut");
      }
    } catch (e) {
      // Rollback
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, is_premium: !newStatus } : item))
      );
      error("Erreur Réseau");
    }
  };

  const handleBulkRoleChange = () => {
    if (selectedUsers.length === 0) {
      warning("Aucune sélection", "Veuillez sélectionner au moins un utilisateur");
      return;
    }
    setShowBulkRoleModal(true);
  };

  const confirmBulkRoleChange = async () => {
    const roleMap: Record<string, string> = {
      admin: "admin",
      editeur: "editor",
      editor: "editor",
      analyste: "analyst",
      analyst: "analyst",
      moderateur: "moderator",
      moderator: "moderator",
      abonne: "subscriber",
      subscriber: "subscriber",
      visiteur: "subscriber",
    };
    const mappedRole = roleMap[newBulkRole] || "subscriber";
    const token = getSessionToken();

    try {
      await Promise.all(
        selectedUsers.map((id) =>
          fetch(`${API_BASE_URL}/users/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ role: mappedRole }),
          }).then(async (res) => {
            if (!res.ok) {
              const j = await res.json().catch(() => ({}));
              throw new Error(j.error || `Erreur serveur (${res.status})`);
            }
          })
        )
      );
      setUsers((prev) =>
        prev.map((u) => (selectedUsers.includes(u.id) ? { ...u, role: mappedRole, roles: [mappedRole] } : u))
      );
      success("Rôles Modifiés", `Rôle mis à jour pour ${selectedUsers.length} utilisateur(s).`);
      setShowBulkRoleModal(false);
      setSelectedUsers([]);
    } catch (err: any) {
      error("Erreur", err.message || "Impossible de mettre à jour les rôles.");
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      warning("Aucune sélection", "Veuillez sélectionner au moins un utilisateur");
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateur(s) ?`)) {
      setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u.id)));
      success("Utilisateurs Supprimés", `${selectedUsers.length} utilisateur(s) supprimés.`);
      setSelectedUsers([]);
    }
  };

  const handleSendPasswordReset = async (userEmail: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Impossible d'envoyer l'e-mail de réinitialisation.");
      }
      success("Email envoyé", `Lien de réinitialisation transmis à ${userEmail}`);
    } catch (err: any) {
      error("Erreur", err.message || "Impossible d'envoyer le lien de réinitialisation.");
    }
  };

  const roles = ["admin", "editeur", "analyste", "moderateur", "abonne", "visiteur"];

  const userStats = {
    total: stats.total || users.length,
    active: users.length,
    admins: stats.admins || users.filter((u) => u.roles?.includes("admin")).length,
    premium: users.filter((u) => u.is_premium).length,
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-5">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-44 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        {/* KPI Skeleton Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-300 rounded-lg animate-pulse" />
              <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Search Bar Skeleton */}
        <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
          <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
        </div>

        {/* Table Rows Skeleton */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse hidden sm:block" />
              <div className="h-6 w-28 bg-gray-100 rounded-full animate-pulse hidden md:block" />
              <div className="h-8 w-24 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
        <h2 className="text-xl font-bold text-red-900">Erreur de chargement</h2>
        <p className="text-xs text-red-700">{usersError}</p>
        <Link to="/dashboard" className="inline-block bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl">
          Retour au dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <UsersIcon className="w-6 h-6 text-[#9C8464]" /> Gestion des Utilisateurs
          </h1>
          <p className="text-[13px] text-stone-500 mt-1">
            Supervisez les membres, gérez les rôles, permissions et statuts Pass Premium.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/dashboard/users/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-[13px] rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4 text-amber-400" /> Ajouter un Utilisateur
          </Link>
        </div>
      </div>

      {/* Cartes KPI Responsives */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-1 hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Total</span>
            <UsersIcon className="w-4 h-4 text-[#9C8464]" />
          </div>
          <p className="text-2xl font-bold text-stone-900 tabular-nums">{userStats.total}</p>
          <p className="text-[11px] text-stone-400 font-medium">Comptes inscrits</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-1 hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Actifs</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 tabular-nums">{userStats.active}</p>
          <p className="text-[11px] text-stone-400 font-medium">Connexions récentes</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-1 hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Admins</span>
            <Shield className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600 tabular-nums">{userStats.admins}</p>
          <p className="text-[11px] text-stone-400 font-medium">Rôle Administrateur</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-1 hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Premium</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 tabular-nums">{userStats.premium}</p>
          <p className="text-[11px] text-stone-400 font-medium">Pass Premium Amani</p>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, e-mail, organisation..."
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="flex-1 sm:w-48 px-3 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm bg-white font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="all">Tous les Rôles</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {getRoleDisplayName(r)}
                </option>
              ))}
            </select>

            <select
              value={premiumFilter}
              onChange={(e) => {
                setPremiumFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 sm:w-48 px-3 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm bg-white font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="all">Tous les Statuts</option>
              <option value="premium">Membres Premium</option>
              <option value="free">Membres Standard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action en Lot (Bulk Bar) */}
      {selectedUsers.length > 0 && (
        <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-bold">
            {selectedUsers.length} utilisateur(s) sélectionné(s)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkRoleChange}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all"
            >
              Modifier Rôles
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}

      {/* Rendu Responsive : Table sur Écran Large & Cartes sur Mobile/Tablette */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 rounded-2xl bg-white">
          <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700 font-bold text-base">Aucun utilisateur trouvé.</p>
          <p className="text-xs text-gray-400 mt-1">Essayez de réinitialiser vos filtres de recherche.</p>
        </div>
      ) : (
        <>
          {/* Vue Mobile / Tablette (< lg) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {paginatedUsers.map((u) => {
              const userRole = u.roles?.[0] || "user";
              const isSelected = selectedUsers.includes(u.id);

              return (
                <div
                  key={u.id}
                  className={`bg-white border rounded-2xl p-4 space-y-3 shadow-sm transition-all ${
                    isSelected ? "border-amber-500 ring-2 ring-amber-500/20" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectUser(u.id)}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
                      />
                      <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-xs">
                        {u.first_name?.charAt(0) || "U"}
                        {u.last_name?.charAt(0) || ""}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-900">
                          {u.first_name} {u.last_name}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" /> {u.email}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePremium(u)}
                      className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
                        u.is_premium
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                      title="Basculer statut Premium"
                    >
                      <Crown className={`w-4 h-4 ${u.is_premium ? "text-amber-600 fill-amber-500" : "text-gray-400"}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getRoleColor(userRole)}`}>
                      {getRoleDisplayName(userRole)}
                    </span>

                    {u.organization && (
                      <span className="flex items-center gap-1 font-medium truncate max-w-[140px]">
                        <Building className="w-3 h-3 text-gray-400" /> {u.organization}
                      </span>
                    )}
                  </div>

                  {/* Actions de carte */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleViewUser(u.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-400" /> Voir
                    </button>
                    <button
                      onClick={() => handleEditUser(u.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5 text-gray-400" /> Éditer
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vue Desktop Tableau (>= lg) */}
          <div className="hidden lg:block bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
                      />
                    </th>
                    <th className="p-4">Utilisateur</th>
                    <th className="p-4">Rôle</th>
                    <th className="p-4">Organisation</th>
                    <th className="p-4">Statut Premium</th>
                    <th className="p-4">Inscription</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-[13px] text-stone-700">
                  {paginatedUsers.map((u) => {
                    const userRole = u.roles?.[0] || "user";
                    const isSelected = selectedUsers.includes(u.id);

                    return (
                      <tr key={u.id} className={`hover:bg-gray-50/80 transition-colors ${isSelected ? "bg-amber-50/30" : ""}`}>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectUser(u.id)}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
                          />
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {u.first_name?.charAt(0) || "U"}
                              {u.last_name?.charAt(0) || ""}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-gray-900">
                                {u.first_name} {u.last_name}
                              </div>
                              <div className="text-gray-400 text-xs flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {u.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getRoleColor(userRole)}`}>
                            {getRoleDisplayName(userRole)}
                          </span>
                        </td>

                        <td className="p-4 font-medium text-gray-600">
                          {u.organization || "-"}
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => handleTogglePremium(u)}
                            className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
                              u.is_premium
                                ? "bg-amber-100 text-amber-900 border-amber-300 shadow-sm"
                                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-amber-50 hover:text-amber-700"
                            }`}
                          >
                            <Crown className={`w-3.5 h-3.5 ${u.is_premium ? "text-amber-600" : "text-gray-400"}`} />
                            {u.is_premium ? "Membre Premium" : "Activer Premium"}
                          </button>
                        </td>

                        <td className="p-4 text-gray-500">
                          {new Date(u.created_at || Date.now()).toLocaleDateString("fr-FR")}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewUser(u.id)}
                              className="px-2.5 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-100 text-stone-700 transition-colors text-xs font-semibold inline-flex items-center gap-1"
                              title="Accès & Mot de passe"
                            >
                              <Key className="w-3.5 h-3.5 text-[#9C8464]" /> Accès
                            </button>

                            <button
                              onClick={() => handleEditUser(u.id)}
                              className="p-1.5 border border-stone-200 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
                              title="Éditer le profil complet"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination (10 / 25 / 50 / 100) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-stone-200/90 rounded-2xl px-4 py-3 text-xs text-stone-600 shadow-2xs">
            <div className="flex items-center gap-2">
              <span>Afficher</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 border border-stone-300 rounded-lg bg-white font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#9C8464]"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span>sur <strong className="text-stone-900 tabular-nums">{filteredUsers.length}</strong> utilisateur(s)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-stone-200 rounded-lg font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <span className="px-2 font-medium tabular-nums">
                Page <strong className="text-stone-900">{safePage}</strong> / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-stone-200 rounded-lg font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Accès, Rôle & Mot de passe */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-stone-900 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                  {selectedUser.first_name?.charAt(0) || "U"}
                  {selectedUser.last_name?.charAt(0) || ""}
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <p className="text-xs text-stone-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1 : Rôle & Statut d'accès */}
            <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#9C8464]" /> Rôle & Accès
                </span>
                <span className={`font-semibold text-xs inline-flex items-center gap-1 ${selectedUser.is_premium ? "text-amber-600" : "text-stone-500"}`}>
                  {selectedUser.is_premium ? (
                    <>
                      Pass Premium Actif <Crown className="w-3.5 h-3.5 text-amber-500" />
                    </>
                  ) : "Compte Standard"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Rôle système</label>
                  <select
                    value={modalRole}
                    onChange={(e) => setModalRole(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#9C8464]"
                  >
                    <option value="subscriber">Abonné (Standard)</option>
                    <option value="analyst">Analyste financier</option>
                    <option value="editor">Éditeur de contenu</option>
                    <option value="moderator">Modérateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="w-full flex items-center gap-2 cursor-pointer px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-800">
                    <input
                      type="checkbox"
                      checked={modalActive}
                      onChange={(e) => setModalActive(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    Compte actif (accès autorisé)
                  </label>
                </div>
              </div>
            </div>

            {/* Section 2 : Définir ou Générer un Mot de passe */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#9C8464]" /> Nouveau mot de passe direct
                </label>
                <button
                  type="button"
                  onClick={handleGenerateTempPassword}
                  className="text-[11px] font-semibold text-[#9C8464] hover:text-stone-900 inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Générer un mot de passe
                </button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showModalPassword ? "text" : "password"}
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    placeholder="Laisser vide pour ne pas modifier (min. 6 car.)"
                    className="w-full px-3 py-2 pr-9 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9C8464]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-700"
                  >
                    {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {modalPassword && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(modalPassword);
                      success("Copié", "Mot de passe copié dans le presse-papiers.");
                    }}
                    className="px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 inline-flex items-center gap-1"
                    title="Copier le mot de passe"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copier
                  </button>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={modalBusy}
                  onClick={handleSaveAccessAndPassword}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  {modalBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Enregistrer accès & mot de passe
                </button>
              </div>
            </div>

            {/* Section 3 : Lien de réinitialisation */}
            <div className="space-y-2.5 pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#9C8464]" /> Lien de réinitialisation (1h)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={modalBusy}
                    onClick={() => handleGenerateOrSendResetLink(false)}
                    className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                  >
                    Générer le lien
                  </button>
                  <button
                    type="button"
                    disabled={modalBusy}
                    onClick={() => handleGenerateOrSendResetLink(true)}
                    className="px-3 py-1.5 bg-[#9C8464] hover:bg-[#8A7355] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" /> Envoyer par e-mail
                  </button>
                </div>
              </div>

              {generatedResetLink && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedResetLink}
                      className="flex-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-stone-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedResetLink);
                        success("Copié", "Lien de réinitialisation copié !");
                      }}
                      className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copier
                    </button>
                  </div>
                  {emailDeliveryStatus === "sent" && (
                    <p className="text-[11px] font-medium text-emerald-700">
                      E-mail envoyé avec succès à {selectedUser.email}.
                    </p>
                  )}
                  {emailDeliveryStatus === "failed" && (
                    <p className="text-[11px] font-medium text-amber-700">
                      Le serveur SMTP n'a pas répondu. Copiez et transmettez ce lien directement à l'utilisateur.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-stone-100 text-xs">
              <span className="text-stone-400">
                Inscrit le {new Date(selectedUser.created_at || Date.now()).toLocaleDateString("fr-FR")}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowUserModal(false);
                  handleEditUser(selectedUser.id);
                }}
                className="text-stone-700 hover:text-stone-950 font-semibold underline"
              >
                Édition complète du profil →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation de Suppression */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-7 h-7" />
              <h3 className="text-lg font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
              <span className="font-bold text-gray-900">
                {userToDelete.first_name} {userToDelete.last_name}
              </span>{" "}
              ({userToDelete.email}) ?
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Changement de Rôle en Lot */}
      {showBulkRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Changer les Rôles en Lot</h3>
            <p className="text-xs text-gray-500">
              Appliquer un nouveau rôle à {selectedUsers.length} utilisateur(s) sélectionné(s).
            </p>

            <select
              value={newBulkRole}
              onChange={(e) => setNewBulkRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold bg-white"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {getRoleDisplayName(r)}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setShowBulkRoleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmBulkRoleChange}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
