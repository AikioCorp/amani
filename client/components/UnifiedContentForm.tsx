import React, { useState, useEffect, useRef } from "react";
import { getApiUrl } from "../services/apiConfig";
import { getSessionToken } from "../services/authService";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FileText, Mic, BarChart3, Plus, X, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  ContentType,
  UnifiedContent,
  ArticleData,
  PodcastData,
  IndiceData,
} from "../types/database";
import ImageUpload from "./ImageUpload";
import {
  Save,
  Eye,
  Calendar,
  Tag,
  Globe,
  CheckCircle,
  Share2,
  Link2,
  Image as ImageIcon,
  Sparkles,
  Video,
} from "lucide-react";

interface UnifiedContentFormProps {
  type: ContentType;
  initialData?: Partial<UnifiedContent>;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

function parseCategorySlug(data: any): string {
  if (!data) return "";
  if (data.category_info && typeof data.category_info === "object") {
    return data.category_info.slug || "";
  }
  if (data.category && typeof data.category === "object") {
    return data.category.slug || data.category.name || "";
  }
  if (typeof data.category === "string") return data.category;
  return "";
}

function parseCategoryId(data: any): string {
  if (!data) return "";
  if (data.category_id && typeof data.category_id === "string") return data.category_id;
  if (data.category_info && typeof data.category_info === "object" && data.category_info.id) {
    return data.category_info.id;
  }
  if (data.category && typeof data.category === "object" && data.category.id) {
    return data.category.id;
  }
  return "";
}

function formatDatetimeLocal(val: any): string {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export default function UnifiedContentForm({
  type,
  initialData,
  onSave,
  onCancel,
}: UnifiedContentFormProps) {
  const { user, hasPermission } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(
    (initialData as any)?.featured_image || ""
  );

  const [formData, setFormData] = useState<any>(() => {
    const baseData: any = {
      title: "",
      slug: "",
      summary: "",
      description: "",
      content: "",
      status: "draft" as "draft" | "published",
      category: "",
      category_id: "",
      country: "mali",
      tags: [] as string[],
      meta_title: "",
      meta_description: "",
      featured_image: "",
      featured_image_alt: "",
      published_at: new Date().toISOString().slice(0, 10),
      article_data: {} as ArticleData,
      podcast_data: {} as PodcastData,
      indice_data: {} as IndiceData,
    };

    if (initialData) {
      const mergedData: any = { ...baseData };
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          mergedData[key] = value;
        }
      });
      mergedData.category = parseCategorySlug(initialData);
      mergedData.category_id = parseCategoryId(initialData) || mergedData.category_id;
      if (initialData.published_at) {
        mergedData.published_at = formatDatetimeLocal(initialData.published_at);
      }
      return mergedData;
    }

    return baseData;
  });

  useEffect(() => {
    if (initialData) {
      const derivedCategory = parseCategorySlug(initialData);
      const derivedCategoryId = parseCategoryId(initialData);
      const formattedPublishedAt = formatDatetimeLocal(initialData.published_at || (initialData as any).created_at);

      setFormData(prev => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(initialData).map(([key, value]) => [
            key,
            value === null ? "" : value
          ])
        ),
        category: derivedCategory || prev.category,
        category_id: derivedCategoryId || prev.category_id,
        published_at: formattedPublishedAt || prev.published_at,
      }) as any);

      if ((initialData as any)?.featured_image) {
        setCurrentImageUrl((initialData as any).featured_image);
      }
    }
  }, [initialData]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [customImagePrompt, setCustomImagePrompt] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState<"audio_url" | "video_url" | null>(null);

  // Upload direct d'un fichier audio ou vidéo (podcast) — aucun traitement IA,
  // le fichier est stocké tel quel et son URL remplit le champ de lien correspondant.
  const handleMediaFileUpload = async (
    file: File,
    field: "audio_url" | "video_url",
  ) => {
    setUploadingMedia(field);
    try {
      const token = getSessionToken();
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(getApiUrl("/upload/media"), {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body,
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Échec de l'upload du fichier.");
      }
      handleSpecificDataChange(field, result.data.url);
      success(
        "Fichier envoyé",
        `${field === "audio_url" ? "Audio" : "Vidéo"} téléversé avec succès.`,
      );
    } catch (err: any) {
      error("Erreur d'upload", err.message || "Impossible d'envoyer le fichier.");
    } finally {
      setUploadingMedia(null);
    }
  };

  const handleSearchNewImageAI = async (overridePrompt?: string) => {
    const searchTerm = overridePrompt || customImagePrompt || formData.title;
    if (!searchTerm) {
      error("Titre ou recherche requis", "Veuillez saisir un sujet ou titre d'article avant de rechercher une image.");
      return;
    }
    setIsSearchingImage(true);
    try {
      const token = getSessionToken();
      const res = await fetch(getApiUrl("/news/enrich-image"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          customQuery: searchTerm,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.imageUrl) {
        setFormData(prev => ({ ...prev, featured_image: data.data.imageUrl }));
        setCurrentImageUrl(data.data.imageUrl);
        success("Image HD trouvée !", `Photo de presse HD attribuée pour "${searchTerm}".`);
      } else {
        throw new Error(data.error || "Impossible de trouver une image HD.");
      }
    } catch (err: any) {
      error("Erreur image", err.message || "Échec de la recherche d'image par IA.");
    } finally {
      setIsSearchingImage(false);
    }
  };

  const handleEnrichWithAI = async () => {
    if (!formData.title && !formData.summary && !(formData as any).article_data?.original_link) {
      error("Information insuffisante", "Veuillez remplir au moins le titre de l'article pour lancer la génération par l'IA.");
      return;
    }
    setIsEnriching(true);
    try {
      const token = getSessionToken();
      const response = await fetch(getApiUrl("/news/enrich"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          link: (formData as any).article_data?.original_link || ""
        })
      });
      const result = await response.json();
      if (response.ok && result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          title: result.data.title || prev.title,
          summary: result.data.summary || prev.summary,
          content: result.data.content || prev.content,
          meta_title: result.data.seo_title || prev.meta_title,
          meta_description: result.data.seo_description || prev.meta_description
        }));
        success("Génération IA réussie", "Le résumé professionnel et le contenu long ont été générés par l'IA.");
      } else {
        throw new Error(result.error || "Erreur d'enrichissement IA.");
      }
    } catch (err: any) {
      error("Erreur", err.message || "Impossible de générer le résumé par IA.");
    } finally {
      setIsEnriching(false);
    }
  };

  // Auto-génération du slug
  useEffect(() => {
    if (formData.title && !initialData) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 50);
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, initialData]);

  // Auto-génération méta-title si vide
  useEffect(() => {
    if (formData.title && !formData.meta_title) {
      setFormData((prev) => ({
        ...prev,
        meta_title: `${formData.title} | Amani Finance`,
      }));
    }
  }, [formData.title]);

  // Auto-génération méta-description depuis le résumé
  useEffect(() => {
    if (formData.summary && !formData.meta_description) {
      const metaDesc =
        formData.summary.substring(0, 150) +
        (formData.summary.length > 150 ? "..." : "");
      setFormData((prev) => ({ ...prev, meta_description: metaDesc }));
    }
  }, [formData.summary]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSpecificDataChange = (field: string, value: any) => {
    const dataKey = `${type}_data` as keyof typeof formData;
    setFormData((prev) => {
      const currentData = prev[dataKey];
      const existingData = currentData && typeof currentData === 'object' ? currentData : {};
      
      return {
        ...prev,
        [dataKey]: {
          ...existingData,
          [field]: value,
        },
      };
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // VALIDATION COMMUNE
    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis";
    }
    if (!formData.summary.trim()) {
      newErrors.summary = "Le résumé est requis";
    }
    if (!formData.category) {
      newErrors.category = "La catégorie est requise";
    }

    // VALIDATIONS SPÉCIFIQUES
    if (type === "article") {
      // Pas de validation spéciale pour l'article (contenu optionnel)
    } else if (type === "podcast") {
      const podcastData = formData.podcast_data as PodcastData;
      if (!podcastData.audio_url && !podcastData.video_url) {
        newErrors.podcast_url = "Au moins un lien audio ou vidéo est requis";
      }
    } else if (type === "indice") {
      const indiceData = formData.indice_data as IndiceData;
      if (!indiceData.symbol) {
        newErrors.indice_symbol = "Le symbole est requis";
      }
      if (!indiceData.current_value) {
        newErrors.indice_value = "La valeur actuelle est requise";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      error(
        "Erreur de validation",
        "Veuillez corriger les erreurs dans le formulaire.",
      );
      return;
    }

    setIsSaving(true);

    try {
      // Upload de l'image si un fichier local a été sélectionné
      let imageUrl = formData.featured_image;
      if (featuredImage) {
        try {
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(featuredImage);
          });

          const token = getSessionToken();
          const uploadRes = await fetch(getApiUrl("/upload"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({
              imageBase64: base64Data,
              filename: featuredImage.name,
            }),
          });

          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.success && uploadData.data?.url) {
            imageUrl = uploadData.data.url;
          } else {
            throw new Error(uploadData.error || "Impossible d'uploader l'image.");
          }
        } catch (imgError: any) {
          console.error("Erreur upload image:", imgError);
          error("Erreur d'image", imgError.message || "Impossible d'uploader l'image. Veuillez réessayer.");
          setIsSaving(false);
          return;
        }
      }

      // Préparer les données finales
      // Fallback: si category_id manquant mais slug présent, résoudre via la liste en mémoire
      const resolvedCategoryId = (formData as any).category_id
        || categories.find(c => c.slug === (formData as any).category)?.id
        || (formData as any).category_id; // garde la valeur si déjà présente

      const finalData = {
        ...formData,
        category_id: resolvedCategoryId,
        type,
        author_id: user?.id,
        featured_image: imageUrl,
      };

      await onSave(finalData);

      success(
        `${getTypeLabel()} ${formData.status === "published" ? "publié" : "sauvegardé"}`,
        `${getTypeLabel()} "${formData.title}" ${formData.status === "published" ? "publié" : "sauvegardé en brouillon"} avec succès.`,
      );
    } catch (err) {
      error("Erreur", "Une erreur est survenue lors de la sauvegarde.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "article":
        return "Article";
      case "podcast":
        return "Podcast";
      case "indice":
        return "Indice";
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "article":
        return <FileText className="w-6 h-6" />;
      case "podcast":
        return <Mic className="w-6 h-6" />;
      case "indice":
        return <BarChart3 className="w-6 h-6" />;
    }
  };

  // Charger les catégories dynamiquement depuis la base de données
  // Garder l'id (UUID) et le slug pour bien renseigner category_id
  const [categories, setCategories] = useState<{ id: string; slug: string; label: string }[]>([]);

  // Charger les catégories depuis la base de données
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('🔍 Chargement des catégories...');
        const apiUrl = getApiUrl("/categories");
        
        const resp = await fetch(apiUrl);
        if (!resp.ok) throw new Error("Erreur de récupération des catégories via l'API");
        
        const result = await resp.json();
        const data = result.data;
        
        console.log('📊 Catégories récupérées:', data);
        
        if (data && data.length > 0) {
          type CategoryRow = { id: string; name: string; slug: string };
          const rows = data as unknown as CategoryRow[];
          const mappedCategories = rows.map((cat) => ({
            id: cat.id,
            slug: cat.slug,
            label: cat.name,
          }));
          console.log('🏷️ Catégories mappées:', mappedCategories);
          setCategories(mappedCategories);
        } else {
          console.log('⚠️ Aucune catégorie trouvée, utilisation des catégories par défaut');
        }
      } catch (error) {
        console.error('Erreur chargement catégories:', error);
      }
    };
    
    console.log('🚀 Démarrage du chargement des catégories...');
    loadCategories();
  }, []);

  const countries = [
    { value: "mali", label: "Mali" },
    { value: "burkina", label: "Burkina Faso" },
    { value: "niger", label: "Niger" },
    { value: "senegal", label: "Sénégal" },
    { value: "cote-ivoire", label: "Côte d'Ivoire" },
    { value: "uemoa", label: "UEMOA" },
    { value: "afrique", label: "Afrique" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* EN-TÊTE UNIFIÉ */}
      <div className="border-b border-gray-200 pb-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="text-gray-900">
            {getTypeIcon()}
          </div>
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest">
            {initialData
              ? `Formulaire d'édition`
              : `Nouveau formulaire`}
          </h2>
        </div>
      </div>

      {/* INFORMATIONS PRINCIPALES */}
      <div className="bg-white border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
            Informations principales
          </h3>
        </div>

        <div className="space-y-8">
          {/* Titre */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Titre *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleInputChange}
              className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 text-lg font-medium transition-colors ${
                errors.title ? "border-red-500" : "border-gray-200 hover:border-gray-300"
              }`}
              placeholder={`Saisissez le titre ici...`}
            />
            {errors.title && (
              <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1 uppercase tracking-widest">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              URL (Slug)
            </label>
            <div className="flex items-center">
              <span className="text-gray-400 text-sm font-medium">amani-finance.com/</span>
              <input
                type="text"
                name="slug"
                value={formData.slug || ""}
                onChange={handleInputChange}
                className="flex-1 ml-1 px-0 py-2 border-0 border-b-2 border-gray-200 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors"
                placeholder="url-de-votre-contenu"
              />
            </div>
          </div>

          {/* Assistant Rédaction IA */}
          <div className="bg-gray-50 border border-gray-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-8">
            <div>
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-gray-900" />
                Assistant Rédaction IA
              </h4>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Générez un résumé professionnel complet et un article long structuré en un clic.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleEnrichWithAI}
              disabled={isEnriching}
              className="bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-none flex items-center gap-2 shrink-0 transition-colors"
            >
              {isEnriching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Génération par l'IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Générer Résumé & Contenu Long IA
                </>
              )}
            </Button>
          </div>

          {/* Résumé OBLIGATOIRE */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Résumé *
            </label>
            <textarea
              name="summary"
              value={formData.summary || ""}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-none focus:ring-0 focus:bg-gray-100 transition-colors resize-none ${
                errors.summary ? "border-b-2 border-red-500" : ""
              }`}
              placeholder="Un résumé percutant pour accrocher l'auditeur..."
            />
            {errors.summary && (
              <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1 uppercase tracking-widest">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.summary}
              </p>
            )}
            <p className="mt-2 text-[10px] uppercase tracking-widest text-gray-400">
              Utilisé pour l'extrait et le référencement (SEO).
            </p>
          </div>

          {/* Contenu complet (optionnel) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Notes / Description détaillée (Optionnel)
            </label>
            <textarea
              name="content"
              value={formData.content || ""}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-none focus:ring-0 focus:bg-gray-100 transition-colors"
              placeholder="Notes de l'épisode, transcription ou article long..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Catégorie */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                Catégorie *
              </label>
              <select
                name="category"
                value={formData.category || ""}
                onChange={(e) => {
                  const slug = e.target.value;
                  const found = categories.find(c => c.slug === slug);
                  console.log('🏷️ Catégorie sélectionnée:', slug, '→', found?.id);
                  setFormData((prev) => ({
                    ...prev,
                    category: slug,
                    // Renseigner l'UUID côté DB
                    category_id: found?.id || prev.category_id,
                  }));
                  // Clear error éventuel
                  if (errors.category) {
                    setErrors((prev) => ({ ...prev, category: "" }));
                  }
                }}
                className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors ${
                  errors.category ? "border-red-500" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Pays */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                Pays/Région
              </label>
              <select
                name="country"
                value={formData.country || "mali"}
                onChange={handleInputChange}
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 hover:border-gray-300 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors"
              >
                {countries.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Étiquettes */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Étiquettes
            </label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ajouter une étiquette"
                className="flex-1 px-0 py-2 border-0 border-b-2 border-gray-200 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <button
                type="button"
                onClick={addTag}
                className="px-6 py-2 bg-gray-900 text-white font-bold text-xs uppercase tracking-widest rounded-none hover:bg-black transition-colors"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE MISE EN AVANT */}
      <div className="bg-white border border-gray-200 p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
              Image mise en avant
            </h3>
          </div>
          {/* Recherche d'image par IA : non disponible pour les podcasts —
              la couverture est uploadée manuellement uniquement. */}
          {type !== "podcast" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSearchNewImageAI()}
              disabled={isSearchingImage || !formData.title}
              className="border-gray-900 text-gray-900 rounded-none hover:bg-gray-50 flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
            >
              {isSearchingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recherche HD en cours…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Rechercher par IA
                </>
              )}
            </Button>
          )}
        </div>
        {type !== "podcast" && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 flex flex-wrap gap-2 items-center">
            <input
              type="text"
              value={customImagePrompt}
              onChange={(e) => setCustomImagePrompt(e.target.value)}
              placeholder="Rechercher par sujet (ex: Seydou Keïta, Dangote, Banque Mali...)"
              className="flex-1 min-w-[200px] px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchNewImageAI();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleSearchNewImageAI()}
              disabled={isSearchingImage}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1.5"
            >
              {isSearchingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Rechercher cette image HD
            </Button>
          </div>
        )}

        <ImageUpload
          onImageSelect={(file) => {
            setFeaturedImage(file);
            if (file) {
              // Créer une URL temporaire pour l'aperçu
              const tempUrl = URL.createObjectURL(file);
              setCurrentImageUrl(tempUrl);
            }
          }}
          currentImage={currentImageUrl}
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texte alternatif (SEO)
          </label>
          <input
            type="text"
            name="featured_image_alt"
            value={formData.featured_image_alt || ""}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description de l'image pour l'accessibilité"
          />
        </div>
      </div>

      {/* DONNÉES SPÉCIFIQUES AU TYPE */}
      {type === "podcast" && (
        <div className="bg-white border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
              Podcast Audio & Vidéo
            </h3>
            <span className="bg-gray-100 text-gray-900 text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest">
              Liens externes
            </span>
          </div>

          <div className="space-y-8">
            {/* Type de contenu */}
            <div className="bg-gray-50 p-6 border border-gray-200 mb-8">
              <h4 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-widest">
                Format
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Vous pouvez lier un podcast audio, vidéo, ou les deux.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-xs text-gray-500 font-medium">
                  <span className="font-bold text-gray-900 uppercase tracking-widest">Audio :</span> Anchor, Spotify, Apple
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  <span className="font-bold text-gray-900 uppercase tracking-widest">Vidéo :</span> YouTube, Vimeo
                </div>
              </div>
            </div>

            {/* Liens principaux OU upload direct de fichier */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Audio Principal — lien ou fichier
                </label>
                <input
                  type="url"
                  value={formData.podcast_data.audio_url || ""}
                  onChange={(e) =>
                    handleSpecificDataChange("audio_url", e.target.value)
                  }
                  className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 hover:border-gray-300 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors"
                  placeholder="https://anchor.fm/votre-podcast"
                />
                <div className="mt-3 flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-gray-50 transition-colors">
                    {uploadingMedia === "audio_url" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mic className="w-3.5 h-3.5" />
                    )}
                    {uploadingMedia === "audio_url" ? "Envoi..." : "Téléverser un fichier audio"}
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      disabled={uploadingMedia !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMediaFileUpload(file, "audio_url");
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Vidéo Principale — lien ou fichier
                </label>
                <input
                  type="url"
                  value={formData.podcast_data.video_url || ""}
                  onChange={(e) =>
                    handleSpecificDataChange("video_url", e.target.value)
                  }
                  className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 hover:border-gray-300 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <div className="mt-3 flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-gray-50 transition-colors">
                    {uploadingMedia === "video_url" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Video className="w-3.5 h-3.5" />
                    )}
                    {uploadingMedia === "video_url" ? "Envoi..." : "Téléverser un fichier vidéo"}
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      disabled={uploadingMedia !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMediaFileUpload(file, "video_url");
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Plateformes supplémentaires */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-widest">
                Plateformes supplémentaires (optionnel)
              </h4>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Spotify
                  </label>
                  <input
                    type="url"
                    value={formData.podcast_data.spotify_url || ""}
                    onChange={(e) =>
                      handleSpecificDataChange("spotify_url", e.target.value)
                    }
                    className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 hover:border-gray-300 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors"
                    placeholder="https://open.spotify.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Apple Podcasts
                  </label>
                  <input
                    type="url"
                    value={formData.podcast_data.apple_url || ""}
                    onChange={(e) =>
                      handleSpecificDataChange("apple_url", e.target.value)
                    }
                    className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 hover:border-gray-300 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors"
                    placeholder="https://podcasts.apple.com/..."
                  />
                </div>
              </div>
            </div>

            {errors.podcast_url && (
              <p className="text-xs font-bold text-red-500 flex items-center gap-1 uppercase tracking-widest">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.podcast_url}
              </p>
            )}
          </div>
        </div>
      )}

      {type === "indice" && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Données de l'Indice
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symbole *
              </label>
              <input
                type="text"
                value={formData.indice_data.symbol || ""}
                onChange={(e) =>
                  handleSpecificDataChange("symbol", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.indice_symbol ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="BRVM, XAU/USD"
              />
              {errors.indice_symbol && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.indice_symbol}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valeur Actuelle *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.indice_data.current_value || ""}
                onChange={(e) =>
                  handleSpecificDataChange(
                    "current_value",
                    parseFloat(e.target.value),
                  )
                }
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.indice_value ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="185.42"
              />
              {errors.indice_value && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.indice_value}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <input
                type="text"
                value={formData.indice_data.source || ""}
                onChange={(e) =>
                  handleSpecificDataChange("source", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="BRVM, BCEAO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Devise
              </label>
              <select
                value={formData.indice_data.currency || "XOF"}
                onChange={(e) =>
                  handleSpecificDataChange("currency", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="XOF">Franc CFA (XOF)</option>
                <option value="USD">Dollar US (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SEO & MÉTADONNÉES */}
      <div className="bg-white border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
            SEO & Métadonnées
          </h3>
          <span className="text-[10px] uppercase tracking-widest font-bold bg-gray-100 text-gray-900 px-2 py-1">
            Auto-généré
          </span>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Titre SEO (Meta Title)
            </label>
            <input
              type="text"
              name="meta_title"
              value={formData.meta_title || ""}
              onChange={handleInputChange}
              className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 hover:border-gray-300 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors"
              placeholder="Auto-généré depuis le titre"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Description SEO (Meta Description)
            </label>
            <textarea
              name="meta_description"
              value={formData.meta_description || ""}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 hover:border-gray-300 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors resize-none"
              placeholder="Auto-généré depuis le résumé"
            />
          </div>
        </div>
      </div>

      {/* STATUT & PUBLICATION */}
      <div className="bg-white border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
            Publication
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              Statut
            </label>
            <div className="space-y-4">
              <div
                className={`border-b-2 py-3 cursor-pointer transition-colors ${
                  formData.status === "draft"
                    ? "border-gray-900"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: "draft" }))
                }
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === "draft"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-gray-900 focus:ring-0"
                  />
                  <div>
                    <div className="font-bold text-gray-900 uppercase tracking-widest text-xs">Brouillon</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                      Sauvegarder sans publier
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`border-b-2 py-3 cursor-pointer transition-colors ${
                  formData.status === "published"
                    ? "border-green-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: "published" }))
                }
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={formData.status === "published"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-0"
                  />
                  <div>
                    <div className="font-bold text-gray-900 uppercase tracking-widest text-xs">Publier</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                      Visible par tous
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Date de publication
            </label>
            <input
              type="date"
              name="published_at"
              value={formData.published_at || ""}
              onChange={handleInputChange}
              className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 bg-transparent rounded-none focus:ring-0 focus:border-gray-900 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-4 border border-gray-200 text-gray-900 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-3 px-10 py-4 bg-gray-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {formData.status === "published"
                ? "Publication en cours..."
                : "Sauvegarde..."}
            </>
          ) : (
            <>
              {formData.status === "published" ? "Publier le contenu" : "Sauvegarder le brouillon"}
            </>
          )}
        </button>
      </div>

      {/* PRÉVISUALISATION */}
      {isPreview && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Prévisualisation
            </h3>
          </div>

          <div className="border-l-4 border-blue-500 pl-6">
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              {formData.title}
            </h4>
            <p className="text-gray-600 mb-4">{formData.summary}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            {formData.content && (
              <div className="prose max-w-none text-gray-700">
                {formData.content.substring(0, 200)}...
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
