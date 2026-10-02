import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  ListMusic,
  Trash2,
  SkipForward,
  SkipBack,
  Headphones,
} from "lucide-react";
import { useAudio } from "../context/AudioContext";

export default function GlobalAudioPlayer() {
  const {
    activeTrack,
    isPlaying,
    currentTime,
    durationSec,
    isMuted,
    playlist,
    isPlaylistOpen,
    audioRef,
    playTrack,
    togglePlay,
    seek,
    skipTime,
    toggleMute,
    closePlayer,
    removeFromPlaylist,
    setIsPlaylistOpen,
    setIsPlaying,
    setCurrentTime,
    setDurationSec,
    playNextTrack,
    playPrevTrack,
  } = useAudio();

  // Sync play/pause with the DOM <audio> element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeTrack?.audioUrl) {
      if (audio.src !== activeTrack.audioUrl) {
        audio.src = activeTrack.audioUrl;
        audio.load();
      }

      if (isPlaying) {
        audio.play().catch((err) => {
          console.error("DOM Audio Playback Error:", err);
          setIsPlaying(false);
        });
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
    }
  }, [activeTrack, isPlaying]);

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* HTML5 AUDIO ELEMENT RENDERED IN DOM */}
      {activeTrack?.audioUrl && (
        <audio
          ref={audioRef}
          src={activeTrack.audioUrl}
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            setCurrentTime(el.currentTime);
            setDurationSec(el.duration || 0);
          }}
          onLoadedMetadata={(e) => {
            const el = e.currentTarget;
            setDurationSec(el.duration || 0);
          }}
          onEnded={() => {
            setIsPlaying(false);
            playNextTrack();
          }}
        />
      )}

      {/* PLAYLIST DRAWER / MODAL - HIGH CONTRAST LIGHT THEME */}
      {isPlaylistOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#373B3A]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white text-[#373B3A] h-full shadow-2xl flex flex-col justify-between border-l border-[#373B3A]/10">
            {/* Drawer Header */}
            <div className="p-6 bg-[#373B3A] text-white border-b border-[#373B3A]/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#9C8464] text-white flex items-center justify-center shadow-sm">
                  <ListMusic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Ma Liste d'Écoute</h3>
                  <p className="text-xs text-[#E5DDD5] font-bold">
                    {playlist.length} épisode{playlist.length > 1 ? "s" : ""} enregistré{playlist.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPlaylistOpen(false)}
                className="text-[#E5DDD5] hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Playlist Catalog Items */}
            <div className="p-6 bg-[#FDFBF9] flex-1 overflow-y-auto space-y-4">
              {playlist.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#E5DDD5]/40 text-[#9C8464] flex items-center justify-center mx-auto">
                    <Headphones className="w-7 h-7" />
                  </div>
                  <p className="text-base font-black text-[#373B3A]">Votre liste d'écoute est vide.</p>
                  <p className="text-xs text-[#373B3A]/70 max-w-xs mx-auto leading-relaxed font-medium">
                    Cliquez sur l'icône de signet/liste sur les cartes de podcast pour les enregistrer ici.
                  </p>
                </div>
              ) : (
                playlist.map((track, idx) => {
                  const isCurrent = activeTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 group ${
                        isCurrent
                          ? "bg-[#9C8464]/10 border-[#9C8464] shadow-md"
                          : "bg-white border-[#373B3A]/15 hover:border-[#9C8464] hover:shadow-sm"
                      }`}
                    >
                      <div
                        onClick={() => playTrack(track)}
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      >
                        <span className="text-xs font-mono font-black text-[#9C8464] shrink-0 w-5">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <img
                          src={track.coverImage}
                          alt={track.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#373B3A]/10 shadow-xs"
                        />
                        <div className="overflow-hidden space-y-0.5">
                          <p className="text-xs font-extrabold text-[#373B3A] group-hover:text-[#9C8464] transition-colors truncate leading-tight">
                            {track.title}
                          </p>
                          <p className="text-[11px] text-[#373B3A]/60 font-bold truncate">
                            {track.host}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => playTrack(track)}
                          className="w-9 h-9 rounded-full bg-[#373B3A] hover:bg-[#9C8464] text-white flex items-center justify-center shadow-md transition-all"
                          title={isCurrent && isPlaying ? "Pause" : "Écouter"}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                        <button
                          onClick={() => removeFromPlaylist(track.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Retirer de la liste"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-6 bg-white border-t border-[#373B3A]/10 flex items-center justify-between">
              <Link
                to="/podcast"
                onClick={() => setIsPlaylistOpen(false)}
                className="text-xs font-black text-[#9C8464] hover:text-[#373B3A] transition-colors uppercase tracking-wider"
              >
                Explorer tous les podcasts →
              </Link>
              <button
                onClick={() => setIsPlaylistOpen(false)}
                className="px-5 py-2.5 bg-[#373B3A] hover:bg-[#9C8464] text-white font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL FIXED BOTTOM PLAYER BAR */}
      {activeTrack && activeTrack.audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#373B3A] text-white border-t border-white/10 p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Track Info & Link */}
            <div className="flex items-center gap-4 min-w-0 w-full md:w-1/3">
              <Link to={`/podcast/${activeTrack.id}`} className="shrink-0 group">
                <img
                  src={activeTrack.coverImage}
                  alt={activeTrack.title}
                  className="w-12 h-12 rounded-xl object-cover border border-white/20 group-hover:scale-105 transition-transform"
                />
              </Link>
              <div className="overflow-hidden">
                <Link
                  to={`/podcast/${activeTrack.id}`}
                  className="text-xs font-bold text-white hover:text-[#9C8464] transition-colors truncate block"
                >
                  {activeTrack.title}
                </Link>
                <p className="text-[11px] text-[#E5DDD5]/70 truncate">{activeTrack.host}</p>
              </div>
            </div>

            {/* Player Controls & Timeline */}
            <div className="flex-1 flex flex-col items-center gap-2 w-full md:w-1/3">
              <div className="flex items-center gap-4">
                <button
                  onClick={playPrevTrack}
                  disabled={playlist.length === 0}
                  className="text-[#E5DDD5]/60 hover:text-white disabled:opacity-30"
                  title="Épisode précédent"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => skipTime(-10)}
                  className="text-[#E5DDD5]/60 hover:text-white text-xs font-bold"
                  title="-10s"
                >
                  -10s
                </button>

                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-[#9C8464] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => skipTime(10)}
                  className="text-[#E5DDD5]/60 hover:text-white text-xs font-bold"
                  title="+10s"
                >
                  +10s
                </button>
                <button
                  onClick={playNextTrack}
                  disabled={playlist.length === 0}
                  className="text-[#E5DDD5]/60 hover:text-white disabled:opacity-30"
                  title="Épisode suivant"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 w-full text-[10px] font-mono text-[#E5DDD5]/70">
                <span>{formatSeconds(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={durationSec || 100}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#9C8464]"
                />
                <span>{formatSeconds(durationSec)}</span>
              </div>
            </div>

            {/* Playlist Button, Volume & Close Controls */}
            <div className="flex items-center gap-3 shrink-0 justify-end w-full md:w-1/3">
              <button
                onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                  isPlaylistOpen
                    ? "bg-[#9C8464] text-white border-[#9C8464]"
                    : "bg-white/10 text-white/80 hover:text-white border-white/10"
                }`}
                title="Ma Liste d'écoute"
              >
                <ListMusic className="w-4 h-4" />
                <span className="hidden sm:inline">Liste</span>
                {playlist.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-[#373B3A] text-[10px] font-black flex items-center justify-center">
                    {playlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={toggleMute}
                className="text-[#E5DDD5]/70 hover:text-white p-2 rounded-lg"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={closePlayer}
                className="text-[#E5DDD5]/70 hover:text-white p-2 rounded-lg"
                title="Fermer le lecteur"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
