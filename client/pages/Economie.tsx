import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
  Search,
  BookOpen,
  Users,
  Building,
  Target,
  Zap,
  PieChart,
  LineChart,
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

  // Fetch real published economy articles
  const { articles: dbArticles, loading } = useArticles({
    status: 'published',
    category: 'economie',
    limit: 30
  });

  const articles = useMemo(() => {
    return (dbArticles || []).map((art: any) => ({
      id: art.id,
      title: art.title,
      excerpt: art.summary || art.excerpt || '',
      content: art.content || '',
      author: art.author ? `${art.author.first_name} ${art.author.last_name}` : 'Amani Rédaction',
      category: art.category_info?.name || 'Macroéconomie',
      country: art.country || 'UEMOA',
      publishedAt: art.published_at || art.created_at,
      readTime: art.read_time || 6,
      views: art.views || 0,
      coverImage: art.featured_image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
      featured: (art.views || 0) > 100,
    }));
  }, [dbArticles]);

  const categories = ["all", "Macroéconomie", "Secteur minier", "Agriculture", "Commerce", "Finance"];
  const countries = ["all", "Mali", "Burkina Faso", "Niger", "Tchad", "UEMOA", "Sahel"];

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || article.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesCountry = selectedCountry === "all" || article.country.toLowerCase().includes(selectedCountry.toLowerCase());
      return matchesSearch && matchesCategory && matchesCountry;
    });
  }, [articles, searchTerm, selectedCategory, selectedCountry]);

  const featuredArticle = useMemo(() => {
    return articles.find(article => article.featured) || articles[0];
  }, [articles]);

  return (
    <div className="min-h-screen bg-[#E5DDD2]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amani-primary to-amani-primary/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              📊 Économie Sahélienne
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Analyses, perspectives et données économiques de la région
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                <span>Croissance: +5.2%</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                <span>PIB: 180B USD</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                <span>86M habitants</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="py-16 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-amani-primary mb-8 flex items-center gap-3">
              <Star className="w-8 h-8" />
              Article à la une
            </h2>
            
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={featuredArticle.coverImage}
                    alt={featuredArticle.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-amani-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {featuredArticle.category}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {featuredArticle.country}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {featuredArticle.readTime} min
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-amani-primary mb-4 leading-tight">
                    {featuredArticle.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {featuredArticle.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {featuredArticle.views.toLocaleString()}
                      </span>
                    </div>
                    
                    <Link
                      to={`/article/${featuredArticle.slug || featuredArticle.id}`}
                      className="flex items-center gap-2 px-6 py-3 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors font-medium"
                    >
                      Lire l'article
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search and Filter */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-white/50">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
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
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country === "all" ? "Tous pays" : country}
                    </option>
                  ))}
                </select>
                
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-600"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "list" ? "bg-white shadow-sm" : "text-gray-600"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-amani-primary mb-8 flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            Dernières analyses ({filteredArticles.length})
          </h2>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucun article trouvé pour cette recherche.
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <article key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="bg-amani-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                        {article.category}
                      </span>
                      <span className="bg-white/90 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {article.country}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-amani-primary mb-3 leading-tight">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {article.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readTime} min
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.views.toLocaleString()}
                      </span>
                    </div>
                    
                    <Link
                      to={`/article/${article.slug || article.id}`}
                      className="flex items-center gap-2 text-amani-primary hover:text-amani-primary/80 font-medium"
                    >
                      Lire l'analyse complète
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredArticles.map((article) => (
                <article key={article.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-6">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-amani-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                          {article.category}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {article.country}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-amani-primary mb-3 leading-tight">
                        {article.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {article.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.publishedAt).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.readTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {article.views.toLocaleString()}
                          </span>
                        </div>
                        
                        <Link
                          to={`/article/${article.slug || article.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors font-medium"
                        >
                          Lire
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-amani-primary/10 to-amani-secondary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-amani-primary mb-6">
            Restez informé de l'actualité économique
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Recevez nos analyses exclusives et nos prévisions économiques directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/newsletter"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors font-medium"
            >
              <Target className="w-5 h-5" />
              S'abonner à la newsletter
            </Link>
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 px-6 py-3 border border-amani-primary text-amani-primary rounded-lg hover:bg-amani-primary/5 transition-colors font-medium"
            >
              <Zap className="w-5 h-5" />
              Voir toutes les analyses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
