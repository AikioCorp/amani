import { useCallback, useMemo, useState } from 'react';
import { getSessionToken } from '../services/authService';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Indice = {
  id: string;
  type: 'indice';
  title: string;
  slug: string;
  summary: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  category_id: string;
  author_id: string;
  country?: string;
  tags?: string[];
  featured_image?: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  views: number;
  likes: number;
  shares: number;
  read_time?: number | null;
  indice_data?: {
    code?: string;
    unit?: string;
    frequency?: 'real-time' | 'daily' | 'weekly' | 'monthly' | string;
    currency?: string;
    source?: string;
    methodology?: string;
    historicalNote?: string;
    isPublic?: boolean;
    currentValue?: string;
    previousValue?: string;
    changePercent?: string;
    changeDirection?: 'up' | 'down' | 'neutral' | string;
    lastUpdated?: string;
    ytdPercent?: string;
    group?: string;
  } | null;
};

export type CreateIndiceInput = {
  name: string;
  code: string;
  summary: string;
  description?: string;
  status: 'draft' | 'published';
  categorySlug?: string;
  country?: string;
  tags?: string[];
  isPublic?: boolean;
  unit?: string;
  frequency?: 'real-time' | 'daily' | 'weekly' | 'monthly' | string;
  currency?: string;
  source?: string;
  methodology?: string;
  historicalNote?: string;
  currentValue: string;
  previousValue?: string;
  changePercent?: string;
  changeDirection?: 'up' | 'down' | 'neutral' | string;
  lastUpdated?: string;
  publishDate?: string;
  ytdPercent?: string;
  group?: string;
};

