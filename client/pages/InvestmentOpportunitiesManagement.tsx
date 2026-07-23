import { useState, useEffect } from "react";
import { API_BASE_URL } from "../services/apiConfig";
import { getSessionToken } from "../services/authService";
import { useToast } from "../context/ToastContext";
import { Plus, Trash2, Edit3, X, Loader2, Upload, Image as ImageIcon, Link as LinkIcon, Check, Copy, Pause, Play, Eye, EyeOff, Inbox, User, Phone, Mail, DollarSign, Calendar, Clock, Bell, Send, Crown, MessageSquare } from "lucide-react";

interface InvestmentOpportunity {
  id: string;
  title: string;
  category: string;
  risk_level: string;
  expected_return: string;
  min_investment: string;
  time_horizon: string;
  description: string;
  highlights: string[];
  image: string | null;
  status: string;
  funded_percent: number;
}

interface InvestmentRequest {
  id: string;
  opportunity_id?: string;
  full_name: string;
  email: string;
  phone: string;
  amount: string;
  investor_type: string;
  notes?: string;
  status: "pending" | "contacted" | "approved" | "rejected";
  created_at: string;
  opportunity?: InvestmentOpportunity;
}

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

type FormState = Omit<InvestmentOpportunity, "id"> & { id?: string };

const EMPTY_FORM: FormState = {
  title: "",
  category: "Technologie",
  risk_level: "Modéré",
  expected_return: "",
  min_investment: "",
  time_horizon: "",
  description: "",
  highlights: [],
  image: "",
  status: "draft",
  funded_percent: 0,
};

