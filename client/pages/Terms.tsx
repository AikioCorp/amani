import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Lock, Scale, AlertTriangle, ArrowLeft } from 'lucide-react';

const Terms: React.FC = () => {
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
              <FileText className="w-6 h-6 text-[#9C8464]" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#9C8464]">
              Cadre Juridique
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Conditions Générales d'Utilisation (CGU)
          </h1>
          <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
            Dernière mise à jour : 24 Juillet 2026. Veuillez lire attentivement les conditions régissant l'accès et l'utilisation de la plateforme Amani Finance.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Quick Nav Pill Links */}
        <div className="flex flex-wrap gap-3 pb-6 border-b border-gray-200">
          <Link
            to="/terms"
            className="px-4 py-2 bg-[#373B3A] text-white text-xs font-bold rounded-xl shadow-xs"
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
            className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-bold rounded-xl transition-all"
          >
            Gestion des Cookies
          </Link>
        </div>

        {/* Section 1: Présentation et Objet */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A] flex items-center gap-2">
            1. Présentation et Objet de la Plateforme
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            La plateforme <strong>Amani Finance</strong> (accessible via l'adresse amani-finance.com et ses sous-domaines) est éditée par la société <strong>Aikio Corp SAS</strong>. Amani Finance est un portail média et d'analyse financière indépendant dédié à l'information économique, aux marchés boursiers de l'Afrique de l'Ouest (BRVM) et aux opportunités d'investissement en Afrique.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Les présentes Conditions Générales d'Utilisation ont pour objet de définir les modalités d'accès et d'utilisation des services proposés par Amani Finance à l'ensemble des visiteurs, abonnés et investisseurs.
          </p>
        </section>

        {/* Section 2: Accès aux Services et Abonnements */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A]">
            2. Accès aux Services & Abonnements
          </h2>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>
              <strong>2.1 Accès Gratuit :</strong> La consultation de certains articles d'information générale, indices boursiers publics et podcasts d'introduction est libre et gratuite.
            </p>
            <p>
              <strong>2.2 Offres Premium :</strong> L'accès aux analyses économiques approfondies, dossiers sectoriels stratégiques, fiches de valorisation d'entreprises et alertes boursières personnalisées requiert la création d'un compte utilisateur et la souscription à une formule Premium payante.
            </p>
            <p>
              <strong>2.3 Identifiants :</strong> L'utilisateur est seul responsable du maintien de la confidentialité de ses identifiants de connexion. Toute action réalisée depuis son compte est réputée effectuée par l'utilisateur lui-même.
            </p>
          </div>
        </section>

        {/* Section 3: Engagement et Intentions d'Investissement */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A]">
            3. Intention d'Investissement et Services Directs
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Amani Finance met en relation des porteurs de projets/entreprises à fort potentiel avec des investisseurs qualifiés (Particuliers, Business Angels, Fonds d'investissement, Institutionnels).
          </p>
          <div className="bg-[#9C8464]/10 border border-[#9C8464]/30 rounded-xl p-4 space-y-2 text-xs text-[#373B3A]">
            <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#9C8464]">
              <AlertTriangle className="w-4 h-4" /> Nature des intentions d'investissement
            </div>
            <p className="leading-relaxed">
              Toute soumission via notre formulaire d'option d'investissement constitue une <strong>intention non binding (sans engagement ferme immédiat)</strong> destinée à initié la phase de cadrage et la mise à disposition du Mémorandum Financier ou de la Data Room sous réserve des vérifications de conformité (KYC/AML).
            </p>
          </div>
        </section>

        {/* Section 4: Avertissement sur les Risques Financiers */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A] flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#9C8464]" /> 4. Avertissement sur les Risques Financiers
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Les informations, analyses et opinions publiées sur Amani Finance sont fournies à titre strictement informatif et pédagogique. Elles ne constituent en aucun cas un conseil en investissement, une incitation à l'achat ou à la vente d'instruments financiers au sens des réglementations bancaires et boursières (BCEAO, AMF-UMOA, CREPMF).
          </p>
          <p className="text-sm font-semibold text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            L'investisseur est informé que tout investissement comporte des risques de perte en capital partielle ou totale. Il convient d'évaluer sa situation financière personnelle avant toute prise de décision.
          </p>
        </section>

        {/* Section 5: Propriété Intellectuelle */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A]">
            5. Propriété Intellectuelle
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            L'ensemble des éléments figurant sur le site Amani Finance (textes, graphiques, logos, données boursières retraitées, enregistrements audio, visuels) sont protégés par le droit d'auteur et les droits de propriété intellectuelle. Toute reproduction ou diffusion non autorisée est strictement interdite.
          </p>
        </section>

        {/* Section 6: Modifications et Droit Applicable */}
        <section className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-xl font-bold text-[#373B3A]">
            6. Droit Applicable et Contact
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Les présentes conditions sont soumises à la législation en vigueur. Pour toute question concernant nos conditions d'utilisation, vous pouvez contacter notre service juridique à l'adresse email : <strong>legal@amani-finance.com</strong>.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Terms;
