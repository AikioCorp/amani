import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Server, Shield, FileCheck, ArrowLeft } from 'lucide-react';

const MentionsLegales: React.FC = () => {
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
              <Building2 className="w-6 h-6 text-[#9C8464]" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#9C8464]">
              Informations Légales
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Mentions Légales
          </h1>
          <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
            Identité de l'éditeur, coordonnées de l'hébergeur et informations réglementaires d'Amani Finance.
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
            className="px-4 py-2 bg-[#373B3A] text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Mentions Légales
          </Link>
          <Link
            to="/cookies"
            className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-bold rounded-xl transition-all"
          >
            Gestion des Cookies
          </Link>
        </div>

        {/* Section 1: Éditeur du site */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#9C8464]" /> 1. Éditeur de la Plateforme
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Le site internet <strong>Amani Finance</strong> (amani-finance.com) est édité par la société :
          </p>
          <div className="bg-[#FDFBF9] p-4 rounded-xl border border-[#E5DDD5]/80 space-y-2 text-xs text-[#373B3A]">
            <p><strong>Dénomination sociale :</strong> Aikio Corp SAS</p>
            <p><strong>Siège social :</strong> Faladié, Bamako, Mali</p>
            <p><strong>Email de contact :</strong> contact@amani-finance.com / info@aikio.co</p>
            <p><strong>Téléphone :</strong> +223 20 22 45 67</p>
            <p><strong>Directeur de la Publication :</strong> Direction de la Rédaction Amani Finance</p>
          </div>
        </section>

        {/* Section 2: Hébergement du site */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A] flex items-center gap-2">
            <Server className="w-5 h-5 text-[#9C8464]" /> 2. Hébergement & Infrastructure
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            L'infrastructure applicative et la base de données d'Amani Finance sont hébergées de manière sécurisée auprès de prestataires de classe internationale :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FDFBF9] p-4 rounded-xl border border-[#E5DDD5]/80 text-xs text-[#373B3A] space-y-1">
              <h4 className="font-bold uppercase tracking-wider text-[#9C8464]">Serveurs Web & API</h4>
              <p><strong>Railway Corp.</strong></p>
              <p className="text-gray-500">548 Market St, San Francisco, CA 94104, USA</p>
            </div>
            <div className="bg-[#FDFBF9] p-4 rounded-xl border border-[#E5DDD5]/80 text-xs text-[#373B3A] space-y-1">
              <h4 className="font-bold uppercase tracking-wider text-[#9C8464]">Base de Données PostgreSQL</h4>
              <p><strong>Neon Inc.</strong></p>
              <p className="text-gray-500">Cloud Infrastructure (AWS US-East & EU-West)</p>
            </div>
          </div>
        </section>

        {/* Section 3: Statut Réglementaire et Indépendance Média */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#9C8464]" /> 3. Statut Média et Avertissement Réglementaire
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Amani Finance est un média spécialisé d'analyse et d'information économique et financière. Amani Finance n'est ni un établissement de crédit, ni un prestataire de services d'investissement (PSI) agréé, ni une société de gestion de portefeuille au sens des règlements de l'UMOA et de l'AMF-UMOA (Autorité des Marchés Financiers).
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Toutes les analyses et opportunités diffusées sont destinées à informer les investisseurs et à faciliter la découverte d'entreprises. Les transactions d'investissement effectives sont soumises à la réglementation applicable et à la signature d'accords contractuels définitifs entre les parties.
          </p>
        </section>
      </main>
    </div>
  );
};

export default MentionsLegales;
