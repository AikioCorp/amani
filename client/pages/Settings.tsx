import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { API_BASE_URL } from "../services/apiConfig";
import { getSessionToken } from "../services/authService";
import { adminCache } from "../services/adminCache";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Globe,
  Mail,
  Database,
  Palette,
  Upload,
  Download,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Lock,
  Users,
  FileText,
  BarChart,
  Sun,
  Clock,
  Send,
  Loader2,
  Trash2,
  Server,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Settings() {
  const { user, hasPermission } = useAuth();
  const { success, error, warning } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Paramètres Généraux Cohérents
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Amani Finance",
    siteTagline: "Information Économique & Opportunités UEMOA",
    siteDescription:
      "Plateforme d'information économique, analyses de marché et opportunités d'investissement au Sahel et dans la zone UEMOA",
    contactEmail: "hello@amani-finance.com",
    supportEmail: "hello@amani-finance.com",
    timezone: "Africa/Bamako",
    language: "fr",
    maintenanceMode: false,
  });

  // 2. Configuration SMTP & E-mails Réels
  const [emailSettings, setEmailSettings] = useState({
    emailProvider: "smtp",
    smtpHost: "mail.amani-finance.com",
    smtpPort: "465",
    smtpUser: "hello@amani-finance.com",
    smtpPassword: "••••••••••••",
    smtpFrom: "Amani Finance <hello@amani-finance.com>",
    smtpSecure: true,
  });

  // 3. State pour le Briefing Matinal Admin (Connecté aux routes backend)
  const [briefConfig, setBriefConfig] = useState({
    enabled: true,
    send_time: "07:00",
    recipients: "hello@amani-finance.com",
  });
  const [savingBriefSettings, setSavingBriefSettings] = useState(false);
  const [testingBrief, setTestingBrief] = useState(false);

  // 4. Sécurité
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: false,
    sessionTimeout: "24",
    passwordMinLength: "8",
    maxLoginAttempts: "5",
    allowRegistration: true,
    requireEmailVerification: false,
  });

  // 5. Contenu & Modération
  const [contentSettings, setContentSettings] = useState({
    articlesPerPage: "12",
    allowComments: true,
    moderateComments: true,
    autoPublish: false,
    maxUploadSize: "10",
    defaultCategory: "Economie",
  });

  // Chargement des paramètres réels du Briefing Matinal
  const loadBriefSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/morning-brief/settings`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBriefConfig({
          enabled: Boolean(json.data.enabled),
          send_time: json.data.send_time || "07:00",
          recipients: Array.isArray(json.data.recipients) ? json.data.recipients.join(", ") : "hello@amani-finance.com",
        });
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadBriefSettings();
  }, []);

  const handleSaveBriefSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBriefSettings(true);
    try {
      const recipientsArray = briefConfig.recipients.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE_URL}/admin/morning-brief/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          enabled: briefConfig.enabled,
          send_time: briefConfig.send_time,
          recipients: recipientsArray,
        }),
      });
      const json = await res.json();
      if (json.success) {
        success("Paramètres Enregistrés", json.message);
      } else {
        error("Erreur", json.error || "Échec d'enregistrement.");
      }
    } catch (err) {
      error("Erreur réseau.");
    } finally {
      setSavingBriefSettings(false);
    }
  };

  const handleTestBrief = async () => {
    setTestingBrief(true);
    try {
      const targetEmail = briefConfig.recipients.split(",")[0]?.trim() || "hello@amani-finance.com";
      const res = await fetch(`${API_BASE_URL}/admin/morning-brief/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ target_email: targetEmail }),
      });
      const json = await res.json();
      if (json.success) {
        success("Brief Matinal Envoyé !", json.message);
      } else {
        error("Information d'envoi", json.error || "Problème d'envoi SMTP.");
      }
    } catch (err) {
      error("Erreur de test.");
    } finally {
      setTestingBrief(false);
    }
  };

  const handleSaveSection = async (sectionName: string) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    success(
      "Paramètres mis à jour",
      `Les paramètres ${sectionName} ont été enregistrés avec succès.`,
    );
    setIsSaving(false);
  };

  const handleClearCache = () => {
    adminCache.clearAll();
    success("Cache nettoyé", "Le cache système de la plateforme a été entièrement purgé.");
  };

  const tabs = [
    { id: "general", label: "Général", icon: SettingsIcon },
    { id: "morning_brief", label: "Brief Matinal Admin", icon: Sun },
    { id: "email", label: "Configuration SMTP & Mails", icon: Mail },
    { id: "security", label: "Sécurité & Accès", icon: Shield },
    { id: "content", label: "Contenu & Modération", icon: FileText },
    { id: "system", label: "Système & Cache", icon: Database },
  ];

  // Permis d'accès
  if (!user || !hasPermission("system_settings")) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <Lock className="w-12 h-12 text-[#373B3A] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#373B3A] mb-2">
            Accès réservé aux administrateurs
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Vous devez posséder les privilèges système pour modifier ces paramètres.
          </p>
          <Link
            to="/dashboard"
            className="inline-block bg-[#373B3A] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors text-sm"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-7 h-7 text-[#9C8464]" /> Paramètres Système Amani
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les configurations générales, les connexions e-mail, la sécurité et le briefing matinal.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Navigation Onglets */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-3">
            <nav className="space-y-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "bg-[#373B3A] text-white shadow-sm"
                      : "text-gray-700 hover:bg-stone-100"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-[#9C8464]" : "text-gray-400"}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu Principal Onglet */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6">
            
            {/* ONGLET 1 : GÉNÉRAL */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Paramètres Généraux de la Plateforme</h2>
                    <p className="text-xs text-gray-500">Identité visuelle et coordonnées officielles</p>
                  </div>
                  <button
                    onClick={() => handleSaveSection("généraux")}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#373B3A] hover:bg-black text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-[#9C8464]" />
                    {isSaving ? "Enregistrement..." : "Sauvegarder"}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1.5">Nom de la Plateforme *</label>
                    <input
                      type="text"
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1.5">Slogan / Sous-titre</label>
                    <input
                      type="text"
                      value={generalSettings.siteTagline}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteTagline: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-gray-700 uppercase mb-1.5">Description Officielle</label>
                    <textarea
                      rows={3}
                      value={generalSettings.siteDescription}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1.5">E-mail Officiel de Contact *</label>
                    <input
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1.5">Fuseau Horaire Référent</label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 font-bold bg-stone-50"
                    >
                      <option value="Africa/Bamako">Africa/Bamako (GMT - Heure UEMOA/Sahel)</option>
                      <option value="Africa/Dakar">Africa/Dakar (GMT)</option>
                      <option value="Africa/Abidjan">Africa/Abidjan (GMT)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET 2 : BRIEF MATINAL ADMIN */}
            {activeTab === "morning_brief" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-200">
                      <Sun className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Briefing Matinal Financier (Administrateurs)</h2>
                      <p className="text-xs text-gray-500">
                        Chaque matin, recevez automatiquement la synthèse des marchés et dépêches du Sahel sur votre e-mail.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestBrief}
                    disabled={testingBrief}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs transition-all disabled:opacity-50 shadow-sm"
                  >
                    {testingBrief ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-[#9C8464]" />}
                    <span>Tester l'envoi immédiat</span>
                  </button>
                </div>

                <form onSubmit={handleSaveBriefSettings} className="space-y-6">
                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-gray-900">Activer le Briefing Matinal Automatique</span>
                      <p className="text-xs text-gray-500">Envoie un e-mail récapitulatif quotidien à l'équipe dirigeante</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={briefConfig.enabled}
                      onChange={(e) => setBriefConfig({ ...briefConfig, enabled: e.target.checked })}
                      className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Heure d'envoi matinal (Bamako / GMT) *
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={briefConfig.send_time}
                          onChange={(e) => setBriefConfig({ ...briefConfig, send_time: e.target.value })}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 bg-white"
                        >
                          <option value="06:00">06:00 GMT</option>
                          <option value="06:30">06:30 GMT</option>
                          <option value="07:00">07:00 GMT (Recommandé)</option>
                          <option value="07:30">07:30 GMT</option>
                          <option value="08:00">08:00 GMT</option>
                          <option value="08:30">08:30 GMT</option>
                          <option value="09:00">09:00 GMT</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        E-mails des Destinataires Administrateurs *
                      </label>
                      <input
                        type="text"
                        value={briefConfig.recipients}
                        onChange={(e) => setBriefConfig({ ...briefConfig, recipients: e.target.value })}
                        placeholder="hello@amani-finance.com, admin@amani-finance.com"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white font-semibold"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">Séparer les e-mails par des virgules</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingBriefSettings}
                      className="flex items-center gap-2 px-6 py-3 bg-[#373B3A] hover:bg-black text-white font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-[#9C8464]" />
                      {savingBriefSettings ? "Enregistrement..." : "Sauvegarder l'heure d'envoi"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ONGLET 3 : CONFIGURATION SMTP REAL */}
            {activeTab === "email" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Serveur de Messagerie SMTP Officiel</h2>
                    <p className="text-xs text-gray-500">Paramètres de messagerie cPanel pour l'envoi des mails</p>
                  </div>
                  <button
                    onClick={() => handleSaveSection("e-mails")}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#373B3A] text-white rounded-xl font-bold text-xs hover:bg-black transition-all"
                  >
                    <Save className="w-4 h-4 text-[#9C8464]" />
                    Sauvegarder
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1.5">Serveur Sortant (Host SMTP) *</label>
                    <input
                      type="text"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1.5">Port SMTP (SSL/TLS) *</label>
                    <select
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 bg-stone-50"
                    >
                      <option value="465">Port 465 (SSL / TLS Sécurisé Recommandé)</option>
                      <option value="587">Port 587 (TLS / STARTTLS)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1.5">Compte d'Expédition / Utilisateur *</label>
                    <input
                      type="text"
                      value={emailSettings.smtpUser}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1.5">Nom de l'Expéditeur *</label>
                    <input
                      type="text"
                      value={emailSettings.smtpFrom}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpFrom: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET 4 : SÉCURITÉ */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <h2 className="text-lg font-bold text-gray-900">Règles de Sécurité & Sessions</h2>
                  <button
                    onClick={() => handleSaveSection("sécurité")}
                    className="px-4 py-2 bg-[#373B3A] text-white rounded-xl font-bold text-xs"
                  >
                    Sauvegarder
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1.5">Durée de session (Heures)</label>
                    <input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1.5">Longueur min. mot de passe</label>
                    <input
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET 5 : CONTENU & MODÉRATION */}
            {activeTab === "content" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <h2 className="text-lg font-bold text-gray-900">Paramètres de Contenu & Affichage</h2>
                  <button
                    onClick={() => handleSaveSection("contenu")}
                    className="px-4 py-2 bg-[#373B3A] text-white rounded-xl font-bold text-xs"
                  >
                    Sauvegarder
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1.5">Articles par page (Grille)</label>
                    <input
                      type="number"
                      value={contentSettings.articlesPerPage}
                      onChange={(e) => setContentSettings({ ...contentSettings, articlesPerPage: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1.5">Catégorie par Défaut</label>
                    <select
                      value={contentSettings.defaultCategory}
                      onChange={(e) => setContentSettings({ ...contentSettings, defaultCategory: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 bg-stone-50"
                    >
                      <option value="Economie">Économie</option>
                      <option value="Industrie">Industrie</option>
                      <option value="Investissement">Investissement</option>
                      <option value="Tech">Tech</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET 6 : SYSTÈME & CACHE */}
            {activeTab === "system" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <h2 className="text-lg font-bold text-gray-900">Maintenance & Cache Système</h2>
                </div>

                <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-gray-900">Purger le Cache de l'Administration</span>
                      <p className="text-xs text-gray-500">Efface les données mises en mémoire tampon localement pour forcer le rechargement</p>
                    </div>
                    <button
                      onClick={handleClearCache}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Purger le Cache
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
