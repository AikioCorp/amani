import { Link } from "react-router-dom";
import React from "react";
import { API_BASE_URL as API_BASE } from "../services/apiConfig";
import {
  TrendingUp,
  TrendingDown,
  Play,
  ArrowRight,
  
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Award,
  BarChart3,
  Globe,
  Briefcase,
  Users,
  Target,
  Clock,
  
  Bell,
  Download,
  BookOpen,
  Mic,
  Video,
  PieChart,
  Lightbulb,
  Shield,
  Zap,
  Heart,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import InteractiveMap from "../components/InteractiveMap";
import { fetchBRVMData, BRVMData } from "../services/brvmApi";
import {
  fetchCommoditiesData,
  CommoditiesData,
  getCommodityIcon,
} from "../services/commoditiesApi";

// Feature flags for market widgets (BRVM & Commodities)
// - ENABLE_MARKET_WIDGET: controls rendering of the section
// - ENABLE_MARKET_FETCH: activé — l'API sert désormais des données réelles
//   (brvm.org + sikafinance) depuis un snapshot en base, réponse rapide.
const ENABLE_MARKET_WIDGET = true;
const ENABLE_MARKET_FETCH = true;

interface ArticleSectionProps {
  title: string;
  subtitle?: string;
  viewAllLink: string;
  articles: any[];
  loading: boolean;
}

const ArticleSection: React.FC<ArticleSectionProps> = ({
  title,
  subtitle,
  viewAllLink,
  articles = [],
  loading,
}) => {
  const featured = articles[0];
  const listItems = articles.slice(1, 4);

  if (!loading && (!articles || articles.length === 0)) {
    return null;
  }

  return (
    <section className="py-14 bg-white border-b border-[#E5DDD5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 mb-8 border-b border-[#E5DDD5]">
          <div>
            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#9C8464] pl-3 leading-none uppercase tracking-wider">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-2 font-medium italic">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            to={viewAllLink}
            className="text-xs font-semibold text-[#9C8464] hover:opacity-80 transition-opacity whitespace-nowrap ml-4"
          >
            Voir plus →
          </Link>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-3 gap-8 animate-pulse">
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-[16/10] bg-gray-200 rounded-lg" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
            <div className="lg:col-span-1 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-24 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Featured Article */}
            <div className="lg:col-span-2">
              {featured && (
                <Link to={`/article/${featured.id}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={featured.featured_image || '/placeholder.svg'}
                      alt={featured.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      loading="lazy"
                    />
                    {featured.category_info?.name && (
                      <span className="absolute top-4 left-4 bg-black/80 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded">
                        {featured.category_info.name}
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    {featured.published_at && (
                      <span className="block text-[11px] font-bold text-[#9C8464] tracking-wider mb-1 uppercase">
                        {new Date(featured.published_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-gray-950 leading-snug group-hover:text-[#9C8464] transition-colors mb-2">
                      {featured.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {featured.summary}
                    </p>
                  </div>
                </Link>
              )}
            </div>

            {/* Sidebar list */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {listItems.map((item, index) => (
                <Link key={index} to={`/article/${item.id}`} className="group flex gap-4">
                  <img
                    src={item.featured_image || '/placeholder.svg'}
                    alt={item.title}
                    className="w-24 h-20 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-[#9C8464] tracking-widest uppercase mb-1">
                      {item.category_info?.name || 'ACTUALITÉ'}
                      {item.read_time && ` • ${item.read_time} MIN READ`}
                    </div>
                    <h4 className="text-sm font-bold text-gray-950 leading-snug line-clamp-2 group-hover:text-[#9C8464] transition-colors">
                      {item.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default function Index() {
  // État pour les données BRVM et commodités en temps réel
  const [brvmData, setBrvmData] = React.useState<BRVMData | null>(null);
  const [commoditiesData, setCommoditiesData] =
    React.useState<CommoditiesData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);

  // Données de contenu chargées unifiées depuis l'API homepage
  const [articles, setArticles] = React.useState<any[]>([]);
  const [podcasts, setPodcasts] = React.useState<any[]>([]);
  const [ecoArticles, setEcoArticles] = React.useState<any[]>([]);
  const [marketFinArticles, setMarketFinArticles] = React.useState<any[]>([]);
  const [marketBoursArticles, setMarketBoursArticles] = React.useState<any[]>([]);
  const [industryArticles, setIndustryArticles] = React.useState<any[]>([]);
  const [investArticles, setInvestArticles] = React.useState<any[]>([]);
  const [insightsArticles, setInsightsArticles] = React.useState<any[]>([]);
  const [techArticles, setTechArticles] = React.useState<any[]>([]);
  const [loadingContent, setLoadingContent] = React.useState(true);

  const loadingArticles = loadingContent;
  const loadingPodcasts = loadingContent;
  const loadingEco = loadingContent;
  const loadingMarket = loadingContent;
  const loadingIndustry = loadingContent;
  const loadingInvest = loadingContent;
  const loadingInsights = loadingContent;
  const loadingTech = loadingContent;

  const marketArticles = React.useMemo(() => {
    const list = [...(marketFinArticles || []), ...(marketBoursArticles || [])];
    const sorted = list.sort((a, b) => {
      const aDate = (a.published_at || a.created_at) ? new Date(a.published_at || a.created_at).getTime() : 0;
      const bDate = (b.published_at || b.created_at) ? new Date(b.published_at || b.created_at).getTime() : 0;
      return bDate - aDate;
    });
    return sorted.slice(0, 4);
  }, [marketFinArticles, marketBoursArticles]);


  // Fonction pour charger toutes les données (BRVM + Commodités)
  const loadAllData = async (isManual = false) => {
    try {
      if (isManual) {
        setLoading(true);
      }
      const [brvmResponse, commoditiesResponse] = await Promise.allSettled([
        fetchBRVMData(),
        fetchCommoditiesData(),
      ]);

      if (brvmResponse.status === "fulfilled") {
        setBrvmData(brvmResponse.value);
      } else {
        console.error("Erreur BRVM:", brvmResponse.reason);
      }

      if (commoditiesResponse.status === "fulfilled") {
        setCommoditiesData(commoditiesResponse.value);
      } else {
        console.error("Erreur commodités:", commoditiesResponse.reason);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHomepageContent = async () => {
    try {
      setLoadingContent(true);


      const res = await fetch(`${API_BASE}/contents/homepage`);
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      
      if (json.success && json.data) {
        const homeData = json.data;
        setArticles(homeData.latestArticles || []);
        setPodcasts(homeData.latestPodcasts || []);
        setEcoArticles(homeData.economie || []);
        setMarketFinArticles(homeData.marchesFinanciers || []);
        setMarketBoursArticles(homeData.marchesBoursiers || []);
        setIndustryArticles(homeData.industrieMiniere || []);
        setInvestArticles(homeData.investissement || []);
        setInsightsArticles(homeData.insights || []);
        setTechArticles(homeData.technologie || []);
      }
    } catch (error) {
      console.error("Erreur chargement contenu homepage:", error);
    } finally {
      setLoadingContent(false);
    }
  };

  // Charger les données au démarrage
  React.useEffect(() => {
    loadHomepageContent();

    if (ENABLE_MARKET_FETCH) {
      loadAllData();
      const interval = setInterval(loadAllData, 5 * 60 * 1000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, []);


  // Convertir les données BRVM pour l'affichage
  const keyIndices = React.useMemo(() => {
    if (!brvmData) {
      // Données de fallback
      return [
        { name: "BRVM", value: "185.42", change: "+2.3%", trend: "up" },
        {
          name: "FCFA/EUR",
          value: "655.957",
          change: "0%",
          trend: "neutral",
        },
        {
          name: "Inflation",
          value: "4.2%",
          change: "+0.5%",
          trend: "up",
        },
        { name: "Taux BCEAO", value: "3.5%", change: "0%", trend: "neutral" },
      ];
    }

    const getTrend = (changeStr: string, isPositive: boolean) => {
      if (!changeStr || changeStr === "0" || changeStr === "0%" || changeStr.startsWith("0")) return "neutral";
      return isPositive ? "up" : "down";
    };

    return [
      {
        name: "BRVM",
        value: brvmData.composite.value,
        change: brvmData.composite.changePercent,
        trend: getTrend(brvmData.composite.changePercent, brvmData.composite.isPositive),
      },
      {
        name: "FCFA/EUR",
        value: brvmData.fcfa_eur.value,
        change: brvmData.fcfa_eur.changePercent,
        trend: getTrend(brvmData.fcfa_eur.changePercent, brvmData.fcfa_eur.isPositive),
      },
      {
        name: "Inflation",
        value: brvmData.inflation.value,
        change: brvmData.inflation.changePercent,
        trend: getTrend(brvmData.inflation.changePercent, brvmData.inflation.isPositive),
      },
      {
        name: "Taux BCEAO",
        value: brvmData.taux_bceao.value,
        change: brvmData.taux_bceao.changePercent,
        trend: getTrend(brvmData.taux_bceao.changePercent, brvmData.taux_bceao.isPositive),
      },
    ];
  }, [brvmData]);

  // Bandeau « Marchés & Indices BRVM » : composite + top actions réelles.
  const tickerItems = React.useMemo(() => {
    if (!brvmData) {
      return [
        { name: "BRVM Composite", value: "—", change: "", trend: "neutral" as const },
      ];
    }
    const items: Array<{ name: string; value: string; change: string; trend: "up" | "down" | "neutral" }> = [
      {
        name: "BRVM Composite",
        value: brvmData.composite.value,
        change: brvmData.composite.changePercent,
        trend: brvmData.composite.isPositive ? "up" : "down",
      },
    ];
    (brvmData.topStocks || []).slice(0, 5).forEach((s) => {
      items.push({
        name: s.symbol,
        value: s.price,
        change: s.changePercent,
        trend: s.changePercent?.startsWith("0") || s.changePercent === "+0.00%" ? "neutral" : s.isPositive ? "up" : "down",
      });
    });
    return items;
  }, [brvmData]);

  // Dérivés pour l'affichage public
  const heroArticle = React.useMemo(() => articles?.[0], [articles]);
  const otherArticles = React.useMemo(() => (articles || []).slice(1, 4), [articles]);

  return (
    <div className="min-h-screen bg-[#FDFBF9] font-sans antialiased text-gray-900">
      
      {/* Hero Section – utilise le dernier article publié s'il existe */}
      <section className="bg-[#373B3A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight">À la une</h1>
              <h2 className="text-2xl lg:text-3xl font-bold mb-4 leading-snug">
                <Link
                  to={heroArticle ? `/article/${heroArticle.id}` : "/article/1"}
                  className="hover:text-[#EADFC9] transition-colors"
                >
                  {heroArticle ? heroArticle.title : "La Plateforme Interopérable du Système de Paiement Instantané (PI-SPI) de la BCEAO"}
                </Link>
              </h2>
            </div>
            <div className="relative">
              <img
                src={heroArticle?.featured_image || "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80"}
                alt={heroArticle?.title || "La Plateforme Interopérable du Système de Paiement Instantané (PI-SPI) de la BCEAO"}
                className="w-full h-80 object-cover rounded-2xl shadow-2xl"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Indices Widget - BRVM en temps réel */}
      {ENABLE_MARKET_WIDGET && (
        <section className="py-8 bg-white border-b border-[#F0EAE1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Indices BRVM en temps réel
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (ENABLE_MARKET_FETCH) {
                      loadAllData(true);
                    } else {
                      setLastUpdate(new Date());
                    }
                  }}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  Actualiser
                </button>
                <Link to="/indices" className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                  Voir tous les indices →
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {keyIndices.map((index, i) => (
                <div
                  key={i}
                  className="bg-[#FDFDFD] border border-gray-100 p-6 rounded-xl relative hover:shadow-sm transition-all"
                >
                  <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-3">
                    {index.name}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-black text-gray-900">
                      {index.value}
                    </span>
                    <RefreshCw className="w-3.5 h-3.5 text-gray-300 cursor-pointer hover:text-[#9C8464] transition-colors" />
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-bold ${
                    index.trend === "up" ? "text-green-600" : index.trend === "down" ? "text-red-600" : "text-gray-400"
                  }`}>
                    {index.trend === "up" && <span>↗</span>}
                    {index.trend === "down" && <span>↘</span>}
                    {index.trend === "neutral" && <span>→</span>}
                    <span>{index.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 1. Dernières Actualités Section */}
      <section className="py-12 bg-white border-b border-[#F0EAE1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-4 mb-8 border-b border-[#EADFC9]">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-[#9C8464] block rounded-sm"></span>
              <h2 className="text-xl font-bold tracking-wider text-gray-900 uppercase">
                Dernières Actualités
              </h2>
            </div>
            <Link
              to="/actualites"
              className="text-xs font-bold text-[#9C8464] hover:underline uppercase tracking-widest whitespace-nowrap"
            >
              Voir toutes les actualités →
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left featured article (Overlay card style) */}
            <div className="lg:col-span-2">
              {articles && articles[0] ? (
                <Link to={`/article/${articles[0].id}`} className="group relative block h-[450px] overflow-hidden rounded-xl bg-gray-900 shadow-lg">
                  <img
                    src={articles[0].featured_image || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80'}
                    alt={articles[0].title}
                    className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end h-full text-white">
                    <span className="self-start mb-3 bg-[#9C8464] text-white text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-sm">
                      À la une
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold leading-snug mb-3 drop-shadow-sm group-hover:text-[#EADFC9] transition-colors">
                      {articles[0].title}
                    </h3>
                    <p className="text-sm text-gray-200 line-clamp-2 font-medium opacity-90 max-w-2xl">
                      {articles[0].summary}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="h-[450px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                  Aucun article disponible
                </div>
              )}
            </div>

            {/* Right stack list */}
            <div className="lg:col-span-1 flex flex-col gap-3">
              {(articles || []).slice(1, 5).map((item, index) => (
                <Link key={index} to={`/article/${item.id}`} className="group flex gap-4 items-center bg-gray-50/50 p-3 rounded-lg border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="relative w-28 h-20 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                    <img
                      src={item.featured_image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80'}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-[#9C8464] tracking-widest uppercase mb-1 block">
                      {item.category_info?.name || 'ACTUALITÉ'}
                    </span>
                    <h4 className="text-sm font-bold text-gray-950 leading-snug line-clamp-2 group-hover:text-[#9C8464] transition-colors mb-1">
                      {item.title}
                    </h4>
                    {item.read_time && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        {item.read_time} min de lecture
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Actualités Économiques Section */}
      <section className="py-12 bg-[#373B3A] text-white border-b border-[#2C2F2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-8 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#9C8464] block rounded-sm"></span>
              <h2 className="text-xl font-bold tracking-wider text-white uppercase">
                Actualités Économiques
              </h2>
            </div>
            <Link
              to="/economie"
              className="text-[10px] font-extrabold border border-white/10 text-white bg-transparent hover:bg-white/5 px-3 py-1.5 rounded uppercase tracking-wider transition-colors"
            >
              Voir +
            </Link>
          </div>

          {/* Top Block: Split row */}
          {ecoArticles && ecoArticles[0] ? (
            <div className="grid lg:grid-cols-5 gap-8 items-start mb-8 pb-8 border-b border-white/10">
              {/* Image Left */}
              <div className="lg:col-span-3">
                <Link to={`/article/${ecoArticles[0].id}`} className="group block overflow-hidden rounded-xl bg-gray-900 aspect-[16/9] shadow-sm relative">
                  {ecoArticles[0].featured_image ? (
                    <img
                      src={ecoArticles[0].featured_image}
                      alt={ecoArticles[0].title}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-102 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2C2F2E] to-[#9C8464] flex items-center justify-center">
                      <TrendingUp className="w-12 h-12 text-white/40" />
                    </div>
                  )}
                </Link>
              </div>
              {/* Title & Summary Right */}
              <div className="lg:col-span-2">
                <Link to={`/article/${ecoArticles[0].id}`} className="group block">
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-snug font-serif group-hover:text-[#EADFC9] transition-colors mb-4">
                    {ecoArticles[0].title}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
                    {ecoArticles[0].summary}
                  </p>
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-[250px] bg-white/5 rounded-xl flex items-center justify-center text-gray-400 mb-8 border border-white/10">
              Aucun article disponible
            </div>
          )}

          {/* Bottom Block: 2x2 Grid */}
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            {(ecoArticles || []).slice(1, 5).map((item, index) => (
              <Link key={index} to={`/article/${item.id}`} className="group flex gap-4 items-center">
                <div className="relative w-28 h-20 overflow-hidden rounded-lg bg-gray-900 flex-shrink-0 border border-white/10 shadow-sm flex items-center justify-center">
                  {item.featured_image ? (
                    <img
                      src={item.featured_image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2C2F2E] to-[#3E342B] flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <BarChart3 className="w-6 h-6 text-[#9C8464]/60" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-[#9C8464] tracking-widest uppercase mb-1 block">
                    {item.category_info?.name || 'ACTUALITÉ'}
                  </span>
                  <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-[#EADFC9] transition-colors">
                    {item.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom right see all button */}
          <div className="flex justify-end mt-8">
            <Link
              to="/economie"
              className="text-xs font-bold bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/40 px-4 py-2.5 rounded transition-all"
            >
              + Toute l'actualité éco
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Marchés & Indices BRVM (Clean dynamic flex row with vertical separators) */}
      <section className="py-8 bg-white border-b border-[#F0EAE1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-gray-100">
            <h3 className="text-xs font-extrabold tracking-widest text-gray-400 uppercase">
              Marchés & Indices BRVM
            </h3>
            <button
              onClick={() => {
                if (ENABLE_MARKET_FETCH) {
                  loadAllData(true);
                } else {
                  setLastUpdate(new Date());
                }
              }}
              disabled={loading}
              className="flex items-center gap-1 text-xs font-bold text-[#9C8464] hover:opacity-80 transition-opacity"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              <span className="text-[10px] tracking-wider uppercase">Actualiser les flux</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-gray-100">
            {tickerItems.map((idx, i) => (
              <div key={i} className="px-6 py-2 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                  {idx.name}
                </span>
                <div className="text-lg font-black text-gray-900 mb-1">
                  {idx.value}
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-extrabold ${
                  idx.trend === 'up' ? 'text-green-600' : idx.trend === 'down' ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {idx.trend === 'up' && <span>↗</span>}
                  {idx.trend === 'down' && <span>↘</span>}
                  {idx.trend === 'neutral' && <span>→</span>}
                  <span>{idx.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Industrie Section */}
      <section className="py-12 bg-white border-b border-[#F0EAE1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-4 mb-8 border-b border-[#EADFC9]">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-[#9C8464] block rounded-sm"></span>
              <h2 className="text-xl font-bold tracking-wider text-gray-900 uppercase">
                Industrie
              </h2>
            </div>
            <Link
              to="/industrie"
              className="text-xs font-bold text-[#9C8464] hover:underline uppercase tracking-widest whitespace-nowrap"
            >
              Voir plus d'industrie →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {(industryArticles || []).slice(0, 3).map((item, index) => (
              <Link key={index} to={`/article/${item.id}`} className="group block bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
                  <img
                    src={item.featured_image || 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80'}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-extrabold text-[#9C8464] tracking-widest uppercase mb-2 block">
                    {item.category_info?.name || 'INDUSTRIE'}
                  </span>
                  <h3 className="text-base font-bold text-gray-950 leading-snug group-hover:text-[#9C8464] transition-colors mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>
              </Link>
            ))}
            {(!industryArticles || industryArticles.length === 0) && (
              <div className="col-span-3 text-center text-gray-400 py-12">Aucun article industriel disponible</div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Investissement Section */}
      <section className="py-12 bg-white border-b border-[#F0EAE1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-4 mb-8 border-b border-[#EADFC9]">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-[#9C8464] block rounded-sm"></span>
                <h2 className="text-xl font-bold tracking-wider text-gray-900 uppercase">
                  Investissement
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium italic">
                Opportunités et mouvements d'investissement stratégiques
              </p>
            </div>
            <Link
              to="/investissement"
              className="text-xs font-bold text-[#9C8464] hover:underline uppercase tracking-widest whitespace-nowrap"
            >
              Voir plus d'investissements →
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Block 1: Image Left, Content Right */}
            {investArticles && investArticles[0] && (
              <Link to={`/article/${investArticles[0].id}`} className="group flex flex-col md:flex-row overflow-hidden bg-white border border-[#EBE6DD] rounded-xl hover:shadow-md transition-shadow h-full">
                <div className="relative md:w-1/2 aspect-video md:aspect-auto overflow-hidden bg-gray-50 min-h-[220px]">
                  <img
                    src={investArticles[0].featured_image || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80'}
                    alt={investArticles[0].title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 md:w-1/2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#9C8464] tracking-widest uppercase mb-2 block">
                      FOCUS CAPITAL RISQUE
                    </span>
                    <h3 className="text-base font-bold text-gray-950 leading-snug group-hover:text-[#9C8464] transition-colors mb-2 line-clamp-3">
                      {investArticles[0].title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4">
                      {investArticles[0].summary}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#9C8464] uppercase tracking-widest group-hover:opacity-85 transition-opacity">
                    Découvrir le dossier &gt;
                  </span>
                </div>
              </Link>
            )}

            {/* Block 2: Content Left, Image Right */}
            {investArticles && investArticles[1] && (
              <Link to={`/article/${investArticles[1].id}`} className="group flex flex-col md:flex-row overflow-hidden bg-white border border-[#EBE6DD] rounded-xl hover:shadow-md transition-shadow h-full">
                <div className="p-6 md:w-1/2 flex flex-col justify-between order-2 md:order-1">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#9C8464] tracking-widest uppercase mb-2 block">
                      PRIVATE EQUITY
                    </span>
                    <h3 className="text-base font-bold text-gray-950 leading-snug group-hover:text-[#9C8464] transition-colors mb-2 line-clamp-3">
                      {investArticles[1].title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4">
                      {investArticles[1].summary}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#9C8464] uppercase tracking-widest group-hover:opacity-85 transition-opacity">
                    Voir l'analyse sectorielle &gt;
                  </span>
                </div>
                <div className="relative md:w-1/2 aspect-video md:aspect-auto overflow-hidden bg-gray-50 min-h-[220px] order-1 md:order-2">
                  <img
                    src={investArticles[1].featured_image || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80'}
                    alt={investArticles[1].title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 6. Insights (Expert Quotes) Section */}
      <section className="py-12 bg-white border-b border-[#F0EAE1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-4 mb-8 border-b border-[#EADFC9]">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-[#9C8464] block rounded-sm"></span>
                <h2 className="text-xl font-bold tracking-wider text-gray-900 uppercase">
                  Insights
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium italic">
                Analyses et perspectives exclusives des leaders du secteur
              </p>
            </div>
            <Link
              to="/insights"
              className="text-xs font-bold text-[#9C8464] hover:underline uppercase tracking-widest whitespace-nowrap"
            >
              Voir tous les insights →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {(insightsArticles || []).slice(0, 2).map((item, index) => (
              <div key={index} className="bg-white border border-[#EBE6DD] rounded-xl p-8 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-6 right-8 text-6xl text-[#EADFC9] font-serif select-none leading-none">”</div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                    <img
                      src={item.author?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                      alt={item.author?.first_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900">
                      {item.author ? `${item.author.first_name} ${item.author.last_name}` : 'Dr. Karim Traoré'}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {item.author?.bio || 'Économiste Principal, CDAO'}
                    </span>
                  </div>
                </div>

                <blockquote className="text-sm font-bold text-gray-900 mb-4 italic leading-relaxed">
                  "{item.title}"
                </blockquote>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                  {item.summary}
                </p>

                <Link
                  to={`/article/${item.id}`}
                  className="text-[10px] font-bold text-[#9C8464] uppercase tracking-widest hover:underline"
                >
                  Lire l'analyse complète &gt;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Tech & Innovation Section (Dark background, futuristic aesthetics) */}
      <section className="py-16 bg-[#181C1B] text-white border-b border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-4 mb-10 border-b border-gray-800">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-[#9C8464] block rounded-sm"></span>
                <h2 className="text-xl font-bold tracking-wider text-white uppercase">
                  Tech & Innovation
                </h2>
              </div>
              <p className="text-xs text-gray-400 mt-2 font-medium italic">
                Innovations technologiques au service de la transformation économique
              </p>
            </div>
            <Link
              to="/tech"
              className="text-xs font-bold text-[#9C8464] hover:underline uppercase tracking-widest whitespace-nowrap"
            >
              Voir plus de tech →
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left featured tech article (Full size with blueprint/code background) */}
            <div className="lg:col-span-2">
              {techArticles && techArticles[0] ? (
                <Link to={`/article/${techArticles[0].id}`} className="group relative block h-[420px] overflow-hidden rounded-xl bg-[#101413] border border-gray-800">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#9C8464_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <img
                    src={techArticles[0].featured_image || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80'}
                    alt={techArticles[0].title}
                    className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-102 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101413] via-[#101413]/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end h-full">
                    <span className="self-start mb-3 bg-[#9C8464] text-white text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-sm">
                      Blockchain
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold leading-snug mb-3 group-hover:text-[#EADFC9] transition-colors">
                      {techArticles[0].title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {techArticles[0].summary}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="h-[420px] bg-[#111] rounded-xl border border-gray-800 flex items-center justify-center text-gray-600">
                  Aucun contenu Tech disponible
                </div>
              )}
            </div>

            {/* Right side tech articles list */}
            <div className="lg:col-span-1 flex flex-col justify-between gap-6">
              {(techArticles || []).slice(1, 3).map((item, index) => (
                <Link key={index} to={`/article/${item.id}`} className="group block bg-[#202524] border border-gray-800 rounded-xl p-6 hover:border-[#9C8464] transition-colors h-[200px] flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#9C8464] tracking-widest uppercase mb-2 block">
                      FINTECH
                    </span>
                    <h4 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-[#EADFC9] transition-colors mb-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold block">
                    {item.published_at ? new Date(item.published_at).toLocaleDateString('fr-FR') : ''}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Podcast Section (Premium bronze layout) */}
      <section className="py-16 bg-[#2B231A] text-white border-b border-[#1E1712]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-10 border-b border-[#3E342B]">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-[#9C8464]" />
              <h2 className="text-xl font-bold tracking-wider uppercase">
                Amani Podcast : L'Économie à l'oreille
              </h2>
            </div>
            <button className="border border-[#9C8464] text-[#9C8464] text-[10px] font-extrabold uppercase tracking-widest px-4 py-2.5 rounded hover:bg-[#9C8464] hover:text-white transition-all self-start sm:self-auto">
              S'abonner aux podcasts
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {podcasts && podcasts[0] ? (
              <div className="bg-[#1E1712] border border-[#3E342B] rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow">
                {/* Active Podcast visual & Play */}
                <div className="relative w-full md:w-44 aspect-video md:aspect-square rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                  <img
                    src={podcasts[0].featured_image || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=300&q=80'}
                    alt={podcasts[0].title}
                    className="absolute inset-0 w-full h-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-12 h-12 bg-[#9C8464] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#9C8464] tracking-widest uppercase mb-1 block">
                      ÉMISSION EN COURS
                    </span>
                    <h3 className="text-base font-bold leading-snug mb-2 hover:text-[#EADFC9] cursor-pointer">
                      {podcasts[0].title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                      {podcasts[0].summary}
                    </p>
                  </div>
                  
                  {/* progress track simulation */}
                  <div className="space-y-2">
                    <div className="w-full bg-[#3E342B] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#9C8464] w-2/3 h-full rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                      <span>{podcasts[0].podcast_data?.duration || '08:12'}</span>
                      <span>12:45</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1E1712] border border-[#3E342B] rounded-xl p-8 text-center text-gray-500">
                Aucun podcast disponible
              </div>
            )}

            {podcasts && podcasts[1] ? (
              <div className="bg-[#1E1712] border border-[#3E342B] rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow">
                {/* Active Podcast visual & Play */}
                <div className="relative w-full md:w-44 aspect-video md:aspect-square rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                  <img
                    src={podcasts[1].featured_image || 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=300&q=80'}
                    alt={podcasts[1].title}
                    className="absolute inset-0 w-full h-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg hover:scale-105 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#9C8464] tracking-widest uppercase mb-1 block">
                      ÉPISODE PRÉCÉDENT
                    </span>
                    <h3 className="text-base font-bold leading-snug mb-2 hover:text-[#EADFC9] cursor-pointer">
                      {podcasts[1].title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                      {podcasts[1].summary}
                    </p>
                  </div>
                  
                  {/* duration badge */}
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold border-t border-[#3E342B] pt-3">
                    <span>Durée : {podcasts[1].podcast_data?.duration || '15:30'}</span>
                    <span>Publié le {podcasts[1].published_at ? new Date(podcasts[1].published_at).toLocaleDateString('fr-FR') : ''}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1E1712] border border-[#3E342B] rounded-xl p-8 text-center text-gray-500">
                Aucun second podcast disponible
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Commodities Section */}
      {commoditiesData && (
        <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-amani-primary mb-4">
                Matières Premières
              </h2>
              <p className="text-xl text-gray-600">
                Prix en temps réel des commodités importantes pour l'Afrique
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                commoditiesData.gold,
                commoditiesData.cotton,
                commoditiesData.oil_brent,
                commoditiesData.cocoa,
              ].map((commodity, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">
                      {getCommodityIcon(commodity.symbol)}
                    </span>
                    <div
                      className={`flex items-center gap-1 text-sm font-semibold ${commodity.isPositive ? "text-green-600" : "text-red-600"}`}
                    >
                      {commodity.isPositive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {commodity.changePercent}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {commodity.name}
                  </h3>
                  <div className="text-2xl font-bold text-amani-primary mb-1">
                    ${commodity.price}
                  </div>
                  <div className="text-sm text-gray-500">{commodity.unit}</div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/indices"
                className="inline-flex items-center gap-2 bg-amani-primary text-white px-8 py-4 rounded-xl hover:bg-gray-700 transition-colors font-semibold text-lg"
              >
                <Globe className="w-6 h-6" />
                Voir tous les prix
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Map Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-amani-primary mb-8 text-center">
            Carte interactive du Sahel & Tchad
          </h2>
          <InteractiveMap />
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#373B3A] mb-6">
              Nos Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une gamme complète de services pour comprendre l'économie
              africaine
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "Analyses de Marché",
                description:
                  "Données en temps réel sur les indices boursiers, taux de change et indicateurs économiques",
                color: "bg-blue-500",
              },
              {
                icon: Lightbulb,
                title: "Insights Stratégiques",
                description:
                  "Analyses approfondies et prospectives par nos experts économistes",
                color: "bg-yellow-500",
              },
              {
                icon: Globe,
                title: "Veille Économique",
                description:
                  "Actualités et tendances des économies africaines mises à jour quotidiennement",
                color: "bg-green-500",
              },
              {
                icon: Video,
                title: "Podcasts Experts",
                description:
                  "Interviews exclusives avec les leaders économiques et analyses sectorielles",
                color: "bg-purple-500",
              },
              {
                icon: Target,
                title: "Opportunités d'Investissement",
                description:
                  "Identification et analyse des meilleures opportunités d'investissement",
                color: "bg-red-500",
              },
              {
                icon: Shield,
                title: "Conseil Stratégique",
                description:
                  "Accompagnement personnalisé pour vos décisions d'investissement",
                color: "bg-indigo-500",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group"
              >
                <div
                  className={`${service.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#373B3A] mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Amani Section */}
      <section className="py-20 bg-gradient-to-br from-[#373B3A] to-gray-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Pourquoi Choisir Amani Finance ?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Notre expertise au service de votre compréhension de l'économie
              africaine
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: CheckCircle,
                title: "Expertise Locale",
                description:
                  "Une équipe d'experts basés en Afrique avec une connaissance approfondie des marchés locaux",
              },
              {
                icon: Zap,
                title: "Données en Temps Réel",
                description:
                  "Accès instantané aux dernières données économiques et financières",
              },
              {
                icon: Heart,
                title: "Information Digestible",
                description:
                  "Notre mission : rendre l'information économique accessible et compréhensible",
              },
              {
                icon: Globe,
                title: "Couverture Complète",
                description:
                  "Analyse de tous les secteurs économiques clés d'Afrique de l'Ouest",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-colors duration-300">
                  <feature.icon className="w-10 h-10 text-[#E5DDD5]" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#373B3A] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div>
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fa7441c9084eb43e6855cf7e960c5c609%2F6ebebc1a91e8447db48a68aa5b391a28?format=webp&width=800"
                alt="Amani"
                className="h-12 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-gray-300 mb-4">
                Votre source d'information économique pour l'Afrique de l'Ouest
                et le Mali.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link to="/marche" className="hover:text-white">
                    Marché
                  </Link>
                </li>
                <li>
                  <Link to="/economie" className="hover:text-white">
                    Économie
                  </Link>
                </li>
                <li>
                  <Link to="/industrie" className="hover:text-white">
                    Industrie
                  </Link>
                </li>
                <li>
                  <Link to="/investissement" className="hover:text-white">
                    Investissement
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contenu</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link to="/insights" className="hover:text-white">
                    Insights
                  </Link>
                </li>
                <li>
                  <Link to="/tech" className="hover:text-white">
                    Tech
                  </Link>
                </li>
                <li>
                  <Link to="/podcast" className="hover:text-white">
                    Podcast
                  </Link>
                </li>
                <li>
                  <Link to="/indices" className="hover:text-white">
                    Indices
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Faladie, Bamako, Mali</span>
                </li>
                <li>
                  <a
                    href="mailto:info@amani-finance.com"
                    className="hover:text-white flex items-center gap-2"
                  >
                    📧 info@amani-finance.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+22320224567"
                    className="hover:text-white flex items-center gap-2"
                  >
                    📞 +223 20 22 45 67
                  </a>
                </li>
                <li>
                  <Link to="/newsletter" className="hover:text-white">
                    Newsletter
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white">
                    À propos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-300">
            <p>&copy; 2025 Amani Finance. Tous droits réservés.</p>
            <p className="flex items-center gap-1 mt-2 md:mt-0">
              Créé avec <Heart className="w-4 h-4 text-red-500 fill-current" />{" "}
              par
              <a
                href="https://www.aikio.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-200 font-medium ml-1 transition-colors"
              >
                Aikio Corp SAS
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
