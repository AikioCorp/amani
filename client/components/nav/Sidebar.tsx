import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Mic,
  BarChart3,
  Users,
  Settings,
  BarChart2,
  Shield,
  FileWarning,
  Bell,
  Plug,
  User as UserIcon,
  ListChecks,
  LineChart,
  Layers,
  Globe,
  Activity,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";

export interface SidebarProps {
  collapsed?: boolean;
}

interface MenuItem {
  label: string;
  to?: string; // optional if it has children
  icon: React.ComponentType<{ className?: string }>;
  permission?: string; // if provided, requires hasPermission(permission)
  children?: MenuItem[]; // optional nested items
}

interface Section {
  title: string; // displayed as small header
  items: MenuItem[];
}

const SECTIONS: Section[] = [
  {
    title: "✏️ Création de contenu",
    items: [
      {
        label: "Articles",
        icon: FileText,
        permission: "create_articles",
        children: [
          { label: "Tous les articles", to: "/dashboard/articles", icon: FileText, permission: "create_articles" },
          { label: "Nouvel article", to: "/dashboard/articles/new", icon: FileText, permission: "create_articles" },
        ],
      },
      {
        label: "Podcasts",
        icon: Mic,
        permission: "create_podcasts",
        children: [
          { label: "Tous les podcasts", to: "/dashboard/podcasts", icon: Mic, permission: "create_podcasts" },
          { label: "Nouveau podcast", to: "/dashboard/podcasts/new", icon: Mic, permission: "create_podcasts" },
        ],
      },
      {
        label: "Indices",
        icon: LineChart,
        permission: "create_indices",
        children: [
          { label: "Tous les indices", to: "/dashboard/indices-management", icon: LineChart, permission: "create_indices" },
          { label: "Nouvel indice", to: "/dashboard/indices/new", icon: Plus, permission: "create_indices" },
        ],
      },
      {
        label: "Import Serper",
        to: "/dashboard/serper",
        icon: Globe,
        permission: "create_articles",
      },
      {
        label: "Imports Amani",
        to: "/dashboard/imports",
        icon: ListChecks,
        permission: "create_articles",
      },
      {
        label: "Monitoring",
        to: "/dashboard/monitoring",
        icon: Activity,
        permission: "create_articles",
      },
    ],
  },
  {
    title: "📚 Gestion de contenu",
    items: [
      { label: "Vue unifiée", to: "/dashboard/content-management", icon: Layers, permission: "view_dashboard" },
    ],
  },
  {
    title: "📊 Données",
    items: [
      { label: "Matières premières", to: "/dashboard/commodities-management", icon: Layers, permission: "create_indices" },
    ],
  },
  {
    title: "📈 Analyse",
    items: [
      { label: "Tableaux de bord", to: "/dashboard/analytics", icon: BarChart2, permission: "view_analytics" },
      { label: "Rapports", to: "/dashboard/reports", icon: Activity, permission: "view_analytics" },
    ],
  },
  {
    title: "🛡️ Modération",
    items: [
      { label: "Centre de modération", to: "/dashboard/moderation", icon: Shield, permission: "manage_users" },
      { label: "Signalements", to: "/dashboard/reports-moderation", icon: FileWarning, permission: "manage_users" },
    ],
  },
  {
    title: "⚙️ Administration",
    items: [
      { label: "Utilisateurs", to: "/dashboard/users", icon: Users, permission: "manage_users" },
      { label: "Permissions", to: "/dashboard/permissions", icon: ListChecks, permission: "manage_users" },
      { label: "Paramètres", to: "/dashboard/settings", icon: Settings, permission: "manage_settings" },
    ],
  },
  {
    title: "👤 Mon compte",
    items: [
      { label: "Profil", to: "/dashboard/profile", icon: UserIcon, permission: "view_dashboard" },
    ],
  },
];

