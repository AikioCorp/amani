import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../services/apiConfig";
import { getSessionToken } from "../services/authService";
import { useToast } from "../context/ToastContext";
import { 
  FileText, Save, Eye, Edit3, Loader2, Check, Globe, Shield, 
  HelpCircle, Info, Mail, FileCheck, Cookie, Lock, Sparkles, RefreshCw 
} from "lucide-react";
import { renderMarkdownContent } from "../components/DynamicLegalPage";

interface LegalPageData {
  id?: string;
  slug: string;
  title: string;
  content: string;
  meta_title?: string;
  meta_desc?: string;
  updated_at?: string;
}

const LEGAL_SLUGS = [
  { slug: "about", label: "À propos", icon: Info, desc: "Histoire, mission et vision d'Amani Finance" },
  { slug: "contact", label: "Contact", icon: Mail, desc: "Coordonnées, adresses et moyens de contact" },
  { slug: "cgu", label: "Conditions (CGU)", icon: FileCheck, desc: "Conditions Générales d'Utilisation des services" },
  { slug: "privacy", label: "Confidentialité", icon: Lock, desc: "Protection des données personnelles et RGPD" },
  { slug: "mentions-legales", label: "Mentions légales", icon: Shield, desc: "Informations éditoriales et juridiques" },
  { slug: "cookies", label: "Cookies", icon: Cookie, desc: "Politique relative aux cookies et traceurs" }
];

