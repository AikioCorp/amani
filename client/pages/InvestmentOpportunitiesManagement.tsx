import { useState, useEffect } from "react";
import { API_BASE_URL } from "../services/apiConfig";
import { getSessionToken } from "../services/authService";
import { useToast } from "../context/ToastContext";
import { Plus, Trash2, Edit3, X, Loader2 } from "lucide-react";

interface InvestmentOpportunity {
  id: string;
  title: string;
  category: string;
  risk_level: string;
  expected_return: string;
  min_investment: string;
  time_horizon: string;
  description: string;
  highlights: string[];
  image: string | null;
  status: string;
  funded_percent: number;
}

type FormState = Omit<InvestmentOpportunity, "id"> & { id?: string };

const EMPTY_FORM: FormState = {
  title: "",
  category: "",
  risk_level: "Modéré",
  expected_return: "",
  min_investment: "",
  time_horizon: "",
  description: "",
  highlights: [],
  image: "",
  status: "draft",
  funded_percent: 0,
};

function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function InvestmentOpportunitiesManagement() {
  const { success, error } = useToast();
  const [items, setItems] = useState<InvestmentOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [highlightsInput, setHighlightsInput] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/investments`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setItems(json.data);
      else error(json.error || "Erreur de chargement.");
    } catch (e: any) {
      error(e.message || "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing({ ...EMPTY_FORM });
    setHighlightsInput("");
  };

  const openEdit = (item: InvestmentOpportunity) => {
    setEditing({ ...item });
    setHighlightsInput(item.highlights.join(", "));
  };

  const closeForm = () => setEditing(null);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.category.trim() || !editing.description.trim()) {
      error("Titre, catégorie et description sont requis.");
      return;
    }

    setSaving(true);
    const payload = {
      ...editing,
      highlights: highlightsInput
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
    };
    delete (payload as any).id;

    try {
      const isEdit = !!editing.id;
      const url = isEdit
        ? `${API_BASE_URL}/admin/investments/${editing.id}`
        : `${API_BASE_URL}/admin/investments`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Échec de l'enregistrement.");

      success(isEdit ? "Opportunité mise à jour." : "Opportunité créée.");
      closeForm();
      load();
    } catch (e: any) {
      error(e.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette opportunité d'investissement ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/investments/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Échec de la suppression.");
      success("Opportunité supprimée.");
      load();
    } catch (e: any) {
      error(e.message || "Erreur lors de la suppression.");
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700",
      open: "bg-green-100 text-green-700",
      coming_soon: "bg-blue-100 text-blue-700",
      closed: "bg-red-100 text-red-700",
    };
    const label: Record<string, string> = {
      draft: "Brouillon",
      open: "Ouvert (public)",
      coming_soon: "Bientôt",
      closed: "Fermé",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-700"}`}>
        {label[status] || status}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Opportunités d'investissement</h1>
          <p className="text-sm text-gray-500">
            Gérez les opportunités affichées sur la page publique /investissement. Seules
            celles au statut « Ouvert » ou « Bientôt » y apparaissent.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amani-primary text-white hover:opacity-90 text-sm"
        >
          <Plus className="w-4 h-4" /> Nouvelle opportunité
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Chargement…
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Aucune opportunité pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{item.title}</p>
                  {statusBadge(item.status)}
                </div>
                <p className="text-xs text-gray-500">
                  {item.category} · {item.expected_return} · min. {item.min_investment} · {item.funded_percent}% financé
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(item)}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                  aria-label="Modifier"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 text-red-600"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {editing.id ? "Modifier l'opportunité" : "Nouvelle opportunité"}
              </h2>
              <button onClick={closeForm} aria-label="Fermer">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Titre *</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie *</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="ex: Technologie"
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Niveau de risque</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={editing.risk_level}
                  onChange={(e) => setEditing({ ...editing, risk_level: e.target.value })}
                >
                  <option value="Faible">Faible</option>
                  <option value="Modéré">Modéré</option>
                  <option value="Élevé">Élevé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rendement attendu</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="ex: 12-18%"
                  value={editing.expected_return}
                  onChange={(e) => setEditing({ ...editing, expected_return: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Investissement minimum</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="ex: €25,000"
                  value={editing.min_investment}
                  onChange={(e) => setEditing({ ...editing, min_investment: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horizon</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="ex: 3-5 ans"
                  value={editing.time_horizon}
                  onChange={(e) => setEditing({ ...editing, time_horizon: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">% financé</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={editing.funded_percent}
                  onChange={(e) => setEditing({ ...editing, funded_percent: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Points clés (séparés par des virgules)</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="ex: Marché en croissance, Équipe expérimentée"
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">URL image</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="https://..."
                  value={editing.image || ""}
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                >
                  <option value="draft">Brouillon (masqué)</option>
                  <option value="open">Ouvert (public)</option>
                  <option value="coming_soon">Bientôt (public)</option>
                  <option value="closed">Fermé (public)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={closeForm}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-amani-primary text-white text-sm disabled:opacity-50"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
