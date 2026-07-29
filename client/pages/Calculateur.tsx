import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowRight,
  Info,
  PieChart,
  Sparkles,
  ShieldAlert,
  Coins,
  Check,
} from "lucide-react";

export default function Calculateur() {
  const [capital, setCapital] = useState<number>(1000000); // Capital initial en FCFA
  const [versementMensuel, setVersementMensuel] = useState<number>(50000); // Versement mensuel
  const [tauxAnnuel, setTauxAnnuel] = useState<number>(8.5); // Taux en %
  const [duree, setDuree] = useState<number>(5); // Durée en années
  const [typeCalcul, setTypeCalcul] = useState<"compose" | "simple">("compose");

  // Calculs financiers
  const resultats = useMemo(() => {
    const capitalInitial = Math.max(0, capital);
    const taux = Math.max(0, tauxAnnuel) / 100;
    const annees = Math.max(1, duree);
    const vMensuel = Math.max(0, versementMensuel);

    if (typeCalcul === "simple") {
      const versementsCumules = vMensuel * 12 * annees;
      const interetsCapital = capitalInitial * taux * annees;
      const interetsVersements = (versementsCumules * taux * annees) / 2;
      const totalInterets = interetsCapital + interetsVersements;
      const totalVerse = capitalInitial + versementsCumules;
      const capitalFinal = totalVerse + totalInterets;

      return {
        capitalFinal,
        interetsGagnes: totalInterets,
        totalVerse,
        capitalInitial,
        versementsCumules,
      };
    } else {
      // Intérêts composés mensuels
      const tauxMensuel = taux / 12;
      const totalMois = annees * 12;
      const capitalFinalInitial = capitalInitial * Math.pow(1 + tauxMensuel, totalMois);

      let capitalFinalVersements = 0;
      if (vMensuel > 0 && tauxMensuel > 0) {
        capitalFinalVersements =
          (vMensuel * (Math.pow(1 + tauxMensuel, totalMois) - 1)) / tauxMensuel;
      } else if (vMensuel > 0) {
        capitalFinalVersements = vMensuel * totalMois;
      }

      const capitalFinal = capitalFinalInitial + capitalFinalVersements;
      const versementsCumules = vMensuel * totalMois;
      const totalVerse = capitalInitial + versementsCumules;
      const interetsGagnes = Math.max(0, capitalFinal - totalVerse);

      return {
        capitalFinal,
        interetsGagnes,
        totalVerse,
        capitalInitial,
        versementsCumules,
      };
    }
  }, [capital, versementMensuel, tauxAnnuel, duree, typeCalcul]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  // Calcul des pourcentages de répartition pour la barre visuelle
  const total = resultats.capitalFinal || 1;
  const pctInitial = Math.min(100, Math.max(0, (resultats.capitalInitial / total) * 100));
  const pctVersements = Math.min(100, Math.max(0, (resultats.versementsCumules / total) * 100));
  const pctInterets = Math.min(100, Math.max(0, (resultats.interetsGagnes / total) * 100));

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      {/* En-tête de la page */}
      <section className="bg-[#373B3A] text-white border-b border-stone-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Calculator className="w-14 h-14 mx-auto mb-4 text-[#E5DDD2]" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Calculateur d'Investissement & Intérêts Composés
            </h1>
            <p className="text-lg sm:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed">
              Simulez l'évolution de votre épargne en FCFA sur la BRVM et les marchés financiers grâce à la puissance des intérêts composés.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Panneau de saisie (7 colonnes) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-150">
              <div className="flex items-center gap-3">
                <div className="bg-[#F8F6F2] p-3 rounded-xl border border-stone-200">
                  <DollarSign className="w-6 h-6 text-[#9C8464]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#373B3A]">Paramètres de la simulation</h2>
                  <p className="text-xs text-stone-500">Ajustez les curseurs pour voir le capital se multiplier</p>
                </div>
              </div>

              {/* Mode de calcul */}
              <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold">
                <button
                  onClick={() => setTypeCalcul("compose")}
                  className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    typeCalcul === "compose"
                      ? "bg-[#373B3A] text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                  title="Intérêts composés : les intérêts produisent leurs propres intérêts"
                >
                  <span>Composés</span>
                  <Info className="w-3.5 h-3.5 text-[#9C8464]" />

                  {/* Tooltip au survol */}
                  <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#373B3A] text-white text-[11px] font-normal rounded-xl shadow-xl border border-stone-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-all z-50 leading-relaxed text-left">
                    <strong className="block text-[#9C8464] font-bold mb-1">Intérêts Composés :</strong>
                    Les intérêts générés chaque année sont réinvestis et produisent à leur tour de nouveaux intérêts (effet boule de neige exponentiel).
                  </div>
                </button>
                <button
                  onClick={() => setTypeCalcul("simple")}
                  className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    typeCalcul === "simple"
                      ? "bg-[#373B3A] text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                  title="Intérêts simples : calculés uniquement sur le capital de départ"
                >
                  <span>Simples</span>
                  <Info className="w-3.5 h-3.5 text-[#9C8464]" />

                  {/* Tooltip au survol */}
                  <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#373B3A] text-white text-[11px] font-normal rounded-xl shadow-xl border border-stone-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-all z-50 leading-relaxed text-left">
                    <strong className="block text-[#9C8464] font-bold mb-1">Intérêts Simples :</strong>
                    Les intérêts sont calculés uniquement sur le capital initialement investi, sans réinvestissement des gains.
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Capital initial */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-extrabold text-stone-900">Capital initial (FCFA)</label>
                  <span className="font-mono font-black text-sm text-[#9C8464]">{formatCurrency(capital)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20000000"
                  step="100000"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#9C8464]"
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9C8464]"
                  />
                </div>
              </div>

              {/* Versement mensuel */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-extrabold text-stone-900">Versement mensuel (FCFA)</label>
                  <span className="font-mono font-black text-sm text-[#9C8464]">{formatCurrency(versementMensuel)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="10000"
                  value={versementMensuel}
                  onChange={(e) => setVersementMensuel(Number(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#9C8464]"
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={versementMensuel}
                    onChange={(e) => setVersementMensuel(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9C8464]"
                  />
                </div>
              </div>

              {/* Taux d'intérêt annuel */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-extrabold text-stone-900">Rendement annuel estimé (%)</label>
                  <span className="font-mono font-black text-sm text-[#9C8464]">{tauxAnnuel}% / an</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="0.5"
                  value={tauxAnnuel}
                  onChange={(e) => setTauxAnnuel(Number(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#9C8464]"
                />
                
                {/* Raccourcis de taux usuels */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    { label: "3.5% BCEAO", rate: 3.5 },
                    { label: "5.5% Obligations", rate: 5.5 },
                    { label: "8.5% BRVM Moyen", rate: 8.5 },
                    { label: "12% Actions Top", rate: 12 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setTauxAnnuel(preset.rate)}
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        tauxAnnuel === preset.rate
                          ? "bg-[#373B3A] text-white shadow-xs"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Durée en années */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-extrabold text-stone-900">Durée du placement</label>
                  <span className="font-mono font-black text-sm text-[#9C8464]">{duree} {duree > 1 ? "ans" : "an"}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={duree}
                  onChange={(e) => setDuree(Number(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#9C8464]"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {[3, 5, 10, 15, 20].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setDuree(yr)}
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        duree === yr
                          ? "bg-[#373B3A] text-white shadow-xs"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {yr} ans
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Carte des résultats (5 colonnes) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#373B3A] text-white rounded-2xl p-6 sm:p-8 border border-stone-800 shadow-lg">
              <div className="mb-6 pb-4 border-b border-stone-700">
                <h3 className="text-xl font-extrabold">Résultats de la Simulation</h3>
              </div>

              {/* Capital Final Geant */}
              <div className="mb-6">
                <span className="text-xs uppercase font-extrabold text-stone-400 tracking-wider block mb-1">Capital Final Estimé</span>
                <div className="text-3xl sm:text-4xl font-black text-[#9C8464] tracking-tight font-mono">
                  {formatCurrency(resultats.capitalFinal)}
                </div>
                <p className="text-xs text-stone-300 mt-1">
                  Au bout de {duree} {duree > 1 ? "années" : "année"} d'investissement
                </p>
              </div>

              {/* Details du calcul */}
              <div className="space-y-3 pt-4 border-t border-stone-700 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Total versé de votre poche :</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(resultats.totalVerse)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Intérêts générés :</span>
                  <span className="font-mono font-bold text-green-400">+{formatCurrency(resultats.interetsGagnes)}</span>
                </div>
              </div>

              {/* Barre de répartition visuelle */}
              <div className="mt-6 pt-6 border-t border-stone-700">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Structure du capital final</span>
                <div className="h-3 w-full bg-stone-800 rounded-full overflow-hidden flex">
                  <div style={{ width: `${pctInitial}%` }} className="bg-stone-400 h-full" title="Capital Initial" />
                  <div style={{ width: `${pctVersements}%` }} className="bg-amber-600 h-full" title="Versements Mensuels" />
                  <div style={{ width: `${pctInterets}%` }} className="bg-[#9C8464] h-full" title="Intérêts Générés" />
                </div>
                <div className="flex justify-between items-center text-[10px] text-stone-400 font-bold mt-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-stone-400 inline-block" /> Initial ({pctInitial.toFixed(0)}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" /> Epargne ({pctVersements.toFixed(0)}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#9C8464] inline-block" /> Intérêts ({pctInterets.toFixed(0)}%)
                  </span>
                </div>
              </div>

              {/* Rendement global */}
              <div className="mt-6 p-4 bg-stone-800/80 rounded-xl border border-stone-700 text-xs">
                <span className="text-stone-300 block mb-1">Multiplicateur de capital :</span>
                <span className="text-base font-extrabold text-[#9C8464]">
                  x{(resultats.capitalFinal / Math.max(1, resultats.totalVerse)).toFixed(2)} le montant versé initialement !
                </span>
              </div>
            </div>

            {/* Encadré d'information */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h4 className="font-extrabold text-stone-900 text-sm mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#9C8464]" />
                Conseils d'optimisation Amani
              </h4>
              <ul className="space-y-2 text-xs text-stone-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span><strong>La régularité prime :</strong> Ajouter de petites sommes chaque mois a un impact supérieur à un gros versement unique.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span><strong>Rendement de la BRVM :</strong> Le marché financier de l'UEMOA affiche historiquement entre 8% et 12% de rendement moyen avec réinvestissement des dividendes.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section Éducative : Intérêts Simples vs Composés */}
        <section className="mt-16 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#373B3A] mb-3">
              Comprendre le Pouvoir des Intérêts Composés
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              L'effet "Boule de Neige" : Chaque intérêt produit lui-même de nouveaux intérêts l'année suivante.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
              <h3 className="text-lg font-extrabold text-stone-900 mb-3 flex items-center gap-2">
                <Coins className="w-5 h-5 text-stone-600" />
                Intérêts Simples
              </h3>
              <p className="text-stone-600 text-sm mb-4 leading-relaxed">
                Les intérêts sont calculés uniquement sur le capital de départ. Les gains annuels restent constants.
              </p>
              <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs font-mono text-stone-800">
                1 000 000 FCFA à 8% sur 5 ans = 1 000 000 + (1 000 000 × 8% × 5) = <strong>1 400 000 FCFA</strong>
              </div>
            </div>

            <div className="bg-[#373B3A] text-white p-6 rounded-2xl border border-stone-800 shadow-sm">
              <h3 className="text-lg font-extrabold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#9C8464]" />
                Intérêts Composés (Effet Amani)
              </h3>
              <p className="text-stone-300 text-sm mb-4 leading-relaxed">
                Les intérêts sont réinvestis chaque année et génèrent eux-mêmes des bénéfices exponentiels.
              </p>
              <div className="bg-stone-900 p-4 rounded-xl border border-stone-700 text-xs font-mono text-[#9C8464]">
                1 000 000 FCFA à 8% sur 5 ans = 1 000 000 × (1.08)^5 = <strong>1 469 328 FCFA (+69 328 FCFA de bonus !)</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
