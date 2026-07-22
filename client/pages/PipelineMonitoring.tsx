import React from "react";
import { Activity, RefreshCw, PlayCircle, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { getSessionToken } from "../services/authService";
import { useToast } from "../context/ToastContext";

import { API_BASE_URL } from "../services/apiConfig";

interface SystemJob {
  name: string;
  is_running: boolean;
  last_run_at: string | null;
  last_status: string | null;
  last_error: string | null;
  last_result: any;
}
interface MarketMeta {
  data_status: string;
  source: string | null;
  created_at: string;
}
interface Monitoring {
  jobs: SystemJob[];
  imports: Record<string, number>;
  drafts: Record<string, number>;
  market: { brvm: MarketMeta | null; commodities: MarketMeta | null };
  generatedAt: string;
}

const JOB_LABELS: Record<string, string> = {
  serper_scan: "Scan Serper + génération des brouillons",
  market_refresh: "Rafraîchissement des données de marché",
};

function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function timeAgo(iso: string | null): string {
  if (!iso) return "jamais";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

export default function PipelineMonitoring() {
  const { success, error } = useToast();
  const [data, setData] = React.useState<Monitoring | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [scanning, setScanning] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/monitoring`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      // silencieux : rafraîchissement automatique
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const triggerScan = async () => {
    setScanning(true);
    try {
      const res = await fetch(`${API_BASE_URL}/imports/scan`, {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        success(json.message || "Scan lancé.");
        setTimeout(load, 1500);
      } else {
        error(json.error || "Échec du lancement du scan.");
      }
    } catch (e: any) {
      error(e?.message || "Erreur réseau.");
    } finally {
      setScanning(false);
    }
  };

  const statusBadge = (job: SystemJob) => {
    if (job.is_running)
      return (
        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium">
          <RefreshCw className="w-3 h-3 animate-spin" /> En cours
        </span>
      );
    if (job.last_status === "success")
      return (
        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
          <CheckCircle2 className="w-3 h-3" /> Succès
        </span>
      );
    if (job.last_status === "error")
      return (
        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">
          <XCircle className="w-3 h-3" /> Échec
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium">
        <Clock className="w-3 h-3" /> Jamais exécuté
      </span>
    );
  };

  const statCard = (label: string, value: number, tone: string) => (
    <div className={`rounded-lg p-4 ${tone}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-500">
        <RefreshCw className="w-5 h-5 animate-spin" /> Chargement du monitoring…
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-7 h-7 text-amani-primary" />
          <div>
            <h1 className="text-2xl font-bold">Monitoring du pipeline</h1>
            <p className="text-sm text-gray-500">
              Actualisé {data ? timeAgo(data.generatedAt) : ""} · rafraîchissement auto (30 s)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button
            onClick={triggerScan}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amani-primary text-white hover:opacity-90 text-sm disabled:opacity-50"
          >
            <PlayCircle className="w-4 h-4" /> {scanning ? "Lancement…" : "Lancer un scan"}
          </button>
        </div>
      </div>

      {/* Jobs planifiés */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Jobs planifiés</h2>
      <div className="grid gap-3 md:grid-cols-2 mb-8">
        {(data?.jobs || []).length === 0 && (
          <p className="text-sm text-gray-500">Aucun job n'a encore été exécuté.</p>
        )}
        {(data?.jobs || []).map((job) => (
          <div key={job.name} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{JOB_LABELS[job.name] || job.name}</p>
                <p className="text-xs text-gray-400 font-mono">{job.name}</p>
              </div>
              {statusBadge(job)}
            </div>
            <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" /> Dernière exécution : {timeAgo(job.last_run_at)}
            </div>
            {job.last_result && (
              <p className="mt-2 text-xs text-gray-500 font-mono bg-gray-50 rounded p-2 overflow-x-auto">
                {JSON.stringify(job.last_result)}
              </p>
            )}
            {job.last_status === "error" && job.last_error && (
              <p className="mt-2 text-xs text-red-700 bg-red-50 rounded p-2 flex items-start gap-1">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {job.last_error}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Statistiques */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Imports d'articles</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {statCard("En attente", data?.imports?.pending || 0, "bg-amber-50 text-amber-900")}
        {statCard("Publiés", data?.imports?.processed || 0, "bg-green-50 text-green-900")}
        {statCard("Auto-rejetés", data?.imports?.auto_rejected || 0, "bg-gray-100 text-gray-700")}
        {statCard("À revoir (date)", data?.imports?.needs_date_review || 0, "bg-blue-50 text-blue-900")}
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Brouillons IA</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {statCard("À réviser", data?.drafts?.needs_review || 0, "bg-amber-50 text-amber-900")}
        {statCard("En attente", data?.drafts?.pending || 0, "bg-blue-50 text-blue-900")}
        {statCard("Acceptés", data?.drafts?.accepted || 0, "bg-green-50 text-green-900")}
        {statCard("Rejetés", data?.drafts?.rejected || 0, "bg-gray-100 text-gray-700")}
      </div>

      {/* Données de marché */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Données de marché</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {(["brvm", "commodities"] as const).map((kind) => {
          const m = data?.market?.[kind];
          const live = m?.data_status === "live";
          return (
            <div key={kind} className="border border-gray-200 rounded-lg p-4 bg-white flex items-center justify-between">
              <div>
                <p className="font-medium capitalize">{kind === "brvm" ? "BRVM (indices & actions)" : "Matières premières"}</p>
                <p className="text-xs text-gray-500">
                  {m ? `${m.source || "?"} · rafraîchi ${timeAgo(m.created_at)}` : "aucune donnée"}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  live ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"
                }`}
              >
                {live ? "Temps réel" : "Estimé / indicatif"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
