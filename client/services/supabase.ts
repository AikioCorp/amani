// services/supabase.ts — Service unifié migré vers l'API REST standalone
// Ce fichier exporte les mêmes classes/fonctions que l'original mais
// passe par notre API backend au lieu du SDK Supabase directement.

import type { Database } from "../types/database";
import { getSessionToken } from "./authService";

const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname.includes("127.0.0.1"));

const API_BASE = isLocal ? "http://localhost:5000/api" : "/api";

function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── ContentService ───────────────────────────────────────────────────────────

export class ContentService {
  static async createContent(data: Database["public"]["Tables"]["contents"]["Insert"]) {
    const resp = await fetch(`${API_BASE}/contents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || "Erreur lors de la création du contenu");
    }
    const result = await resp.json();
    return result.data;
  }

  static async getContents({
    type, category, status = "published", limit = 20, offset = 0, country, author_id, search,
  }: {
    type?: string;
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
    country?: string;
    author_id?: string;
    search?: string;
  } = {}) {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    params.set("limit", String(limit));
    params.set("offset", String(offset));
    if (country) params.set("country", country);
    if (author_id) params.set("author_id", author_id);
    if (search) params.set("search", search);

    const resp = await fetch(`${API_BASE}/contents?${params}`);
    if (!resp.ok) throw new Error("Erreur lors de la récupération du contenu");
    const result = await resp.json();
    return { data: result.data || [], count: result.count || 0, hasMore: result.hasMore };
  }

  static async getContentBySlug(slug: string) {
    const resp = await fetch(`${API_BASE}/contents/${slug}`);
    if (!resp.ok) throw new Error("Contenu introuvable");
    const result = await resp.json();
    return result.data;
  }

  static async getSimilarContent(contentId: string, category: string, limit = 3) {
    try {
      const result = await this.getContents({ category, status: "published", limit });
      return (result.data || []).filter((c: any) => c.id !== contentId).slice(0, limit);
    } catch {
      return [];
    }
  }

  static async updateContent(id: string, updates: Database["public"]["Tables"]["contents"]["Update"]) {
    const resp = await fetch(`${API_BASE}/contents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(updates),
    });
    if (!resp.ok) throw new Error("Erreur lors de la mise à jour du contenu");
    const result = await resp.json();
    return result.data;
  }

  static async deleteContent(id: string) {
    const resp = await fetch(`${API_BASE}/contents/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!resp.ok) throw new Error("Erreur lors de la suppression du contenu");
  }

  static async generateUniqueSlug(title: string): Promise<string> {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);
  }

  static async slugExists(slug: string): Promise<boolean> {
    try {
      const resp = await fetch(`${API_BASE}/contents/${slug}`);
      return resp.ok;
    } catch {
      return false;
    }
  }

  static async incrementViews(contentId: string) {
    // Géré automatiquement par le backend lors du fetch d'un contenu par slug
  }
}

// ─── AnalyticsService ─────────────────────────────────────────────────────────

export class AnalyticsService {
  static async trackEvent(contentId: string, eventType: string, metadata: any = {}) {
    // TODO: implémenter un endpoint /api/analytics si nécessaire
    console.debug("[AnalyticsService] trackEvent (stub)", { contentId, eventType });
  }

  static async getContentStats(contentId?: string, period = "30d") {
    return null;
  }
}

// ─── InteractionService ───────────────────────────────────────────────────────

export class InteractionService {
  static async toggleLike(contentId: string) {
    // TODO: implémenter via l'API
    console.warn("[InteractionService] toggleLike non implémenté en mode standalone");
    return false;
  }

  static async toggleBookmark(contentId: string) {
    console.warn("[InteractionService] toggleBookmark non implémenté en mode standalone");
    return false;
  }

  static async getUserInteractions(userId: string, contentIds: string[]) {
    return {};
  }
}

// ─── CommentService ───────────────────────────────────────────────────────────

export class CommentService {
  static async createComment(contentId: string, comment: string, parentId?: string) {
    // TODO: implémenter via l'API si nécessaire
    console.warn("[CommentService] createComment non implémenté en mode standalone");
    throw new Error("La création de commentaires n'est pas encore disponible");
  }

  static async getComments(contentId: string) {
    return [];
  }
}

// ─── AuthService ──────────────────────────────────────────────────────────────

export class AuthService {
  static async signUp(email: string, password: string, metadata: any) {
    const resp = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, ...metadata }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || "Erreur d'inscription");
    }
    return (await resp.json()).data;
  }

  static async signIn(email: string, password: string) {
    const resp = await fetch(`${API_BASE}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || "Erreur de connexion");
    }
    return (await resp.json()).data;
  }

  static async signOut() {
    const token = getSessionToken();
    await fetch(`${API_BASE}/auth/signout`, {
      method: "POST",
      headers: authHeaders(),
    }).catch(() => {});
    localStorage.removeItem("amani-finance-auth");
  }

  static async getProfile(userId: string) {
    const resp = await fetch(`${API_BASE}/users/${userId}`, { headers: authHeaders() });
    if (!resp.ok) throw new Error("Profil introuvable");
    return (await resp.json()).data;
  }

  static async updateProfile(userId: string, updates: any) {
    const resp = await fetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(updates),
    });
    if (!resp.ok) throw new Error("Erreur lors de la mise à jour du profil");
    return (await resp.json()).data;
  }
}

// ─── StorageService ───────────────────────────────────────────────────────────

export class StorageService {
  static async uploadImage(file: File, bucket = "images", folder = "content"): Promise<string> {
    // TODO: implémenter un endpoint d'upload de fichiers si nécessaire
    console.warn("[StorageService] uploadImage non implémenté en mode standalone");
    throw new Error("Le stockage de fichiers n'est pas encore disponible");
  }

  static async deleteImage(path: string, bucket = "images") {
    console.warn("[StorageService] deleteImage non implémenté en mode standalone");
  }
}
