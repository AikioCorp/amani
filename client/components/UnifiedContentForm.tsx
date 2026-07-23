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
  ShieldCheck,
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

function parsePodcastData(data: any): PodcastData {
  if (!data) return {} as PodcastData;
  const pd = data.podcast_data || data || {};
  return {
    audio_url: pd.audio_url || pd.audio_file || pd.audioUrl || data.audio_url || data.audio_file || "",
    video_url: pd.video_url || pd.videoUrl || data.video_url || "",
    spotify_url: pd.spotify_url || pd.spotifyUrl || "",
    apple_url: pd.apple_url || pd.appleUrl || "",
    duration: pd.duration || "",
    host: pd.host || "",
  };
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
      mergedData.podcast_data = parsePodcastData(initialData);
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
      const parsedPodcastData = parsePodcastData(initialData);

      setFormData(prev => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(initialData).map(([key, value]) => [
            key,
            value === null ? "" : value
          ])
        ),
        podcast_data: parsedPodcastData,
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
  const [aiPrompt, setAiPrompt] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState<"audio_url" | "video_url" | null>(null);
  const [localAudioUrl, setLocalAudioUrl] = useState("");
  const [podcastMode, setPodcastMode] = useState<"mp3" | "url">("mp3");

  // Synchronise localAudioUrl initialement
  useEffect(() => {
    if (type === "podcast" && formData.podcast_data?.audio_url && !localAudioUrl) {
      setLocalAudioUrl(formData.podcast_data.audio_url);
    }
  }, [formData?.podcast_data?.audio_url, type]);

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
      if (!res.ok || (!result.success && !result.url)) {
        throw new Error(result.error || "Échec de l'upload du fichier.");
      }
      
      const finalUrl = result.data?.url || result.url || (Array.isArray(result.data) ? result.data[0]?.url : "") || (Array.isArray(result) ? result[0]?.url : "");
      console.log("Upload result:", result, "Final URL:", finalUrl);
      
      if (!finalUrl) {
        throw new Error("L'URL du fichier n'a pas pu être récupérée.");
      }
      
      handleSpecificDataChange(field, finalUrl);
      if (field === "audio_url") {
        setLocalAudioUrl(finalUrl);
      }
      
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
    const searchTerm = overridePrompt || aiPrompt || formData.title;
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
          summary: aiPrompt || formData.summary,
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

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
        setFormData((prev: any) => ({
          ...prev,
          tags: [...prev.tags, newTag.trim()],
        }));
        setNewTag("");
      }
    }
  };

  const countries = [
    { value: "mali", label: "Mali" },
    { value: "burkina", label: "Burkina Faso" },
    { value: "niger", label: "Niger" },
    { value: "senegal", label: "Sénégal" },
    { value: "cote-ivoire", label: "Côte d'Ivoire" },
    { value: "uemoa", label: "UEMOA" },
    { value: "afrique", label: "Afrique" },
  ];

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

  

  return (
    <form onSubmit={handleSubmit} className="max-w-[1400px] mx-auto pb-24 relative flex flex-col space-y-8">
      {/* HEADER STICKY (Top Action Bar) */}
      <div className="sticky top-[80px] lg:top-[90px] z-50 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-3 lg:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md">
            {getTypeIcon()}
          </div>
          <div className="hidden md:block">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-widest line-clamp-1">
              {initialData ? "Édition en cours" : `Nouveau ${getTypeLabel()}`}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${formData.status === "published" ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`}></span>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                {formData.status === "published" ? "Publié" : "Brouillon non sauvegardé"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border-none text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {formData.status === "published" ? "Mettre à jour" : "Enregistrer"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* TWO COLUMN STUDIO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN EDITOR COLUMN (Left, 8/12) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* TITLE & SLUG SECTION */}
          <div className="pt-4 pb-2 transition-all">
            <div className="space-y-4">
              <div>
                <textarea
                  name="title"
                  value={formData.title || ""}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-4xl md:text-5xl lg:text-[56px] font-black text-[#1d1d1f] placeholder:text-slate-300 border-none p-0 focus:ring-0 resize-none overflow-hidden leading-[1.1] tracking-tighter"
                  placeholder="Titre de votre contenu..."
                  rows={1}
                  style={{ minHeight: '70px' }}
                />
                {errors.title && (
                  <p className="text-sm font-bold text-red-500 flex items-center gap-1.5 mt-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3 max-w-2xl group opacity-60 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <span className="text-[#86868b] text-[11px] font-bold uppercase tracking-widest shrink-0">
                  Slug / Lien :
                </span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug || ""}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-slate-500 border-b border-transparent hover:border-slate-300 focus:border-blue-500 px-0 py-2 text-sm font-medium focus:ring-0 transition-all outline-none"
                  placeholder="titre-optimise-seo"
                />
              </div>
            </div>
          </div>

          {/* IA ASSISTANT */}
          <div className="bg-white border border-slate-100/50 rounded-3xl p-6 lg:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Génération par IA</h3>
                <p className="text-xs text-slate-500">Décrivez brièvement le contenu, l'IA s'occupe de la rédaction.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full bg-slate-50/50 text-slate-700 placeholder-slate-400 border border-slate-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 focus:bg-white resize-none transition-all"
                rows={3}
                placeholder="Ex: Écris un article sur l'impact de l'inflation sur les ménages en zone rurale..."
              />
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleEnrichWithAI}
                  disabled={isEnriching || !aiPrompt.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-blue-600"
                >
                  {isEnriching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Rédiger pour moi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* SUMMARY SECTION */}
          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-slate-100/50 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Résumé Synthétique
            </h3>
            <textarea
              name="summary"
              value={formData.summary || ""}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-base md:text-lg font-medium text-slate-700 transition-all resize-none ${
                errors.summary ? "border-red-500 bg-red-50/50" : "border-slate-100"
              }`}
              placeholder="En quoi ce contenu est-il important ? (Sera visible sur les cartes)"
            />
            {errors.summary && (
              <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.summary}
              </p>
            )}
          </div>

          {/* CONTENT SECTION */}
          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-slate-100/50 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Contenu Détaillé
            </h3>
            <textarea
              name="content"
              value={formData.content || ""}
              onChange={handleInputChange}
              rows={12}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-base text-slate-700 transition-all leading-relaxed"
              placeholder="Commencez à écrire votre article ou les notes du podcast..."
            />
          </div>

          {/* PODCAST MEDIA SECTION */}
          {type === "podcast" && (
            <div className="bg-[#f5f5f7]/60 border border-slate-200/50 rounded-[32px] p-8 lg:p-10">
              <div className="flex flex-col mb-8">
                <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                  Média du Podcast
                </h3>
                <p className="text-[#86868b] text-sm font-medium mt-1">
                  Fournissez le fichier audio MP3 ou un lien d'hébergement externe.
                </p>
              </div>

              <div className="space-y-6">
                <div className="inline-flex p-1 bg-black/5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setPodcastMode("mp3")}
                    className={`py-2 px-6 rounded-xl text-xs font-semibold transition-all uppercase tracking-widest flex items-center gap-2 ${
                      podcastMode === "mp3"
                        ? "bg-white text-black shadow-sm"
                        : "text-[#86868b] hover:text-black"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    Fichier Audio
                  </button>
                  <button
                    type="button"
                    onClick={() => setPodcastMode("url")}
                    className={`py-2 px-6 rounded-xl text-xs font-semibold transition-all uppercase tracking-widest flex items-center gap-2 ${
                      podcastMode === "url"
                        ? "bg-white text-black shadow-sm"
                        : "text-[#86868b] hover:text-black"
                    }`}
                  >
                    <Link2 className="w-4 h-4" />
                    Lien Web
                  </button>
                </div>

                {podcastMode === "mp3" && (
                  <div className="pt-2">
                    {localAudioUrl ? (
                      <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200/50 space-y-5 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <Mic className="w-6 h-6" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[13px] font-bold text-[#1d1d1f] mb-0.5 tracking-tight">Audio Prêt</p>
                              <p className="text-xs text-[#86868b] truncate max-w-[200px] md:max-w-md font-mono">
                                {localAudioUrl.split('/').pop()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleSpecificDataChange("audio_url", "");
                                setLocalAudioUrl("");
                              }}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors shrink-0"
                            >
                              Retirer
                            </button>
                          </div>
                        </div>
                        <div className="pt-2">
                          <audio
                            controls
                            src={localAudioUrl}
                            className="w-full h-10 rounded-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-[32px] p-10 text-center bg-white hover:bg-slate-50 transition-all group">
                        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                          {uploadingMedia === "audio_url" ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                          ) : (
                            <Mic className="w-8 h-8" />
                          )}
                        </div>
                        <p className="text-lg font-bold text-[#1d1d1f] mb-1">
                          {uploadingMedia === "audio_url" ? "Téléversement en cours..." : "Fichier Audio"}
                        </p>
                        <p className="text-sm font-medium text-[#86868b] mb-6">
                          Glissez votre fichier MP3, WAV ou M4A.
                        </p>
                        <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-2xl cursor-pointer transition-all shadow-sm">
                          {uploadingMedia === "audio_url" ? "Patientez..." : "Sélectionner un fichier"}
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
                    )}
                  </div>
                )}

                {podcastMode === "url" && (
                  <div className="space-y-6 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-[#86868b] uppercase tracking-widest mb-3">
                        Lien Audio Direct (.mp3)
                      </label>
                      <input
                        type="url"
                        value={localAudioUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLocalAudioUrl(val);
                          handleSpecificDataChange("audio_url", val);
                        }}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium transition-all shadow-sm outline-none"
                        placeholder="https://serveur.com/podcast.mp3"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#86868b] uppercase tracking-widest mb-3">
                        Lien Vidéo (YouTube / Vimeo)
                      </label>
                      <input
                        type="url"
                        value={formData.podcast_data?.video_url || ""}
                        onChange={(e) => handleSpecificDataChange("video_url", e.target.value)}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium transition-all shadow-sm outline-none"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* SETTINGS SIDEBAR COLUMN (Right, 4/12, Sticky) */}
        <div className="lg:col-span-4">
          <div className="space-y-8 lg:sticky lg:top-[180px]">
            
            {/* PUBLICATION CARD */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-3">
              Publication
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Visibilité
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData((prev: any) => ({ ...prev, status: "draft" }))}
                    className={`py-2 px-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest ${
                      formData.status === "draft"
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                        : "text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    Brouillon
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev: any) => ({ ...prev, status: "published" }))}
                    className={`py-2 px-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest ${
                      formData.status === "published"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    Publique
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Date de Sortie
                </label>
                <input
                  type="date"
                  name="published_at"
                  value={formData.published_at || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-slate-900 text-sm font-bold text-slate-700 transition-all"
                />
              </div>
            </div>
          </div>

          {/* META & ORGANIZATION CARD */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-3">
              Classification
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Accès (Paywall)
                </label>
                <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData((prev: any) => ({ ...prev, is_premium: false }))}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest ${
                      !formData.is_premium
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                        : "text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    Gratuit
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev: any) => ({ ...prev, is_premium: true }))}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest flex items-center justify-center gap-1 ${
                      formData.is_premium
                        ? "bg-slate-900 text-amber-400 shadow-sm"
                        : "text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    Premium
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Catégorie Parente *
                </label>
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={(e) => {
                    const slug = e.target.value;
                    const found = categories.find(c => c.slug === slug);
                    setFormData((prev: any) => ({
                      ...prev,
                      category: slug,
                      category_id: found?.id || prev.category_id,
                    }));
                    if (errors.category) {
                      setErrors((prev) => ({ ...prev, category: "" }));
                    }
                  }}
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-slate-900 text-sm font-bold text-slate-700 transition-all ${
                    errors.category ? "border-red-500 bg-red-50" : "border-slate-100"
                  }`}
                >
                  <option value="">Choisir...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-[10px] font-bold text-red-500">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Mots-clés (Tags)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ex: Cacao"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-slate-900 text-xs font-medium transition-all"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-slate-900 hover:bg-black text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 pl-2 pr-1 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold uppercase tracking-wider"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="w-4 h-4 hover:bg-slate-200 rounded text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FEATURED IMAGE CARD */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-3 mb-4">
              Couverture
            </h3>
            <ImageUpload
              onImageSelect={(file) => {
                setFeaturedImage(file);
                if (file) setCurrentImageUrl(URL.createObjectURL(file));
              }}
              currentImage={currentImageUrl}
            />
          </div>

          </div>
        </div>
      </div>
    </form>
  );
}

