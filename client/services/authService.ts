// Service d'authentification refactorisé pour utiliser l'API standalone Amani
export type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: 'admin' | 'editor' | 'analyst' | 'moderator' | 'subscriber';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

import { API_BASE_URL } from "./apiConfig";

// Helper pour lire le token d'accès Supabase stocké localement
export const getSessionToken = (): string | null => {
  const authData = localStorage.getItem('amani-finance-auth');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return parsed?.currentSession?.access_token || parsed?.access_token || null;
    } catch {
      return null;
    }
  }
  return null;
};

export const signUp = async (email: string, password: string, userData: { firstName: string; lastName: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, firstName: userData.firstName, lastName: userData.lastName }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Erreur d'inscription via l'API");
    }

    const result = await response.json();
    
    // Enregistrer la session dans localStorage pour que le client l'utilise
    if (result.data?.session) {
      localStorage.setItem('amani-finance-auth', JSON.stringify(result.data.session));
    }

    return result.data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Erreur de connexion via l'API");
    }

    const result = await response.json();

    // Enregistrer la session dans localStorage
    if (result.data?.session) {
      localStorage.setItem('amani-finance-auth', JSON.stringify(result.data.session));
    }

    return result.data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const token = getSessionToken();
    await fetch(`${API_BASE_URL}/auth/signout`, {
      method: "POST",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
      },
    });

    // Vider localStorage
    localStorage.removeItem('amani-finance-auth');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const token = getSessionToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Jeton expiré ou invalide
      localStorage.removeItem('amani-finance-auth');
      return null;
    }

    const result = await response.json();
    return result.data as UserProfile & { email: string };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const updateProfile = async (updates: Partial<UserProfile>) => {
  try {
    const token = getSessionToken();
    if (!token) throw new Error('User not authenticated');

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Erreur de mise à jour du profil");
    }

    const result = await response.json();
    return result.data as UserProfile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erreur lors de la demande de réinitialisation");
    }

    return result;
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    throw error;
  }
};

export const resetPassword = async (token: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erreur lors de la réinitialisation du mot de passe");
    }

    return result;
  } catch (error) {
    console.error('Error in resetPassword:', error);
    throw error;
  }
};

