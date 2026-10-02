import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUsers } from "../hooks/useUsers";
import { getRoleDisplayName } from "../lib/demoAccounts";
import DashboardLayout from "../components/DashboardLayout";
import {
  ArrowLeft,
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
  Copy,
  Check,
  Key,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

export default function NewUser() {
  const { user, hasPermission } = useAuth();
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
    role: "visiteur",
    organization: "",
    country: "",
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
  if (!user || !hasPermission("manage_users")) {
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
          <Link
            to="/dashboard"
            className="bg-amani-primary text-white px-6 py-2 rounded-lg hover:bg-amani-primary/90 transition-colors"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </DashboardLayout>
    );
  }

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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSectorToggle = (sector: string) => {
    setFormData((prev) => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter((s) => s !== sector)
        : [...prev.sectors, sector],
    }));
  };

  const handleCountryToggle = (country: string) => {
    setFormData((prev) => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter((c) => c !== country)
        : [...prev.countries, country],
    }));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { createUser } = useUsers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // For generated password method, ensure password is generated
    if (formData.passwordMethod === "generate" && !formData.generatedPassword) {
      setErrors((prev) => ({ ...prev, generatedPassword: "Veuillez générer un mot de passe avant de créer l'utilisateur." }));
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.passwordMethod === "generate" ? formData.generatedPassword : "EMAIL_SETUP",
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        organization: formData.organization,
        phone: "",
        is_premium: formData.role === "abonne",
        is_active: true,
      };

      const result = await createUser(payload);

      setCreatedUserModal({
        email: formData.email.trim(),
        fullName: `${formData.firstName} ${formData.lastName}`.trim() || formData.email,
        role: formData.role,
        passwordMethod: formData.passwordMethod,
        tempPassword: result?.generatedPassword || formData.generatedPassword,
      });

      setIsSaving(false);
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, submit: err.message || "Impossible de créer l'utilisateur." }));
      setIsSaving(false);
    }
  };

  const roles = [
    {
      value: "visiteur",
      name: "Visiteur",
      description: "Accès public uniquement",
    },
    {
      value: "abonne",
      name: "Abonné Premium",
      description: "Contenu premium et alertes",
    },
    {
      value: "moderateur",
      name: "Modérateur",
      description: "Modération de contenu",
    },
    {
      value: "analyste",
      name: "Analyste",
      description: "Gestion des indices économiques",
    },
    {
      value: "editeur",
      name: "Éditeur",
      description: "Création d'articles et podcasts",
    },
    { value: "admin", name: "Administrateur", description: "Accès complet" },
  ];

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

  return (
    <DashboardLayout
      title="Nouvel utilisateur"
      subtitle="Créer un nouveau compte utilisateur sur la plateforme Amani"
    >
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            to="/dashboard/users"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la gestion des utilisateurs
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Personal Information */}
          <div className="bg-white border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
              <User className="w-6 h-6 text-gray-900" />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">
                Informations personnelles
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors ${
                    errors.firstName ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="PRÉNOM"
                />
                {errors.firstName && (
                  <p className="mt-2 text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors ${
                    errors.lastName ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="NOM"
                />
                {errors.lastName && (
                  <p className="mt-2 text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-8 pr-0 py-3 border-0 border-b-2 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors ${
                      errors.email ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="EMAIL@EXEMPLE.COM"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Organisation
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-0 py-3 border-0 border-b-2 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors border-gray-200"
                    placeholder="NOM DE L'ORGANISATION"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="bg-white border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
              <Lock className="w-6 h-6 text-gray-900" />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">
                Configuration du mot de passe
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Méthode de configuration
                </label>
                <div className="space-y-4">
                  <div
                    className={`border p-6 cursor-pointer transition-all ${
                      formData.passwordMethod === "email"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-900/50"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        passwordMethod: "email",
                        generatedPassword: "",
                      }))
                    }
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="passwordMethod"
                        value="email"
                        checked={formData.passwordMethod === "email"}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 cursor-pointer"
                      />
                      <div>
                        <div className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest text-sm">
                          <Mail className="w-4 h-4" />
                          Envoyer un email de configuration
                        </div>
                        <div className="text-sm font-medium text-gray-500 mt-2">
                          L'utilisateur recevra un email avec un lien pour
                          définir son mot de passe lors de sa première
                          connexion.
                        </div>
                        <div className="mt-3 text-xs font-bold uppercase tracking-widest text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Recommandé - Plus sécurisé
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border p-6 cursor-pointer transition-all ${
                      formData.passwordMethod === "generate"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-900/50"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        passwordMethod: "generate",
                      }))
                    }
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="passwordMethod"
                        value="generate"
                        checked={formData.passwordMethod === "generate"}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest text-sm">
                          <Lock className="w-4 h-4" />
                          Générer un mot de passe temporaire
                        </div>
                        <div className="text-sm font-medium text-gray-500 mt-2">
                          Un mot de passe temporaire sera généré
                          automatiquement. L'utilisateur devra le changer lors
                          de sa première connexion.
                        </div>

                        {formData.passwordMethod === "generate" && (
                          <div className="mt-6 space-y-4">
                            <button
                              type="button"
                              onClick={handleGeneratePassword}
                              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white hover:bg-black transition-colors text-sm font-bold uppercase tracking-widest"
                            >
                              <Lock className="w-4 h-4" />
                              {formData.generatedPassword
                                ? "Régénérer"
                                : "Générer"}{" "}
                              un mot de passe
                            </button>

                            {formData.generatedPassword && (
                              <div className="bg-gray-50 border border-gray-200 p-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                                  Mot de passe généré
                                </label>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 relative">
                                    <input
                                      type={showPassword ? "text" : "password"}
                                      value={formData.generatedPassword}
                                      readOnly
                                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none text-sm font-mono focus:ring-0 focus:border-gray-900"
                                    />
                                    <button
                                      type="button"
                                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                      onClick={() =>
                                        setShowPassword(!showPassword)
                                      }
                                    >
                                      {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-900" />
                                      ) : (
                                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-900" />
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
                                    className="px-6 py-3 border border-gray-200 bg-white text-gray-900 font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors"
                                  >
                                    Copier
                                  </button>
                                </div>
                                <div className="mt-3 text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  Assurez-vous de communiquer ce mot de passe de
                                  manière sécurisée à l'utilisateur
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

              {/* Additional Security Options */}
              <div className="border-t border-gray-200 pt-8 mt-8">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
                  Options de sécurité
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={true}
                      readOnly
                      className="h-5 w-5 text-gray-900 focus:ring-gray-900 border-gray-300 rounded-none cursor-pointer"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Forcer le changement de mot de passe à la première connexion
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.passwordMethod === "email"}
                      readOnly
                      className="h-5 w-5 text-gray-900 focus:ring-gray-900 border-gray-300 rounded-none cursor-pointer"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Envoyer les instructions de connexion par email
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role and Permissions */}
          <div className="bg-white border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
              <Shield className="w-6 h-6 text-gray-900" />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">
                Rôle et permissions
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
                  Rôle utilisateur *
                </label>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roles.map((role) => (
                    <div
                      key={role.value}
                      className={`border p-6 cursor-pointer transition-all ${
                        formData.role === role.value
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-900/50"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, role: role.value }))
                      }
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={handleInputChange}
                          className="mt-0.5 h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 cursor-pointer"
                        />
                        <div>
                          <div className="font-black text-gray-900 text-sm uppercase tracking-widest mb-2">
                            {role.name}
                          </div>
                          <div className="text-xs font-medium text-gray-500">
                            {role.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white border border-gray-200 p-8">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-8 border-b border-gray-200 pb-4">
              Préférences
            </h2>

            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Secteurs d'intérêt
                </label>
                <div className="flex flex-wrap gap-3">
                  {sectors.map((sector) => (
                    <button
                      key={sector}
                      type="button"
                      onClick={() => handleSectorToggle(sector)}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${
                        formData.sectors.includes(sector)
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-900"
                      }`}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Pays suivis
                </label>
                <div className="flex flex-wrap gap-3">
                  {countries.map((country) => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => handleCountryToggle(country)}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${
                        formData.countries.includes(country)
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-900"
                      }`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-gray-900 focus:ring-gray-900 border-gray-300 rounded-none cursor-pointer"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    Abonner à la newsletter hebdomadaire
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="alerts"
                    checked={formData.alerts}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-gray-900 focus:ring-gray-900 border-gray-300 rounded-none cursor-pointer"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    Activer les alertes personnalisées
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sendWelcomeEmail"
                    checked={formData.sendWelcomeEmail}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-gray-900 focus:ring-gray-900 border-gray-300 rounded-none cursor-pointer"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    Envoyer un email de bienvenue
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 justify-end pt-4">
            <Link
              to="/dashboard/users"
              className="px-8 py-4 border border-gray-200 text-gray-700 font-bold uppercase tracking-widest text-sm hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  CRÉATION...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  CRÉER L'UTILISATEUR
                </>
              )}
            </button>
          </div>
        </form>
      </div>

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
