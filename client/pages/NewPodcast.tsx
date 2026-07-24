import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { usePodcasts } from "../hooks/usePodcasts";
import { useContentCategories } from "../hooks/useContentCategories";
import UnifiedContentForm from "../components/UnifiedContentForm";
import { ArrowLeft, Mic, AlertCircle } from "lucide-react";

export default function NewPodcast() {
  const { user, hasPermission } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const { createPodcast } = usePodcasts();
  const { categories } = useContentCategories();

  // Check permissions
  if (!user || !hasPermission("create_podcasts")) {
    return (
      <>
        <div className="flex items-center justify-center py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Accès refusé
            </h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas les permissions nécessaires pour créer des
              podcasts.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </>
    );
  }

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      console.log("🎧 Création d'un nouveau podcast:", formData);

      // Convertir le slug de catégorie en UUID
      const selectedCategory = categories.find(cat => cat.slug === formData.category);
      const categoryId = selectedCategory?.id;
      
      if (!categoryId && formData.category) {
        throw new Error(`Catégorie introuvable pour le slug: ${formData.category}`);
      }
      
      console.log('🏷️ Conversion catégorie:', { slug: formData.category, uuid: categoryId });

      const podcastData = {
        type: 'podcast' as const,
        title: formData.title,
        slug: formData.slug,
        summary: formData.summary,
        description: formData.description,
        content: formData.content,
        status: formData.status,
        is_premium: Boolean(formData.is_premium),
        category_id: categoryId,
        author_id: user?.id || '',
        country: formData.country,
        tags: formData.tags,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        featured_image: formData.featured_image,
        featured_image_alt: formData.featured_image_alt,
        published_at: formData.published_at,
        podcast_data: formData.podcast_data || {},
        // Champs requis par l'interface Podcast
        views: 0,
        likes: 0,
        shares: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const newPodcast = await createPodcast(podcastData);

      success(
        "Podcast créé",
        `Le podcast "${formData.title}" a été créé avec succès.`,
      );

      navigate("/dashboard/podcasts");
    } catch (err) {
      console.error("❌ Erreur lors de la création:", err);
      error(
        "Erreur",
        "Une erreur est survenue lors de la création du podcast.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/podcasts");
  };

  return (
    <div className="w-full">
      <UnifiedContentForm
        type="podcast"
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
