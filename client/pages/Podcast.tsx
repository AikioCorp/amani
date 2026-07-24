import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  Clock,
  User,
  Search,
  Headphones,
  Crown,
  X,
  Mic,
  Sparkles,
  ArrowRight,
  Radio,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  ListMusic,
  Info,
} from "lucide-react";
import { usePodcasts } from "../hooks/usePodcasts";
import { useAuth } from "../context/AuthContext";
import { useAudio } from "../context/AudioContext";

export default function Podcast() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    activeTrack,
    isPlaying,
    playTrack,
    togglePlaylistTrack,
    isInPlaylist,
    playlist,
    setIsPlaylistOpen,
  } = useAudio();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Paywall Modal State for unauthenticated visitors
  const [paywallModalPodcast, setPaywallModalPodcast] = useState<any | null>(null);

  const { podcasts: data, loading, error } = usePodcasts({ status: "published", limit: 50 });

  const mapped = (data || []).map((p) => {
    let coverImage = p.podcast_data?.cover_image || p.featured_image;
    const isDeadUrl = coverImage && coverImage.includes("rrhcctylbczzahgiqoub.supabase.co");

    if (!coverImage || coverImage === "/placeholder.svg" || coverImage === "" || isDeadUrl) {
      const defaultImages = [
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
        "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
        "https://images.unsplash.com/photo-1516280440502-85f5e0a0d922?w=800&q=80",
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
      ];
      const hash = String(p.id).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      coverImage = defaultImages[hash % defaultImages.length];
    }

    const duration = p.podcast_data?.duration || undefined;
    const audioUrl = p.podcast_data?.audio_url || p.podcast_data?.audio_file || undefined;
    const videoUrl = p.podcast_data?.video_url || undefined;
    const plays = (p.podcast_data?.plays as number | undefined) ?? (p.views as number | undefined) ?? 0;
    const host = p.podcast_data?.host || "Animateur Amani";
    const guests = Array.isArray(p.podcast_data?.guests) ? p.podcast_data?.guests : undefined;
    const categoryName = p.categories?.name || "Podcast";
    const publishedAt = p.published_at || p.created_at;
    const tags = Array.isArray(p.tags) ? p.tags : [];
    const isPremium = Boolean(p.is_premium);

    return {
      id: p.id,
      title: p.title,
      description: p.summary || p.description || "",
      host,
      guest: guests && guests.length ? guests.join(", ") : undefined,
      category: categoryName,
      duration,
      publishedAt,
      plays,
      coverImage,
      audioUrl,
      videoUrl,
      tags,
      isPremium,
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

  const featuredPodcast = mapped[0];

  // Helper YouTube Embed
  const getYouTubeEmbed = (url: string): string | null => {
    try {
      const u = new URL(url);
      const params = "controls=1&modestbranding=1&rel=0";
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.replace("/", "");
        return id ? `https://www.youtube.com/embed/${id}?${params}` : null;
      }
      if (u.hostname.includes("youtube.com")) {
        const v = u.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}?${params}`;
        const parts = u.pathname.split("/").filter(Boolean);
        const idx = parts.findIndex((p) => p === "embed" || p === "shorts");
        const id = idx >= 0 && parts[idx + 1] ? parts[idx + 1] : null;
        return id ? `https://www.youtube.com/embed/${id}?${params}` : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Playback Control Handler (verifies Premium Paywall for unauthenticated users)
  const handlePlayPodcast = (podcast: typeof mapped[0], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Paywall Check: If podcast is premium and user is NOT logged in, show paywall modal
    if (podcast.isPremium && !user) {
      setPaywallModalPodcast(podcast);
      return;
    }

    playTrack({
      id: podcast.id,
      title: podcast.title,
      host: podcast.host,
      coverImage: podcast.coverImage,
      audioUrl: podcast.audioUrl,
      videoUrl: podcast.videoUrl,
      category: podcast.category,
      duration: podcast.duration,
      isPremium: podcast.isPremium,
    });
  };

  const handleOpenDetail = (podcast: typeof mapped[0], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/podcast/${podcast.id}`);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#373B3A] pb-32">
      {/* HERO SECTION */}
      <section className="bg-[#373B3A] text-white pt-16 pb-24 relative overflow-hidden border-b border-[#373B3A]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#9C8464]/20 border border-[#9C8464]/40 text-[#E5DDD5] rounded-full text-xs font-bold uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 text-[#9C8464] animate-pulse" />
                <span>Amani Finance Audio & Vidéo</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
                Écoutez les enjeux <span className="text-[#9C8464]">économiques</span> du Sahel.
              </h1>
              <p className="text-[#E5DDD5]/80 text-base md:text-lg font-medium leading-relaxed">
                Analyses exclusives, interviews stratégiques et décryptages financiers enregistrés avec les meilleurs décideurs de la région.
              </p>
            </div>

            {/* Quick stats pill & Playlist opener */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaylistOpen(true)}
                className="flex items-center gap-3 bg-[#9C8464] hover:bg-[#867052] text-white border border-white/20 rounded-2xl p-4 shrink-0 shadow-lg transition-all"
              >
                <ListMusic className="w-6 h-6" />
                <div className="text-left">
                  <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Ma Liste d'Écoute</p>
                  <p className="text-sm font-black">{playlist.length} épisode{playlist.length > 1 ? "s" : ""}</p>
                </div>
              </button>

              <div className="hidden sm:flex items-center gap-6 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 shrink-0 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#9C8464]/30 text-[#E5DDD5] flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#E5DDD5]/70 font-bold uppercase tracking-wider">Épisodes</p>
                    <p className="text-lg font-black text-white">{mapped.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED EPISODE BANNER */}
      {featuredPodcast && !loading && (
        <section className="-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-[#373B3A]/10 flex flex-col lg:flex-row items-center gap-8 group">
            <div className="w-full lg:w-2/5 relative shrink-0 overflow-hidden rounded-2xl aspect-[16/10] bg-[#373B3A]">
              <img
                src={featuredPodcast.coverImage}
                alt={featuredPodcast.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#373B3A]/30 flex items-center justify-center">
                <button
                  onClick={(e) => handlePlayPodcast(featuredPodcast, e)}
                  className="w-16 h-16 rounded-full bg-[#373B3A] text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-[#9C8464] transition-all"
                >
                  {activeTrack?.id === featuredPodcast.id && isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1" />
                  )}
                </button>
              </div>
              {featuredPodcast.isPremium && (
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-[#373B3A]/90 text-amber-300 rounded-full text-xs font-black shadow-md border border-amber-500/30">
                  <Crown className="w-3.5 h-3.5" />
                  <span>PREMIUM</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#9C8464]/10 text-[#9C8464] font-bold text-xs rounded-full uppercase tracking-wider">
                  {featuredPodcast.category}
                </span>
                {featuredPodcast.duration && (
                  <span className="text-xs font-bold text-[#373B3A]/50 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {featuredPodcast.duration}
                  </span>
                )}
                <span className="text-xs font-bold text-[#9C8464]">À la une</span>
              </div>

              <h2
                onClick={(e) => handleOpenDetail(featuredPodcast, e)}
                className="text-2xl lg:text-3xl font-black text-[#373B3A] tracking-tight leading-tight cursor-pointer hover:text-[#9C8464] transition-colors"
              >
                {featuredPodcast.title}
              </h2>

              <p className="text-[#373B3A]/70 text-sm md:text-base leading-relaxed line-clamp-3 font-medium">
                {featuredPodcast.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E5DDD5]/50 flex items-center justify-center text-[#373B3A] font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#373B3A]/50 font-bold uppercase tracking-wider">Animé par</p>
                    <p className="text-xs font-bold text-[#373B3A]">{featuredPodcast.host}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlaylistTrack(featuredPodcast);
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                      isInPlaylist(featuredPodcast.id)
                        ? "bg-[#9C8464] text-white border-[#9C8464]"
                        : "bg-[#FDFBF9] text-[#373B3A] border-[#373B3A]/20 hover:border-[#373B3A]"
                    }`}
                    title="Ajouter à ma liste d'écoute"
                  >
                    {isInPlaylist(featuredPodcast.id) ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={(e) => handleOpenDetail(featuredPodcast, e)}
                    className="px-5 py-3 border border-[#373B3A]/20 hover:border-[#373B3A] text-[#373B3A] font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Info className="w-4 h-4" />
                    <span>Détails</span>
                  </button>

                  <button
                    onClick={(e) => handlePlayPodcast(featuredPodcast, e)}
                    className="px-6 py-3 bg-[#373B3A] hover:bg-[#9C8464] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    {activeTrack?.id === featuredPodcast.id && isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>{featuredPodcast.isPremium && !user ? "Débloquer" : "Écouter l'épisode"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FILTER & SEARCH BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="bg-white p-4 lg:p-6 rounded-3xl shadow-sm border border-[#373B3A]/10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#373B3A]/40 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un podcast, un sujet, un intervenant..."
              className="w-full pl-11 pr-4 py-3 bg-[#FDFBF9] border border-[#373B3A]/10 rounded-2xl text-sm font-medium text-[#373B3A] placeholder-[#373B3A]/40 focus:outline-none focus:ring-2 focus:ring-[#373B3A] transition-all"
            />
          </div>

          {/* Category Pills & View Switcher */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-[#373B3A] text-white shadow-sm"
                      : "bg-[#E5DDD5]/30 text-[#373B3A]/70 hover:text-[#373B3A] hover:bg-[#E5DDD5]/60"
                  }`}
                >
                  {cat === "all" ? "Tous les épisodes" : cat}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-[#E5DDD5]/30 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "grid" ? "bg-white text-[#373B3A] shadow-sm" : "text-[#373B3A]/50 hover:text-[#373B3A]"
                }`}
                title="Vue Grille"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "list" ? "bg-white text-[#373B3A] shadow-sm" : "text-[#373B3A]/50 hover:text-[#373B3A]"
                }`}
                title="Vue Liste"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PODCAST GRID / LIST CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#373B3A]/10 shadow-sm space-y-4">
            <div className="w-10 h-10 border-4 border-[#373B3A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#373B3A]/60">Chargement des podcasts...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 border border-red-200 text-red-700 rounded-3xl text-center font-bold">
            Erreur lors du chargement des podcasts.
          </div>
        ) : filteredPodcasts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#373B3A]/10 shadow-sm space-y-3">
            <Mic className="w-12 h-12 text-[#373B3A]/30 mx-auto" />
            <p className="text-base font-bold text-[#373B3A]">Aucun épisode trouvé.</p>
            <p className="text-xs text-[#373B3A]/50">Essayez de modifier votre recherche ou la catégorie.</p>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPodcasts.map((podcast) => {
              const isCurrentPlaying = activeTrack?.id === podcast.id && isPlaying;
              const inList = isInPlaylist(podcast.id);
              return (
                <div
                  key={podcast.id}
                  onClick={(e) => handleOpenDetail(podcast, e)}
                  className="bg-white rounded-3xl border border-[#373B3A]/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                >
                  {/* Cover / Video Preview */}
                  <div className="relative aspect-[16/10] bg-[#373B3A] overflow-hidden">
                    {isCurrentPlaying && podcast.videoUrl ? (
                      <iframe
                        className="w-full h-full"
                        src={getYouTubeEmbed(podcast.videoUrl) || undefined}
                        title={podcast.title}
                        frameBorder={0}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <img
                          src={podcast.coverImage}
                          alt={podcast.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-[#373B3A]/20 group-hover:bg-[#373B3A]/40 transition-colors flex items-center justify-center">
                          <button
                            onClick={(e) => handlePlayPodcast(podcast, e)}
                            className="w-14 h-14 rounded-full bg-[#373B3A] text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 hover:bg-[#9C8464] transition-all"
                          >
                            {isCurrentPlaying ? (
                              <Pause className="w-6 h-6 fill-current" />
                            ) : (
                              <Play className="w-6 h-6 fill-current ml-1" />
                            )}
                          </button>
                        </div>
                      </>
                    )}

                    {/* Bookmark playlist quick button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlaylistTrack(podcast);
                      }}
                      className={`absolute top-4 left-4 p-2 rounded-full shadow-md transition-all ${
                        inList
                          ? "bg-[#9C8464] text-white"
                          : "bg-black/50 hover:bg-black/80 text-white"
                      }`}
                      title="Ajouter à ma liste d'écoute"
                    >
                      {inList ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    {/* Badge Premium / Gratuit */}
                    {podcast.isPremium ? (
                      <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 bg-[#373B3A]/90 text-amber-300 rounded-full text-[10px] font-black shadow-md border border-amber-500/30">
                        <Crown className="w-3 h-3" />
                        <span>PREMIUM</span>
                      </div>
                    ) : (
                      <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-black shadow-md">
                        <span>GRATUIT</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#9C8464] uppercase tracking-wider">
                          {podcast.category}
                        </span>
                        {podcast.duration && (
                          <span className="text-[#373B3A]/50 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {podcast.duration}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-extrabold text-[#373B3A] leading-snug line-clamp-2 group-hover:text-[#9C8464] transition-colors">
                        {podcast.title}
                      </h3>

                      <p className="text-xs text-[#373B3A]/60 line-clamp-2 leading-relaxed font-medium">
                        {podcast.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#373B3A]/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#E5DDD5]/40 flex items-center justify-center text-[#373B3A] font-bold text-[10px]">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-[#373B3A]/80 truncate max-w-[140px]">
                          {podcast.host}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handlePlayPodcast(podcast, e)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isCurrentPlaying
                            ? "bg-[#373B3A] text-white"
                            : "bg-[#E5DDD5]/30 hover:bg-[#373B3A] hover:text-white text-[#373B3A]"
                        }`}
                      >
                        {isCurrentPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{podcast.isPremium && !user ? "Débloquer" : "Écouter"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-4">
            {filteredPodcasts.map((podcast) => {
              const isCurrentPlaying = activeTrack?.id === podcast.id && isPlaying;
              const inList = isInPlaylist(podcast.id);
              return (
                <div
                  key={podcast.id}
                  onClick={(e) => handleOpenDetail(podcast, e)}
                  className="bg-white rounded-3xl border border-[#373B3A]/10 p-4 lg:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-6 group cursor-pointer"
                >
                  <div className="w-full md:w-48 aspect-[16/10] bg-[#373B3A] rounded-2xl overflow-hidden relative shrink-0">
                    <img
                      src={podcast.coverImage}
                      alt={podcast.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[#373B3A]/30 flex items-center justify-center">
                      <button
                        onClick={(e) => handlePlayPodcast(podcast, e)}
                        className="w-12 h-12 rounded-full bg-[#373B3A] text-white flex items-center justify-center shadow-lg hover:bg-[#9C8464] transition-all"
                      >
                        {isCurrentPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 text-left w-full">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-[#9C8464] uppercase tracking-wider">
                        {podcast.category}
                      </span>
                      {podcast.isPremium && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#373B3A] text-amber-300 rounded-full text-[10px] font-black">
                          <Crown className="w-3 h-3" /> PREMIUM
                        </span>
                      )}
                      {podcast.duration && (
                        <span className="text-[#373B3A]/40 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {podcast.duration}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-[#373B3A] leading-snug group-hover:text-[#9C8464] transition-colors">
                      {podcast.title}
                    </h3>

                    <p className="text-xs text-[#373B3A]/60 line-clamp-2 leading-relaxed font-medium">
                      {podcast.description}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-xs text-[#373B3A]/60 font-bold">
                      <User className="w-3.5 h-3.5 text-[#9C8464]" />
                      <span>{podcast.host}</span>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlaylistTrack(podcast);
                      }}
                      className={`p-3 rounded-xl border transition-all ${
                        inList
                          ? "bg-[#9C8464] text-white border-[#9C8464]"
                          : "bg-white border-[#373B3A]/20 hover:border-[#373B3A] text-[#373B3A]"
                      }`}
                      title="Ajouter à ma liste d'écoute"
                    >
                      {inList ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={(e) => handleOpenDetail(podcast, e)}
                      className="px-4 py-3 border border-[#373B3A]/20 text-[#373B3A] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#E5DDD5]/30 transition-all flex items-center gap-1.5"
                    >
                      <Info className="w-4 h-4" />
                      <span>Fiche</span>
                    </button>
                    <button
                      onClick={(e) => handlePlayPodcast(podcast, e)}
                      className="flex-1 md:flex-initial px-6 py-3 bg-[#373B3A] hover:bg-[#9C8464] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      {isCurrentPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>{podcast.isPremium && !user ? "Débloquer" : "Écouter"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PREMIUM PAYWALL MODAL FOR UNAUTHENTICATED VISITORS */}
      {paywallModalPodcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#373B3A]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#373B3A] border border-white/10 text-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6 relative overflow-hidden">
            <button
              onClick={() => setPaywallModalPodcast(null)}
              className="absolute top-4 right-4 text-[#E5DDD5]/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-[#9C8464]/20 border border-[#9C8464]/40 text-amber-300 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Crown className="w-8 h-8 text-amber-300" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Épisode Exclusif Premium
              </span>
              <h3 className="text-xl font-black text-white leading-tight">
                {paywallModalPodcast.title}
              </h3>
              <p className="text-xs text-[#E5DDD5]/80 font-medium">
                Connectez-vous à votre compte Amani pour débloquer cet épisode.
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl text-left space-y-2 border border-white/10">
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9C8464]" /> Avantages des membres :
              </p>
              <ul className="text-xs text-[#E5DDD5]/90 space-y-1.5 font-medium pl-6 list-disc">
                <li>Écoute en tâche de fond continue sur tout le site</li>
                <li>Sauvegarde dans votre liste d'écoute personnelle</li>
                <li>Accès intégral aux analyses et alertes de marché</li>
              </ul>
            </div>

            <div className="pt-2 space-y-3">
              <Link
                to="/login"
                onClick={() => setPaywallModalPodcast(null)}
                className="w-full py-3.5 bg-[#9C8464] hover:bg-[#867052] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setPaywallModalPodcast(null)}
                className="text-xs font-bold text-[#E5DDD5]/60 hover:text-white transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