// Single Dashboard link rendered above sections (no Accueil group)
const DASHBOARD_ITEM: MenuItem = {
  label: "Tableau de bord",
  to: "/dashboard",
  icon: LayoutDashboard,
  permission: "view_dashboard",
};

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, logout, user } = useAuth();

  const visibleSections = SECTIONS.map((section) => ({
    title: section.title,
    items: section.items.filter((m) => !m.permission || hasPermission(m.permission)),
  })).filter((s) => s.items.length > 0);
  const showDashboard = !DASHBOARD_ITEM.permission || hasPermission(DASHBOARD_ITEM.permission);

  // Accordion open/close state, persisted in localStorage
  const storageKey = 'amani-sidebar-sections';
  const initialExpanded = (() => {
    if (typeof window === 'undefined') return {} as Record<string, boolean>;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as Record<string, boolean>;
    } catch {}
    // Default: expand first two sections
    const def: Record<string, boolean> = {};
    visibleSections.forEach((s, idx) => { def[`s:${s.title}`] = idx < 2; });
    return def;
  })();

  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(initialExpanded);
  React.useEffect(() => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(expanded)); } catch {}
  }, [expanded]);

  const sectionKey = (title: string) => `s:${title}`;
  const itemKey = (sectionTitle: string, itemLabel: string) => `i:${sectionTitle}|${itemLabel}`;
  const toggleSection = (title: string) => {
    const key = sectionKey(title);
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const toggleItem = (sectionTitle: string, itemLabel: string) => {
    const key = itemKey(sectionTitle, itemLabel);
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} shrink-0 transition-all duration-200 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col`}
    >
      {/* Top brand removed per request */}

      {/* User summary (from Supabase via AuthContext) */}
      <div className={`${collapsed ? "px-0" : "px-4"} py-3 border-b border-gray-200`}> 
        {collapsed ? (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-amani-primary rounded-full flex items-center justify-center text-white text-sm font-bold" title={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amani-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</div>
              <div className="text-xs text-gray-500 truncate" title={user?.email}>{user?.email}</div>
            </div>
          </div>
        )}
      </div>

      <nav className="p-2 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {showDashboard && (
            <div>
              <ul className="space-y-1">
                <li>
                  <Link
                    to={DASHBOARD_ITEM.to!}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      location.pathname === DASHBOARD_ITEM.to || location.pathname.startsWith(DASHBOARD_ITEM.to + "/")
                        ? "bg-amani-primary/10 text-amani-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    } ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? DASHBOARD_ITEM.label : undefined}
                  >
                    <DASHBOARD_ITEM.icon className="w-5 h-5" />
                    {!collapsed && <span className="truncate">{DASHBOARD_ITEM.label}</span>}
                  </Link>
                </li>
              </ul>
              <div className="px-2 mt-2"><div className="h-px bg-gray-200" /></div>
            </div>
          )}
          {visibleSections.map((section) => (
            <div key={section.title}>
              {!collapsed ? (
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide hover:text-amani-primary"
                  aria-expanded={!!expanded[sectionKey(section.title)]}
                >
                  <span>{section.title}</span>
                  {expanded[sectionKey(section.title)] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <div className="px-2"><div className="h-px bg-gray-200" /></div>
              )}
              {collapsed || expanded[sectionKey(section.title)] ? (
                <ul className="mt-1 space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const hasChildren = !!item.children && item.children.length > 0;
                    if (!hasChildren) {
                      const active = item.to ? (location.pathname === item.to || location.pathname.startsWith(item.to + "/")) : false;
                      return (
                        <li key={item.label}>
                          {item.to ? (
                            <Link
                              to={item.to}
                              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                active
                                  ? "bg-amani-primary/10 text-amani-primary"
                                  : "text-gray-700 hover:bg-gray-100"
                              } ${collapsed ? "justify-center" : ""}`}
                              title={collapsed ? item.label : undefined}
                            >
                              <Icon className="w-5 h-5" />
                              {!collapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                          ) : (
                            <div className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 ${collapsed ? "justify-center" : ""}`}>
                              <Icon className="w-5 h-5" />
                              {!collapsed && <span className="truncate">{item.label}</span>}
                            </div>
                          )}
                        </li>
                      );
                    }
                    const open = !!expanded[itemKey(section.title, item.label)];
                    return (
                      <li key={item.label}>
                        {!collapsed ? (
                          <button
                            type="button"
                            onClick={() => toggleItem(section.title, item.label)}
                            className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                            aria-expanded={open}
                          >
                            <span className="flex items-center gap-3">
                              <Icon className="w-5 h-5" />
                              <span className="truncate">{item.label}</span>
                            </span>
                            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        ) : (
                          <div className="px-2"><div className="h-px bg-gray-100" /></div>
                        )}
                        {(collapsed || open) && (
                          <ul className={`mt-1 ${collapsed ? "" : "pl-9"} space-y-1`}>
                            {(item.children || []).filter((c) => !c.permission || hasPermission(c.permission)).map((child) => {
                              const CIcon = child.icon;
                              const active = child.to ? (location.pathname === child.to || location.pathname.startsWith(child.to + "/")) : false;
                              return (
                                <li key={`${item.label}-${child.label}`}>
                                  {child.to ? (
                                    <Link
                                      to={child.to}
                                      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                        active
                                          ? "bg-amani-primary/10 text-amani-primary"
                                          : "text-gray-700 hover:bg-gray-100"
                                      } ${collapsed ? "justify-center" : ""}`}
                                      title={collapsed ? child.label : undefined}
                                    >
                                      <CIcon className="w-4 h-4" />
                                      {!collapsed && <span className="truncate">{child.label}</span>}
                                    </Link>
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </nav>

      <div className={`p-3 border-t border-gray-200 ${collapsed ? "text-xs" : "text-sm"}`}>
        <div className={`${collapsed ? "flex flex-col items-start gap-2" : "flex items-center gap-3"}`}>
          <button
            onClick={async () => {
              try {
                await logout();
                navigate("/login");
              } catch (e) {
                // no-op; errors are logged in AuthContext
              }
            }}
            className={`group inline-flex items-center w-full justify-start gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 text-sm`}
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Se déconnecter</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
