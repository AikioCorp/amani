import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useArticles } from "../hooks/useArticles";
import UnifiedContentForm from "../components/UnifiedContentForm";
import { ArrowLeft, FileText, AlertCircle } from "lucide-react";

export default function NewArticle() {
  const { user, hasPermission } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const { createArticle } = useArticles();

  // Check permissions
  if (!user || !hasPermission("create_articles")) {
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
              articles.
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
      console.log(" Création d'un nouvel article:", formData);

      const articleData = {
        type: 'article' as const,
        title: formData.title,
        slug: formData.slug,
        summary: formData.summary,
        description: formData.description,
        content: formData.content,
        status: formData.status,
        is_premium: Boolean(formData.is_premium),
        category_id: formData.category,
        author_id: user?.id || '',
        country: formData.country,
        tags: formData.tags,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        // Important: conserver l'URL publique de l'image renvoyée par le formulaire unifié
        featured_image: formData.featured_image,
        featured_image_alt: formData.featured_image_alt,
        published_at: formData.published_at,
        article_data: formData.article_data || {}
      };

      console.log('🖼️ featured_image utilisé pour la création:', articleData.featured_image);
      const newArticle = await createArticle(articleData);

      success(
        "Article créé",
        `L'article "${formData.title}" a été créé avec succès.`,
      );

      navigate("/dashboard/articles");
    } catch (err) {
      console.error(" Erreur lors de la création:", err);
      error(
        "Erreur",
        "Une erreur est survenue lors de la création de l'article.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/articles");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Créer un nouvel article</h1>
          <p className="text-gray-600">Rédigez un article pour informer votre audience</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/articles")}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
      </div>
      <div className="w-full">
        {/* Formulaire unifié pour articles */}
        <UnifiedContentForm
          type="article"
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </>
  );
}
