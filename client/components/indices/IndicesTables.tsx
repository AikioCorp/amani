import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, RefreshCcw } from 'lucide-react';
import { useIndices, Indice } from '../../hooks/useIndices';

type TableRow = {
  id: string;
  name: string;
  previous?: string;
  current?: string;
  changePercent?: string;
  ytdPercent?: string;
  direction?: 'up' | 'down' | 'neutral' | string;
};

const SectionTitle: React.FC<{ title: string }>=({ title })=> (
  <div className="flex items-center justify-between mt-8 mb-2">
    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
  </div>
);

const ValueBadge: React.FC<{ value?: string }>=({ value })=> (
  <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200">{value ?? '-'}</span>
);

const PercentBadge: React.FC<{ value?: string; direction?: string }>=({ value, direction })=> {
  let color = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  let Icon: any = Minus;
  if (direction === 'up') { color = 'bg-green-100 text-green-800'; Icon = ArrowUpRight; }
  if (direction === 'down') { color = 'bg-red-100 text-red-800'; Icon = ArrowDownRight; }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm ${color}`}>
      <Icon size={14} />
      {value ?? '0.00'}
    </span>
  );
};

function mapIndice(i: Indice): TableRow {
  return {
    id: i.id,
    name: i.title ?? i.slug ?? i.id,
    previous: i.indice_data?.previousValue ?? undefined,
    current: i.indice_data?.currentValue ?? undefined,
    changePercent: i.indice_data?.changePercent ?? undefined,
    ytdPercent: i.indice_data?.ytdPercent ?? undefined,
    direction: i.indice_data?.changeDirection ?? 'neutral',
  };
}

function groupTitle(key: string) {
  switch (key) {
    case 'indices':
      return 'Indices';
    case 'indices-sectoriels-nouveaux':
      return 'Indices sectoriels nouveaux';
    case 'indices-sectoriels-anciens':
      return 'Indices sectoriels anciens';
    default:
      return key || 'Autres indices';
  }
}

const LastUpdate: React.FC<{ items: Indice[] }>=({ items })=> {
  const last = useMemo(()=>{
    const dates = items
      .map(i => i.indice_data?.lastUpdated)
      .filter(Boolean) as string[];
    if (!dates.length) return null;
    return dates.sort().at(-1);
  }, [items]);
  if (!last) return null;
  const dt = new Date(last);
  const formatted = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' }).format(dt);
  const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(dt);
  return (
    <div className="text-sm text-gray-500 flex items-center gap-2">
      Dernière mise à jour : {formatted} - {time}
    </div>
  );
};

const IndicesTables: React.FC<{ limitPerGroup?: number }>=({ limitPerGroup = 20 })=> {
  const { fetchIndices, loading } = useIndices();
  const [items, setItems] = useState<Indice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const res = await fetchIndices({ status: 'published', limit: 200 });
      setItems(res);
    } catch (e: any) {
      console.error('[IndicesTables] fetch error', e);
      setError(e?.message || 'Erreur de chargement');
    }
  };

  useEffect(() => { load(); }, []);

  const groups = useMemo(() => {
    const map: Record<string, Indice[]> = {};
    for (const i of items) {
      const g = i.indice_data?.group || 'indices';
      if (!map[g]) map[g] = [];
      map[g].push(i);
    }
    return map;
  }, [items]);

  const renderTable = (groupKey: string, data: Indice[]) => {
    const rows = data.slice(0, limitPerGroup).map(mapIndice);
    return (
      <div key={groupKey} className="mt-4">
        <SectionTitle title={groupTitle(groupKey)} />
        <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fermeture précédente</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fermeture</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variation (%)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variation 31 décembre (%)</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-100 dark:divide-gray-900">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">{r.name}</td>
                  <td className="px-4 py-2"><ValueBadge value={r.previous} /></td>
                  <td className="px-4 py-2"><ValueBadge value={r.current} /></td>
                  <td className="px-4 py-2"><PercentBadge value={r.changePercent} direction={r.direction} /></td>
                  <td className="px-4 py-2"><PercentBadge value={r.ytdPercent} direction={r.ytdPercent && parseFloat(r.ytdPercent) >= 0 ? 'up' : 'down'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Indices</h1>
        <div className="flex items-center gap-3">
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 px-3 py-1.5 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-900">
            <RefreshCcw size={16} /> Rafraîchir
          </button>
          <LastUpdate items={items} />
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}

      {Object.entries(groups).map(([k, arr]) => renderTable(k, arr))}

      {!items.length && !loading && (
        <div className="mt-6 text-sm text-gray-500">Aucun indice trouvé.</div>
      )}
    </div>
  );
};

export default IndicesTables;
