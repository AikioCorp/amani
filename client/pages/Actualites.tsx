import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Newspaper,
  Sparkles,
} from "lucide-react";
import { useArticles } from "../hooks/useArticles";
import { SEOHead } from "../components/SEOHead";

export default function Actualites() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  // Charger les articles publiés réels depuis l'API (AVEC cache 0ms)
  const { articles: dbArticles, loading } = useArticles({
    status: "published",
    limit: 50,
    offset: 0,
  });

  // Mapper les articles réels vers le format de la page
  const actualites = React.useMemo(() => {
    return (dbArticles || []).map((art: any) => ({
      id: art.id,
      slug: art.slug || art.id,
      title: art.title,
      excerpt: art.summary || art.excerpt || "",
      category: art.category_info?.name || art.category?.name || "Économie",
      date: art.published_at || art.created_at,
      image:
        art.featured_image &&
        art.featured_image !== "/placeholder.svg" &&
        !art.featured_image.includes("rrhcctylbczzahgiqoub.supabase.co")
          ? art.featured_image
          : "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop",
      views: art.views || 0,
      readTime: `${art.read_time || 4} min`,
      featured: (art.views || 0) > 50,
    }));
  }, [dbArticles]);

  // Calculer dynamiquement les catégories ayant au moins 1 article (count > 0)
  const availableCategories = React.useMemo(() => {
    const counts: Record<string, number> = {};
    actualites.forEach((art) => {
      const cat = art.category || "Économie";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const list = [
      { id: "all", name: "Toutes les actualités", count: actualites.length },
      ...Object.entries(counts).map(([name, count]) => ({
        id: name,
        name,
        count,
      })),
    ];

    // Ne garder QUE les catégories avec au moins 1 article (masquer si count == 0)
    return list.filter((c) => c.count > 0);
  }, [actualites]);

  // Filtrer les actualités
  const filteredActualites = actualites.filter((article) => {
    const matchesCategory =
      selectedCategory === "all" ||
      article.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      searchTerm === "" ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredActualites.find((a) => a.featured) || filteredActualites[0];
  const regularArticles = filteredActualites.filter((a) => a.id !== featuredArticle?.id);

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      <SEOHead
        title="Actualités Économiques & Analyses Stratégiques | Amani Finance"
        description="Suivez l'information financière et économique de référence sur la zone UEMOA, les marchés boursiers de la BRVM, l'agro-industrie et les politiques monétaires."
        keywords="actualités économiques UEMOA, bourse BRVM, finance Afrique de l'Ouest, analyses de marché, économie Afrique"
      />
      {/* En-tête Hero Anthracite & Or */}
      <section className="bg-[#373B3A] text-white py-16 sm:py-20 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-stone-800 border border-stone-700 mb-6">
              <span className="font-mono text-xs font-black text-[#9C8464] uppercase tracking-wider">
                FIL D'INFORMATIONS AMANI
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Actualités Économiques & Analyses Stratégiques
            </h1>
            <p className="text-stone-300 text-base sm:text-lg leading-relaxed font-medium">
              L'information financière de référence sur l'économie de la zone UEMOA, les marchés boursiers de la BRVM, l'agro-industrie et les décisions monétaires en Afrique de l'Ouest.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Barre de Recherche et de Filtres par Catégorie */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Champ de recherche */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Rechercher un sujet, une entreprise, un mot-clé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-[#9C8464] focus:ring-1 focus:ring-[#9C8464] shadow-2xs transition-all placeholder-stone-400 font-medium"
              />
            </div>

            {/* Compteur d'articles */}
            <div className="text-xs font-bold font-mono text-stone-500 bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs">
              {filteredActualites.length} ARTICLE{filteredActualites.length > 1 ? "S" : ""} DISPONIBLE{filteredActualites.length > 1 ? "S" : ""}
            </div>
          </div>

          {/* Pilules de Filtres Catégories (SANS ICÔNES & UNIQUEMENT SI COUNT > 0) */}
          <div className="flex flex-wrap items-center gap-2">
            {availableCategories.map((category) => {
              const isActive = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2.5 cursor-pointer shadow-2xs ${
                    isActive
                      ? "bg-[#373B3A] text-white border border-[#373B3A]"
                      : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
                  }`}
                >
                  <span>{category.name}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-black ${
                      isActive
                        ? "bg-stone-800 text-[#9C8464]"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Skeleton Loader */}
        {loading && (
          <div className="space-y-8 mb-16">
            <div className="h-80 bg-white rounded-3xl border border-stone-200 animate-pulse" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-white rounded-2xl border border-stone-200 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Article Majeur à la Une */}
        {!loading && featuredArticle && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#9C8464]" />
              <h2 className="font-mono text-xs font-black text-[#9C8464] uppercase tracking-widest">
                GRANDE ANALYSE À LA UNE
              </h2>
            </div>

            <Link
              to={`/article/${featuredArticle.slug || featuredArticle.id}`}
              className="group block bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-[#9C8464] transition-all overflow-hidden"
            >
              <div className="grid lg:grid-cols-12 items-center">
                {/* Image */}
                <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[420px] overflow-hidden">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-5 left-5">
                    <span className="font-mono font-black text-xs text-[#9C8464] px-3.5 py-1.5 bg-stone-900/90 backdrop-blur-md text-white rounded-md border border-stone-700 uppercase tracking-wider shadow-md">
                      {featuredArticle.category}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="lg:col-span-5 p-8 sm:p-10">
                  <div className="flex items-center gap-4 text-xs font-bold text-stone-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#9C8464]" />
                      {new Date(featuredArticle.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#9C8464]" />
                      {featuredArticle.readTime}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#373B3A] group-hover:text-[#9C8464] transition-colors mb-4 leading-snug">
                    {featuredArticle.title}
                  </h3>

                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6 font-medium">
                    {featuredArticle.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-stone-100">
                    <span className="text-xs font-extrabold text-stone-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#9C8464]" />
                      <span>Analyse Stratégique</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#9C8464] group-hover:translate-x-1 transition-transform">
                      <span>Lire l'analyse complète</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Grille des Articles Réguliers */}
        {!loading && regularArticles.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#373B3A] mb-8 flex items-center gap-3">
              <Newspaper className="w-6 h-6 text-[#9C8464]" />
              <span>Dernières Publications & Dépêches</span>
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug || article.id}`}
                  className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md hover:border-[#9C8464] transition-all group overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="relative h-48 sm:h-52 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="font-mono font-black text-[11px] text-[#9C8464] px-3 py-1 bg-white/95 backdrop-blur-md rounded-md border border-stone-200 uppercase tracking-wider shadow-2xs">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-[11px] font-bold text-stone-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#9C8464]" />
                          {new Date(article.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#9C8464]" />
                          {article.readTime}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-extrabold text-[#373B3A] group-hover:text-[#9C8464] transition-colors mb-3 line-clamp-2 leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-4 font-medium">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-end border-t border-stone-100 pt-4">
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#9C8464] group-hover:translate-x-1 transition-transform shrink-0">
                      <span>Lire l'article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Aucun résultat */}
        {!loading && filteredActualites.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 max-w-lg mx-auto p-10 shadow-sm">
            <Search className="w-12 h-12 text-[#9C8464] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#373B3A] mb-2">
              Aucun article correspondant
            </h3>
            <p className="text-stone-600 text-sm mb-6">
              Aucun résultat ne correspond à votre recherche "{searchTerm}". Modifiez vos mots-clés ou consultez toutes les catégories.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="px-6 py-2.5 bg-[#373B3A] hover:bg-black text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
