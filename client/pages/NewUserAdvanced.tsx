import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useUsers } from "../hooks/useUsers";
import DashboardLayout from "../components/DashboardLayout";
import { ALL_PERMISSIONS } from "../lib/demoAccounts";
import {
  Save,
  User,
  Mail,
  Lock,
  Building,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Settings,
  Copy,
  Check,
  Key,
  Sparkles,
} from "lucide-react";

export default function NewUserAdvanced() {
  const { user, hasPermission } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdUserModal, setCreatedUserModal] = useState<{
    email: string;
    fullName: string;
    role: string;
    passwordMethod: string;
    tempPassword?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    country: "",
    roles: [] as string[],
    customPermissions: [] as string[],
    sectors: [] as string[],
    countries: [] as string[],
    newsletter: false,
    alerts: false,
    sendWelcomeEmail: true,
    passwordMethod: "email", // "email" or "generate"
    generatedPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check permissions
  if (!user || !hasPermission("create_users")) {
    return (
      <DashboardLayout title="Accès refusé">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-amani-primary mb-4">
            Accès refusé
          </h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour créer des
            utilisateurs.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const availableRoles = [
    {
      id: "admin",
      name: "Administrateur",
      description: "Accès complet à toutes les fonctionnalités",
      permissions: Object.keys(ALL_PERMISSIONS),
      color: "bg-red-100 text-red-800 border-red-200",
    },
    {
      id: "editeur",
      name: "Éditeur",
      description: "Création et gestion de contenu",
      permissions: [
        "create_articles",
        "edit_articles",
        "publish_articles",
        "create_podcasts",
        "edit_podcasts",
        "publish_podcasts",
        "manage_categories",
        "view_analytics",
      ],
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      id: "analyste",
      name: "Analyste",
      description: "Gestion des données économiques",
      permissions: [
        "create_indices",
        "edit_indices",
        "publish_indices",
        "view_indices",
        "export_indices",
        "create_economic_reports",
        "view_analytics",
        "view_detailed_analytics",
      ],
      color: "bg-green-100 text-green-800 border-green-200",
    },
    {
      id: "moderateur",
      name: "Modérateur",
      description: "Modération de contenu et utilisateurs",
      permissions: [
        "moderate_comments",
        "review_content",
        "manage_user_reports",
        "view_content_stats",
        "ban_users",
        "view_user_activity",
      ],
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    {
      id: "abonne",
      name: "Abonné Premium",
      description: "Accès au contenu premium",
      permissions: [
        "view_premium_content",
        "save_favorites",
        "create_alerts",
        "download_reports",
        "access_podcast_archives",
      ],
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
  ];

  const permissionCategories = {
    content: {
      name: "Contenu",
      permissions: [
        "create_articles",
        "edit_articles",
        "delete_articles",
        "publish_articles",
        "create_podcasts",
        "edit_podcasts",
        "delete_podcasts",
        "publish_podcasts",
        "manage_categories",
      ],
    },
    analytics: {
      name: "Analytics & Rapports",
      permissions: [
        "view_analytics",
        "view_detailed_analytics",
        "export_data",
        "create_economic_reports",
        "access_admin_reports",
      ],
    },
    indices: {
      name: "Indices économiques",
      permissions: [
        "create_indices",
        "edit_indices",
        "delete_indices",
        "view_indices",
        "export_indices",
        "publish_indices",
      ],
    },
    moderation: {
      name: "Modération",
      permissions: [
        "moderate_comments",
        "review_content",
        "manage_user_reports",
        "view_content_stats",
        "ban_users",
      ],
    },
    users: {
      name: "Gestion utilisateurs",
      permissions: [
        "manage_users",
        "create_users",
        "edit_user_profiles",
        "delete_users",
        "view_user_activity",
        "manage_user_roles",
      ],
    },
    system: {
      name: "Système",
      permissions: [
        "system_settings",
        "manage_permissions",
        "access_logs",
        "backup_system",
        "manage_integrations",
      ],
    },
  };

  const sectors = [
    "Marché financier",
    "Économie régionale",
    "Industrie minière",
    "Agriculture",
    "Investissement",
    "Technologie",
    "Politique monétaire",
    "Commerce international",
  ];

  const countries = [
    "Mali",
    "Burkina Faso",
    "Niger",
    "Tchad",
    "Mauritanie",
    "Sénégal",
    "UEMOA",
    "Tous",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter((r) => r !== roleId)
        : [...prev.roles, roleId],
    }));
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      customPermissions: prev.customPermissions.includes(permission)
        ? prev.customPermissions.filter((p) => p !== permission)
        : [...prev.customPermissions, permission],
    }));
  };

  const getAllPermissions = () => {
    const rolePermissions = formData.roles.flatMap((roleId) => {
      const role = availableRoles.find((r) => r.id === roleId);
      return role ? role.permissions : [];
    });
    return [...new Set([...rolePermissions, ...formData.customPermissions])];
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData((prev) => ({
      ...prev,
      generatedPassword: newPassword,
      passwordMethod: "generate",
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }
    if (
      formData.roles.length === 0 &&
      formData.customPermissions.length === 0
    ) {
      newErrors.roles = "Au moins un rôle ou une permission est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { createUser } = useUsers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      error(
        "Erreur de validation",
        "Veuillez corriger les erreurs dans le formulaire.",
      );
      return;
    }

    if (formData.passwordMethod === "generate" && !formData.generatedPassword) {
      error(
        "Erreur",
        "Veuillez générer un mot de passe avant de créer l'utilisateur.",
      );
      return;
    }

    setIsSaving(true);

    try {
      const primaryRole = formData.roles[0] || "subscriber";
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.passwordMethod === "generate" ? formData.generatedPassword : "EMAIL_SETUP",
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: primaryRole,
        organization: formData.organization,
        phone: "",
        is_premium: formData.roles.includes("abonne"),
        is_active: true,
      };

      const result = await createUser(payload);

      setCreatedUserModal({
        email: formData.email.trim(),
        fullName: `${formData.firstName} ${formData.lastName}`.trim() || formData.email,
        role: primaryRole,
        passwordMethod: formData.passwordMethod,
        tempPassword: result?.generatedPassword || formData.generatedPassword,
      });

      setIsSaving(false);
    } catch (err: any) {
      error("Erreur de création", err.message || "Impossible de créer l'utilisateur.");
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Nouvel utilisateur"
      subtitle="Créer un nouveau compte utilisateur avec des rôles et permissions personnalisés"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-white/50">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-amani-primary" />
            <h2 className="text-xl font-semibold text-amani-primary">
              Informations personnelles
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent ${
                  errors.firstName ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Prénom"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent ${
                  errors.lastName ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Nom"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.lastName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="email@exemple.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organisation
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                  placeholder="Nom de l'organisation"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Roles Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-white/50">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-amani-primary" />
            <h2 className="text-xl font-semibold text-amani-primary">
              Rôles et permissions
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Sélectionner les rôles *
              </label>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRoles.map((role) => (
                  <div
                    key={role.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.roles.includes(role.id)
                        ? `${role.color} border-2`
                        : "border-gray-200 hover:border-amani-primary/50"
                    }`}
                    onClick={() => handleRoleToggle(role.id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                        className="mt-1 h-4 w-4 text-amani-primary focus:ring-amani-primary border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {role.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {role.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {role.permissions.length} permission(s)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.roles && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.roles}
                </p>
              )}
            </div>

            {/* Custom Permissions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Permissions personnalisées (optionnel)
              </h3>
              <div className="space-y-4">
                {Object.entries(permissionCategories).map(([key, category]) => (
                  <div
                    key={key}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      {category.name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {category.permissions.map((permission) => {
                        const isIncluded =
                          getAllPermissions().includes(permission);
                        const isFromRole = formData.roles.some((roleId) => {
                          const role = availableRoles.find(
                            (r) => r.id === roleId,
                          );
                          return role?.permissions.includes(permission);
                        });

                        return (
                          <label
                            key={permission}
                            className={`flex items-center gap-2 text-sm p-2 rounded ${
                              isFromRole ? "bg-green-50 text-green-800" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.customPermissions.includes(
                                permission,
                              )}
                              onChange={() =>
                                handlePermissionToggle(permission)
                              }
                              disabled={isFromRole}
                              className="h-4 w-4 text-amani-primary focus:ring-amani-primary border-gray-300 rounded"
                            />
                            <span
                              className={
                                isFromRole ? "font-medium" : "text-gray-700"
                              }
                            >
                              {
                                ALL_PERMISSIONS[
                                  permission as keyof typeof ALL_PERMISSIONS
                                ]
                              }
                            </span>
                            {isFromRole && (
                              <span className="text-xs text-green-600">
                                (inclus dans rôle)
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Permission Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Résumé des permissions
              </h4>
              <div className="text-sm text-gray-600">
                <div className="mb-2">
                  <strong>{formData.roles.length}</strong> rôle(s)
                  sélectionné(s)
                  {formData.roles.length > 0 && (
                    <span className="ml-2">({formData.roles.join(", ")})</span>
                  )}
                </div>
                <div className="mb-2">
                  <strong>{formData.customPermissions.length}</strong>{" "}
                  permission(s) personnalisée(s)
                </div>
                <div>
                  <strong>{getAllPermissions().length}</strong> permission(s)
                  totale(s)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-white/50">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-amani-primary" />
            <h2 className="text-xl font-semibold text-amani-primary">
              Configuration du mot de passe
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Méthode de configuration du mot de passe
              </label>
              <div className="space-y-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.passwordMethod === "email"
                      ? "border-amani-primary bg-amani-secondary/20"
                      : "border-gray-200 hover:border-amani-primary/50"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      passwordMethod: "email",
                      generatedPassword: "",
                    }))
                  }
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="passwordMethod"
                      value="email"
                      checked={formData.passwordMethod === "email"}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-amani-primary focus:ring-amani-primary"
                    />
                    <div>
                      <div className="font-medium text-amani-primary flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Envoyer un email de configuration
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        L'utilisateur recevra un email avec un lien pour définir
                        son mot de passe lors de sa première connexion.
                      </div>
                      <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Recommandé - Plus sécurisé
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.passwordMethod === "generate"
                      ? "border-amani-primary bg-amani-secondary/20"
                      : "border-gray-200 hover:border-amani-primary/50"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      passwordMethod: "generate",
                    }))
                  }
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="passwordMethod"
                      value="generate"
                      checked={formData.passwordMethod === "generate"}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-amani-primary focus:ring-amani-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-amani-primary flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Générer un mot de passe temporaire
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Un mot de passe temporaire sera généré automatiquement.
                        L'utilisateur devra le changer lors de sa première
                        connexion.
                      </div>

                      {formData.passwordMethod === "generate" && (
                        <div className="mt-4 space-y-3">
                          <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="flex items-center gap-2 px-4 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors text-sm"
                          >
                            <Lock className="w-4 h-4" />
                            {formData.generatedPassword
                              ? "Régénérer"
                              : "Générer"}{" "}
                            un mot de passe
                          </button>

                          {formData.generatedPassword && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mot de passe généré :
                              </label>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 relative">
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.generatedPassword}
                                    readOnly
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono"
                                  />
                                  <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigator.clipboard.writeText(
                                      formData.generatedPassword,
                                    )
                                  }
                                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                                >
                                  Copier
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 justify-end">
          <Link
            to="/dashboard/users"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Création...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Créer l'utilisateur
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modern Success Modal */}
      {createdUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Header Banner */}
            <div className="bg-[#373B3A] text-white p-6 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#9C8464]/20 border border-[#9C8464]/40 rounded-full text-xs font-bold text-[#9C8464] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#9C8464]" /> Compte Utilisateur Créé
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight">Compte créé avec succès !</h3>
              <p className="text-xs text-gray-300 mt-1">L'utilisateur a été enregistré dans la base de données Amani.</p>
            </div>

            {/* Body Content */}
            <div className="p-6 space-y-6">
              {/* User Summary Card */}
              <div className="bg-[#FDFBF9] border border-[#E5DDD5] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Identité</span>
                  <span className="px-2.5 py-0.5 bg-[#373B3A] text-[#9C8464] rounded-full text-[11px] font-extrabold uppercase">
                    {createdUserModal.role}
                  </span>
                </div>
                <div>
                  <div className="text-base font-extrabold text-[#373B3A]">{createdUserModal.fullName}</div>
                  <div className="text-xs text-gray-500 font-medium">{createdUserModal.email}</div>
                </div>
              </div>

              {/* Password / Credentials Box */}
              {createdUserModal.passwordMethod === "generate" && createdUserModal.tempPassword ? (
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-[#373B3A] uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-[#9C8464]" /> Mot de passe temporaire généré
                  </label>
                  <div className="flex items-center justify-between p-3.5 bg-gray-900 text-white rounded-2xl font-mono text-sm font-bold border border-gray-800">
                    <span className="select-all tracking-wider text-[#9C8464]">
                      {createdUserModal.tempPassword}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(createdUserModal.tempPassword || "");
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9C8464] hover:bg-[#857053] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copier
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Veuillez transmettre ce mot de passe temporaire à l'utilisateur. Il pourra le modifier dès sa première connexion.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Email de configuration envoyé
                  </div>
                  <p className="text-emerald-700">
                    Un lien sécurisé pour définir son mot de passe a été envoyé à <strong>{createdUserModal.email}</strong>.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (createdUserModal.tempPassword) {
                      navigator.clipboard.writeText(createdUserModal.tempPassword);
                    }
                    setCreatedUserModal(null);
                    navigate("/dashboard/users");
                  }}
                  className="flex-1 py-3 px-4 bg-[#373B3A] hover:bg-black text-white rounded-xl text-xs font-extrabold uppercase tracking-wider text-center transition-all shadow-sm"
                >
                  Voir la liste des utilisateurs
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedUserModal(null);
                    setFormData((prev) => ({
                      ...prev,
                      firstName: "",
                      lastName: "",
                      email: "",
                      generatedPassword: "",
                    }));
                  }}
                  className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all"
                >
                  Créer un autre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
