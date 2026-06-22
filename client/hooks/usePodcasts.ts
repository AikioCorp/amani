import { useState, useEffect, useCallback, useRef } from 'react';
import { getSessionToken } from '../services/authService';

export type PodcastStatus = 'draft' | 'published' | 'archived' | 'scheduled';

export interface Podcast {
  id: string;
  type: 'podcast';
  title: string;
  slug: string;
  summary: string;
  description?: string | null;
  content: string | null;
  status: PodcastStatus;
  category_id: string;
  country: string;
  tags?: string[];
  author_id: string;
  meta_title?: string | null;
  meta_description?: string | null;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  views: number;
  likes: number;
  shares: number;
  read_time?: number | null;
  podcast_data?: {
    duration?: string;
    audio_url?: string;
    video_url?: string;
    host?: string;
    guests?: string[];
    episode_number?: number;
    season?: number;
    transcript?: string;
    cover_image?: string;
    audio_file?: string;
    plays?: number;
    downloads?: number;
    rating?: number;
  };
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string | null;
  };
  categories?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
}

interface UsePodcastsOptions {
  status?: PodcastStatus | 'all';
  limit?: number;
  offset?: number;
  category?: string;
  authorId?: string;
}

const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'));

const API_BASE = isLocal ? 'http://localhost:5000/api' : '/api';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
}

function formatPodcast(item: any): Podcast {
  return {
    ...item,
    type: 'podcast',
    author: item.author || {
      id: item.author_id,
      first_name: 'Animateur',
      last_name: 'Podcast',
      avatar_url: null,
    },
    categories: item.category || {
      id: item.category_id,
      name: 'Catégorie Podcast',
      slug: 'podcast',
      color: '#8B5CF6',
    },
  };
}

export const usePodcasts = ({
  status = 'published',
  limit = 10,
  offset = 0,
  category,
  authorId,
}: UsePodcastsOptions = {}) => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState<number>(0);
  const didInitialFetch = useRef(false);

  const fetchPodcasts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('type', 'podcast');
      if (status !== 'all') params.set('status', status);
      params.set('limit', String(limit));
      params.set('offset', String(offset));
      if (category) params.set('category', category);
      if (authorId) params.set('author_id', authorId);

      const resp = await fetch(`${API_BASE}/contents?${params}`);
      if (!resp.ok) throw new Error('Erreur lors de la récupération des podcasts');
      const result = await resp.json();

      const formatted: Podcast[] = (result.data || []).map(formatPodcast);
      setPodcasts(formatted);
      setCount(result.count || 0);
      return formatted;
    } catch (err) {
      console.error('Erreur fetchPodcasts:', err);
      setError(err as Error);
      setPodcasts([]);
      setCount(0);
      return [];
    } finally {
      setLoading(false);
    }
  }, [status, limit, offset, category, authorId]);

  const fetchPodcastBySlug = useCallback(async (slug: string): Promise<Podcast> => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE}/contents/${slug}`);
      if (!resp.ok) throw new Error('Podcast introuvable');
      const result = await resp.json();
      return formatPodcast(result.data);
    } catch (err) {
      console.error('Erreur fetchPodcastBySlug:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPodcastById = useCallback(async (id: string): Promise<Podcast> => {
    try {
      setLoading(true);
      const token = getSessionToken();
      const resp = await fetch(`${API_BASE}/contents/id/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error('Podcast introuvable');
      const result = await resp.json();
      return formatPodcast(result.data);
    } catch (err) {
      console.error('Erreur fetchPodcastById:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPodcastByIdOrSlug = useCallback(async (identifier: string): Promise<Podcast> => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(identifier)) {
      return fetchPodcastById(identifier);
    }
    return fetchPodcastBySlug(identifier);
  }, [fetchPodcastById, fetchPodcastBySlug]);

  const createPodcast = useCallback(async (
    podcastData: Omit<Podcast, 'id' | 'created_at' | 'updated_at' | 'views' | 'likes' | 'shares'>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const token = getSessionToken();
      const slug = podcastData.slug || generateSlug(podcastData.title);

      const resp = await fetch(`${API_BASE}/contents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          ...podcastData,
          type: 'podcast',
          slug,
          published_at:
            podcastData.status === 'published' ? new Date().toISOString() : undefined,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Erreur lors de la création du podcast');
      }

      const result = await resp.json();
      const formatted = formatPodcast(result.data);

      fetchPodcasts().catch(console.error);
      return formatted;
    } catch (err) {
      console.error('Erreur createPodcast:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPodcasts]);

  const updatePodcast = useCallback(async (id: string, updates: Partial<Podcast>) => {
    try {
      setLoading(true);

      const dbUpdates: any = { ...updates };
      delete dbUpdates.author;
      delete dbUpdates.categories;
      delete dbUpdates.created_at;
      delete dbUpdates.id;

      if (dbUpdates.status === 'published' && !dbUpdates.published_at) {
        dbUpdates.published_at = new Date().toISOString();
      }

      const token = getSessionToken();
      const resp = await fetch(`${API_BASE}/contents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(dbUpdates),
      });

      if (!resp.ok) throw new Error('Erreur lors de la mise à jour du podcast');
      const result = await resp.json();

      setPodcasts(prev =>
        prev.map(podcast => (podcast.id === id ? { ...podcast, ...updates } : podcast))
      );

      return result.data;
    } catch (err) {
      console.error('Erreur updatePodcast:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePodcast = useCallback(async (id: string) => {
    try {
      setLoading(true);

      const token = getSessionToken();
      const resp = await fetch(`${API_BASE}/contents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });

      if (!resp.ok) throw new Error('Erreur lors de la suppression du podcast');

      setPodcasts(prev => prev.filter(podcast => podcast.id !== id));
      return true;
    } catch (err) {
      console.error('Erreur deletePodcast:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didInitialFetch.current) {
      fetchPodcasts();
      return;
    }
    didInitialFetch.current = true;
    fetchPodcasts();
  }, [status, limit, offset, category, authorId, fetchPodcasts]);

  return {
    podcasts,
    loading,
    error,
    count,
    refetch: fetchPodcasts,
    fetchPodcastBySlug,
    fetchPodcastById,
    fetchPodcastByIdOrSlug,
    createPodcast,
    updatePodcast,
    deletePodcast,
  };
};
