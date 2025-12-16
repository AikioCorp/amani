import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  organization?: string;
  avatar_url?: string;
  roles: string[];
  phone?: string;
  location?: string;
  linkedin?: string;
  twitter?: string;
  bio?: string;
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

      // Optimisation : limiter les champs récupérés et ajouter une limite
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, organization, roles, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(100); // Limiter à 100 utilisateurs pour améliorer les performances

      if (fetchError) throw fetchError;

      const usersData = (data || []) as User[];
      setUsers(usersData);

      // Calculer les statistiques
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const calculatedStats: UserStats = {
        total: usersData.length,
        admins: usersData.filter(u => u.roles?.includes('admin')).length,
        editors: usersData.filter(u => u.roles?.includes('editor')).length,
        users: usersData.filter(u => u.roles?.includes('user') && !u.roles?.includes('admin') && !u.roles?.includes('editor')).length,
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
      // Note: La suppression d'un utilisateur dans auth.users nécessite des permissions admin
      // Pour l'instant, on peut juste désactiver le profil
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;

      // Rafraîchir la liste
      await fetchUsers();
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      throw err;
    }
  };

  const updateUserRoles = async (userId: string, roles: string[]) => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ roles, updated_at: new Date().toISOString() } as any)
        .eq('id', userId);

      if (updateError) throw updateError;

      // Rafraîchir la liste
      await fetchUsers();
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour des rôles:', err);
      throw err;
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', userId);

      if (updateError) throw updateError;

      // Rafraîchir la liste
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
