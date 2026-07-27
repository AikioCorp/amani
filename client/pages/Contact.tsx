import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, ArrowRight, Clock, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import { DynamicLegalPage } from '../components/DynamicLegalPage';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    type: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const contactTypes = [
    { id: 'general', name: 'Question Générale' },
    { id: 'partnership', name: 'Partenariat & Investissement' },
    { id: 'press', name: 'Presse & Médias' },
    { id: 'technical', name: 'Support Technique' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FDFBF9]">
      {/* Left Column: Dark Info Section */}
      <div className="lg:w-2/5 bg-[#373B3A] text-white p-6 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle Decorative Circle */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-96 h-96 bg-[#9C8464] rounded-full blur-[120px] opacity-15 pointer-events-none"></div>

        <div className="relative z-10">
          <span className="inline-block bg-[#9C8464]/20 border border-[#9C8464]/40 text-[#E5DDD5] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
            Contact & Support
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 tracking-tight text-white leading-tight">
            Contactez-<br className="hidden sm:block"/>Nous.
          </h1>
          <p className="text-sm sm:text-lg text-stone-300 font-normal mb-8 sm:mb-12 max-w-md leading-relaxed">
            Une idée, un projet d'investissement ou une question ? Notre équipe d'experts est prête à vous répondre.
          </p>

          <div className="space-y-6 sm:space-y-8">
            <div className="group flex items-start space-x-4 sm:space-x-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-stone-800/80 border border-stone-700/80 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#9C8464] transition-colors duration-300">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[#9C8464] group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-widest font-bold mb-0.5">Email</p>
                <a href="mailto:info@amani-finance.com" className="text-sm sm:text-lg font-bold text-white hover:text-[#9C8464] transition-colors break-all sm:break-normal">
                  info@amani-finance.com
                </a>
                <p className="text-xs text-stone-400 mt-0.5">Réponse garantie sous 24h</p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 sm:space-x-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-stone-800/80 border border-stone-700/80 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#9C8464] transition-colors duration-300">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#9C8464] group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-widest font-bold mb-0.5">Téléphone</p>
                <a href="tel:+22320224567" className="text-sm sm:text-lg font-bold text-white hover:text-[#9C8464] transition-colors">
                  +223 20 22 45 67
                </a>
                <p className="text-xs text-stone-400 mt-0.5">Lun - Ven, 9h-18h GMT</p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 sm:space-x-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-stone-800/80 border border-stone-700/80 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#9C8464] transition-colors duration-300">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#9C8464] group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-widest font-bold mb-0.5">Siège Social</p>
                <p className="text-sm sm:text-lg font-bold text-white">Faladié, Bamako, Mali</p>
                <p className="text-xs text-stone-400 mt-0.5">Espace UEMOA & Sahel</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 sm:mt-16 pt-6 border-t border-stone-800">
          <p className="text-[10px] sm:text-xs text-[#9C8464] uppercase tracking-widest font-bold mb-2">Notre Philosophie</p>
          <p className="text-xs sm:text-sm text-stone-300 font-light italic leading-relaxed">
            "Le développement économique commence par des partenariats solides et une communication transparente."
          </p>
        </div>
      </div>

      {/* Right Column: Modern Responsive Form */}
      <div className="lg:w-3/5 p-5 sm:p-12 lg:p-16 flex items-center justify-center bg-white relative">
        <div className="w-full max-w-2xl">
          <h2 className="text-xl sm:text-3xl font-extrabold text-[#373B3A] mb-2">
            Envoyez-nous un message
          </h2>
          <DynamicLegalPage slug="contact" defaultContent={null} />

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Votre message a été envoyé avec succès ! Notre équipe vous répondra très prochainement.</span>
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Une erreur s'est produite lors de l'envoi. Veuillez réessayer.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Amadou Diallo"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464] transition-all placeholder-stone-400"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Adresse Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="nom@exemple.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464] transition-all placeholder-stone-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <label htmlFor="company" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Entreprise (Optionnel)
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Ex: Sahel Tech Corp"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464] transition-all placeholder-stone-400"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-xs font-bold text-[#9C8464] uppercase tracking-wider mb-2">
                  Type de demande *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464] transition-all cursor-pointer"
                >
                  {contactTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Sujet de votre message *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Ex: Demande de due diligence pour projet agricole"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464] transition-all placeholder-stone-400"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Votre Message *
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Décrivez précisément votre projet ou votre demande..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9C8464]/30 focus:border-[#9C8464] transition-all placeholder-stone-400 resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 font-bold text-white bg-[#373B3A] hover:bg-black rounded-xl transition-all duration-300 shadow-md text-xs sm:text-sm gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#9C8464]" />
                    <span className="uppercase tracking-wider">Envoyer le message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
