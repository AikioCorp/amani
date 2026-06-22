import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { uploadAvatar } from "../lib/avatar";
import { AuthService } from "../services/supabase";
import {
  Save,
  User,
  Mail,
  Building,
  Phone,
  MapPin,
  FileText,
  Camera,
  Loader2,
  Lock,
  Globe,
  Settings,
  Bell,
  Check,
  BarChart3,
  Activity,
  Eye,
  Shield,
  Key,
  EyeOff,
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    phone: "",
    location: "",
    bio: "",
    avatarUrl: "",
  });


  const [activeTab, setActiveTab] = useState("general");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        avatarUrl: user.avatarUrl || "",
        organization: user.organization || "",
      }));
    }
  }, [user]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      if (user.id) {
        console.group("[Profile] Fetch profile");
        console.log("user.id:", user.id);
        try {
          const data = await AuthService.getProfile(user.id);
          if (data) {
            console.log("[Profile] Fetch success. Received:", {
              id: data.id,
              first_name: data.first_name,
              last_name: data.last_name,
              country: data.country,
            });
            setProfileData({
              firstName: String(data.first_name ?? ""),
              lastName: String(data.last_name ?? ""),
              email: String(user.email ?? ""),
              organization: String(data.organization ?? ""),
              phone: String(data.phone ?? ""),
              location: String(data.location ?? ""),
              bio: String(data.bio ?? ""),
              avatarUrl: String(data.avatar_url ?? ""),
            });
          }
        } catch (err: any) {
          console.error("[Profile] Fetch error:", err);
        }
        console.groupEnd();
      }
    };

    fetchProfile();

    if (user?.id) {
      const savedPreferences = localStorage.getItem(
        `user_preferences_${user.id}`,
      );
      if (savedPreferences) {
        try {
          const parsedPreferences = JSON.parse(savedPreferences);
          setPreferences(parsedPreferences);
        } catch (err) {
          console.error("Erreur lors du parsing des préférences:", err);
        }
      }
    }
  }, [user?.id, user?.email]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      console.group("[Profile] Update avatar");
      const t0 = performance.now();
      console.log("user.id:", user.id, "file:", { name: file.name, size: file.size, type: file.type });
      setIsSaving(true);
      const avatarUrl = await uploadAvatar(user.id, file);

      // Mettre à jour l'état local
      setProfileData((prev) => ({
        ...prev,
        avatarUrl,
      }));

      // Mettre à jour le contexte d'authentification
      if (user) {
        user.avatarUrl = avatarUrl;
      }

      // Persister via l'API
      let avatarUpdateError = null;
      try {
        await AuthService.updateProfile(user.id, { avatar_url: avatarUrl });
        console.log("[Profile] Avatar update success. avatar_url:", avatarUrl);
      } catch (err) {
        avatarUpdateError = err;
        console.error("[Profile] Avatar update error:", err);
      }

      if (avatarUpdateError) {
        console.error("[Profile] Avatar upsert error:", {
          message: avatarUpdateError.message,
          details: (avatarUpdateError as any).details,
          hint: (avatarUpdateError as any).hint,
          code: (avatarUpdateError as any).code,
        });
      } else {
        console.log("[Profile] Avatar upsert success. avatar_url:", avatarUrl);
      }

      success(
        "Avatar mis à jour",
        "Votre photo de profil a été mise à jour avec succès.",
      );
      console.log(`[Profile] Update avatar done in ${(performance.now() - t0).toFixed(1)}ms`);
      console.groupEnd();
    } catch (err) {
      console.error("Erreur lors du téléchargement de l'avatar:", err);
      error(
        "Erreur",
        "Une erreur est survenue lors du téléchargement de l'avatar.",
      );
      console.groupEnd();
    } finally {
      setIsSaving(false);
    }
  };

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
    weeklyDigest: true,
    instantAlerts: false,
    language: "fr",
    timezone: "Africa/Bamako",
    theme: "light",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveProfile = async () => {
    if (!user?.id) {
      error("Erreur", "Utilisateur non connecté.");
      return;
    }

    try {
      console.group("[Profile] Save profile");
      const t0 = performance.now();
      console.log("user.id:", user.id);
      setIsSaving(true);

      const profileUpdates = {
        email: profileData.email || user.email || "",
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        organization: profileData.organization,
        phone: profileData.phone,
        location: profileData.location, // use 'location' column in DB
        bio: profileData.bio,
        updated_at: new Date().toISOString(),
      };

      const requestId = Math.random().toString(36).slice(2, 8);
      console.log(`[Profile] Upserting payload (req:${requestId}):`, profileUpdates);

      // Mettre à jour le profil via l'API
      let updateError: any | null = null;
      try {
        await AuthService.updateProfile(user.id, profileUpdates);
      } catch (err: any) {
        updateError = err;
      }

      if (updateError) {
        console.error("[Profile] Update error:", updateError);
        error("Erreur", `Erreur de sauvegarde: ${updateError.message || updateError}`);
        console.groupEnd();
        return;
      }

      console.log("[Profile] Upsert success.");

      // Mettre à jour l'état local à partir du payload envoyé
      setProfileData((prev) => ({
        ...prev,
        email: profileUpdates.email || prev.email,
        firstName: profileUpdates.first_name || "",
        lastName: profileUpdates.last_name || "",
        organization: profileUpdates.organization || "",
        phone: profileUpdates.phone || "",
        location: profileUpdates.location || "",
        bio: profileUpdates.bio || "",
      }));

      // Mettre à jour l'email si nécessaire via l'API
      if (profileData.email !== user.email) {
        console.log("[Profile] Updating auth email from", user.email, "to", profileData.email);
        try {
          await AuthService.updateProfile(user.id, { email: profileData.email });
          user.email = profileData.email; // Mettre à jour localement
        } catch (err: any) {
          console.error("Erreur lors de la mise à jour de l'email:", err);
          error(
            "Erreur",
            err.message || "Une erreur est survenue lors de la mise à jour de l'email.",
          );
          return;
        }
      }

      success(
        "Profil mis à jour",
        "Vos informations ont été sauvegardées avec succès.",
      );
      console.log(`[Profile] Save done in ${(performance.now() - t0).toFixed(1)}ms`);
      console.groupEnd();
    } catch (error) {
      console.error("Erreur inattendue:", error);
      // Gérer les erreurs inattendues
      console.groupEnd();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user?.id) {
      error("Erreur", "Utilisateur non connecté.");
      return;
    }

    try {
      setIsSaving(true);

      // Sauvegarder les préférences en localStorage pour l'instant
      // TODO: Ajouter une colonne preferences JSONB à la table profiles ou créer une table user_preferences
      localStorage.setItem(
        `user_preferences_${user.id}`,
        JSON.stringify(preferences),
      );

      success(
        "Préférences mises à jour",
        "Vos préférences ont été sauvegardées avec succès.",
      );
    } catch (err) {
      console.error("Erreur lors de la sauvegarde des préférences:", err);
      error("Erreur", "Une erreur inattendue est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      error("Erreur", "Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    try {
      setIsSaving(true);

      // Changer le mot de passe via l'API
      try {
        await AuthService.updateProfile(user.id, { password: passwordData.newPassword });
      } catch (err: any) {
        console.error("Erreur lors du changement de mot de passe:", err);
        error(
          "Erreur",
          err.message || "Une erreur est survenue lors du changement de mot de passe.",
        );
        return;
      }

      success(
        "Mot de passe mis à jour",
        "Votre mot de passe a été changé avec succès.",
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Erreur lors du changement de mot de passe:", err);
      error("Erreur", "Une erreur inattendue est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    {
      label: "Articles publiés",
      value: "23",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Analyses créées",
      value: "15",
      icon: BarChart3,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Connexions ce mois",
      value: "47",
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Vues générées",
      value: "12.4k",
      icon: Eye,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ];

  const tabs = [
    { id: "personal", label: "Informations personnelles", icon: User },
    { id: "preferences", label: "Préférences", icon: Settings },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "activity", label: "Activité", icon: Activity },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
        <h1 className="text-2xl font-bold text-amani-primary">Mon profil</h1>
        <p className="text-gray-600 mt-1">Gérez vos informations personnelles et préférences</p>
      </div>
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
          <div className="flex items-center gap-6">
            <div className="relative">
              {profileData.avatarUrl ? (
                <img
                  src={profileData.avatarUrl}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 bg-amani-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
              )}
              <button
                type="button"
                onClick={handleAvatarClick}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-amani-primary transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-amani-primary mb-1">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-600 mb-2">{user?.email}</p>
              <div className="flex flex-wrap gap-2">
                {user?.roles?.map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 bg-amani-secondary/20 text-amani-primary rounded-full text-sm"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

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

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-white/50 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-amani-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-white/50 p-6">
              {activeTab === "personal" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-amani-primary">
                      Informations personnelles
                    </h2>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organisation
                      </label>
                      <input
                        type="text"
                        value={profileData.organization}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            organization: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Localisation
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            location: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biographie
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                      placeholder="Parlez-nous de vous..."
                    />
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-amani-primary">
                      Préférences
                    </h2>
                    <button
                      onClick={handleSavePreferences}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Langue
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            language: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fuseau horaire
                      </label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            timezone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                      >
                        <option value="Africa/Bamako">Africa/Bamako</option>
                        <option value="Africa/Ouagadougou">
                          Africa/Ouagadougou
                        </option>
                        <option value="Africa/Niamey">Africa/Niamey</option>
                        <option value="Africa/Ndjamena">Africa/Ndjamena</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Notifications
                    </h3>
                    {[
                      {
                        key: "emailNotifications",
                        label: "Notifications par email",
                      },
                      { key: "pushNotifications", label: "Notifications push" },
                      { key: "marketingEmails", label: "Emails marketing" },
                      { key: "securityAlerts", label: "Alertes de sécurité" },
                      { key: "weeklyDigest", label: "Résumé hebdomadaire" },
                      { key: "instantAlerts", label: "Alertes instantanées" },
                    ].map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {setting.label}
                          </h4>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              preferences[
                                setting.key as keyof typeof preferences
                              ] as boolean
                            }
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                [setting.key]: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amani-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amani-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-amani-primary">
                      Sécurité
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Changer le mot de passe
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe actuel
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  currentPassword: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                            />
                            <button
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nouveau mot de passe
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  newPassword: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                            />
                            <button
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showNewPassword ? (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmer le nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={handleChangePassword}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-4 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors disabled:opacity-50"
                        >
                          <Key className="w-4 h-4" />
                          {isSaving
                            ? "Mise à jour..."
                            : "Changer le mot de passe"}
                        </button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Sessions actives
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Session actuelle
                            </h4>
                            <p className="text-sm text-gray-600">
                              Bamako, Mali • Il y a 5 minutes
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Actuelle
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "activity" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-amani-primary">
                    Activité récente
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        action: "Article publié",
                        description: "Évolution du FCFA face à l'Euro en 2024",
                        time: "Il y a 2 heures",
                        icon: FileText,
                      },
                      {
                        action: "Profil mis à jour",
                        description: "Informations personnelles modifiées",
                        time: "Il y a 1 jour",
                        icon: User,
                      },
                      {
                        action: "Connexion",
                        description: "Connexion depuis Bamako, Mali",
                        time: "Il y a 2 jours",
                        icon: Shield,
                      },
                      {
                        action: "Analyse créée",
                        description: "Rapport économique Q4 2024",
                        time: "Il y a 3 jours",
                        icon: BarChart3,
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="p-2 bg-white rounded-lg">
                          <activity.icon className="w-4 h-4 text-amani-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {activity.action}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
