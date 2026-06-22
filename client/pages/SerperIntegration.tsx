import { useState } from "react";
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

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname.includes("127.0.0.1");

const API_BASE_URL = isLocal ? "http://localhost:5000/api" : "/api";

export default function SerperIntegration() {
  const { user, hasPermission } = useAuth();
  const { success, error, warning } = useToast();
  
  const [query, setQuery] = useState("économie Afrique de l'Ouest");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState<string | null>(null); // "all" or specific link
  const [errorMessage, setErrorMessage] = useState("");

  if (!user || !hasPermission("create_articles")) {
    return (
      <DashboardLayout title="Accès refusé" subtitle="Permissions insuffisantes">
        <div className="flex items-center justify-center py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas les permissions requises pour accéder à l'importateur Serper.
            </p>
          </div>
        </div>
      </DashboardLayout>
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

      setNews(result.data || []);
      if ((result.data || []).length === 0) {
        warning("Aucune actualité trouvée pour cette recherche.");
      } else {
        success(`${(result.data || []).length} actualités récupérées avec succès.`);
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

      // If specific link, we might want to only import that.
      // But backend's handleImportNews imports the whole set for the query.
      // To simulate individual imports or just run the import query:
      const response = await fetch(`${API_BASE_URL}/news/import?q=${encodeURIComponent(query)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'importation.");
      }

      success(result.message || "Importation terminée avec succès !");
    } catch (err: any) {
      error(err.message || "Erreur d'importation.");
    } finally {
      setIsImporting(null);
    }
  };

  return (
    <DashboardLayout
      title="🌍 Importateur d'Actualités Serper"
      subtitle="Recherchez et importez des articles économiques du Sahel directement depuis Google News"
    >
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
                      <span>{new Date(item.date).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-base mb-3 leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {item.snippet}
                    </p>
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
    </DashboardLayout>
  );
}
