import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Map } from "lucide-react";
import { SEOHead } from "../components/SEOHead";

export default function PlanDuSite() {
  const categories = [
    {
      title: "RUBRIQUES ÉDITORIALES & ANALYSES",
      badge: "ACTUALITÉS",
      links: [
        { name: "Page d'Accueil (Accueil Amani)", path: "/", desc: "Vue globale des actualités, cours de la BRVM et derniers décryptages." },
        { name: "Fil d'Actualités & Analyses Économiques", path: "/actualites", desc: "Toutes les actualités financières et économiques de la zone UEMOA." },
        { name: "Économie & Politique Monétaire", path: "/economie", desc: "Décisions des banques centrales, inflation, taux et politiques publiques." },
        { name: "Industrie & Agro-business", path: "/industrie", desc: "Secteur minier, transformations industrielles et matières premières." },
        { name: "Investissement & Opportunités", path: "/investissement", desc: "Capital-risque, projets structurants et opportunités régionales." },
        { name: "Technologie & Innovation Financial", path: "/tech", desc: "Fintech, transformation digitale et écosystème start-up." },
        { name: "Insights & Rapports d'Analystes", path: "/insights", desc: "Dossiers approfondis et notes de recherche exclusives." },
        { name: "Podcasts & Interviews Exécutives", path: "/podcast", desc: "Émissions audio et grands entretiens avec les leaders économiques." },
      ],
    },
    {
      title: "MARCHÉS FINANCIERS & BRVM",
      badge: "BOURSE",
      links: [
        { name: "Aperçu du Marché BRVM", path: "/marche", desc: "Tableau de bord complet des cours, plus fortes hausses et baisses." },
        { name: "Indices Boursiers (Composite, BRVM 30, Prestige)", path: "/indices", desc: "Évolution quotidienne des indices de référence et indices sectoriels." },
        { name: "Sociétés Cotées à la BRVM", path: "/indices#section-stocks", desc: "Fiches détaillées des 46+ entreprises cotées sur le marché régional." },
        { name: "Newsletter BRVM & Fil d'Actualités Bourse", path: "/brvm-latest", desc: "Dernières dépêches et annonces officielles des émetteurs." },
      ],
    },
    {
      title: "OUTILS FINANCIERS & FORMATION",
      badge: "OUTILS",
      links: [
        { name: "Convertisseur de Devises (FCFA / EUR / USD / GBP)", path: "/convertisseur-devises", desc: "Calculateur de taux de change fixe et flottant avec historique." },
        { name: "Calculateur d'Investissement & Intérêts Composés", path: "/calculateur", desc: "Simulateur de rendement d'épargne et d'investissement boursier." },
        { name: "Guide du Débutant en Bourse BRVM", path: "/guide-debutant", desc: "Guide pas à pas pour investir intelligemment en bourse en Afrique de l'Ouest." },
        { name: "Souscription Newsletter Quotidienne", path: "/newsletter", desc: "Recevez les résumés boursiers gratuits chaque matin par e-mail." },
      ],
    },
    {
      title: "ABONNEMENTS & COMPTE UTILISATEUR",
      badge: "COMPTE",
      links: [
        { name: "Offres d'Abonnement & Tarifs Premium", path: "/pricing", desc: "Formules d'accès aux analyses avancées et données financières." },
        { name: "Connexion à l'Espace Membre", path: "/login", desc: "Accédez à votre compte et à vos préférences de lecture." },
        { name: "Inscription / Créer un Compte", path: "/register", desc: "Rejoignez la communauté des lecteurs et investisseurs Amani." },
        { name: "Mot de Passe Oublié", path: "/forgot-password", desc: "Réinitialisation sécurisée de votre accès." },
      ],
    },
    {
      title: "INFORMATIONS INSTITUTIONNELLES & LÉGALES",
      badge: "LÉGAL",
      links: [
        { name: "À Propos d'Amani Media", path: "/about", desc: "Notre mission, nos valeurs et l'équipe de rédaction." },
        { name: "Contact & Support Client", path: "/contact", desc: "Formulaire de contact, presse, partenariats et adresses." },
        { name: "Conditions Générales d'Utilisation (CGU)", path: "/terms", desc: "Conditions de service et règles d'utilisation de la plateforme." },
        { name: "Politique de Confidentialité", path: "/confidentialite", desc: "Engagement sur la protection de vos données personnelles." },
        { name: "Mentions Légales", path: "/mentions-legales", desc: "Informations juridiques et éditeur du site Amani Finance." },
        { name: "Politique relative aux Cookies", path: "/cookies", desc: "Gestion des cookies et préférences de navigation." },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      <SEOHead
        title="Plan du Site (Sitemap) | Amani Finance"
        description="Index complet et plan d'accès direct à l'ensemble des rubriques, outils financiers, indices BRVM et pages d'actualités d'Amani."
        keywords="sitemap amani finance, plan du site, indexation rubriques, cours BRVM, actualités économiques"
      />
      {/* En-tête Hero Anthracite & Or */}
      <section className="bg-[#373B3A] text-white py-16 sm:py-20 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-stone-800 border border-stone-700 mb-6">
              <span className="font-mono text-xs font-black text-[#9C8464] uppercase tracking-wider">
                NAVIGATION & INDEXATION
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Plan du Site (Sitemap)
            </h1>
            <p className="text-stone-300 text-base sm:text-lg leading-relaxed font-medium">
              Accédez directement à l'ensemble des rubriques, outils financiers, analyses de marché, calculateurs et pages réglementaires de la plateforme Amani.
            </p>
          </div>
        </div>
      </section>

      {/* Grille des Sections du Plan du Site */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="space-y-12">
          {categories.map((section, sIdx) => (
            <div key={sIdx} className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-stone-100">
                <h2 className="font-mono text-sm sm:text-base font-black text-[#373B3A] tracking-wider uppercase">
                  {section.title}
                </h2>
                <span className="text-[10px] font-mono font-black text-[#9C8464] bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                  {section.badge}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.links.map((link, lIdx) => (
                  <Link
                    key={lIdx}
                    to={link.path}
                    className="group p-5 rounded-2xl bg-[#FDFBF9] hover:bg-white border border-stone-200/70 hover:border-[#9C8464] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-sm font-extrabold text-[#373B3A] group-hover:text-[#9C8464] transition-colors mb-2 leading-snug">
                        {link.name}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium leading-relaxed">
                        {link.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-[#9C8464]">
                      <span className="font-mono text-stone-400">{link.path}</span>
                      <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Visiter</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
