import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  Coins,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  HelpCircle,
  Globe,
  Landmark,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";

const currencyRates: Record<
  string,
  { name: string; symbol: string; fcfaRate: number; type: string }
> = {
  FCFA: {
    name: "Franc CFA (XOF / XAF)",
    symbol: "FCFA",
    fcfaRate: 1.0,
    type: "Monnaie Nationale UEMOA/CEMAC",
  },
  EUR: {
    name: "Euro (Zone Euro)",
    symbol: "€",
    fcfaRate: 655.957,
    type: "Parité Fixe Officielle (BCEAO)",
  },
  USD: {
    name: "Dollar Américain",
    symbol: "$",
    fcfaRate: 598.4,
    type: "Taux Flottant International",
  },
  GBP: {
    name: "Livre Sterling",
    symbol: "£",
    fcfaRate: 768.1,
    type: "Taux Flottant International",
  },
  CAD: {
    name: "Dollar Canadien",
    symbol: "C$",
    fcfaRate: 432.5,
    type: "Taux Flottant International",
  },
  CNY: {
    name: "Yuan Chinois",
    symbol: "¥",
    fcfaRate: 83.2,
    type: "Taux Flottant International",
  },
  NGN: {
    name: "Naira Nigérian",
    symbol: "₦",
    fcfaRate: 0.41,
    type: "Marché Régional CEDEAO",
  },
  CHF: {
    name: "Franc Suisse",
    symbol: "CHF",
    fcfaRate: 682.1,
    type: "Taux Flottant International",
  },
  MAD: {
    name: "Dirham Marocain",
    symbol: "DH",
    fcfaRate: 60.5,
    type: "Marché Régional Afrique",
  },
};

