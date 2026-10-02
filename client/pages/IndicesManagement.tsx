import React from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  TrendingDown,
  Save,
  X,
  BarChart3,
  Globe,
  DollarSign,
  AlertCircle,
  Eye,
  RefreshCw,
  HelpCircle,
  Info,
} from "lucide-react";
import { useIndices, type Indice, type CreateIndiceInput, type UpdateIndiceInput } from "../hooks/useIndices";

interface IndexData {
  id: string;
  name: string;
  symbol: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  lastUpdate: string;
  description: string;
  category: "brvm" | "commodity" | "economic";
  unit?: string;
  source?: string;
}

// Extended form state to support keeping track of the previous value while editing
type IndexEditForm = Partial<IndexData> & { originalValue?: string; ytdPercent?: string; group?: string };

// Map category from DB slug/text to UI group id
function mapDbCategoryToUi(cat?: string): IndexData["category"] {
  if (!cat) return "economic";
  const c = cat.toLowerCase();
  if (c.includes("matiere") || c.includes("commodity")) return "commodity";
  if (c.includes("brvm") || c.includes("bourse")) return "brvm";
  return "economic"; // economie, macro, etc.
}

function mapUiCategoryToSlug(ui: string | undefined): string {
  switch ((ui || "economic").toLowerCase()) {
    case "commodity":
      return "matieres-premieres";
    case "brvm":
      return "economie"; // fallback slug commonly present
    case "economic":
    default:
      return "economie";
  }
}

function computeChangeFromValues(current?: string, previous?: string): string | undefined {
  const a = parseFloat(current || "");
  const b = parseFloat(previous || "");
  if (isNaN(a) || isNaN(b)) return undefined;
  const diff = a - b;
  return `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}`;
}

function mapIndiceToIndexData(row: Indice): IndexData {
  const current = row.indice_data?.currentValue;
  const previous = row.indice_data?.previousValue;
  const change = computeChangeFromValues(current, previous) || (row as any).change || "0";
  const isPositive = row.indice_data?.changeDirection
    ? row.indice_data?.changeDirection === "up"
    : (parseFloat(change) || 0) >= 0;
  return {
    id: row.id,
    name: row.title,
    symbol: row.indice_data?.code || "",
    value: current || "0",
    change,
    changePercent: row.indice_data?.changePercent || "0%",
    isPositive,
    lastUpdate: row.updated_at || row.indice_data?.lastUpdated || new Date().toISOString(),
    description: row.description || row.summary || "",
    category: mapDbCategoryToUi((row as any).category || "economie"),
    unit: row.indice_data?.unit,
    source: row.indice_data?.source,
  };
}

function buildCreateInput(form: IndexEditForm): CreateIndiceInput {
  return {
    name: form.name || "",
    code: form.symbol || "",
    summary: (form.description || form.name || "").slice(0, 140),
    description: form.description || undefined,
    status: "published",
    categorySlug: mapUiCategoryToSlug(form.category),
    unit: form.unit,
    source: form.source,
    currentValue: form.value || "0",
    previousValue: form.originalValue,
    changePercent: form.changePercent,
    changeDirection: form.isPositive === undefined ? undefined : form.isPositive ? "up" : "down",
    lastUpdated: new Date().toISOString().slice(0, 10),
    ytdPercent: form.ytdPercent,
    group: form.group,
  };
}

function buildUpdateInput(form: IndexEditForm): UpdateIndiceInput {
  const out: UpdateIndiceInput = {};
  if (form.name !== undefined) out.name = form.name;
  if (form.symbol !== undefined) out.code = form.symbol;
  if (form.description !== undefined) {
    out.description = form.description;
    out.summary = (form.description || form.name || "").slice(0, 140);
  }
  if (form.category !== undefined) out.categorySlug = mapUiCategoryToSlug(form.category);
  if (form.unit !== undefined) out.unit = form.unit;
  if (form.source !== undefined) out.source = form.source;
  if (form.value !== undefined) out.currentValue = form.value;
  if (form.originalValue !== undefined) out.previousValue = form.originalValue;
  if (form.changePercent !== undefined) out.changePercent = form.changePercent;
  if (form.isPositive !== undefined) out.changeDirection = form.isPositive ? "up" : "down";
  if (form.ytdPercent !== undefined) out.ytdPercent = form.ytdPercent;
  if (form.group !== undefined) out.group = form.group;
  out.status = "published";
  out.lastUpdated = new Date().toISOString().slice(0, 10);
  return out;
}

