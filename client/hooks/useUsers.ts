import { useState, useEffect } from 'react';
import { getSessionToken } from '../services/authService';
import { API_BASE_URL as API_BASE } from '../services/apiConfig';
import { adminCache } from '../services/adminCache';

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
  is_premium?: boolean;
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

const CACHE_KEY = 'users_list';

export function useUsers() {
  const cachedUsers = adminCache.get<User[]>(CACHE_KEY);

  const [users, setUsers] = useState<User[]>(cachedUsers || []);
  const [isLoading, setIsLoading] = useState<boolean>(!cachedUsers);
  const [error, setError] = useState<string | null>(null);

  const computeStats = (data: User[]): UserStats => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      total: data.length,
      admins: data.filter((u) => u.role === 'admin').length,
      editors: data.filter((u) => u.role === 'editor').length,
      users: data.filter((u) => u.role === 'subscriber').length,
      newThisMonth: data.filter((u) => new Date(u.created_at) >= startOfMonth).length,
    };
  };

  const [stats, setStats] = useState<UserStats>(computeStats(cachedUsers || []));

  const fetchUsers = async (silent = false) => {
    try {
      if (!silent && !users.length) {
        setIsLoading(true);
      }
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
      setStats(computeStats(usersData));
      adminCache.set(CACHE_KEY, usersData);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      if (!users.length) {
        setError(err.message || 'Erreur lors de la récupération des utilisateurs');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(Boolean(cachedUsers));
  }, []);

  const deleteUser = async (userId: string) => {
    const previous = [...users];
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    setStats(computeStats(updated));
    adminCache.set(CACHE_KEY, updated);

    try {
      const token = getSessionToken();
      const resp = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error('Erreur lors de la suppression');
      return true;
    } catch (err: any) {
      // Rollback
      setUsers(previous);
      setStats(computeStats(previous));
      adminCache.set(CACHE_KEY, previous);
      throw err;
    }
  };

  const updateUserRoles = async (userId: string, role: string) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, role, roles: [role] } : u));
    setUsers(updated);
    setStats(computeStats(updated));
    adminCache.set(CACHE_KEY, updated);

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
      return true;
    } catch (err: any) {
      fetchUsers(true);
      throw err;
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    setUsers(updated);
    setStats(computeStats(updated));
    adminCache.set(CACHE_KEY, updated);

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
      return true;
    } catch (err: any) {
      fetchUsers(true);
      throw err;
    }
  };

  const createUser = async (userData: any) => {
    try {
      const token = getSessionToken();
      const resp = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(userData),
      });
      const json = await resp.json();
      if (!resp.ok || !json.success) {
        throw new Error(json.error || 'Erreur lors de la création de l\'utilisateur');
      }
      adminCache.invalidate(CACHE_KEY);
      fetchUsers(true);
      return json;
    } catch (err: any) {
      throw err;
    }
  };

  return {
    users,
    setUsers,
    isLoading,
    error,
    stats,
    fetchUsers,
    deleteUser,
    updateUserRoles,
    updateUser,
    createUser,
  };
}
