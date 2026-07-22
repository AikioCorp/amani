import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Pause,
  Clock,
  Calendar,
  User,
  Tag,
  Search,
  Filter,
  TrendingUp,
  Headphones,
  Star,
  Download,
} from "lucide-react";
import SocialShare from '../components/SocialShare';
import { usePodcasts } from "../hooks/usePodcasts";

export default function Podcast() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  // Inline playback: no modal
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const { podcasts: data, loading, error } = usePodcasts({ status: 'published', limit: 50 });

  const mapped = (data || []).map((p) => {
    let coverImage = p.podcast_data?.cover_image || p.featured_image;
    
    // Replace empty, literal placeholder strings, or dead Supabase project URLs with varied unsplash images
    const isDeadUrl = coverImage && coverImage.includes('rrhcctylbczzahgiqoub.supabase.co');
    
    if (!coverImage || coverImage === '/placeholder.svg' || coverImage === '' || isDeadUrl) {
      const defaultImages = [
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
        "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
        "https://images.unsplash.com/photo-1516280440502-85f5e0a0d922?w=800&q=80",
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
      ];
      const hash = String(p.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      coverImage = defaultImages[hash % defaultImages.length];
    }

    const duration = p.podcast_data?.duration || undefined;
    const audioUrl = p.podcast_data?.audio_url || undefined;
    const videoUrl = p.podcast_data?.video_url || undefined;
    const plays = (p.podcast_data?.plays as number | undefined) ?? (p.views as number | undefined) ?? 0;
    const rating = (p.podcast_data?.rating as number | undefined) ?? undefined;
    const host = p.podcast_data?.host || 'Animateur';
    const guests = Array.isArray(p.podcast_data?.guests) ? p.podcast_data?.guests : undefined;
    const categoryName = p.categories?.name || 'Podcast';
    const publishedAt = p.published_at || p.created_at;
    const tags = Array.isArray(p.tags) ? p.tags : [];
    
    return {
      id: p.id,
      title: p.title,
      description: p.summary || p.description || "",
      host,
      guest: guests && guests.length ? guests.join(', ') : undefined,
      category: categoryName,
      duration,
      publishedAt,
      plays,
      downloads: (p.podcast_data?.downloads as number | undefined) ?? undefined,
      rating,
      coverImage,
      audioUrl,
      videoUrl,
      tags,
    };
  });

  const categories = [
    "all",
    ...Array.from(new Set(mapped.map((m) => m.category))).filter(Boolean),
  ];

  const filteredPodcasts = mapped.filter((podcast) => {
    const srch = searchTerm.toLowerCase();
    const matchesSearch =
      podcast.title.toLowerCase().includes(srch) ||
      (podcast.description || "").toLowerCase().includes(srch) ||
      (podcast.host || "").toLowerCase().includes(srch);
    const matchesCategory = selectedCategory === "all" || podcast.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Extract YouTube video ID and build embed URL
  const getYouTubeEmbed = (url: string): string | null => {
    try {
      const u = new URL(url);
      // Common params to minimize controls/branding
      const params = 'controls=0&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3';
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace('/', '');
        return id ? `https://www.youtube.com/embed/${id}?${params}` : null;
      }
      if (u.hostname.includes('youtube.com')) {
        // watch?v=ID or /embed/ID or /shorts/ID
        const v = u.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}?${params}`;
        const parts = u.pathname.split('/').filter(Boolean);
        const idx = parts.findIndex(p => p === 'embed' || p === 'shorts');
        const id = idx >= 0 && parts[idx + 1] ? parts[idx + 1] : null;
        return id ? `https://www.youtube.com/embed/${id}?${params}` : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const togglePlay = (podcastId: string) => {
    setCurrentlyPlaying(currentlyPlaying === podcastId ? null : podcastId);
  };

  const featuredPodcast = mapped[0];

  return (
    <div className="min-h-screen bg-white text-[#1C1E1D]">
      {/* Hero Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-4xl lg:text-5xl font-light mb-4 tracking-tight">
              Amani <span className="font-bold text-[#9C8464]">Podcasts.</span>
            </h1>
            <p className="text-lg text-gray-400 font-light max-w-xl">
              Décryptage audio de l'actualité économique sahélienne. Écoutez nos experts.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Podcast */}
      <section className="pb-24 pt-12 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[60vh] bg-[#FDFBF9] -z-10 skew-y-3 transform origin-top-left"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute -top-20 -left-10 text-[180px] md:text-[250px] font-black text-gray-50/50 leading-none select-none z-0 tracking-tighter hidden md:block">
            FOCUS
          </div>
          {loading ? (
            <div className="text-gray-400 font-light tracking-wide text-sm relative z-10">Chargement...</div>
          ) : error ? (
            <div className="text-red-500 font-light text-sm relative z-10">Erreur: {String(error.message || error)}</div>
          ) : !featuredPodcast ? (
            <div className="text-gray-400 font-light tracking-wide text-sm relative z-10">Aucun podcast.</div>
          ) : (
            <div className="group relative z-10">
              <div className="md:flex items-center">
                <div className="md:w-3/5 relative">
                  {currentlyPlaying === featuredPodcast.id && featuredPodcast.videoUrl ? (
                    <div className="w-full aspect-square md:aspect-[4/3] bg-black overflow-hidden shadow-2xl">
                      <iframe
                        className="w-full h-full"
                        src={getYouTubeEmbed(featuredPodcast.videoUrl) || undefined}
                        title={featuredPodcast.title}
                        frameBorder={0}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-square md:aspect-[4/3] relative overflow-hidden shadow-2xl group-hover:shadow-3xl transition-shadow duration-700">
                      <img
                        src={featuredPodcast.coverImage}
                        alt={featuredPodcast.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    </div>
                  )}
                </div>
                <div className="md:w-2/5 md:-ml-24 mt-8 md:mt-0 relative z-20">
                  <div className="bg-white p-8 md:p-12 shadow-xl border border-gray-50">
                    <div className="mb-4 flex flex-wrap items-center gap-4">
                      <span className="text-[10px] font-bold text-[#9C8464] uppercase tracking-[0.2em]">
                        {featuredPodcast.category}
                      </span>
                      {featuredPodcast.duration && (
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                          {featuredPodcast.duration}
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-semibold mb-6 tracking-tight leading-tight">
                      {featuredPodcast.title}
                    </h2>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed font-light">
                      {featuredPodcast.description}
                    </p>

                    <div className="mb-10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#FDFBF9] border border-gray-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-1">Animé par</p>
                        <p className="text-sm font-medium">{featuredPodcast.host}</p>
                      </div>
                    </div>
                    
                    <div>
                      <button
                        onClick={() => togglePlay(featuredPodcast.id)}
                        className="group/btn inline-flex items-center justify-center w-full md:w-auto px-8 py-4 bg-[#1C1E1D] text-white hover:bg-[#9C8464] transition-colors duration-300 font-medium tracking-wide text-sm"
                      >
                        <span className="mr-3">
                          {currentlyPlaying === featuredPodcast.id ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                        </span>
                        {currentlyPlaying === featuredPodcast.id ? "Pause" : "Écouter l'épisode"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Search and Filter */}
      {/* Search and Filter */}
      <section className="pt-8 pb-4 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-2">
            <div className="flex-1 relative w-full group border-b border-gray-200 focus-within:border-[#1C1E1D] transition-colors">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 bg-transparent border-none text-sm font-light focus:outline-none focus:ring-0 placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="relative border-b border-gray-200 focus-within:border-[#1C1E1D] transition-colors">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-0 pr-6 py-2 bg-transparent border-none text-gray-400 font-light text-sm focus:outline-none focus:ring-0 appearance-none cursor-pointer hover:text-[#1C1E1D] transition-colors"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.slice(1).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
              <div className="flex items-center gap-4 hidden sm:flex">
                <button
                  className={`text-[10px] uppercase tracking-[0.2em] transition-colors ${viewMode === 'list' ? 'text-[#1C1E1D] font-medium' : 'text-gray-400 font-light hover:text-[#1C1E1D]'}`}
                  onClick={() => setViewMode('list')}
                >
                  Liste
                </button>
                <button
                  className={`text-[10px] uppercase tracking-[0.2em] transition-colors ${viewMode === 'grid' ? 'text-[#1C1E1D] font-medium' : 'text-gray-400 font-light hover:text-[#1C1E1D]'}`}
                  onClick={() => setViewMode('grid')}
                >
                  Grille
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Podcast List */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* List/Grid container */}
          {loading && <div className="text-gray-400 text-sm font-light">Chargement...</div>}
          {!loading && !error && filteredPodcasts.length === 0 && (
            <div className="text-gray-400 text-sm font-light py-20 text-center">Aucun épisode trouvé.</div>
          )}
          {!loading && !error && viewMode === 'list' && (
            <div className="flex flex-col">
              {filteredPodcasts.map((podcast, index) => (
                <div
                  key={podcast.id}
                  className="group relative border-b border-gray-100 py-10 flex flex-col md:flex-row md:items-center gap-8 hover:bg-gray-50/30 transition-colors -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                >
                  <div className="hidden lg:block absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 text-gray-50 font-black text-[120px] select-none -z-10 group-hover:text-gray-100 transition-colors duration-500">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  {/* Media */}
                  <div className="flex-shrink-0 w-32 md:w-48 relative z-10">
                    {currentlyPlaying === podcast.id && (podcast as any).videoUrl ? (
                      <div className="w-full aspect-square bg-black overflow-hidden shadow-lg">
                        <iframe
                          className="w-full h-full"
                          src={getYouTubeEmbed((podcast as any).videoUrl) || undefined}
                          title={podcast.title}
                          frameBorder={0}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-square overflow-hidden relative shadow-lg group-hover:shadow-xl transition-shadow duration-500">
                        <img
                          src={podcast.coverImage}
                          alt={podcast.title}
                          className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all duration-700"
                        />
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-start relative z-10 lg:pl-12">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-bold text-[#9C8464] uppercase tracking-[0.2em]">
                        {podcast.category}
                      </span>
                      {podcast.duration && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-[10px] text-gray-400 font-medium tracking-widest">{podcast.duration}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-2xl font-semibold text-[#1C1E1D] mb-3 leading-snug">
                      {podcast.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 font-light max-w-2xl">
                      {podcast.description}
                    </p>
                  </div>
                  {/* Action */}
                  <div className="flex-shrink-0 md:ml-4 flex items-center justify-center pt-4 md:pt-0 relative z-10">
                    <button
                      onClick={() => togglePlay(podcast.id)}
                      className="flex items-center gap-3 text-sm text-[#1C1E1D] hover:text-[#9C8464] transition-colors duration-300 font-medium uppercase tracking-widest"
                    >
                      <span className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center group-hover/btn:border-[#9C8464]">
                        {currentlyPlaying === podcast.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-1" />}
                      </span>
                      <span className="hidden md:inline">{currentlyPlaying === podcast.id ? 'Pause' : 'Play'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && !error && viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 pt-8 pb-16">
              {filteredPodcasts.map((podcast, index) => (
                <div key={podcast.id} className={`group flex flex-col cursor-pointer transition-transform duration-700 hover:-translate-y-4 ${index % 2 !== 0 ? 'lg:mt-24' : ''}`} onClick={() => togglePlay(podcast.id)}>
                  {/* Media */}
                  <div className="w-full aspect-[4/5] bg-gray-100 mb-6 relative overflow-hidden shadow-xl">
                    {currentlyPlaying === podcast.id && (podcast as any).videoUrl ? (
                      <iframe
                        className="w-full h-full absolute inset-0"
                        src={getYouTubeEmbed((podcast as any).videoUrl) || undefined}
                        title={podcast.title}
                        frameBorder={0}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <img src={podcast.coverImage} alt={podcast.title} className="absolute inset-0 w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                          <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#1C1E1D] transition-all duration-500 transform ${currentlyPlaying === podcast.id ? 'opacity-100 scale-100' : 'opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100'}`}>
                            {currentlyPlaying === podcast.id ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                          </div>
                        </div>
                      </>
                    )}
                    <div className="absolute top-4 right-4 text-white font-black text-4xl opacity-50 drop-shadow-md select-none">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col px-2">
                    <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
                      <span className="text-[10px] font-bold text-[#9C8464] uppercase tracking-[0.2em]">{podcast.category}</span>
                      {podcast.duration && (
                        <span className="text-[10px] text-gray-400 font-medium tracking-widest">{podcast.duration}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-[#1C1E1D] line-clamp-2 leading-tight group-hover:text-[#9C8464] transition-colors mb-2">{podcast.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 font-light">{podcast.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-medium mb-3">
            Newsletter
          </h2>
          <p className="text-sm text-gray-400 mb-8 font-light">
            Recevez nos derniers épisodes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Adresse email"
              className="flex-1 px-4 py-3 bg-transparent border-b border-gray-200 focus:outline-none focus:border-[#1C1E1D] transition-colors text-sm font-light placeholder-gray-400"
            />
            <button className="px-6 py-3 bg-transparent text-[#1C1E1D] border-b border-[#1C1E1D] hover:text-[#9C8464] hover:border-[#9C8464] transition-colors text-sm font-medium tracking-wide uppercase">
              S'abonner
            </button>
          </div>
        </div>
      </section>

      {/* Inline audio fallback when no videoUrl */}
      {/* We render audio inside each card only when playing; handled above */}
    </div>
  );
}
