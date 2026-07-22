import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
} from "lucide-react";

export default function NewUser() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // For generated password method, ensure password is generated
    if (formData.passwordMethod === "generate" && !formData.generatedPassword) {
      alert("Veuillez générer un mot de passe avant de créer l'utilisateur.");
      return;
    }

    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newUser = {
      id: `user-${Date.now()}`,
      ...formData,
      password:
        formData.passwordMethod === "generate"
          ? formData.generatedPassword
          : "EMAIL_SETUP",
      lastLogin: "Jamais connecté",
      mustChangePassword: true,
      accountStatus:
        formData.passwordMethod === "email" ? "pending_setup" : "active",
      createdAt: new Date().toISOString(),
      createdBy: `${user.firstName} ${user.lastName}`,
    };

    console.log("Creating new user:", newUser);

    // Show success message based on password method
    if (formData.passwordMethod === "email") {
      alert(
        `Utilisateur créé avec succès ! Un email de configuration a été envoyé à ${formData.email}`,
      );
    } else {
      alert(
        `Utilisateur créé avec succès ! Mot de passe temporaire : ${formData.generatedPassword}`,
      );
    }

    setIsSaving(false);
    navigate("/dashboard/users");
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
    </DashboardLayout>
  );
}
