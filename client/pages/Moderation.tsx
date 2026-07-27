import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getSessionToken } from "../services/authService";
import { API_BASE_URL } from "../services/apiConfig";
import {
  Shield,
  Flag,
  MessageSquare,
  Eye,
  Check,
  X,
  AlertTriangle,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";

interface CommentItem {
  id: string;
  author: string;
  email?: string;
  content: string;
  articleTitle: string;
  created_at: string;
  status: "approved" | "pending" | "hidden";
}

function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Moderation() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);

  // Simulation d'une liste de modération propre et réactive
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setComments([
        {
          id: "c1",
          author: "Ibrahim K.",
          email: "ibrahim@example.com",
          content: "Excellente analyse sur la production cotonnière au Mali et les perspectives de transformation locale.",
          articleTitle: "Industrie du Coton & Transformation Locale",
          created_at: new Date().toLocaleDateString("fr-FR"),
          status: "approved",
        },
        {
          id: "c2",
          author: "Oumar T.",
          email: "oumar@example.com",
          content: "Merci pour les précisions sur les rendements des obligations BRVM de la semaine.",
          articleTitle: "Revue Hebdomadaire des Indices BRVM",
          created_at: new Date().toLocaleDateString("fr-FR"),
          status: "approved",
        },
      ]);
      setLoading(false);
    }, 400);
  }, []);

  const handleApprove = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "approved" } : c))
    );
    success("Approuvé", "Le commentaire a été validé et publié.");
  };

  const handleHide = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "hidden" } : c))
    );
    success("Masqué", "Le commentaire a été masqué publiquement.");
  };

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    success("Supprimé", "Le commentaire a été supprimé définitvement.");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-[#9C8464]" /> Modération des Commentaires & Echanges
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Supervisez les échanges de la communauté, validez ou masquez les avis en direct.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-wider">Commentaires Approuvés</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
              {comments.filter((c) => c.status === "approved").length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-wider">En Révision</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-0.5">
              {comments.filter((c) => c.status === "pending").length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <X className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-wider">Masqués / Masquages</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-0.5">
              {comments.filter((c) => c.status === "hidden").length}
            </p>
          </div>
        </div>
      </div>

      {/* Liste des Commentaires */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-xs text-gray-700 uppercase tracking-wider">
          Commentaires récents sur la plateforme
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#9C8464]" /> Chargement des commentaires...
          </div>
        ) : comments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucun commentaire à moderer actuellement.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map((item) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4 hover:bg-stone-50/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{item.author}</span>
                    <span className="text-xs text-gray-400">({item.email})</span>
                    <span className="text-[10px] font-extrabold text-[#9C8464] bg-[#9C8464]/10 px-2 py-0.5 rounded-full">
                      Article : {item.articleTitle}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed pt-1">"{item.content}"</p>
                  <span className="text-[11px] text-gray-400 font-medium block pt-1">{item.created_at}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {item.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> Approuver
                    </button>
                  )}
                  {item.status !== "hidden" && (
                    <button
                      onClick={() => handleHide(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" /> Masquer
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
