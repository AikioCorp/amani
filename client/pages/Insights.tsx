import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Brain, Clock, Eye, Calendar, Crown, Lock, Sparkles, X, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useArticles } from '../hooks/useArticles';
import { useAuth } from '../context/AuthContext';

const Insights = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paywallModalOpen, setPaywallModalOpen] = useState(false);
  const [selectedPremiumInsight, setSelectedPremiumInsight] = useState<any>(null);

  // Fetch real published insights articles
  const { articles: dbArticles, loading } = useArticles({
    status: 'published',
    category: 'insights',
    limit: 30
  });

  const isUserPremium = Boolean(user?.is_premium || (user as any)?.isPremium);

  const featuredInsights = useMemo(() => {
    return (dbArticles || []).map((art: any) => ({
      id: art.id,
      slug: art.slug || art.id,
      title: art.title,
      category: art.category_info?.name || 'Insights',
      readTime: `${art.read_time || 8} min`,
      views: (art.views || 0).toLocaleString(),
      date: art.published_at || art.created_at,
      image: art.featured_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop',
      summary: art.summary || art.excerpt || '',
      tags: art.tags || ['Analyse', 'Perspective'],
      featured: (art.views || 0) > 100,
      isPremium: Boolean(art.is_premium || art.isPremium || art.access_level === 'premium')
    }));
  }, [dbArticles]);

  const insightCategories = [
    { id: 'all', name: 'Toutes les analyses' },
    { id: 'premium', name: 'Offre Premium' },
    { id: 'economic', name: 'Analyse Économique' },
    { id: 'market', name: 'Tendances Marché' },
    { id: 'technology', name: 'Innovation Tech' },
    { id: 'policy', name: 'Politiques Publiques' }
  ];

  const filteredInsights = useMemo(() => {
    return featuredInsights.filter(insight => {
      const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           insight.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (selectedCategory === 'premium') {
        return matchesSearch && insight.isPremium;
      }

      const insightCategoryKeywords: Record<string, string[]> = {
        economic: ['économ', 'gdp', 'pib', 'inflation', 'croissance'],
        market: ['marché', 'bourse', 'brvm', 'crypto', 'finance'],
        technology: ['tech', 'ia', 'blockchain', 'innovation', 'digital'],
        policy: ['politique', 'publique', 'gouvernement', 'réforme', 'uemoa']
      };

      let matchesCategory = selectedCategory === 'all';
      if (!matchesCategory && insightCategoryKeywords[selectedCategory]) {
        const keywords = insightCategoryKeywords[selectedCategory];
        const targetText = `${insight.title} ${insight.summary} ${insight.category}`.toLowerCase();
        matchesCategory = keywords.some(keyword => targetText.includes(keyword));
      }

      return matchesSearch && matchesCategory;
    });
  }, [featuredInsights, searchTerm, selectedCategory]);

  const handleCardClick = (e: React.MouseEvent, insight: any) => {
    if (insight.isPremium && !isUserPremium) {
      e.preventDefault();
      setSelectedPremiumInsight(insight);
      setPaywallModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      {/* Hero Section - Solid Charcoal Background */}
      <section className="bg-[#373B3A] text-white border-b border-stone-800 py-10 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700/60 shadow-md">
                <Brain className="h-8 w-8 sm:h-12 sm:w-12 text-stone-300" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 text-white">
              Insights & Analyses Stratégiques
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed">
              Accédez aux études prospectives, données exclusives et analyses à forte valeur ajoutée pour anticiper les transformations en Afrique
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Horizontal Category Pills */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-3.5 sm:p-5 mb-6 sm:mb-10 space-y-3.5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher des analyses, insights stratégiques..."
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
                Filtres :
              </span>
              {insightCategories.map((category) => {
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

          {/* Insights 2-COLUMN GRID ON MOBILE */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm h-64 sm:h-80 animate-pulse border border-stone-200" />
              ))}
            </div>
          ) : filteredInsights.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-stone-300 rounded-2xl bg-white">
              <Brain className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-600 font-bold mb-1">Aucun insight trouvé pour cette recherche.</p>
              <p className="text-xs text-stone-400">Essayez de réinitialiser vos mots-clés ou filtres.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {filteredInsights.map((insight) => (
                <Link
                  key={insight.id}
                  to={`/article/${insight.slug || insight.id}`}
                  onClick={(e) => handleCardClick(e, insight)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md border border-stone-200/80 overflow-hidden transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="relative overflow-hidden h-28 sm:h-44 md:h-48">
                      <img
                        src={insight.image}
                        alt={insight.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex flex-wrap items-center gap-1 sm:gap-2">
                        <span className="bg-[#373B3A]/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
                          {insight.category}
                        </span>
                        {insight.isPremium && (
                          <span className="bg-amber-400 text-stone-950 font-extrabold px-2 py-0.5 rounded-full text-[10px] sm:text-xs flex items-center gap-1 shadow-sm">
                            <Crown className="w-3 h-3 fill-stone-950" />
                            Premium
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 sm:p-5">
                      <h3 className="text-xs sm:text-base md:text-lg font-bold text-[#373B3A] mb-1.5 sm:mb-2 leading-snug group-hover:text-[#9C8464] transition-colors">
                        {insight.title}
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
                        {insight.summary.length > 130
                          ? insight.summary.substring(0, 130).trim() + "..."
                          : insight.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-2.5 pb-2.5 sm:px-5 sm:pb-5 pt-0">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-stone-500 pt-2 border-t border-stone-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {new Date(insight.date || Date.now()).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {insight.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PREMIUM PAYWALL INTERCEPTOR MODAL */}
      <Dialog open={paywallModalOpen} onOpenChange={setPaywallModalOpen}>
        <DialogContent className="sm:max-w-md bg-stone-900 text-white border-stone-800 rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-14 h-14 bg-amber-400/20 border border-amber-400/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Crown className="w-8 h-8 text-amber-400" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black text-white">
              Analyse Exclusive Premium
            </DialogTitle>
            <DialogDescription className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
              L'insight <strong className="text-white">"{selectedPremiumInsight?.title}"</strong> et ses données stratégiques sont réservés aux abonnés possédant le Pass Premium Amani.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-stone-800/80 rounded-xl p-4 border border-stone-700/60 my-2 space-y-2 text-xs text-stone-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Accès illimité à toutes les analyses financières et sectorielles</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Téléchargement des rapports PDF et synthèses stratégiques</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              onClick={() => {
                setPaywallModalOpen(false);
                navigate('/pricing');
              }}
              className="w-full bg-amber-400 hover:bg-amber-500 text-stone-950 font-black py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Crown className="w-4 h-4 fill-stone-950" />
              Débloquer avec le Pass Premium
            </Button>

            {!user ? (
              <Button
                variant="outline"
                onClick={() => {
                  setPaywallModalOpen(false);
                  navigate('/login');
                }}
                className="w-full border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white text-xs py-2.5 rounded-xl"
              >
                Se connecter à un compte existant
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setPaywallModalOpen(false)}
                className="w-full text-stone-400 hover:text-white text-xs"
              >
                Fermer
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Insights;