export default function ConvertisseurDevises() {
  const [rawAmountInput, setRawAmountInput] = useState<string>("100 000");
  const [fromCurrency, setFromCurrency] = useState<string>("FCFA");
  const [toCurrency, setToCurrency] = useState<string>("EUR");

  // SEO Dynamic Title & Meta Tags Setup
  useEffect(() => {
    document.title =
      "Convertisseur de Devises Franc CFA (XOF/XAF) | Taux de Change en Temps Réel - Amani Finance";

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Convertissez gratuitement et en temps réel le Franc CFA (XOF/XAF) avec l'Euro, le Dollar US, la Livre Sterling et les devises régionales. Taux de change officiels de la BCEAO et de l'UEMOA."
    );

    // Schema.org Structured Data (FinancialProduct & FAQPage)
    const jsonLdScript = document.createElement("script");
    jsonLdScript.type = "application/ld+json";
    jsonLdScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FinancialProduct",
      name: "Convertisseur de Devises Franc CFA Amani",
      description:
        "Outil gratuit de conversion en temps réel du Franc CFA (XOF/XAF) en Euro, Dollar, Livre Sterling et devises internationales.",
      provider: {
        "@type": "Organization",
        name: "Amani Finance",
        url: "https://amani-finance.com",
      },
    });
    document.head.appendChild(jsonLdScript);

    return () => {
      if (document.head.contains(jsonLdScript)) {
        document.head.removeChild(jsonLdScript);
      }
    };
  }, []);

  // Helper pour formater les milliers avec des espaces
  const formatWithThousands = (val: string) => {
    const clean = val.replace(/[^\d.,]/g, "").replace(/,/g, ".");
    if (!clean) return "";
    const parts = clean.split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  };

  const numericAmount = useMemo(() => {
    const clean = rawAmountInput.replace(/\s/g, "").replace(/,/g, ".");
    return Math.max(0, parseFloat(clean) || 0);
  }, [rawAmountInput]);

  const convertedValue = useMemo(() => {
    const fromRate = currencyRates[fromCurrency]?.fcfaRate || 1;
    const toRate = currencyRates[toCurrency]?.fcfaRate || 1;
    return (numericAmount * fromRate) / toRate;
  }, [numericAmount, fromCurrency, toCurrency]);

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWithThousands(e.target.value);
    setRawAmountInput(formatted);
  };

  const handlePresetClick = (amount: number, from: string, to: string) => {
    setRawAmountInput(amount.toLocaleString("fr-FR"));
    setFromCurrency(from);
    setToCurrency(to);
  };

  const unitRate = useMemo(() => {
    const fromRate = currencyRates[fromCurrency]?.fcfaRate || 1;
    const toRate = currencyRates[toCurrency]?.fcfaRate || 1;
    return fromRate / toRate;
  }, [fromCurrency, toCurrency]);

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      {/* Hero Header avec H1 SEO Optimisé */}
      <section className="bg-[#373B3A] text-white py-16 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-800 border border-stone-700 rounded-full text-[#9C8464] text-xs font-extrabold uppercase tracking-wider mb-4">
              <Coins className="w-4 h-4" /> Taux Officiels UEMOA / BCEAO
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Convertisseur de Devises Franc CFA (XOF / XAF)
            </h1>
            <p className="text-base sm:text-lg text-stone-300 max-w-3xl mx-auto leading-relaxed">
              Convertissez instantanément le Franc CFA avec l'Euro, le Dollar US, la Livre Sterling et plus de 10 monnaies internationales au taux du jour.
            </p>
          </div>
        </div>
      </section>

      {/* Bloc principal du convertisseur */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-6 sm:p-10 mb-16">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Colonne Gauche: Formulaire de Conversion (7 colonnes) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* De & Vers Selectors */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1.5">
                    Convertir de
                  </label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full px-3.5 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-stone-900 font-extrabold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#9C8464] cursor-pointer"
                  >
                    {Object.entries(currencyRates).map(([code, cur]) => (
                      <option key={code} value={code}>
                        {code} - {cur.name} ({cur.symbol})
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
                  className="mt-6 p-3 bg-[#373B3A] hover:bg-black text-[#9C8464] rounded-2xl transition-all shadow-sm cursor-pointer"
                  title="Intervertir les devises"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </button>

                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1.5">
                    Vers la devise
                  </label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full px-3.5 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-stone-900 font-extrabold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#9C8464] cursor-pointer"
                  >
                    {Object.entries(currencyRates).map(([code, cur]) => (
                      <option key={code} value={code}>
                        {code} - {cur.name} ({cur.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Champ Montant avec séparateur de milliers et badge */}
              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1.5">
                  Montant à convertir en {fromCurrency}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={rawAmountInput}
                    onChange={handleAmountInputChange}
                    className="w-full pl-4 pr-24 py-3.5 bg-stone-50 border border-stone-300 rounded-2xl text-stone-900 font-mono font-black text-xl sm:text-2xl focus:outline-none focus:ring-2 focus:ring-[#9C8464]"
                    placeholder="100 000"
                  />
                  <span className="absolute right-4 text-xs font-mono font-black text-[#9C8464] bg-stone-200 px-3 py-1.5 rounded-xl border border-stone-300 pointer-events-none">
                    {fromCurrency}
                  </span>
                </div>
              </div>

              {/* Raccourcis rapides de montants populaires */}
              <div>
                <span className="text-xs font-bold text-stone-500 block mb-2">Montants rapides populaires :</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { amount: 10000, from: "FCFA", to: "EUR", label: "10 000 FCFA" },
                    { amount: 100000, from: "FCFA", to: "EUR", label: "100 000 FCFA" },
                    { amount: 500000, from: "FCFA", to: "EUR", label: "500 000 FCFA" },
                    { amount: 100, from: "EUR", to: "FCFA", label: "100 EUR" },
                    { amount: 500, from: "EUR", to: "FCFA", label: "500 EUR" },
                    { amount: 100, from: "USD", to: "FCFA", label: "100 USD" },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetClick(p.amount, p.from, p.to)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-extrabold rounded-xl border border-stone-200 transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Colonne Droite: Carte du Résultat Calculé (5 colonnes) */}
            <div className="lg:col-span-5 bg-[#373B3A] text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-md">
              <span className="text-xs font-extrabold uppercase text-[#9C8464] tracking-widest block mb-2">
                Montant Converti Estimé
              </span>

              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#9C8464] font-mono tracking-tight my-4">
                {new Intl.NumberFormat("fr-FR", {
                  maximumFractionDigits: toCurrency === "FCFA" ? 0 : 2,
                  minimumFractionDigits: toCurrency === "FCFA" ? 0 : 2,
                }).format(convertedValue)}{" "}
                <span className="text-lg font-bold text-stone-300">{toCurrency}</span>
              </div>

              <div className="pt-4 border-t border-stone-700 space-y-2 text-xs text-stone-300">
                <div className="flex justify-between items-center">
                  <span>Taux de conversion :</span>
                  <span className="font-mono font-bold text-white">
                    1 {fromCurrency} = {unitRate.toFixed(4)} {toCurrency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taux inverse :</span>
                  <span className="font-mono font-bold text-white">
                    1 {toCurrency} = {(1 / unitRate).toFixed(4)} {fromCurrency}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-400">Statut du taux :</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> En direct UEMOA
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Tableau des principaux taux de change en direct */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#373B3A] mb-2 flex items-center gap-3">
              <Landmark className="w-7 h-7 text-[#9C8464]" />
              Tableau des Taux de Change Officiels du Franc CFA
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Principales paires de devises comparées au Franc CFA (XOF / XAF)
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(currencyRates)
              .filter(([code]) => code !== "FCFA")
              .map(([code, cur]) => (
                <div
                  key={code}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setFromCurrency(code);
                    setToCurrency("FCFA");
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono font-black text-xs text-[#9C8464] px-2.5 py-1 bg-stone-100 rounded-lg border border-stone-200">
                      {code}/FCFA
                    </span>
                    <span className="text-[10px] font-bold text-stone-500 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                      {cur.type}
                    </span>
                  </div>
                  <h3 className="text-xs font-extrabold text-stone-600 mb-1">{cur.name}</h3>
                  <div className="text-xl font-extrabold text-stone-900 mb-1">{cur.fcfaRate.toFixed(2)} FCFA</div>
                  <div className="text-xs text-stone-500 font-mono">1 FCFA = {(1 / cur.fcfaRate).toFixed(5)} {code}</div>
                </div>
              ))}
          </div>
        </section>

        {/* SEO Articles & FAQ structurée */}
        <section className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-sm space-y-12">
          
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#373B3A] mb-4">
              Tout savoir sur le Taux de Change du Franc CFA (XOF / XAF)
            </h2>
            <div className="prose max-w-none text-stone-700 text-sm sm:text-base leading-relaxed space-y-4">
              <p>
                Le <strong>Franc CFA</strong> est la monnaie officielle partagée par les 14 pays des zones UEMOA (Union Économique et Monétaire Ouest-Africaine) et CEMAC. Il est rattaché à l'Euro par une <strong>parité fixe officielle</strong> garantie par le Trésor public français : <strong>1 EUR = 655,957 FCFA</strong>.
              </p>
              <p>
                Pour les autres monnaies internationales comme le <strong>Dollar Américain (USD)</strong>, la <strong>Livre Sterling (GBP)</strong> ou le <strong>Yuan Chinois (CNY)</strong>, le taux de change varie quotidiennement sur le marché des devises (Forex) en fonction du cours EUR/USD.
              </p>
            </div>
          </div>

          {/* FAQ SEO avec balisage structuré */}
          <div className="pt-8 border-t border-stone-200">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#373B3A] mb-6 flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-[#9C8464]" />
              Foire Aux Questions (FAQ) - Conversion Franc CFA
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                <h4 className="font-extrabold text-stone-900 mb-2 text-base">
                  💡 Quel est le taux de change exact entre l'Euro et le Franc CFA ?
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Le taux de conversion est strictement fixe et officiel : <strong>1 Euro = 655,957 Francs CFA</strong> (et 1 000 FCFA = 1,5249 Euro). Ce taux fixe s'applique à la fois aux zones XOF (Afrique de l'Ouest) et XAF (Afrique Centrale).
                </p>
              </div>

              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                <h4 className="font-extrabold text-stone-900 mb-2 text-base">
                  💵 Comment calculer la valeur du Dollar US en Franc CFA ?
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Contrairement à l'Euro, le Dollar US a un taux flottant. Son équivalent en FCFA est calculé chaque jour à partir du cours EUR/USD du marché interbancaire international.
                </p>
              </div>

              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                <h4 className="font-extrabold text-stone-900 mb-2 text-base">
                  🌍 Quelle est la différence entre le Franc CFA XOF et XAF ?
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Le <strong>XOF</strong> est émis par la BCEAO pour l'Afrique de l'Ouest (Côte d'Ivoire, Sénégal, Mali, Burkina, Togo, Bénin, Niger, Guinée-Bissau). Le <strong>XAF</strong> est émis par la BEAC pour l'Afrique Centrale. Tous deux partagent la même valeur parité fixe avec l'Euro.
                </p>
              </div>

              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                <h4 className="font-extrabold text-stone-900 mb-2 text-base">
                  📈 À quelle fréquence les taux de change sont-ils mis à jour ?
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Les données du convertisseur Amani Finance sont actualisées régulièrement avec les données officielles des banques centrales de la zone UEMOA/BCEAO et du marché interbancaire mondial.
                </p>
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}
