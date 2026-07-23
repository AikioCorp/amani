import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { API_BASE_URL } from "../services/apiConfig";
import { getSessionToken } from "../services/authService";
import {
  Crown,
  Check,
  Zap,
  Bell,
  Mail,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  HelpCircle,
  PhoneCall,
  Loader2,
  CheckCircle,
  FileText,
  TrendingUp,
  Headphones,
  Smartphone,
  ChevronDown,
} from "lucide-react";
import { Button } from "../components/ui/button";

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [submitting, setSubmitting] = useState(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Préférences d'alertes & newsletter
  const [newsletterForm, setNewsletterForm] = useState({
    email: user?.email || "",
    full_name: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "",
    phone: user?.phone || "",
    topics: ["Matières Premières", "Investissements", "Indices BRVM"],
    frequency: "weekly",
    whatsapp_alerts: true,
  });

  const [savingPreferences, setSavingPreferences] = useState(false);

  // Prefill si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      setNewsletterForm((prev) => ({
        ...prev,
        email: user.email || prev.email,
        full_name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || prev.full_name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleTopicToggle = (topic: string) => {
    setNewsletterForm((prev) => {
      const exists = prev.topics.includes(topic);
      const nextTopics = exists
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic];
      return { ...prev, topics: nextTopics };
    });
  };

  const handleSaveNewsletterPreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterForm.email || !newsletterForm.email.includes("@")) {
      toastError("Adresse Email Requise", "Veuillez entrer une adresse email valide.");
      return;
    }

    setSavingPreferences(true);
    try {
      const token = getSessionToken();
      const res = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newsletterForm),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toastSuccess(
          "Préférences enregistrées avec succès !",
          "Votre profil d'alertes sectorielles et newsletter Amani Finance est à jour."
        );
      } else {
        toastError("Erreur", json.error || "Échec de l'enregistrement des préférences.");
      }
    } catch (err) {
      toastError("Erreur Réseau", "Impossible de joindre le serveur.");
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleActivatePremium = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      const token = getSessionToken();
      const res = await fetch(`${API_BASE_URL}/user/subscribe-premium`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan: billingCycle }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toastSuccess(
          "Pass Premium Activé !",
          `Félicitations ! Votre compte dispose désormais de l'accès Membre Premium Amani Finance (${billingCycle === "annual" ? "Formule Annuelle" : "Formule Mensuelle"}).`
        );
        setSubscribeModalOpen(false);

        fetch(`${API_BASE_URL}/newsletter/subscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(newsletterForm),
        });
      } else {
        toastError("Erreur", json.error || "Impossible d'activer l'abonnement.");
      }
    } catch (err) {
      toastError("Erreur Réseau", "Impossible d'activer l'accès Premium.");
    } finally {
      setSubmitting(false);
    }
  };

  const FAQS = [
    {
      q: "Quels sont les moyens de paiement acceptés pour le Pass Premium ?",
      a: "Vous pouvez souscrire facilement par Mobile Money (Orange Money, Wave, MTN MoMo, Moov Money), par Carte Bancaire (Visa, Mastercard) ou par Virement Bancaire régional.",
    },
    {
      q: "Comment fonctionne l'accès aux podcasts et analyses exclusives ?",
      a: "Dès votre inscription au Pass Premium, l'ensemble des verrous (paywalls) sur les articles d'analyse stratégique, les dossiers sectoriels et les enregistrements podcasts sont automatiquement levés.",
    },
    {
      q: "Comment configurer mes alertes instantanées sur WhatsApp ?",
      a: "Renseignez simplement votre numéro WhatsApp dans le formulaire ci-dessous et sélectionnez vos thèmes prioritaires (Cacao, Or, Bourse BRVM, Pétrole). Vous recevrez directement nos flashes d'information.",
    },
    {
      q: "Puis-je annuler ou modifier mon abonnement à tout moment ?",
      a: "Absolument. Vous gardez le contrôle total depuis votre espace profil sans aucun frais d'annulation ni engagement contraignant.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#1F2221] text-gray-100 font-sans">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center border-b border-stone-800">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5DDD5]/10 border border-[#E5DDD5]/30 text-[#E5DDD5] text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
          <Crown className="w-4 h-4 text-amber-400" /> Amani Finance Premium & Intelligence Économique
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 text-white leading-tight">
          L'Intelligence Financière Africaine <br className="hidden sm:inline" />
          <span className="text-amber-400">Sans Compromis</span>
        </h1>

        <p className="text-base sm:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
          Accédez aux décryptages stratégiques confidentiels, aux podcasts d'experts du marché et recevez des alertes sectorielles ciblées en temps réel.
        </p>

        {/* Formules Mensuelle / Annuelle Switcher */}
        <div className="inline-flex items-center gap-4 bg-[#2D302F] p-2 rounded-2xl border border-stone-700 shadow-inner">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              billingCycle === "monthly"
                ? "bg-[#373B3A] text-white shadow-md border border-stone-600"
                : "text-stone-400 hover:text-white"
            }`}
          >
            Facturation Mensuelle
          </button>

          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              billingCycle === "annual"
                ? "bg-amber-600 text-white shadow-md border border-amber-500"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <span>Facturation Annuelle</span>
            <span className="px-2 py-0.5 bg-amber-400 text-stone-950 text-[10px] font-black uppercase rounded-full">
              2 Mois Offerts
            </span>
          </button>
        </div>
      </section>

      {/* Grid des Tarifs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Offre Membre Gratuit */}
        <div className="bg-[#2D302F] border border-stone-800 rounded-3xl p-8 flex flex-col justify-between hover:border-stone-700 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-stone-200">Accès Public</h3>
              <span className="px-3 py-1 bg-[#373B3A] text-stone-300 rounded-full text-xs font-bold border border-stone-700">
                Gratuit
              </span>
            </div>

            <div className="mb-6">
              <span className="text-4xl sm:text-5xl font-black text-white">0 FCFA</span>
              <span className="text-stone-400 text-sm font-medium"> / permanent</span>
            </div>

            <p className="text-sm text-stone-300 mb-8 border-b border-stone-800 pb-6 font-medium">
              Pour suivre l'actualité économique générale et consulter les cours publics des marchés.
            </p>

            <ul className="space-y-4 text-sm text-stone-200 mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                Lecture des dépêches et actualités publiques
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                Consultation des cours BRVM & Matières premières
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                Lettre d'information générale hebdomadaire
              </li>
              <li className="flex items-center gap-3 text-stone-400/70 line-through">
                <ShieldCheck className="w-5 h-5 text-stone-500 flex-shrink-0" />
                Analyses financières approfondies & Dossiers Paywall
              </li>
              <li className="flex items-center gap-3 text-stone-400/70 line-through">
                <ShieldCheck className="w-5 h-5 text-stone-500 flex-shrink-0" />
                Podcasts & Interviews audio exclusives
              </li>
              <li className="flex items-center gap-3 text-stone-400/70 line-through">
                <ShieldCheck className="w-5 h-5 text-stone-500 flex-shrink-0" />
                Alertes personnalisées instantanées sur WhatsApp
              </li>
            </ul>
          </div>

          <Link
            to="/register"
            className="w-full text-center bg-[#373B3A] hover:bg-[#464B49] text-white font-bold py-3.5 px-4 rounded-xl border border-stone-600 transition-all shadow-md block"
          >
            Créer un Compte Gratuit
          </Link>
        </div>

        {/* Offre Pass Premium Amani */}
        <div className="bg-[#2B2D2C] border-2 border-amber-500/70 rounded-3xl p-8 flex flex-col justify-between relative shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-stone-950 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
            Populaire auprès des Décideurs
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-7 h-7 text-amber-400" />
              <h3 className="text-2xl font-black text-white">Pass Premium Amani</h3>
            </div>

            <div className="mb-6">
              {billingCycle === "annual" ? (
                <div>
                  <span className="text-4xl sm:text-5xl font-black text-white">150 000 FCFA</span>
                  <span className="text-stone-400 text-sm font-medium"> / an</span>
                  <p className="text-xs text-amber-400 font-bold mt-1.5">
                    Équivalent à 12 500 FCFA / mois (Économie de 30 000 FCFA)
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-4xl sm:text-5xl font-black text-white">15 000 FCFA</span>
                  <span className="text-stone-400 text-sm font-medium"> / mois</span>
                </div>
              )}
            </div>

            <p className="text-sm text-stone-300 mb-8 border-b border-stone-800 pb-6">
              Accès illimité à l'intégralité du contenu exclusif, podcasts, opportunités et alertes d'urgence.
            </p>

            <ul className="space-y-4 text-sm text-stone-200 mb-8">
              <li className="flex items-center gap-3 font-semibold text-white">
                <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                Accès illimité à TOUS les Articles & Analyses stratégiques Paywall
              </li>
              <li className="flex items-center gap-3 font-semibold text-white">
                <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                Écoute des Podcasts & Interviews d'Experts du marché régional
              </li>
              <li className="flex items-center gap-3 font-semibold text-white">
                <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                Alertes prioritaires instantanées sur WhatsApp & Email
              </li>
              <li className="flex items-center gap-3 font-semibold text-white">
                <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                Suivi en temps réel des opportunités d'investissement qualifiées
              </li>
              <li className="flex items-center gap-3 text-stone-300">
                <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                Téléchargement des Synthèses & Rapports macroéconomiques
              </li>
            </ul>
          </div>

          <Button
            onClick={() => setSubscribeModalOpen(true)}
            className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-base py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" /> Activer mon Pass Premium
          </Button>
        </div>
      </section>

      {/* Avantages Clés en 4 Piliers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-stone-800">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Pourquoi Choisir Amani Premium ?</h2>
          <p className="text-sm text-stone-400 mt-2">Un avantage d'information déterminant pour vos décisions financières.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#2D302F] p-6 rounded-2xl border border-stone-800 space-y-3">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Analyses Paywall</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Dossiers d'investigation financière approfondis sur les marchés ouest-africains.
            </p>
          </div>

          <div className="bg-[#2D302F] p-6 rounded-2xl border border-stone-800 space-y-3">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-bold">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Podcasts Exclusifs</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Interviews exclusives avec les directeurs d'institutions et analystes influents.
            </p>
          </div>

          <div className="bg-[#2D302F] p-6 rounded-2xl border border-stone-800 space-y-3">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Alertes WhatsApp</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Flashes instantanés envoyés directement sur votre mobile dès qu'un cours vacille.
            </p>
          </div>

          <div className="bg-[#2D302F] p-6 rounded-2xl border border-stone-800 space-y-3">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Opportunités Pro</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Priorité de souscription sur les projets d'investissement audités par nos experts.
            </p>
          </div>
        </div>
      </section>

      {/* Formulaire de Configuration des Alertes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-[#2B2D2C] border border-stone-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6">
          <div className="flex items-center gap-4 border-b border-stone-800 pb-6">
            <div className="p-3 bg.amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Vos Alertes & Notifications Sectorielles</h2>
              <p className="text-xs text-stone-400">Sélectionnez vos thèmes prioritaires et votre canal de réception.</p>
            </div>
          </div>

          <form onSubmit={handleSaveNewsletterPreferences} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-1.5">
                  Nom & Prénom
                </label>
                <input
                  type="text"
                  placeholder="Ex: Abdoulaye Traoré"
                  value={newsletterForm.full_name}
                  onChange={(e) => setNewsletterForm({ ...newsletterForm, full_name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1F2221] border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-1.5">
                  Adresse Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ex: a.traore@domaine.com"
                  value={newsletterForm.email}
                  onChange={(e) => setNewsletterForm({ ...newsletterForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1F2221] border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-300 mb-2">
                Thèmes d'alertes à suivre :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  "Matières Premières",
                  "Investissements",
                  "Indices BRVM",
                  "Macroéconomie",
                ].map((topic) => {
                  const isSelected = newsletterForm.topics.includes(topic);
                  return (
                    <button
                      type="button"
                      key={topic}
                      onClick={() => handleTopicToggle(topic)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-[#1F2221] border-stone-700 text-stone-400 hover:border-stone-500"
                      }`}
                    >
                      <span>{topic}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-800 pt-6">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-2">
                  Fréquence d'envoi Email
                </label>
                <div className="flex gap-4 text-xs font-semibold text-stone-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value="weekly"
                      checked={newsletterForm.frequency === "weekly"}
                      onChange={() => setNewsletterForm({ ...newsletterForm, frequency: "weekly" })}
                      className="text-amber-400 focus:ring-amber-400"
                    />
                    Synthèse Hebdomadaire
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value="instant"
                      checked={newsletterForm.frequency === "instant"}
                      onChange={() => setNewsletterForm({ ...newsletterForm, frequency: "instant" })}
                      className="text-amber-400 focus:ring-amber-400"
                    />
                    Alertes Instantanées
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-1.5">
                  Numéro WhatsApp pour alertes d'urgence
                </label>
                <input
                  type="tel"
                  placeholder="Ex: +223 70 00 00 00"
                  value={newsletterForm.phone}
                  onChange={(e) => setNewsletterForm({ ...newsletterForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#1F2221] border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={savingPreferences}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-md text-xs flex items-center gap-2"
              >
                {savingPreferences ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                Enregistrer mes Préférences d'Alertes
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Foire Aux Questions (FAQ) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-stone-800">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-white">Questions Fréquentes</h2>
          <p className="text-xs text-stone-400 mt-1">Tout ce que vous devez savoir sur le Pass Premium Amani.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-[#2D302F] border border-stone-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-5 text-left font-bold text-sm text-white flex items-center justify-between hover:bg-[#373B3A] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${openFaqIndex === idx ? "rotate-180 text-amber-400" : ""}`} />
              </button>
              {openFaqIndex === idx && (
                <div className="p-5 pt-0 text-xs text-stone-300 leading-relaxed border-t border-stone-800/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Modal de Confirmation */}
      {subscribeModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2D302F] border border-stone-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Activation du Pass Premium</h3>
                <p className="text-xs text-stone-400">
                  Formule choisie : <span className="text-amber-400 font-bold">{billingCycle === "annual" ? "Annuel (150 000 FCFA/an)" : "Mensuel (15 000 FCFA/mois)"}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#1F2221] p-4 rounded-2xl border border-stone-800 text-xs text-stone-300 space-y-2">
                <div className="flex justify-between">
                  <span>Compte :</span>
                  <span className="font-bold text-white">{user ? user.email : "Non connecté"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accès Débloqués :</span>
                  <span className="font-bold text-emerald-400">Articles Paywall, Podcasts & Alertes WhatsApp</span>
                </div>
              </div>

              <p className="text-xs text-stone-400 leading-relaxed">
                En confirmant votre souscription, votre compte sera immédiatement converti au statut Membre Premium Amani Finance.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setSubscribeModalOpen(false)}
                className="px-4 py-2.5 border border-stone-600 bg-[#373B3A] hover:bg-[#464B49] text-white text-xs font-bold rounded-xl transition-all"
              >
                Annuler
              </button>
              <Button
                onClick={handleActivatePremium}
                disabled={submitting}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirmer & Activer le Pass Premium
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
