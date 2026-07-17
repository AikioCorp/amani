import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from '../components/Footer';
import { fetchBRVMData, BRVMData } from "../services/brvmApi";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Globe,
  ArrowRight,
  Calendar,
  Eye,
  Filter,
  Download,
  Activity,
  Briefcase,
  PieChart,
  LineChart,
  RefreshCw,
  Clock,
  Target,
  Zap,
} from "lucide-react";
import { useArticles } from "../hooks/useArticles";

export default function Marche() {
  const [selectedMarket, setSelectedMarket] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1d");

  // Fetch real published market articles
  const { articles: marketFinArticles, loading: loadingMarketFin } = useArticles({ status: 'published', limit: 10, category: 'marches-financiers' });
  const { articles: marketBoursArticles, loading: loadingMarketBours } = useArticles({ status: 'published', limit: 10, category: 'marches-boursiers' });
  const loadingNews = loadingMarketFin || loadingMarketBours;

  // Données de marché réelles (API /api/brvm — scrapées depuis brvm.org)
  const [brvmData, setBrvmData] = useState<BRVMData | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchBRVMData();
        if (!cancelled) setBrvmData(data);
      } catch (e) {
        console.error("Erreur chargement données BRVM:", e);
      }
    };
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Formate un montant FCFA brut ("18 488 207 038 541 FCFA") en forme courte ("18,49 T FCFA")
  const formatFcfa = (raw?: string): string => {
    if (!raw) return "—";
    const n = parseFloat(raw.replace(/[^\d]/g, ""));
    if (!n || isNaN(n)) return "—";
    if (n >= 1e12) return `${(n / 1e12).toFixed(2).replace(".", ",")} T FCFA`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(2).replace(".", ",")} Md FCFA`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(".", ",")} M FCFA`;
    return `${n.toLocaleString("fr-FR")} FCFA`;
  };

  const marketData = useMemo(() => {
    if (!brvmData) return [];

    const rows: Array<{
      name: string;
      value: string;
      change: string;
      changeValue: string;
      isPositive: boolean;
      volume: string;
      category: string;
      high: string;
      low: string;
      marketCap: string;
    }> = [];

    // Indice composite + indices sectoriels (réels)
    rows.push({
      name: brvmData.composite.name,
      value: brvmData.composite.value,
      change: brvmData.composite.changePercent,
      changeValue: brvmData.composite.change,
      isPositive: brvmData.composite.isPositive,
      volume: "—",
      category: "Indice",
      high: "—",
      low: "—",
      marketCap: formatFcfa(brvmData.activity?.equityCap),
    });
    (brvmData.sectoriels || []).forEach((s) => {
      rows.push({
        name: s.name,
        value: s.value,
        change: s.changePercent,
        changeValue: s.change,
        isPositive: s.isPositive,
        volume: "—",
        category: "Indice",
        high: "—",
        low: "—",
        marketCap: "—",
      });
    });

    // Devise (parité fixe)
    rows.push({
      name: "EUR/FCFA",
      value: brvmData.fcfa_eur.value,
      change: "0%",
      changeValue: "0",
      isPositive: true,
      volume: "—",
      category: "Devise",
      high: "—",
      low: "—",
      marketCap: "N/A (parité fixe)",
    });

    // Actions réelles (top movers BRVM)
    (brvmData.topStocks || []).forEach((s) => {
      rows.push({
        name: s.name || s.symbol,
        value: s.price,
        change: s.changePercent,
        changeValue: s.change,
        isPositive: s.isPositive,
        volume: `${s.volume} titres`,
        category: "Action",
        high: "—",
        low: "—",
        marketCap: "—",
      });
    });

    return rows;
  }, [brvmData]);

  const recentNews = useMemo(() => {
    const list = [...(marketFinArticles || []), ...(marketBoursArticles || [])];
    const sorted = list.sort((a, b) => {
      const aDate = (a.published_at || a.created_at) ? new Date(a.published_at || a.created_at).getTime() : 0;
      const bDate = (b.published_at || b.created_at) ? new Date(b.published_at || b.created_at).getTime() : 0;
      return bDate - aDate;
    });
    return sorted.slice(0, 10).map((art) => ({
      id: art.id,
      title: art.title,
      excerpt: art.summary || "",
      category: art.category_info?.name || "Bourse",
      publishedAt: art.published_at || art.created_at,
      readTime: `${art.read_time || 5} min`,
      image: art.featured_image || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
    }));
  }, [marketFinArticles, marketBoursArticles]);

  const marketSummary = {
    gainers: marketData.filter(item => item.isPositive && item.change !== "0%").length,
    losers: marketData.filter(item => !item.isPositive).length,
    unchanged: marketData.filter(item => item.change === "0%").length,
    totalVolume: formatFcfa(brvmData?.activity?.transactionValue),
    marketCap: formatFcfa(brvmData?.activity?.equityCap),
  };

  const categories = ["all", "Indice", "Action", "Devise", "Obligation"];
  const timeframes = [
    { value: "1d", label: "1J" },
    { value: "1w", label: "1S" },
    { value: "1m", label: "1M" },
    { value: "3m", label: "3M" },
    { value: "1y", label: "1A" },
  ];

  const filteredData = selectedMarket === "all" 
    ? marketData 
    : marketData.filter(item => item.category === selectedMarket);

  return (
    <div className="min-h-screen bg-[#E5DDD2]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amani-primary to-amani-primary/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              📈 Marchés Financiers
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Suivez en temps réel les performances des marchés financiers ouest-africains
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                <span>{marketSummary.gainers} En hausse</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-6 h-6" />
                <span>{marketSummary.losers} En baisse</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6" />
                <span>Volume: {marketSummary.totalVolume}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-amani-primary mb-4 lg:mb-0 flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              Vue d'ensemble du marché
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "Tous les marchés" : category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
                {timeframes.map((timeframe) => (
                  <button
                    key={timeframe.value}
                    onClick={() => setSelectedTimeframe(timeframe.value)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      selectedTimeframe === timeframe.value
                        ? "bg-amani-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {timeframe.label}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors">
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>

          {/* Market Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">En hausse</p>
                  <p className="text-3xl font-bold text-green-600">{marketSummary.gainers}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">En baisse</p>
                  <p className="text-3xl font-bold text-red-600">{marketSummary.losers}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Volume total</p>
                  <p className="text-2xl font-bold text-amani-primary">{marketSummary.totalVolume}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Capitalisation</p>
                  <p className="text-2xl font-bold text-amani-primary">{marketSummary.marketCap}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Market Data Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-white/50">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-amani-primary">
                Cotations en temps réel ({filteredData.length})
              </h3>
              <p className="text-gray-600 mt-1">Dernière mise à jour: {new Date().toLocaleTimeString("fr-FR")}</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instrument
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variation
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Haut/Bas
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-gray-900">{item.value}</div>
                        <div className="text-xs text-gray-500">FCFA</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`flex items-center justify-end gap-1 ${
                          item.isPositive ? "text-green-600" : "text-red-600"
                        }`}>
                          {item.isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">{item.change}</span>
                        </div>
                        <div className={`text-xs ${
                          item.isPositive ? "text-green-600" : "text-red-600"
                        }`}>
                          {item.changeValue}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {item.volume}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-xs text-gray-900">H: {item.high}</div>
                        <div className="text-xs text-gray-500">B: {item.low}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="text-amani-primary hover:text-amani-primary/80">
                            <LineChart className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Market News */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-amani-primary mb-8 flex items-center gap-3">
            <Zap className="w-8 h-8" />
            Actualités des marchés
          </h2>
          
          {loadingNews ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : recentNews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucune actualité de marché trouvée.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentNews.map((news) => (
                <article key={news.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="relative">
                      <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-amani-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                          {news.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-amani-primary mb-3 leading-tight">
                        {news.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                        {news.excerpt}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(news.publishedAt).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {news.readTime}
                        </span>
                      </div>
                      
                      <Link
                        to={`/article/${news.id}`}
                        className="flex items-center gap-1 text-amani-primary hover:text-amani-primary/80 font-medium"
                      >
                        Lire <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link
              to="/marche/actualites"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors font-medium"
            >
              Voir toutes les actualités
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-amani-primary/10 to-amani-secondary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-amani-primary mb-6">
            Analyses approfondies des marchés
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Accédez à nos rapports d'analyse, prévisions et recommandations d'investissement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors font-medium"
            >
              <Target className="w-5 h-5" />
              Voir les analyses
            </Link>
            <Link
              to="/newsletter"
              className="inline-flex items-center gap-2 px-6 py-3 border border-amani-primary text-amani-primary rounded-lg hover:bg-amani-primary/5 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              S'abonner aux alertes
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
