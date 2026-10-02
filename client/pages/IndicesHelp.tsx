import React from "react";
import {
  BookOpen,
  BarChart3,
  Globe,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  Settings,
  Eye,
  Play,
  CheckCircle,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

export default function IndicesHelp() {
  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* En-tête */}
        <div className="text-center">
          <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Guide complet de la gestion des indices
          </h1>
          <p className="text-xl text-gray-600">
            Tout ce que vous devez savoir pour gérer facilement les indices
            économiques de votre site
          </p>
        </div>

        {/* Section 1: Qu'est-ce qu'un indice */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            1. Qu'est-ce qu'un indice économique ?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <BarChart3 className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="text-lg font-bold text-green-900 mb-3">
                Indices Boursiers
              </h3>
              <p className="text-green-800 text-sm mb-3">
                Comme un thermomètre pour la bourse. Plus c'est haut, mieux
                l'économie se porte.
              </p>
              <ul className="text-green-700 text-xs space-y-1">
                <li>• BRVM Composite = santé économique ouest-africaine</li>
                <li>• Si il monte → entreprises vont bien</li>
                <li>• Si il baisse → attention, difficultés</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
              <Globe className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="text-lg font-bold text-orange-900 mb-3">
                Matières Premières
              </h3>
              <p className="text-orange-800 text-sm mb-3">
                Prix des ressources naturelles qui influencent directement votre
                quotidien.
              </p>
              <ul className="text-orange-700 text-xs space-y-1">
                <li>• Or ↑ = gens cherchent sécurité</li>
                <li>• Pétrole ↑ = transport plus cher</li>
                <li>• Cacao ↑ = revenus agriculteurs ivoiriens</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
              <DollarSign className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-bold text-purple-900 mb-3">
                Indicateurs Économiques
              </h3>
              <p className="text-purple-800 text-sm mb-3">
                Données clés qui montrent la santé économique d'un pays ou
                région.
              </p>
              <ul className="text-purple-700 text-xs space-y-1">
                <li>• Inflation = augmentation des prix</li>
                <li>• Taux BCEAO = coût de l'argent</li>
                <li>• FCFA/EUR = valeur de notre monnaie</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Comment ça marche dans le système */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-500" />
            2. Comment fonctionne la gestion dans votre dashboard
          </h2>

          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-blue-900 mb-4">
                🎯 Ce que VOUS devez faire :
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Informations de base :
                  </h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>✏️ Donner un nom (ex: "Or", "BRVM Composite")</li>
                    <li>📊 Indiquer la valeur actuelle (ex: 185.42)</li>
                    <li>📈 Dire si ça a monté (+4.28) ou baissé (-2.15)</li>
                    <li>📝 Expliquer ce que c'est en termes simples</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Optionnel :
                  </h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>🏷️ Symbole technique (XAU/USD, BRVM...)</li>
                    <li>📐 Unité (once troy, USD/baril...)</li>
                    <li>📡 Source des données (COMEX, BCEAO...)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-green-900 mb-4">
                ✨ Ce qui se fait AUTOMATIQUEMENT :
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">
                    Calculs automatiques :
                  </h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>
                      🧮 <strong>Pourcentage :</strong> Calculé selon valeur +
                      variation
                    </li>
                    <li>
                      🎨 <strong>Couleur :</strong> Vert si positif, Rouge si
                      négatif
                    </li>
                    <li>
                      ⏰ <strong>Date de mise à jour :</strong> Maintenant
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">
                    Affichage intelligent :
                  </h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>
                      📱 <strong>Responsive :</strong> S'adapte mobile/desktop
                    </li>
                    <li>
                      🎯 <strong>Icônes :</strong> Flèches haut/bas automatiques
                    </li>
                    <li>
                      🏷️ <strong>Catégories :</strong> Couleurs selon le type
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Guide étape par étape */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Play className="w-6 h-6 text-green-500" />
            3. Guide étape par étape
          </h2>

          <div className="space-y-6">
            {[
              {
                step: 1,
                title: "Ajouter un nouvel indice",
                description:
                  "Cliquez sur 'Ajouter un indice' et choisissez la catégorie",
                color: "blue",
              },
              {
                step: 2,
                title: "Remplir les informations essentielles",
                description:
                  "Nom, valeur actuelle, et variation (+/-). Le système calcule le pourcentage automatiquement",
                color: "green",
              },
              {
                step: 3,
                title: "Ajouter une description",
                description:
                  "Expliquez en termes simples ce que représente cet indice pour les visiteurs",
                color: "purple",
              },
              {
                step: 4,
                title: "Sauvegarder et vérifier",
                description:
                  "L'indice apparaît immédiatement sur votre site. Cliquez 'Voir sur le site' pour vérifier",
                color: "orange",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white bg-${item.color}-500`}
                >
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Exemples concrets */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Calculator className="w-6 h-6 text-purple-500" />
            4. Exemples concrets
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">
                📊 Exemple : Indice BRVM
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vous saisissez :</span>
                  <span className="font-medium">Vous saisissez :</span>
                </div>
                <div className="flex justify-between">
                  <span>• Nom :</span>
                  <span>"BRVM Composite"</span>
                </div>
                <div className="flex justify-between">
                  <span>• Valeur :</span>
                  <span>"185.42"</span>
                </div>
                <div className="flex justify-between">
                  <span>• Variation :</span>
                  <span>"+4.28"</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between">
                  <span className="text-green-600">Le système calcule :</span>
                  <span className="font-medium text-green-600">
                    Le système calcule :
                  </span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>• Pourcentage :</span>
                  <span>"+2.36%"</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>• Couleur :</span>
                  <span>"Vert (positif)"</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">
                🥇 Exemple : Prix de l'Or
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vous saisissez :</span>
                  <span className="font-medium">Vous saisissez :</span>
                </div>
                <div className="flex justify-between">
                  <span>• Nom :</span>
                  <span>"Or"</span>
                </div>
                <div className="flex justify-between">
                  <span>• Valeur :</span>
                  <span>"2025.50"</span>
                </div>
                <div className="flex justify-between">
                  <span>• Variation :</span>
                  <span>"-15.20"</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between">
                  <span className="text-red-600">Le système calcule :</span>
                  <span className="font-medium text-red-600">
                    Le système calcule :
                  </span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>• Pourcentage :</span>
                  <span>"-0.74%"</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>• Couleur :</span>
                  <span>"Rouge (négatif)"</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Conseils et bonnes pratiques */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            5. Conseils et bonnes pratiques
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-green-900 mb-4">
                ✅ À faire :
              </h3>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Utilisez des noms simples et clairs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Mettez à jour régulièrement les valeurs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Expliquez l'impact sur l'économie locale</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Utilisez + pour les hausses, - pour les baisses</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-red-900 mb-4">
                ❌ À éviter :
              </h3>
              <ul className="space-y-2 text-red-700">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500">
                    ✗
                  </span>
                  <span>Noms trop techniques pour les débutants</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500">
                    ✗
                  </span>
                  <span>Oublier de mettre le signe + ou -</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500">
                    ✗
                  </span>
                  <span>Descriptions trop courtes ou absentes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500">
                    ✗
                  </span>
                  <span>Calculer manuellement les pourcentages</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-blue-100 mb-6">
            Maintenant que vous comprenez comment ça marche, vous pouvez gérer
            vos indices facilement !
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/dashboard/indices-management"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Gérer les indices
            </a>
            <a
              href="/dashboard/commodities-management"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              <Globe className="w-5 h-5" />
              Gérer les commodités
            </a>
            <a
              href="/indices"
              target="_blank"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Voir sur le site
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
