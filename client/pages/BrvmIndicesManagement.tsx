import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useBrvmIndices, BrvmIndexWithLatest, BrvmIndexGroup } from "../hooks/useBrvmIndices";
import { BarChart3, TrendingDown, TrendingUp, Minus, RefreshCcw, Plus } from "lucide-react";

export default function BrvmIndicesManagement() {
  const { user, hasPermission } = useAuth();
  const { error: toastError } = useToast();
  const { fetchGroups, fetchIndicesWithLatest, loading, createGroup, createIndex, addPoint } = useBrvmIndices();
  const [groups, setGroups] = useState<BrvmIndexGroup[]>([]);
  const [items, setItems] = useState<BrvmIndexWithLatest[]>([]);
  const [err, setErr] = useState<string | null>(null);

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

  if (!user || !hasPermission("create_indices")) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-amani-primary mb-4">Accès refusé</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour gérer les indices BRVM.</p>
        </div>
      </div>
    );
  }

  const grouped = useMemo(() => {
    const map = new Map<string, BrvmIndexWithLatest[]>();
    for (const it of items) {
      const key = it.group?.slug || it.group_id || "autres";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return map;
  }, [items]);

  const groupLabel = (slugOrId: string) => {
    const g = groups.find((x) => x.slug === slugOrId || x.id === slugOrId);
    return g?.name || slugOrId;
  };

  const getTrend = (dir?: string | null) => {
    if (dir === "up") return { Icon: TrendingUp, color: "text-green-600 bg-green-50" } as const;
    if (dir === "down") return { Icon: TrendingDown, color: "text-red-600 bg-red-50" } as const;
    return { Icon: Minus, color: "text-gray-600 bg-gray-50" } as const;
  };

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amani-primary">Indices BRVM</h1>
          <p className="text-gray-600 mt-1">Gestion des indices migrés vers le nouveau schéma BRVM</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAll} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 rounded border text-sm hover:bg-gray-50">
            <RefreshCcw className="w-4 h-4" /> Rafraîchir
          </button>
          <Link to="/dashboard/indices-help" className="inline-flex items-center gap-2 px-3 py-2 rounded bg-amani-primary text-white text-sm hover:bg-amani-primary/90">
            <Plus className="w-4 h-4" /> Aide indices
          </Link>
        </div>
      </div>

      {err && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded">{err}</div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
          <div className="p-2 bg-blue-100 rounded-lg w-fit mb-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-amani-primary">{items.length}</div>
          <div className="text-sm text-gray-600">Total indices</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
          <div className="text-2xl font-bold text-amani-primary">{groups.length}</div>
          <div className="text-sm text-gray-600">Groupes</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
          <div className="text-2xl font-bold text-amani-primary">{Array.from(grouped.keys()).length}</div>
          <div className="text-sm text-gray-600">Sections</div>
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-8">
        {Array.from(grouped.entries()).map(([key, arr]) => (
          <div key={key} className="bg-white rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-amani-primary">{groupLabel(key)}</h2>
              <div className="text-sm text-gray-500">{arr.length} indice(s)</div>
            </div>
            <div className="divide-y divide-gray-100">
              {arr.map((it) => {
                const t = getTrend(it.latest?.direction ?? undefined);
                return (
                  <div key={it.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-semibold text-amani-primary">{it.name}</div>
                          {it.code && (
                            <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{it.code}</code>
                          )}
                          {!it.is_public && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">Privé</span>
                          )}
                        </div>
                        {it.description && (
                          <p className="text-sm text-gray-600 mt-1 max-w-2xl line-clamp-2">{it.description}</p>
                        )}
                        <div className="mt-2 text-xs text-gray-500">Source: {it.source || "-"}</div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-2 rounded ${t.color}`}>
                        <t.Icon className="w-4 h-4" />
                        <span className="font-semibold text-lg">{it.latest?.close ?? "-"}</span>
                        {it.unit === "percent" && <span>%</span>}
                        <span className="text-sm">({it.latest?.change_percent ?? "0.00"}%)</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                      <div>Dernière mise à jour: {it.latest?.created_at ?? "-"}</div>
                      <div className="flex items-center gap-2">
                        {/* Monitor-only view */}
                        <span className="text-gray-400 text-xs italic">Mis à jour via Scraper</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!items.length && !loading && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-white/50">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun indice BRVM</h3>
          <p className="text-gray-600">Commencez par configurer les groupes et importer des points d'indices.</p>
        </div>
      )}

    </div>
  );
}

