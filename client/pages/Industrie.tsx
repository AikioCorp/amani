import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, BarChart3, BookOpen, TrendingUp, Factory, Zap, Users, DollarSign, Calendar, Clock, ChevronRight, Coins } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
import { fetchCommoditiesData, CommoditiesData } from '../services/commoditiesApi';

const Industrie = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [commodities, setCommodities] = useState<CommoditiesData | null>(null);

  useEffect(() => {
    fetchCommoditiesData()
      .then((data) => setCommodities(data))
      .catch((err) => console.error("Erreur chargement commodités:", err));
  }, []);

  // Fetch real published industry articles
  const { articles: dbArticles, loading } = useArticles({
    status: 'published',
    category: 'industrie-miniere',
    limit: 30
  });

  const industrialNews = useMemo(() => {
    return (dbArticles || []).map((art: any) => ({
      id: art.id,
      slug: art.slug || art.id,
      title: art.title,
      summary: art.summary || art.excerpt || '',
      sector: art.category_info?.name || 'Mines & Industrie',
      image: art.featured_image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop',
      date: art.published_at || art.created_at,
      readTime: `${art.read_time || 5} min`,
      trending: (art.views || 0) > 50
    }));
  }, [dbArticles]);

  const sectors = [
    { id: 'all', name: 'Tous les secteurs' },
    { id: 'manufacturing', name: 'Manufacture' },
    { id: 'energy', name: 'Énergie' },
    { id: 'mines', name: 'Mines & Ressources' },
    { id: 'automotive', name: 'Automobile' },
    { id: 'pharma', name: 'Pharmaceutique' },
    { id: 'food', name: 'Agroalimentaire' }
  ];

  const filteredNews = useMemo(() => {
    return industrialNews.filter(article => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query ||
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query);
      
      const sectorKeywords: Record<string, string[]> = {
        manufacturing: ['manufacture', 'usine', 'production', 'manufacturière'],
        energy: ['énergie', 'électricité', 'solaire', 'renouvelable', 'pétrole', 'gaz'],
        mines: ['mine', 'or', 'uranium', 'charbon', 'fer', 'bauxite', 'extraction', 'minier'],
        automotive: ['auto', 'voiture', 'véhicule', 'constructeur'],
        pharma: ['pharma', 'médicament', 'santé', 'médical'],
        food: ['agro', 'alimentaire', 'nourriture', 'agriculture', 'agroalimentaire']
      };

      let matchesSector = selectedSector === 'all';
      if (!matchesSector && sectorKeywords[selectedSector]) {
        const keywords = sectorKeywords[selectedSector];
        const targetText = `${article.title} ${article.summary} ${article.sector}`.toLowerCase();
        matchesSector = keywords.some(keyword => targetText.includes(keyword));
      }

      return matchesSearch && matchesSector;
    });
  }, [industrialNews, searchTerm, selectedSector]);

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      {/* Hero Section - Solid Charcoal Background */}
      <section className="bg-[#373B3A] text-white border-b border-stone-800 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 flex items-center justify-center gap-3">
              <Factory className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#E5DDD2] shrink-0" />
              <span>Industrie, Mines & Innovation</span>
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-stone-300 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed">
              Dossiers industriels, projets miniers et stratégies de transformation économique dans l'espace UEMOA et Sahel
            </p>

            {/* Key Metrics Badges - Real Live Market Data */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2 bg-[#2D302F] text-stone-200 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <div className="flex items-center gap-1 shrink-0">
                  <Coins className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className="text-[10px] sm:text-xs text-stone-300 font-medium">Or (Mines)</span>
                </div>
                <strong className="text-white font-bold text-xs sm:text-sm">{commodities?.gold ? `${commodities.gold.price} ${commodities.gold.currency}` : "$2 380/oz"}</strong>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2 bg-[#2D302F] text-stone-200 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <div className="flex items-center gap-1 shrink-0">
                  <Zap className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className="text-[10px] sm:text-xs text-stone-300 font-medium">Pétrole Brent</span>
                </div>
                <strong className="text-white font-bold text-xs sm:text-sm">{commodities?.oil_brent ? `${commodities.oil_brent.price} ${commodities.oil_brent.currency}` : "$82,50/bbl"}</strong>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2 bg-[#2D302F] text-stone-200 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <div className="flex items-center gap-1 shrink-0">
                  <Factory className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className="text-[10px] sm:text-xs text-stone-300 font-medium">PIB Industriel</span>
                </div>
                <strong className="text-white font-bold text-xs sm:text-sm">19,5%</strong>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2 bg-[#2D302F] text-stone-200 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <div className="flex items-center gap-1 shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className="text-[10px] sm:text-xs text-stone-300 font-medium">Capacité WAPP</span>
                </div>
                <strong className="text-white font-bold text-xs sm:text-sm">6,5 GW</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-3.5 sm:p-5 space-y-3.5">
            {/* Top Bar: Search Bar + View Mode Switcher ALIGNED ON SAME ROW */}
            <div className="flex items-center gap-2">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rechercher des articles, usines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-8 py-2 sm:py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464] transition-all bg-stone-50/50 text-[#373B3A] placeholder-stone-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700 bg-stone-200/60 rounded-full w-4 h-4 flex items-center justify-center"
                    aria-label="Effacer la recherche"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* View Mode Switcher on SAME row */}
              <div className="flex items-center gap-0.5 bg-stone-100/90 rounded-xl p-1 border border-stone-200/80 shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-[#373B3A] text-white shadow-sm font-bold'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
                  }`}
                  title="Vue Grille"
                  aria-label="Vue Grille"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-[#373B3A] text-white shadow-sm font-bold'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
                  }`}
                  title="Vue Liste"
                  aria-label="Vue Liste"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Filter Pills (Horizontal Scrollable Tabs) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-stone-100 no-scrollbar">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline-block">
                Secteurs :
              </span>
              {sectors.map((sec) => {
                const isActive = selectedSector === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSector(sec.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#373B3A] text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900 border border-stone-200/60'
                    }`}
                  >
                    {sec.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* News and Articles Section */}
      <section className="pb-16 pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-[#373B3A] flex items-center gap-2 sm:gap-3">
              <Factory className="w-5 h-5 sm:w-6 sm:h-6 text-[#9C8464]" />
              Actualités Industrielles ({filteredNews.length})
            </h2>
          </div>

          {/* Articles Grid/List */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm h-64 sm:h-80 animate-pulse border border-stone-200" />
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-stone-200 text-stone-500 text-sm sm:text-base">
              Aucun article industriel trouvé pour cette recherche.
            </div>
          ) : viewMode === 'grid' ? (
            /* 2-COLUMN GRID ON MOBILE (grid-cols-2) */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredNews.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug || article.id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md border border-stone-200/80 overflow-hidden transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative overflow-hidden h-28 sm:h-44 md:h-48">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex flex-wrap items-center gap-1 sm:gap-2">
                        <span className="bg-[#373B3A]/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
                          {article.sector}
                        </span>
                        {article.trending && (
                          <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium">
                            Tendance
                          </span>
                        )}
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
                        {article.summary.length > 130
                          ? article.summary.substring(0, 130).trim() + "..."
                          : article.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-2.5 pb-2.5 sm:px-5 sm:pb-5 pt-0">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-stone-500 pt-2 border-t border-stone-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {new Date(article.date || Date.now()).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {article.readTime}
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
              {filteredNews.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug || article.id}`}
                  className="bg-white rounded-xl shadow-sm p-3.5 sm:p-5 border border-stone-200 hover:shadow-md transition-all block group"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-5">
                    <div className="w-full sm:w-44 h-36 sm:h-32 overflow-hidden rounded-lg shrink-0">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-[#373B3A] text-white px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium">
                          {article.sector}
                        </span>
                        {article.trending && (
                          <span className="bg-orange-500 text-white px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium">
                            Tendance
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-lg font-bold text-[#373B3A] mb-1.5 group-hover:text-[#9C8464] transition-colors leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-stone-600 text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                        <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-stone-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(article.date || Date.now()).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {article.readTime}
                          </span>
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
    </div>
  );
};

export default Industrie;
