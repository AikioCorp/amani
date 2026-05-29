// Service pour récupérer les prix des commodités (or, coton, pétrole, métaux précieux)
import React from "react";

export interface Commodity {
  name: string;
  symbol: string;
  price: string;
  currency: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  lastUpdate: string;
  unit: string; // oz, tonne, baril, etc.
  description: string;
  source: string;
}

export interface CommoditiesData {
  gold: Commodity;
  cotton: Commodity;
  oil_brent: Commodity;
  oil_wti: Commodity;
  silver: Commodity;
  platinum: Commodity;
  copper: Commodity;
  coffee: Commodity;
  cocoa: Commodity;
  timestamp: string;
  source: string;
}

// Fonction pour récupérer les prix des commodités
export const fetchCommoditiesData = async (): Promise<CommoditiesData> => {
  try {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname.includes("127.0.0.1");

    const apiUrl = isLocal
      ? "http://localhost:5000/api/commodities"
      : "/api/commodities";

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

    throw new Error("API commodités non disponible");
  } catch (error) {
    console.warn(
      "API commodités non disponible, utilisation des données simulées:",
      error,
    );

    // Données simulées réalistes
    const now = new Date();
    const hourlyVariation = Math.sin(now.getTime() / (1000 * 60 * 60)) * 2;

    return {
      gold: {
        name: "Or",
        symbol: "XAU/USD",
        price: (2025.5 + hourlyVariation * 15).toFixed(2),
        currency: "USD",
        change: (hourlyVariation * 15).toFixed(2),
        changePercent: `${hourlyVariation >= 0 ? "+" : ""}${(((hourlyVariation * 15) / 2025.5) * 100).toFixed(2)}%`,
        isPositive: hourlyVariation >= 0,
        lastUpdate: now.toISOString(),
        unit: "once troy",
        description:
          "Métal précieux de référence, refuge en temps d'incertitude économique",
        source: "simulation",
      },
      cotton: {
        name: "Coton",
        symbol: "CT",
        price: (75.25 + hourlyVariation * 2).toFixed(2),
        currency: "USD",
        change: (hourlyVariation * 2).toFixed(2),
        changePercent: `${hourlyVariation >= 0 ? "+" : ""}${(((hourlyVariation * 2) / 75.25) * 100).toFixed(2)}%`,
        isPositive: hourlyVariation >= 0,
        lastUpdate: now.toISOString(),
        unit: "cents/livre",
        description: "Fibre textile importante pour l'économie ouest-africaine",
        source: "simulation",
      },
      oil_brent: {
        name: "Pétrole Brent",
        symbol: "BZ",
        price: (82.45 + hourlyVariation * 3).toFixed(2),
        currency: "USD",
        change: (hourlyVariation * 3).toFixed(2),
        changePercent: `${hourlyVariation >= 0 ? "+" : ""}${(((hourlyVariation * 3) / 82.45) * 100).toFixed(2)}%`,
        isPositive: hourlyVariation >= 0,
        lastUpdate: now.toISOString(),
        unit: "USD/baril",
        description: "Référence mondiale pour le prix du pétrole",
        source: "simulation",
      },
      oil_wti: {
        name: "Pétrole WTI",
        symbol: "CL",
        price: (78.9 + hourlyVariation * 2.8).toFixed(2),
        currency: "USD",
        change: (hourlyVariation * 2.8).toFixed(2),
        changePercent: `${hourlyVariation >= 0 ? "+" : ""}${(((hourlyVariation * 2.8) / 78.9) * 100).toFixed(2)}%`,
        isPositive: hourlyVariation >= 0,
        lastUpdate: now.toISOString(),
        unit: "USD/baril",
        description: "Pétrole léger américain, référence pour les États-Unis",
        source: "simulation",
      },
      silver: {
        name: "Argent",
        symbol: "XAG/USD",
        price: (24.85 + hourlyVariation * 0.8).toFixed(2),
        currency: "USD",
        change: (hourlyVariation * 0.8).toFixed(2),
        changePercent: `${hourlyVariation >= 0 ? "+" : ""}${(((hourlyVariation * 0.8) / 24.85) * 100).toFixed(2)}%`,
        isPositive: hourlyVariation >= 0,
        lastUpdate: now.toISOString(),
        unit: "once troy",
        description: "Métal précieux industriel et d'investissement",
        source: "simulation",
      },
      platinum: {
        name: "Platine",
        symbol: "XPT/USD",
        price: (985.3 + hourlyVariation * 25).toFixed(2),
        currency: "USD",
        change: (hourlyVariation * 25).toFixed(2),
        changePercent: `${hourlyVariation >= 0 ? "+" : ""}${(((hourlyVariation * 25) / 985.3) * 100).toFixed(2)}%`,
        isPositive: hourlyVariation >= 0,
        lastUpdate: now.toISOString(),
        unit: "once troy",
        description:
          "Métal précieux rare utilisé dans l'automobile et la bijouterie",
        source: "simulation",
      },
      copper: {
        name: "Cuivre",
        symbol: "HG",
        price: (3.85 + hourlyVariation * 0.15).toFixed(3),
        currency: "USD",
        change: (hourlyVariation * 0.15).toFixed(3),
        changePercent: `${hourlyVariation >= 0 ? "+" : ""}${(((hourlyVariation * 0.15) / 3.85) * 100).toFixed(2)}%`,
        isPositive: hourlyVariation >= 0,
        lastUpdate: now.toISOString(),
        unit: "USD/livre",
        description:
          "Métal industriel indicateur de la santé économique mondiale",
        source: "simulation",
      },
      coffee: {
        name: "Café Arabica",
        symbol: "KC",
        price: (155.75 + hourlyVariation * 5).toFixed(2),
        currency: "USD",
        change: (hourlyVariation * 5).toFixed(2),
        changePercent: `${hourlyVariation >= 0 ? "+" : ""}${(((hourlyVariation * 5) / 155.75) * 100).toFixed(2)}%`,
        isPositive: hourlyVariation >= 0,
        lastUpdate: now.toISOString(),
        unit: "cents/livre",
        description:
          "Café de qualité supérieure, important pour l'économie africaine",
        source: "simulation",
      },
      cocoa: {
        name: "Cacao",
        symbol: "CC",
        price: (3250.8 + hourlyVariation * 80).toFixed(2),
        currency: "USD",
        change: (hourlyVariation * 80).toFixed(2),
        changePercent: `${hourlyVariation >= 0 ? "+" : ""}${(((hourlyVariation * 80) / 3250.8) * 100).toFixed(2)}%`,
        isPositive: hourlyVariation >= 0,
        lastUpdate: now.toISOString(),
        unit: "USD/tonne",
        description:
          "Matière première majeure pour la Côte d'Ivoire et le Ghana",
        source: "simulation",
      },
      timestamp: now.toISOString(),
      source: "simulation",
    };
  }
};

// Hook React pour utiliser les données de commodités
export const useCommoditiesData = () => {
  const [data, setData] = React.useState<CommoditiesData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const commoditiesData = await fetchCommoditiesData();
        setData(commoditiesData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Rafraîchir toutes les 10 minutes (les commodités bougent moins vite que les actions)
    const interval = setInterval(loadData, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};

// Utilitaires pour les commodités
export const getCommodityColor = (commodity: Commodity): string => {
  if (commodity.isPositive) {
    return "text-green-600";
  } else {
    return "text-red-600";
  }
};

export const getCommodityIcon = (symbol: string): string => {
  const icons: { [key: string]: string } = {
    "XAU/USD": "🥇",
    CT: "🤍",
    BZ: "🛢️",
    CL: "⛽",
    "XAG/USD": "🥈",
    "XPT/USD": "💍",
    HG: "🔩",
    KC: "☕",
    CC: "🍫",
  };
  return icons[symbol] || "📊";
};

export const formatCommodityPrice = (commodity: Commodity): string => {
  return `${commodity.price} ${commodity.currency}/${commodity.unit}`;
};

export default {
  fetchCommoditiesData,
  useCommoditiesData,
  getCommodityColor,
  getCommodityIcon,
  formatCommodityPrice,
};
