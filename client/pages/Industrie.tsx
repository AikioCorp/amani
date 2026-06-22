import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Grid, List, TrendingUp, Factory, Zap, Users, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useArticles } from '../hooks/useArticles';

const Industrie = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');

  // Fetch real published industry articles
  const { articles: dbArticles, loading } = useArticles({
    status: 'published',
    category: 'industrie-miniere',
    limit: 30
  });

  const industrialNews = useMemo(() => {
    return (dbArticles || []).map((art: any) => ({
      id: art.id,
      title: art.title,
      summary: art.summary || art.excerpt || '',
      sector: art.category_info?.name || 'Mines & Industrie',
      image: art.featured_image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop',
      date: art.published_at || art.created_at,
      readTime: `${art.read_time || 5} min`,
      trending: (art.views || 0) > 50
    }));
  }, [dbArticles]);

  const industrialStats = [
    {
      title: "Production Industrielle",
      value: "+12.5%",
      description: "Croissance annuelle",
      icon: Factory,
      color: "text-green-600"
    },
    {
      title: "Emplois Créés",
      value: "45,000",
      description: "Nouveaux postes",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Investissements",
      value: "€2.8M",
      description: "Capital investi",
      icon: DollarSign,
      color: "text-purple-600"
    },
    {
      title: "Efficacité Énergétique",
      value: "+23%",
      description: "Amélioration",
      icon: Zap,
      color: "text-yellow-600"
    }
  ];

  const sectors = [
    { id: 'all', name: 'Tous les secteurs' },
    { id: 'manufacturing', name: 'Manufacture' },
    { id: 'energy', name: 'Énergie' },
    { id: 'mines', name: 'Mines' },
    { id: 'automotive', name: 'Automobile' },
    { id: 'pharma', name: 'Pharmaceutique' },
    { id: 'food', name: 'Agroalimentaire' }
  ];

  const featuredCompanies = [
    { name: "TechCorp Industries", sector: "Technology", growth: "+18%", employees: "2,500" },
    { name: "GreenEnergy Solutions", sector: "Énergie", growth: "+25%", employees: "1,200" },
    { name: "AutoMotive Plus", sector: "Automobile", growth: "+15%", employees: "3,800" },
    { name: "PharmaCare Africa", sector: "Pharmaceutique", growth: "+22%", employees: "1,800" }
  ];

  const filteredNews = useMemo(() => {
    return industrialNews.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#373B3A] to-gray-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Industrie & Innovation
            </h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed">
              Découvrez les dernières tendances industrielles, les innovations technologiques 
              et les opportunités de croissance qui façonnent l'avenir économique de l'Afrique
            </p>
          </div>
        </div>
      </section>

      {/* Industrial Statistics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#373B3A]">
            Indicateurs Industriels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {industrialStats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <stat.icon className={`h-12 w-12 ${stat.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-lg font-semibold text-gray-700 mb-1">{stat.title}</p>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-16 bg-[#E5DDD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#373B3A]">
            Entreprises en Vedette
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCompanies.map((company, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">{company.name}</h3>
                  <p className="text-gray-600 mb-3">{company.sector}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Croissance</p>
                      <p className="font-semibold text-green-600">{company.growth}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Employés</p>
                      <p className="font-semibold">{company.employees}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* News and Articles Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-[#373B3A]">Actualités Industrielles</h2>
            <div className="flex gap-4">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4 mr-2" />
                Grille
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                Liste
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher des articles industriels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#373B3A] focus:border-transparent"
            >
              {sectors.map(sector => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>

          {/* Articles Grid/List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucun article industriel trouvé pour cette recherche.
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
              : "space-y-6"
            }>
              {filteredNews.map((article) => (
                <Link key={article.id} to={`/article/${article.id}`} className="block">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col justify-between">
                    <div className={viewMode === 'list' ? "flex h-full" : ""}>
                      <div className={viewMode === 'list' ? "w-48 flex-shrink-0" : ""}>
                        <img
                          src={article.image}
                          alt={article.title}
                          className={`w-full h-48 object-cover ${viewMode === 'grid' ? 'rounded-t-lg' : 'rounded-l-lg'}`}
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <CardHeader>
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary">{article.sector}</Badge>
                            {article.trending && (
                              <div className="flex items-center text-orange-500">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                <span className="text-xs font-medium">Tendance</span>
                              </div>
                            )}
                          </div>
                          <CardTitle className="text-lg">{article.title}</CardTitle>
                          <CardDescription className="text-sm text-gray-600 line-clamp-3">
                            {article.summary}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>{new Date(article.date).toLocaleDateString('fr-FR')}</span>
                            <span>{article.readTime} de lecture</span>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
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
