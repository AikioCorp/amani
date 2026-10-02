import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { API_BASE_URL } from "../services/apiConfig";
import { getSessionToken } from "../services/authService";
import { adminCache } from "../services/adminCache";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Building,
  Shield,
  Crown,
  CheckCircle,
  Loader2,
  Lock,
  X,
  FileText,
} from "lucide-react";

export default function EditUser() {
  const { userId } = useParams();
  const { user, hasPermission } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const passedUser = location.state?.user;

  const [loading, setLoading] = useState(!passedUser);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    first_name: passedUser?.first_name || "",
    last_name: passedUser?.last_name || "",
    email: passedUser?.email || "",
    phone: passedUser?.phone || "",
    organization: passedUser?.organization || "",
    role: passedUser?.role || passedUser?.roles?.[0] || "subscriber",
    is_premium: Boolean(passedUser?.is_premium),
    is_active: passedUser?.is_active !== undefined ? Boolean(passedUser?.is_active) : true,
    bio: passedUser?.bio || "",
  });

  // Vérification des autorisations
  if (!user || !hasPermission("manage_users")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 max-w-md text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Accès Refusé</h2>
          <p className="text-sm text-gray-500">
            Vous n'avez pas les autorisations requises pour modifier les utilisateurs.
          </p>
          <Link
            to="/dashboard/users"
            className="inline-block bg-gray-900 text-white font-bold px-6 py-3 rounded-xl text-xs hover:bg-black transition-all"
          >
            Retour aux utilisateurs
          </Link>
        </div>
      </div>
    );
  }

  // Synchronisation direct avec l'API
  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    const fetchUser = async () => {
      if (!passedUser) setLoading(true);
      try {
        const token = getSessionToken();
        const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();

        if (isMounted && res.ok && json.success && json.data) {
          const u = json.data;
          setFormData({
            first_name: u.first_name || "",
            last_name: u.last_name || "",
            email: u.email || "",
            phone: u.phone || "",
            organization: u.organization || "",
            role: u.role || "subscriber",
            is_premium: Boolean(u.is_premium),
            is_active: u.is_active !== undefined ? Boolean(u.is_active) : true,
            bio: u.bio || "",
          });
        }
      } catch (err) {
        console.error("Erreur de chargement utilisateur:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [userId, passedUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);
    try {
      const token = getSessionToken();
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch (e) {}

      if (res.ok && json?.success) {
        adminCache.invalidate("users_list");
        success(
          "Profil mis à jour !",
          `Les modifications apportées à ${formData.first_name || formData.email} ont été enregistrées.`
        );
        navigate("/dashboard/users");
      } else {
        const errorMsg = json?.error || (json?.details && json.details[0]?.message) || `Erreur serveur (${res.status})`;
        error("Erreur de modification", errorMsg);
      }
    } catch (err: any) {
      error("Erreur réseau", err.message || "Impossible de contacter le serveur.");
    } finally {
      setIsSaving(false);
    }
  };

  // Skeleton screen de chargement
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-7 w-56 bg-gray-300 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header avec Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <Link
            to="/dashboard/users"
            className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1.5 mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux Utilisateurs
          </Link>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-amber-600" /> Édition de l'Utilisateur
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/users")}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Formulaire Unique & Réel */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-base font-extrabold text-gray-900">Informations Générales</h2>
          <p className="text-xs text-gray-500">Données réelles enregistrées dans la base de données Amani.</p>
        </div>

        {/* Champs Prénom & Nom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" /> Prénom
            </label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" /> Nom de famille
            </label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Email, Téléphone & Organisation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" /> Adresse E-mail *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-gray-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" /> Téléphone / WhatsApp
            </label>
            <input
              type="tel"
              placeholder="+223..."
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-gray-400" /> Organisation / Société
            </label>
            <input
              type="text"
              placeholder="Ex: Banque Centrale / Société X"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Rôle & Options de Compte */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-600" /> Rôle d'Accès Système *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="subscriber">Abonné / Utilisateur classique</option>
                <option value="analyst">Analyste financier</option>
                <option value="editor">Éditeur de contenu</option>
                <option value="moderator">Modérateur</option>
                <option value="admin">Administrateur système</option>
              </select>
            </div>

            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <input
                  type="checkbox"
                  checked={formData.is_premium}
                  onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-xs font-extrabold text-amber-900">
                  Accorder le Pass Premium Amani
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-gray-700">Compte Actif (Décocher pour suspendre)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" /> Bio / Présentation
            </label>
            <textarea
              rows={3}
              placeholder="Notes confidentielles ou bio de l'utilisateur..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Actions du Bas */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate("/dashboard/users")}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-400" /> Enregistrer le Profil
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
