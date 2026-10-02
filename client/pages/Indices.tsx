import React from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Info,
  BarChart3,
  Globe,
  DollarSign,
  Zap,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Clock,
  AlertCircle,
  Target,
  Lightbulb,
  Calculator,
  Eye,
  Coins,
  Building2,
  PieChart,
  Landmark,
  Droplet,
  Flame,
  Coffee,
  Leaf,
  Feather,
  Wheat,
  ArrowLeftRight,
  Percent,
  LineChart,
  Truck,
  Store,
  Sparkles,
  Crown,
  Shield,
  Factory,
  X,
  ArrowRight,
} from "lucide-react";
import { fetchBRVMData, BRVMData } from "../services/brvmApi";
import {
  fetchCommoditiesData,
  CommoditiesData,
  getCommodityIcon,
  getCommodityColor,
} from "../services/commoditiesApi";

const defaultCurrencies = [
  { pair: "EUR/FCFA", name: "Euro / Franc CFA", rate: "655.957 FCFA", inverse: "0.00152 EUR", change: "0.00", changePercent: "0.00%", isPositive: true, type: "Parité Fixe UEMOA" },
  { pair: "USD/FCFA", name: "Dollar US / Franc CFA", rate: "598.40 FCFA", inverse: "0.00167 USD", change: "+0.90", changePercent: "+0.15%", isPositive: true, type: "Taux Flottant International" },
  { pair: "GBP/FCFA", name: "Livre Sterling / Franc CFA", rate: "768.10 FCFA", inverse: "0.00130 GBP", change: "-0.60", changePercent: "-0.08%", isPositive: false, type: "Taux Flottant International" },
  { pair: "CAD/FCFA", name: "Dollar Canadien / Franc CFA", rate: "432.50 FCFA", inverse: "0.00231 CAD", change: "+0.20", changePercent: "+0.04%", isPositive: true, type: "Taux Flottant International" },
  { pair: "CNY/FCFA", name: "Yuan Chinois / Franc CFA", rate: "83.20 FCFA", inverse: "0.01202 CNY", change: "+0.02", changePercent: "+0.02%", isPositive: true, type: "Taux Flottant International" },
  { pair: "NGN/FCFA", name: "Naira Nigérian / Franc CFA", rate: "0.41 FCFA", inverse: "2.4390 NGN", change: "-0.001", changePercent: "-0.24%", isPositive: false, type: "Marché Régional CEDEAO" },
  { pair: "CHF/FCFA", name: "Franc Suisse / Franc CFA", rate: "682.10 FCFA", inverse: "0.00146 CHF", change: "+0.70", changePercent: "+0.10%", isPositive: true, type: "Taux Flottant International" },
  { pair: "MAD/FCFA", name: "Dirham Marocain / Franc CFA", rate: "60.50 FCFA", inverse: "0.0165 MAD", change: "+0.03", changePercent: "+0.05%", isPositive: true, type: "Marché Régional Afrique" },
];

const currencyRates: Record<string, { name: string; symbol: string; fcfaRate: number }> = {
  FCFA: { name: "Franc CFA", symbol: "FCFA", fcfaRate: 1.0 },
  EUR: { name: "Euro", symbol: "€", fcfaRate: 655.957 },
  USD: { name: "Dollar US", symbol: "$", fcfaRate: 598.40 },
  GBP: { name: "Livre Sterling", symbol: "£", fcfaRate: 768.10 },
  CAD: { name: "Dollar Canadien", symbol: "C$", fcfaRate: 432.50 },
  CNY: { name: "Yuan Chinois", symbol: "¥", fcfaRate: 83.20 },
  NGN: { name: "Naira Nigérian", symbol: "₦", fcfaRate: 0.41 },
  CHF: { name: "Franc Suisse", symbol: "CHF", fcfaRate: 682.10 },
  MAD: { name: "Dirham Marocain", symbol: "DH", fcfaRate: 60.50 },
};

const INDICES_CACHE_KEY = "amani_indices_cache_v2";