export default function LegalPagesManagement() {
  const { success, error: toastError } = useToast();
  const [activeSlug, setActiveSlug] = useState<string>("about");
  const [pages, setPages] = useState<Record<string, LegalPageData>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"edit" | "preview">("edit");

  // Form State for Active Page
  const [formData, setFormData] = useState<LegalPageData>({
    slug: "about",
    title: "",
    content: "",
    meta_title: "",
    meta_desc: ""
  });

  // Charger toutes les pages légales au démarrage (avec cache buster ?t=)
  const fetchLegalPages = async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/legal-pages?t=${Date.now()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const pageMap: Record<string, LegalPageData> = {};
        json.data.forEach((p: LegalPageData) => {
          pageMap[p.slug] = p;
        });
        setPages(pageMap);
      }
    } catch (err: any) {
      if (!silent) toastError("Erreur", "Impossible de charger les pages légales.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLegalPages();
  }, []);

  // Mettre à jour le formulaire dès que l'onglet change ou que les pages sont chargées
  useEffect(() => {
    if (pages[activeSlug]) {
      setFormData(pages[activeSlug]);
    } else {
      const selected = LEGAL_SLUGS.find(s => s.slug === activeSlug);
      setFormData({
        slug: activeSlug,
        title: selected ? selected.label : "",
        content: "",
        meta_title: "",
        meta_desc: ""
      });
    }
  }, [activeSlug, pages]);

  // Sauvegarder la page légale active
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getSessionToken();
      const res = await fetch(`${API_BASE_URL}/legal-pages/${activeSlug}?t=${Date.now()}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const updatedPage = json.data;
        success("Page Enregistrée", `La page '${updatedPage.title}' a été mise à jour avec succès.`);
        setPages(prev => ({
          ...prev,
          [activeSlug]: updatedPage
        }));
        setFormData(updatedPage);
        // Force silent re-fetch to confirm sync
        fetchLegalPages(true);
      } else {
        throw new Error(json.error || "Échec de l'enregistrement.");
      }
    } catch (err: any) {
      toastError("Erreur d'enregistrement", err.message);
    } finally {
      setSaving(false);
    }
  };

  // Insertion rapide de balises Markdown/HTML dans l'éditeur
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end) || "Texte ici";
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setFormData(prev => ({ ...prev, content: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  const activeMeta = LEGAL_SLUGS.find(s => s.slug === activeSlug);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-stone-800" />
            Gestion des Pages Légales & Institutionnelles
          </h1>
          <p className="text-stone-500 mt-1 text-sm">
            Modifiez et publiez en temps réel le contenu des 6 pages institutionnelles et légales du site.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => fetchLegalPages(false)}
            disabled={loading}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all text-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* 6 Tabs Menu */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 border-b border-stone-200 pb-4">
        {LEGAL_SLUGS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSlug === item.slug;
          const isConfigured = Boolean(pages[item.slug]?.content);

          return (
            <button
              key={item.slug}
              onClick={() => setActiveSlug(item.slug)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? "bg-stone-900 text-white border-stone-900 shadow-md"
                  : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isActive ? "text-stone-300" : "text-stone-700"}`} />
                {isConfigured ? (
                  <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400" : "bg-emerald-500"}`} title="Configurée" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400" title="Par défaut" />
                )}
              </div>
              <div>
                <div className="font-bold text-xs">{item.label}</div>
                <div className={`text-[10px] line-clamp-1 mt-0.5 ${isActive ? "text-stone-300" : "text-stone-400"}`}>
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Editing Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-stone-800 mb-3" />
          <p className="text-stone-500 text-sm">Chargement des pages légales...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Top Bar: Title & Toggle Preview */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-stone-150 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-stone-100 text-stone-800 px-3 py-1 rounded-lg border border-stone-200">
                  Slug: /{activeSlug}
                </span>
                {pages[activeSlug]?.updated_at && (
                  <span className="text-xs text-stone-400">
                    Dernière maj: {new Date(pages[activeSlug].updated_at!).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 border border-stone-200 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveView("edit")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeView === "edit"
                      ? "bg-stone-900 text-white shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Éditeur
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("preview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeView === "preview"
                      ? "bg-stone-900 text-white shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Aperçu en direct
                </button>
              </div>
            </div>

            {/* Title Field */}
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 tracking-wider mb-1.5">
                Titre de la Page Légale *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="ex: Conditions Générales d'Utilisation (CGU)"
                className="w-full text-base font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          {/* Edit / Preview Tabs */}
          {activeView === "edit" ? (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
              {/* Formatting Quick Toolbar */}
              <div className="flex flex-wrap items-center gap-2 border-b border-stone-150 pb-3 bg-stone-50/70 p-2.5 rounded-xl">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-2">Formater:</span>
                <button
                  type="button"
                  onClick={() => insertFormatting("# ", "")}
                  className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-stone-100 border border-stone-200 rounded text-stone-800"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("## ", "")}
                  className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-stone-100 border border-stone-200 rounded text-stone-800"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("**", "**")}
                  className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-stone-100 border border-stone-200 rounded text-stone-800"
                >
                  Gras
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("- ", "")}
                  className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-stone-100 border border-stone-200 rounded text-stone-800"
                >
                  Puce
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("[Titre du lien](", ")")}
                  className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-stone-100 border border-stone-200 rounded text-stone-800"
                >
                  Lien
                </button>
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 tracking-wider mb-1.5">
                  Contenu de la Page (Markdown / HTML) *
                </label>
                <textarea
                  id="content-editor"
                  rows={16}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Rédigez ou collez le contenu juridique de la page..."
                  className="w-full font-mono text-sm leading-relaxed text-stone-900 bg-stone-50 border border-stone-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              {/* SEO Meta Box */}
              <div className="bg-stone-50/80 rounded-xl p-4 border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-stone-600" />
                  Référencement SEO & Réseaux Sociaux
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Meta Titre SEO
                    </label>
                    <input
                      type="text"
                      value={formData.meta_title || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                      placeholder="Titre affiché sur Google..."
                      className="w-full text-xs text-stone-900 bg-white border border-stone-200 rounded-lg px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Meta Description SEO
                    </label>
                    <input
                      type="text"
                      value={formData.meta_desc || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_desc: e.target.value }))}
                      placeholder="Résumé affiché dans les résultats de recherche..."
                      className="w-full text-xs text-stone-900 bg-white border border-stone-200 rounded-lg px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Live Preview Box */
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
              <div className="border-b border-stone-200 pb-4 mb-4">
                <h1 className="text-3xl font-extrabold text-stone-900 mb-2">
                  {formData.title || "Titre de la Page"}
                </h1>
                <p className="text-xs text-stone-400">Aperçu en temps réel du rendu final public</p>
              </div>

              <div className="space-y-4 text-stone-800 text-sm leading-relaxed">
                {formData.content ? (
                  renderMarkdownContent(formData.content)
                ) : (
                  <p className="text-stone-400 italic py-8 text-center">Aucun contenu rédigé pour le moment.</p>
                )}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
            <div className="text-xs text-stone-500 font-medium">
              Page : <strong className="text-stone-900">{activeMeta?.label}</strong>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-stone-900 hover:bg-black text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-all disabled:opacity-60 flex items-center gap-2 text-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-stone-300" />
                  Enregistrer & Publier
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