export default function IndicesManagement() {
  const { fetchIndices, createIndice, updateIndice, deleteIndice: deleteIndiceApi, loading, error } = useIndices();
  const [indices, setIndices] = React.useState<IndexData[]>([]);

  const [isEditing, setIsEditing] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<IndexEditForm>({});
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  const categories = [
    { id: "all", name: "Tous les indices", icon: BarChart3, color: "blue" },
    { id: "brvm", name: "BRVM & Bourse", icon: TrendingUp, color: "green" },
    {
      id: "commodity",
      name: "Matières Premières",
      icon: Globe,
      color: "orange",
    },
    {
      id: "economic",
      name: "Indicateurs Économiques",
      icon: DollarSign,
      color: "purple",
    },
  ];

  const filteredIndices =
    selectedCategory === "all"
      ? indices
      : indices.filter((index) => index.category === selectedCategory);

  const startEdit = (index: IndexData) => {
    setIsEditing(index.id);
    // Stocker l'ancienne valeur pour le calcul automatique
    setEditForm({ ...index, originalValue: index.value });
  };

  const saveEdit = async () => {
    if (isEditing && editForm) {
      const updatedForm = calculateDerivedValues(
        editForm,
        editForm.originalValue,
      );
      try {
        const payload: UpdateIndiceInput = buildUpdateInput(updatedForm);
        const updated = await updateIndice(isEditing, payload);
        const mapped = mapIndiceToIndexData(updated);
        setIndices((prev) => prev.map((i) => (i.id === isEditing ? mapped : i)));
      } catch (e) {
        console.error('[IndicesManagement.saveEdit] update failed', e);
        alert('La sauvegarde a échoué. Voir la console pour plus de détails.');
      } finally {
        setIsEditing(null);
        setEditForm({});
      }
    }
  };

  // Calculer automatiquement la variation depuis l'ancienne valeur
  const calculateDerivedValues = (
    formData: Partial<IndexData>,
    originalValue?: string,
  ) => {
    const result = { ...formData };

    // Si on a une nouvelle valeur et l'ancienne valeur, calculer la variation automatiquement
    if (formData.value && originalValue) {
      const newValue = parseFloat(formData.value);
      const oldValue = parseFloat(originalValue);

      if (!isNaN(newValue) && !isNaN(oldValue) && oldValue > 0) {
        const changeValue = newValue - oldValue;
        const percentage = (changeValue / oldValue) * 100;

        result.change = `${changeValue >= 0 ? "+" : ""}${changeValue.toFixed(2)}`;
        result.changePercent = `${changeValue >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;
        result.isPositive = changeValue >= 0;
      }
    }
    // Si on modifie manuellement la variation (mode expert)
    else if (formData.value && formData.change) {
      const currentValue = parseFloat(formData.value);
      const changeValue = parseFloat(formData.change);

      if (!isNaN(currentValue) && !isNaN(changeValue) && currentValue > 0) {
        const percentage = (changeValue / (currentValue - changeValue)) * 100;
        result.changePercent = `${changeValue >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;
        result.isPositive = changeValue >= 0;
      }
    }

    return result;
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setEditForm({});
  };

  const deleteIndex = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet indice ?")) {
      try {
        await deleteIndiceApi(id);
        setIndices((prev) => prev.filter((index) => index.id !== id));
      } catch (e) {
        console.error('[IndicesManagement.deleteIndex] delete failed', e);
        alert('La suppression a échoué.');
      }
    }
  };

  const addNewIndex = async () => {
    const calculatedForm = calculateDerivedValues(editForm, editForm.originalValue);
    try {
      const input: CreateIndiceInput = buildCreateInput(calculatedForm);
      const created = await createIndice(input);
      const mapped = mapIndiceToIndexData(created);
      setIndices((prev) => [...prev, mapped]);
      setShowAddForm(false);
      setEditForm({});
    } catch (e) {
      console.error('[IndicesManagement.addNewIndex] create failed', e);
      alert('La création a échoué.');
    }
  };

  // Initial load from Supabase
  React.useEffect(() => {
    (async () => {
      try {
        const rows = await fetchIndices({ status: 'published' });
        setIndices(rows.map(mapIndiceToIndexData));
      } catch (e) {
        console.error('[IndicesManagement.useEffect] fetch failed', e);
      }
    })();
  }, [fetchIndices]);

  const getCategoryColor = (category: string) => {
    const colors = {
      brvm: "bg-green-100 text-green-800",
      commodity: "bg-orange-100 text-orange-800",
      economic: "bg-purple-100 text-purple-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      brvm: TrendingUp,
      commodity: Globe,
      economic: DollarSign,
    };
    return icons[category as keyof typeof icons] || BarChart3;
  };

  return (
    <>
      <div className="space-y-8">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Gestion des Indices
            </h1>
            <p className="mt-2 text-gray-600">
              Gérez tous les indices, matières premières et indicateurs
              économiques affichés sur votre site
            </p>
          </div>
          <Link
            to="/dashboard/indices/new"
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Ajouter un indice
          </Link>
        </div>

        {/* Guide complet pour débutants */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                💡 Comment fonctionnent les indices économiques - Guide complet
              </h3>

              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    🎯 Qu'est-ce qu'un indice ?
                  </h4>
                  <div className="text-blue-800 space-y-2">
                    <p>
                      <strong>📊 BRVM Composite :</strong> Thermomètre de la
                      bourse ouest-africaine. Si il monte = entreprises vont
                      bien, économie forte.
                    </p>
                    <p>
                      <strong>🥇 Or/Argent :</strong> Prix des métaux précieux.
                      Si ils montent = les gens cherchent la sécurité, possible
                      crise.
                    </p>
                    <p>
                      <strong>🛢️ Pétrole :</strong> Plus cher = transport
                      coûteux, inflation sur tout le reste.
                    </p>
                    <p>
                      <strong>🌾 Coton/Cacao :</strong> Important pour l'Afrique
                      de l'Ouest. Prix élevé = plus de revenus pour les
                      agriculteurs.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    🤖 Nouveau système intelligent !
                  </h4>
                  <div className="text-blue-800 space-y-2">
                    <p>
                      <strong>1. Ancienne valeur :</strong> Ce que c'était avant
                      (ex: 185.42 points)
                    </p>
                    <p>
                      <strong>2. Nouvelle valeur :</strong> Ce que c'est
                      maintenant (ex: 189.70 points)
                    </p>
                    <p>
                      <strong>3. Variation :</strong> ✨ Calculée
                      automatiquement (+4.28)
                    </p>
                    <p>
                      <strong>4. Pourcentage :</strong> ✨ Calculé
                      automatiquement (+2.3%)
                    </p>
                    <p>
                      <strong>5. Flèches :</strong> ✨ 📈 Verte si hausse, 📉
                      Rouge si baisse
                    </p>
                    <p>
                      <strong>🚀 Modification :</strong> Tapez juste la nouvelle
                      valeur, tout se calcule automatiquement !
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>🚀 Super astuce :</strong> Maintenant vous n'avez qu'à
                  taper l'ancienne valeur et la nouvelle valeur. La variation
                  (+/-), le pourcentage (%) et les flèches (📈📉) se calculent
                  automatiquement !
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isActive ? "bg-white/20" : "bg-gray-200"
                  }`}
                >
                  {category.id === "all"
                    ? indices.length
                    : indices.filter((i) => i.category === category.id).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Liste des indices */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Indices actuels ({filteredIndices.length})
              </h2>
              <Link
                to="/indices"
                target="_blank"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <Eye className="w-4 h-4" />
                Voir sur le site
              </Link>
            </div>
          </div>

          {/* Version mobile/tablette responsive */}
          <div className="divide-y divide-gray-200">
            {filteredIndices.map((index) => {
              const CategoryIcon = getCategoryIcon(index.category);
              const isEditingThis = isEditing === index.id;

              return (
                <div
                  key={index.id}
                  className="p-4 md:p-6 hover:bg-gray-50 transition-colors"
                >
                  {/* Version mobile - Layout vertical */}
                  <div className="block lg:hidden space-y-4">
                    {/* En-tête avec nom et actions */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <CategoryIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          {isEditingThis ? (
                            <input
                              type="text"
                              value={editForm.name || ""}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="font-semibold text-lg border border-gray-300 rounded px-2 py-1 w-full"
                              placeholder="Nom de l'indice"
                            />
                          ) : (
                            <h3 className="font-semibold text-lg text-gray-900 truncate">
                              {index.name}
                            </h3>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(index.category)}`}
                            >
                              {index.category.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {index.symbol}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions mobiles */}
                      <div className="flex items-center gap-2 ml-2">
                        {isEditingThis ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                              title="Sauvegarder"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                              title="Annuler"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(index)}
                              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                              title="Modifier"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteIndex(index.id)}
                              className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Valeur et variation en mobile */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-500 mb-1">Valeur</div>
                        {isEditingThis ? (
                          <input
                            type="text"
                            value={editForm.value || ""}
                            onChange={(e) => {
                              const newForm = {
                                ...editForm,
                                value: e.target.value,
                              };
                              // Calculer automatiquement la variation depuis l'ancienne valeur
                              const calculated = calculateDerivedValues(
                                newForm,
                                editForm.originalValue,
                              );
                              setEditForm(calculated);
                            }}
                            className="text-xl font-bold border border-blue-300 rounded px-2 py-1 text-center w-full focus:ring-2 focus:ring-blue-500"
                            placeholder="Nouvelle valeur"
                          />
                        ) : (
                          <div className="text-xl font-bold text-gray-900">
                            {index.value}
                          </div>
                        )}
                        {index.unit && (
                          <div className="text-xs text-gray-500 mt-1">
                            {index.unit}
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          Variation
                        </div>
                        {isEditingThis ? (
                          <div className="space-y-2">
                            <div className="text-xs text-gray-500 mb-1">
                              Ancienne: {editForm.originalValue}
                            </div>
                            <div className="text-sm font-medium text-blue-600">
                              {editForm.changePercent || "✨ Auto-calculé"}
                            </div>
                            <div className="text-xs text-green-600">
                              Variation: {editForm.change || "✨ Auto"}
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`font-semibold ${
                              index.isPositive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {index.isPositive ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              {index.change}
                            </div>
                            <div className="text-sm">
                              ({index.changePercent})
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description en mobile */}
                    <div>
                      {isEditingThis ? (
                        <textarea
                          value={editForm.description || ""}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                          rows={3}
                          placeholder="Description de l'indice pour aider les utilisateurs"
                        />
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {index.description}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            {index.source && <span>📊 {index.source}</span>}
                            <span>
                              🕒{" "}
                              {new Date(index.lastUpdate).toLocaleString(
                                "fr-FR",
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {isEditingThis && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-blue-800 text-sm">
                          <strong>🚀 Nouveau système intelligent :</strong>
                          <br />
                          📊 Ancienne valeur :{" "}
                          <strong>{editForm.originalValue}</strong>
                          <br />
                          📈 Nouvelle valeur :{" "}
                          <strong>{editForm.value || "Tapez ici..."}</strong>
                          <br />⚡ Variation :{" "}
                          <strong>
                            {editForm.change || "Calculée automatiquement"}
                          </strong>
                          <br />
                          📊 Pourcentage :{" "}
                          <strong>
                            {editForm.changePercent ||
                              "Calculé automatiquement"}
                          </strong>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            <div>
                              <label className="block text-xs text-blue-800 mb-1">Variation 31 décembre (%)</label>
                              <input
                                type="text"
                                value={editForm.ytdPercent || ""}
                                onChange={(e) => setEditForm((p) => ({ ...p, ytdPercent: e.target.value }))}
                                className="w-full border border-blue-300 rounded px-2 py-1 text-sm"
                                placeholder="Ex: 1.51"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs text-blue-800 mb-1">Groupe d'affichage</label>
                              <select
                                value={editForm.group || "indices"}
                                onChange={(e) => setEditForm((p) => ({ ...p, group: e.target.value }))}
                                className="w-full border border-blue-300 rounded px-2 py-1 text-sm"
                              >
                                <option value="indices">Indices</option>
                                <option value="indices-sectoriels-nouveaux">Indices sectoriels nouveaux</option>
                                <option value="indices-sectoriels-anciens">Indices sectoriels anciens</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Version desktop - Layout horizontal */}
                  <div className="hidden lg:flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                      {/* Nom et catégorie */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-3">
                          <CategoryIcon className="w-5 h-5 text-gray-600" />
                          <div>
                            {isEditingThis ? (
                              <input
                                type="text"
                                value={editForm.name || ""}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                className="font-semibold text-lg border border-gray-300 rounded px-2 py-1 w-full"
                                placeholder="Nom de l'indice"
                              />
                            ) : (
                              <h3 className="font-semibold text-lg text-gray-900">
                                {index.name}
                              </h3>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(index.category)}`}
                              >
                                {index.category.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {index.symbol}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Valeur */}
                      <div className="text-center">
                        {isEditingThis ? (
                          <input
                            type="text"
                            value={editForm.value || ""}
                            onChange={(e) => {
                              const newForm = {
                                ...editForm,
                                value: e.target.value,
                              };
                              const calculated = calculateDerivedValues(
                                newForm,
                                editForm.originalValue,
                              );
                              setEditForm(calculated);
                            }}
                            className="text-2xl font-bold border border-blue-300 rounded px-2 py-1 text-center w-28 focus:ring-2 focus:ring-blue-500"
                            placeholder="Nouvelle"
                          />
                        ) : (
                          <div className="text-2xl font-bold text-gray-900">
                            {index.value}
                          </div>
                        )}
                        {index.unit && (
                          <div className="text-xs text-gray-500">
                            {index.unit}
                          </div>
                        )}
                      </div>

                      {/* Variation */}
                      <div className="text-center">
                        {isEditingThis ? (
                          <div className="text-center space-y-1">
                            <div className="text-xs text-gray-500">
                              Ancien: {editForm.originalValue}
                            </div>
                            <div className="text-sm font-medium text-blue-600">
                              {editForm.changePercent || "✨ Auto"}
                            </div>
                            <div className="text-xs text-green-600">
                              {editForm.change || "✨ Calculé"}
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`flex items-center justify-center gap-1 font-semibold ${
                              index.isPositive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {index.isPositive ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <div>
                              <div>{index.change}</div>
                              <div className="text-sm">
                                ({index.changePercent})
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="col-span-2">
                        {isEditingThis ? (
                          <textarea
                            value={editForm.description || ""}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                            rows={2}
                            placeholder="Description de l'indice"
                          />
                        ) : (
                          <div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {index.description}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              {index.source && (
                                <span>Source: {index.source}</span>
                              )}
                              <span>
                                Mis à jour:{" "}
                                {new Date(index.lastUpdate).toLocaleString(
                                  "fr-FR",
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions desktop */}
                    <div className="flex items-center gap-2 ml-4">
                      {isEditingThis ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                            title="Sauvegarder"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                            title="Annuler"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(index)}
                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteIndex(index.id)}
                            className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredIndices.length === 0 && (
            <div className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun indice dans cette catégorie
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par ajouter votre premier indice.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ajouter un indice
              </button>
            </div>
          )}
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Ajouter un nouvel indice
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditForm({});
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {categories
                      .filter((c) => c.id !== "all")
                      .map((category) => {
                        const Icon = category.icon;
                        return (
                          <button
                            key={category.id}
                            onClick={() =>
                              setEditForm((prev) => ({
                                ...prev,
                                category: category.id as any,
                              }))
                            }
                            className={`p-4 border rounded-lg text-left transition-colors ${
                              editForm.category === category.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <Icon className="w-6 h-6 mb-2 text-blue-600" />
                            <div className="font-medium">{category.name}</div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'indice *
                    </label>
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: BRVM Composite, Or, USD/FCFA"
                    />
                  </div>

                  {/* Symbole */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symbole *
                    </label>
                    <input
                      type="text"
                      value={editForm.symbol || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          symbol: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: BRVM, XAU/USD, USD/XOF"
                    />
                  </div>

                  {/* Nouvelle valeur */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouvelle valeur * 🔄
                    </label>
                    <input
                      type="text"
                      value={editForm.value || ""}
                      onChange={(e) => {
                        const newForm = { ...editForm, value: e.target.value };
                        const calculated = calculateDerivedValues(
                          newForm,
                          editForm.originalValue,
                        );
                        setEditForm(calculated);
                      }}
                      className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 189.70, 2040.75"
                    />
                  </div>

                  {/* Ancienne valeur pour comparaison */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ancienne valeur (pour calcul automatique ✨)
                    </label>
                    <input
                      type="text"
                      value={editForm.originalValue || ""}
                      onChange={(e) => {
                        const newForm = {
                          ...editForm,
                          originalValue: e.target.value,
                        };
                        const calculated = calculateDerivedValues(
                          newForm,
                          e.target.value,
                        );
                        setEditForm(calculated);
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 185.42 (valeur précédente)"
                    />
                  </div>

                  {/* Calcul automatique en temps réel */}
                  <div className="col-span-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-3">
                        🤖 Calcul automatique en temps réel
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-blue-700 font-medium">
                            Ancienne
                          </div>
                          <div className="text-lg font-bold text-blue-900">
                            {editForm.originalValue || "---"}
                          </div>
                        </div>
                        <div>
                          <div className="text-blue-700 font-medium">
                            Nouvelle
                          </div>
                          <div className="text-lg font-bold text-blue-900">
                            {editForm.value || "---"}
                          </div>
                        </div>
                        <div>
                          <div className="text-blue-700 font-medium">
                            Résultat
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {editForm.change || "✨ Auto"} (
                            {editForm.changePercent || "✨ Auto"})
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Unité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unité
                    </label>
                    <input
                      type="text"
                      value={editForm.unit || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          unit: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: USD/oz, cents/livre, points"
                    />
                  </div>

                  {/* Source */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source
                    </label>
                    <input
                      type="text"
                      value={editForm.source || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          source: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: BRVM, COMEX, BCEAO"
                    />
                  </div>
                  {/* YTD and Group */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Variation 31 décembre (%)</label>
                    <input
                      type="text"
                      value={editForm.ytdPercent || ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, ytdPercent: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 1.51"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Groupe d'affichage</label>
                    <select
                      value={editForm.group || "indices"}
                      onChange={(e) => setEditForm((p) => ({ ...p, group: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="indices">Indices</option>
                      <option value="indices-sectoriels-nouveaux">Indices sectoriels nouveaux</option>
                      <option value="indices-sectoriels-anciens">Indices sectoriels anciens</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Description de l'indice pour aider les utilisateurs à comprendre"
                  />
                </div>

                {/* Note d'aide améliorée */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-yellow-800 text-sm">
                      <p className="font-medium mb-2">
                        💡 Guide complet pour débutants :
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-medium mb-1">
                            📊 Ce que vous devez remplir :
                          </p>
                          <ul className="space-y-1">
                            <li>
                              • <strong>Nom :</strong> Ex: "Or", "BRVM
                              Composite"
                            </li>
                            <li>
                              • <strong>Valeur :</strong> Le prix actuel (ex:
                              185.42)
                            </li>
                            <li>
                              • <strong>Variation :</strong> +4.28 si ça monte,
                              -2.15 si ça baisse
                            </li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-1">
                            ✨ Ce qui se fait automatiquement :
                          </p>
                          <ul className="space-y-1">
                            <li>
                              • <strong>Pourcentage :</strong> Calculé
                              automatiquement
                            </li>
                            <li>
                              • <strong>Couleur :</strong> Vert si +, Rouge si -
                            </li>
                            <li>
                              • <strong>Date :</strong> Mise à jour automatique
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-green-100 rounded border border-green-200">
                        <p className="font-medium text-green-800">
                          🎯 Nouveau système : Entrez l'ancienne valeur et la
                          nouvelle valeur. La variation et le pourcentage se
                          calculent automatiquement !
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditForm({});
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={addNewIndex}
                  disabled={
                    !editForm.name || !editForm.symbol || !editForm.value
                  }
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter l'indice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
