import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  DollarSign,
  Minus,
  RefreshCcw,
  Activity,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCommodities, CommodityPoint } from "../hooks/useCommodities";

export default function CommoditiesManagement() {
  const { user, hasPermission } = useAuth();
  const { fetchCommodities, loading } = useCommodities();
  const [commodities, setCommodities] = useState<CommodityPoint[]>([]);
  const { error: toastError } = useToast();

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

  if (!user || !hasPermission("view_indices")) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto text-center border border-white/50">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Accès refusé</h2>
          <p className="text-slate-600">Vous n'avez pas les permissions nécessaires pour voir les matières premières.</p>
        </div>
      </div>
    );
  }

  const getTrend = (dir?: string | null) => {
    if (dir === "up") return { Icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" };
    if (dir === "down") return { Icon: TrendingDown, color: "text-red-600 bg-red-50" };
    return { Icon: Minus, color: "text-slate-600 bg-slate-50" };
  };

  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Matières premières</h1>
          <p className="text-slate-500 mt-1">Monitoring des cours internationaux (mis à jour automatiquement)</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAll}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{commodities.length}</div>
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
        ) : commodities.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Aucune donnée</h3>
            <p className="text-slate-500">Les cours des matières premières sont temporairement indisponibles.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {commodities.map((item) => {
              const trend = getTrend(item.latest?.direction);
              return (
                <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                    </div>
                    {item.description && (
                      <p className="text-sm text-slate-500 mt-1 max-w-2xl">{item.description}</p>
                    )}
                    <div className="text-xs text-slate-400 mt-2 font-medium">Source: {item.source || "Global Markets"}</div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-2">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent ${trend.color.replace('bg-', 'bg-').replace('50', '50/50')}`}>
                      <trend.Icon className="w-5 h-5" />
                      <span className="text-xl font-black">{item.latest?.close || "-"}</span>
                      <span className="text-sm font-semibold">{item.currency}/{item.unit}</span>
                      <span className="text-sm font-bold ml-2">({item.latest?.change_percent || "0.0"}%)</span>
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
    </div>
  );
}
