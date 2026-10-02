import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import {
  Mic,
  Plus,
  Edit,
  Eye,
  ExternalLink,
  Headphones,
  Play,
  Users,
  Clock,
} from "lucide-react";

export default function PodcastPublicManagement() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  if (!user || !hasPermission("create_podcasts")) {
    return (
      <DashboardLayout title="Accès refusé">
        <div className="text-center py-12">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retour
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { label: "Épisodes Publiés", value: "48", icon: Mic, bg: "bg-purple-100" },
    { label: "Heures d'Écoute", value: "1.2K", icon: Clock, bg: "bg-blue-100" },
    { label: "Abonnés", value: "3.4K", icon: Users, bg: "bg-green-100" },
    {
      label: "Taux d'Écoute",
      value: "78%",
      icon: Headphones,
      bg: "bg-orange-100",
    },
  ];

  const sections = [
    "Podcast à la Une",
    "Derniers Épisodes",
    "Séries Populaires",
    "Archives",
    "Invités Vedettes",
  ];

  return (
    <DashboardLayout
      title="Gestion Page Podcast Publique"
      subtitle="Gérez la vitrine publique de vos podcasts"
      actions={
        <div className="flex gap-4">
          <button
            onClick={() => window.open("/podcast", "_blank")}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <ExternalLink className="w-4 h-4" />
            Voir la page
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg">
            <Plus className="w-4 h-4" />
            Mettre en avant
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Sections Page Podcast</h2>
          </div>
          <div className="divide-y">
            {sections.map((section, index) => (
              <div
                key={index}
                className="p-6 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <Mic className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-medium">{section}</h3>
                    <p className="text-sm text-gray-600">
                      Configuration de l'affichage public
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
