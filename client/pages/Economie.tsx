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
    "UEMOA",
    "Sahel",
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        article.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesCountry =
        selectedCountry === "all" ||
        article.country.toLowerCase().includes(selectedCountry.toLowerCase());
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
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
              📊 Économie Sahélienne & UEMOA
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-stone-300 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed">
              Analyses, perspectives et données macroéconomiques officielles de la région
            </p>

            {/* Key Metrics Badges - Fully Responsive Grid on Mobile */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center justify-center sm:justify-start gap-2 bg-[#2D302F] text-stone-200 px-3 py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">
                  Croissance: <strong className="text-white font-bold">+6,4%</strong>
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 bg-[#2D302F] text-stone-200 px-3 py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">
                  BCEAO: <strong className="text-white font-bold">{brvmData?.taux_bceao?.value || "3,50%"}</strong>
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 bg-[#2D302F] text-stone-200 px-3 py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <DollarSign className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">
                  PIB: <strong className="text-white font-bold">145,8 Mds $</strong>
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 bg-[#2D302F] text-stone-200 px-3 py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate">
                  Pop: <strong className="text-white font-bold">137M hab.</strong>
                </span>
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
              <Star className="w-6 h-6 text-[#9C8464]" />
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
                        <Users className="w-4 h-4 text-stone-400" />
                        {featuredArticle.author}
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

      {/* Search and Filter Section */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une analyse économique..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464] transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-stone-500 shrink-0" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464]"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "Toutes catégories" : category}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full sm:w-auto px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464]"
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country === "all" ? "Tous pays" : country}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1 justify-center sm:justify-start">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded text-xs font-medium transition-colors ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm text-[#373B3A]"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                    title="Vue Grille"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded text-xs font-medium transition-colors ${
                      viewMode === "list"
                        ? "bg-white shadow-sm text-[#373B3A]"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                    title="Vue Liste"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles List / Grid */}
      <section className="pb-16 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#373B3A] mb-6 flex items-center gap-2 sm:gap-3">
            <BookOpen className="w-6 h-6 text-[#9C8464]" />
            Dernières analyses ({filteredArticles.length})
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm h-80 animate-pulse border border-stone-200"
                />
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-stone-200 text-stone-500 text-sm sm:text-base">
              Aucun article trouvé pour cette recherche.
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug || article.id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md border border-stone-200/80 overflow-hidden transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative overflow-hidden h-44 sm:h-48">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                        <span className="bg-[#373B3A]/90 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          {article.category}
                        </span>
                        <span className="bg-white/90 backdrop-blur-sm text-stone-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {article.country}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-base sm:text-lg font-bold text-[#373B3A] mb-2 leading-snug group-hover:text-[#9C8464] transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-stone-600 text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-0">
                    <div className="flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {article.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {article.readTime} min
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {article.views.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9C8464] group-hover:text-[#373B3A] transition-colors mt-3">
                      Lire l'analyse complète
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug || article.id}`}
                  className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-stone-200 hover:shadow-md transition-all block group"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    <div className="w-full sm:w-48 h-40 sm:h-32 overflow-hidden rounded-lg shrink-0">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-[#373B3A] text-white px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {article.category}
                        </span>
                        <span className="bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-stone-200">
                          {article.country}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-xl font-bold text-[#373B3A] mb-2 group-hover:text-[#9C8464] transition-colors leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-stone-600 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {article.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(article.publishedAt).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {article.readTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {article.views.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#373B3A] text-white rounded-lg group-hover:bg-[#9C8464] transition-colors font-medium text-xs">
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
