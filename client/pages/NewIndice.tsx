import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useIndices } from "../hooks/useIndices";
import {
  ArrowLeft,
  Save,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calculator,
  Calendar,
  DollarSign,
  Percent,
  AlertCircle,
  CheckCircle,
  Globe,
  Building,
  Info,
} from "lucide-react";

export default function NewIndice() {
  const { user, hasPermission } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const { createIndice, loading } = useIndices();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    category: "monetary",
    country: "mali",
    currency: "XOF",
    unit: "units",
    frequency: "daily",
    source: "",
    methodology: "",
    currentValue: "",
    previousValue: "",
    changePercent: "",
    changeDirection: "neutral",
    lastUpdated: new Date().toISOString().split("T")[0],
    publishDate: new Date().toISOString().split("T")[0],
    status: "draft",
    isPublic: true,
    tags: [] as string[],
    historicalNote: "",
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check permissions
  if (!user || !hasPermission("create_indices")) {
    return (
      <>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-amani-primary mb-4">
            Accès refusé
          </h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour créer des indices
            économiques.
          </p>
          <Link
            to="/dashboard"
            className="bg-amani-primary text-white px-6 py-2 rounded-lg hover:bg-amani-primary/90 transition-colors"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Auto-calculate change percentage and direction
    if (name === "currentValue" || name === "previousValue") {
      const current = parseFloat(
        name === "currentValue" ? value : formData.currentValue,
      );
      const previous = parseFloat(
        name === "previousValue" ? value : formData.previousValue,
      );

      if (!isNaN(current) && !isNaN(previous) && previous !== 0) {
        const change = ((current - previous) / previous) * 100;
        setFormData((prev) => ({
          ...prev,
          changePercent: change.toFixed(2),
          changeDirection: change > 0 ? "up" : change < 0 ? "down" : "neutral",
        }));
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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

    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'indice est requis";
    }
    if (!formData.code.trim()) {
      newErrors.code = "Le code est requis";
    }
    if (!formData.description.trim()) {
      newErrors.description = "La description est requise";
    }
    if (!formData.currentValue.trim()) {
      newErrors.currentValue = "La valeur actuelle est requise";
    }
    if (!formData.source.trim()) {
      newErrors.source = "La source est requise";
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
      const summary = formData.description
        ? formData.description.slice(0, 180)
        : formData.name;

      await createIndice({
        name: formData.name,
        code: formData.code,
        summary,
        description: formData.description,
        status: formData.status as "draft" | "published",
        // keep default category resolver (economie) by not forcing mapping from UI categories
        // categorySlug: 'economie',
        country: formData.country,
        tags: formData.tags,
        isPublic: formData.isPublic,
        unit: formData.unit,
        frequency: formData.frequency,
        currency: formData.currency,
        source: formData.source,
        methodology: formData.methodology,
        historicalNote: formData.historicalNote,
        currentValue: formData.currentValue,
        previousValue: formData.previousValue,
        changePercent: formData.changePercent,
        changeDirection: formData.changeDirection as any,
        lastUpdated: formData.lastUpdated,
        publishDate: formData.publishDate,
      });

      success(
        "Indice créé",
        `L'indice "${formData.name}" a été ${
          formData.status === "published" ? "publié" : "sauvegardé en brouillon"
        } avec succès.`,
      );
      navigate("/dashboard/indices-management");
    } catch (e: any) {
      console.error(e);
      error("Erreur", e.message || "Échec de la création de l'indice");
    } finally {
      setIsSaving(false);
    }
  };

  const categories = [
    { value: "monetary", label: "Politique monétaire" },
    { value: "market", label: "Marchés financiers" },
    { value: "inflation", label: "Inflation" },
    { value: "employment", label: "Emploi" },
    { value: "gdp", label: "PIB et croissance" },
    { value: "trade", label: "Commerce extérieur" },
    { value: "agriculture", label: "Agriculture" },
    { value: "mining", label: "Mines et ressources" },
    { value: "energy", label: "Énergie" },
    { value: "demographics", label: "Démographie" },
  ];

  const countries = [
    { value: "mali", label: "Mali" },
    { value: "burkina", label: "Burkina Faso" },
    { value: "niger", label: "Niger" },
    { value: "tchad", label: "Tchad" },
    { value: "mauritanie", label: "Mauritanie" },
    { value: "senegal", label: "Sénégal" },
    { value: "uemoa", label: "UEMOA" },
    { value: "regional", label: "Régional" },
  ];

  const currencies = [
    { value: "XOF", label: "Franc CFA (XOF)" },
    { value: "USD", label: "Dollar US (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "XAF", label: "Franc CFA Central (XAF)" },
  ];

  const units = [
    { value: "units", label: "Unités" },
    { value: "percent", label: "Pourcentage (%)" },
    { value: "points", label: "Points" },
    { value: "index", label: "Indice" },
    { value: "ratio", label: "Ratio" },
    { value: "millions", label: "Millions" },
    { value: "billions", label: "Milliards" },
  ];

  const frequencies = [
    { value: "daily", label: "Quotidien" },
    { value: "weekly", label: "Hebdomadaire" },
    { value: "monthly", label: "Mensuel" },
    { value: "quarterly", label: "Trimestriel" },
    { value: "yearly", label: "Annuel" },
  ];

  const getTrendIcon = () => {
    switch (formData.changeDirection) {
      case "up":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "down":
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (formData.changeDirection) {
      case "up":
        return "text-green-600 bg-green-50";
      case "down":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            to="/dashboard/indices-management"
            className="inline-flex items-center gap-2 text-amani-primary hover:text-amani-primary/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la gestion des indices
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Sauvegarde automatique activée</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-amani-primary" />
              <h2 className="text-xl font-semibold text-amani-primary">
                Informations générales
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'indice *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Ex: Taux directeur BCEAO"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de l'indice *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent ${
                    errors.code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Ex: BCEAO_RATE"
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.code}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays/Région
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                >
                  {countries.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                >
                  {currencies.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                >
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence de mise à jour
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                >
                  {frequencies.map((frequency) => (
                    <option key={frequency.value} value={frequency.value}>
                      {frequency.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source des données *
                </label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent ${
                    errors.source ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Ex: BCEAO, INSTAT Mali"
                />
                {errors.source && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.source}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent ${
                  errors.description ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Description détaillée de l'indice, ce qu'il mesure et son importance..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Values and Trends */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-6 h-6 text-amani-primary" />
              <h2 className="text-xl font-semibold text-amani-primary">
                Valeurs et tendances
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valeur actuelle *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="currentValue"
                  value={formData.currentValue}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent ${
                    errors.currentValue ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="5.50"
                />
                {errors.currentValue && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.currentValue}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valeur précédente
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="previousValue"
                  value={formData.previousValue}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                  placeholder="5.25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variation
                </label>
                <div
                  className={`flex items-center gap-2 px-4 py-3 border rounded-lg ${getTrendColor()}`}
                >
                  {getTrendIcon()}
                  <span className="font-medium">
                    {formData.changePercent
                      ? `${formData.changePercent}%`
                      : "0.00%"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dernière mise à jour
                </label>
                <input
                  type="date"
                  name="lastUpdated"
                  value={formData.lastUpdated}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de publication
                </label>
                <input
                  type="date"
                  name="publishDate"
                  value={formData.publishDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Methodology and Tags */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <Info className="w-6 h-6 text-amani-primary" />
              <h2 className="text-xl font-semibold text-amani-primary">
                Méthodologie et étiquettes
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthodologie de calcul
                </label>
                <textarea
                  name="methodology"
                  value={formData.methodology}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                  placeholder="Expliquez comment cet indice est calculé, les données sources utilisées, la formule appliquée..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note historique
                </label>
                <textarea
                  name="historicalNote"
                  value={formData.historicalNote}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                  placeholder="Contexte historique, évolutions récentes, points d'attention..."
                />
              </div>

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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-amani-secondary/20 text-amani-primary rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-amani-primary/60 hover:text-amani-primary"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Publishing Options */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-amani-primary" />
              <h2 className="text-xl font-semibold text-amani-primary">
                Options de publication
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Statut de publication
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.status === "draft"
                        ? "border-amani-primary bg-amani-secondary/20"
                        : "border-gray-200 hover:border-amani-primary/50"
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
                        className="h-4 w-4 text-amani-primary focus:ring-amani-primary"
                      />
                      <div>
                        <div className="font-medium text-amani-primary">
                          Brouillon
                        </div>
                        <div className="text-sm text-gray-600">
                          Sauvegarder sans publier
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.status === "published"
                        ? "border-amani-primary bg-amani-secondary/20"
                        : "border-gray-200 hover:border-amani-primary/50"
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
                        className="h-4 w-4 text-amani-primary focus:ring-amani-primary"
                      />
                      <div>
                        <div className="font-medium text-amani-primary">
                          Publier maintenant
                        </div>
                        <div className="text-sm text-gray-600">
                          Rendre visible au public
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Indice public</div>
                  <div className="text-sm text-gray-600">
                    Accessible à tous les utilisateurs de la plateforme
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amani-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amani-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Link
              to="/dashboard/indices-management"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-amani-primary text-white rounded-lg hover:bg-amani-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {formData.status === "published"
                    ? "Publier l'indice"
                    : "Sauvegarder le brouillon"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