function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function InvestmentOpportunitiesManagement() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<"opportunities" | "requests" | "subscribers">("opportunities");
  const [items, setItems] = useState<InvestmentOpportunity[]>([]);
  const [requests, setRequests] = useState<InvestmentRequest[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberItem[]>([]);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [highlightsInput, setHighlightsInput] = useState("");

  // Catégories DB
  const [dbCategories, setDbCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Gestion d'image (Upload ou Lien URL)
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [uploadingImage, setUploadingImage] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [invRes, reqRes, catRes, subRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/investments`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/admin/investment-requests`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/categories`),
        fetch(`${API_BASE_URL}/admin/newsletter/subscribers`, { headers: authHeaders() }),
      ]);
      const invJson = await invRes.json();
      const reqJson = await reqRes.json();
      const catJson = await catRes.json();
      const subJson = await subRes.json();

      if (invJson.success) setItems(invJson.data || []);
      else error(invJson.error || "Erreur de chargement des opportunités.");

      if (reqJson.success) setRequests(reqJson.data || []);

      if (catJson.success && catJson.data) {
        setDbCategories(catJson.data);
      }

      if (subJson.success && subJson.data) {
        setSubscribers(subJson.data || []);
        setSubscribersCount(subJson.total || subJson.data?.length || 0);
      }
    } catch (e: any) {
      error(e.message || "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Email Modal State
  const [emailTarget, setEmailTarget] = useState<InvestmentRequest | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" });

  // Recherche & Filtres pour les demandes
  const [requestSearch, setRequestSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Broadcast Modal State for Newsletter & Sector Alerts
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    subject: "",
    title: "",
    content: "",
    selected_topic: "",
  });

  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [subscriberTopicFilter, setSubscriberTopicFilter] = useState("all");

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.subject.trim() || !broadcastForm.content.trim()) {
      error("Sujet et contenu de l'alerte sont requis.");
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
        success(json.message || "Alerte / Newsletter transmise avec succès !");
        setBroadcastModalOpen(false);
        setBroadcastForm({ subject: "", title: "", content: "", selected_topic: "" });
      } else {
        error(json.error || "Échec de la diffusion.");
      }
    } catch (err) {
      error("Erreur réseau lors de la diffusion de l'alerte.");
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/investments/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        success("Statut de la demande mis à jour.");
        load();
      } else {
        error(json.error || "Erreur de mise à jour du statut.");
      }
    } catch (e) {
      error("Erreur réseau lors de la mise à jour du statut.");
    }
  };

  const openEmailModal = (req: InvestmentRequest) => {
    setEmailTarget(req);
    setEmailForm({
      subject: `[Amani Finance] Suivi de votre demande d'investissement - ${req.opportunity?.title || 'Opportunité'}`,
      message: `Bonjour ${req.full_name},\n\nNous avons bien reçu votre déclaration d'intérêt d'un montant de ${req.amount} pour l'opportunité ${req.opportunity?.title || 'd\'investissement'}.\n\nNotre équipe se tient à votre disposition pour planifier un entretien ou vous transmettre la documentation financière complète.\n\nCordialement,\nL'équipe Amani Finance`,
    });
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTarget) return;

    setSendingEmail(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/investment-requests/${emailTarget.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          email: emailTarget.email,
          full_name: emailTarget.full_name,
          subject: emailForm.subject,
          message: emailForm.message,
          opportunity_title: emailTarget.opportunity?.title,
        }),
      });
      const json = await res.json();
      if (json.success) {
        success(`E-mail transmis avec succès à ${emailTarget.email}.`);
        setEmailTarget(null);
        // Si le statut était pending, passer automatiquement à contacted
        if (emailTarget.status === "pending") {
          handleUpdateRequestStatus(emailTarget.id, "contacted");
        }
      } else {
        error(json.error || "Échec de l'envoi de l'e-mail.");
      }
    } catch (err) {
      error("Erreur réseau lors de l'envoi.");
    } finally {
      setSendingEmail(false);
    }
  };

  // Action: Dupliquer une opportunité
  const handleDuplicate = async (item: InvestmentOpportunity) => {
    try {
      const { id, ...copyData } = item;
      const payload = {
        ...copyData,
        title: `${item.title} (Copie)`,
        status: "draft",
      };
      const res = await fetch(`${API_BASE_URL}/admin/investments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        success("Opportunité dupliquée avec succès.");
        load();
      } else {
        error(json.error || "Échec de la duplication.");
      }
    } catch (e: any) {
      error("Erreur lors de la duplication.");
    }
  };

  // Action: Mettre en pause / Réactiver
  const handleTogglePause = async (item: InvestmentOpportunity) => {
    const isPaused = item.status === "coming_soon";
    const newStatus = isPaused ? "open" : "coming_soon";
    try {
      const res = await fetch(`${API_BASE_URL}/admin/investments/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        success(isPaused ? "Opportunité réactivée." : "Opportunité mise en pause.");
        load();
      } else {
        error(json.error || "Erreur de modification du statut.");
      }
    } catch (e) {
      error("Erreur réseau.");
    }
  };

  // Action: Masquer / Publier
  const handleToggleVisibility = async (item: InvestmentOpportunity) => {
    const isHidden = item.status === "draft";
    const newStatus = isHidden ? "open" : "draft";
    try {
      const res = await fetch(`${API_BASE_URL}/admin/investments/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        success(isHidden ? "Opportunité publiée." : "Opportunité masquée.");
        load();
      } else {
        error(json.error || "Erreur de visibilité.");
      }
    } catch (e) {
      error("Erreur réseau.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      error("Veuillez sélectionner un fichier image valide (PNG, JPG, WebP).");
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch(`${API_BASE_URL}/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ imageBase64: base64, filename: file.name }),
        });
        const json = await res.json();
        if (json.success && json.data?.url) {
          setEditing((prev) => (prev ? { ...prev, image: json.data.url } : null));
          success("Image téléversée avec succès.");
        } else {
          error(json.error || "Échec du téléversement de l'image.");
        }
      } catch (err: any) {
        error("Erreur lors de l'envoi de l'image.");
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const openCreate = () => {
    setEditing({ ...EMPTY_FORM });
    setHighlightsInput("");
  };

  const openEdit = (item: InvestmentOpportunity) => {
    setEditing({ ...item });
    setHighlightsInput(item.highlights.join(", "));
  };

  const closeForm = () => setEditing(null);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.category.trim() || !editing.description.trim()) {
      error("Titre, catégorie et description sont requis.");
      return;
    }

    setSaving(true);
    const payload = {
      ...editing,
      highlights: highlightsInput
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
    };
    delete (payload as any).id;

    try {
      const isEdit = !!editing.id;
      const url = isEdit
        ? `${API_BASE_URL}/admin/investments/${editing.id}`
        : `${API_BASE_URL}/admin/investments`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Échec de l'enregistrement.");

      success(isEdit ? "Opportunité mise à jour." : "Opportunité créée.");
      closeForm();
      load();
    } catch (e: any) {
      error(e.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette opportunité d'investissement ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/investments/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Échec de la suppression.");
      success("Opportunité supprimée.");
      load();
    } catch (e: any) {
      error(e.message || "Erreur lors de la suppression.");
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700",
      open: "bg-green-100 text-green-700",
      coming_soon: "bg-blue-100 text-blue-700",
      closed: "bg-red-100 text-red-700",
    };
    const label: Record<string, string> = {
      draft: "Brouillon",
      open: "Ouvert (public)",
      coming_soon: "Bientôt",
      closed: "Fermé",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-700"}`}>
        {label[status] || status}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Investissements</h1>
          <p className="text-sm text-gray-500">
            Gérez les opportunités d'investissement et consultez en temps réel toutes les demandes de souscription reçues.
          </p>
        </div>
        {activeTab === "opportunities" && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" /> Nouvelle opportunité
          </button>
        )}
        {activeTab === "subscribers" && (
          <button
            onClick={() => setBroadcastModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md transition-colors"
          >
            <Send className="w-4 h-4" /> Diffuser une Alerte / Newsletter
          </button>
        )}
      </div>

      {/* Cartes KPI Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total Demandes</p>
            <p className="text-xl font-bold text-gray-900">{requests.length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">En attente</p>
            <p className="text-xl font-bold text-amber-600">
              {requests.filter((r) => r.status === "pending").length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Traités / Approuvés</p>
            <p className="text-xl font-bold text-emerald-600">
              {requests.filter((r) => r.status === "approved" || r.status === "contacted").length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Opportunités Publiques</p>
            <p className="text-xl font-bold text-slate-900">
              {items.filter((i) => i.status === "open").length}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Onglets (Opportunités vs Demandes d'investissement vs Abonnés Premium) */}
      <div className="flex border-b border-gray-200 mb-6 gap-4 flex-wrap">
        <button
          onClick={() => setActiveTab("opportunities")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "opportunities"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Opportunités Publiées
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
            {items.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "requests"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Inbox className="w-4 h-4" />
          Demandes d'Investissement reçues
          {requests.filter((r) => r.status === "pending").length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-white font-bold animate-pulse">
              {requests.filter((r) => r.status === "pending").length} nouvelles
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
            {requests.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 py-8 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Chargement…
        </div>
      ) : activeTab === "requests" ? (
        /* VUE DES DEMANDES D'INVESTISSEMENT REÇUES EN BASE DE DONNÉES */
        <div>
          {/* Barre de Recherche et Filtres */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone..."
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">⏳ En attente</option>
              <option value="contacted">📞 Contacté</option>
              <option value="approved">✅ Approuvé / Traité</option>
              <option value="rejected">❌ Rejeté</option>
            </select>
          </div>

          {requests
            .filter((r) => {
              const matchesQuery =
                r.full_name.toLowerCase().includes(requestSearch.toLowerCase()) ||
                r.email.toLowerCase().includes(requestSearch.toLowerCase()) ||
                r.phone.includes(requestSearch);
              const matchesStatus = statusFilter === "all" || r.status === statusFilter;
              return matchesQuery && matchesStatus;
            }).length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
              <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-semibold mb-1">Aucune demande trouvée.</p>
              <p className="text-xs text-gray-400">
                Les demandes soumises par les investisseurs s'afficheront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests
                .filter((r) => {
                  const matchesQuery =
                    r.full_name.toLowerCase().includes(requestSearch.toLowerCase()) ||
                    r.email.toLowerCase().includes(requestSearch.toLowerCase()) ||
                    r.phone.includes(requestSearch);
                  const matchesStatus = statusFilter === "all" || r.status === statusFilter;
                  return matchesQuery && matchesStatus;
                })
                .map((req) => (
                  <div
                    key={req.id}
                    className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-gray-900 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-indigo-600" /> {req.full_name}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {req.investor_type}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Montant engagé : {req.amount}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400" /> {req.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {req.phone}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />{" "}
                          {new Date(req.created_at).toLocaleDateString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {req.opportunity && (
                        <div className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-700 font-medium inline-block">
                          Cible : <span className="font-bold">{req.opportunity.title}</span> ({req.opportunity.category})
                        </div>
                      )}

                      {req.notes && (
                        <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 italic">
                          "{req.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                      {/* Action Direct Email */}
                      <button
                        onClick={() => openEmailModal(req)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
                        title="Envoyer un e-mail au candidat"
                      >
                        <Mail className="w-3.5 h-3.5" /> Envoyer un E-mail
                      </button>

                      {/* Action WhatsApp Direct */}
                      <a
                        href={`https://wa.me/${req.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Bonjour ${req.full_name}, nous vous contactons concernant votre demande d'investissement Amani Finance.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                        title="Ouvrir WhatsApp direct"
                      >
                        <Phone className="w-3.5 h-3.5" /> WhatsApp
                      </a>

                      {/* Dropdown Statut */}
                      <select
                        value={req.status}
                        onChange={(e) => handleUpdateRequestStatus(req.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border focus:outline-none ${
                          req.status === "pending"
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : req.status === "contacted"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : req.status === "approved"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-gray-100 text-gray-700 border-gray-300"
                        }`}
                      >
                        <option value="pending">⏳ En attente</option>
                        <option value="contacted">📞 Contacté</option>
                        <option value="approved">✅ Approuvé / Traité</option>
                        <option value="rejected">❌ Rejeté</option>
                      </select>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Aucune opportunité pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{item.title}</p>
                  {statusBadge(item.status)}
                </div>
                <p className="text-xs text-gray-500">
                  {item.category} · {item.expected_return} · min. {item.min_investment} · {item.funded_percent}% financé
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Masquer / Publier */}
                <button
                  onClick={() => handleToggleVisibility(item)}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors"
                  title={item.status === "draft" ? "Publier l'opportunité" : "Masquer l'opportunité"}
                >
                  {item.status === "draft" ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                </button>

                {/* Pause / Réactiver */}
                <button
                  onClick={() => handleTogglePause(item)}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors"
                  title={item.status === "coming_soon" ? "Réactiver l'opportunité" : "Mettre en pause"}
                >
                  {item.status === "coming_soon" ? <Play className="w-4 h-4 text-green-600" /> : <Pause className="w-4 h-4 text-orange-600" />}
                </button>

                {/* Dupliquer */}
                <button
                  onClick={() => handleDuplicate(item)}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-indigo-50 text-indigo-600 transition-colors"
                  title="Dupliquer l'opportunité"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {/* Modifier */}
                <button
                  onClick={() => openEdit(item)}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors"
                  title="Modifier l'opportunité"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Supprimer */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 text-red-600 transition-colors"
                  title="Supprimer l'opportunité"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {editing.id ? "Modifier l'opportunité" : "Nouvelle opportunité"}
              </h2>
              <button onClick={closeForm} aria-label="Fermer">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Titre *</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie *</label>
                {!isCustomCategory ? (
                  <div className="flex gap-2">
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                      value={editing.category}
                      onChange={(e) => {
                        if (e.target.value === "__CUSTOM__") {
                          setIsCustomCategory(true);
                          setEditing({ ...editing, category: "" });
                        } else {
                          setEditing({ ...editing, category: e.target.value });
                        }
                      }}
                    >
                      <option value="Technologie">Technologie</option>
                      <option value="Énergie Renouvelable">Énergie Renouvelable</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Santé">Santé</option>
                      <option value="Services Financiers">Services Financiers</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Investissement">Investissement</option>
                      {dbCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                      <option value="__CUSTOM__">+ Saisir une autre catégorie...</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Saisissez la catégorie"
                      value={editing.category}
                      onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(false)}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Liste
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Niveau de risque</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={editing.risk_level}
                  onChange={(e) => setEditing({ ...editing, risk_level: e.target.value })}
                >
                  <option value="Faible">Faible</option>
                  <option value="Modéré">Modéré</option>
                  <option value="Élevé">Élevé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rendement attendu</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="ex: 12-18%"
                  value={editing.expected_return}
                  onChange={(e) => setEditing({ ...editing, expected_return: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Investissement minimum</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="ex: €25,000"
                  value={editing.min_investment}
                  onChange={(e) => setEditing({ ...editing, min_investment: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horizon</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="ex: 3-5 ans"
                  value={editing.time_horizon}
                  onChange={(e) => setEditing({ ...editing, time_horizon: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">% financé</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={editing.funded_percent}
                  onChange={(e) => setEditing({ ...editing, funded_percent: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Points clés (séparés par des virgules)</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="ex: Marché en croissance, Équipe expérimentée"
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
                />
              </div>

              {/* Champ Image avec Upload + URL + Aperçu */}
              <div className="col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">Image de l'opportunité</label>
                  <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                        imageMode === "upload" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" /> Fichier local
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                        imageMode === "url" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" /> Lien URL
                    </button>
                  </div>
                </div>

                {imageMode === "upload" ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors bg-gray-50/50">
                    <input
                      type="file"
                      id="opp-image-upload"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="opp-image-upload"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      {uploadingImage ? (
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm py-2">
                          <Loader2 className="w-5 h-5 animate-spin" /> Téléversement en cours...
                        </div>
                      ) : (
                        <>
                          <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                            <Upload className="w-6 h-6" />
                          </div>
                          <span className="text-sm font-bold text-gray-800">
                            Cliquez pour choisir une image sur votre ordinateur
                          </span>
                          <span className="text-xs text-gray-500">
                            Formats acceptés : PNG, JPG, WebP (max 5 MB)
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <input
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="https://images.unsplash.com/..."
                    value={editing.image || ""}
                    onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                  />
                )}

                {/* Aperçu de l'image */}
                {editing.image && (
                  <div className="relative mt-2 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 max-h-48 flex items-center justify-center group">
                    <img
                      src={editing.image}
                      alt="Aperçu"
                      className="w-full h-48 object-cover rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, image: "" })}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors"
                      title="Retirer l'image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                >
                  <option value="draft">Brouillon (masqué)</option>
                  <option value="open">Ouvert (public)</option>
                  <option value="coming_soon">Bientôt (public)</option>
                  <option value="closed">Fermé (public)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={closeForm}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-amani-primary text-white text-sm disabled:opacity-50"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'envoi d'Email direct au candidat */}
      {emailTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Envoyer un E-mail de Suivi</h3>
                  <p className="text-xs text-gray-500">
                    Destinataire : <span className="font-bold text-indigo-600">{emailTarget.full_name}</span> ({emailTarget.email})
                  </p>
                </div>
              </div>
              <button onClick={() => setEmailTarget(null)} aria-label="Fermer">
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Sujet de l'e-mail
                </label>
                <input
                  type="text"
                  required
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={6}
                  required
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  ⚡ L'envoi passera automatiquement le statut en « 📞 Contacté »
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEmailTarget(null)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={sendingEmail}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                  >
                    {sendingEmail ? (
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Diffusion de Campagne Alerte / Newsletter */}
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
                    <option value="">Tous les abonnés ({subscribersCount})</option>
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
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
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
