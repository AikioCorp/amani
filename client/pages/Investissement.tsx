import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, TrendingUp, DollarSign, BarChart3, Shield, Globe, Users, ArrowUpRight, Calendar, Clock, Eye, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useArticles } from '../hooks/useArticles';

const Investissement = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const investmentStats = [
    {
      title: "Capitaux Investis",
      value: "€125M",
      change: "+15.3%",
      description: "Ce trimestre",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Rendement Moyen",
      value: "12.8%",
      change: "+2.1%",
      description: "Performance annuelle",
      icon: BarChart3,
      color: "text-blue-600"
    },
    {
      title: "Projets Financés",
      value: "384",
      change: "+28",
      description: "Nouveaux projets",
      icon: Globe,
      color: "text-purple-600"
    },
    {
      title: "Investisseurs Actifs",
      value: "2,450",
      change: "+185",
      description: "Investisseurs engagés",
      icon: Users,
      color: "text-orange-600"
    }
  ];

  const investmentCategories = [
    { id: 'all', name: 'Tous les secteurs' },
    { id: 'tech', name: 'Technologie' },
    { id: 'energy', name: 'Énergie Renouvelable' },
    { id: 'agriculture', name: 'Agriculture' },
    { id: 'healthcare', name: 'Santé' },
    { id: 'finance', name: 'Services Financiers' },
    { id: 'infrastructure', name: 'Infrastructure' }
  ];

  const investmentOpportunities = [
    {
      id: 1,
      title: "FinTech Revolution : Solutions de paiement mobile en Afrique",
      category: "Technologie",
      riskLevel: "Modéré",
      expectedReturn: "18-25%",
      minInvestment: "€50,000",
      timeHorizon: "3-5 ans",
      description: "Investissement dans les solutions de paiement mobile qui révolutionnent le secteur financier africain avec une croissance de 40% par an.",
      highlights: ["Marché en croissance de 40%", "Technologie éprouvée", "Équipe expérimentée"],
      status: "Ouvert",
      funded: 65,
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      title: "Agriculture Durable : Fermes Intelligentes et IoT",
      category: "Agriculture",
      riskLevel: "Faible",
      expectedReturn: "12-18%",
      minInvestment: "€25,000",
      timeHorizon: "2-4 ans",
      description: "Modernisation de l'agriculture africaine avec des technologies IoT pour améliorer les rendements et la durabilité.",
      highlights: ["Impact social positif", "Technologie innovante", "Marché stable"],
      status: "Ouvert",
      funded: 45,
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      title: "Énergie Solaire : Parcs Photovoltaïques Communautaires",
      category: "Énergie Renouvelable",
      riskLevel: "Faible",
      expectedReturn: "15-20%",
      minInvestment: "€100,000",
      timeHorizon: "5-7 ans",
      description: "Développement de parcs solaires communautaires pour fournir une énergie propre et abordable aux zones rurales.",
      highlights: ["Énergie renouvelable", "Impact environnemental", "Revenus stables"],
      status: "Bientôt",
      funded: 0,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      title: "E-commerce B2B : Plateforme de Commerce Interentreprises",
      category: "Technologie",
      riskLevel: "Élevé",
      expectedReturn: "25-35%",
      minInvestment: "€75,000",
      timeHorizon: "3-6 ans",
      description: "Plateforme digitale connectant les entreprises africaines pour faciliter le commerce interentreprises à l'échelle continentale.",
      highlights: ["Marché B2B en expansion", "Technologie scalable", "Potentiel élevé"],
      status: "Fermé",
      funded: 100,
      image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400&h=250&fit=crop"
    }
  ];

  const marketTrends = [
    {
      title: "Intelligence Artificielle",
      growth: "+45%",
      description: "L'IA transforme les industries africaines"
    },
    {
      title: "Énergie Verte",
      growth: "+38%",
      description: "Transition énergétique accélérée"
    },
    {
      title: "FinTech",
      growth: "+42%",
      description: "Innovation financière en croissance"
    },
    {
      title: "E-commerce",
      growth: "+35%",
      description: "Commerce électronique en expansion"
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Faible': return 'text-green-600 bg-green-100';
      case 'Modéré': return 'text-yellow-600 bg-yellow-100';
      case 'Élevé': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ouvert': return 'text-green-600 bg-green-100';
      case 'Bientôt': return 'text-blue-600 bg-blue-100';
      case 'Fermé': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredOpportunities = investmentOpportunities.filter(opportunity => {
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
              <Button size="lg" className="bg-[#E5DDD5] text-[#373B3A] hover:bg-[#E5DDD2]">
                Commencer à Investir
                <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Statistics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#373B3A]">
            Performance du Marché
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {investmentStats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <stat.icon className={`h-12 w-12 ${stat.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-lg font-semibold text-gray-700 mb-1">{stat.title}</p>
                  <p className="text-sm text-gray-500 mb-2">{stat.description}</p>
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Market Trends */}
      <section className="py-16 bg-[#E5DDD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#373B3A]">
            Tendances du Marché
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketTrends.map((trend, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-3">
                    <TrendingUp className="h-8 w-8 text-green-600 mr-2" />
                    <span className="text-2xl font-bold text-green-600">{trend.growth}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{trend.title}</h3>
                  <p className="text-sm text-gray-600">{trend.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Opportunities */}
      <section className="py-16 bg-white">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative">
                  <img
                    src={opportunity.image}
                    alt={opportunity.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="secondary">{opportunity.category}</Badge>
                    <Badge className={getStatusColor(opportunity.status)}>
                      {opportunity.status}
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
                      <p className="font-semibold text-green-600">{opportunity.expectedReturn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Niveau de Risque</p>
                      <Badge className={getRiskColor(opportunity.riskLevel)}>
                        {opportunity.riskLevel}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Investissement Min.</p>
                      <p className="font-semibold">{opportunity.minInvestment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Horizon</p>
                      <p className="font-semibold">{opportunity.timeHorizon}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Financement</span>
                      <span>{opportunity.funded}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#373B3A] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${opportunity.funded}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Highlights */}
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

                  <Button 
                    className="w-full"
                    disabled={opportunity.status === 'Fermé'}
                  >
                    {opportunity.status === 'Fermé' ? 'Complet' : 
                     opportunity.status === 'Bientôt' ? 'Être Notifié' : 'Investir Maintenant'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
                      <Link to={`/article/${article.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
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
