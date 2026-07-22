import React, { useState, useEffect, useRef } from "react";
import { getApiUrl } from "../services/apiConfig";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FileText, Mic, BarChart3, Plus, X, AlertCircle } from "lucide-react";
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

  // FORMULAIRE UNIFIÉ
  const [formData, setFormData] = useState(() => {
    const baseData = {
      // CHAMPS COMMUNS
      title: "",
      slug: "",
      summary: "", // RÉSUMÉ OBLIGATOIRE
      description: "",
      content: "", // Contenu complet optionnel
      status: "draft" as "draft" | "published",
      category: "",
      country: "mali",
      tags: [] as string[],

      // SEO
      meta_title: "",
      meta_description: "",
      featured_image: "",
      featured_image_alt: "",

      // DATES
      published_at: new Date().toISOString().split("T")[0],

      // DONNÉES SPÉCIFIQUES
      article_data: {} as ArticleData,
      podcast_data: {} as PodcastData,
      indice_data: {} as IndiceData,
    };

    // Fusionner initialData en convertissant null vers string vide
    if (initialData) {
      const mergedData: any = { ...baseData };
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          (mergedData as any)[key] = value as any;
        }
      });
      // Pré-remplir la catégorie en PRIORITÉ avec le slug (category_info.slug),
      // sinon fallback sur l'ancien champ texte `category`
      const initialCategory = (initialData as any)?.category_info?.slug
        || (initialData as any).category
        || "";
      mergedData.category = initialCategory;
      // Garder category_id tel quel pour la DB si fourni
      if ((initialData as any).category_id) {
        mergedData.category_id = (initialData as any).category_id;
      }
      console.log('🔍 FormData initialisé avec:', mergedData);
      return mergedData;
    }

    return baseData;
  });

  // Effet pour synchroniser avec initialData (approche simplifiée)
  useEffect(() => {
    if (initialData) {
      console.log('🔄 initialData reçu:', initialData);
      // Pendant la synchronisation, privilégier également le slug
      const derivedCategory = (initialData as any)?.category_info?.slug
        || (initialData as any).category
        || "";

      setFormData(prev => {
        const currentCategory = prev.category;
        const needsUpdate = derivedCategory !== currentCategory;
        if (needsUpdate) {
          console.log('📝 Mise à jour catégorie (sync):', derivedCategory);
        }
        return {
          ...prev,
          ...(needsUpdate ? { category: derivedCategory, category_id: (initialData as any).category_id || prev.category_id } : {}),
          ...Object.fromEntries(
            Object.entries(initialData).map(([key, value]) => [
              key,
              value === null ? "" : value
            ])
          )
        } as any;
      });

      // Mettre à jour l'image actuelle si elle existe
      if ((initialData as any)?.featured_image) {
        setCurrentImageUrl((initialData as any).featured_image);
      }
    }
  }, [initialData]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState("");

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
      // Upload de l'image si nécessaire
      let imageUrl = formData.featured_image;
      if (featuredImage) {
        try {
          const { StorageService } = await import("../services/supabase");
          imageUrl = await StorageService.uploadImage(featuredImage, "images", "content");
        } catch (imgError) {
          console.error("Erreur upload image:", imgError);
          error("Erreur", "Impossible d'uploader l'image. Veuillez réessayer.");
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl">
            {getTypeIcon()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData
                ? `Modifier ${getTypeLabel()}`
                : `Nouveau ${getTypeLabel()}`}
            </h2>
          </div>
        </div>
      </div>

      {/* INFORMATIONS PRINCIPALES */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            Informations principales
          </h3>
        </div>

        <div className="space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? "border-red-300" : "border-gray-300"
              }`}
              placeholder={`Titre de votre ${getTypeLabel().toLowerCase()}`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL (Slug)
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 text-sm">amani-finance.com/</span>
              <input
                type="text"
                name="slug"
                value={formData.slug || ""}
                onChange={handleInputChange}
                className="flex-1 ml-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="url-de-votre-contenu"
              />
            </div>
          </div>

          {/* Résumé OBLIGATOIRE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Résumé *{" "}
              <span className="text-blue-600">
                (Utilisé pour l'extrait et le SEO)
              </span>
            </label>
            <textarea
              name="summary"
              value={formData.summary || ""}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.summary ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Résumé captivant qui sera affiché sur la page d'accueil et dans les extraits..."
            />
            {errors.summary && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.summary}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Ce résumé sera utilisé comme extrait sur la page d'accueil et pour
              le SEO
            </p>
          </div>

          {/* Contenu complet (optionnel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenu complet <span className="text-gray-500">(Optionnel)</span>
            </label>
            <textarea
              name="content"
              value={formData.content || ""}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contenu détaillé de votre article (peut être ajouté plus tard)..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Le contenu peut être ajouté plus tard. Le résumé suffit pour
              publier.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? "border-red-300" : "border-gray-300"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays/Région
              </label>
              <select
                name="country"
                value={formData.country || "mali"}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Étiquettes
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ajouter une étiquette"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <ImageIcon className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            Image mise en avant
          </h3>
        </div>

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
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Mic className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Podcast Audio & Vidéo
            </h3>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Liens externes uniquement
            </span>
          </div>

          <div className="space-y-6">
            {/* Type de contenu */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-purple-600">🎧</span>
                Choisissez votre format
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Vous pouvez créer un podcast audio uniquement, vidéo uniquement,
                ou les deux.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-sm">
                  <span className="font-medium text-purple-700">
                    🎤 Audio :
                  </span>{" "}
                  Anchor, Spotify, Apple Podcasts
                </div>
                <div className="text-sm">
                  <span className="font-medium text-blue-700">🎥 Vidéo :</span>{" "}
                  YouTube, Vimeo, Dailymotion
                </div>
              </div>
            </div>

            {/* Liens principaux */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-purple-600" />
                  Lien Audio Principal
                </label>
                <input
                  type="url"
                  value={formData.podcast_data.audio_url || ""}
                  onChange={(e) =>
                    handleSpecificDataChange("audio_url", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://anchor.fm/votre-podcast"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Anchor, SoundCloud, ou autre plateforme audio
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-600" />
                  Lien Vidéo Principal
                </label>
                <input
                  type="url"
                  value={formData.podcast_data.video_url || ""}
                  onChange={(e) =>
                    handleSpecificDataChange("video_url", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  YouTube, Vimeo, ou autre plateforme vidéo
                </p>
              </div>
            </div>

            {/* Plateformes supplémentaires */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span>🔗</span>
                Plateformes supplémentaires (optionnel)
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-green-600">🎵</span>
                    Spotify
                  </label>
                  <input
                    type="url"
                    value={formData.podcast_data.spotify_url || ""}
                    onChange={(e) =>
                      handleSpecificDataChange("spotify_url", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://open.spotify.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-gray-600">🎧</span>
                    Apple Podcasts
                  </label>
                  <input
                    type="url"
                    value={formData.podcast_data.apple_url || ""}
                    onChange={(e) =>
                      handleSpecificDataChange("apple_url", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="https://podcasts.apple.com/..."
                  />
                </div>
              </div>
            </div>

            {errors.podcast_url && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
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
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            SEO & Métadonnées
          </h3>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Auto-généré
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre SEO (Meta Title)
            </label>
            <input
              type="text"
              name="meta_title"
              value={formData.meta_title || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Auto-généré depuis le titre"
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.meta_title.length}/60 caractères recommandés
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description SEO (Meta Description)
            </label>
            <textarea
              name="meta_description"
              value={formData.meta_description || ""}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Auto-généré depuis le résumé"
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.meta_description.length}/155 caractères recommandés
            </p>
          </div>
        </div>
      </div>

      {/* STATUT & PUBLICATION */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Publication</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Statut
            </label>
            <div className="space-y-3">
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  formData.status === "draft"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
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
                    className="h-4 w-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Brouillon</div>
                    <div className="text-sm text-gray-500">
                      Sauvegarder sans publier
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  formData.status === "published"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
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
                    className="h-4 w-4 text-green-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Publier</div>
                    <div className="text-sm text-gray-500">
                      Visible par tous
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de publication
            </label>
            <input
              type="date"
              name="published_at"
              value={formData.published_at || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>

        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center gap-2 px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          {isPreview ? "Masquer" : "Prévisualiser"}
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {formData.status === "published"
                ? "Publication..."
                : "Sauvegarde..."}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {formData.status === "published" ? "Publier" : "Sauvegarder"}
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
