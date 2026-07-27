import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../services/apiConfig";
import { getSessionToken } from "../services/authService";
import { useToast } from "../context/ToastContext";
import { adminCache } from "../services/adminCache";
import {
  Mail,
  Send,
  Users,
  MessageSquare,
  Search,
  Check,
  Loader2,
  X,
  Bell,
  Trash2,
  Power,
  Edit3,
  Sparkles,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  Eraser,
  Type,
} from "lucide-react";

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

const NEWSLETTER_CACHE_KEY = "newsletter_subscribers_admin";

export default function NewsletterManagement() {
  const { success, error } = useToast();
  const cachedSubs = adminCache.get<NewsletterSubscriberItem[]>(NEWSLETTER_CACHE_KEY);

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

  const editorRef = useRef<HTMLDivElement>(null);

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
        adminCache.set(NEWSLETTER_CACHE_KEY, data);
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

  // Formatage Rich Text (Gras, Italique, Titres, etc.)
  const execFormat = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setBroadcastForm((prev) => ({ ...prev, content: editorRef.current?.innerHTML || "" }));
    }
  };

  // Conservation parfaite des styles HTML lors du Copier-Coller (Word, Docs, etc.)
  const handlePasteRichText = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const htmlData = e.clipboardData.getData("text/html");
    const plainData = e.clipboardData.getData("text/plain");

    if (htmlData) {
      // Insère le HTML avec ses styles, paragraphes et titres d'origine
      document.execCommand("insertHTML", false, htmlData);
    } else if (plainData) {
      document.execCommand("insertText", false, plainData);
    }

    if (editorRef.current) {
      setBroadcastForm((prev) => ({ ...prev, content: editorRef.current?.innerHTML || "" }));
    }
  };

  // Instant local optimistic update
  const handleToggleStatus = async (id: string) => {
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
        success(json.message || "Statut mis à jour.");
        adminCache.invalidate(NEWSLETTER_CACHE_KEY);
      } else {
        error(json.error || "Échec de modification.");
        loadSubscribers(true);
      }
    } catch (err) {
      error("Erreur de connexion.");
      loadSubscribers(true);
    }
  };

  const handleDeleteSubscriber = async (id: string, emailStr: string) => {
    if (!window.confirm(`Voulez-vous supprimer l'abonné ${emailStr} ?`)) return;

    setSubscribers((prev) => prev.filter((sub) => sub.id !== id));

    try {
      const res = await fetch(`${API_BASE_URL}/admin/newsletter/subscribers/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        success("Abonné supprimé avec succès.");
        adminCache.invalidate(NEWSLETTER_CACHE_KEY);
      } else {
        error(json.error || "Échec de suppression.");
        loadSubscribers(true);
      }
    } catch (err) {
      error("Erreur réseau lors de la suppression.");
      loadSubscribers(true);
    }
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalContent = editorRef.current?.innerHTML || broadcastForm.content;

    if (!broadcastForm.subject.trim() || !finalContent.trim()) {
      error("Champs requis", "L'objet et le contenu de la newsletter sont obligatoires.");
      return;
    }

    setSendingBroadcast(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/newsletter/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ ...broadcastForm, content: finalContent }),
      });

      const json = await res.json();
      if (json.success) {
        success("Newsletter Diffusée !", json.message || "Campagne envoyée.");
        setBroadcastModalOpen(false);
        setBroadcastForm({ subject: "", title: "", content: "", selected_topic: "" });
        if (editorRef.current) editorRef.current.innerHTML = "";
      } else {
        error(json.error || "Échec de l'envoi de la campagne.");
      }
    } catch (err) {
      error("Erreur de réseau lors de l'envoi.");
    } finally {
      setSendingBroadcast(false);
    }
  };

  const openEditModal = (sub: NewsletterSubscriberItem) => {
    setEditingTarget(sub);
    setEditForm({
      full_name: sub.full_name || "",
      email: sub.email || "",
      phone: sub.phone || "",
      frequency: sub.frequency || "weekly",
      topics: sub.topics || [],
      whatsapp_alerts: sub.whatsapp_alerts || false,
      is_active: sub.is_active,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
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
      subject: `[Amani Newsletter] Information concernant votre veille`,
      message: `Bonjour ${sub.full_name || 'Abonné'},\n\nNous vous contactons concernant votre abonnement à la newsletter Amani.\n\nCordialement,\nL'équipe Amani`,
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
        success("E-mail envoyé avec succès à " + emailTarget.email);
        setEmailTarget(null);
      } else {
        error(json.error || "Échec de l'envoi de l'e-mail.");
      }
    } catch (err) {
      error("Erreur réseau.");
    } finally {
      setSendingSingleEmail(false);
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
            <Mail className="w-7 h-7 text-[#9C8464]" /> Gestion des Newsletters & Campagnes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les abonnés à la veille hebdomadaire, rédigez vos newsletters et diffusez des alertes ciblées.
          </p>
        </div>

        <button
          onClick={() => setBroadcastModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#373B3A] hover:bg-black text-white font-bold text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Send className="w-4 h-4 text-[#9C8464]" /> Rédiger & Diffuser une Newsletter
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#9C8464]/10 text-[#9C8464] rounded-xl">
            <Mail className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Abonnés Newsletter</p>
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
            <Check className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Abonnés Actifs</p>
            <p className="text-2xl font-extrabold text-indigo-600">{activeCount}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par email, nom ou téléphone..."
            value={subscriberSearch}
            onChange={(e) => setSubscriberSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464]"
          />
        </div>

        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-700 font-semibold focus:outline-none cursor-pointer w-full sm:w-auto"
        >
          <option value="all">Tous les sujets</option>
          <option value="Matières Premières">Matières Premières</option>
          <option value="Indices">Indices & BRVM</option>
          <option value="Industrie">Industrie & Mines</option>
          <option value="Investissements">Investissements</option>
          <option value="Technologie">Technologie</option>
        </select>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#9C8464]" /> Chargement de la liste des abonnés...
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucun abonné newsletter ne correspond à votre recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-4">Abonné</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Thématiques Choisies</th>
                  <th className="p-4">WhatsApp</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">
                      <div>{sub.full_name || "Abonné Anonyme"}</div>
                      <div className="text-xs font-normal text-gray-500">{sub.email}</div>
                    </td>
                    <td className="p-4 text-xs text-gray-600">
                      {sub.phone ? <span>📞 {sub.phone}</span> : <span className="text-gray-400">Non renseigné</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {sub.topics && sub.topics.length > 0 ? (
                          sub.topics.map((t, idx) => (
                            <span key={idx} className="bg-stone-100 text-stone-700 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-stone-200">
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">Général</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {sub.whatsapp_alerts ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          💬 Activées
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Désactivées</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(sub.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                          sub.is_active
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                        }`}
                      >
                        {sub.is_active ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openSingleEmailModal(sub)}
                        title="Envoyer un e-mail individuel"
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#373B3A] hover:text-white text-gray-600 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(sub)}
                        title="Modifier le profil abonné"
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-amber-600 hover:text-white text-gray-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                        title="Supprimer l'abonné"
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-rose-600 hover:text-white text-gray-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE DIFFUSION DE CAMPAGNE NEWSLETTER AVEC ÉDITEUR RICH TEXT */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#9C8464]" /> Rédiger & Diffuser une Newsletter
              </h2>
              <button onClick={() => setBroadcastModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cible de la campagne</label>
                <select
                  value={broadcastForm.selected_topic}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, selected_topic: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-medium"
                >
                  <option value="">Tous les abonnés actifs (Diffusion globale)</option>
                  <option value="Matières Premières">Seulement "Matières Premières"</option>
                  <option value="Indices">Seulement "Indices & BRVM"</option>
                  <option value="Industrie">Seulement "Industrie & Mines"</option>
                  <option value="Investissements">Seulement "Investissements"</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Objet de l'E-mail *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: [Amani Veille] Synthèse Hebdomadaire des Cours & Marchés"
                  value={broadcastForm.subject}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Titre Principal de la Newsletter</label>
                <input
                  type="text"
                  placeholder="Ex: Édition du Mercredi 29 Juillet"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              {/* ÉDITEUR DE TEXTE ENRICHI AVEC CONSERVATION DU COPIER-COLLER */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Contenu de la Newsletter (Copier-Coller avec mise en forme conservée) *
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✨ Style & Paragraphes conservés
                  </span>
                </div>

                {/* BARRE D'OUTILS DE FORMATAGE RAPIDE */}
                <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1.5 rounded-t-xl border border-stone-200 border-b-0">
                  <button
                    type="button"
                    onClick={() => execFormat("bold")}
                    title="Gras"
                    className="p-1.5 rounded hover:bg-white hover:shadow-sm text-stone-700 font-bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execFormat("italic")}
                    title="Italique"
                    className="p-1.5 rounded hover:bg-white hover:shadow-sm text-stone-700"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execFormat("formatBlock", "<h2>")}
                    title="Grand Titre H2"
                    className="p-1.5 rounded hover:bg-white hover:shadow-sm text-stone-700"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execFormat("formatBlock", "<h3>")}
                    title="Sous-titre H3"
                    className="p-1.5 rounded hover:bg-white hover:shadow-sm text-stone-700"
                  >
                    <Heading3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execFormat("insertUnorderedList")}
                    title="Liste à puces"
                    className="p-1.5 rounded hover:bg-white hover:shadow-sm text-stone-700"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execFormat("removeFormat")}
                    title="Effacer le formatage"
                    className="p-1.5 rounded hover:bg-white hover:shadow-sm text-stone-700"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                </div>

                {/* ZONE RICH TEXT EDITABLE AVEC PASTE EVENT HANDLER */}
                <div
                  ref={editorRef}
                  contentEditable
                  onPaste={handlePasteRichText}
                  onInput={() => setBroadcastForm((prev) => ({ ...prev, content: editorRef.current?.innerHTML || "" }))}
                  className="w-full min-h-[200px] p-3 border border-stone-200 rounded-b-xl bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464] overflow-y-auto"
                  style={{ minHeight: "200px" }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBroadcastModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={sendingBroadcast}
                  className="px-6 py-2 bg-[#373B3A] hover:bg-black text-white font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {sendingBroadcast ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-[#9C8464]" />}
                  Envoyer la Campagne
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EMAIL INDIVIDUEL */}
      {emailTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">E-mail à {emailTarget.email}</h2>
              <button onClick={() => setEmailTarget(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendSingleEmail} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Objet *</label>
                <input
                  type="text"
                  required
                  value={singleEmailForm.subject}
                  onChange={(e) => setSingleEmailForm({ ...singleEmailForm, subject: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Message *</label>
                <textarea
                  required
                  rows={5}
                  value={singleEmailForm.message}
                  onChange={(e) => setSingleEmailForm({ ...singleEmailForm, message: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEmailTarget(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">
                  Annuler
                </button>
                <button type="submit" disabled={sendingSingleEmail} className="px-6 py-2 bg-[#373B3A] text-white font-bold rounded-xl shadow-md">
                  {sendingSingleEmail ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
