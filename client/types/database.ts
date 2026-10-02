// Types unifiés pour Supabase - Plateforme Amani Finance
export interface Database {
  public: {
    Tables: {
      // ===== SYSTÈME UNIFIÉ DE CONTENU =====
      contents: {
        Row: {
          id: string;
          type: "article" | "podcast" | "indice";
          title: string;
          slug: string;
          summary: string; // RÉSUMÉ POUR TOUT
          description?: string;
          content?: string; // Contenu complet optionnel

          // MÉTADONNÉES COMMUNES
          status: "draft" | "published" | "archived";
          is_premium?: boolean;
          // Nouvel ID de catégorie (clé étrangère)
          category_id: string;
          category: string;
          country: string;
          tags: string[];
          author_id: string;

          // SEO & PARTAGE
          meta_title?: string;
          meta_description?: string;
          featured_image?: string;
          featured_image_alt?: string;

          // DATES UNIFIÉES
          created_at: string;
          updated_at: string;
          published_at?: string;

          // MÉTRIQUES COMMUNES
          views: number;
          likes: number;
          shares: number;
          read_time?: number;

          // DONNÉES SPÉCIFIQUES PAR TYPE
          article_data?: ArticleData;
          podcast_data?: PodcastData;
          indice_data?: IndiceData;
        };
        Insert: Omit<
          Database["public"]["Tables"]["contents"]["Row"],
          "id" | "created_at" | "updated_at" | "views" | "likes" | "shares"
        >;
        Update: Partial<Database["public"]["Tables"]["contents"]["Insert"]>;
      };

      // ===== SYSTÈME D'AUTHENTIFICATION & RÔLES =====
      profiles: {
        Row: {
          id: string; // UUID from auth.users
          email: string;
          first_name: string;
          last_name: string;
          avatar_url?: string;
          role: "admin" | "editor" | "analyst" | "moderator" | "subscriber";
          permissions: string[];
          organization?: string;
          country?: string;
          phone?: string;
          location?: string;
          bio?: string;
          website?: string;
          linkedin?: string;
          twitter?: string;
          preferences?: Record<string, any>;
          created_at: string;
          updated_at: string;
          last_login?: string;
          is_active: boolean;
        };
        Insert: Omit<
          Database["public"]["Tables"]["profiles"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };

      // ===== CATÉGORIES UNIFIÉES =====
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description?: string;
          color: string;
          icon?: string;
          parent_id?: string;
          sort_order: number;
          is_active: boolean;
          content_types: ("article" | "podcast" | "indice")[];
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };

      // ===== MÉTRIQUES & ANALYTICS =====
      analytics: {
        Row: {
          id: string;
          content_id: string;
          event_type: "view" | "like" | "share" | "download";
          user_id?: string;
          ip_address?: string;
          user_agent?: string;
          country?: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["analytics"]["Row"],
          "id" | "created_at"
        >;
        Update: never;
      };

      // ===== COMMENTAIRES & INTERACTIONS =====
      comments: {
        Row: {
          id: string;
          content_id: string;
          user_id: string;
          parent_id?: string;
          comment: string;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["comments"]["Row"],
          "id" | "created_at" | "updated_at" | "is_approved"
        >;
        Update: Partial<
          Pick<
            Database["public"]["Tables"]["comments"]["Row"],
            "comment" | "is_approved"
          >
        >;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ===== DONNÉES SPÉCIFIQUES PAR TYPE =====
export interface ArticleData {
  excerpt: string; // Extrait tiré du résumé
  content_type: "full" | "summary_only";
  reading_time: number;
  is_featured: boolean;
  related_articles?: string[];
  sources?: string[];
  author_note?: string;
}

export interface PodcastData {
  audio_url?: string;
  video_url?: string;
  spotify_url?: string;
  apple_url?: string;
  duration?: number | string;
  host?: string;
  episode_number?: number;
  season?: number;
  transcript?: string;
  guests?: string[];
  topics?: string[];
  platforms?: PodcastPlatform[];
}

export interface PodcastPlatform {
  name: string;
  url: string;
  icon?: string;
}

export interface IndiceData {
  symbol: string;
  current_value: number;
  previous_value?: number;
  change_value?: number;
  change_percent?: number;
  is_positive: boolean;
  currency: string;
  unit: string;
  frequency: "real-time" | "daily" | "weekly" | "monthly";
  source: string;
  methodology?: string;
  market_data?: {
    open?: number;
    high?: number;
    low?: number;
    volume?: number;
  };
  last_updated: string;
}

// ===== SYSTÈME DE PERMISSIONS UNIFIÉ =====
export const PERMISSIONS = {
  // CONTENU
  CREATE_CONTENT: "create_content",
  EDIT_CONTENT: "edit_content",
  DELETE_CONTENT: "delete_content",
  PUBLISH_CONTENT: "publish_content",

  // SPÉCIFIQUE PAR TYPE
  MANAGE_ARTICLES: "manage_articles",
  MANAGE_PODCASTS: "manage_podcasts",
  MANAGE_INDICES: "manage_indices",

  // SYSTÈME
  MANAGE_USERS: "manage_users",
  VIEW_ANALYTICS: "view_analytics",
  MODERATE_COMMENTS: "moderate_comments",
  MANAGE_SETTINGS: "manage_settings",
} as const;

export const ROLES = {
  ADMIN: {
    name: "Administrateur",
    permissions: Object.values(PERMISSIONS),
  },
  EDITOR: {
    name: "Éditeur en Chef",
    permissions: [
      PERMISSIONS.CREATE_CONTENT,
      PERMISSIONS.EDIT_CONTENT,
      PERMISSIONS.PUBLISH_CONTENT,
      PERMISSIONS.MANAGE_ARTICLES,
      PERMISSIONS.MANAGE_PODCASTS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.MODERATE_COMMENTS,
    ],
  },
  ANALYST: {
    name: "Analyste Économique",
    permissions: [
      PERMISSIONS.CREATE_CONTENT,
      PERMISSIONS.EDIT_CONTENT,
      PERMISSIONS.MANAGE_ARTICLES,
      PERMISSIONS.MANAGE_INDICES,
      PERMISSIONS.VIEW_ANALYTICS,
    ],
  },
  MODERATOR: {
    name: "Modérateur",
    permissions: [
      PERMISSIONS.EDIT_CONTENT,
      PERMISSIONS.MODERATE_COMMENTS,
      PERMISSIONS.VIEW_ANALYTICS,
    ],
  },
  SUBSCRIBER: {
    name: "Abonné",
    permissions: [],
  },
} as const;

// ===== TYPES HELPER =====
export type ContentType =
  Database["public"]["Tables"]["contents"]["Row"]["type"];
export type ContentStatus =
  Database["public"]["Tables"]["contents"]["Row"]["status"];
export type UserRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ===== UNIFIED CONTENT INTERFACE =====
export type UnifiedContent = Database["public"]["Tables"]["contents"]["Row"] & {
  author: Database["public"]["Tables"]["profiles"]["Row"];
  category_info: Database["public"]["Tables"]["categories"]["Row"];
  comment_count: number;
  is_liked_by_user?: boolean;
};
