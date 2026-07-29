import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Globe,
  Target,
  Lightbulb,
  ArrowRight,
  Shield,
  Calculator,
  Building,
  ChevronRight,
  Coins,
} from "lucide-react";

export default function GuideDebutant() {
  const [currentSection, setCurrentSection] = React.useState(0);

  const sections = [
    {
      id: "introduction",
      title: "Introduction à l'investissement",
      shortLabel: "Introduction",
      icon: BookOpen,
    },
    {
      id: "basics",
      title: "Les bases à connaître",
      shortLabel: "Bases",
      icon: Lightbulb,
    },
    {
      id: "brvm",
      title: "Comprendre la BRVM",
      shortLabel: "BRVM",
      icon: BarChart3,
    },
    {
      id: "commodities",
      title: "Les matières premières",
      shortLabel: "Matières",
      icon: Globe,
    },
    {
      id: "strategies",
      title: "Stratégies d'investissement",
      shortLabel: "Stratégies",
      icon: Target,
    },
    {
      id: "risks",
      title: "Gérer les risques",
      shortLabel: "Risques",
      icon: Shield,
    },
    {
      id: "start",
      title: "Comment commencer",
      shortLabel: "Démarrer",
      icon: CheckCircle,
    },
  ];

  const goToSection = (index: number) => {
    setCurrentSection(index);
    setTimeout(() => {
      const targetElement = document.getElementById("guide-content-start");
      if (targetElement) {
        const yOffset = -250; // 80px main navbar + 130px sticky step bar + 40px margin
        const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      } else {
        window.scrollTo({ top: 320, behavior: "smooth" });
      }
    }, 50);
  };

  const ProgressBar = () => (
    <div className="w-full bg-stone-200 rounded-full h-2.5 mb-8 overflow-hidden">
      <div
        className="bg-[#9C8464] h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
      ></div>
    </div>
  );

  const SectionCard = ({
    title,
    children,
    icon: Icon,
    tip,
  }: {
    title: string;
    children: React.ReactNode;
    icon: any;
    tip?: string;
  }) => (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 mb-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-150">
        <div className="bg-[#F8F6F2] p-3 rounded-xl border border-stone-200">
          <Icon className="w-6 h-6 text-[#9C8464]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#373B3A]">{title}</h2>
      </div>
      {children}
      {tip && (
        <div className="mt-6 p-4 bg-[#F8F6F2] border-l-4 border-[#9C8464] rounded-r-xl">
          <p className="text-stone-800 text-sm font-medium">
            <strong className="text-[#9C8464]">💡 Conseil Amani :</strong> {tip}
          </p>
        </div>
      )}
    </div>
  );

  const ExampleBox = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 my-5">
      <h4 className="font-extrabold text-stone-900 mb-2 text-sm uppercase tracking-wider">{title}</h4>
      <div className="text-stone-700 text-sm leading-relaxed">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      {/* En-tête de la page */}
      <section className="bg-[#373B3A] text-white border-b border-stone-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <BookOpen className="w-14 h-14 mx-auto mb-6 text-[#E5DDD2]" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Guide de l'Investissement pour Débutants
            </h1>
            <p className="text-lg sm:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed">
              Apprenez les bases de l'investissement en Afrique de l'Ouest. De
              la BRVM aux matières premières et devises, tout ce qu'il faut savoir pour
              débuter sereinement.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky Progress & Step Navigation Bar */}
      <section className="sticky top-16 lg:top-20 z-30 py-3.5 bg-[#FDFBF9]/95 backdrop-blur-md border-b border-stone-200 shadow-xs mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <span>Étape {currentSection + 1} sur {sections.length}</span>
            <span>{Math.round(((currentSection + 1) / sections.length) * 100)}% complété</span>
          </div>
          <ProgressBar />

          {/* Navigation des 7 étapes */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = currentSection === index;
              const isCompleted = currentSection > index;

              return (
                <button
                  key={section.id}
                  onClick={() => goToSection(index)}
                  className={`p-2.5 rounded-xl text-center transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#373B3A] text-white shadow-md font-bold scale-102"
                      : isCompleted
                        ? "bg-stone-200 text-stone-900 font-semibold"
                        : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${isActive ? "text-[#9C8464]" : ""}`} />
                  <span className="text-[11px] block truncate">
                    {section.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div id="guide-content-start" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        {/* Section 1: Introduction */}
        {currentSection === 0 && (
          <SectionCard
            title="Pourquoi investir ?"
            icon={BookOpen}
            tip="L'investissement est le moyen le plus efficace d'assurer la croissance de votre patrimoine sur le long terme."
          >
            <div className="space-y-6">
              <p className="text-stone-700 text-base sm:text-lg leading-relaxed">
                Investir, c'est utiliser votre argent pour acquérir des actifs
                qui peuvent prendre de la valeur avec le temps. Au lieu de
                laisser votre épargne s'éroder face à l'inflation sur un compte ordinaire, vous la
                faites travailler activement pour vous.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                  <h3 className="text-base font-extrabold text-[#373B3A] mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Avantages de l'investissement
                  </h3>
                  <ul className="space-y-2 text-stone-700 text-sm">
                    <li>• Croissance de votre patrimoine personnel</li>
                    <li>• Protection directe contre l'inflation</li>
                    <li>• Perception de revenus passifs (dividendes)</li>
                    <li>• Préparation sereine de la retraite</li>
                    <li>• Financement de grands projets de vie</li>
                  </ul>
                </div>

                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                  <h3 className="text-base font-extrabold text-[#373B3A] mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Risques à considérer
                  </h3>
                  <ul className="space-y-2 text-stone-700 text-sm">
                    <li>• Variabilité de la valeur selon le marché</li>
                    <li>• Absence de rendement fixe garanti</li>
                    <li>• Nécessité de garder une vision long terme</li>
                    <li>• Rigueur et discipline de gestion</li>
                    <li>• Importance de se former en continu</li>
                  </ul>
                </div>
              </div>

              <ExampleBox title="Exemple concret">
                <p>
                  Si vous placez <strong>500 000 FCFA</strong> sur un compte à 2% par an, vous obtiendrez environ 551 000 FCFA après 5 ans.
                  Mais en investissant la même somme en actions avec un rendement moyen de 8% par an, votre capital pourrait atteindre <strong>735 000 FCFA</strong> !
                </p>
              </ExampleBox>
            </div>
          </SectionCard>
        )}

        {/* Section 2: Les bases */}
        {currentSection === 1 && (
          <SectionCard
            title="Vocabulaire et concepts de base"
            icon={Lightbulb}
            tip="Maîtriser les termes clés permet de lire les rapports financiers avec confiance."
          >
            <div className="space-y-6">
              <p className="text-stone-700 text-base sm:text-lg">
                Avant de passer vos premiers ordres, voici les notions financières essentielles.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-[#373B3A]">
                    📊 Instruments financiers
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="p-4 border-l-4 border-[#373B3A] bg-stone-50 rounded-r-xl">
                      <h4 className="font-extrabold text-stone-900">Action</h4>
                      <p className="text-stone-600 mt-1">
                        Part de propriété d'une entreprise. Son prix évolue selon les résultats de la société.
                      </p>
                    </div>

                    <div className="p-4 border-l-4 border-[#9C8464] bg-stone-50 rounded-r-xl">
                      <h4 className="font-extrabold text-stone-900">Obligation</h4>
                      <p className="text-stone-600 mt-1">
                        Titre de créance émis par un État ou une entreprise qui vous verse un intérêt régulier.
                      </p>
                    </div>

                    <div className="p-4 border-l-4 border-stone-400 bg-stone-50 rounded-r-xl">
                      <h4 className="font-extrabold text-stone-900">Indice Boursier</h4>
                      <p className="text-stone-600 mt-1">
                        Indicateur synthétique mesurant la tendance globale d'un groupe d'actions (ex: BRVM Composite).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-[#373B3A]">
                    💰 Notions clés
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="p-4 border-l-4 border-stone-800 bg-stone-50 rounded-r-xl">
                      <h4 className="font-extrabold text-stone-900">Dividende</h4>
                      <p className="text-stone-600 mt-1">
                        Partie des bénéfices distribuée chaque année aux actionnaires.
                      </p>
                    </div>

                    <div className="p-4 border-l-4 border-stone-600 bg-stone-50 rounded-r-xl">
                      <h4 className="font-extrabold text-stone-900">Volatilité</h4>
                      <p className="text-stone-600 mt-1">
                        Amplitude des fluctuations de prix d'un titre sur une période donnée.
                      </p>
                    </div>

                    <div className="p-4 border-l-4 border-[#9C8464] bg-stone-50 rounded-r-xl">
                      <h4 className="font-extrabold text-stone-900">Diversification</h4>
                      <p className="text-stone-600 mt-1">
                        Répartition du capital entre plusieurs secteurs pour optimiser le couple rendement/risque.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <ExampleBox title="Règle d'or Amani">
                <p>
                  <strong>Ne mettez jamais tous vos œufs dans le même panier.</strong> Répartir vos placements entre plusieurs sociétés et plusieurs secteurs protège votre portefeuille global.
                </p>
              </ExampleBox>
            </div>
          </SectionCard>
        )}

        {/* Section 3: BRVM */}
        {currentSection === 2 && (
          <SectionCard
            title="La Bourse Régionale des Valeurs Mobilières (BRVM)"
            icon={BarChart3}
            tip="La BRVM est l'une des rares bourses régionales au monde à regrouper 8 pays sous la même monnaie."
          >
            <div className="space-y-6">
              <p className="text-stone-700 text-base sm:text-lg">
                La BRVM est la bourse commune aux 8 pays membres de l'UEMOA. Basée à Abidjan, elle réunit 46+ sociétés cotées.
              </p>

              <div className="bg-stone-100 p-6 rounded-2xl border border-stone-200">
                <h3 className="text-base font-extrabold text-[#373B3A] mb-4">
                  🌍 Les 8 Pays de l'UEMOA
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    "Bénin",
                    "Burkina Faso",
                    "Côte d'Ivoire",
                    "Guinée-Bissau",
                    "Mali",
                    "Niger",
                    "Sénégal",
                    "Togo",
                  ].map((pays) => (
                    <div
                      key={pays}
                      className="bg-white p-3 rounded-xl text-center font-bold text-stone-800 border border-stone-200 text-sm shadow-xs"
                    >
                      {pays}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-extrabold text-[#373B3A] mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-[#9C8464]" />
                    Grandes Entreprises Cotées
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-3 bg-white border border-stone-200 rounded-xl">
                      <span className="font-extrabold text-stone-900">Sonatel (SNTS)</span>
                      <span className="text-[#9C8464] font-medium">Télécoms</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white border border-stone-200 rounded-xl">
                      <span className="font-extrabold text-stone-900">Ecobank (ETIT)</span>
                      <span className="text-[#9C8464] font-medium">Banque</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white border border-stone-200 rounded-xl">
                      <span className="font-extrabold text-stone-900">Société Générale CI (SGBC)</span>
                      <span className="text-[#9C8464] font-medium">Banque</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white border border-stone-200 rounded-xl">
                      <span className="font-extrabold text-stone-900">TotalEnergies CI (TTLC)</span>
                      <span className="text-[#9C8464] font-medium">Énergie</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[#373B3A] mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#9C8464]" />
                    Fonctionnement du Marché
                  </h3>
                  <div className="space-y-3 text-sm text-stone-700">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#373B3A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        1
                      </div>
                      <p>Les sociétés ouvrent leur capital via des actions cotées.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-[#373B3A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        2
                      </div>
                      <p>Les ordres d'achat et de vente sont exécutés via les SGI agréées.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-[#373B3A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        3
                      </div>
                      <p>Le cours varie selon la confrontation entre l'offre et la demande.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-[#373B3A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        4
                      </div>
                      <p>L'indice BRVM Composite retrace la tendance globale du marché.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Section 4: Matières premières & Devises */}
        {currentSection === 3 && (
          <SectionCard
            title="Matières Premières & Devises"
            icon={Globe}
            tip="Les matières premières africaines et le taux de change du Franc CFA déterminent l'environnement macro-économique."
          >
            <div className="space-y-6">
              <p className="text-stone-700 text-base sm:text-lg">
                L'Afrique de l'Ouest est un moteur mondial du cacao, de l'or et du coton.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                  <h3 className="text-base font-extrabold text-[#373B3A] mb-4 flex items-center gap-2">
                    🥇 Métaux & Agricole
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-extrabold text-stone-900">Cacao & Café</h4>
                      <p className="text-stone-600">
                        La Côte d'Ivoire est le 1er producteur mondial de cacao. Leurs cours influencent les exportations.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-stone-900">Or & Minerais</h4>
                      <p className="text-stone-600">
                        Le Mali, le Burkina Faso et la Côte d'Ivoire sont de grands producteurs d'or.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                  <h3 className="text-base font-extrabold text-[#373B3A] mb-4 flex items-center gap-2">
                    💱 Franc CFA (XOF) & Devises
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-extrabold text-stone-900">EUR / FCFA</h4>
                      <p className="text-stone-600">
                        Parité fixe officielle : <strong>1 EUR = 655.957 FCFA</strong>.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-stone-900">USD / FCFA & Devises</h4>
                      <p className="text-stone-600">
                        Taux flottant selon les marchés mondiaux du Dollar et du Naira.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Section 5: Stratégies */}
        {currentSection === 4 && (
          <SectionCard
            title="Stratégies d'investissement"
            icon={Target}
            tip="Définissez votre stratégie avant d'investir le premier franc."
          >
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                  <h3 className="text-base font-extrabold text-[#373B3A] mb-3">
                    📈 Investissement de Croissance
                  </h3>
                  <p className="text-stone-700 text-sm leading-relaxed">
                    Vise les entreprises à forte expansion dont le cours de l'action devrait augmenter significativement dans les 3 à 5 ans.
                  </p>
                </div>

                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                  <h3 className="text-base font-extrabold text-[#373B3A] mb-3">
                    💵 Investissement de Rendement
                  </h3>
                  <p className="text-stone-700 text-sm leading-relaxed">
                    Privilégie les sociétés matures et solides qui versent un dividende régulier et élevé (banques, télécoms, énergie).
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Section 6: Risques */}
        {currentSection === 5 && (
          <SectionCard
            title="Gérer les risques"
            icon={Shield}
            tip="Conservez toujours un fonds de sécurité avant de placer en bourse."
          >
            <div className="space-y-6">
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <h3 className="text-base font-extrabold text-[#373B3A] mb-3">
                  🛡️ Les 3 Règles de Protection
                </h3>
                <ul className="space-y-3 text-stone-700 text-sm">
                  <li><strong>1. Épargne de précaution :</strong> Gardez 3 à 6 mois de dépenses courantes liquides sur un compte d'épargne.</li>
                  <li><strong>2. Horizon long terme :</strong> N'investissez en bourse que de l'argent dont vous n'avez pas besoin à court terme.</li>
                  <li><strong>3. Gestion des émotions :</strong> Ne paniquez pas lors des baisses temporaires du marché.</li>
                </ul>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Section 7: Comment commencer */}
        {currentSection === 6 && (
          <SectionCard
            title="Comment commencer concrètement"
            icon={CheckCircle}
            tip="Ouvrir un compte titres auprès d'une SGI agréée UEMOA ne prend que quelques minutes."
          >
            <div className="space-y-6">
              <div className="space-y-4 text-sm text-stone-700">
                <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-start gap-4">
                  <div className="bg-[#373B3A] text-white p-2.5 rounded-xl font-black text-sm">1</div>
                  <div>
                    <h4 className="font-extrabold text-stone-900">Choisissez une SGI agréée</h4>
                    <p className="text-stone-600">Société de Gestion et d'Intermédiation autorisée par le CREPMF / AMF-UMOA.</p>
                  </div>
                </div>

                <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-start gap-4">
                  <div className="bg-[#373B3A] text-white p-2.5 rounded-xl font-black text-sm">2</div>
                  <div>
                    <h4 className="font-extrabold text-stone-900">Ouvrez votre compte titres</h4>
                    <p className="text-stone-600">Fournissez une pièce d'identité et un justificatif de domicile.</p>
                  </div>
                </div>

                <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-start gap-4">
                  <div className="bg-[#373B3A] text-white p-2.5 rounded-xl font-black text-sm">3</div>
                  <div>
                    <h4 className="font-extrabold text-stone-900">Passez vos premiers ordres</h4>
                    <p className="text-stone-600">Utilisez l'application Amani Finance pour suivre les cours et passer à l'action.</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Navigation Précédent / Suivant */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-stone-200">
          <button
            onClick={() => goToSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className="flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm cursor-pointer"
          >
            ← Précédent
          </button>

          <span className="text-stone-500 font-bold text-sm">
            {currentSection + 1} / {sections.length}
          </span>

          <button
            onClick={() =>
              goToSection(
                Math.min(sections.length - 1, currentSection + 1),
              )
            }
            disabled={currentSection === sections.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-[#373B3A] text-white rounded-xl hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm cursor-pointer"
          >
            Suivant <ArrowRight className="w-4 h-4 text-[#9C8464]" />
          </button>
        </div>

        {/* Félicitations fin de guide */}
        {currentSection === sections.length - 1 && (
          <div className="text-center mt-10 p-8 sm:p-10 bg-[#373B3A] text-white rounded-2xl border border-stone-800 shadow-md">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-[#9C8464]" />
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Félicitations !
            </h3>
            <p className="text-stone-300 mb-8 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Vous possédez maintenant les connaissances fondamentales pour commencer à investir de manière éclairée.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/calculateur"
                className="inline-flex items-center gap-2 bg-[#9C8464] hover:bg-[#867052] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm text-sm"
              >
                <Calculator className="w-4 h-4" />
                Calculateur d'Investissement
              </Link>
              <Link
                to="/indices"
                className="inline-flex items-center gap-2 bg-white text-stone-900 hover:bg-stone-100 px-6 py-3 rounded-xl font-bold transition-all shadow-sm text-sm"
              >
                <BarChart3 className="w-4 h-4 text-[#9C8464]" />
                Voir les Indices BRVM
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
