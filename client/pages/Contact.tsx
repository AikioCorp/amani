import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, ArrowRight, Clock, Building } from 'lucide-react';

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
    { id: 'partnership', name: 'Partenariat' },
    { id: 'press', name: 'Presse & Média' },
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
      await new Promise(resolve => setTimeout(resolve, 2000));
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
      <div className="lg:w-2/5 bg-[#1C1E1D] text-white p-8 md:p-16 lg:p-20 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-96 h-96 bg-[#9C8464] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-5xl lg:text-6xl font-black mb-6 tracking-tight text-white leading-tight">
            Contactez-<br/>Nous.
          </h1>
          <p className="text-xl text-gray-400 font-light mb-16 max-w-md">
            Une idée, un projet économique ou une question ? Notre équipe d'experts est prête à vous accompagner.
          </p>

          <div className="space-y-12">
            <div className="group flex items-start space-x-5">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#9C8464] transition-colors duration-500">
                <Mail className="h-5 w-5 text-[#9C8464] group-hover:text-white transition-colors duration-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Email</p>
                <a href="mailto:info@amani-finance.com" className="text-lg text-white hover:text-[#9C8464] transition-colors">info@amani-finance.com</a>
                <p className="text-sm text-gray-400 mt-1">Nous répondons sous 24h</p>
              </div>
            </div>

            <div className="group flex items-start space-x-5">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#9C8464] transition-colors duration-500">
                <Phone className="h-5 w-5 text-[#9C8464] group-hover:text-white transition-colors duration-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Téléphone</p>
                <a href="tel:+22320224567" className="text-lg text-white hover:text-[#9C8464] transition-colors">+223 20 22 45 67</a>
                <p className="text-sm text-gray-400 mt-1">Lun-Ven, 9h-18h GMT</p>
              </div>
            </div>

            <div className="group flex items-start space-x-5">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#9C8464] transition-colors duration-500">
                <MapPin className="h-5 w-5 text-[#9C8464] group-hover:text-white transition-colors duration-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Siège Social</p>
                <p className="text-lg text-white">Faladie, Bamako, Mali</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-20 pt-10 border-t border-white/10">
          <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-4">Notre Philosophie</p>
          <p className="text-gray-400 font-light italic">
            "Le développement économique durable commence par des partenariats solides et une communication transparente."
          </p>
        </div>
      </div>

      {/* Right Column: Modern Form */}
      <div className="lg:w-3/5 p-8 md:p-16 lg:p-24 flex items-center justify-center bg-white relative">
        <div className="w-full max-w-2xl">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Envoyez votre message</h2>
          <p className="text-gray-500 mb-12">Remplissez le formulaire ci-dessous. Tous les champs marqués d'un * sont obligatoires.</p>

          {submitStatus === 'success' && (
            <div className="mb-10 p-5 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
              <p className="text-green-800 font-medium">
                ✅ Votre message a été envoyé avec succès ! Notre équipe vous répondra très prochainement.
              </p>
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mb-10 p-5 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-800 font-medium">
                ❌ Une erreur s'est produite lors de l'envoi. Veuillez réessayer.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="relative group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-gray-900 focus:outline-none focus:border-[#9C8464] transition-colors peer placeholder-transparent"
                  placeholder="Nom complet"
                />
                <label htmlFor="name" className="absolute left-0 -top-4 text-xs font-bold text-gray-500 uppercase tracking-widest peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#9C8464] transition-all">
                  Nom complet *
                </label>
              </div>

              <div className="relative group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-gray-900 focus:outline-none focus:border-[#9C8464] transition-colors peer placeholder-transparent"
                  placeholder="Email"
                />
                <label htmlFor="email" className="absolute left-0 -top-4 text-xs font-bold text-gray-500 uppercase tracking-widest peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#9C8464] transition-all">
                  Adresse Email *
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="relative group">
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-gray-900 focus:outline-none focus:border-[#9C8464] transition-colors peer placeholder-transparent"
                  placeholder="Entreprise"
                />
                <label htmlFor="company" className="absolute left-0 -top-4 text-xs font-bold text-gray-500 uppercase tracking-widest peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#9C8464] transition-all">
                  Entreprise (Optionnel)
                </label>
              </div>

              <div className="relative group">
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-gray-900 focus:outline-none focus:border-[#9C8464] transition-colors appearance-none cursor-pointer"
                >
                  {contactTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                <label htmlFor="type" className="absolute left-0 -top-4 text-xs font-bold text-[#9C8464] uppercase tracking-widest">
                  Type de demande *
                </label>
              </div>
            </div>

            <div className="relative group">
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-gray-900 focus:outline-none focus:border-[#9C8464] transition-colors peer placeholder-transparent"
                placeholder="Sujet"
              />
              <label htmlFor="subject" className="absolute left-0 -top-4 text-xs font-bold text-gray-500 uppercase tracking-widest peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#9C8464] transition-all">
                Sujet de votre message *
              </label>
            </div>

            <div className="relative group">
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-gray-900 focus:outline-none focus:border-[#9C8464] transition-colors peer placeholder-transparent resize-none"
                placeholder="Message"
              />
              <label htmlFor="message" className="absolute left-0 -top-4 text-xs font-bold text-gray-500 uppercase tracking-widest peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#9C8464] transition-all">
                Votre Message *
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-[#1C1E1D] overflow-hidden rounded-full hover:bg-[#9C8464] transition-all duration-300 w-full sm:w-auto min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Envoi...
                  </>
                ) : (
                  <>
                    <span className="mr-2 uppercase tracking-wider text-sm">Envoyer le message</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