const getCachedIndices = () => {
  try {
    const raw = localStorage.getItem(INDICES_CACHE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Erreur lecture cache indices:", e);
  }
  return null;
};

const stockDetailsDatabase: Record<
  string,
  {
    fullName: string;
    sector: string;
    country: string;
    activity: string;
    dividendYield: string;
    market: string;
  }
> = {
  SNTS: {
    fullName: "Sonatel Sénégal",
    sector: "Télécommunications",
    country: "Sénégal (SN)",
    activity:
      "Opérateur historique de télécommunications au Sénégal et en Afrique de l'Ouest (filiale d'Orange). Leader incontesté de la BRVM en termes de capitalisation boursière et de distribution de dividendes.",
    dividendYield: "8.5% / an",
    market: "BRVM - Premier Compartiment",
  },
  ETIT: {
    fullName: "Ecobank Transnational Inc.",
    sector: "Services Financiers & Banque",
    country: "Togo (TG)",
    activity:
      "Groupe bancaire pan-africain présent dans 35 pays d'Afrique subsaharienne. Siège régional basé à Lomé.",
    dividendYield: "6.2% / an",
    market: "BRVM - Premier Compartiment",
  },
  ORGT: {
    fullName: "Oragroup Togo",
    sector: "Services Financiers & Banque",
    country: "Togo (TG)",
    activity:
      "Holding bancaire opérant sous la marque Orabank dans 12 pays d'Afrique de l'Ouest et Centrale.",
    dividendYield: "5.8% / an",
    market: "BRVM - Premier Compartiment",
  },
  SLBC: {
    fullName: "Solibra Côte d'Ivoire",
    sector: "Industrie & Boissons",
    country: "Côte d'Ivoire (CI)",
    activity:
      "Société de limonaderies et brasseries d'Afrique, filiale majeure du Groupe Castel. Leader du marché ivoirien des boissons et bières.",
    dividendYield: "7.1% / an",
    market: "BRVM - Premier Compartiment",
  },
  TTLC: {
    fullName: "TotalEnergies Côte d'Ivoire",
    sector: "Énergie & Distribution",
    country: "Côte d'Ivoire (CI)",
    activity:
      "Distribution de produits pétroliers, carburants, lubrifiants et réseau de stations-services leaders en Côte d'Ivoire.",
    dividendYield: "9.0% / an",
    market: "BRVM - Premier Compartiment",
  },
  PALC: {
    fullName: "Palm Côte d'Ivoire",
    sector: "Agriculture & Agro-industrie",
    country: "Côte d'Ivoire (CI)",
    activity:
      "Production et transformation d'huile de palme brute. Acteur agro-industriel majeur filiale du groupe SIFCA.",
    dividendYield: "10.2% / an",
    market: "BRVM - Premier Compartiment",
  },
  SGBC: {
    fullName: "Société Générale Côte d'Ivoire (SGCI)",
    sector: "Services Financiers & Banque",
    country: "Côte d'Ivoire (CI)",
    activity:
      "Première banque de Côte d'Ivoire par le total bilan, les dépôts de la clientèle et le réseau d'agences.",
    dividendYield: "7.8% / an",
    market: "BRVM - Premier Compartiment",
  },
  ONTBF: {
    fullName: "Onatel Burkina Faso",
    sector: "Télécommunications",
    country: "Burkina Faso (BF)",
    activity:
      "Opérateur national historique de télécommunications au Burkina Faso, filiale du groupe Maroc Telecom.",
    dividendYield: "9.5% / an",
    market: "BRVM - Premier Compartiment",
  },
  BICI: {
    fullName: "BICICI Côte d'Ivoire",
    sector: "Services Financiers & Banque",
    country: "Côte d'Ivoire (CI)",
    activity:
      "Banque Internationale pour le Commerce et l'Industrie de la Côte d'Ivoire.",
    dividendYield: "6.5% / an",
    market: "BRVM - Premier Compartiment",
  },
  BOAB: {
    fullName: "Bank of Africa Bénin",
    sector: "Services Financiers & Banque",
    country: "Bénin (BJ)",
    activity:
      "Filiale béninoise du groupe BMCE Bank of Africa. Acteur bancaire de référence au Bénin.",
    dividendYield: "8.0% / an",
    market: "BRVM - Premier Compartiment",
  },
  CBIBF: {
    fullName: "Coris Bank International Burkina",
    sector: "Services Financiers & Banque",
    country: "Burkina Faso (BF)",
    activity:
      "Troisième groupe bancaire de la zone UEMOA en termes de total bilan. Acteur majeur du financement du secteur privé et des PME au Burkina Faso.",
    dividendYield: "8.2% / an",
    market: "BRVM - Premier Compartiment",
  },
  SAPH: {
    fullName: "SAPH Côte d'Ivoire",
    sector: "Agriculture & Agro-industrie",
    country: "Côte d'Ivoire (CI)",
    activity:
      "Société Africaine de Plantations d'Hévéas. Premier producteur d'hévéa naturel en Afrique de l'Ouest, filiale du Groupe SIFCA.",
    dividendYield: "9.1% / an",
    market: "BRVM - Premier Compartiment",
  },
  SOGC: {
    fullName: "SOGB Côte d'Ivoire",
    sector: "Agriculture & Agro-industrie",
    country: "Côte d'Ivoire (CI)",
    activity:
      "Société Grand-Béréby d'Hévéas. Production d'huile de palme brute et de caoutchouc naturel de qualité supérieure.",
    dividendYield: "8.7% / an",
    market: "BRVM - Premier Compartiment",
  },
};

const getStockDetails = (stock: any) => {
  if (!stock) {
    return {
      fullName: "Société Cotée BRVM",
      sector: "Bourse BRVM",
      country: "UEMOA",
      activity: "Entreprise cotée sur le marché de la Bourse Régionale des Valeurs Mobilières.",
      dividendYield: "7.5% / an",
      market: "BRVM - Marché Principal",
    };
  }

  const rawSymbol = (stock.symbol || "").toUpperCase().trim();
  const rawName = (stock.name || "").trim();
  const cleanName = rawName || rawSymbol || "Société Cotée BRVM";
  const nameLower = cleanName.toLowerCase();

  // 1. Recherche par symbole direct dans la base
  if (rawSymbol && stockDetailsDatabase[rawSymbol]) {
    return stockDetailsDatabase[rawSymbol];
  }

  // 2. Recherche par correspondance partielle de nom dans la base
  for (const [key, details] of Object.entries(stockDetailsDatabase)) {
    if (
      nameLower.includes(key.toLowerCase()) ||
      nameLower.includes(details.fullName.toLowerCase()) ||
      details.fullName.toLowerCase().includes(nameLower)
    ) {
      return details;
    }
  }

  // 3. Génération dynamique personnalisée si l'entreprise n'est pas encore enregistrée
  let inferredSector = "Services & Industrie";
  let inferredActivity = `La société ${cleanName} est une entreprise majeure cotée sur le marché principal de la Bourse Régionale des Valeurs Mobilières (BRVM), participant activement au dynamisme économique de la région UEMOA.`;
  let inferredCountry = "UEMOA";

  if (
    nameLower.includes("bank") ||
    nameLower.includes("banque") ||
    nameLower.includes("boa") ||
    nameLower.includes("bici") ||
    nameLower.includes("sgb") ||
    nameLower.includes("cbi") ||
    nameLower.includes("ecobank") ||
    nameLower.includes("nsia") ||
    nameLower.includes("coris") ||
    nameLower.includes("oragroup")
  ) {
    inferredSector = "Services Financiers & Banque";
    inferredActivity = `${cleanName} est un établissement bancaire de premier plan opérant dans la zone UEMOA, fournissant des services bancaires d'investissement, de gestion de patrimoine et de financement de projets régionaux.`;
  } else if (
    nameLower.includes("telecom") ||
    nameLower.includes("sonatel") ||
    nameLower.includes("onatel") ||
    nameLower.includes("orange")
  ) {
    inferredSector = "Télécommunications";
    inferredActivity = `${cleanName} est un opérateur majeur de télécommunications et de services numériques en Afrique de l'Ouest, proposant des services de téléphonie mobile, de fibre optique et de Mobile Money.`;
  } else if (
    nameLower.includes("total") ||
    nameLower.includes("pétrol") ||
    nameLower.includes("energie") ||
    nameLower.includes("oil") ||
    nameLower.includes("shell") ||
    nameLower.includes("vivo")
  ) {
    inferredSector = "Énergie & Distribution";
    inferredActivity = `${cleanName} est spécialisée dans la distribution de produits pétroliers, carburants et lubrifiants à travers son réseau de stations-services à haute couverture.`;
  } else if (
    nameLower.includes("cacao") ||
    nameLower.includes("palme") ||
    nameLower.includes("palm") ||
    nameLower.includes("sucr") ||
    nameLower.includes("sitos") ||
    nameLower.includes("saph") ||
    nameLower.includes("sogb") ||
    nameLower.includes("agri")
  ) {
    inferredSector = "Agriculture & Agro-industrie";
    inferredActivity = `${cleanName} est un acteur agro-industriel de référence produisant et transformant des commodités agricoles essentielles (caoutchouc, huile de palme, sucre) pour l'exportation et le marché sous-régional.`;
  } else if (
    nameLower.includes("brasser") ||
    nameLower.includes("boisson") ||
    nameLower.includes("solibra") ||
    nameLower.includes("unilever") ||
    nameLower.includes("nestle") ||
    nameLower.includes("filtisac")
  ) {
    inferredSector = "Industrie & Consommation";
    inferredActivity = `${cleanName} est une entreprise industrielle produisant et commercialisant des produits de grande consommation et des boissons pour les ménages de la zone UEMOA.`;
  }

  if (nameLower.includes("ci") || nameLower.includes("ivoire") || nameLower.includes("côte"))
    inferredCountry = "Côte d'Ivoire (CI)";
  else if (nameLower.includes("sn") || nameLower.includes("sénégal"))
    inferredCountry = "Sénégal (SN)";
  else if (nameLower.includes("bf") || nameLower.includes("burkina"))
    inferredCountry = "Burkina Faso (BF)";
  else if (nameLower.includes("tg") || nameLower.includes("togo"))
    inferredCountry = "Togo (TG)";
  else if (nameLower.includes("bj") || nameLower.includes("bénin"))
    inferredCountry = "Bénin (BJ)";
  else if (nameLower.includes("ml") || nameLower.includes("mali"))
    inferredCountry = "Mali (ML)";
  else if (nameLower.includes("ne") || nameLower.includes("niger"))
    inferredCountry = "Niger (NE)";

  return {
    fullName: cleanName,
    sector: inferredSector,
    country: inferredCountry,
    activity: inferredActivity,
    dividendYield: "7.2% / an",
    market: "BRVM - Marché Principal",
  };
};

export default function Indices() {
  const initialCache = getCachedIndices();

  const [brvmData, setBrvmData] = React.useState<BRVMData | null>(
    () => initialCache?.brvm || null
  );
  const [commoditiesData, setCommoditiesData] = React.useState<CommoditiesData | null>(
    () => initialCache?.commodities || null
  );
  // Si le cache existe, la page charge en 0ms sans spinner (loading = false)
  const [loading, setLoading] = React.useState(!initialCache?.brvm);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(
    () => (initialCache?.timestamp ? new Date(initialCache.timestamp) : null)
  );
  const [selectedCategory, setSelectedCategory] = React.useState<
    "all" | "indices" | "stocks" | "currencies" | "commodities"
  >("all");

  // Modal d'informations société cotée
  const [selectedStockForModal, setSelectedStockForModal] = React.useState<any | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = React.useState<boolean>(false);

  const handleStockClick = (stock: any) => {
    setSelectedStockForModal(stock);
    setIsStockModalOpen(true);
  };

  // État du convertisseur de devises
  const [rawAmountInput, setRawAmountInput] = React.useState<string>("100 000");
  const [fromCurrency, setFromCurrency] = React.useState<string>("FCFA");
  const [toCurrency, setToCurrency] = React.useState<string>("EUR");

  // Helper pour formater les milliers avec des espaces
  const formatWithThousands = (val: string) => {
    const clean = val.replace(/[^\d.,]/g, "").replace(/,/g, ".");
    if (!clean) return "";
    const parts = clean.split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  };

  const numericAmount = React.useMemo(() => {
    const clean = rawAmountInput.replace(/\s/g, "").replace(/,/g, ".");
    return Math.max(0, parseFloat(clean) || 0);
  }, [rawAmountInput]);

  const convertedValue = React.useMemo(() => {
    const fromRate = currencyRates[fromCurrency]?.fcfaRate || 1;
    const toRate = currencyRates[toCurrency]?.fcfaRate || 1;
    return (numericAmount * fromRate) / toRate;
  }, [numericAmount, fromCurrency, toCurrency]);

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWithThousands(e.target.value);
    setRawAmountInput(formatted);
  };

  const currenciesList = (brvmData?.currencies && brvmData.currencies.length > 0)
    ? brvmData.currencies
    : defaultCurrencies;

  // Charger et synchroniser les données (Stale-While-Revalidate)
  const loadAllData = async (isBackground = false) => {
    try {
      if (!isBackground && !brvmData) {
        setLoading(true);
      }
      setIsSyncing(true);

      const [brvm, commodities] = await Promise.all([
        fetchBRVMData(),
        fetchCommoditiesData(),
      ]);

      if (brvm) setBrvmData(brvm);
      if (commodities) setCommoditiesData(commodities);

      const now = new Date();
      setLastUpdate(now);

      // Sauvegarde dans le localStorage pour chargements ultérieurs instantanés (0ms)
      try {
        localStorage.setItem(
          INDICES_CACHE_KEY,
          JSON.stringify({
            brvm,
            commodities,
            timestamp: now.toISOString(),
          })
        );
      } catch (e) {
        console.warn("Erreur écriture cache indices:", e);
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation des données:", error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  React.useEffect(() => {
    // 1. Revalidation immédiate en arrière-plan sans bloquer l'affichage
    loadAllData(true);

    // 2. Mise à jour automatique en arrière-plan toutes les 60 secondes
    const interval = setInterval(() => loadAllData(true), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fermeture de la modal avec la touche Échap
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsStockModalOpen(false);
      }
    };
    if (isStockModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStockModalOpen]);

  // Composant d'explication pour débutants aux couleurs de la section Devises
  const ExplanationCard = ({
    title,
    children,
    icon: Icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon: any;
  }) => (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 shrink-0">
          <Icon className="w-6 h-6 text-[#9C8464]" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-[#373B3A] mb-2">{title}</h3>
          <div className="text-stone-600 text-sm leading-relaxed space-y-2">{children}</div>
        </div>
      </div>
    </div>
  );

  const formatValueWithThousands = (val: string | number) => {
    if (!val && val !== 0) return "";
    const str = String(val);
    return str.replace(/\b\d+(\.\d+)?\b/g, (match) => {
      const parts = match.split(".");
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
    });
  };

  const MarketItem = ({
    name,
    value,
    change,
    changePercent,
    isPositive,
    description,
    unit,
    icon,
    source,
    tag,
    onClick,
  }: {
    name: string;
    value: string;
    change: string;
    changePercent: string;
    isPositive: boolean;
    description: string;
    unit?: string;
    icon?: string;
    source?: string;
    tag?: string;
    onClick?: () => void;
  }) => {
    const badgeTag = tag || (source ? source : "MARCHÉ");
    const formattedValue = formatValueWithThousands(value);
    const formattedChange = formatValueWithThousands(change);

    return (
      <div
        onClick={onClick}
        className={`bg-white rounded-xl p-5 border border-stone-200 shadow-sm transition-all flex flex-col justify-between ${
          onClick
            ? "cursor-pointer hover:border-[#9C8464] hover:shadow-lg hover:-translate-y-0.5 group"
            : "hover:shadow-md"
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono font-black text-xs text-[#9C8464] px-2.5 py-1 bg-stone-100 rounded-md border border-stone-200">
              {badgeTag}
            </span>
            {unit && (
              <span className="text-[10px] font-bold text-stone-500 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                {unit}
              </span>
            )}
          </div>

          <h4 className="text-xs font-bold text-stone-600 mb-1 truncate" title={name}>
            {name}
          </h4>
          <div className="text-xl font-extrabold text-stone-900 mb-1 font-mono tracking-tight">{formattedValue}</div>
          <div className="text-xs text-stone-500 font-mono mb-3 line-clamp-1">{description}</div>
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
              isPositive
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <span>{formattedChange}</span>
            {changePercent && <span>({changePercent})</span>}
          </div>

          {onClick && (
            <span className="text-[10px] font-extrabold text-[#9C8464] group-hover:underline flex items-center gap-0.5">
              Fiche <ChevronRight className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    );
  };

  const handleCategoryClick = (
    id: "all" | "indices" | "stocks" | "currencies" | "commodities"
  ) => {
    setSelectedCategory(id);
    setTimeout(() => {
      const targetId =
        id === "indices"
          ? "section-indices"
          : id === "stocks"
          ? "section-stocks"
          : id === "currencies"
          ? "section-currencies"
          : id === "commodities"
          ? "section-commodities"
          : "section-indices";
      const el = document.getElementById(targetId);
      if (el) {
        const yOffset = -140; // Offset for sticky navbar (80px) + sticky filter bar (60px)
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      {/* En-tête de la page */}
      <section className="bg-[#373B3A] text-white border-b border-stone-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center gap-3">
              <BarChart3 className="w-10 h-10 md:w-12 md:h-12 text-[#E5DDD2] shrink-0" />
              <span>Indices & Commodités</span>
            </h1>
            <p className="text-xl text-stone-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Suivez les marchés financiers, indices boursiers et prix des
              matières premières. Guide complet pour comprendre l'économie
              africaine et mondiale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => loadAllData(false)}
                disabled={isSyncing}
                className="flex items-center gap-2 bg-[#9C8464] hover:bg-[#867052] text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`}
                />
                <span>{isSyncing ? "Mise à jour..." : "Actualiser les données"}</span>
              </button>

              {lastUpdate && (
                <div className="flex items-center gap-2 text-stone-300 text-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Clock className="w-4 h-4 text-[#9C8464]" />
                  <span>Dernière mise à jour: {lastUpdate.toLocaleTimeString("fr-FR")}</span>
                  <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded border border-stone-700 font-mono">
                    Cache 0ms
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filtres de catégories - Minimaliste et Sticky sous la navigation */}
      <section className="sticky top-16 lg:top-20 z-30 py-2.5 bg-[#FDFBF9]/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2">
            {[
              { id: "all", label: "Tout voir", icon: Eye },
              { id: "indices", label: "Indices BRVM", icon: BarChart3 },
              { id: "stocks", label: "Actions Cotées", icon: Building2 },
              { id: "currencies", label: "Devises & Change", icon: Coins },
              { id: "commodities", label: "Matières Premières", icon: Globe },
            ].map(({ id, label, icon: Icon }) => {
              const isActive = selectedCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => handleCategoryClick(id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-[#373B3A] text-white shadow-xs"
                      : "bg-white hover:bg-stone-100 text-stone-700 border border-stone-200"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#9C8464]" : "text-stone-500"}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Indices BRVM & Indices Sectoriels */}
      {(selectedCategory === "all" || selectedCategory === "indices") && (
        <section id="section-indices" className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#373B3A] mb-2 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-[#9C8464]" />
                <span>Indices Boursiers BRVM</span>
              </h2>
              <p className="text-stone-600 text-sm sm:text-base">
                Performance en temps réel de la Bourse Régionale des Valeurs Mobilières (UEMOA).
              </p>
            </div>

            {brvmData && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                <MarketItem
                  name={brvmData.composite.name}
                  value={brvmData.composite.value}
                  change={brvmData.composite.change}
                  changePercent={brvmData.composite.changePercent}
                  isPositive={brvmData.composite.isPositive}
                  description="Indice principal de la BRVM, reflète la performance globale de l'ensemble des titres"
                  source="BRVM"
                  tag="INDICE"
                />

                <MarketItem
                  name={brvmData.brvm30?.name || "BRVM 30"}
                  value={brvmData.brvm30?.value || "109.85"}
                  change={brvmData.brvm30?.change || "+0.85"}
                  changePercent={brvmData.brvm30?.changePercent || "+0.78%"}
                  isPositive={brvmData.brvm30?.isPositive ?? true}
                  description="Indice composé des 30 valeurs les plus liquides et échangées de la BRVM"
                  source="BRVM"
                  tag="INDICE"
                />

                <MarketItem
                  name={brvmData.brvmPrestige?.name || "BRVM Prestige"}
                  value={brvmData.brvmPrestige?.value || "104.12"}
                  change={brvmData.brvmPrestige?.change || "+0.42"}
                  changePercent={brvmData.brvmPrestige?.changePercent || "+0.40%"}
                  isPositive={brvmData.brvmPrestige?.isPositive ?? true}
                  description="Indice regroupant les valeurs de référence répondant aux critères de gouvernance de la BRVM"
                  source="BRVM"
                  tag="INDICE"
                />

                <MarketItem
                  name={brvmData.taux_bceao.name}
                  value={brvmData.taux_bceao.value}
                  change={brvmData.taux_bceao.change}
                  changePercent={brvmData.taux_bceao.changePercent}
                  isPositive={brvmData.taux_bceao.isPositive}
                  description="Taux directeur de la Banque Centrale de l'Afrique de l'Ouest (BCEAO)"
                  source="BCEAO"
                  tag="TAUX"
                />
              </div>
            )}

            {/* Indices sectoriels (Positionné juste en dessous des Indices Boursiers) */}
            {brvmData?.sectoriels && brvmData.sectoriels.length > 0 && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#373B3A] mb-2 flex items-center gap-3">
                    <PieChart className="w-7 h-7 text-[#9C8464] shrink-0" />
                    <span>Indices Sectoriels BRVM</span>
                  </h3>
                  <p className="text-stone-600 text-sm">
                    Performances par secteur d'activité (Finance, Industrie, Services, Agriculture, Distribution...)
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {brvmData.sectoriels.map((index, i) => (
                    <MarketItem
                      key={i}
                      name={index.name}
                      value={index.value}
                      change={index.change}
                      changePercent={index.changePercent}
                      isPositive={index.isPositive}
                      description={`Performance du secteur ${index.name.toLowerCase()} sur la BRVM`}
                      source="BRVM"
                      tag="SECTEUR"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Actions BRVM (Sociétés & Actions Cotées BRVM) */}
      {(selectedCategory === "all" || selectedCategory === "stocks") &&
        brvmData?.topStocks && brvmData.topStocks.length > 0 && (
          <section id="section-stocks" className="py-12 bg-white border-t border-stone-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#373B3A] mb-2 flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-[#9C8464] shrink-0" />
                  <span>Sociétés & Actions Cotées (BRVM)</span>
                </h2>
                <p className="text-stone-600 text-sm sm:text-base">
                  Cours et cotations en temps réel des principales sociétés cotées sur la Bourse Régionale. Cliquez sur n'importe quelle société pour afficher sa fiche d'informations.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {brvmData.topStocks.map((stock, i) => (
                  <MarketItem
                    key={stock.symbol || i}
                    name={stock.name || stock.symbol}
                    value={`${stock.price} FCFA`}
                    change={stock.change}
                    changePercent={stock.changePercent}
                    isPositive={stock.isPositive}
                    description={`Cours officiel de ${stock.name || stock.symbol} à la BRVM`}
                    source="BRVM"
                    tag={stock.symbol}
                    onClick={() => handleStockClick(stock)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

      {/* Principales Devises & Change */}
      {(selectedCategory === "all" || selectedCategory === "currencies") && (
        <section id="section-currencies" className="py-12 bg-[#F8F6F2] border-t border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#373B3A] mb-2 flex items-center gap-3">
                <Coins className="w-8 h-8 text-[#9C8464]" />
                Principales Devises & Convertisseur Express
              </h2>
              <p className="text-stone-600 text-sm sm:text-base">
                Taux de change officiels en temps réel du Franc CFA (XOF/XAF) et outil de conversion instantané.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Cartes des devises (8 colonnes sur la GAUCHE) */}
              <div className="lg:col-span-8 order-2 lg:order-1">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currenciesList.map((curr, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-black text-xs text-[#9C8464] px-2 py-0.5 bg-stone-100 rounded-md border border-stone-200">
                          {curr.pair}
                        </span>
                        <span className="text-[9px] font-bold text-stone-500 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200">
                          {curr.type}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-600 mb-1">{curr.name}</h4>
                      <div className="text-lg font-extrabold text-stone-900 mb-1">{curr.rate}</div>
                      <div className="text-[11px] text-stone-500 font-mono mb-2">1 FCFA = {curr.inverse}</div>
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                          curr.isPositive
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {curr.isPositive ? <TrendingUp className="w-3 h-3 text-green-600" /> : <TrendingDown className="w-3 h-3 text-red-600" />}
                        <span>{curr.changePercent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Convertisseur Intelligent (4 colonnes sur la DROITE) */}
              <div className="lg:col-span-4 order-1 lg:order-2 bg-[#373B3A] text-white rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-md">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-stone-700">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-[#9C8464]" />
                    <h3 className="font-extrabold text-base">Convertisseur FCFA</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C8464] bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                    Taux Directs
                  </span>
                </div>

                <div className="space-y-4">
                  {/* De / Vers avec bouton Intervertir */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">Convertir de</label>
                      <select
                        value={fromCurrency}
                        onChange={(e) => setFromCurrency(e.target.value)}
                        className="w-full px-2.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#9C8464] cursor-pointer"
                      >
                        {Object.entries(currencyRates).map(([code, cur]) => (
                          <option key={code} value={code}>
                            {code} ({cur.symbol})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        const temp = fromCurrency;
                        setFromCurrency(toCurrency);
                        setToCurrency(temp);
                      }}
                      className="mt-5 p-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl text-[#9C8464] transition-all cursor-pointer shadow-xs"
                      title="Intervertir les devises"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">Vers</label>
                      <select
                        value={toCurrency}
                        onChange={(e) => setToCurrency(e.target.value)}
                        className="w-full px-2.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#9C8464] cursor-pointer"
                      >
                        {Object.entries(currencyRates).map(([code, cur]) => (
                          <option key={code} value={code}>
                            {code} ({cur.symbol})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Montant à convertir */}
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Montant en {fromCurrency}</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={rawAmountInput}
                        onChange={handleAmountInputChange}
                        className="w-full pl-3.5 pr-20 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#9C8464]"
                        placeholder="100 000"
                      />
                      <span className="absolute right-3 text-xs font-mono font-black text-[#9C8464] bg-stone-800 px-2 py-1 rounded border border-stone-700 pointer-events-none">
                        {fromCurrency}
                      </span>
                    </div>
                  </div>

                  {/* Résultat final */}
                  <div className="mt-4 p-4 bg-stone-900/90 rounded-xl border border-stone-700">
                    <span className="text-[10px] font-extrabold uppercase text-stone-400 block mb-1">Résultat en {toCurrency}</span>
                    <div className="text-2xl font-black text-[#9C8464] font-mono tracking-tight">
                      {new Intl.NumberFormat("fr-FR", {
                        maximumFractionDigits: toCurrency === "FCFA" ? 0 : 2,
                        minimumFractionDigits: toCurrency === "FCFA" ? 0 : 2,
                      }).format(convertedValue)}{" "}
                      <span className="text-sm font-bold text-stone-300">{toCurrency}</span>
                    </div>
                    <span className="text-[11px] text-stone-400 block mt-1">
                      1 {fromCurrency} = {(currencyRates[fromCurrency].fcfaRate / currencyRates[toCurrency].fcfaRate).toFixed(4)} {toCurrency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Matières premières */}
      {(selectedCategory === "all" || selectedCategory === "commodities") &&
        commoditiesData && (
          <section id="section-commodities" className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-amani-primary mb-4 flex items-center gap-3">
                  <Globe className="w-8 h-8" />
                  Matières Premières
                </h2>
                <p className="text-gray-600 text-lg">
                  Prix en temps réel des commodités clés pour l'économie africaine et internationale.
                </p>
              </div>

              {/* Affichage dynamique de toutes les matières premières disponibles */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Object.entries(commoditiesData)
                  .filter(([key, val]) => val && typeof val === "object" && (val as any).name && (val as any).price)
                  .map(([key, item]: [string, any]) => (
                    <MarketItem
                      key={key}
                      name={item.name}
                      value={item.unit?.toLowerCase()?.includes("cents") ? `${item.price}¢` : `$${item.price}`}
                      change={item.change}
                      changePercent={item.changePercent}
                      isPositive={item.isPositive}
                      description={item.description || `Cours international de ${item.name}`}
                      unit={item.unit}
                      icon={getCommodityIcon(item.symbol)}
                    />
                  ))}
              </div>
            </div>
          </section>
        )}

      {/* Section d'explication pour débutants */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-amani-primary mb-4">
              Comprendre les marchés financiers
            </h2>
            <p className="text-xl text-gray-600">
              Guide pour débutants - Tout ce que vous devez savoir
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <ExplanationCard
              title="Qu'est-ce qu'un indice boursier ?"
              icon={BarChart3}
            >
              <p>
                Un <strong>indice boursier</strong> est comme un thermomètre qui
                mesure la santé du marché des actions. Il calcule la moyenne des
                prix de plusieurs entreprises cotées en bourse.
              </p>
              <p>
                <strong>BRVM Composite</strong> : Indice principal de la Bourse
                Régionale des Valeurs Mobilières, qui regroupe les 8 pays de
                l'UEMOA (Bénin, Burkina Faso, Côte d'Ivoire, Guinée-Bissau,
                Mali, Niger, Sénégal, Togo).
              </p>
            </ExplanationCard>

            <ExplanationCard
              title="Pourquoi suivre les commodités ?"
              icon={Globe}
            >
              <p>
                Les <strong>matières premières</strong> (or, pétrole, coton,
                cacao) sont essentielles pour l'économie africaine. Leurs prix
                influencent directement :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Les revenus des pays exportateurs</li>
                <li>Le coût de la vie (inflation)</li>
                <li>Les investissements dans l'agriculture et l'industrie</li>
                <li>La valeur de la monnaie (FCFA)</li>
              </ul>
            </ExplanationCard>

            <ExplanationCard
              title="Comment lire les variations ?"
              icon={TrendingUp}
            >
              <p>
                <strong className="text-green-600">Vert (+)</strong> : Le prix
                monte, c'est généralement bon signe pour l'économie du pays
                exportateur.
              </p>
              <p>
                <strong className="text-red-600">Rouge (-)</strong> : Le prix
                baisse, cela peut signaler des difficultés économiques.
              </p>
              <p>
                <strong>Pourcentage</strong> : Indique l'ampleur du changement.
                +2% sur l'or = hausse significative.
              </p>
            </ExplanationCard>

            <ExplanationCard title="Impact sur votre quotidien" icon={Target}>
              <p>Ces prix vous affectent directement :</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <strong>Pétrole ↑</strong> = Essence plus chère, transport
                  plus coûteux
                </li>
                <li>
                  <strong>Cacao ↑</strong> = Plus de revenus pour les
                  producteurs ivoiriens
                </li>
                <li>
                  <strong>Or ↑</strong> = Opportunités d'investissement,
                  inflation possible
                </li>
                <li>
                  <strong>Coton ↓</strong> = Difficultés pour les agriculteurs
                  du Mali
                </li>
              </ul>
            </ExplanationCard>
          </div>
        </div>
      </section>

      {/* Section d'apprentissage */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Apprendre l'investissement
            </h2>
            <p className="text-xl text-gray-600">
              Ressources pour comprendre et investir intelligemment
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Guide du débutant
              </h3>
              <p className="text-gray-600 mb-6">
                Apprenez les bases de l'investissement en bourse et sur les
                matières premières
              </p>
              <Link
                to="/guides/debutant"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800"
              >
                Commencer à apprendre
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <Calculator className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Calculateur d'investissement
              </h3>
              <p className="text-gray-600 mb-6">
                Simulez vos investissements et calculez les rendements
                potentiels
              </p>
              <Link
                to="/calculateur"
                className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-800"
              >
                Utiliser le calculateur
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <Lightbulb className="w-12 h-12 text-yellow-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Analyses d'experts
              </h3>
              <p className="text-gray-600 mb-6">
                Consultez les analyses et recommandations de nos experts
                économistes
              </p>
              <Link
                to="/insights"
                className="inline-flex items-center gap-2 text-yellow-600 font-semibold hover:text-yellow-800"
              >
                Voir les analyses
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Avertissement */}
      <section className="py-8 bg-yellow-50 border-t border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">
                Avertissement sur les risques
              </h4>
              <p className="text-yellow-700 text-sm">
                Les investissements en bourse et matières premières comportent
                des risques. Les performances passées ne garantissent pas les
                résultats futurs. Consultez un conseiller financier avant
                d'investir.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Modal d'informations détaillées sur la Société Cotée (BRVM) */}
      {isStockModalOpen && selectedStockForModal && (() => {
        const meta = getStockDetails(selectedStockForModal);
        const symbol = (selectedStockForModal.symbol || meta.fullName.slice(0, 4)).toUpperCase();

        return (
          <div
            onClick={() => setIsStockModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] cursor-default"
            >
              {/* Entête Anthracite Amani */}
              <div className="bg-[#373B3A] text-white p-6 sm:p-7 relative border-b border-stone-800">
                <button
                  onClick={() => setIsStockModalOpen(false)}
                  className="absolute top-5 right-5 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                  title="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-mono font-black text-xs text-[#9C8464] px-2.5 py-1 bg-stone-800 rounded-md border border-stone-700">
                    {symbol}
                  </span>
                  <span className="text-xs font-bold text-stone-300 bg-stone-800 px-2.5 py-1 rounded-md border border-stone-700">
                    {meta.sector}
                  </span>
                  <span className="text-xs font-bold text-stone-300 bg-stone-800 px-2 py-1 rounded-md border border-stone-700">
                    {meta.country}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                  {meta.fullName}
                </h3>

                <div className="flex items-baseline gap-3 mt-4 pt-4 border-t border-stone-800">
                  <div className="text-3xl font-black font-mono text-[#9C8464]">
                    {formatValueWithThousands(selectedStockForModal.price)} <span className="text-sm font-bold text-stone-300">FCFA</span>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                      selectedStockForModal.isPositive
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-rose-950 text-rose-400 border border-rose-800"
                    }`}
                  >
                    {selectedStockForModal.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{selectedStockForModal.change} ({selectedStockForModal.changePercent})</span>
                  </div>
                </div>
              </div>

              {/* Corps de la Modal */}
              <div className="p-6 sm:p-7 space-y-6 overflow-y-auto">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-2">Profil & Activité Principale</h4>
                  <p className="text-stone-700 text-sm leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200">
                    {meta.activity}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-3">Indicateurs Boursiers & Marché</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[11px] font-bold text-stone-500 block mb-1">Bourse</span>
                      <span className="text-xs font-extrabold text-stone-900">{meta.market}</span>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[11px] font-bold text-stone-500 block mb-1">Rendement Dividende</span>
                      <span className="text-xs font-extrabold text-[#9C8464] font-mono">{meta.dividendYield}</span>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[11px] font-bold text-stone-500 block mb-1">Statut Cotation</span>
                      <span className="text-xs font-extrabold text-emerald-700">Cotation Active BRVM</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <Link
                    to="/marche"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#373B3A] hover:bg-black text-white text-xs font-extrabold rounded-xl transition-all shadow-sm"
                  >
                    <span>Voir le marché BRVM en direct</span>
                    <ArrowRight className="w-4 h-4 text-[#9C8464]" />
                  </Link>
                  <button
                    onClick={() => setIsStockModalOpen(false)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-extrabold rounded-xl border border-stone-200 transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
