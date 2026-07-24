import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  Clock,
  Calendar,
  User,
  Tag,
  ArrowLeft,
  Share2,
  Check,
  Crown,
  Headphones,
  FileText,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  ListMusic,
} from "lucide-react";
import { usePodcasts } from "../hooks/usePodcasts";
import { useAuth } from "../context/AuthContext";
import { useAudio } from "../context/AudioContext";

export default function PodcastDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeTrack,
    isPlaying,
    playTrack,
    togglePlaylistTrack,
    isInPlaylist,
    playlist,
    setIsPlaylistOpen,
  } = useAudio();

  const { fetchPodcastByIdOrSlug, podcasts: allPodcasts } = usePodcasts({ status: "published", limit: 10 });

  const [podcast, setPodcast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  // Authenticated user check: if logged in, any user can access premium podcasts!
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPodcastByIdOrSlug(id);
        if (isMounted) {
          if (!data) {
            setError("Podcast introuvable");
          } else {
            setPodcast(data);
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Erreur lors du chargement du podcast");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Scroll listener for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#373B3A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-[#373B3A]/60">Chargement de l'épisode...</p>
        </div>
      </div>
    );
  }

  if (error || !podcast) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center py-20 px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-[#373B3A]/10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <Headphones className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#373B3A]">Podcast introuvable</h2>
            <p className="text-xs text-[#373B3A]/60 font-medium">
              L'épisode demandé n'existe pas ou a été déplacé.
            </p>
          </div>
          <button
            onClick={() => navigate("/podcast")}
            className="w-full py-3 bg-[#373B3A] hover:bg-[#9C8464] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
          >
            Retour aux podcasts
          </button>
        </div>
      </div>
    );
  }

  const isPremium = Boolean(podcast.is_premium);
  const canAccess = !isPremium || isAuthenticated;

  let coverImage = podcast.podcast_data?.cover_image || podcast.featured_image;
  const isDeadUrl = coverImage && coverImage.includes("rrhcctylbczzahgiqoub.supabase.co");
  if (!coverImage || coverImage === "/placeholder.svg" || coverImage === "" || isDeadUrl) {
    coverImage = "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80";
  }

  const audioUrl = podcast.podcast_data?.audio_url || podcast.podcast_data?.audio_file || undefined;
  const videoUrl = podcast.podcast_data?.video_url || undefined;
  const host = podcast.podcast_data?.host || "Animateur Amani";
  const guests = Array.isArray(podcast.podcast_data?.guests) ? podcast.podcast_data?.guests.join(", ") : undefined;
  const duration = podcast.podcast_data?.duration || undefined;
  const categoryName = podcast.categories?.name || "Podcast";
  const tags = Array.isArray(podcast.tags) ? podcast.tags : [];
  const contentHtml = podcast.content || podcast.summary || podcast.description || "";

  // YouTube embed helper
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

  const isCurrentPlaying = activeTrack?.id === podcast.id && isPlaying;
  const inList = isInPlaylist(podcast.id);

  const handleStartPlay = () => {
    if (!canAccess) return;
    playTrack({
      id: podcast.id,
      title: podcast.title,
      host,
      coverImage,
      audioUrl,
      videoUrl,
      category: categoryName,
      duration,
      isPremium,
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#373B3A] pb-32">
      {/* STICKY TOP NAVIGATION BAR */}
      <div
        className={`sticky top-16 lg:top-20 z-40 transition-all duration-300 ${
          showSticky ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-[#373B3A]/95 backdrop-blur-md text-white shadow-md border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate("/podcast")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[#E5DDD5] font-bold text-xs rounded-lg transition-colors shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-[#9C8464]" />
                <span>Tous les podcasts</span>
              </button>
              <div className="h-4 w-px bg-white/20 shrink-0" />
              <h2 className="truncate text-xs sm:text-sm font-extrabold text-[#E5DDD5]">
                {podcast.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaylistOpen(true)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
                title="Ma liste d'écoute"
              >
                <ListMusic className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
                title="Partager"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HEADER HERO BANNER */}
      <section className="bg-[#373B3A] text-white pt-12 pb-20 border-b border-[#373B3A]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Back button */}
          <Link
            to="/podcast"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#E5DDD5]/80 hover:text-white transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 text-[#9C8464]" />
            <span>Retour aux podcasts</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1 bg-[#9C8464]/20 border border-[#9C8464]/40 text-[#E5DDD5] font-bold rounded-full uppercase tracking-wider">
              {categoryName}
            </span>
            {isPremium ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black rounded-full uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" /> ACCÈS PREMIUM EXCLUSIF
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black rounded-full uppercase tracking-wider">
                ACCÈS GRATUIT
              </span>
            )}
            {duration && (
              <span className="text-[#E5DDD5]/60 font-medium flex items-center gap-1 ml-auto sm:ml-0">
                <Clock className="w-4 h-4 text-[#9C8464]" /> {duration}
              </span>
            )}
            {podcast.published_at && (
              <span className="text-[#E5DDD5]/60 font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4 text-[#9C8464]" /> {formatDate(podcast.published_at)}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {podcast.title}
          </h1>

          {/* Host & Guest Pill */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-2">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E5DDD5]/20 text-[#E5DDD5] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-[#E5DDD5]/60 font-bold uppercase tracking-wider">Présenté par</p>
                  <p className="text-sm font-bold text-white">{host}</p>
                </div>
              </div>

              {guests && (
                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                  <div>
                    <p className="text-[10px] text-[#E5DDD5]/60 font-bold uppercase tracking-wider">Invité VIP</p>
                    <p className="text-sm font-bold text-[#9C8464]">{guests}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bookmark button */}
            <button
              onClick={() => togglePlaylistTrack({
                id: podcast.id,
                title: podcast.title,
                host,
                coverImage,
                audioUrl,
                videoUrl,
                category: categoryName,
                duration,
                isPremium,
              })}
              className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all ${
                inList
                  ? "bg-[#9C8464] text-white border-[#9C8464]"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/20"
              }`}
            >
              {inList ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{inList ? "Dans ma liste" : "Ajouter à ma liste"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <section className="-mt-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-20">
        {/* MEDIA PLAYER CARD / PAYWALL BANNER */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-[#373B3A]/10 space-y-6">
          {!canAccess ? (
            /* PAYWALL PROMPT FOR UNAUTHENTICATED VISITORS */
            <div className="bg-[#373B3A] text-white rounded-2xl p-8 text-center space-y-6 border border-white/10">
              <div className="w-16 h-16 bg-[#9C8464]/20 border border-[#9C8464]/40 text-amber-300 rounded-full flex items-center justify-center mx-auto">
                <Crown className="w-8 h-8 text-amber-300" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  Épisode Exclusif Premium
                </span>
                <h3 className="text-2xl font-black text-white">Connectez-vous pour écouter cet épisode</h3>
                <p className="text-xs text-[#E5DDD5]/80 font-medium">
                  Cet épisode est réservé aux membres inscrits d'Amani Finance.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#9C8464] hover:bg-[#867052] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg text-center"
                >
                  Se connecter
                </Link>
                <Link
                  to="/abonnement"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-white/20 text-center"
                >
                  Découvrir le Pass Premium
                </Link>
              </div>
            </div>
          ) : (
            /* ACCESSIBLE MEDIA PLAYER */
            <div className="space-y-6">
              {videoUrl ? (
                <div className="w-full aspect-video bg-[#373B3A] rounded-2xl overflow-hidden shadow-lg">
                  <iframe
                    className="w-full h-full"
                    src={getYouTubeEmbed(videoUrl) || undefined}
                    title={podcast.title}
                    frameBorder={0}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-8 bg-[#373B3A] text-white p-6 md:p-8 rounded-2xl shadow-lg border border-white/10">
                  <img
                    src={coverImage}
                    alt={podcast.title}
                    className="w-full md:w-48 aspect-square object-cover rounded-xl shrink-0 border border-white/20 shadow-md"
                  />
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#9C8464] uppercase tracking-wider">
                        {categoryName}
                      </span>
                      {duration && (
                        <span className="text-xs text-[#E5DDD5]/60 font-mono">{duration}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white leading-tight">{podcast.title}</h3>

                    {/* Global Player Trigger */}
                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <button
                        onClick={handleStartPlay}
                        disabled={!audioUrl}
                        className="px-8 py-3.5 bg-[#9C8464] hover:bg-[#867052] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2.5 disabled:opacity-50"
                      >
                        {isCurrentPlaying ? (
                          <>
                            <Pause className="w-4 h-4 fill-current" />
                            <span>Mettre en pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current" />
                            <span>Lancer l'écoute en arrière-plan</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => togglePlaylistTrack({
                          id: podcast.id,
                          title: podcast.title,
                          host,
                          coverImage,
                          audioUrl,
                          videoUrl,
                          category: categoryName,
                          duration,
                          isPremium,
                        })}
                        className="px-4 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/15 transition-all flex items-center gap-2"
                      >
                        {inList ? <BookmarkCheck className="w-4 h-4 text-[#9C8464]" /> : <Bookmark className="w-4 h-4" />}
                        <span>{inList ? "Enregistré" : "Ajouter à ma liste"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SUMMARY / HIGHLIGHTS SECTION */}
        {podcast.summary && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-[#373B3A]/10 space-y-4">
            <h3 className="text-xs font-black text-[#373B3A] uppercase tracking-widest flex items-center gap-2 border-b border-[#373B3A]/5 pb-3">
              <Sparkles className="w-4 h-4 text-[#9C8464]" />
              Résumé Synthétique
            </h3>
            <p className="text-sm md:text-base text-[#373B3A]/80 leading-relaxed font-medium">
              {podcast.summary}
            </p>
          </div>
        )}

        {/* DETAILED CONTENT & SHOW NOTES */}
        {contentHtml && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-[#373B3A]/10 space-y-4">
            <h3 className="text-xs font-black text-[#373B3A] uppercase tracking-widest flex items-center gap-2 border-b border-[#373B3A]/5 pb-3">
              <FileText className="w-4 h-4 text-[#9C8464]" />
              Notes d'émission & Transcription Détaillée
            </h3>
            <div
              className="prose prose-slate max-w-none text-sm md:text-base text-[#373B3A]/85 leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        )}

        {/* TAGS & SHARE BAR */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#373B3A]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-[#9C8464] shrink-0" />
            {tags.length > 0 ? (
              tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#E5DDD5]/40 text-[#373B3A] text-xs font-bold uppercase tracking-wider rounded-lg"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-xs font-medium text-[#373B3A]/50">Aucun mot-clé</span>
            )}
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            className="px-5 py-2.5 bg-[#FDFBF9] border border-[#373B3A]/20 hover:bg-[#E5DDD5]/40 text-[#373B3A] text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? "Lien copié !" : "Partager cet épisode"}</span>
          </button>
        </div>

        {/* RELATED EPISODES */}
        {allPodcasts && allPodcasts.filter((p) => p.id !== podcast.id).length > 0 && (
          <div className="space-y-6 pt-6 border-t border-[#373B3A]/10">
            <h3 className="text-xl font-black text-[#373B3A]">Épisodes similaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {allPodcasts
                .filter((p) => p.id !== podcast.id)
                .slice(0, 3)
                .map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/podcast/${rel.id}`}
                    className="bg-white rounded-2xl p-4 border border-[#373B3A]/10 hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#9C8464] uppercase tracking-wider">
                        {rel.categories?.name || "Podcast"}
                      </span>
                      <h4 className="text-sm font-bold text-[#373B3A] line-clamp-2 group-hover:text-[#9C8464] transition-colors">
                        {rel.title}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-[#373B3A]/60 flex items-center gap-1 pt-2 border-t border-[#373B3A]/5">
                      <span>Écouter</span>
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-[#9C8464]" />
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
