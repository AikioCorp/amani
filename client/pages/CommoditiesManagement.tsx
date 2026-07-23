import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  DollarSign,
  Minus,
  RefreshCcw,
  Activity,
  Search,
  Eye,
  EyeOff,
  Filter,
  X,
  ArrowUpDown,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCommodities, CommodityPoint } from "../hooks/useCommodities";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

export default function CommoditiesManagement() {
  const { user, hasPermission } = useAuth();
  const { fetchCommodities, loading } = useCommodities();
  const [commodities, setCommodities] = useState<CommodityPoint[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTrend, setSelectedTrend] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"name" | "change" | "price">("name");
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  // Modal d'ajout de matière première
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "Agriculture",
    price: "",
    unit: "USD / Tonne",
    changePercent: "+0.0%",
  });

  const handleAddCommodity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price.trim()) {
      toastError("Champs requis", "Veuillez indiquer au moins le nom et le prix de la matière.");
      return;
    }

    const isPositive = !formData.changePercent.includes("-");
    const newPoint: CommodityPoint = {
      id: `custom_${Date.now()}`,
      code: formData.code.toUpperCase() || formData.name.substring(0, 4).toUpperCase(),
      name: formData.name,
      category: formData.category,
      latest: {
        id: `lat_${Date.now()}`,
        commodity_id: `custom_${Date.now()}`,
        recorded_at: new Date().toISOString(),
        close: `${formData.price} ${formData.unit}`,
        change_percent: formData.changePercent,
        direction: isPositive ? "up" : "down",
      },
    };

    setCommodities((prev) => [newPoint, ...prev]);
    toastSuccess("Matière ajoutée", `La matière première ${formData.name} a été ajoutée avec succès.`);
    setIsAddModalOpen(false);
    setFormData({
      name: "",
      code: "",
      category: "Agriculture",
      price: "",
      unit: "USD / Tonne",
      changePercent: "+0.0%",
    });
  };

  // Édition & Suppression
  const [editingCommodity, setEditingCommodity] = useState<CommodityPoint | null>(null);

  const handleUpdateCommodity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommodity) return;

    setCommodities((prev) =>
      prev.map((item) =>
        item.id === editingCommodity.id ? editingCommodity : item
      )
    );
    toastSuccess("Mise à jour réussie", `La matière ${editingCommodity.name} a été modifiée.`);
    setEditingCommodity(null);
  };

  const handleDeleteCommodity = (id: string, name: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer la matière première "${name}" ?`)) {
      setCommodities((prev) => prev.filter((item) => item.id !== id));
      toastSuccess("Suppression effectuée", `La matière première ${name} a été supprimée.`);
    }
  };

  const loadAll = async () => {
    try {
      const data = await fetchCommodities();
      setCommodities(data);
    } catch (e: any) {
      toastError("Erreur", e?.message || "Erreur de chargement des matières premières");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleHide = (id: string) => {
    setHiddenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Categories derivation
  const categories = useMemo(() => {
    const set = new Set<string>();
    commodities.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [commodities]);

  const filteredCommodities = useMemo(() => {
    return commodities
      .filter((item) => {
        const isHidden = hiddenIds.includes(item.id);
        if (!showHidden && isHidden) return false;

        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory =
          selectedCategory === "all" || item.category === selectedCategory;

        const matchesTrend =
          selectedTrend === "all" ||
          (selectedTrend === "up" && item.latest?.direction === "up") ||
          (selectedTrend === "down" && item.latest?.direction === "down");

        return matchesSearch && matchesCategory && matchesTrend;
      })
      .sort((a, b) => {
        if (sortOrder === "name") return a.name.localeCompare(b.name);
        if (sortOrder === "change") {
          const valA = parseFloat(a.latest?.change_percent?.replace("%", "") || "0");
          const valB = parseFloat(b.latest?.change_percent?.replace("%", "") || "0");
          return valB - valA;
        }
        if (sortOrder === "price") {
          const valA = parseFloat(String(a.latest?.close || 0).replace(/[^\d.-]/g, ""));
          const valB = parseFloat(String(b.latest?.close || 0).replace(/[^\d.-]/g, ""));
          return valB - valA;
        }
        return 0;
      });
  }, [commodities, searchTerm, selectedCategory, selectedTrend, sortOrder, hiddenIds, showHidden]);

  if (!user || !hasPermission("view_indices")) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-none border border-gray-200 p-8 max-w-md mx-auto text-center">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-4">Accès refusé</h2>
          <p className="text-sm font-medium text-gray-600">Vous n'avez pas les permissions nécessaires pour voir les matières premières.</p>
        </div>
      </div>
    );
  }

  const getTrend = (dir?: string | null) => {
    if (dir === "up") return { Icon: TrendingUp, color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (dir === "down") return { Icon: TrendingDown, color: "text-red-700 bg-red-50 border-red-200" };
    return { Icon: Minus, color: "text-gray-700 bg-gray-50 border-gray-200" };
  };

  const hasActiveFilters = searchTerm !== "" || selectedCategory !== "all" || selectedTrend !== "all";

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Matières premières</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Monitoring & suivi des cours internationaux</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white border border-indigo-600 text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter une matière
          </button>
          <button
            onClick={() => setShowHidden(!showHidden)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${
              showHidden ? "bg-amber-500 text-white border-amber-500" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showHidden ? "Masquer éléments archivés" : `Éléments masqués (${hiddenIds.length})`}
          </button>
          <button
            onClick={loadAll}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white border border-gray-900 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Modern Flat Filter System */}
      <div className="bg-white border border-gray-200 p-6 space-y-6">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            Toutes les matières ({commodities.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-gray-900 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Secondary Filters Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une matière (ex: Or, Cacao, Sucre, Pétrole)..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 text-sm font-medium focus:outline-none focus:border-gray-900 focus:bg-white transition-all placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Trend & Sort Dropdowns */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Trend Filter */}
            <div className="flex items-center border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setSelectedTrend("all")}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                  selectedTrend === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedTrend("up")}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors ${
                  selectedTrend === "up" ? "bg-emerald-600 text-white" : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Hausse
              </button>
              <button
                onClick={() => setSelectedTrend("down")}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors ${
                  selectedTrend === "down" ? "bg-red-600 text-white" : "text-red-700 hover:bg-red-50"
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                Baisse
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-widest">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-transparent focus:outline-none cursor-pointer font-bold text-gray-900 uppercase text-xs"
              >
                <option value="name">Trier: Nom A-Z</option>
                <option value="change">Trier: Variation (%)</option>
                <option value="price">Trier: Cours ($)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedTrend("all");
                }}
                className="p-2 border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors"
                title="Réinitialiser les filtres"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{filteredCommodities.length} / {commodities.length}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Actifs suivis</div>
          </div>
        </div>
      </div>

      {/* Commodities List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading && commodities.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCcw className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
            Chargement des cours...
          </div>
        ) : filteredCommodities.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Aucune donnée trouvée</h3>
            <p className="text-slate-500">Ajustez votre recherche ou les filtres d'affichage.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCommodities.map((item) => {
              const trend = getTrend(item.latest?.direction);
              const isHidden = hiddenIds.includes(item.id);
              return (
                <div key={item.id} className={`p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${isHidden ? "opacity-50 bg-slate-50/50" : ""}`}>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                      {item.code && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600">
                          {item.code}
                        </span>
                      )}
                      {item.category && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                          {item.category}
                        </span>
                      )}
                      {isHidden && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                          Masqué
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-slate-500 mt-1 max-w-2xl">{item.description}</p>
                    )}
                    <div className="text-xs text-slate-400 mt-2 font-medium">Source: {item.source || "Global Markets"}</div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleHide(item.id)}
                        className="p-2 text-slate-400 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-white transition-colors"
                        title={isHidden ? "Afficher cette matière" : "Masquer cette matière"}
                      >
                        {isHidden ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                      </button>
                      <button
                        onClick={() => setEditingCommodity(item)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 rounded-lg border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 transition-colors"
                        title="Éditer cette matière"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCommodity(item.id, item.name)}
                        className="p-2 text-red-600 hover:text-red-800 rounded-lg border border-red-100 bg-red-50/50 hover:bg-red-100 transition-colors"
                        title="Supprimer cette matière"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent ${trend.color.replace('bg-', 'bg-').replace('50', '50/50')}`}>
                        <trend.Icon className="w-5 h-5" />
                        <span className="text-xl font-black">{item.latest?.close || "-"}</span>
                        <span className="text-sm font-semibold">{item.currency}/{item.unit}</span>
                        <span className="text-sm font-bold ml-2">({item.latest?.change_percent || "0.0"}%)</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Mise à jour: {item.latest?.as_of || item.latest?.created_at || "-"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal d'ajout de matière première */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Ajouter une nouvelle matière première
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddCommodity} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nom de la matière première *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Lithium, Café Robusta, Nickel"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Code / Ticker
                </label>
                <input
                  type="text"
                  placeholder="Ex: LITH, COFF"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Agriculture">Agriculture</option>
                  <option value="Énergie">Énergie</option>
                  <option value="Métaux précieux">Métaux précieux</option>
                  <option value="Mines & Métaux">Mines & Métaux</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Prix / Cours actuel *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 1 250"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Unité
                </label>
                <input
                  type="text"
                  placeholder="Ex: USD / Tonne, USD / oz"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Variation (%)
              </label>
              <input
                type="text"
                placeholder="Ex: +1.5% ou -0.8%"
                value={formData.changePercent}
                onChange={(e) => setFormData({ ...formData, changePercent: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
              >
                Ajouter la matière
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition de matière première */}
      <Dialog open={!!editingCommodity} onOpenChange={() => setEditingCommodity(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-indigo-600" />
              Éditer la matière première
            </DialogTitle>
          </DialogHeader>

          {editingCommodity && (
            <form onSubmit={handleUpdateCommodity} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nom de la matière première
                </label>
                <input
                  type="text"
                  required
                  value={editingCommodity.name}
                  onChange={(e) => setEditingCommodity({ ...editingCommodity, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Code / Ticker
                  </label>
                  <input
                    type="text"
                    value={editingCommodity.code || ""}
                    onChange={(e) => setEditingCommodity({ ...editingCommodity, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={editingCommodity.category || ""}
                    onChange={(e) => setEditingCommodity({ ...editingCommodity, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Cours / Prix
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCommodity.latest?.close || ""}
                    onChange={(e) =>
                      setEditingCommodity({
                        ...editingCommodity,
                        latest: { ...editingCommodity.latest, close: e.target.value } as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Variation (%)
                  </label>
                  <input
                    type="text"
                    value={editingCommodity.latest?.change_percent || ""}
                    onChange={(e) =>
                      setEditingCommodity({
                        ...editingCommodity,
                        latest: { ...editingCommodity.latest, change_percent: e.target.value } as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCommodity(null)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
