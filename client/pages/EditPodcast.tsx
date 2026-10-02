import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { usePodcasts, Podcast } from "../hooks/usePodcasts";
// DashboardLayout removed: page now renders inside persistent DashboardShell
import UnifiedContentForm from "../components/UnifiedContentForm";
import { ArrowLeft, Mic, AlertCircle, Loader } from "lucide-react";

export default function EditPodcast() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { success, error } = useToast();
  const { fetchPodcastByIdOrSlug, updatePodcast } = usePodcasts();

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Vérification des permissions
  if (!user || !hasPermission("manage_podcasts")) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour modifier des podcasts.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // Charger les données du podcast
  useEffect(() => {
    const loadPodcast = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("🔍 Chargement du podcast avec ID:", id);

        const data = await fetchPodcastByIdOrSlug(id);

        if (!data) {
          throw new Error('Podcast non trouvé');
        }

        console.log("✅ Podcast récupéré:", data);
        setPodcast(data);
      } catch (err) {
        console.error("❌ Erreur lors du chargement du podcast:", err);
        error("Erreur", "Impossible de charger les données du podcast.");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadPodcast();
  }, [id]);

  // Gestion de la sauvegarde
  const handleSave = async (formData: any) => {
    if (!id) {
      error("Erreur", "ID du podcast manquant");
      return;
    }

    try {
      console.log("🚀 Mise à jour du podcast:", formData);
      await updatePodcast(id, formData);
      success("Succès", "Podcast mis à jour avec succès !");
      
      // Recharger les données du podcast après la sauvegarde
      const updatedPodcast = await fetchPodcastByIdOrSlug(id);
      console.log("🔄 Podcast rechargé après sauvegarde:", updatedPodcast);
      setPodcast(updatedPodcast);
      
    } catch (err) {
      console.error("❌ Erreur lors de la mise à jour:", err);
      error("Erreur", "Une erreur est survenue lors de la mise à jour du podcast.");
    }
  };

  // Gestion de l'annulation
  const handleCancel = () => {
    navigate("/dashboard/podcasts");
  };

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données du podcast...</p>
        </div>
      </div>
    );
  }

  // Podcast non trouvé
  if (notFound || !podcast) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
        <div className="text-center">
          <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Podcast introuvable</h2>
          <p className="text-gray-600 mb-6">Le podcast avec l'ID "{id}" n'a pas été trouvé.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/dashboard/podcasts")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour aux podcasts
            </button>
            <button
              onClick={() => navigate("/dashboard/podcasts/new")}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Créer un podcast
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <UnifiedContentForm
        type="podcast"
        initialData={{
          ...podcast,
          category: podcast?.categories?.slug || podcast?.category_id,
          published_at: podcast?.published_at ? podcast.published_at.split('T')[0] : undefined,
        } as any}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
