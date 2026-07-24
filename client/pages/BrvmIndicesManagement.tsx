import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useBrvmIndices, BrvmIndexWithLatest, BrvmIndexGroup } from "../hooks/useBrvmIndices";
import { BarChart3, TrendingDown, TrendingUp, Minus, RefreshCcw, Plus, Search, X, ArrowUpDown, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

export default function BrvmIndicesManagement() {
  const { user, hasPermission } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { fetchGroups, fetchIndicesWithLatest, loading } = useBrvmIndices();
  const [groups, setGroups] = useState<BrvmIndexGroup[]>([]);
  const [items, setItems] = useState<BrvmIndexWithLatest[]>([]);
  const [err, setErr] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedTrend, setSelectedTrend] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"name" | "change" | "price">("name");

  // Modal d'ajout & d'édition d'indice / d'action BRVM
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BrvmIndexWithLatest | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "actions",
    price: "",
    changePercent: "+0.00%",
  });

  const handleTogglePublic = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, is_public: !it.is_public } : it))
    );
    toastSuccess("Visibilité modifiée", "Le statut de publication a été mis à jour.");
  };

  const handleUpdateStockIndex = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setItems((prev) =>
      prev.map((it) => (it.id === editingItem.id ? editingItem : it))
    );
    toastSuccess("Modifié avec succès", `Le titre ${editingItem.name} a été mis à jour.`);
    setEditingItem(null);
  };

  const handleDeleteStockIndex = (id: string, name: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le titre "${name}" ?`)) {
      setItems((prev) => prev.filter((it) => it.id !== id));
      toastSuccess("Titre supprimé", `Le titre ${name} a été retiré.`);
    }
  };

  const handleAddStockIndex = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price.trim()) {
      toastError("Champs requis", "Veuillez indiquer au moins le nom et le cours du titre.");
      return;
    }

    const isPositive = !formData.changePercent.includes("-");
    const numPrice = parseFloat(formData.price.replace(/[^\d.-]/g, "")) || 0;
    const newItem: BrvmIndexWithLatest = {
      id: `custom_stock_${Date.now()}`,
      code: formData.code.toUpperCase() || formData.name.substring(0, 4).toUpperCase(),
      name: formData.name,
      description: `Titre BRVM - ${formData.name}`,
      latest: {
        id: `lat_stock_${Date.now()}`,
        indice_id: `custom_stock_${Date.now()}`,
        recorded_at: new Date().toISOString(),
        close: numPrice,
        change_percent: formData.changePercent,
        direction: isPositive ? "up" : "down",
      },
    };

    setItems((prev) => [newItem, ...prev]);
    toastSuccess("Titre ajouté", `Le titre / indice ${formData.name} a été ajouté avec succès.`);
    setIsAddModalOpen(false);
    setFormData({
      name: "",
      code: "",
      category: "actions",
      price: "",
      changePercent: "+0.00%",
    });
  };

  const loadAll = async () => {
    setErr(null);
    try {
      const [g, i] = await Promise.all([fetchGroups(), fetchIndicesWithLatest()]);
      setGroups(g);
      setItems(i);
    } catch (e: any) {
      console.error("[BrvmIndicesManagement] load error", e);
      const msg = e?.message || "Erreur de chargement";
      setErr(msg);
      toastError("Erreur", msg);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const filteredItems = useMemo(() => {
    return items
      .filter((it) => {
        const matchesSearch =
          it.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (it.code && it.code.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesSection =
          selectedSection === "all" ||
          (selectedSection === "indices" && it.name.toUpperCase().includes("BRVM")) ||
          (selectedSection === "actions" && !it.name.toUpperCase().includes("BRVM"));

        const matchesTrend =
          selectedTrend === "all" ||
          (selectedTrend === "up" && it.latest?.direction === "up") ||
          (selectedTrend === "down" && it.latest?.direction === "down");

        return matchesSearch && matchesSection && matchesTrend;
      })
      .sort((a, b) => {
        if (sortOrder === "name") return a.name.localeCompare(b.name);
        if (sortOrder === "change") {
          const valA = parseFloat(String(a.latest?.change_percent || 0).replace("%", ""));
          const valB = parseFloat(String(b.latest?.change_percent || 0).replace("%", ""));
          return valB - valA;
        }
        if (sortOrder === "price") {
          const valA = parseFloat(String(a.latest?.close || 0).replace(/[^\d.-]/g, ""));
          const valB = parseFloat(String(b.latest?.close || 0).replace(/[^\d.-]/g, ""));
          return valB - valA;
        }
        return 0;
      });
  }, [items, searchTerm, selectedSection, selectedTrend, sortOrder]);

  const grouped = useMemo(() => {
    const map = new Map<string, BrvmIndexWithLatest[]>();
    for (const it of filteredItems) {
      const key = it.group?.slug || it.group_id || "Indices & Valeurs BRVM";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return map;
  }, [filteredItems]);

  const groupLabel = (slugOrId: string) => {
    const g = groups.find((x) => x.slug === slugOrId || x.id === slugOrId);
    return g?.name || slugOrId;
  };

  if (!user || !hasPermission("create_indices")) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-none border border-gray-200 p-8 max-w-md mx-auto text-center">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-4">Accès refusé</h2>
          <p className="text-sm font-medium text-gray-600">Vous n'avez pas les permissions nécessaires pour gérer les indices BRVM.</p>
        </div>
      </div>
    );
  }

  const getTrend = (dir?: string | null) => {
    if (dir === "up") return { Icon: TrendingUp, color: "text-emerald-700 bg-emerald-50 border-emerald-200" } as const;
    if (dir === "down") return { Icon: TrendingDown, color: "text-red-700 bg-red-50 border-red-200" } as const;
    return { Icon: Minus, color: "text-gray-700 bg-gray-50 border-gray-200" } as const;
  };

  const hasActiveFilters = searchTerm !== "" || selectedSection !== "all" || selectedTrend !== "all";

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Indices BRVM</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Supervision des cours et indices de la Bourse Régionale des Valeurs Mobilières</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white border border-indigo-600 text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter un indice / titre
          </button>
          <button
            onClick={loadAll}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Rafraîchir
          </button>
          <Link
            to="/dashboard/indices-help"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-900 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            Aide indices
          </Link>
        </div>
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-sm font-bold uppercase tracking-widest">{err}</div>
      )}

      {/* Modern Flat Filter Bar */}
      <div className="bg-white border border-gray-200 p-6 space-y-6">
        {/* Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedSection("all")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
              selectedSection === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            Tous les titres ({items.length})
          </button>
          <button
            onClick={() => setSelectedSection("indices")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
              selectedSection === "indices"
                ? "bg-gray-900 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            Indices Sectoriels BRVM
          </button>
          <button
            onClick={() => setSelectedSection("actions")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
              selectedSection === "actions"
                ? "bg-gray-900 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            Actions & Sociétés
          </button>
        </div>

        {/* Search & Secondary Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un indice ou une action (ex: BRVM Composite, Sonatel, Ecobank)..."
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
                <option value="price">Trier: Cours (FCFA)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSection("all");
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-gray-900">{filteredItems.length} / {items.length}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Titres affichés</div>
            </div>
            <div className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center font-black">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Groups & Items List */}
      <div className="space-y-8">
        {Array.from(grouped.entries()).map(([key, arr]) => (
          <div key={key} className="bg-white border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">{groupLabel(key)}</h2>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{arr.length} titre(s)</div>
            </div>
            <div className="divide-y divide-gray-100">
              {arr.map((it) => {
                const t = getTrend(it.latest?.direction ?? undefined);
                return (
                  <div key={it.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-black text-gray-900">{it.name}</div>
                        {it.code && (
                          <span className="text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 uppercase tracking-wider">{it.code}</span>
                        )}
                        {!it.is_public && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">Privé</span>
                        )}
                      </div>
                      {it.description && (
                        <p className="text-sm text-gray-500 font-medium mt-1 max-w-2xl line-clamp-2">{it.description}</p>
                      )}
                      <div className="mt-2 text-xs font-medium text-gray-400">Source: {it.source || "BRVM"}</div>
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePublic(it.id)}
                          className="p-2 text-slate-400 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-white transition-colors"
                          title={it.is_public === false ? "Rendre public" : "Masquer / Rendre privé"}
                        >
                          {it.is_public === false ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                        </button>
                        <button
                          onClick={() => setEditingItem(it)}
                          className="p-2 text-indigo-600 hover:text-indigo-800 rounded-lg border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 transition-colors"
                          title="Éditer ce titre"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStockIndex(it.id, it.name)}
                          className="p-2 text-red-600 hover:text-red-800 rounded-lg border border-red-100 bg-red-50/50 hover:bg-red-100 transition-colors"
                          title="Supprimer ce titre"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className={`flex items-center gap-2 px-3 py-2 border ${t.color}`}>
                          <t.Icon className="w-5 h-5" />
                          <span className="font-black text-xl">{it.latest?.close ?? "-"}</span>
                          <span className="text-xs font-bold uppercase tracking-wider">{it.currency || "FCFA"}</span>
                          <span className="text-xs font-bold ml-2">({it.latest?.change_percent ?? "0.00"}%)</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                        Mise à jour: {it.latest?.created_at ?? new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!filteredItems.length && !loading && (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-2">Aucun indice trouvé</h3>
          <p className="text-sm text-gray-500 font-medium">Ajustez vos mots-clés ou filtres de recherche.</p>
        </div>
      )}

      {/* Modal d'ajout d'action / indice BRVM */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Ajouter une action ou un indice BRVM
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddStockIndex} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nom de la société / de l'indice *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Coris Bank, Orange Mali, BRVM-Santé"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Symbole / Ticker *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CBI, ORAC, BRVM-SANTE"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Secteur / Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="actions">Actions (Sociétés)</option>
                  <option value="indices">Indices BRVM</option>
                  <option value="obligations">Obligations</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Cours / Prix (FCFA) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 12 500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Variation (%)
                </label>
                <input
                  type="text"
                  placeholder="Ex: +0.80% ou -1.20%"
                  value={formData.changePercent}
                  onChange={(e) => setFormData({ ...formData, changePercent: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
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
                Ajouter le titre
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition de titre / indice BRVM */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-indigo-600" />
              Éditer le titre / indice BRVM
            </DialogTitle>
          </DialogHeader>

          {editingItem && (
            <form onSubmit={handleUpdateStockIndex} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nom du titre / de la société
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Symbole / Ticker
                  </label>
                  <input
                    type="text"
                    value={editingItem.code || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Cours / Prix (FCFA)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.latest?.close ?? ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        latest: {
                          ...editingItem.latest,
                          close: parseFloat(e.target.value) || 0,
                        } as any,
                      })
                    }
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
                  value={editingItem.latest?.change_percent || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      latest: { ...editingItem.latest, change_percent: e.target.value } as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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

