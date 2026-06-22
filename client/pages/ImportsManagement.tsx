import { useState, useEffect } from "react";
import { 
  Globe, Plus, AlertCircle, CheckCircle2, Loader2, 
  ArrowUpRight, RefreshCw, Check, X, Edit3, Trash2, Eye, ShieldCheck, Sparkles, AlertTriangle, Clock
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import { getSessionToken } from "../services/authService";

interface Source {
  id: string;
  name: string;
  domain: string;
  reliability_score: number;
  status: string;
}

interface ArticleDraft {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  confidence_score: number;
  importance_score: number;
  status: string;
  review_reasons?: string[];
}

interface ArticleImport {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  published_at: string | null;
  imported_at: string;
  status: string;
  freshness_score: number;
  source?: Source;
  drafts: ArticleDraft[];
  raw_data?: {
    imageUrl?: string | null;
  };
}

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname.includes("127.0.0.1");

const API_BASE_URL = isLocal ? "http://localhost:5000/api" : "/api";

export default function ImportsManagement() {
  const { success, error, warning } = useToast();
  const [imports, setImports] = useState<ArticleImport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDiagLoading, setIsDiagLoading] = useState(false);
  const [diagResults, setDiagResults] = useState<any[] | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // importId
  
  const [activeTab, setActiveTab] = useState<'imports' | 'sources'>('imports');
  const [sources, setSources] = useState<Source[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Modal Edit state
  const [editingDraft, setEditingDraft] = useState<ArticleDraft | null>(null);
  const [editingImportId, setEditingImportId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "economie",
    tags: "",
    seo_title: "",
    seo_description: "",
    confidence_score: 50,
    importance_score: 50,
  });

  const fetchImports = async (currentFilter = filterStatus) => {
    setIsLoading(true);
    try {
      const token = getSessionToken();
      const response = await fetch(`${API_BASE_URL}/imports?status=${currentFilter}`, {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setImports(result.data || []);
      } else {
        throw new Error(result.error || "Erreur de chargement des imports");
      }
    } catch (err: any) {
      error("Erreur", err.message || "Erreur lors du chargement des imports");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSources = async () => {
    setIsLoading(true);
    try {
      const token = getSessionToken();
      const response = await fetch(`${API_BASE_URL}/sources`, {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setSources(result.data || []);
      }
    } catch (err: any) {
      error("Erreur", "Impossible de charger les sources.");
    } finally {
      setIsLoading(false);
    }
  };
  const [keywords, setKeywords] = useState<{ [key: string]: string[] }>({
    marche: [],
    economie: [],
    industrie: [],
    investissement: [],
    insights: [],
    tech: [],
    tchad: []
  });

  const fetchKeywords = async () => {
    try {
      const token = getSessionToken();
      const response = await fetch(`${API_BASE_URL}/imports/settings/keywords`, {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setKeywords(result.data || {});
      }
    } catch (err: any) {
      console.error("Erreur de chargement des mots-clés :", err);
    }
  };

  const handleUpdateKeywordsSilently = async (newKeywords: { [key: string]: string[] }) => {
    try {
      const token = getSessionToken();
      await fetch(`${API_BASE_URL}/imports/settings/keywords`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ keywords: newKeywords })
      });
    } catch (err: any) {
      console.error("Échec de sauvegarde silencieuse des mots-clés :", err);
    }
  };

  const handleUpdateSourceStatusSilently = async (id: string, updates: Partial<Source>) => {
    try {
      const token = getSessionToken();
      await fetch(`${API_BASE_URL}/sources/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "" 
        },
        body: JSON.stringify(updates)
      });
    } catch (err: any) {
      console.error("Échec de sauvegarde silencieuse de la source :", err);
    }
  };

  const handleUpdateSourceStatus = async (id: string, updates: Partial<Source>) => {
    try {
      const token = getSessionToken();
      const response = await fetch(`${API_BASE_URL}/sources/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "" 
        },
        body: JSON.stringify(updates)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        success("Source mise à jour", "La source a été configurée.");
        fetchSources();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      error("Erreur", err.message || "Échec");
    }
  };

  useEffect(() => {
    if (activeTab === "imports") {
      fetchImports(filterStatus);
    } else {
      fetchSources();
      fetchKeywords();
    }
  }, [activeTab, filterStatus]);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const token = getSessionToken();
      const response = await fetch(`${API_BASE_URL}/imports/scan`, {
        method: "POST",
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        success("Scan terminé !", `${result.message}`);
        fetchImports();
      } else {
        throw new Error(result.error || "Échec du scan");
      }
    } catch (err: any) {
      error("Erreur de scan", err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDiagnostic = async () => {
    setIsDiagLoading(true);
    setDiagResults(null);
    try {
      const token = getSessionToken();
      const response = await fetch(`${API_BASE_URL}/imports/diagnostic`, {
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setDiagResults(result.data || []);
        success("Diagnostic brut complété !", `${result.totalCount} articles trouvés par Serper.`);
      } else {
        throw new Error(result.error || "Échec du diagnostic");
      }
    } catch (err: any) {
      error("Erreur Diagnostic", err.message);
    } finally {
      setIsDiagLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    try {
      const token = getSessionToken();
      const response = await fetch(`${API_BASE_URL}/imports/${id}/accept`, {
        method: "POST",
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        success("Article publié !", "Le brouillon a été approuvé et mis en ligne avec succès.");
        setImports(prev => prev.filter(item => item.id !== id));
      } else {
        throw new Error(result.error || "Échec de publication");
      }
    } catch (err: any) {
      error("Erreur", err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      const token = getSessionToken();
      const response = await fetch(`${API_BASE_URL}/imports/${id}/reject`, {
        method: "POST",
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        success("Import rejeté", "L'article a été écarté.");
        setImports(prev => prev.filter(item => item.id !== id));
      } else {
        throw new Error(result.error || "Échec du rejet");
      }
    } catch (err: any) {
      error("Erreur", err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleForceGenerate = async (id: string) => {
    setActionLoading(id);
    try {
      const token = getSessionToken();
      const response = await fetch(`${API_BASE_URL}/imports/${id}/generate`, {
        method: "POST",
        headers: { "Authorization": token ? `Bearer ${token}` : "" }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        success("Nouveau brouillon généré !", "L'IA a régénéré le contenu.");
        const newDraft = result.data;
        setImports(prev => prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              drafts: [newDraft]
            };
          }
          return item;
        }));
      } else {
        throw new Error(result.error || "Échec de génération");
      }
    } catch (err: any) {
      error("Erreur", err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (item: ArticleImport) => {
    if (item.drafts.length === 0) return;
    const draft = item.drafts[0];
    setEditingDraft(draft);
    setEditingImportId(item.id);
    setEditForm({
      title: draft.title,
      summary: draft.summary,
      content: draft.content,
      category: draft.category,
      tags: draft.tags.join(", "),
      seo_title: draft.seo_title || "",
      seo_description: draft.seo_description || "",
      confidence_score: draft.confidence_score,
      importance_score: draft.importance_score,
    });
  };

  const saveEditDraft = async () => {
    if (!editingDraft) return;
    setActionLoading(editingImportId);
    try {
      const token = getSessionToken();
      const response = await fetch(`${API_BASE_URL}/imports/drafts/${editingDraft.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "" 
        },
        body: JSON.stringify({
          ...editForm,
          tags: editForm.tags.split(",").map(t => t.trim()).filter(Boolean)
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        success("Brouillon modifié", "Modifications enregistrées avec succès.");
        const updatedDraft = result.data;
        setImports(prev => prev.map(item => {
          if (item.id === editingImportId) {
            return {
              ...item,
              drafts: [updatedDraft]
            };
          }
          return item;
        }));
        setEditingDraft(null);
        setEditingImportId(null);
      } else {
        throw new Error(result.error || "Échec de sauvegarde");
      }
    } catch (err: any) {
      error("Erreur", err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getConfidenceBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getImportanceBadgeColor = (score: number) => {
    if (score >= 70) return "bg-indigo-100 text-indigo-800 border-indigo-200";
    if (score >= 40) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getFreshnessScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-50 text-green-800 border-green-200";
    if (score >= 70) return "bg-blue-50 text-blue-800 border-blue-200";
    if (score >= 40) return "bg-amber-50 text-amber-800 border-amber-200";
    return "bg-red-50 text-red-800 border-red-200";
  };

  const getFreshnessBadge = (publishedAt: string | null | undefined, status: string) => {
    if (!publishedAt || status === "needs_date_review") {
      return (
        <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
          Date inconnue
        </span>
      );
    }
    
    const pubDate = new Date(publishedAt);
    const now = new Date();
    const diffHours = (now.getTime() - pubDate.getTime()) / 3600000;
    
    if (diffHours <= 24) {
      return (
        <span className="bg-green-150 text-green-800 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
          Aujourd'hui
        </span>
      );
    } else if (diffHours <= 168) {
      return (
        <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
          Cette semaine
        </span>
      );
    } else {
      return (
        <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
          Ancien
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Title & Scan Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            📰 Centre de Veille & Imports Amani
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Gérez, éditez et validez les actualités économiques récoltées et enrichies automatiquement par IA
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleDiagnostic}
            disabled={isDiagLoading || isScanning}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-3 rounded-xl shadow-sm transition-all disabled:opacity-60 flex items-center gap-2 whitespace-nowrap justify-center flex-1 sm:flex-initial"
          >
            {isDiagLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Diagnostic en cours...
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" />
                Import Brut Diagnostic
              </>
            )}
          </button>
          <button
            onClick={handleScan}
            disabled={isScanning || isDiagLoading}
            className="bg-amani-primary hover:bg-amani-primary/95 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition-all disabled:opacity-60 flex items-center gap-2 whitespace-nowrap justify-center flex-1 sm:flex-initial"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Recherche de veille...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Lancer la veille automatique
              </>
            )}
          </button>
        </div>
      </div>

      {diagResults !== null && (
        <div className="bg-white border border-amber-200 rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between border-b border-gray-150 pb-3 mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
              <AlertCircle className="w-5 h-5 text-amber-600 animate-bounce" />
              Résultats du Diagnostic Brut Serper ({diagResults.length} articles trouvés)
            </h2>
            <button
              onClick={() => setDiagResults(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
            >
              Fermer le Panel Diagnostic
            </button>
          </div>
          {diagResults.length === 0 ? (
            <p className="text-sm text-gray-500 italic text-center py-6">Aucun article trouvé par Serper.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
              {diagResults.map((res, index) => (
                <div key={index} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-amani-primary">{res.source}</span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase bg-white px-2 py-0.5 rounded border border-gray-200">Mot-clé: {res.search_keyword}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{res.title}</h4>
                  <p className="text-gray-500 line-clamp-2 leading-relaxed">{res.snippet}</p>
                  <a href={res.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold inline-block mt-2">Consulter la source ↗</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("imports")}
          className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all ${
            activeTab === "imports"
              ? "border-amani-primary text-amani-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📥 Brouillons en attente ({imports.length})
        </button>
        <button
          onClick={() => setActiveTab("sources")}
          className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all ${
            activeTab === "sources"
              ? "border-amani-primary text-amani-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          🌐 Sites Sources & Mots-clés ({sources.length})
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-amani-primary mb-3" />
          <p className="text-gray-500 text-sm">Chargement des données...</p>
        </div>
      )}

      {/* Render tab content */}
      {!isLoading && activeTab === "imports" && (
        <>
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-gray-500 uppercase mr-2">Filtrer par récence :</span>
            {[
              { label: `Tous (${filterStatus === "all" ? imports.length : "..."})`, val: "all" },
              { label: `Aujourd'hui (${filterStatus === "today" ? imports.length : "..."})`, val: "today" },
              { label: `7 derniers jours (${filterStatus === "week" ? imports.length : "..."})`, val: "week" },
              { label: `Date inconnue (${filterStatus === "needs_date_review" ? imports.length : "..."})`, val: "needs_date_review" },
              { label: `Rejetés automatiquement (${filterStatus === "auto_rejected" ? imports.length : "..."})`, val: "auto_rejected" }
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => setFilterStatus(f.val)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all border ${
                  filterStatus === f.val 
                    ? "bg-amani-primary text-white border-amani-primary shadow-sm" 
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {imports.length === 0 ? (
            <div className="bg-white p-16 rounded-2xl border border-gray-200 text-center max-w-xl mx-auto shadow-sm">
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tout est en ordre !</h3>
              <p className="text-gray-600 text-sm mb-6">
                Aucun article en attente de modération. Vous pouvez lancer un scan de veille manuellement pour actualiser les données.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                📥 Actualités en attente de relecture
              </h2>
              <div className="grid grid-cols-1 gap-6">
            {imports.map((item) => {
              const draft = item.drafts[0];
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col lg:flex-row hover:shadow-md transition-shadow">
                  
                  {/* Left Column: Original source & Meta info */}
                  <div className="lg:w-1/3 bg-gray-50/50 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-gray-500">
                        <span className="font-semibold text-amani-primary px-2.5 py-1 bg-amani-primary/10 rounded-full font-sans">
                          {item.source?.name || item.domain}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {getFreshnessBadge(item.published_at, item.status)}
                          {item.published_at && (
                            <span>{new Date(item.published_at).toLocaleDateString("fr-FR")}</span>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 text-base mb-3 leading-snug">
                        {item.title}
                      </h3>
                      
                      <p className="text-gray-600 text-xs line-clamp-4 leading-relaxed bg-white p-3 rounded-lg border border-gray-100 mb-4">
                        <span className="font-semibold text-gray-800">Source d'origine: </span>
                        {item.snippet}
                      </p>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 inline-flex"
                      >
                        Consulter la source
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
                      Importé le : {new Date(item.imported_at).toLocaleString("fr-FR")}
                    </div>
                  </div>

                  {/* Right Column: AI Draft & Actions */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    {draft ? (
                      <div>
                        {/* Badges metrics info */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span className={`text-xs px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 ${getConfidenceBadgeColor(draft.confidence_score)}`}>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Confiance IA : {draft.confidence_score}%
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 ${getImportanceBadgeColor(draft.importance_score)}`}>
                            <Sparkles className="w-3.5 h-3.5" />
                            Importance : {draft.importance_score}%
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 ${getFreshnessScoreBadgeColor(item.freshness_score)}`}>
                            <Clock className="w-3.5 h-3.5" />
                            Fraîcheur : {item.freshness_score}%
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded-md border border-gray-200 bg-gray-100 text-gray-700 capitalize font-medium">
                            {draft.category}
                          </span>
                          {draft.status === "needs_review" && (
                            <span className="text-xs px-2.5 py-1 rounded-md border border-amber-200 bg-amber-50 text-amber-800 font-medium flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Relecture requise
                            </span>
                          )}
                        </div>

                        {draft.status === "needs_review" && draft.review_reasons && draft.review_reasons.length > 0 && (
                          <div className="mb-4 text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 shadow-sm">
                            <div className="font-bold mb-1.5 flex items-center gap-1.5 text-amber-800">
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                              Raisons de la mise en attente de relecture :
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-amber-700 pl-1">
                              {draft.review_reasons.map((reason, rIdx) => (
                                <li key={rIdx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {draft.title}
                        </h4>

                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mb-4 text-xs">
                          <p className="font-semibold text-emerald-800 mb-1">Ce qu'il faut retenir :</p>
                          <p className="text-gray-700 leading-relaxed">{draft.summary}</p>
                        </div>

                        <div className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: draft.content }} />
                        
                        {draft.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {draft.tags.map((tag, tIdx) => (
                              <span key={tIdx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <AlertCircle className="w-12 h-12 text-amber-500 mb-2" />
                        <p className="text-sm font-semibold text-gray-700">Aucun brouillon IA généré</p>
                        <button
                          onClick={() => handleForceGenerate(item.id)}
                          disabled={actionLoading !== null}
                          className="mt-3 text-xs bg-amani-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-amani-primary/95 transition-all"
                        >
                          Générer le brouillon maintenant
                        </button>
                      </div>
                    )}

                    {/* Bottom Actions Bar */}
                    <div className="border-t border-gray-100 pt-4 mt-4 flex flex-wrap items-center justify-between gap-4">
                      {draft && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            disabled={actionLoading !== null}
                            className="text-xs font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:border-amani-primary hover:bg-amani-primary/5 transition-all text-gray-700 hover:text-amani-primary flex items-center gap-1.5"
                          >
                            <Edit3 className="w-4 h-4" />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleForceGenerate(item.id)}
                            disabled={actionLoading !== null}
                            className="text-xs font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:border-emerald-600 hover:bg-emerald-50 transition-all text-gray-700 hover:text-emerald-600 flex items-center gap-1.5"
                            title="Régénérer le résumé et l'article avec l'IA Gemini"
                          >
                            {actionLoading === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                            Régénérer par IA
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          onClick={() => handleReject(item.id)}
                          disabled={actionLoading !== null}
                          className="text-xs font-semibold px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-all flex items-center gap-1.5"
                        >
                          <X className="w-4 h-4" />
                          Rejeter
                        </button>
                        {draft && (
                          <button
                            onClick={() => handleAccept(item.id)}
                            disabled={actionLoading !== null}
                            className="text-xs font-semibold px-5 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            {actionLoading === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Accepter & Publier
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
        </>
      )}

      {!isLoading && activeTab === "sources" && (
        <div className="space-y-6">
          {/* Keywords Card widget */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              🔍 Mots-clés de veille Google News par catégorie
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Les modifications apportées aux mots-clés sont enregistrées automatiquement en arrière-plan lorsque vous déplacez le curseur (perte de focus).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.keys(keywords).map((catKey) => {
                const catLabels: { [key: string]: string } = {
                  marche: "📈 Bourse & Marchés",
                  economie: "💼 Économie & Finances",
                  industrie: "🏭 Industrie & Matières Premières",
                  investissement: "💰 Investissements & PME",
                  insights: "📊 Décryptages & Rapports",
                  tech: "🚀 Technologie & Startups",
                  tchad: "🇹🇩 Focus Tchad (Macro & Pétrole)"
                };
                
                return (
                  <div key={catKey} className="border border-gray-150 rounded-xl p-4 bg-gray-50/40 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-gray-700 uppercase mb-2">
                        {catLabels[catKey] || catKey}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {keywords[catKey]?.length === 0 || (keywords[catKey]?.length === 1 && keywords[catKey][0] === "") ? (
                          <span className="text-xs text-gray-400 italic">Aucun mot-clé</span>
                        ) : (
                          keywords[catKey]?.map((kw, idx) => (
                            <span key={idx} className="bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded text-[11px] font-medium">
                              {kw}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Saisir / Modifier (séparés par des virgules)
                      </label>
                      <textarea
                        rows={2}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amani-primary bg-white resize-none"
                        value={keywords[catKey]?.join(", ") || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setKeywords(prev => ({
                            ...prev,
                            [catKey]: val.split(",").map(k => k.trim())
                          }));
                        }}
                        onBlur={() => {
                          handleUpdateKeywordsSilently(keywords);
                        }}
                        placeholder="Ex: mot1, mot2, mot3"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sources List Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-base font-bold text-gray-900">
                🌐 Sites de presse identifiés & Fiabilité
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Configurez le score de fiabilité (les sources sous 30/100 sont automatiquement ignorées lors de la veille) ou bloquez les domaines indésirables.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">Média / Nom</th>
                    <th className="px-6 py-4 font-bold">Domaine</th>
                    <th className="px-6 py-4 font-bold text-center">Score de Fiabilité</th>
                    <th className="px-6 py-4 font-bold text-center">Statut</th>
                    <th className="px-6 py-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sources.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                        Aucune source répertoriée pour le moment.
                      </td>
                    </tr>
                  ) : (
                    sources.map((src) => (
                      <tr key={src.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {src.name}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {src.domain}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={src.reliability_score}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setSources(prev => prev.map(s => s.id === src.id ? { ...s, reliability_score: val } : s));
                              }}
                              onMouseUp={(e) => {
                                const val = parseInt((e.target as HTMLInputElement).value, 10);
                                handleUpdateSourceStatusSilently(src.id, { reliability_score: val });
                              }}
                              onTouchEnd={(e) => {
                                const val = parseInt((e.target as HTMLInputElement).value, 10);
                                handleUpdateSourceStatusSilently(src.id, { reliability_score: val });
                              }}
                              className="w-24 accent-amani-primary"
                            />
                            <span className="font-bold text-gray-800 w-8">{src.reliability_score}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            src.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {src.status === "active" ? "Autorisé" : "Bloqué"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdateSourceStatus(src.id, {
                                reliability_score: src.reliability_score,
                                status: src.status === "active" ? "blacklisted" : "active"
                              })}
                              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                                src.status === "active" 
                                  ? "border-red-200 text-red-600 hover:bg-red-50" 
                                  : "border-green-200 text-green-600 hover:bg-green-50"
                              }`}
                            >
                              {src.status === "active" ? "Bloquer" : "Autoriser"}
                            </button>
                            <button
                              onClick={() => handleUpdateSourceStatus(src.id, {
                                reliability_score: src.reliability_score
                              })}
                              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:border-amani-primary hover:bg-amani-primary/5 font-medium transition-all"
                            >
                              Enregistrer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Draft Modal */}
      {editingDraft && (
        <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <Edit3 className="w-5 h-5 text-amani-primary" />
                Modifier le brouillon IA
              </h3>
              <button onClick={() => setEditingDraft(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Titre</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amani-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Résumé (Ce qu'il faut retenir)</label>
                <textarea
                  value={editForm.summary}
                  onChange={(e) => setEditForm(prev => ({ ...prev, summary: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amani-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contenu (HTML)</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amani-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Catégorie</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amani-primary bg-white"
                  >
                    <option value="economie">Économie</option>
                    <option value="marche">Marchés</option>
                    <option value="investissement">Investissement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tags (séparés par virgules)</label>
                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Mali, Coton, PIB..."
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amani-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={editForm.seo_title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, seo_title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amani-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">SEO Description</label>
                  <input
                    type="text"
                    value={editForm.seo_description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, seo_description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amani-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
              <button
                onClick={() => setEditingDraft(null)}
                className="text-xs font-semibold px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={saveEditDraft}
                className="bg-amani-primary hover:bg-amani-primary/95 text-white text-xs font-semibold px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
