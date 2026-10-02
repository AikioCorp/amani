export interface DemoUser {
  id: string;
  email: string;
  password: string;
  role: "admin" | "editeur" | "analyste" | "moderateur" | "abonne" | "visiteur";
  roles: string[]; // Multiple roles support
  firstName: string;
  lastName: string;
  organization: string;
  permissions: string[];
  lastLogin: string;
  country?: string;
  preferences: {
    sectors: string[];
    countries: string[];
    newsletter: boolean;
    alerts: boolean;
  };
}

// Complete permissions list
export const ALL_PERMISSIONS = {
  // Articles & Content
  create_articles: "Créer des articles",
  edit_articles: "Modifier des articles",
  delete_articles: "Supprimer des articles",
  publish_articles: "Publier des articles",
  manage_categories: "Gérer les catégories",

  // Podcasts
  create_podcasts: "Créer des podcasts",
  edit_podcasts: "Modifier des podcasts",
  delete_podcasts: "Supprimer des podcasts",
  publish_podcasts: "Publier des podcasts",

  // Economic Indices
  create_indices: "Créer des indices",
  edit_indices: "Modifier des indices",
  delete_indices: "Supprimer des indices",
  view_indices: "Voir les indices",
  export_indices: "Exporter les indices",
  publish_indices: "Publier des indices",

  // Analytics & Reports
  view_analytics: "Voir les analytics",
  export_data: "Exporter les données",
  create_economic_reports: "Créer des rapports économiques",
  view_detailed_analytics: "Analytics détaillées",
  access_admin_reports: "Rapports administrateur",

  // Moderation
  moderate_comments: "Modérer les commentaires",
  review_content: "Réviser le contenu",
  manage_user_reports: "Gérer les signalements",
  view_content_stats: "Voir les stats de contenu",
  ban_users: "Bannir des utilisateurs",
  manage_user_roles: "Gérer les rôles utilisateurs",

  // User Management
  manage_users: "Gérer les utilisateurs",
  create_users: "Créer des utilisateurs",
  edit_user_profiles: "Modifier les profils",
  delete_users: "Supprimer des utilisateurs",
  view_user_activity: "Voir l'activité des utilisateurs",

  // System Administration
  system_settings: "Paramètres système",
  manage_permissions: "Gérer les permissions",
  access_logs: "Accéder aux logs",
  backup_system: "Sauvegarder le système",
  manage_integrations: "Gérer les intégrations",

  // Content Access
  view_premium_content: "Contenu premium",
  view_public_content: "Contenu public",
  save_favorites: "Sauvegarder favoris",
  create_alerts: "Créer des alertes",
  download_reports: "Télécharger rapports",
  access_podcast_archives: "Archives podcasts",
  view_basic_indices: "Indices de base",
  listen_public_podcasts: "Podcasts publics",
};

