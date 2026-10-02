import { useState, useEffect } from "react";
import { API_BASE_URL } from "../services/apiConfig";
import { Link } from "react-router-dom";
import { Search, Globe, Plus, AlertCircle, CheckCircle2, Loader2, ArrowUpRight, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getSessionToken } from "../services/authService";
import DashboardLayout from "../components/DashboardLayout";

interface NewsArticle {
  title: string;
  link: string;
  snippet: string;
  date: string;
  source: string;
  imageUrl?: string | null;
}

function formatNewsDate(dateStr: string): string {
  if (!dateStr) return new Date().toLocaleDateString("fr-FR");
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("fr-FR");
  }
  return dateStr;
}

function sanitizeSnippet(text: string): string {
  if (!text) return "";

  let cleaned = text
    .replace(/[\u2026]/g, "")
    .replace(/(\s*\.\.\.\s*)+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const cutoffWords = new Set([
    "se", "aux", "du", "de", "le", "la", "les", "et", "à", "en", "pour", "par", "dans", "sur", "avec", 
    "un", "une", "des", "ce", "cette", "ces", "mon", "son", "sa", "ses", "nos", "vos", "leurs", "qui", 
    "que", "dont", "où", "destiné", "destinée", "destinés", "destinées", "visant", "conçu", "conçue", 
    "ayant", "étant", "faisant", "doit", "doivent", "va", "vont", "a", "ont"
  ]);

  const sentenceMatches = cleaned.match(/[^.!?]+[.!?]/g);

  if (sentenceMatches && sentenceMatches.length > 0) {
    const validSentences: string[] = [];
    for (const s of sentenceMatches) {
      const trimmed = s.trim();
      const words = trimmed.replace(/[.!?]+$/, "").trim().split(/\s+/);
      const lastWord = words[words.length - 1]?.toLowerCase();

      if (words.length >= 4 && !cutoffWords.has(lastWord)) {
        validSentences.push(trimmed);
      }
    }

    if (validSentences.length > 0) {
      return validSentences.join(" ");
    }
  }

  const words = cleaned.replace(/[.!?]+$/, "").trim().split(/\s+/);
  while (words.length > 3 && cutoffWords.has(words[words.length - 1].toLowerCase().replace(/[^a-z]/gi, ""))) {
    words.pop();
  }

  let result = words.join(" ").trim();
  if (result && !/[.!?]$/.test(result)) {
    result += ".";
  }
  return result;
}



export default function SerperIntegration() {
  const { user, hasPermission } = useAuth();
  const { success, error, warning } = useToast();
  
  const [query, setQuery] = useState("économie Afrique de l'Ouest");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState<string | null>(null); // "all" or specific link
  const [errorMessage, setErrorMessage] = useState("");
  const [importedArticles, setImportedArticles] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [articleSettings, setArticleSettings] = useState<Record<string, { categoryId?: string; featuredImage?: string; publishedAt?: string; status?: 'draft' | 'published'; summary?: string }>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const result = await response.json();
        if (response.ok && result.success) {
          setCategories(result.data || []);
        }
      } catch (err) {
        console.error("Erreur de récupération des catégories", err);
      }
    };
    fetchCategories();
  }, []);

  if (!user || !hasPermission("create_articles")) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions requises pour accéder à l'importateur Serper.
          </p>
        </div>
      </div>
    );
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMessage("");
    setNews([]);

    try {
      const token = getSessionToken();
      const response = await fetch(`${API_BASE_URL}/news?q=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Erreur de récupération des actualités.");
      }

      const fetchedNews = result.data || [];
      setNews(fetchedNews);

      // Prepopulate settings for each fetched article
      const initialSettings: Record<string, any> = {};
      const defaultCatId = categories.length > 0 ? categories[0].id : "";
      fetchedNews.forEach((item: NewsArticle) => {
        let formattedDate = new Date().toISOString().substring(0, 10);
        if (item.date) {
          const d = new Date(item.date);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toISOString().substring(0, 10);
          }
        }
        const cleanedSnippet = sanitizeSnippet(item.snippet || "");

        initialSettings[item.link] = {
          categoryId: defaultCatId,
          featuredImage: item.imageUrl || "",
          publishedAt: formattedDate,
          status: "draft",
          summary: cleanedSnippet || item.snippet || ""
        };
      });
      setArticleSettings(initialSettings);

      if (fetchedNews.length === 0) {
        warning("Aucune actualité trouvée pour cette recherche.");
      } else {
        success(`${fetchedNews.length} actualités récupérées avec succès.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de la connexion au serveur.");
      error(err.message || "Erreur de chargement.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (targetLink: string | "all") => {
    setIsImporting(targetLink);
    try {
      const token = getSessionToken();
      if (!token) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }

      let response;
      if (targetLink === "all") {
        response = await fetch(`${API_BASE_URL}/news/import?q=${encodeURIComponent(query)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
      } else {
        const found = news.find(n => n.link === targetLink);
        if (!found) throw new Error("Article introuvable.");

        const settings = articleSettings[targetLink] || {};

        response = await fetch(`${API_BASE_URL}/news/import`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            article: found,
            categoryId: settings.categoryId,
            featuredImage: settings.featuredImage,
            publishedAt: settings.publishedAt,
            status: settings.status || "draft",
            summary: settings.summary || ""
          }),
        });
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'importation.");
      }

      if (targetLink !== "all" && result.articleId) {
        setImportedArticles(prev => ({ ...prev, [targetLink]: result.articleId }));
      }
      success(result.message || "Importation terminée avec succès !");
    } catch (err: any) {
      error(err.message || "Erreur d'importation.");
    } finally {
      setIsImporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          🌍 Importateur d'Actualités Serper
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Recherchez et importez des articles économiques du Sahel directement depuis Google News
        </p>
      </div>

      <div className="space-y-6">
        {/* Search form bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: économie Mali, cours de la BRVM, coton Sahel..."
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-amani-primary text-white font-medium px-8 py-3 rounded-xl hover:bg-amani-primary/95 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Recherche...
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5" />
                  Rechercher
                </>
              )}
            </button>
          </form>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold">Une erreur est survenue</h4>
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {news.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                {news.length} résultats trouvés
              </h3>
              <button
                onClick={() => handleImport("all")}
                disabled={isImporting !== null}
                className="bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isImporting === "all" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importation...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Tout importer en Brouillons
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="font-semibold text-amani-primary px-2.5 py-1 bg-amani-primary/10 rounded-full">
                        {item.source}
                      </span>
                      <span>{formatNewsDate(item.date)}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-base mb-3 leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {sanitizeSnippet(item.snippet)}
                    </p>

                    {!importedArticles[item.link] && (
                      <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100 text-xs space-y-3">
                        <p className="font-bold text-gray-700">Options d'importation :</p>
                        
                        {/* Category Selector */}
                        <div className="grid grid-cols-3 items-center gap-2">
                          <label className="text-gray-500 font-medium">Catégorie :</label>
                          <select
                            value={articleSettings[item.link]?.categoryId || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setArticleSettings(prev => ({
                                ...prev,
                                [item.link]: {
                                  ...(prev[item.link] || { featuredImage: "", publishedAt: "", status: "draft" }),
                                  categoryId: val
                                }
                              }));
                            }}
                            className="col-span-2 bg-white border border-gray-200 rounded p-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-amani-primary"
                          >
                            <option value="">Sélectionner une catégorie</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Image URL Input */}
                        <div className="grid grid-cols-3 items-center gap-2">
                          <label className="text-gray-500 font-medium">Image URL :</label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={articleSettings[item.link]?.featuredImage || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setArticleSettings(prev => ({
                                ...prev,
                                [item.link]: {
                                  ...(prev[item.link] || { categoryId: "", publishedAt: "", status: "draft" }),
                                  featuredImage: val
                                }
                              }));
                            }}
                            className="col-span-2 bg-white border border-gray-200 rounded p-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-amani-primary"
                          />
                        </div>

                        {/* Publication Date Input */}
                        <div className="grid grid-cols-3 items-center gap-2">
                          <label className="text-gray-500 font-medium">Date pub. :</label>
                          <input
                            type="date"
                            value={articleSettings[item.link]?.publishedAt || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setArticleSettings(prev => ({
                                ...prev,
                                [item.link]: {
                                  ...(prev[item.link] || { categoryId: "", featuredImage: "", status: "draft" }),
                                  publishedAt: val
                                }
                              }));
                            }}
                            className="col-span-2 bg-white border border-gray-200 rounded p-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-amani-primary"
                          />
                        </div>

                        {/* Summary Input */}
                        <div className="grid grid-cols-3 items-start gap-2">
                          <label className="text-gray-500 font-medium pt-1">Résumé (Retenir) :</label>
                          <textarea
                            placeholder="Ce qu'il faut retenir de l'article..."
                            value={articleSettings[item.link]?.summary || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setArticleSettings(prev => ({
                                ...prev,
                                [item.link]: {
                                  ...(prev[item.link] || { categoryId: "", featuredImage: "", publishedAt: "", status: "draft" }),
                                  summary: val
                                }
                              }));
                            }}
                            rows={3}
                            className="col-span-2 bg-white border border-gray-200 rounded p-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-amani-primary resize-y"
                          />
                        </div>

                        {/* Status Selector */}
                        <div className="grid grid-cols-3 items-center gap-2">
                          <label className="text-gray-500 font-medium">Statut :</label>
                          <select
                            value={articleSettings[item.link]?.status || "draft"}
                            onChange={(e) => {
                              const val = e.target.value as 'draft' | 'published';
                              setArticleSettings(prev => ({
                                ...prev,
                                [item.link]: {
                                  ...(prev[item.link] || { categoryId: "", featuredImage: "", publishedAt: "", summary: "" }),
                                  status: val
                                }
                              }));
                            }}
                            className="col-span-2 bg-white border border-gray-200 rounded p-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-amani-primary"
                          >
                            <option value="draft">Brouillon (Draft)</option>
                            <option value="published">Publié (Published)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amani-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      Source d'origine
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                    
                    {importedArticles[item.link] ? (
                      <Link
                        to={`/dashboard/articles/edit/${importedArticles[item.link]}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-yellow-600 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-700 hover:text-yellow-800 transition-all flex items-center gap-1"
                      >
                        Modifier l'article →
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleImport(item.link)}
                        disabled={isImporting !== null}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-amani-primary hover:bg-amani-primary/5 transition-all text-gray-700 hover:text-amani-primary flex items-center gap-1"
                      >
                        {isImporting === item.link ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        Importer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && news.length === 0 && !errorMessage && (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Prêt à importer</h3>
            <p className="text-gray-600 text-sm mb-6">
              Saisissez des termes de recherche pour charger des articles d'actualité en direct sur l'Afrique de l'Ouest et les ajouter à votre base de données en tant que brouillons éditables.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
