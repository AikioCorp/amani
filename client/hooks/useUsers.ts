import { useState, useEffect } from 'react';
import { getSessionToken } from '../services/authService';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  organization?: string;
  avatar_url?: string;
  role: string;
  roles?: string[];
  permissions: string[];
  phone?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total: number;
  admins: number;
  editors: number;
  users: number;
  newThisMonth: number;
}

import { API_BASE_URL as API_BASE } from "../services/apiConfig";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    admins: 0,
    editors: 0,
    users: 0,
    newThisMonth: 0,
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getSessionToken();
      const resp = await fetch(`${API_BASE}/users?limit=100`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
      const result = await resp.json();

      const usersData: User[] = (result.data || []).map((u: any) => ({
        ...u,
        roles: [u.role],
      }));
      setUsers(usersData);

      // Calculer les statistiques
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const calculatedStats: UserStats = {
        total: usersData.length,
        admins: usersData.filter(u => u.role === 'admin').length,
        editors: usersData.filter(u => u.role === 'editor').length,
        users: usersData.filter(u => u.role === 'subscriber').length,
        newThisMonth: usersData.filter(u => new Date(u.created_at) >= startOfMonth).length,
      };

      setStats(calculatedStats);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      setError(err.message || 'Erreur lors de la récupération des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (userId: string) => {
    try {
      const token = getSessionToken();
      const resp = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error('Erreur lors de la suppression');
      await fetchUsers();
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      throw err;
    }
  };

  const updateUserRoles = async (userId: string, role: string) => {
    try {
      const token = getSessionToken();
      const resp = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role }),
      });
      if (!resp.ok) throw new Error('Erreur lors de la mise à jour des rôles');
      await fetchUsers();
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour des rôles:', err);
      throw err;
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const token = getSessionToken();
      const resp = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      });
      if (!resp.ok) throw new Error('Erreur lors de la mise à jour');
      await fetchUsers();
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err);
      throw err;
    }
  };

  return {
    users,
    isLoading,
    error,
    stats,
    fetchUsers,
    deleteUser,
    updateUserRoles,
    updateUser,
  };
}
