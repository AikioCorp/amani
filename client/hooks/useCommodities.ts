import { useCallback, useMemo, useState } from "react";
import { API_BASE_URL as API_BASE } from "../services/apiConfig";

export type CommodityPoint = {
  id: string;
  slug: string;
  name: string;
  code?: string | null;
  description?: string | null;
  category?: string | null;
  currency?: string | null;
  unit?: string | null;
  source?: string | null;
  latest?: {
    close?: number | string | null;
    change_percent?: string | null;
    ytd_percent?: string | null;
    direction?: "up" | "down" | "neutral" | string | null;
    as_of?: string | null;
    created_at?: string;
  } | null;
};

export function useCommodities() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère les données de matières premières depuis l'API.
   */
  const fetchCommodities = useCallback(async (): Promise<CommodityPoint[]> => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/commodities`);
      if (!resp.ok) throw new Error("Erreur lors de la récupération des matières premières");
      const result = await resp.json();

      const rawData = result.data || [];
      if (!Array.isArray(rawData) || rawData.length === 0) return [];

      return rawData.map((item: any, idx: number): CommodityPoint => ({
        id: item.id || `comm-${idx}`,
        slug: item.slug || item.code?.toLowerCase() || `comm-${idx}`,
        name: item.name || item.title || `Matière Première ${idx + 1}`,
        code: item.code || null,
        description: item.description || null,
        category: item.category || "Autre",
        currency: item.currency || "USD",
        unit: item.unit || "unités",
        source: item.source || "Marchés Globaux",
        latest: item.latest || {
          close: item.value || item.close || null,
          change_percent: item.change_percent || null,
          ytd_percent: item.ytd_percent || null,
          direction: item.direction || "neutral",
          as_of: item.as_of || new Date().toISOString().slice(0, 10),
          created_at: item.created_at,
        },
      }));
    } catch (e: any) {
      console.error("[useCommodities] fetchCommodities error", e);
      setError(e.message || "Erreur de chargement des matières premières");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(
    () => ({
      loading,
      error,
      fetchCommodities,
    }),
    [loading, error, fetchCommodities]
  );
}
