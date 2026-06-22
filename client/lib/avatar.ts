export const uploadAvatar = async (userId: string, file: File) => {
  // Simuler l'upload d'avatars pour l'instant (migration hors de Supabase)
  console.warn("L'upload d'avatars est en cours de migration hors de Supabase.");
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`;
};

export const getAvatarUrl = (userId: string, path?: string | null) => {
  if (!path) return null;
  
  if (path.startsWith('http')) {
    return path;
  }
  
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`;
};
