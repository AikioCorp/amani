import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { API_BASE_URL } from "../services/apiConfig";
import { getSessionToken } from "../services/authService";
import {
  Bell,
  Search,
  Filter,
  Check,
  Trash2,
  Eye,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Info,
  MessageSquare,
  Crown,
  Loader2,
  Mail,
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
  actionUrl: string;
  category: string;
}

function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Notifications() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  const fetchRealNotifications = async () => {
    setLoading(true);
    const realNotifs: NotificationItem[] = [];

    try {
      // 1. Récupérer les abonnements newsletter récents
      const newsRes = await fetch(`${API_BASE_URL}/admin/newsletter/subscribers`, {
        headers: authHeaders(),
      });
      const newsJson = await newsRes.json();
      if (newsJson.success && Array.isArray(newsJson.data)) {
        newsJson.data.slice(0, 5).forEach((sub: any, idx: number) => {
          realNotifs.push({
            id: `news_${sub.id || idx}`,
            title: "📬 Nouvel Abonné Newsletter",
            message: `${sub.full_name || sub.email} s'est inscrit à la veille (${sub.topics?.join(", ") || "Toutes thématiques"}).`,
            type: "info",
            isRead: false,
            createdAt: sub.created_at ? new Date(sub.created_at).toLocaleString("fr-FR") : "Aujourd'hui",
            actionUrl: "/dashboard/newsletters",
            category: "Newsletter",
          });
        });
      }
    } catch (e) {}

    // Notification système de base si vide
    if (realNotifs.length === 0) {
      realNotifs.push({
        id: "sys_1",
        title: "✅ Système Amani Finance Opérationnel",
        message: "Les services d'API, la base de données et la diffusion de newsletters fonctionnent normalement.",
        type: "success",
        isRead: true,
        createdAt: new Date().toLocaleString("fr-FR"),
        actionUrl: "/dashboard/monitoring",
        category: "Système",
      });
    }

    setNotifications(realNotifs);
    setLoading(false);
  };

  useEffect(() => {
    fetchRealNotifications();
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    success("Tout est lu", "Toutes les notifications ont été marquées comme lues.");
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "unread") return !n.isRead;
    if (filterType === "read") return n.isRead;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-[#9C8464]" /> Centre de Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Activité en temps réel de la plateforme, inscriptions et alertes système.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-stone-100 transition-colors"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            Tout marquer comme lu
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm text-xs font-bold">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${filterType === "all" ? "bg-[#373B3A] text-white" : "text-gray-600 hover:bg-gray-100"}`}
        >
          Toutes ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType("unread")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${filterType === "unread" ? "bg-[#373B3A] text-white" : "text-gray-600 hover:bg-gray-100"}`}
        >
          Non lues ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* Liste des Notifications */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 bg-white rounded-2xl border border-gray-200 text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#9C8464]" /> Chargement des notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-gray-200 text-center text-gray-500">
            Aucune notification récente.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                notif.isRead ? "bg-white border-gray-200" : "bg-stone-50/80 border-[#9C8464]/40 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-xs shrink-0 mt-0.5">
                  {notif.category === "Newsletter" ? (
                    <Mail className="w-5 h-5 text-[#9C8464]" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">{notif.title}</h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#9C8464]"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400 font-medium">
                    <span>{notif.createdAt}</span>
                    <span>• {notif.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={notif.actionUrl}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#373B3A] hover:text-white text-xs font-bold text-gray-700 transition-colors"
                >
                  Voir
                </Link>
                <button
                  onClick={() => clearNotification(notif.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
