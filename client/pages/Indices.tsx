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
} from "lucide-react";
import { fetchBRVMData, BRVMData } from "../services/brvmApi";
import {
  fetchCommoditiesData,
  CommoditiesData,
  getCommodityIcon,
  getCommodityColor,
} from "../services/commoditiesApi";

export default function Indices() {
  const [brvmData, setBrvmData] = React.useState<BRVMData | null>(null);
  const [commoditiesData, setCommoditiesData] =
    React.useState<CommoditiesData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<
    "all" | "indices" | "commodities"
  >("all");

  // Charger toutes les données
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [brvm, commodities] = await Promise.all([
        fetchBRVMData(),
        fetchCommoditiesData(),
      ]);
      setBrvmData(brvm);
      setCommoditiesData(commodities);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadAllData();
    // Rafraîchir automatiquement toutes les 5 minutes
    const interval = setInterval(loadAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Composant d'explication pour débutants
  const ExplanationCard = ({
    title,
    children,
    icon: Icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon: any;
  }) => (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
      <div className="flex items-start">
        <Icon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">{title}</h3>
          <div className="text-blue-700 space-y-2">{children}</div>
        </div>
      </div>
    </div>
  );

  // Composant pour afficher un indice/commodité
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
  }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            <h3 className="text-xl font-bold text-gray-900">{name}</h3>
            {unit && <p className="text-sm text-gray-500">({unit})</p>}
          </div>
        </div>
        {source && !source.toLowerCase().includes("sikafinance") && !source.toLowerCase().includes("marché") && (
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
            {source}
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <div
          className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{change}</span>
          <span>({changePercent})</span>
        </div>
      </div>

      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );

  const handleCategoryClick = (id: "all" | "indices" | "commodities") => {
    setSelectedCategory(id);
    setTimeout(() => {
      const targetId =
        id === "indices"
          ? "section-indices"
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
    <div className="min-h-screen bg-gray-50">
      {/* En-tête de la page */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Indices & Commodités
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Suivez les marchés financiers, indices boursiers et prix des
              matières premières. Guide complet pour comprendre l'économie
              africaine et mondiale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={loadAllData}
                disabled={loading}
                className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
                Actualiser les données
              </button>

              {lastUpdate && (
                <p className="text-gray-300 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Dernière mise à jour: {lastUpdate.toLocaleTimeString("fr-FR")}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filtres de catégories - Sticky sous la navigation (top-16 / lg:top-20) */}
      <section className="sticky top-16 lg:top-20 z-30 py-4 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { id: "all", label: "Tout voir", icon: Eye },
              { id: "indices", label: "Indices Boursiers", icon: BarChart3 },
              { id: "commodities", label: "Matières Premières", icon: Globe },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleCategoryClick(id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                  selectedCategory === id
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Indices BRVM */}
      {(selectedCategory === "all" || selectedCategory === "indices") && (
        <section id="section-indices" className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-amani-primary mb-4 flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                Indices Boursiers BRVM
              </h2>
              <p className="text-gray-600 text-lg">
                Performance en temps réel de la Bourse Régionale des Valeurs
                Mobilières
              </p>
            </div>

            {brvmData && (
              <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <MarketItem
                  name={brvmData.composite.name}
                  value={brvmData.composite.value}
                  change={brvmData.composite.change}
                  changePercent={brvmData.composite.changePercent}
                  isPositive={brvmData.composite.isPositive}
                  description="Indice principal de la BRVM, reflète la performance globale du marché ouest-africain"
                  icon="📊"
                  source={brvmData.composite.source}
                />

                <MarketItem
                  name={brvmData.fcfa_eur.name}
                  value={brvmData.fcfa_eur.value}
                  change={brvmData.fcfa_eur.change}
                  changePercent={brvmData.fcfa_eur.changePercent}
                  isPositive={brvmData.fcfa_eur.isPositive}
                  description="Taux de change fixe entre le Franc CFA et l'Euro, ancré à la politique monétaire française"
                  icon="💱"
                  source="BCE"
                />

                <MarketItem
                  name={brvmData.inflation.name}
                  value={brvmData.inflation.value}
                  change={brvmData.inflation.change}
                  changePercent={brvmData.inflation.changePercent}
                  isPositive={brvmData.inflation.isPositive}
                  description="Taux d'inflation dans la zone UEMOA, indicateur clé du coût de la vie"
                  icon="📈"
                  source="BCEAO"
                />

                <MarketItem
                  name={brvmData.taux_bceao.name}
                  value={brvmData.taux_bceao.value}
                  change={brvmData.taux_bceao.change}
                  changePercent={brvmData.taux_bceao.changePercent}
                  isPositive={brvmData.taux_bceao.isPositive}
                  description="Taux directeur de la Banque Centrale, influence les taux d'intérêt dans la zone UEMOA"
                  icon="🏛️"
                  source="BCEAO"
                />
              </div>
            )}

            {/* Actions BRVM */}
            {brvmData?.topStocks && brvmData.topStocks.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>🏢</span>
                  Sociétés & Actions Cotées (BRVM)
                </h3>
                <div className="grid lg:grid-cols-3 gap-6">
                  {brvmData.topStocks.map((stock, i) => (
                    <MarketItem
                      key={stock.symbol || i}
                      name={stock.name || stock.symbol}
                      value={`${stock.price || stock.value} FCFA`}
                      change={stock.change}
                      changePercent={stock.changePercent}
                      isPositive={stock.isPositive}
                      description={`Cours officiel de ${stock.name || stock.symbol} à la BRVM`}
                      icon="📈"
                      source="BRVM"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Indices sectoriels */}
            {brvmData?.sectoriels && brvmData.sectoriels.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>📊</span>
                  Indices Sectoriels BRVM
                </h3>
                <div className="grid lg:grid-cols-3 gap-6">
                  {brvmData.sectoriels.map((index, i) => (
                    <MarketItem
                      key={i}
                      name={index.name}
                      value={index.value}
                      change={index.change}
                      changePercent={index.changePercent}
                      isPositive={index.isPositive}
                      description={`Performance du secteur ${index.name.toLowerCase()} sur la BRVM`}
                      icon="🏢"
                      source="BRVM"
                    />
                  ))}
                </div>
              </div>
            )}
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
              <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
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
    </div>
  );
}
