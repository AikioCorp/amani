import { ReactNode, useEffect, useState, createContext, useContext, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Settings,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  User as UserIcon,
  Crown,
  LogOut,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import Sidebar from "./nav/Sidebar";

const DashboardContext = createContext<boolean>(false);

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isNested = useContext(DashboardContext);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sidebar:collapsed") === "1";
    } catch {
      return false;
    }
  });

  // Top header state
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (!isNested) {
        localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
      }
    } catch {}
  }, [collapsed, isNested]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/actualites?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

  // If this layout is used inside another layout
  if (isNested) {
    return (
      <div className="space-y-8">
        {(title || subtitle || actions) && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 pb-6 border-b border-gray-200">
            <div>
              {title && <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{title}</h1>}
              {subtitle && <p className="text-sm text-gray-500 mt-2 font-medium">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    );
  }

  const userInitials = `${user?.firstName?.[0] || user?.first_name?.[0] || 'A'}${user?.lastName?.[0] || user?.last_name?.[0] || ''}`;

  return (
    <DashboardContext.Provider value={true}>
      <div className="min-h-screen bg-[#E5DDD2] flex">
        {/* Sidebar */}
        <Sidebar collapsed={collapsed} />

        {/* Right column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="bg-white shadow-xs border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-40">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => setCollapsed((v) => !v)}
                  aria-label={collapsed ? "Ouvrir la sidebar" : "Réduire la sidebar"}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                  title={collapsed ? "Déployer" : "Réduire"}
                >
                  {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                </button>
                {title && (
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-amani-primary">{title}</h1>
                    {subtitle && <p className="text-gray-600 text-xs mt-0.5">{subtitle}</p>}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un article, dossier..."
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9C8464] focus:border-transparent text-xs w-64 transition-all bg-gray-50 focus:bg-white"
                  />
                </form>

                {/* Notifications Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setShowNotifications((v) => !v)}
                    className="relative p-2 text-gray-600 hover:text-amani-primary hover:bg-gray-100 rounded-xl transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-[#373B3A]">Notifications</h4>
                          {unreadNotifications > 0 && (
                            <span className="px-2 py-0.5 bg-[#9C8464]/10 text-[#9C8464] text-[10px] font-extrabold rounded-full">
                              {unreadNotifications} nouvelles
                            </span>
                          )}
                        </div>
                        {unreadNotifications > 0 && (
                          <button
                            onClick={() => setUnreadNotifications(0)}
                            className="text-[11px] font-bold text-[#9C8464] hover:underline"
                          >
                            Tout marquer comme lu
                          </button>
                        )}
                      </div>

                      <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                        <div className="p-3.5 hover:bg-gray-50 transition-colors flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#9C8464]/10 text-[#9C8464] flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-[#373B3A]">Bienvenue sur Amani Finance</div>
                            <div className="text-[11px] text-gray-500 leading-normal">
                              Votre espace membre est activé. Explorez les dernières opportunités et analyses.
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium pt-1">Il y a 10 min</div>
                          </div>
                        </div>

                        <div className="p-3.5 hover:bg-gray-50 transition-colors flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-[#373B3A]">Marchés BRVM à jour</div>
                            <div className="text-[11px] text-gray-500 leading-normal">
                              Les cours et indices de la semaine sont désormais disponibles.
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium pt-1">Il y a 2 heures</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border-t border-gray-100 text-center bg-gray-50/50">
                        <Link
                          to="/dashboard/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="text-xs font-bold text-[#373B3A] hover:text-[#9C8464] transition-colors"
                        >
                          Voir toutes les notifications →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings Link */}
                <Link
                  to="/dashboard/settings"
                  className="p-2 text-gray-600 hover:text-amani-primary hover:bg-gray-100 rounded-xl transition-colors"
                  title="Paramètres"
                >
                  <Settings className="w-5 h-5" />
                </Link>

                {/* User Dropdown Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowUserMenu((v) => !v)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Menu profil"
                  >
                    <div className="w-8 h-8 bg-[#373B3A] text-[#9C8464] rounded-full flex items-center justify-center text-xs font-black shadow-xs">
                      {userInitials}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="font-bold text-sm text-[#373B3A] truncate">
                          {user?.firstName || user?.first_name} {user?.lastName || user?.last_name}
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</div>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#373B3A] text-[#9C8464] rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                          <Crown className="w-3 h-3 text-[#9C8464]" />
                          {user?.role || "Membre"}
                        </div>
                      </div>

                      {/* Links */}
                      <div className="p-1 space-y-0.5">
                        <Link
                          to="/dashboard/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-gray-500" /> Mon Profil
                        </Link>
                        <Link
                          to="/pricing"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <Crown className="w-4 h-4 text-[#9C8464]" /> Offres & Abonnements
                        </Link>
                        <Link
                          to="/dashboard/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-500" /> Réglages du Compte
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 p-1 mt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-red-500" /> Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {actions && <div className="flex items-center gap-2">{actions}</div>}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