export const demoAccounts: DemoUser[] = [
  {
    id: "admin-001",
    email: "admin@amani.demo",
    password: "admin123",
    role: "admin",
    roles: ["admin"],
    firstName: "Amadou",
    lastName: "Sanogo",
    organization: "Amani Platform",
    lastLogin: "2024-01-15 09:30",
    permissions: Object.keys(ALL_PERMISSIONS), // Admin has all permissions
    preferences: {
      sectors: ["all"],
      countries: ["all"],
      newsletter: true,
      alerts: true,
    },
  },
  {
    id: "editeur-001",
    email: "editeur@amani.demo",
    password: "editeur123",
    role: "editeur",
    roles: ["editeur"],
    firstName: "Fatou",
    lastName: "Diallo",
    organization: "Journal du Mali",
    lastLogin: "2024-01-15 08:45",
    permissions: [
      "create_articles",
      "edit_articles",
      "publish_articles",
      "create_podcasts",
      "edit_podcasts",
      "publish_podcasts",
      "manage_categories",
      "view_analytics",
      "view_premium_content",
    ],
    preferences: {
      sectors: ["Économie", "Marché", "Politique"],
      countries: ["Mali", "Burkina Faso", "Niger"],
      newsletter: true,
      alerts: true,
    },
  },
  {
    id: "analyste-001",
    email: "analyste@amani.demo",
    password: "analyste123",
    role: "analyste",
    roles: ["analyste"],
    firstName: "Ibrahim",
    lastName: "Touré",
    organization: "BCEAO",
    lastLogin: "2024-01-15 07:20",
    permissions: [
      "create_indices",
      "edit_indices",
      "publish_indices",
      "view_indices",
      "export_indices",
      "create_economic_reports",
      "view_analytics",
      "view_detailed_analytics",
      "export_data",
      "view_premium_content",
    ],
    preferences: {
      sectors: ["Marché", "Économie", "Investissement"],
      countries: ["UEMOA", "Mali", "Burkina Faso", "Niger", "Sénégal"],
      newsletter: true,
      alerts: true,
    },
  },
  {
    id: "moderateur-001",
    email: "moderateur@amani.demo",
    password: "moderateur123",
    role: "moderateur",
    roles: ["moderateur"],
    firstName: "Aïcha",
    lastName: "Koné",
    organization: "Amani Platform",
    lastLogin: "2024-01-15 10:15",
    permissions: [
      "moderate_comments",
      "review_content",
      "manage_user_reports",
      "view_content_stats",
      "ban_users",
      "view_user_activity",
      "view_analytics",
    ],
    preferences: {
      sectors: ["all"],
      countries: ["all"],
      newsletter: false,
      alerts: true,
    },
  },
  // Add a multi-role user example
  {
    id: "multi-001",
    email: "multi@amani.demo",
    password: "multi123",
    role: "editeur", // Primary role
    roles: ["editeur", "analyste", "moderateur"], // Multiple roles
    firstName: "Salif",
    lastName: "Keita",
    organization: "Consultant Indépendant",
    lastLogin: "2024-01-15 13:20",
    permissions: [
      // Editeur permissions
      "create_articles",
      "edit_articles",
      "publish_articles",
      "create_podcasts",
      "edit_podcasts",
      "publish_podcasts",
      "manage_categories",
      // Analyste permissions
      "create_indices",
      "edit_indices",
      "publish_indices",
      "view_indices",
      "export_indices",
      "create_economic_reports",
      "view_detailed_analytics",
      // Moderateur permissions
      "moderate_comments",
      "review_content",
      "manage_user_reports",
      "view_content_stats",
      // Common permissions
      "view_analytics",
      "export_data",
      "view_premium_content",
    ],
    preferences: {
      sectors: ["all"],
      countries: ["all"],
      newsletter: true,
      alerts: true,
    },
  },
  {
    id: "abonne-001",
    email: "abonne@amani.demo",
    password: "abonne123",
    role: "abonne",
    roles: ["abonne"],
    firstName: "Moussa",
    lastName: "Traoré",
    organization: "Banque Atlantique",
    lastLogin: "2024-01-15 11:30",
    permissions: [
      "view_premium_content",
      "view_public_content",
      "save_favorites",
      "create_alerts",
      "download_reports",
      "access_podcast_archives",
      "view_basic_indices",
      "listen_public_podcasts",
      "export_data",
    ],
    preferences: {
      sectors: ["Marché", "Investissement", "Économie"],
      countries: ["Mali", "Burkina Faso"],
      newsletter: true,
      alerts: true,
    },
  },
  {
    id: "visiteur-001",
    email: "visiteur@amani.demo",
    password: "visiteur123",
    role: "visiteur",
    roles: ["visiteur"],
    firstName: "Mariam",
    lastName: "Ba",
    organization: "Université de Bamako",
    lastLogin: "2024-01-15 14:20",
    permissions: [
      "view_public_content",
      "view_basic_indices",
      "listen_public_podcasts",
    ],
    preferences: {
      sectors: ["Économie", "Tech"],
      countries: ["Mali"],
      newsletter: false,
      alerts: false,
    },
  },
];

export const getRoleDisplayName = (role: string): string => {
  const roleNames = {
    admin: "Administrateur",
    editeur: "Éditeur",
    analyste: "Analyste",
    moderateur: "Modérateur",
    abonne: "Abonné Premium",
    visiteur: "Visiteur",
  };
  return roleNames[role as keyof typeof roleNames] || role;
};

export const getRoleColor = (role: string): string => {
  const roleColors = {
    admin: "border border-red-200 text-red-700 bg-red-50/50",
    editeur: "border border-blue-200 text-blue-700 bg-blue-50/50",
    analyste: "border border-green-200 text-green-700 bg-green-50/50",
    moderateur: "border border-yellow-200 text-yellow-700 bg-yellow-50/50",
    abonne: "border border-purple-200 text-purple-700 bg-purple-50/50",
    visiteur: "border border-gray-200 text-gray-700 bg-gray-50/50",
  };
  return (
    roleColors[role as keyof typeof roleColors] || "border border-gray-200 text-gray-700 bg-gray-50/50"
  );
};
