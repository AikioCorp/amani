import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { getApiUrl } from "../services/apiConfig";
import {
  Mail,
  Send,
  Users,
  BarChart3,
  CheckCircle,
  TrendingUp,
  Clock,
  Bell,
  Sparkles,
  ShieldCheck,
  Zap,
  MessageSquare,
  Phone,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

export default function Newsletter() {
  const { success, error } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([
    "Matières Premières",
    "Investissements",
    "Indices",
  ]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPreferences.length === 0) {
      error("Thématique requise", "Veuillez sélectionner au moins une thématique d'intérêt.");
      return;
    }

    if (!email.trim()) {
      error("Email requis", "Veuillez saisir votre adresse email.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      error("Email invalide", "Veuillez saisir une adresse email valide.");
      return;
    }

    if (whatsappAlerts && !phone.trim()) {
      error("Numéro requis", "Veuillez indiquer votre numéro pour recevoir les alertes WhatsApp.");
      return;
    }

    setIsSubscribing(true);
    try {
      const res = await fetch(getApiUrl("/newsletter/subscribe"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone: phone || null,
          whatsapp_alerts: whatsappAlerts,
          topics: selectedPreferences,
          frequency: "weekly",
          source: "newsletter_page",
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Échec de l'inscription.");
      }

      success(
        "Abonnement confirmé !",
        `Vous êtes inscrit à la newsletter Amani avec l'email ${email}.`,
      );
      setSubmittedEmail(email);
      setIsSubmitted(true);
    } catch (e: any) {
      error("Échec de l'inscription", e.message || "Veuillez réessayer plus tard.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleResetForm = () => {
    setEmail("");
    setPhone("");
    setIsSubmitted(false);
    setSubmittedEmail("");
  };

  const handlePreferenceToggle = (topicName: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(topicName)
        ? prev.filter((p) => p !== topicName)
        : [...prev, topicName],
    );
  };

  const preferences = [
    {
      id: "macro",
      name: "Matières Premières",
      label: "Matières Premières & Or",
      description: "Cours réels du Pétrole, Or, Cacao, Coton dans le Sahel",
    },
    {
      id: "brvm",
      name: "Indices",
      label: "Marchés Financiers & BRVM",
      description: "Revue hebdomadaire de la BRVM, de la BCEAO et des devises",
    },
    {
      id: "industrie",
      name: "Industrie",
      label: "Industrie & Projets Miniers",
      description: "Analyses des usines, raffineries et infrastructures UEMOA",
    },
    {
      id: "investissement",
      name: "Investissements",
      label: "Opportunités d'Investissement",
      description: "Alertes sur les levées de fonds, obligations et due diligence",
    },
    {
      id: "tech",
      name: "Technologie",
      label: "Tech & FinTech",
      description: "Startups, Mobile Money et innovations digitales",
    },
    {
      id: "politiques",
      name: "Politiques Publiques",
      label: "Réformes & Politiques",
      description: "Décisions gouvernementales et accords régionaux",
    },
  ];

  const benefits = [
    {
      icon: BarChart3,
      title: "Analyses Synthétiques",
      description: "Synthèses rédigées par des analystes financiers experts du Sahel",
    },
    {
      icon: Clock,
      title: "En Avant-Première",
      description: "Reçue chaque mercredi à 08h00 GMT directement dans votre boîte mail",
    },
    {
      icon: TrendingUp,
      title: "Données de Marché",
      description: "Tableaux récapitulatifs des cours et des variations de la semaine",
    },
    {
      icon: Users,
      title: "15 000+ Décideurs",
      description: "Rejoignez le réseau des professionnels et investisseurs de la région",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      {/* Hero Section - Solid Charcoal Background */}
      <section className="bg-[#373B3A] text-white border-b border-stone-800 py-10 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700/60 shadow-md">
              <Mail className="w-8 h-8 sm:w-12 sm:h-12 text-[#9C8464]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-3 sm:mb-4">
            📬 Lettre d'Information & Veille Amani
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8">
            Chaque mercredi, recevez le condensé stratégique de l'actualité économique, des marchés financiers et des opportunités d'investissement au Sahel et dans l'UEMOA
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-1.5 bg-stone-800/60 px-3 py-1.5 rounded-full border border-stone-700/60">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Gratuit</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-800/60 px-3 py-1.5 rounded-full border border-stone-700/60">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Envoi Tous les Mercredis</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-800/60 px-3 py-1.5 rounded-full border border-stone-700/60">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Désabonnement en 1 Clic</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Form or Confirmation View Section */}
      <section id="subscribe-form" className="py-8 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isSubmitted ? (
            /* CONFIRMATION VIEW AFTER SUBMISSION */
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6 sm:p-12 text-center animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>

              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
                Abonnement Confirmé
              </span>

              <h2 className="text-xl sm:text-3xl font-black text-[#373B3A] mb-3">
                Merci ! Votre inscription est bien enregistrée.
              </h2>

              <p className="text-xs sm:text-base text-stone-600 max-w-xl mx-auto mb-6 leading-relaxed">
                L'adresse email <strong className="text-stone-900 font-bold">{submittedEmail}</strong> recevra désormais la veille économique Amani chaque mercredi matin.
              </p>

              <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-4 max-w-md mx-auto mb-8 text-left text-xs space-y-2">
                <p className="text-stone-500 font-bold uppercase tracking-wider text-[10px]">Récapitulatif de vos préférences :</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPreferences.map((topic, i) => (
                    <span key={i} className="bg-white border border-stone-200 text-stone-700 px-2.5 py-1 rounded-lg font-semibold">
                      {topic}
                    </span>
                  ))}
                </div>
                {whatsappAlerts && (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold pt-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Alertes Flash WhatsApp activées ({phone})</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleResetForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#373B3A] hover:bg-black text-white font-bold rounded-xl transition-all text-xs sm:text-sm shadow-md"
                >
                  <RotateCcw className="w-4 h-4 text-[#9C8464]" />
                  Abonner une autre adresse email
                </button>
                <Link
                  to="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-stone-300 text-stone-700 hover:bg-stone-100 px-6 py-3 rounded-xl font-bold transition-all text-xs sm:text-sm"
                >
                  Retourner à l'accueil
                </Link>
              </div>
            </div>
          ) : (
            /* REGULAR FORM VIEW */
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-5 sm:p-10">
              <div className="text-center mb-6 sm:mb-10">
                <span className="inline-block bg-[#9C8464]/10 text-[#9C8464] text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-widest">
                  Étape 1 sur 2 · Personnalisation
                </span>
                <h2 className="text-xl sm:text-3xl font-extrabold text-[#373B3A] mb-2">
                  Choisissez vos sujets d'intérêt
                </h2>
                <p className="text-xs sm:text-base text-stone-500">
                  Sélectionnez les thématiques que vous souhaitez recevoir dans votre boîte mail
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="space-y-6 sm:space-y-8">
                {/* STEP 1: PREFERENCES FIRST */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Thématiques d'intérêt *
                    </label>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {selectedPreferences.length} sélectionnée(s)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {preferences.map((pref) => {
                      const isChecked = selectedPreferences.includes(pref.name);
                      return (
                        <div
                          key={pref.id}
                          onClick={() => handlePreferenceToggle(pref.name)}
                          className={`border rounded-xl p-3.5 cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                            isChecked
                              ? "border-[#9C8464] bg-[#9C8464]/10 shadow-sm"
                              : "border-stone-200 bg-stone-50/50 hover:border-stone-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handlePreferenceToggle(pref.name)}
                            className="mt-0.5 h-4 w-4 text-[#9C8464] focus:ring-[#9C8464] border-stone-300 rounded cursor-pointer shrink-0"
                          />
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-[#373B3A]">
                              {pref.label}
                            </div>
                            <div className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-snug">
                              {pref.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* STEP 2: OPTIONAL WHATSAPP ALERTS */}
                <div className="p-4 sm:p-5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-[#373B3A]">Recevoir aussi les alertes Flash sur WhatsApp</span>
                        <p className="text-[11px] sm:text-xs text-stone-500">Alertes urgentes sur les cours du Pétrole & Or (Optionnel)</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      id="whatsapp_toggle"
                      checked={whatsappAlerts}
                      onChange={(e) => setWhatsappAlerts(e.target.checked)}
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-stone-300 rounded cursor-pointer shrink-0"
                    />
                  </div>

                  {whatsappAlerts && (
                    <div className="pt-2 border-t border-stone-200">
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Numéro WhatsApp (avec indicatif pays ex: +223 ...) *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+223 70 00 00 00"
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>

                {/* STEP 3: EMAIL INPUT & FINAL VALIDATION */}
                <div className="pt-4 border-t border-stone-100">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Adresse email professionnelle pour l'envoi *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.email@exemple.com"
                      className="flex-1 px-4 py-3.5 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464] transition-all bg-stone-50/50 placeholder-stone-400"
                    />
                    <button
                      type="submit"
                      disabled={isSubscribing}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#373B3A] hover:bg-black text-white rounded-xl font-bold transition-all shadow-md text-xs sm:text-sm shrink-0 disabled:opacity-50"
                    >
                      {isSubscribing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Validation en cours...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-[#9C8464]" />
                          <span>Confirmer mon abonnement</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section - 2 COLUMNS ON MOBILE */}
      <section className="py-10 sm:py-16 bg-white border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#373B3A] mb-2">
              Pourquoi nous faire confiance ?
            </h2>
            <p className="text-xs sm:text-base text-stone-500 max-w-2xl mx-auto">
              Une couverture d'actualité rigoureuse, indépendante et orientée décision
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-stone-50 p-4 sm:p-6 rounded-2xl border border-stone-200/80 text-center flex flex-col items-center justify-between">
                <div>
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-stone-200 mx-auto mb-3">
                    <benefit.icon className="w-5 h-5 sm:w-7 sm:h-7 text-[#9C8464]" />
                  </div>
                  <h3 className="text-xs sm:text-base font-bold text-[#373B3A] mb-1.5 leading-snug">
                    {benefit.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="py-10 sm:py-16 bg-[#373B3A] text-white border-t border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-3xl font-extrabold mb-3">
            Gardez une longueur d'avance sur les marchés
          </h2>
          <p className="text-xs sm:text-base text-stone-300 max-w-2xl mx-auto mb-6 leading-relaxed">
            Abonnez-vous en 30 secondes et recevez la prochaine édition mercredi matin
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#subscribe-form"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#9C8464] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#867052] transition-colors text-xs sm:text-sm shadow-md"
            >
              <Mail className="w-4 h-4" />
              S'abonner à la newsletter
            </a>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-stone-700 text-stone-300 px-6 py-3 rounded-xl font-bold hover:bg-stone-800 hover:text-white transition-colors text-xs sm:text-sm"
            >
              <Bell className="w-4 h-4" />
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
