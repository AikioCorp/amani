import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Zap, Smartphone, Cloud, Brain, Code, Shield, Globe, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useArticles } from '../hooks/useArticles';

const Tech = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const techCategories = [
    { id: 'all', name: 'Toutes les technologies' },
    { id: 'ai', name: 'Intelligence Artificielle' },
    { id: 'blockchain', name: 'Blockchain' },
    { id: 'mobile', name: 'Applications Mobile' },
    { id: 'cloud', name: 'Cloud Computing' },
    { id: 'iot', name: 'Internet des Objets' },
    { id: 'fintech', name: 'FinTech' },
    { id: 'cybersecurity', name: 'Cybersécurité' }
  ];

  const techStats = [
    {
      title: "Startups Tech",
      value: "2,450",
      change: "+35%",
      description: "Nouvelles startups créées",
      icon: Zap,
      color: "text-blue-600"
    },
    {
      title: "Investissements",
      value: "$3.2B",
      change: "+48%",
      description: "Capital investi en 2024",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Développeurs",
      value: "180K",
      change: "+22%",
      description: "Développeurs actifs",
      icon: Code,
      color: "text-purple-600"
    },
    {
      title: "Utilisateurs Mobile",
      value: "450M",
      change: "+15%",
      description: "Utilisateurs connectés",
      icon: Smartphone,
      color: "text-orange-600"
    }
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
      title: art.title,
      category: art.category_info?.name || 'Technologie',
      summary: art.summary || art.excerpt || '',
      image: art.featured_image || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop',
      date: art.published_at || art.created_at,
      readTime: `${art.read_time || 6} min`,
      author: art.author ? `${art.author.first_name} ${art.author.last_name}` : 'Amani Rédaction',
      trending: (art.views || 0) > 50,
      difficulty: art.tags?.includes('Expert') ? 'Expert' : art.tags?.includes('Débutant') ? 'Débutant' : 'Intermédiaire'
    }));
  }, [dbArticles]);

  const emergingTechs = [
    {
      name: "Intelligence Artificielle",
      growth: "+65%",
      description: "Adoption croissante dans l'agriculture et la santé",
      icon: Brain,
      projects: 245
    },
    {
      name: "Blockchain",
      growth: "+42%",
      description: "Applications en gouvernance et finance",
      icon: Shield,
      projects: 128
    },
    {
      name: "IoT & Smart Cities",
      growth: "+38%",
      description: "Développement des villes intelligentes",
      icon: Globe,
      projects: 167
    },
    {
      name: "Cloud Computing",
      growth: "+55%",
      description: "Infrastructure numérique en expansion",
      icon: Cloud,
      projects: 312
    }
  ];

  const techLeaders = [
    {
      name: "TechAfrica Labs",
      sector: "Incubateur Tech",
      location: "Lagos, Nigeria",
      founded: "2018",
      startups: "45+",
      description: "Premier incubateur de startups technologiques en Afrique de l'Ouest"
    },
    {
      name: "Digital Innovation Hub",
      sector: "Centre d'Innovation",
      location: "Nairobi, Kenya",
      founded: "2019",
      startups: "32+",
      description: "Hub spécialisé dans les solutions FinTech et AgriTech"
    },
    {
      name: "AI Research Center",
      sector: "Recherche & Développement",
      location: "Le Cap, Afrique du Sud",
      founded: "2020",
      startups: "28+",
      description: "Centre de recherche en intelligence artificielle et machine learning"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'text-green-600 bg-green-100';
      case 'Intermédiaire': return 'text-yellow-600 bg-yellow-100';
      case 'Expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredNews = techNews.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map selected category keys to keywords in French/English for better matching
    const categoryKeywords: Record<string, string[]> = {
      ai: ['ia', 'intelligence artificielle', 'artificial intelligence', 'machine learning', 'deep learning'],
      blockchain: ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3'],
      mobile: ['mobile', 'app', 'application', 'téléphone', 'smartphone'],
      cloud: ['cloud', 'serveur', 'aws', 'gcp', 'azure', 'hébergement'],
      iot: ['iot', 'internet des objets', 'connected', 'connecté'],
      fintech: ['fintech', 'paiement', 'mobile money', 'banque', 'finance'],
      cybersecurity: ['cyber', 'sécurité', 'hacker', 'protection', 'attaque']
    };

    let matchesCategory = selectedCategory === 'all';
    if (!matchesCategory && categoryKeywords[selectedCategory]) {
      const keywords = categoryKeywords[selectedCategory];
      const targetText = `${article.title} ${article.summary}`.toLowerCase();
      matchesCategory = keywords.some(keyword => targetText.includes(keyword));
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#373B3A] to-gray-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Zap className="h-16 w-16 text-[#E5DDD5]" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Technologie & Innovation
            </h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed">
              Explorez l'écosystème technologique africain en pleine expansion, 
              des innovations disruptives aux tendances qui façonnent l'avenir numérique du continent
            </p>
          </div>
        </div>
      </section>

      {/* Tech Statistics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#373B3A]">
            L'Écosystème Tech en Chiffres
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {techStats.map((stat, index) => (
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

      {/* Emerging Technologies */}
      <section className="py-16 bg-[#E5DDD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#373B3A]">
            Technologies Émergentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {emergingTechs.map((tech, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <tech.icon className="h-12 w-12 text-[#373B3A]" />
                  </div>
                  <h3 className="text-lg font-bold text-center mb-2">{tech.name}</h3>
                  <div className="text-center mb-3">
                    <span className="text-2xl font-bold text-green-600">{tech.growth}</span>
                    <p className="text-sm text-gray-600">Croissance annuelle</p>
                  </div>
                  <p className="text-sm text-gray-600 text-center mb-3">{tech.description}</p>
                  <div className="text-center">
                    <span className="text-sm font-medium text-[#373B3A]">
                      {tech.projects} projets actifs
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Leaders */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#373B3A]">
            Leaders de l'Innovation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {techLeaders.map((leader, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{leader.sector}</Badge>
                    <span className="text-sm text-gray-500">Fondé en {leader.founded}</span>
                  </div>
                  <CardTitle className="text-xl">{leader.name}</CardTitle>
                  <p className="text-gray-600">{leader.location}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{leader.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Startups accompagnées</span>
                    <span className="font-semibold text-[#373B3A]">{leader.startups}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech News and Articles */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#373B3A]">
            Actualités Technologiques
          </h2>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher des articles tech..."
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
              {techCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucun article trouvé pour cette recherche.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredNews.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="relative">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      {article.trending && (
                        <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Tendance
                        </Badge>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="secondary">{article.category}</Badge>
                        <Badge className={getDifficultyColor(article.difficulty)}>
                          {article.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                      <CardDescription className="text-gray-600 line-clamp-3">
                        {article.summary}
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                      <span>Par {article.author}</span>
                      <span>{article.readTime} de lecture</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(article.date).toLocaleDateString('fr-FR')}
                      </span>
                      <Link to={`/article/${article.id}`}>
                        <Button size="sm">
                          Lire l'Article
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-[#373B3A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Restez à la Pointe de l'Innovation
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Recevez chaque semaine les dernières actualités tech africaines et les insights exclusifs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              placeholder="Votre adresse email"
              className="flex-1 bg-white text-gray-900"
            />
            <Button className="bg-[#E5DDD5] text-[#373B3A] hover:bg-[#E5DDD2]">
              S'abonner
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Pas de spam, désabonnement possible à tout moment
          </p>
        </div>
      </section>
    </div>
  );
};

export default Tech;
