import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export interface Track {
  id: string;
  title: string;
  host: string;
  coverImage: string;
  audioUrl?: string;
  videoUrl?: string;
  category?: string;
  duration?: string;
  isPremium?: boolean;
}

interface AudioContextType {
  activeTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  durationSec: number;
  isMuted: boolean;
  playlist: Track[];
  isPlaylistOpen: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  skipTime: (deltaSeconds: number) => void;
  toggleMute: () => void;
  closePlayer: () => void;
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: string) => void;
  togglePlaylistTrack: (track: Track) => void;
  isInPlaylist: (trackId: string) => boolean;
  setIsPlaylistOpen: (open: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDurationSec: (duration: number) => void;
  playNextTrack: () => void;
  playPrevTrack: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved playlist from localStorage
  const [playlist, setPlaylist] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem("amani_podcast_playlist");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter((t) => t && typeof t === "object" && t.id) : [];
    } catch {
      return [];
    }
  });

  // Save playlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("amani_podcast_playlist", JSON.stringify(playlist));
    } catch (e) {
      console.error("Erreur sauvegarde playlist:", e);
    }
  }, [playlist]);

  // Extract clean audio URL
  const resolveAudioUrl = (track: Track): string | undefined => {
    if (track.audioUrl && track.audioUrl.trim() !== "") return track.audioUrl;
    const rawData = (track as any).podcast_data;
    if (rawData) {
      const pData = typeof rawData === "object" ? rawData : (function() { try { return JSON.parse(rawData); } catch { return {}; } })();
      const found = pData?.audio_url || pData?.audio_file;
      if (found && typeof found === "string" && found.trim() !== "") return found;
    }
    return undefined;
  };

  const playTrack = (track: Track) => {
    if (!track) return;
    const resolvedUrl = resolveAudioUrl(track);

    if (!resolvedUrl && !track.videoUrl) {
      toast.info("Aucun fichier audio ni vidéo disponible pour cet épisode.");
      return;
    }

    const cleanTrack = { ...track, audioUrl: resolvedUrl };

    if (activeTrack?.id === track.id) {
      setIsPlaying((prev) => !prev);
    } else {
      setActiveTrack(cleanTrack);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!activeTrack) return;
    setIsPlaying((prev) => !prev);
  };

  const seek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const skipTime = (deltaSeconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(durationSec || 100, currentTime + deltaSeconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setActiveTrack(null);
  };

  const addToPlaylist = (track: Track) => {
    if (!track || !track.id) return;
    if (!playlist.some((t) => t && t.id === track.id)) {
      setPlaylist((prev) => [...prev, track]);
      toast.success(`"${track.title}" a été ajouté à votre liste d'écoute.`);
    }
  };

  const removeFromPlaylist = (trackId: string) => {
    if (!trackId) return;
    setPlaylist((prev) => prev.filter((t) => t && t.id !== trackId));
    toast.info("Épisode retiré de votre liste.");
  };

  const togglePlaylistTrack = (track: Track) => {
    if (!track || !track.id) return;
    if (isInPlaylist(track.id)) {
      removeFromPlaylist(track.id);
    } else {
      addToPlaylist(track);
    }
  };

  const isInPlaylist = (trackId: string) => {
    if (!trackId || !Array.isArray(playlist)) return false;
    return playlist.some((t) => t && t.id === trackId);
  };

  const playNextTrack = () => {
    if (!activeTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((t) => t && t.id === activeTrack.id);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      playTrack(playlist[currentIndex + 1]);
    }
  };

  const playPrevTrack = () => {
    if (!activeTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((t) => t && t.id === activeTrack.id);
    if (currentIndex > 0) {
      playTrack(playlist[currentIndex - 1]);
    }
  };

  return (
    <AudioContext.Provider
      value={{
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
        addToPlaylist,
        removeFromPlaylist,
        togglePlaylistTrack,
        isInPlaylist,
        setIsPlaylistOpen,
        setIsPlaying,
        setCurrentTime,
        setDurationSec,
        playNextTrack,
        playPrevTrack,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
