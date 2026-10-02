import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Zap, Smartphone, Cloud, Brain, Code, Shield, Globe, TrendingUp, Calendar, Clock, Cpu, Server } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useArticles } from '../hooks/useArticles';

const Tech = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const techCategories = [
    { id: 'all', name: 'Toutes les tech' },
    { id: 'ai', name: 'Intelligence Artificielle' },
    { id: 'fintech', name: 'FinTech & Mobile Money' },
    { id: 'cloud', name: 'Cloud & Infrastructure' },
    { id: 'mobile', name: 'Applications Mobile' },
    { id: 'blockchain', name: 'Blockchain & Web3' },
    { id: 'cybersecurity', name: 'Cybersécurité' }
  ];

  // Fetch real published tech articles
  const { articles: dbArticles, loading } = useArticles({
    status: 'published',
    category: 'technologie',
    limit: 30
  });

  const techNews = useMemo(() => {
    return (dbArticles || []).map((art: any) => ({
      id: art.id,
      slug: art.slug || art.id,
      title: art.title,
      category: art.category_info?.name || 'Technologie',
      summary: art.summary || art.excerpt || '',
      image: art.featured_image || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop',
      date: art.published_at || art.created_at,
      readTime: `${art.read_time || 6} min`,
      trending: (art.views || 0) > 50
    }));
  }, [dbArticles]);

  const filteredNews = useMemo(() => {
    return techNews.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
      const categoryKeywords: Record<string, string[]> = {
        ai: ['ia', 'intelligence artificielle', 'artificial intelligence', 'machine learning', 'deep learning'],
        blockchain: ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3'],
        mobile: ['mobile', 'app', 'application', 'téléphone', 'smartphone'],
        cloud: ['cloud', 'serveur', 'aws', 'gcp', 'azure', 'hébergement'],
        fintech: ['fintech', 'paiement', 'mobile money', 'banque', 'finance'],
        cybersecurity: ['cyber', 'sécurité', 'hacker', 'protection', 'attaque']
      };

      let matchesCategory = selectedCategory === 'all';
      if (!matchesCategory && categoryKeywords[selectedCategory]) {
        const keywords = categoryKeywords[selectedCategory];
        const targetText = `${article.title} ${article.summary} ${article.category}`.toLowerCase();
        matchesCategory = keywords.some(keyword => targetText.includes(keyword));
      }

      return matchesSearch && matchesCategory;
    });
  }, [techNews, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      {/* Hero Section - Solid Charcoal Background */}
      <section className="bg-[#373B3A] text-white border-b border-stone-800 py-10 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700/60 shadow-md">
                <Cpu className="h-8 w-8 sm:h-12 sm:w-12 text-stone-300" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-3 sm:mb-4">
              Technologie, Innovation & Digital
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8">
              Explorez l'écosystème tech africain en pleine expansion : Startups, FinTech, IA, Cloud et souveraineté numérique dans le Sahel et l'UEMOA
            </p>

            {/* Key Tech Badges */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2 bg-[#2D302F] text-stone-200 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <div className="flex items-center gap-1 shrink-0">
                  <Smartphone className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className="text-[10px] sm:text-xs text-stone-300 font-medium">Mobile Money</span>
                </div>
                <strong className="text-white font-bold text-xs sm:text-sm">+24% / an</strong>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2 bg-[#2D302F] text-stone-200 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <div className="flex items-center gap-1 shrink-0">
                  <Brain className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className="text-[10px] sm:text-xs text-stone-300 font-medium">Adoption IA</span>
                </div>
                <strong className="text-white font-bold text-xs sm:text-sm">En hausse</strong>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2 bg-[#2D302F] text-stone-200 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <div className="flex items-center gap-1 shrink-0">
                  <Server className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className="text-[10px] sm:text-xs text-stone-300 font-medium">Souveraineté Cloud</span>
                </div>
                <strong className="text-white font-bold text-xs sm:text-sm">Stratégique</strong>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-2 bg-[#2D302F] text-stone-200 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-stone-700/60 shadow-sm">
                <div className="flex items-center gap-1 shrink-0">
                  <Globe className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className="text-[10px] sm:text-xs text-stone-300 font-medium">Startups UEMOA</span>
                </div>
                <strong className="text-white font-bold text-xs sm:text-sm">500+ Levées</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech News Section */}
      <section className="py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Horizontal Category Pills */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-3.5 sm:p-5 mb-6 sm:mb-10 space-y-3.5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher des articles tech, startups, IA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-8 py-2 sm:py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464] transition-all bg-stone-50/50 text-[#373B3A] placeholder-stone-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700 bg-stone-200/60 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills (Horizontal Scrollable Tabs) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-stone-100 no-scrollbar">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline-block">
                Secteurs Tech :
              </span>
              {techCategories.map((category) => {
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#373B3A] text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900 border border-stone-200/60'
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Articles Grid - 2 COLUMNS ON MOBILE */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm h-64 sm:h-80 animate-pulse border border-stone-200" />
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-stone-300 rounded-2xl bg-white">
              <Cpu className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-600 font-bold mb-1">Aucun article tech trouvé.</p>
              <p className="text-xs text-stone-400">Essayez d'autres mots-clés ou filtres de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
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
                          {article.category}
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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tech Alert / Newsletter Box */}
      <section className="py-10 sm:py-16 bg-[#373B3A] text-white border-t border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 bg-stone-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-stone-700">
            <Zap className="w-6 h-6 text-[#9C8464]" />
          </div>
          <h2 className="text-xl sm:text-3xl font-bold mb-3">
            Restez à la Pointe de l'Innovation Tech
          </h2>
          <p className="text-xs sm:text-base mb-6 text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Recevez chaque semaine les dernières synthèses tech africaines, levées de fonds et analyses exclusives d'Amani
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 bg-stone-900 border border-stone-700 text-white placeholder-stone-400 px-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#9C8464]"
            />
            <Button className="bg-[#9C8464] hover:bg-[#867052] text-white font-bold px-6 py-2.5 rounded-xl transition-all text-xs sm:text-sm">
              S'abonner
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tech;
