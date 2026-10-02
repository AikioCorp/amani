import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import DashboardLayout from "../components/DashboardLayout";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Save,
  Upload,
  Download,
  BarChart3,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Minus,
} from "lucide-react";

interface MarketData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  category: "indices" | "actions" | "devises" | "commodities";
  market: string;
  lastUpdate: string;
  status: "active" | "inactive" | "suspended";
}

export default function MarketDataManagement() {
  const { user, hasPermission } = useAuth();
  const { success, error, warning } = useToast();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingItem, setEditingItem] = useState<MarketData | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Vérification des permissions
  if (!user || !hasPermission("create_indices")) {
    return (
      <DashboardLayout
        title="Accès refusé"
        subtitle="Permissions insuffisantes"
      >
        <div className="flex items-center justify-center py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Accès refusé
            </h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas les permissions nécessaires pour gérer les données
              de marché.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Données de démo
  const [marketData, setMarketData] = useState<MarketData[]>([
    {
      id: "1",
      symbol: "BRVM10",
      name: "Indice BRVM 10",
      price: 157.42,
      change: 2.34,
      changePercent: 1.51,
      volume: 1250000,
      marketCap: 850000000,
      category: "indices",
      market: "BRVM",
      lastUpdate: "2024-03-15T15:30:00Z",
      status: "active",
    },
    {
      id: "2",
      symbol: "SONATEL",
      name: "Sonatel Sénégal",
      price: 18500,
      change: -250,
      changePercent: -1.33,
      volume: 450000,
      marketCap: 425000000,
      category: "actions",
      market: "BRVM",
      lastUpdate: "2024-03-15T15:30:00Z",
      status: "active",
    },
    {
      id: "3",
      symbol: "XOF/USD",
      name: "Franc CFA / Dollar US",
      price: 0.00165,
      change: 0.000012,
      changePercent: 0.73,
      volume: 25000000,
      marketCap: 0,
      category: "devises",
      market: "Forex",
      lastUpdate: "2024-03-15T15:32:00Z",
      status: "active",
    },
    {
      id: "4",
      symbol: "GOLD",
      name: "Or (Once)",
      price: 2045.3,
      change: -12.5,
      changePercent: -0.61,
      volume: 180000,
      marketCap: 0,
      category: "commodities",
      market: "Commodités",
      lastUpdate: "2024-03-15T15:28:00Z",
      status: "active",
    },
  ]);

  const categories = [
    { value: "all", label: "Toutes catégories" },
    { value: "indices", label: "Indices" },
    { value: "actions", label: "Actions" },
    { value: "devises", label: "Devises" },
    { value: "commodities", label: "Matières premières" },
  ];

  const filteredData = marketData.filter((item) => {
    const matchesSearch =
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSave = (item: MarketData) => {
    if (editingItem) {
      setMarketData((prev) => prev.map((d) => (d.id === item.id ? item : d)));
      success("Mis à jour", `${item.symbol} mis à jour avec succès`);
    } else {
      const newItem = {
        ...item,
        id: Date.now().toString(),
        lastUpdate: new Date().toISOString(),
      };
      setMarketData((prev) => [...prev, newItem]);
      success("Ajouté", `${item.symbol} ajouté avec succès`);
    }
    setEditingItem(null);
    setShowNewForm(false);
  };

  const handleDelete = (id: string) => {
    const item = marketData.find((d) => d.id === id);
    if (
      item &&
      confirm(`Êtes-vous sûr de vouloir supprimer ${item.symbol} ?`)
    ) {
      setMarketData((prev) => prev.filter((d) => d.id !== id));
      warning("Supprimé", `${item.symbol} supprimé`);
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Minus;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.label : category;
  };

  const stats = [
    {
      label: "Total instruments",
      value: marketData.length.toString(),
      icon: BarChart3,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "En hausse",
      value: marketData.filter((d) => d.change > 0).length.toString(),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "En baisse",
      value: marketData.filter((d) => d.change < 0).length.toString(),
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      label: "Actifs",
      value: marketData.filter((d) => d.status === "active").length.toString(),
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  return (
    <DashboardLayout
      title="Gestion des Données de Marché"
      subtitle="Gérez les cotations et données financières en temps réel"
      actions={
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            Ajouter instrument
          </button>

          <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg px-4 py-2.5 min-w-[300px] shadow-sm">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par symbole ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-sm placeholder-gray-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Liste des données */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Instruments Financiers ({filteredData.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instrument
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marché
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => {
                  const ChangeIcon = getChangeIcon(item.change);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.symbol}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {getCategoryLabel(item.category)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.category === "devises"
                            ? item.price.toFixed(6)
                            : item.price.toLocaleString()}
                          {item.category === "devises"
                            ? ""
                            : item.category === "commodities"
                              ? " $"
                              : item.market === "BRVM"
                                ? " FCFA"
                                : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(item.change)}`}
                        >
                          <ChangeIcon className="w-4 h-4" />
                          {item.change > 0 ? "+" : ""}
                          {item.change.toLocaleString()}
                          <span className="text-xs">
                            ({item.changePercent > 0 ? "+" : ""}
                            {item.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.volume.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {item.market}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === "active"
                              ? "bg-green-100 text-green-800"
                              : item.status === "inactive"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status === "active"
                            ? "Actif"
                            : item.status === "inactive"
                              ? "Inactif"
                              : "Suspendu"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune donnée trouvée
              </h3>
              <p className="text-gray-600 mb-4">
                Aucun instrument ne correspond à vos critères de recherche.
              </p>
              <button
                onClick={() => setShowNewForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                Ajouter le premier instrument
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
