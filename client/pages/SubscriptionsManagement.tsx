import { useState, useEffect } from "react";
import { API_BASE_URL } from "../services/apiConfig";
import { getSessionToken } from "../services/authService";
import { useToast } from "../context/ToastContext";
import { Crown, Mail, Phone, User, MessageSquare, Send, Search, Check, Loader2, X, Bell, Trash2, Power, Pause, Play, Edit3 } from "lucide-react";

interface NewsletterSubscriberItem {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  topics: string[];
  frequency: string;
  whatsapp_alerts: boolean;
  is_active: boolean;
  created_at: string;
}

function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

import { adminCache } from "../services/adminCache";

const SUBS_CACHE_KEY = "newsletter_subscribers";

export default function SubscriptionsManagement() {
  const { success, error } = useToast();
  const cachedSubs = adminCache.get<NewsletterSubscriberItem[]>(SUBS_CACHE_KEY);

  const [subscribers, setSubscribers] = useState<NewsletterSubscriberItem[]>(cachedSubs || []);
  const [loading, setLoading] = useState(!cachedSubs);
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");

  // State pour la modal de diffusion de campagne globale
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    subject: "",
    title: "",
    content: "",
    selected_topic: "",
  });

  // State pour la modal d'envoi d'e-mail individuel
  const [emailTarget, setEmailTarget] = useState<NewsletterSubscriberItem | null>(null);
  const [sendingSingleEmail, setSendingSingleEmail] = useState(false);
  const [singleEmailForm, setSingleEmailForm] = useState({ subject: "", message: "" });

  // State pour la modal de modification d'informations d'un abonné
  const [editingTarget, setEditingTarget] = useState<NewsletterSubscriberItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    frequency: "weekly",
    topics: [] as string[],
    whatsapp_alerts: true,
    is_active: true,
  });

  const loadSubscribers = async (silent = false) => {
    if (!silent && !subscribers.length) {
      setLoading(true);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/newsletter/subscribers`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        const data = json.data || [];
        setSubscribers(data);
        adminCache.set(SUBS_CACHE_KEY, data);
      } else {
        if (!subscribers.length) error(json.error || "Erreur de chargement des abonnés.");
      }
    } catch (err: any) {
      if (!subscribers.length) error("Erreur réseau lors du chargement des abonnements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers(Boolean(cachedSubs));
  }, []);

  // Modification locale instantanée (Mise à jour optimiste sans rechargement de page)
  const handleToggleStatus = async (id: string) => {
    // 1. Mise à jour instantanée dans le state React local
    setSubscribers((prev) =>
      prev.map((sub) =>
        sub.id === id ? { ...sub, is_active: !sub.is_active } : sub
      )
    );

    try {
      const res = await fetch(`${API_BASE_URL}/admin/newsletter/subscribers/${id}/toggle-status`, {
        method: "PUT",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        success(json.message);
      } else {
        // Rollback si échec
        setSubscribers((prev) =>
          prev.map((sub) =>
            sub.id === id ? { ...sub, is_active: !sub.is_active } : sub
          )
        );
        error(json.error || "Erreur de mise à jour.");
      }
    } catch (e) {
      // Rollback si erreur réseau
      setSubscribers((prev) =>
        prev.map((sub) =>
          sub.id === id ? { ...sub, is_active: !sub.is_active } : sub
        )
      );
      error("Erreur réseau lors de la modification du statut.");
    }
  };

  // Suppression locale instantanée
  const handleDeleteSubscriber = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet abonné ?")) return;

    const previousSubscribers = [...subscribers];
    // Retrait immédiat de l'UI
    setSubscribers((prev) => prev.filter((s) => s.id !== id));

    try {
      const res = await fetch(`${API_BASE_URL}/admin/newsletter/subscribers/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        success("Abonné supprimé avec succès.");
      } else {
        setSubscribers(previousSubscribers);
        error(json.error || "Erreur de suppression.");
      }
    } catch (e) {
      setSubscribers(previousSubscribers);
      error("Erreur réseau lors de la suppression.");
    }
  };

  // Ouverture du formulaire d'édition
  const openEditModal = (sub: NewsletterSubscriberItem) => {
    setEditingTarget(sub);
    setEditForm({
      full_name: sub.full_name || "",
      email: sub.email || "",
      phone: sub.phone || "",
      frequency: sub.frequency || "weekly",
      topics: sub.topics || ["Matières Premières", "Investissements", "Indices"],
      whatsapp_alerts: Boolean(sub.whatsapp_alerts),
      is_active: Boolean(sub.is_active),
    });
  };

  const handleEditTopicToggle = (topic: string) => {
    setEditForm((prev) => {
      const exists = prev.topics.includes(topic);
      const next = exists ? prev.topics.filter((t) => t !== topic) : [...prev.topics, topic];
      return { ...prev, topics: next };
    });
  };

  const handleSaveEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

    setSavingEdit(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/newsletter/subscribers/${editingTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(editForm),
      });

      const json = await res.json();
      if (json.success) {
        success("Informations mises à jour avec succès !");
        // Mise à jour ciblée locale de l'abonné dans le state React sans tout recharger
        setSubscribers((prev) =>
          prev.map((sub) =>
            sub.id === editingTarget.id
              ? {
                  ...sub,
                  full_name: editForm.full_name,
                  email: editForm.email,
                  phone: editForm.phone,
                  frequency: editForm.frequency,
                  topics: editForm.topics,
                  whatsapp_alerts: editForm.whatsapp_alerts,
                  is_active: editForm.is_active,
                }
              : sub
          )
        );
        setEditingTarget(null);
      } else {
        error(json.error || "Échec de la mise à jour des informations.");
      }
    } catch (err) {
      error("Erreur réseau.");
    } finally {
      setSavingEdit(false);
    }
  };

  const openSingleEmailModal = (sub: NewsletterSubscriberItem) => {
    setEmailTarget(sub);
    setSingleEmailForm({
      subject: `[Amani Finance] Information concernant votre abonnement`,
      message: `Bonjour ${sub.full_name || 'Abonné'},\n\nNous vous contactons concernant votre abonnement Amani Finance et vos préférences d'alertes.\n\nCordialement,\nL'équipe Amani Finance`,
    });
  };

  const handleSendSingleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTarget) return;

    setSendingSingleEmail(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/newsletter/subscribers/${emailTarget.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          email: emailTarget.email,
          full_name: emailTarget.full_name,
          subject: singleEmailForm.subject,
          message: singleEmailForm.message,
        }),
      });
      const json = await res.json();
      if (json.success) {
        success(json.message);
        setEmailTarget(null);
        setSingleEmailForm({ subject: "", message: "" });
      } else {
        error(json.error || "Échec de l'envoi.");
      }
    } catch (e) {
      error("Erreur réseau.");
    } finally {
      setSendingSingleEmail(false);
    }
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.subject.trim() || !broadcastForm.content.trim()) {
      error("Le sujet et le contenu de l'alerte sont requis.");
      return;
    }

    setSendingBroadcast(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/newsletter/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(broadcastForm),
      });
      const json = await res.json();
      if (json.success) {
        success(json.message || "Campagne d'alerte / Newsletter diffusée avec succès !");
        setBroadcastModalOpen(false);
        setBroadcastForm({ subject: "", title: "", content: "", selected_topic: "" });
      } else {
        error(json.error || "Échec de l'envoi de la campagne.");
      }
    } catch (err) {
      error("Erreur réseau lors de la diffusion.");
    } finally {
      setSendingBroadcast(false);
    }
  };

  const filteredSubscribers = subscribers.filter((s) => {
    const query = subscriberSearch.toLowerCase();
    const matchesQuery =
      s.email.toLowerCase().includes(query) ||
      (s.full_name && s.full_name.toLowerCase().includes(query)) ||
      (s.phone && s.phone.includes(query));
    const matchesTopic = topicFilter === "all" || (s.topics && s.topics.includes(topicFilter));
    return matchesQuery && matchesTopic;
  });

  const whatsappCount = subscribers.filter((s) => s.whatsapp_alerts).length;
  const activeCount = subscribers.filter((s) => s.is_active).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="w-7 h-7 text-amber-500" /> Gestion des Abonnements & Pass Premium
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Supervisez les abonnés aux alertes sectorielles, modifiez les profils et diffusez des newsletters ciblées.
          </p>
        </div>

        <button
          onClick={() => setBroadcastModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Send className="w-4 h-4" /> Diffuser une Alerte / Newsletter
        </button>
      </div>

      {/* Cartes KPI Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Abonnés</p>
            <p className="text-2xl font-extrabold text-gray-900">{subscribers.length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Alertes WhatsApp</p>
            <p className="text-2xl font-extrabold text-emerald-600">{whatsappCount}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Check className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Abonnements Actifs</p>
            <p className="text-2xl font-extrabold text-indigo-600">{activeCount}</p>
          </div>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher par email, nom ou téléphone..."
            value={subscriberSearch}
            onChange={(e) => setSubscriberSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        </div>

        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
        >
          <option value="all">Tous les thèmes d'alertes</option>
          <option value="Matières Premières">Matières Premières</option>
          <option value="Investissements">Investissements</option>
          <option value="Indices">Indices & Marchés</option>
        </select>
      </div>

      {/* Table des Abonnés */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 text-gray-500 py-12">
          <Loader2 className="w-5 h-5 animate-spin" /> Chargement des abonnements...
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 rounded-2xl bg-amber-50/20">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="text-gray-700 font-bold text-base mb-1">Aucun abonné trouvé.</p>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Les membres souscrits à la newsletter ou ayant activé les alertes Pass Premium s'afficheront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubscribers.map((sub) => (
            <div
              key={sub.id}
              className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-base text-gray-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-600" /> {sub.full_name || sub.email}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      sub.is_active
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-gray-100 text-gray-600 border border-gray-300"
                    }`}
                  >
                    {sub.is_active ? "Abonnement Actif" : "Abonnement Suspendu"}
                  </span>
                  {sub.whatsapp_alerts && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      WhatsApp 💬
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    {sub.frequency === "weekly" ? "Hebdomadaire" : sub.frequency === "daily" ? "Quotidien" : "Instantanné"}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> {sub.email}
                  </span>
                  {sub.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {sub.phone}
                    </span>
                  )}
                  <span className="text-gray-400">
                    Inscrit le {new Date(sub.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-xs text-gray-500 font-bold">Thèmes souscrits :</span>
                  {(sub.topics || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Boutons d'Action Directs */}
              <div className="flex items-center gap-2 flex-wrap flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                {/* Modifier les informations */}
                <button
                  onClick={() => openEditModal(sub)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors shadow-sm"
                  title="Modifier les informations de l'abonné"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Modifier
                </button>

                {/* Envoyer un E-mail */}
                <button
                  onClick={() => openSingleEmailModal(sub)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm"
                  title="Envoyer un e-mail à cet abonné"
                >
                  <Mail className="w-3.5 h-3.5" /> E-mail
                </button>

                {/* Lien WhatsApp direct */}
                {sub.phone && (
                  <a
                    href={`https://wa.me/${sub.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Bonjour ${sub.full_name || ""}, nous vous contactons au sujet de vos alertes Amani Finance Premium.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
                    title="Ouvrir WhatsApp direct"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                )}

                {/* Activer / Désactiver avec mise à jour optimiste */}
                <button
                  onClick={() => handleToggleStatus(sub.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors border shadow-sm ${
                    sub.is_active
                      ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                      : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                  }`}
                  title={sub.is_active ? "Suspendre l'abonnement" : "Réactiver l'abonnement"}
                >
                  {sub.is_active ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Suspendre
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Activer
                    </>
                  )}
                </button>

                {/* Supprimer */}
                <button
                  onClick={() => handleDeleteSubscriber(sub.id)}
                  className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                  title="Supprimer l'abonné"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Modification des Informations d'un Abonné */}
      {editingTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Modifier l'Abonné</h3>
                  <p className="text-xs text-gray-500">
                    ID : <span className="font-mono text-gray-600">{editingTarget.id}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setEditingTarget(null)} aria-label="Fermer">
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Adresse Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Téléphone (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Fréquence d'Alerte
                  </label>
                  <select
                    value={editForm.frequency}
                    onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="weekly">Hebdomadaire</option>
                    <option value="daily">Quotidien</option>
                    <option value="instant">Instantanné</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                  Thèmes souscrits :
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["Matières Premières", "Investissements", "Indices"].map((t) => {
                    const isSel = editForm.topics.includes(t);
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => handleEditTopicToggle(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                          isSel
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {t}
                        {isSel && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.whatsapp_alerts}
                    onChange={(e) => setEditForm({ ...editForm, whatsapp_alerts: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  Activer les alertes WhatsApp 💬
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Abonnement Actif ✅
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingTarget(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'envoi d'Email individuel */}
      {emailTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Envoyer un E-mail à l'Abonné</h3>
                  <p className="text-xs text-gray-500">
                    Destinataire : <span className="font-bold text-indigo-600">{emailTarget.full_name || emailTarget.email}</span> ({emailTarget.email})
                  </p>
                </div>
              </div>
              <button onClick={() => setEmailTarget(null)} aria-label="Fermer">
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSendSingleEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Sujet de l'e-mail *
                </label>
                <input
                  type="text"
                  required
                  value={singleEmailForm.subject}
                  onChange={(e) => setSingleEmailForm({ ...singleEmailForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  rows={6}
                  required
                  value={singleEmailForm.message}
                  onChange={(e) => setSingleEmailForm({ ...singleEmailForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEmailTarget(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={sendingSingleEmail}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {sendingSingleEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Envoi...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" /> Envoyer l'e-mail
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Diffusion de Campagne Alerte / Newsletter globale */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Diffuser une Alerte / Newsletter</h3>
                  <p className="text-xs text-gray-500">
                    Transmettez une alerte prioritaire à la communauté d'abonnés Amani.
                  </p>
                </div>
              </div>
              <button onClick={() => setBroadcastModalOpen(false)} aria-label="Fermer">
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Sujet de l'Alerte (E-mail) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: [Alerte Marché] Flambée des cours du Cacao et opportunités"
                  value={broadcastForm.subject}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Titre du Flash / Rapport
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Synthèse Hebdomadaire Amani"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Cibler un Thème Spécifique
                  </label>
                  <select
                    value={broadcastForm.selected_topic}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, selected_topic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">Tous les abonnés ({subscribers.length})</option>
                    <option value="Matières Premières">Matières Premières uniquement</option>
                    <option value="Investissements">Investissements uniquement</option>
                    <option value="Indices">Indices & Marchés uniquement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Contenu de l'Alerte / Analyse *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Rédigez ici le contenu de l'analyse ou de l'alerte à transmettre à tous les membres..."
                  value={broadcastForm.content}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  📢 Envoi direct à tous les abonnés qualifiés
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={sendingBroadcast}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                  >
                    {sendingBroadcast ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Diffusion...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Diffuser l'alerte
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
