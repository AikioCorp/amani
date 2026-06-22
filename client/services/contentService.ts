// Service de contenu refactorisé pour utiliser l'API standalone Amani
export type Content = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'archived';
  type: 'article' | 'podcast' | 'indice';
  author_id: string;
  category_id?: string;
  tags?: string[];
  featured_image?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
};

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname.includes("127.0.0.1");

const API_BASE_URL = isLocal ? "http://localhost:5000/api" : "/api";

export const getContents = async (options: {
  type?: Content['type'];
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
  authorId?: string;
  search?: string;
} = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.type) params.append("type", options.type);
    if (options.category) params.append("category", options.category);
    if (options.status) params.append("status", options.status);
    if (options.limit !== undefined) params.append("limit", options.limit.toString());
    if (options.offset !== undefined) params.append("offset", options.offset.toString());
    if (options.authorId) params.append("author_id", options.authorId);
    if (options.search) params.append("search", options.search);

    const url = `${API_BASE_URL}/contents?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erreur de récupération des contenus");
    const result = await response.json();
    return {
      data: result.data as Content[],
      count: result.count || 0,
    };
  } catch (error) {
    console.error('Error fetching contents:', error);
    throw error;
  }
};

export const getContentBySlug = async (slug: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contents/${slug}`);
    if (!response.ok) throw new Error("Contenu introuvable via l'API");
    const result = await response.json();
    return result.data as Content;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};

import { getSessionToken } from "./authService";

export const getContentById = async (id: string) => {
  try {
    const token = getSessionToken();
    const response = await fetch(`${API_BASE_URL}/contents/id/${id}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error("Contenu introuvable via l'API");
    const result = await response.json();
    return result.data as Content;
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    throw error;
  }
};

export const createContent = async (content: Omit<Content, 'id' | 'created_at' | 'updated_at' | 'status' | 'author_id'>) => {
  try {
    const token = getSessionToken();
    const response = await fetch(`${API_BASE_URL}/contents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(content),
    });
    if (!response.ok) throw new Error("Erreur de création de contenu via l'API");
    const result = await response.json();
    return result.data as Content;
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
};

export const updateContent = async (id: string, updates: Partial<Content>) => {
  try {
    const token = getSessionToken();
    const response = await fetch(`${API_BASE_URL}/contents/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Erreur de mise à jour de contenu via l'API");
    const result = await response.json();
    return result.data as Content;
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

export const deleteContent = async (id: string) => {
  try {
    const token = getSessionToken();
    const response = await fetch(`${API_BASE_URL}/contents/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error("Erreur de suppression de contenu via l'API");
    return true;
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};