export type UpdateIndiceInput = Partial<CreateIndiceInput> & {
  name?: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isUUID = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'));

const API_BASE = isLocal ? 'http://localhost:5000/api' : '/api';

function formatIndice(row: any): Indice {
  return {
    ...row,
    type: 'indice',
    published_at: row.published_at ? new Date(row.published_at).toISOString().slice(0, 10) : null,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useIndices() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getAuthHeaders = () => {
    const token = getSessionToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchIndices = useCallback(
    async (opts?: {
      status?: 'draft' | 'published' | 'archived';
      search?: string;
      limit?: number;
      offset?: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('type', 'indice');
        if (opts?.status) params.set('status', opts.status);
        if (opts?.search) params.set('search', opts.search);
        if (opts?.limit) params.set('limit', String(opts.limit));
        if (opts?.offset) params.set('offset', String(opts.offset));

        const resp = await fetch(`${API_BASE}/contents?${params}`);
        if (!resp.ok) throw new Error('Erreur lors de la récupération des indices');
        const result = await resp.json();

        return (result.data || []).map(formatIndice) as Indice[];
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchIndiceById = useCallback(async (id: string): Promise<Indice> => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all indices and find by ID (API doesn't have /contents/:id endpoint for non-slugs)
      const params = new URLSearchParams({ type: 'indice', limit: '1000' });
      const resp = await fetch(`${API_BASE}/contents?${params}`);
      if (!resp.ok) throw new Error('Erreur récupération indices');
      const result = await resp.json();
      const found = (result.data || []).find((r: any) => r.id === id);
      if (!found) throw new Error('Indice introuvable');
      return formatIndice(found);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIndiceBySlug = useCallback(async (slug: string): Promise<Indice> => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/contents/${slug}`);
      if (!resp.ok) throw new Error('Indice introuvable');
      const result = await resp.json();
      return formatIndice(result.data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIndiceByIdOrSlug = useCallback(
    async (idOrSlug: string) =>
      isUUID(idOrSlug) ? fetchIndiceById(idOrSlug) : fetchIndiceBySlug(idOrSlug),
    [fetchIndiceById, fetchIndiceBySlug],
  );

  const createIndice = useCallback(async (input: CreateIndiceInput) => {
    setLoading(true);
    setError(null);
    try {
      const slug = slugify(input.name);

      // Resolve category_id via API
      let category_id = '';
      try {
        const catResp = await fetch(
          `${API_BASE}/categories/${input.categorySlug || 'economie'}`,
        );
        if (catResp.ok) {
          const catResult = await catResp.json();
          category_id = catResult.data?.id || '';
        }
      } catch {
        // Fallback: fetch any category
        const anyResp = await fetch(`${API_BASE}/categories?active_only=false`);
        if (anyResp.ok) {
          const anyResult = await anyResp.json();
          category_id = anyResult.data?.[0]?.id || '';
        }
      }

      if (!category_id) {
        throw new Error(
          'Aucune catégorie disponible. Veuillez créer une catégorie "economie" en premier.',
        );
      }

      const payload: any = {
        type: 'indice',
        title: input.name,
        slug,
        summary: input.summary,
        description: input.description || null,
        status: input.status,
        category_id,
        country: input.country || 'mali',
        tags: input.tags || [],
        published_at:
          input.status === 'published' && input.publishDate
            ? new Date(input.publishDate).toISOString()
            : null,
        indice_data: {
          code: input.code,
          unit: input.unit,
          frequency: input.frequency,
          currency: input.currency,
          source: input.source,
          methodology: input.methodology,
          historicalNote: input.historicalNote,
          isPublic: input.isPublic ?? true,
          currentValue: input.currentValue,
          previousValue: input.previousValue,
          changePercent: input.changePercent,
          changeDirection: input.changeDirection ?? 'neutral',
          lastUpdated: input.lastUpdated || new Date().toISOString().slice(0, 10),
          ytdPercent: input.ytdPercent,
          group: input.group,
        },
      };

      const resp = await fetch(`${API_BASE}/contents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur lors de la création de l'indice");
      }

      const result = await resp.json();
      return result.data as Indice;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIndice = useCallback(
    async (id: string, updates: UpdateIndiceInput) => {
      setLoading(true);
      setError(null);
      try {
        const existing = await fetchIndiceById(id);

        const nextSlug = updates.name ? slugify(updates.name) : existing.slug;
        let category_id = existing.category_id;

        if (updates.categorySlug) {
          try {
            const catResp = await fetch(`${API_BASE}/categories/${updates.categorySlug}`);
            if (catResp.ok) {
              const catResult = await catResp.json();
              category_id = catResult.data?.id || existing.category_id;
            }
          } catch {}
        }

        const nextIndiceData = {
          ...(existing.indice_data || {}),
          code: updates.code ?? existing.indice_data?.code,
          unit: updates.unit ?? existing.indice_data?.unit,
          frequency: updates.frequency ?? existing.indice_data?.frequency,
          currency: updates.currency ?? existing.indice_data?.currency,
          source: updates.source ?? existing.indice_data?.source,
          methodology: updates.methodology ?? existing.indice_data?.methodology,
          historicalNote: updates.historicalNote ?? existing.indice_data?.historicalNote,
          isPublic: updates.isPublic ?? existing.indice_data?.isPublic ?? true,
          currentValue: updates.currentValue ?? existing.indice_data?.currentValue,
          previousValue: updates.previousValue ?? existing.indice_data?.previousValue,
          changePercent: updates.changePercent ?? existing.indice_data?.changePercent,
          changeDirection:
            updates.changeDirection ??
            (existing.indice_data?.changeDirection as any) ??
            'neutral',
          lastUpdated:
            updates.lastUpdated ??
            existing.indice_data?.lastUpdated ??
            new Date().toISOString().slice(0, 10),
        };

        const payload: any = {
          title: updates.name ?? existing.title,
          slug: nextSlug,
          summary: updates.summary ?? existing.summary,
          description: updates.description ?? existing.description,
          status: updates.status ?? existing.status,
          category_id,
          country: updates.country ?? existing.country,
          tags: updates.tags ?? existing.tags,
          published_at:
            (updates.status ?? existing.status) === 'published'
              ? updates.publishDate
                ? new Date(updates.publishDate).toISOString()
                : existing.published_at
                  ? new Date(existing.published_at).toISOString()
                  : new Date().toISOString()
              : null,
          indice_data: nextIndiceData,
        };

        const resp = await fetch(`${API_BASE}/contents/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || "Erreur lors de la mise à jour de l'indice");
        }

        const result = await resp.json();
        return result.data as Indice;
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchIndiceById],
  );

  const deleteIndice = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/contents/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!resp.ok) throw new Error("Erreur lors de la suppression de l'indice");
      return true;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(
    () => ({
      loading,
      error,
      fetchIndices,
      fetchIndiceById,
      fetchIndiceBySlug,
      fetchIndiceByIdOrSlug,
      createIndice,
      updateIndice,
      deleteIndice,
    }),
    [
      loading,
      error,
      fetchIndices,
      fetchIndiceById,
      fetchIndiceBySlug,
      fetchIndiceByIdOrSlug,
      createIndice,
      updateIndice,
      deleteIndice,
    ],
  );
}
