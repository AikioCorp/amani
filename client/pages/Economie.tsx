import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchBRVMData, BRVMData } from "../services/brvmApi";
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  ArrowRight,
  Calendar,
  Eye,
  Filter,
  Search,
  BookOpen,
  Users,
  Target,
  Zap,
  Activity,
  Clock,
  Star,
  ChevronRight,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useArticles } from "../hooks/useArticles";

export default function Economie() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [brvmData, setBrvmData] = useState<BRVMData | null>(null);

  useEffect(() => {
    fetchBRVMData().then(setBrvmData).catch(console.error);
  }, []);

  // Fetch real published economy articles
  const { articles: dbArticles, loading } = useArticles({
    status: "published",
    category: "economie",
    limit: 30,
  });

  const articles = useMemo(() => {
    return (dbArticles || []).map((art: any) => ({
      id: art.id,
      slug: art.slug || art.id,
      title: art.title,
      excerpt: art.summary || art.excerpt || "",
      content: art.content || "",
      author: art.author
        ? `${art.author.first_name} ${art.author.last_name}`
        : "Rédaction Amani",
      category: art.category_info?.name || "Macroéconomie",
      country: art.country || "UEMOA",
      publishedAt: art.published_at || art.created_at,
      readTime: art.read_time || 5,
      views: art.views || 0,
      coverImage:
        art.featured_image ||
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
      featured: (art.views || 0) > 100,
    }));
  }, [dbArticles]);

  const categories = [
    "all",
    "Macroéconomie",
    "Secteur minier",
    "Agriculture",
    "Commerce",
    "Finance",
  ];
  const countries = [
    "all",
    "Mali",
    "Burkina Faso",
    "Niger",
    "Tchad",
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query);

      const catLower = article.category.toLowerCase();
      const selectedCatLower = selectedCategory.toLowerCase();

      const matchesCategory =
        selectedCategory === "all" ||
        catLower.includes(selectedCatLower) ||
        (selectedCategory === "Macroéconomie" &&
          (catLower.includes("écono") || catLower.includes("macro"))) ||
        (selectedCategory === "Finance" &&
          (catLower.includes("finan") ||
            catLower.includes("banq") ||
            catLower.includes("monna"))) ||
        (selectedCategory === "Agriculture" &&
          (catLower.includes("agri") ||
            catLower.includes("cacao") ||
            catLower.includes("coton"))) ||
        (selectedCategory === "Secteur minier" &&
          (catLower.includes("min") ||
            catLower.includes("or") ||
            catLower.includes("pétrol"))) ||
        (selectedCategory === "Commerce" &&
          (catLower.includes("commer") ||
            catLower.includes("échang") ||
            catLower.includes("export")));

      const countryLower = article.country.toLowerCase();
      const selectedCountryLower = selectedCountry.toLowerCase();

      const matchesCountry =
        selectedCountry === "all" ||
        countryLower.includes(selectedCountryLower) ||
        article.title.toLowerCase().includes(selectedCountryLower) ||
        article.excerpt.toLowerCase().includes(selectedCountryLower);

      return matchesSearch && matchesCategory && matchesCountry;
    });
  }, [articles, searchTerm, selectedCategory, selectedCountry]);

  const featuredArticle = useMemo(() => {
    return articles.find((article) => article.featured) || articles[0];
  }, [articles]);

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      {/* Hero Section - Solid Charcoal Background */}
      <section className="bg-[#373B3A] text-white border-b border-stone-800 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 flex items-center justify-center gap-3">
              <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#E5DDD2] shrink-0" />
              <span>Économie Sahélienne & UEMOA</span>
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-stone-300 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed">
              Analyses, perspectives et données macroéconomiques officielles de la région
            </p>

            {/* Key Metrics Badges - Responsive Grid */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2 bg-[#2D302F] text-stone-200 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <div className="flex items-center gap-1 shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className="text-[10px] sm:text-xs text-stone-300 font-medium">Croissance</span>
                </div>
                <strong className="text-white font-bold text-xs sm:text-sm">+6,4%</strong>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2 bg-[#2D302F] text-stone-200 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <div className="flex items-center gap-1 shrink-0">
                  <Activity className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className="text-[10px] sm:text-xs text-stone-300 font-medium">Taux BCEAO</span>
                </div>
                <strong className="text-white font-bold text-xs sm:text-sm">{brvmData?.taux_bceao?.value || "3,50%"}</strong>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2 bg-[#2D302F] text-stone-200 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <div className="flex items-center gap-1 shrink-0">
                  <DollarSign className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className="text-[10px] sm:text-xs text-stone-300 font-medium">PIB Global</span>
                </div>
                <strong className="text-white font-bold text-xs sm:text-sm">145,8 Mds $</strong>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2 bg-[#2D302F] text-stone-200 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <div className="flex items-center gap-1 shrink-0">
                  <Users className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className="text-[10px] sm:text-xs text-stone-300 font-medium">Population</span>
                </div>
                <strong className="text-white font-bold text-xs sm:text-sm">137M hab.</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article Section */}
      {featuredArticle && (
        <section className="py-8 sm:py-12 bg-stone-100/70 border-b border-stone-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#373B3A] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <Star className="w-6 h-6 text-stone-700" />
              Article à la une
            </h2>

            <Link
              to={`/article/${featuredArticle.slug || featuredArticle.id}`}
              className="bg-white rounded-2xl shadow-md border border-stone-200/80 overflow-hidden block group hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 overflow-hidden h-56 sm:h-72 md:h-auto">
                  <img
                    src={featuredArticle.coverImage}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="md:w-1/2 p-5 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      <span className="bg-[#373B3A] text-white px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                        {featuredArticle.category}
                      </span>
                      <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full text-xs font-medium border border-stone-200">
                        {featuredArticle.country}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-stone-500 ml-auto sm:ml-0">
                        <Clock className="w-3.5 h-3.5" />
                        {featuredArticle.readTime} min
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-[#373B3A] mb-3 leading-snug group-hover:text-[#9C8464] transition-colors">
                      {featuredArticle.title}
                    </h3>

                    <p className="text-stone-600 text-sm sm:text-base mb-6 leading-relaxed line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-stone-100">
                    <div className="flex items-center gap-4 text-xs sm:text-sm text-stone-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        {new Date(featuredArticle.publishedAt).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-stone-400" />
                        {featuredArticle.views.toLocaleString()}
                      </span>
                    </div>

                    <span className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#373B3A] text-white text-sm font-medium rounded-lg group-hover:bg-[#9C8464] transition-colors w-full sm:w-auto">
                      Lire l'article
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Search and Filter Section - High End Financial Toolbar */}
      <section className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-4 sm:p-5 space-y-4">
            {/* Top Bar: Search Bar + Country Dropdown + Grid/List Switcher */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rechercher une analyse, un rapport, un secteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464] transition-all bg-stone-50/50 text-[#373B3A] placeholder-stone-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700 bg-stone-200/60 rounded-full w-5 h-5 flex items-center justify-center"
                    aria-label="Effacer la recherche"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Controls: Country Filter + View Mode Switcher */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5">
                {/* Country Selector Pill */}
                <div className="relative flex-1 sm:flex-initial">
                  <Globe className="w-4 h-4 text-[#9C8464] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full sm:w-auto appearance-none pl-9 pr-8 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm bg-stone-50/50 font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464] cursor-pointer"
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country === "all" ? "Tous les pays" : country}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-1 bg-stone-100/90 rounded-xl p-1 border border-stone-200/80 shrink-0">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      viewMode === "grid"
                        ? "bg-[#373B3A] text-white shadow-sm font-bold"
                        : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/50"
                    }`}
                    title="Vue Grille (2 colonnes sur mobile)"
                    aria-label="Vue Grille"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      viewMode === "list"
                        ? "bg-[#373B3A] text-white shadow-sm font-bold"
                        : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/50"
                    }`}
                    title="Vue Liste"
                    aria-label="Vue Liste"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Pills (Horizontal Scrollable Tabs) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-stone-100 no-scrollbar">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline-block">
                Catégories :
              </span>
              {categories.map((category) => {
                const isActive = selectedCategory === category;
                const label =
                  category === "all" ? "Toutes les catégories" : category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-[#373B3A] text-white shadow-sm"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900 border border-stone-200/60"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Articles List / Grid */}
      <section className="pb-16 pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-[#373B3A] flex items-center gap-2 sm:gap-3">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#9C8464]" />
              Dernières analyses ({filteredArticles.length})
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm h-64 sm:h-80 animate-pulse border border-stone-200"
                />
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-stone-200 text-stone-500 text-sm sm:text-base">
              Aucun article trouvé pour cette recherche.
            </div>
          ) : viewMode === "grid" ? (
            /* 2-COLUMN GRID ON MOBILE (grid-cols-2) */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug || article.id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md border border-stone-200/80 overflow-hidden transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative overflow-hidden h-28 sm:h-44 md:h-48">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex flex-wrap items-center gap-1 sm:gap-2">
                        <span className="bg-[#373B3A]/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
                          {article.category}
                        </span>
                        <span className="bg-white/90 backdrop-blur-sm text-stone-700 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium hidden xs:inline-block">
                          {article.country}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 sm:p-5">
                      <h3 className="text-xs sm:text-base md:text-lg font-bold text-[#373B3A] mb-1.5 sm:mb-2 leading-snug group-hover:text-[#9C8464] transition-colors">
                        {article.title}
                      </h3>

                      <p
                        className="text-stone-600 text-[11px] sm:text-sm mb-2 leading-relaxed"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {article.excerpt.length > 130
                          ? article.excerpt.substring(0, 130).trim() + "..."
                          : article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-2.5 pb-2.5 sm:px-5 sm:pb-5 pt-0">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-stone-500 pt-2 border-t border-stone-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {new Date(article.publishedAt).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {article.readTime} m
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#9C8464] group-hover:text-[#373B3A] transition-colors mt-2">
                      Lire
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* LIST VIEW MODE */
            <div className="space-y-3 sm:space-y-4">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug || article.id}`}
                  className="bg-white rounded-xl shadow-sm p-3.5 sm:p-5 border border-stone-200 hover:shadow-md transition-all block group"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-5">
                    <div className="w-full sm:w-44 h-36 sm:h-32 overflow-hidden rounded-lg shrink-0">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-[#373B3A] text-white px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium">
                          {article.category}
                        </span>
                        <span className="bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border border-stone-200">
                          {article.country}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-lg font-bold text-[#373B3A] mb-1.5 group-hover:text-[#9C8464] transition-colors leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-stone-600 text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                        <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-stone-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(article.publishedAt).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {article.readTime} min
                          </span>
                        </div>

                        <div className="flex items-center gap-1 px-3 py-1.5 bg-[#373B3A] text-white rounded-lg group-hover:bg-[#9C8464] transition-colors font-medium text-xs">
                          Lire
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action - Solid Charcoal Section (No Gradient) */}
      <section className="py-12 sm:py-16 bg-[#373B3A] text-white border-t border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 sm:mb-4">
            Restez informé de l'actualité économique
          </h2>
          <p className="text-sm sm:text-base text-stone-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Recevez nos analyses exclusives et nos prévisions économiques directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/newsletter"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#9C8464] text-white rounded-lg hover:bg-[#8B7455] transition-colors font-medium text-sm sm:text-base shadow-sm"
            >
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              S'abonner à la newsletter
            </Link>
            <Link
              to="/insights"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-stone-600 text-stone-200 rounded-lg hover:bg-white/10 transition-colors font-medium text-sm sm:text-base"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              Voir toutes les analyses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
