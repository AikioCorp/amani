import React from "react";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useIndices, type Indice } from "../../hooks/useIndices";

function computeChange(current?: string | null, previous?: string | null) {
  const a = parseFloat(current || "");
  const b = parseFloat(previous || "");
  if (isNaN(a) || isNaN(b)) return { change: "0", isPositive: true };
  const diff = a - b;
  return { change: `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}`, isPositive: diff >= 0 };
}

function map(row: Indice) {
  const current = row.indice_data?.currentValue || "0";
  const previous = row.indice_data?.previousValue || null;
  const { change, isPositive } = computeChange(current, previous);
  return {
    id: row.id,
    title: row.title,
    code: row.indice_data?.code || "",
    value: current,
    unit: row.indice_data?.unit,
    change,
    changePercent: row.indice_data?.changePercent || "0%",
    isPositive,
  };
}

export default function IndicesStrip({ limit = 8 }: { limit?: number }) {
  const { fetchIndices } = useIndices();
  const [items, setItems] = React.useState<ReturnType<typeof map>[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const rows = await fetchIndices({ status: "published", limit });
        setItems(rows.map(map));
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchIndices, limit]);

  if (loading) {
    return (
      <div className="w-full p-4 bg-white rounded-xl shadow border border-gray-200">
        <div className="animate-pulse h-6 bg-gray-200 rounded w-40 mb-3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-white rounded-xl shadow border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Marchés & Indices</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((it) => (
          <div key={it.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 mb-1">{it.code || it.title}</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xl font-bold text-gray-900">{it.value}</div>
                {it.unit && <div className="text-xs text-gray-500">{it.unit}</div>}
              </div>
              <div className={`text-sm font-semibold ${it.isPositive ? "text-green-600" : "text-red-600"}`}>
                <div className="flex items-center gap-1">
                  {it.isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {it.change}
                </div>
                <div className="text-xs text-gray-500 text-right">{it.changePercent}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
