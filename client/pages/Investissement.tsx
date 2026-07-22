import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useArticles } from '../hooks/useArticles';
import { getApiUrl } from '../services/apiConfig';

interface InvestmentOpportunity {
  id: string;
  title: string;
  category: string;
  risk_level: string;
  expected_return: string;
  min_investment: string;
  time_horizon: string;
  description: string;
  highlights: string[];
  image: string | null;
  status: string;
  funded_percent: number;
}

const Investissement = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(true);

  // Opportunités d'investissement réelles, gérées par l'équipe via le dashboard admin.
  useEffect(() => {
    let cancelled = false;
    fetch(getApiUrl('/investments'))
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.success) setOpportunities(json.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingOpportunities(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch real published investment articles
  const { articles: dbArticles, loading } = useArticles({
    status: 'published',
    category: 'investissement',
    limit: 10
  });

  const investmentArticles = useMemo(() => {
    return (dbArticles || []).map((art: any) => ({
      id: art.id,
      title: art.title,
      summary: art.summary || art.excerpt || '',
      category: art.category_info?.name || 'Investissement',
      image: art.featured_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      date: art.published_at || art.created_at,
      readTime: `${art.read_time || 5} min`,
      views: art.views || 0,
      author: art.author ? `${art.author.first_name} ${art.author.last_name}` : 'Amani Rédaction',
    }));
  }, [dbArticles]);

  const investmentCategories = [
    { id: 'all', name: 'Tous les secteurs' },
    { id: 'tech', name: 'Technologie' },
    { id: 'energy', name: 'Énergie Renouvelable' },
    { id: 'agriculture', name: 'Agriculture' },
    { id: 'healthcare', name: 'Santé' },
    { id: 'finance', name: 'Services Financiers' },
    { id: 'infrastructure', name: 'Infrastructure' }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Faible': return 'text-green-600 bg-green-100';
      case 'Modéré': return 'text-yellow-600 bg-yellow-100';
      case 'Élevé': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'coming_soon': return 'Bientôt';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'coming_soon': return 'text-blue-600 bg-blue-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || opportunity.category.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#373B3A] to-gray-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Opportunités d'Investissement
            </h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed">
              Découvrez les meilleures opportunités d'investissement en Afrique, 
              des projets innovants aux rendements attractifs et à l'impact positif
            </p>
            <div className="mt-8">
              <Button size="lg" className="bg-[#E5DDD5] text-[#373B3A] hover:bg-[#E5DDD2]" asChild>
                <a href="#opportunites">
                  Voir les opportunités
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Opportunities */}
      <section id="opportunites" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#373B3A]">
            Opportunités d'Investissement
          </h2>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher des opportunités d'investissement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#373B3A] focus:border-transparent"
            >
              {investmentCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Opportunities Grid */}
          {loadingOpportunities ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-500 mb-2">
                Aucune opportunité d'investissement publiée pour le moment.
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Contactez-nous pour en savoir plus sur nos partenariats d'investissement.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Nous contacter <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative">
                    <img
                      src={opportunity.image || '/placeholder.svg'}
                      alt={opportunity.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant="secondary">{opportunity.category}</Badge>
                      <Badge className={getStatusColor(opportunity.status)}>
                        {statusLabel(opportunity.status)}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl mb-2">{opportunity.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {opportunity.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Rendement Attendu</p>
                        <p className="font-semibold text-green-600">{opportunity.expected_return}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Niveau de Risque</p>
                        <Badge className={getRiskColor(opportunity.risk_level)}>
                          {opportunity.risk_level}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Investissement Min.</p>
                        <p className="font-semibold">{opportunity.min_investment}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Horizon</p>
                        <p className="font-semibold">{opportunity.time_horizon}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Financement</span>
                        <span>{opportunity.funded_percent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#373B3A] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${opportunity.funded_percent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Highlights */}
                    {opportunity.highlights.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Points Clés:</p>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.highlights.map((highlight, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Le traitement des investissements n'est pas automatisé : le CTA
                        redirige vers le formulaire de contact plutôt que de simuler
                        une action qui n'existe pas. */}
                    <Button className="w-full" disabled={opportunity.status === 'closed'} asChild>
                      <Link to="/contact">
                        {opportunity.status === 'closed'
                          ? 'Complet'
                          : opportunity.status === 'coming_soon'
                            ? 'Être Notifié'
                            : 'Nous contacter pour investir'}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Investment Articles */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#373B3A]">
            Analyses & Actualités d'Investissement
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : investmentArticles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun article d'investissement disponible pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {investmentArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow flex flex-col justify-between">
                  <div>
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <CardHeader>
                      <Badge className="w-fit mb-2" variant="secondary">{article.category}</Badge>
                      <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                      <CardDescription className="line-clamp-3">{article.summary}</CardDescription>
                    </CardHeader>
                  </div>
                  <CardContent>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                      <span>Par {article.author}</span>
                      <span>{article.readTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {new Date(article.date).toLocaleDateString('fr-FR')}
                      </span>
                      <Link to={`/article/${article.slug || article.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        Lire <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Risk Disclaimer */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Avertissement sur les Risques
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Les investissements présentent des risques de perte en capital. Les performances passées 
            ne préjugent pas des performances futures. Il est recommandé de diversifier ses investissements 
            et de consulter un conseiller financier avant toute décision d'investissement.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Investissement;
