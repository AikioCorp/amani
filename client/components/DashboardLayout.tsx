import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Bell, Search, Settings, ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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
  const { user } = useAuth();
  const isNested = useContext(DashboardContext);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sidebar:collapsed") === "1";
    } catch {
      return false;
    }
  });
  
  useEffect(() => {
    try {
      if (!isNested) {
        localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
      }
    } catch {}
  }, [collapsed, isNested]);

  // If this layout is used inside another layout (e.g. by a page inside DashboardShell)
  // we just render a local header instead of duplicating the entire sidebar and topnav
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

  return (
    <DashboardContext.Provider value={true}>
      <div className="min-h-screen bg-[#E5DDD2] flex">
        {/* Sidebar */}
        <Sidebar collapsed={collapsed} />

        {/* Right column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => setCollapsed((v) => !v)}
                  aria-label={collapsed ? "Ouvrir la sidebar" : "Réduire la sidebar"}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  title={collapsed ? "Déployer" : "Réduire"}
                >
                  {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                </button>
                {title && (
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-amani-primary">{title}</h1>
                    {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amani-primary focus:border-transparent w-64"
                  />
                </div>
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-amani-primary hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                {/* Settings */}
                <Link
                  to="/dashboard/settings"
                  className="p-2 text-gray-600 hover:text-amani-primary hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </Link>
                {/* User menu placeholder */}
                <div className="flex items-center gap-2 p-2">
                  <div className="w-8 h-8 bg-amani-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.firstName?.[0] || user?.first_name?.[0]}{user?.lastName?.[0] || user?.last_name?.[0]}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
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
