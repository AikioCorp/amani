import { useEffect, useState } from "react";
<<<<<<< HEAD


=======
>>>>>>> 591d86e4f624d202725739400380e7433b6bf43c

type Row = {
  code: string | null;
  name: string | null;
  latest_close: number | null;
  latest_change: number | null;
  latest_change_percent: number | null;
  latest_at: string | null;
};

export default function BrvmLatest() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname.includes("127.0.0.1"));
    const API_BASE = isLocal ? "http://localhost:5000/api" : "/api";

    (async () => {
      setLoading(true);
      setError(null);
      try {
<<<<<<< HEAD
        const res = await fetch("http://localhost:5000/api/brvm");
        if (!res.ok) throw new Error("Erreur de chargement de l'API");
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Erreur API");
        const brvmData = json.data;
        
        const mappedRows: Row[] = [];
        
        if (brvmData.composite) {
          mappedRows.push({
            code: "COMPOSITE",
            name: brvmData.composite.name,
            latest_close: parseFloat(brvmData.composite.value.toString().replace(/[^0-9.-]/g, "")) || 0,
            latest_change: parseFloat(brvmData.composite.change.toString().replace(/[^0-9.-]/g, "")) || 0,
            latest_change_percent: parseFloat(brvmData.composite.changePercent.toString().replace(/[^0-9.-]/g, "")) || 0,
            latest_at: brvmData.composite.lastUpdate
          });
        }
        
        if (brvmData.sectoriels && Array.isArray(brvmData.sectoriels)) {
          brvmData.sectoriels.forEach((idx: any) => {
            mappedRows.push({
              code: idx.name.substring(0, 8).toUpperCase(),
              name: idx.name,
              latest_close: parseFloat(idx.value.toString().replace(/[^0-9.-]/g, "")) || 0,
              latest_change: parseFloat(idx.change.toString().replace(/[^0-9.-]/g, "")) || 0,
              latest_change_percent: parseFloat(idx.changePercent.toString().replace(/[^0-9.-]/g, "")) || 0,
              latest_at: idx.lastUpdate
            });
          });
        }
        
        setRows(mappedRows);
=======
        const resp = await fetch(`${API_BASE}/brvm`);
        if (!resp.ok) throw new Error("Erreur de récupération des données BRVM");
        const result = await resp.json();
        
        if (!isMounted) return;

        if (result.success && result.data) {
          const data = result.data;
          const compositeRow: Row = {
            code: "COMPOSITE",
            name: data.composite.name,
            latest_close: parseFloat(data.composite.value) || null,
            latest_change: parseFloat(data.composite.change) || null,
            latest_change_percent: parseFloat(data.composite.changePercent?.replace(/[^\d.-]/g, "")) || null,
            latest_at: data.composite.lastUpdate || data.timestamp || null,
          };

          const sectorialRows: Row[] = (data.sectoriels || []).map((s: any, idx: number) => ({
            code: `SECT-${idx + 1}`,
            name: s.name,
            latest_close: parseFloat(s.value) || null,
            latest_change: parseFloat(s.change) || null,
            latest_change_percent: parseFloat(s.changePercent?.replace(/[^\d.-]/g, "")) || null,
            latest_at: s.lastUpdate || data.timestamp || null,
          }));

          setRows([compositeRow, ...sectorialRows]);
        }
>>>>>>> 591d86e4f624d202725739400380e7433b6bf43c
      } catch (e: any) {
        if (isMounted) {
          setError(e.message || "Erreur de chargement");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => { isMounted = false; };
  }, []);


  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
        <h1 className="text-2xl font-bold text-amani-primary mb-4">BRVM — Derniers points</h1>
        {loading && <div className="text-gray-600">Chargement…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Nom</th>
                  <th className="py-2 pr-4">Dernier</th>
                  <th className="py-2 pr-4">Variation</th>
                  <th className="py-2 pr-4">% Var</th>
                  <th className="py-2 pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const isPos = (r.latest_change ?? 0) >= 0;
                  return (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="py-2 pr-4 font-mono text-xs">{r.code ?? "-"}</td>
                      <td className="py-2 pr-4">{r.name ?? "-"}</td>
                      <td className="py-2 pr-4">{r.latest_close ?? "-"}</td>
                      <td className={`py-2 pr-4 ${isPos ? "text-green-600" : "text-red-600"}`}>
                        {r.latest_change ?? "-"}
                      </td>
                      <td className="py-2 pr-4">{r.latest_change_percent ?? "-"}%</td>
                      <td className="py-2 pr-4 text-xs text-gray-500">{r.latest_at ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
