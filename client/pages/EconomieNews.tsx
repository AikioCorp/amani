import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Globe,
  TrendingUp,
  Filter,
  Search,
  Eye,
} from "lucide-react";

export default function EconomieNews() {
  const economicNews = [
    {
      id: 1,
      title: "La BCEAO maintient son taux directeur à 3,5%",
      excerpt:
        "Le comité de politique monétaire privilégie la stabilité des prix dans un contexte d'inflation maîtrisée dans l'ensemble de la zone UEMOA.",
      content:
        "Le Comité de Politique Monétaire de la Banque Centrale des États de l'Afrique de l'Ouest a décidé de maintenir le taux directeur à 3,5% lors de sa réunion trimestrielle...",
      category: "Politique monétaire",
      date: "15 janvier 2024",
      author: "Aminata Koné",
      country: "UEMOA",
      readTime: "3 min",
      views: "2,847",
      image: "/placeholder.svg",
    },
    {
      id: 2,
      title: "PIB du Mali : croissance de 5,1% en 2023",
      excerpt:
        "La production aurifère et les bonnes récoltes agricoles soutiennent la croissance économique du Mali malgré les défis sécuritaires.",
      content:
        "Le Mali a enregistré une croissance économique de 5,1% en 2023, dépassant les prévisions initiales de 4,8%...",
      category: "Croissance",
      date: "12 janvier 2024",
      author: "Moussa Diarra",
      country: "Mali",
      readTime: "4 min",
      views: "1,923",
      image: "/placeholder.svg",
    },
    {
      id: 3,
      title: "Le Burkina Faso projette 6% de croissance en 2024",
      excerpt:
        "Malgré les défis sécuritaires, le gouvernement table sur une reprise de l'activité économique portée par le secteur minier.",
      content:
        "Le gouvernement burkinabè a présenté ses projections économiques pour 2024, tablant sur une croissance de 6%...",
      category: "Prévisions",
      date: "10 janvier 2024",
      author: "Fatou Ouédraogo",
      country: "Burkina Faso",
      readTime: "5 min",
      views: "1,654",
      image: "/placeholder.svg",
    },
    {
      id: 4,
      title: "Niger : Les exportations d'uranium en hausse de 12%",
      excerpt:
        "Malgré l'instabilité politique, le secteur minier nigérien maintient sa performance avec une augmentation des revenus d'exportation.",
      content:
        "Les exportations d'uranium du Niger ont progressé de 12% en 2023, générant des revenus de 1,2 milliard de dollars...",
      category: "Commerce",
      date: "8 janvier 2024",
      author: "Abdoulaye Maïga",
      country: "Niger",
      readTime: "4 min",
      views: "1,432",
      image: "/placeholder.svg",
    },
    {
      id: 5,
      title: "Tchad : Le pétrole représente 60% des recettes publiques",
      excerpt:
        "La dépendance aux hydrocarbures reste forte au Tchad, soulevant des questions sur la diversification économique nécessaire.",
      content:
        "Selon le dernier rapport du ministère des Finances, les revenus pétroliers constituent 60% des recettes publiques du Tchad...",
      category: "Ressources",
      date: "5 janvier 2024",
      author: "Hawa Deby",
      country: "Tchad",
      readTime: "6 min",
      views: "1,287",
      image: "/placeholder.svg",
    },
    {
      id: 6,
      title: "Mauritanie : L'exploitation minière attire les investisseurs",
      excerpt:
        "De nouveaux projets miniers voient le jour en Mauritanie, attirant des investissements étrangers importants dans le secteur du fer et de l'or.",
      content:
        "La Mauritanie connaît un regain d'intérêt de la part des investisseurs internationaux pour ses ressources minières...",
      category: "Investissement",
      date: "3 janvier 2024",
      author: "Mohamed Ould Salem",
      country: "Mauritanie",
      readTime: "4 min",
      views: "1,156",
      image: "/placeholder.svg",
    },
  ];

  return (
    <div className="min-h-screen bg-[#E5DDD2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/economie"
            className="inline-flex items-center gap-2 text-amani-primary hover:text-amani-primary/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à Économie
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-amani-primary mb-4">
            Actualités Économiques
          </h1>
          <p className="text-lg text-gray-600 max-w-4xl">
            Toutes les dernières actualités économiques du Sahel et du Tchad.
            Analyses, prévisions et décisions politiques qui impactent la
            région.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-white/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher dans les actualités..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent">
                <option value="all">Tous les pays</option>
                <option value="mali">Mali</option>
                <option value="burkina">Burkina Faso</option>
                <option value="niger">Niger</option>
                <option value="tchad">Tchad</option>
                <option value="mauritanie">Mauritanie</option>
                <option value="uemoa">UEMOA</option>
              </select>
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent">
                <option value="all">Toutes catégories</option>
                <option value="croissance">Croissance</option>
                <option value="politique">Politique monétaire</option>
                <option value="commerce">Commerce</option>
                <option value="investissement">Investissement</option>
                <option value="ressources">Ressources</option>
              </select>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid gap-8">
          {economicNews.map((news) => (
            <article
              key={news.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-white/50"
            >
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-amani-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {news.category}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      {news.country}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {news.date}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-amani-primary mb-3 hover:text-amani-primary/80 cursor-pointer">
                    <Link to={`/article/${news.slug || news.id}`}>{news.title}</Link>
                  </h2>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {news.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {news.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {news.views} vues
                      </span>
                      <span>{news.readTime} de lecture</span>
                    </div>
                    <Link
                      to={`/article/${news.slug || news.id}`}
                      className="text-amani-primary font-semibold hover:text-amani-primary/80 flex items-center gap-1"
                    >
                      Lire l'article
                      <TrendingUp className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-amani-primary text-white px-8 py-3 rounded-lg hover:bg-amani-primary/90 transition-colors font-medium">
            Charger plus d'articles
          </button>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 bg-gradient-to-r from-amani-primary to-amani-primary/80 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Restez informé des actualités économiques
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Recevez chaque semaine un résumé des principales actualités
            économiques du Sahel et du Tchad directement dans votre boîte mail.
          </p>
          <Link
            to="/newsletter"
            className="inline-block bg-white text-amani-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            S'abonner à la newsletter
          </Link>
        </div>
      </div>
    </div>
  );
}
