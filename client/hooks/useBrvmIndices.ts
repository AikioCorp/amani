import { useCallback, useMemo, useState } from "react";

// useBrvmIndices — Les données BRVM proviennent du scraper via /api/brvm
// Les opérations CRUD sur les tables brvm_* ne sont pas supportées en mode API standalone.

export type BrvmIndexGroup = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BrvmIndex = {
  id: string;
  slug: string;
  name: string;
  code?: string | null;
  description?: string | null;
  group_id: string | null;
  country?: string | null;
  currency?: string | null;
  unit?: string | null;
  frequency?: string | null;
  source?: string | null;
  methodology?: string | null;
  is_public?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type BrvmIndexPoint = {
  id: string;
  indice_id: string;
  close?: number | string | null;
  change_percent?: string | null;
  ytd_percent?: string | null;
  direction?: "up" | "down" | "neutral" | string | null;
  as_of?: string | null;
  meta?: Record<string, any> | null;
  created_at?: string;
};

export type BrvmIndexWithLatest = BrvmIndex & {
  group?: BrvmIndexGroup | null;
  latest?: BrvmIndexPoint | null;
};

import { API_BASE_URL as API_BASE } from "../services/apiConfig";

export function useBrvmIndices() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère les données BRVM depuis le scraper API.
   * Retourne une liste synthétique de BrvmIndexWithLatest basée sur les données scrapées.
   */
  const fetchIndicesWithLatest = useCallback(async (): Promise<BrvmIndexWithLatest[]> => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/brvm`);
      if (!resp.ok) throw new Error("Erreur lors de la récupération des indices BRVM");
      const result = await resp.json();

      // Mapper les données scrapées vers le type BrvmIndexWithLatest
      const rawData = result.data || [];
      if (!Array.isArray(rawData) || rawData.length === 0) return [];

      return rawData.map((item: any, idx: number): BrvmIndexWithLatest => ({
        id: item.id || `brvm-${idx}`,
        slug: item.slug || item.code?.toLowerCase() || `index-${idx}`,
        name: item.name || item.title || `Indice ${idx + 1}`,
        code: item.code || null,
        description: item.description || null,
        group_id: item.group_id || null,
        country: item.country || "ci",
        currency: item.currency || "XOF",
        unit: item.unit || "points",
        frequency: item.frequency || "daily",
        source: "BRVM",
        methodology: null,
        is_public: true,
        created_at: item.created_at,
        updated_at: item.updated_at,
        group: null,
        latest: item.latest || {
          id: `point-${idx}`,
          indice_id: item.id || `brvm-${idx}`,
          close: item.value || item.close || null,
          change_percent: item.change_percent || null,
          ytd_percent: item.ytd_percent || null,
          direction: item.direction || "neutral",
          as_of: item.as_of || new Date().toISOString().slice(0, 10),
          created_at: item.created_at,
        },
      }));
    } catch (e: any) {
      console.error("[useBrvmIndices] fetchIndicesWithLatest error", e);
      setError(e.message || "Erreur de chargement des indices");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGroups = useCallback(async (): Promise<BrvmIndexGroup[]> => {
    // Les groupes ne sont pas disponibles via le scraper
    return [];
  }, []);

  const fetchPointsByIndex = useCallback(
    async (indexId: string, { limit = 100 }: { limit?: number } = {}): Promise<BrvmIndexPoint[]> => {
      // Les points historiques ne sont pas disponibles via le scraper BRVM
      console.warn("[useBrvmIndices] fetchPointsByIndex non disponible en mode API standalone");
      return [];
    },
    [],
  );

  // Les opérations CRUD sur les tables BRVM ne sont pas supportées
  const notSupported = (op: string) => async (..._args: any[]) => {
    throw new Error(`[useBrvmIndices] ${op} non supporté en mode API standalone`);
  };

  return useMemo(
    () => ({
      loading,
      error,
      fetchGroups,
      fetchIndicesWithLatest,
      fetchPointsByIndex,
      createGroup: notSupported("createGroup"),
      updateGroup: notSupported("updateGroup"),
      deleteGroup: notSupported("deleteGroup"),
      createIndex: notSupported("createIndex"),
      updateIndex: notSupported("updateIndex"),
      deleteIndex: notSupported("deleteIndex"),
      addPoint: notSupported("addPoint"),
    }),
    [loading, error, fetchGroups, fetchIndicesWithLatest, fetchPointsByIndex],
  );
}
