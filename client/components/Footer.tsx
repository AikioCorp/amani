import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, ArrowUpRight } from 'lucide-react';
import { FaLinkedin, FaTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Marché', path: '/marche' },
    { name: 'Économie', path: '/economie' },
    { name: 'Industrie', path: '/industrie' },
    { name: 'Investissement', path: '/investissement' },
    { name: 'Insights', path: '/insights' },
    { name: 'Tech', path: '/tech' },
    { name: 'Podcast', path: '/podcast' }
  ];

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'info@amani-finance.com',
      link: 'mailto:info@amani-finance.com'
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: '+223 20 22 45 67',
      link: 'tel:+22320224567'
    },
    {
      icon: MapPin,
      label: 'Adresse',
      value: 'Faladie, Bamako, Mali',
      link: '#'
    }
  ];

  const socialLinks = [
    { name: 'LinkedIn', url: '#', icon: FaLinkedin },
    { name: 'Twitter', url: '#', icon: FaTwitter },
    { name: 'Facebook', url: '#', icon: FaFacebook },
    { name: 'WhatsApp', url: '#', icon: FaWhatsapp }
  ];

  return (
    <footer className="bg-[#373B3A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fa7441c9084eb43e6855cf7e960c5c609%2F6ebebc1a91e8447db48a68aa5b391a28?format=webp&width=800"
                alt="Amani Finance"
                className="h-10 w-auto"
              />
              <div>
                <div className="text-xl font-bold text-white">Amani Finance</div>
                <div className="text-sm text-gray-300">Économie & Finance Africaine</div>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              Votre plateforme de référence pour l'information économique et financière en Afrique. 
              Nous rendons l'information digestible et accessible à tous.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Suivez-nous:</span>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                <a
                  key={social.name}
                  href={social.url}
                  className="w-10 h-10 flex items-center justify-center text-[#857053] hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <Icon className="w-5 h-5" />
                </a>
              )})}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Navigation</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Contact</h3>
            <ul className="space-y-4">
              {contactInfo.map((contact) => (
                <li key={contact.label}>
                  <a
                    href={contact.link}
                    className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors group"
                  >
                    <contact.icon className="w-5 h-5 mt-0.5 text-[#E5DDD5] group-hover:text-white transition-colors" />
                    <div>
                      <div className="text-sm text-gray-400">{contact.label}</div>
                      <div className="font-medium">{contact.value}</div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>

            {/* Newsletter Signup */}
            <div className="mt-8 p-4 bg-gray-700 rounded-lg">
              <h4 className="text-sm font-semibold mb-3 text-white">Newsletter</h4>
              <p className="text-xs text-gray-300 mb-3">
                Recevez nos analyses directement dans votre boîte mail
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-3 py-2 bg-gray-600 text-white placeholder-gray-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E5DDD5]"
                />
                <button className="px-3 py-2 bg-[#E5DDD5] text-[#373B3A] rounded text-sm font-medium hover:bg-[#E5DDD2] transition-colors">
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-400">
              <div>© {currentYear} Amani Finance. Tous droits réservés.</div>
              <div className="flex items-center gap-1">
                Créé avec <Heart className="w-4 h-4 text-red-500 fill-current" /> par 
                <a 
                  href="https://www.aikio.co" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#E5DDD5] hover:text-white font-medium ml-1 transition-colors"
                >
                  Aikio Corp SAS
                </a>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                À propos
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Conditions (CGU)
              </Link>
              <Link to="/confidentialite" className="text-gray-400 hover:text-white transition-colors">
                Confidentialité
              </Link>
              <Link to="/mentions-legales" className="text-gray-400 hover:text-white transition-colors">
                Mentions légales
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
