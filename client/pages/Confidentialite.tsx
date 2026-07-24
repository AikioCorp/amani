import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, Database, UserCheck, ArrowLeft } from 'lucide-react';

const Confidentialite: React.FC = () => {
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
              <ShieldCheck className="w-6 h-6 text-[#9C8464]" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#9C8464]">
              Protection des Données
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
            Chez Amani Finance, la confidentialité et la sécurité de vos données personnelles et financières constituent une priorité absolue.
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
            className="px-4 py-2 bg-[#373B3A] text-white text-xs font-bold rounded-xl shadow-xs"
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
            className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-bold rounded-xl transition-all"
          >
            Gestion des Cookies
          </Link>
        </div>

        {/* Section 1: Collecte des Données */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#9C8464]" /> 1. Données Personnelles Collectées
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Dans le cadre de l'utilisation de nos services, Amani Finance collecte uniquement les informations nécessaires au bon fonctionnement de la plateforme :
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
            <li><strong>Informations de compte :</strong> Nom, Prénom, adresse email, numéro de téléphone / WhatsApp.</li>
            <li><strong>Profil d'investisseur :</strong> Statut d'investisseur (Particulier, Business Angel, Fonds, Institutionnel), montant d'option renseigné et secteur d'intérêt.</li>
            <li><strong>Données de navigation & techniques :</strong> Adresse IP, type de navigateur, pages consultées et préférences d'alertes financières.</li>
          </ul>
        </section>

        {/* Section 2: Finalité des Traitements */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A]">
            2. Finalité et Utilisation de vos Données
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Vos données personnelles sont traitées dans des buts strictement définis :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FDFBF9] p-4 rounded-xl border border-[#E5DDD5]/80 space-y-1">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#373B3A]">Gestion de compte</h4>
              <p className="text-xs text-gray-500">Accès aux articles Premium, gestion de l'abonnement et historique de lecture.</p>
            </div>
            <div className="bg-[#FDFBF9] p-4 rounded-xl border border-[#E5DDD5]/80 space-y-1">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#373B3A]">Traitement des dossiers</h4>
              <p className="text-xs text-gray-500">Mise en relation d'investissement et transmission sécurisée du Mémorandum Financier / Data Room.</p>
            </div>
            <div className="bg-[#FDFBF9] p-4 rounded-xl border border-[#E5DDD5]/80 space-y-1">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#373B3A]">Alertes & Newsletters</h4>
              <p className="text-xs text-gray-500">Envoi de nos newsletters économiques et alertes boursières selon vos préférences.</p>
            </div>
            <div className="bg-[#FDFBF9] p-4 rounded-xl border border-[#E5DDD5]/80 space-y-1">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#373B3A]">Sécurité & Conformité</h4>
              <p className="text-xs text-gray-500">Prévention de la fraude, respect des obligations légales et vérifications de conformité (KYC).</p>
            </div>
          </div>
        </section>

        {/* Section 3: Non-divulgation à des tiers */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#9C8464]" /> 3. Confidencialité et Partage Sécurisé
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>Amani Finance ne vend ni ne loue aucune donnée personnelle ou financière à des tiers.</strong>
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Dans le cas exclusif des dossiers d'investissement direct, vos informations de contact et votre intention ne sont transmises au porteur de projet concerné qu'après validation de votre statut d'investisseur et accord préalable.
          </p>
        </section>

        {/* Section 4: Vos Droits (APDP / RGPD) */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#9C8464]" /> 4. Vos Droits et Gestion de vos Données
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Conformément aux réglementations relatives à la protection des données personnelles (Autorités de protection des données personnelles - APDP / RGPD), vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
            <li><strong>Droit d'accès et de rectification :</strong> Consulter et modifier vos informations directement depuis votre profil.</li>
            <li><strong>Droit à l'effacement ("Droit à l'oubli") :</strong> Demander la suppression intégrale de votre compte et de vos données.</li>
            <li><strong>Droit d'opposition :</strong> Vous désabonner à tout moment des emails d'information ou newsletters en un clic.</li>
          </ul>
          <p className="text-xs text-gray-500 pt-2">
            Pour exercer l'un de ces droits, contactez notre Délégué à la Protection des Données (DPO) : <strong>dpo@amani-finance.com</strong>.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Confidentialite;
