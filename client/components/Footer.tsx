import React from "react";
import { Link } from "react-router-dom";
import { FaLinkedin, FaFacebook, FaWhatsapp, FaYoutube } from "react-icons/fa";

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className || "w-4 h-4"} {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Accueil", path: "/" },
    { name: "Marché & BRVM", path: "/marche" },
    { name: "Économie", path: "/economie" },
    { name: "Industrie", path: "/industrie" },
    { name: "Investissement", path: "/investissement" },
    { name: "Tech & Innovation", path: "/tech" },
    { name: "Guides & Formations", path: "/guide-debutant" },
    { name: "Convertisseur Devises", path: "/convertisseur-devises" },
  ];

  const legalLinks = [
    { name: "À propos", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "CGU", path: "/terms" },
    { name: "Confidentialité", path: "/confidentialite" },
    { name: "Mentions légales", path: "/mentions-legales" },
    { name: "Cookies", path: "/cookies" },
    { name: "Plan du site", path: "/plan-du-site" },
  ];

  const socialLinks = [
    { name: "LinkedIn", url: "https://linkedin.com", icon: FaLinkedin },
    { name: "X", url: "https://x.com", icon: XIcon },
    { name: "YouTube", url: "https://youtube.com", icon: FaYoutube },
    { name: "Facebook", url: "https://facebook.com", icon: FaFacebook },
    { name: "WhatsApp", url: "https://whatsapp.com", icon: FaWhatsapp },
  ];

  return (
    <footer className="bg-[#2D3130] text-stone-300 font-sans border-t border-stone-800">
      {/* Banner Newsletter Haute Définition */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <div className="bg-[#232625] rounded-3xl p-8 sm:p-10 border border-[#9C8464]/30 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="font-mono text-xs font-black text-[#9C8464] uppercase tracking-widest block mb-2">
              RESTEZ INFORMÉ EN CONTINU
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-tight">
              Abonnez-vous aux analyses exclusives Amani
            </h4>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed font-medium">
              Recevez les synthèses financières, le récapitulatif quotidien de la BRVM et les tendances économiques ouest-africaines.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto"
          >
            <input
              type="email"
              placeholder="Votre adresse email..."
              className="px-4 py-3 bg-[#1A1C1B] text-white placeholder-stone-500 rounded-xl text-xs sm:text-sm border border-stone-700 focus:outline-none focus:border-[#9C8464] min-w-0 sm:w-72 font-medium"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#9C8464] hover:bg-[#857053] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md shrink-0 uppercase tracking-wider"
            >
              S'abonner
            </button>
          </form>
        </div>
      </div>

      {/* Section Principale du Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Colonne 1: Marque & Présentation */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="inline-block">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fa7441c9084eb43e6855cf7e960c5c609%2F6ebebc1a91e8447db48a68aa5b391a28?format=webp&width=800"
                alt="Amani Media & Financial Platform"
                className="h-10 w-auto brightness-110"
              />
            </Link>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-md font-medium">
              Amani est la plateforme de référence dédiée à l'information économique, financière et boursière en Afrique de l'Ouest. Nous décryptons l'actualité des marchés pour éclairer les investisseurs et décideurs.
            </p>

            {/* Réseaux Sociaux Épurés */}
            <div className="pt-2">
              <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider block mb-3">
                NOUS SUIVRE
              </span>
              <div className="flex items-center gap-2.5">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-[#232625] hover:bg-[#9C8464] text-stone-300 hover:text-white border border-stone-700/60 hover:border-[#9C8464] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      aria-label={social.name}
                      title={social.name}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Colonne 2: Navigation rapide */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-mono text-xs font-black text-[#9C8464] uppercase tracking-widest">
              NAVIGATION
            </h3>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-xs sm:text-sm font-semibold text-stone-400 hover:text-white transition-colors block py-0.5"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3: Coordonnées & Siège */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-mono text-xs font-black text-[#9C8464] uppercase tracking-widest">
              CONTACT & SIÈGE
            </h3>
            <div className="space-y-3 text-xs sm:text-sm font-medium text-stone-400">
              <div>
                <span className="block text-[11px] font-mono text-stone-500 uppercase">COURRIEL</span>
                <a href="mailto:info@amani-finance.com" className="text-stone-300 hover:text-[#9C8464] font-semibold transition-colors">
                  info@amani-finance.com
                </a>
              </div>

              <div>
                <span className="block text-[11px] font-mono text-stone-500 uppercase">TÉLÉPHONE</span>
                <a href="tel:+22320224567" className="text-stone-300 hover:text-[#9C8464] font-semibold transition-colors">
                  +223 20 22 45 67
                </a>
              </div>

              <div>
                <span className="block text-[11px] font-mono text-stone-500 uppercase">ADRESSE</span>
                <span className="text-stone-300 font-semibold">Faladie, Bamako, Mali</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Basse & Mentions Légales */}
        <div className="border-t border-stone-800/80 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-stone-400">
          <div>
            © {currentYear} <strong>Amani Finance</strong>. Tous droits réservés. Développé par{" "}
            <a
              href="https://www.aikio.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9C8464] hover:text-white font-bold transition-colors"
            >
              Aikio Corp SAS
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalLinks.map((l) => (
              <Link key={l.path} to={l.path} className="hover:text-[#9C8464] transition-colors">
                {l.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
