import { Link } from "react-router-dom";
import {
  Globe,
  Users,
  Target,
  Award,
  BarChart3,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Heart,
  Shield,
  Eye,
  CheckCircle,
  Building,
  Handshake,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Eye,
      title: "Transparence",
      description:
        "Nous fournissons des informations claires et vérifiées, avec sources et méthodologies explicites.",
    },
    {
      icon: Shield,
      title: "Fiabilité",
      description:
        "Nos analyses reposent sur des données officielles et des sources reconnues par les institutions régionales.",
    },
    {
      icon: Heart,
      title: "Engagement",
      description:
        "Nous servons les communautés du Sahel et du Tchad en leur donnant accès à l'information économique.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "Nous utilisons les technologies modernes pour rendre l'information économique accessible à tous.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#E5DDD2]">
      {/* Hero Section */}
      <section className="bg-amani-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              À propos d'Amani
            </h1>
            <p className="text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto">
              Votre source de référence pour l'information économique et
              financière de la région du Sahel et du Tchad
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-amani-primary mb-6">
              Notre mission
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Amani démocratise l'accès à l'information économique en Afrique
              de l'Ouest et au Tchad. Nous croyons que l'information de
              qualité est un pilier essentiel du développement économique.
            </p>
            <p className="text-lg text-gray-700 mb-8">
              Notre plateforme rassemble, analyse et diffuse les données
              économiques les plus pertinentes pour aider les professionnels,
              entrepreneurs et décideurs à prendre des décisions éclairées.
            </p>
            <div className="flex items-center gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">
                Information vérifiée et actualisée quotidiennement
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">
                Analyses approfondies par des experts locaux
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">
                Plateforme accessible en français et bientôt en langues
                locales
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-amani-primary mb-4">
              Nos valeurs
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Les principes qui guident notre mission et notre engagement envers
              les communautés que nous servons
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-[#E5DDD2] border border-white/50 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-amani-primary rounded-full flex items-center justify-center">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-amani-primary mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-amani-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Contactez-nous
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Vous avez une question, une suggestion ou souhaitez devenir
              partenaire ? Nous sommes à votre écoute.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-gray-200">contact@amani.demo</p>
              <p className="text-gray-200">info@amani.demo</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Téléphone</h3>
              <p className="text-gray-200">+223 20 XX XX XX</p>
              <p className="text-gray-200">+226 25 XX XX XX</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Adresse</h3>
              <p className="text-gray-200">Bamako, Mali</p>
              <p className="text-gray-200">Ouagadougou, Burkina Faso</p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-amani-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Nous contacter
              <Mail className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
