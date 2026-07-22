// Service pour récupérer les données BRVM
import React from "react";
import { getApiUrl } from "./apiConfig";

export interface BRVMIndex {
  name: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  lastUpdate: string;
  source?: string;
}

export interface BRVMData {
  composite: BRVMIndex;
  fcfa_eur: BRVMIndex;
  inflation: BRVMIndex;
  taux_bceao: BRVMIndex;
  sectoriels?: BRVMIndex[];
  topStocks?: Array<{
    symbol: string;
    name: string;
    price: string;
    change: string;
    changePercent: string;
    volume: string;
    isPositive: boolean;
    lastUpdate: string;
  }>;
  activity?: {
    transactionValue: string;
    equityCap: string;
    bondCap: string;
  };
  timestamp?: string;
  source?: string;
  dataStatus?: "live" | "partial" | "simulated";
  disclaimer?: string;
}

// Fonction pour récupérer les données BRVM
export const fetchBRVMData = async (): Promise<BRVMData> => {
  try {
    const apiUrl = getApiUrl("/brvm");

    const response = await fetch(apiUrl);

    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        if (result.success && result.data) {
          return result.data;
        }
      }
    }

    throw new Error("API BRVM non disponible");
  } catch (error) {
    console.warn(
      "API BRVM non disponible, utilisation des données simulées:",
      error,
    );

    // Données simulées réalistes avec variations
    const now = new Date();
    const baseVariation = Math.sin(now.getTime() / (1000 * 60 * 60)) * 2;

    return {
      composite: {
        name: "BRVM Composite",
        value: (185.42 + baseVariation).toFixed(2),
        change: (4.28 + baseVariation * 0.5).toFixed(2),
        changePercent: `${(2.3 + baseVariation * 0.3).toFixed(1)}%`,
        isPositive: baseVariation > -1,
        lastUpdate: now.toISOString(),
      },
      fcfa_eur: {
        name: "FCFA/EUR",
        value: (655.957 - baseVariation * 0.1).toFixed(3),
        change: (-0.65 - baseVariation * 0.1).toFixed(2),
        changePercent: `${(-0.1 - baseVariation * 0.05).toFixed(1)}%`,
        isPositive: baseVariation < 0.5,
        lastUpdate: now.toISOString(),
      },
      inflation: {
        name: "Inflation UEMOA",
        value: `${(4.2 + Math.abs(baseVariation) * 0.1).toFixed(1)}%`,
        change: (0.5 + baseVariation * 0.1).toFixed(1),
        changePercent: `${(0.5 + baseVariation * 0.1).toFixed(1)}%`,
        isPositive: false,
        lastUpdate: now.toISOString(),
      },
      taux_bceao: {
        name: "Taux BCEAO",
        value: "3.5%",
        change: "0",
        changePercent: "0%",
        isPositive: true,
        lastUpdate: now.toISOString(),
      },
    };
  }
};

// Hook React pour utiliser les données BRVM
export const useBRVMData = () => {
  const [data, setData] = React.useState<BRVMData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const brvmData = await fetchBRVMData();
        setData(brvmData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};
