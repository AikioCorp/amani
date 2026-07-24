import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';

const CookiesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#373B3A]">
      {/* Header Banner */}
      <section className="bg-[#373B3A] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#9C8464]/30">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#9C8464] hover:text-white uppercase tracking-wider mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2.5 bg-[#9C8464]/20 rounded-xl border border-[#9C8464]/40">
              <Cookie className="w-6 h-6 text-[#9C8464]" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#9C8464]">
              Respect de la Vie Privée
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Politique de Gestion des Cookies
          </h1>
          <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
            Découvrez comment nous utilisons les cookies et traçeurs pour améliorer votre expérience d'analyse financière sur Amani Finance.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Quick Nav Pill Links */}
        <div className="flex flex-wrap gap-3 pb-6 border-b border-gray-200">
          <Link
            to="/terms"
            className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-bold rounded-xl transition-all"
          >
            Conditions d'Utilisation
          </Link>
          <Link
            to="/confidentialite"
            className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-bold rounded-xl transition-all"
          >
            Politique de Confidentialité
          </Link>
          <Link
            to="/mentions-legales"
            className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-bold rounded-xl transition-all"
          >
            Mentions Légales
          </Link>
          <Link
            to="/cookies"
            className="px-4 py-2 bg-[#373B3A] text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Gestion des Cookies
          </Link>
        </div>

        {/* Section 1: Qu'est-ce qu'un cookie ? */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A] flex items-center gap-2">
            <Cookie className="w-5 h-5 text-[#9C8464]" /> 1. Qu'est-ce qu'un Cookie ?
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette ou smartphone) lors de la visite d'un site internet. Il permet de conserver des données d'état (ex: votre session de connexion, la langue choisie ou la reprise de lecture d'un podcast).
          </p>
        </section>

        {/* Section 2: Types de cookies utilisés */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A]">
            2. Les Types de Cookies Utilisés sur Amani Finance
          </h2>
          <div className="space-y-3">
            <div className="bg-[#FDFBF9] p-4 rounded-xl border border-[#E5DDD5]/80 space-y-1">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#373B3A] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#9C8464]" /> Cookies Stricts & Techniques (Obligatoires)
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Nécessaires au fonctionnement de l'authentification (jeton de session sécurisé JWT), au maintien de vos droits Premium et au fonctionnement du lecteur Audio.
              </p>
            </div>

            <div className="bg-[#FDFBF9] p-4 rounded-xl border border-[#E5DDD5]/80 space-y-1">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#373B3A] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#9C8464]" /> Cookies de Préférences & d'Ergonomie
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Permettent de mémoriser vos secteurs d'analyse favoris et l'état de votre progression dans les articles.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Gestion de vos préférences */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A]">
            3. Comment Gérer vos Cookies dans votre Navigateur ?
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Vous pouvez à tout moment configurer votre navigateur pour accepter ou refuser les cookies. La désactivation des cookies essentiels peut toutefois perturber votre accès à l'espace membre Premium.
          </p>
        </section>
      </main>
    </div>
  );
};

export default CookiesPage;
