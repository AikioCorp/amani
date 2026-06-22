import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  avatarUrl?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  lastLogin?: string;
  preferences?: {
    sectors: string[];
    countries: string[];
    newsletter: boolean;
    alerts: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const SESSION_KEY = "amani-finance-auth";
const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname.includes("127.0.0.1"))
    ? "http://localhost:5000/api"
    : "/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStoredSession(): { access_token: string; user: any } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(session: { access_token: string; user: any }) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function buildUserFromSession(sessionUser: any, profile?: any): User {
  const merged = { ...sessionUser, ...profile };
  const role: string = profile?.role || sessionUser?.role || "subscriber";
  const isAdmin = role === "admin";

  const allPermissions = isAdmin
    ? [
        "view_dashboard",
        "create_articles",
        "edit_articles",
        "delete_articles",
        "publish_articles",
        "create_podcasts",
        "edit_podcasts",
        "delete_podcasts",
        "publish_podcasts",
        "create_economic_reports",
        "create_indices",
        "manage_users",
        "view_analytics",
        "manage_settings",
      ]
    : ["view_dashboard"];

  return {
    id: merged.id || sessionUser.id,
    email: merged.email || sessionUser.email || "",
    firstName: merged.first_name || merged.user_metadata?.first_name || "Utilisateur",
    lastName: merged.last_name || merged.user_metadata?.last_name || "",
    organization: merged.organization || "",
    avatarUrl: merged.avatar_url || merged.user_metadata?.avatar_url || "",
    role,
    roles: [role],
    permissions: allPermissions,
    lastLogin: merged.last_login ? new Date(merged.last_login).toLocaleString() : new Date().toLocaleString(),
    preferences: merged.preferences || {
      sectors: ["Économie", "Bourse"],
      countries: ["Mali", "Sénégal"],
      newsletter: true,
      alerts: false
    }
  };
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLoadingRef = useRef(true);
  const safetyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Initialiser la session depuis le localStorage
  useEffect(() => {
    const init = async () => {
      // Fallback de sécurité
      safetyTimeoutRef.current = window.setTimeout(() => {
        if (isLoadingRef.current) {
          console.warn("[Auth] Timeout – forcer isLoading=false");
          setIsLoading(false);
        }
      }, 7000);

      try {
        const session = getStoredSession();
        if (!session?.access_token) {
          setIsLoading(false);
          return;
        }

        // Vérifier le token via l'API
        const resp = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!resp.ok) {
          // Token expiré
          clearSession();
          setIsLoading(false);
          return;
        }

        const result = await resp.json();
        if (result.success && result.data) {
          setUser(buildUserFromSession(result.data));
        }
      } catch (err) {
        console.error("[Auth] Erreur d'initialisation:", err);
        // Utiliser la session en cache si l'API est inaccessible
        const session = getStoredSession();
        if (session?.user) {
          setUser(buildUserFromSession(session.user));
        }
      } finally {
        setIsLoading(false);
        if (safetyTimeoutRef.current) {
          clearTimeout(safetyTimeoutRef.current);
          safetyTimeoutRef.current = null;
        }
      }
    };

    init();

    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    console.log("[Auth] Tentative de connexion:", email);
    try {
      const resp = await fetch(`${API_BASE}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await resp.json();

      if (!resp.ok || !result.success) {
        console.error("[Auth] Échec de connexion:", result.error);
        return false;
      }

      const { user: apiUser, session, profile } = result.data;

      // Sauvegarder la session
      saveSession({
        access_token: session?.access_token || "",
        user: apiUser,
      });

      setUser(buildUserFromSession(apiUser, profile));
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error("[Auth] Erreur réseau lors de la connexion:", err);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const session = getStoredSession();
      if (session?.access_token) {
        await fetch(`${API_BASE}/auth/signout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).catch(() => {});
      }
    } catch {
      // Ignorer les erreurs réseau lors de la déconnexion
    } finally {
      clearSession();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (user.role === "admin") return true;
      if (!Array.isArray(user.permissions)) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
