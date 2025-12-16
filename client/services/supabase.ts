// Configuration et services Supabase pour Amani Finance
import { Database } from "../types/database";
import { supabase } from "../lib/supabase";
const DEBUG = import.meta.env.DEV === true;

// Utilise le client singleton défini dans ../lib/supabase pour éviter plusieurs instances

// =============================================
// SERVICES UNIFIÉS POUR LE CONTENU
// =============================================

export class ContentService {
  // Créer du contenu unifié
  static async createContent(
    data: Database["public"]["Tables"]["contents"]["Insert"],
  ) {
    try {
      // Auto-générer le slug si non fourni
      if (!data.slug) {
        data.slug = await this.generateUniqueSlug(data.title);
      }

      // Auto-générer les méta-données SEO si non fournies
      if (!data.meta_title) {
        data.meta_title = `${data.title} | Amani Finance`;
      }

      if (!data.meta_description) {
        data.meta_description = data.summary.substring(0, 155);
      }

      const { data: content, error } = await supabase
        .from("contents")
        .insert(data)
        .select(
          `
          *,
          author:profiles(*),
          category:content_categories(*)
        `,
        )
        .single();

      if (error) throw error;
      return content;
    } catch (error) {
      console.error("Erreur lors de la création du contenu:", error);
      throw error;
    }
  }

  // Récupérer le contenu avec pagination et filtres
  static async getContents({
    type,
    category,
    status = "published",
    limit = 20,
    offset = 0,
    country,
    author_id,
    search,
  }: {
    type?: Database["public"]["Tables"]["contents"]["Row"]["type"];
    category?: string;
    status?: Database["public"]["Tables"]["contents"]["Row"]["status"];
    limit?: number;
    offset?: number;
    country?: string;
    author_id?: string;
    search?: string;
  } = {}) {
    try {
      if (DEBUG) {
        console.group("[Supabase][ContentService.getContents]");
        console.log("params:", { type, category, status, limit, offset, country, author_id, search });
      }
      const t0 = Date.now();
      let query = supabase
        .from("contents")
        .select(
          `
          *,
          author:profiles(id, first_name, last_name, avatar_url),
          category:content_categories(id, name, slug, color, icon),
          comment_count:comments(count),
          user_interactions(is_liked, is_bookmarked)
        `,
        )
        .eq("status", status)
        .order("published_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Filtres optionnels
      if (type) query = query.eq("type", type);
      if (category) query = query.eq("category.slug", category);
      if (country) query = query.eq("country", country);
      if (author_id) query = query.eq("author_id", author_id);

      // Recherche textuelle
      if (search) {
        query = query.textSearch("title,summary", search, {
          type: "websearch",
          config: "french",
        });
      }

      const { data, error, count } = await query;

      if (DEBUG) {
        console.log(`duration: ${Date.now() - t0}ms`, { count: count || 0, rows: data?.length || 0, error });
        if (error) console.warn("getContents error:", error);
        console.groupEnd();
      }

      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
        hasMore: offset + limit < (count || 0),
      };
    } catch (error) {
      console.error("Erreur lors de la récupération du contenu:", error);
      throw error;
    }
  }

  // Récupérer un contenu par slug
  static async getContentBySlug(slug: string) {
    try {
      if (DEBUG) {
        console.group("[Supabase][ContentService.getContentBySlug]");
        console.log("slug:", slug);
      }
      const t0 = Date.now();
      const { data, error } = await supabase
        .from("contents")
        .select(
          `
          *,
          author:profiles(id, first_name, last_name, avatar_url, bio),
          category:content_categories(id, name, slug, color, icon),
          comments(
            id,
            comment,
            created_at,
            user:profiles(first_name, last_name, avatar_url),
            parent_id,
            likes
          )
        `,
        )
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (DEBUG) {
        console.log(`duration: ${Date.now() - t0}ms`, { hasData: !!data, error });
        if (error) console.warn("getContentBySlug error:", error);
        console.groupEnd();
      }

      if (error) throw error;

      // Incrémenter les vues (éviter les casts dangereux lorsque des relations échouent)
      const contentId = (data as any)?.id as string | undefined;
      if (contentId) {
        await this.incrementViews(contentId);
      }

      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération du contenu:", error);
      throw error;
    }
  }

  // Récupérer le contenu similaire
  static async getSimilarContent(
    contentId: string,
    category: string,
    limit = 3,
  ) {
    try {
      if (DEBUG) {
        console.group("[Supabase][ContentService.getSimilarContent]");
        console.log("params:", { contentId, category, limit });
      }
      const t0 = Date.now();
      const { data, error } = await supabase
        .from("contents")
        .select(
          `
          id,
          title,
          slug,
          summary,
          featured_image,
          published_at,
          views,
          read_time,
          category:content_categories(name, color)
        `,
        )
        .eq("status", "published")
        .eq("category.slug", category)
        .neq("id", contentId)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (DEBUG) {
        console.log(`duration: ${Date.now() - t0}ms`, { rows: data?.length || 0, error });
        if (error) console.warn("getSimilarContent error:", error);
        console.groupEnd();
      }

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du contenu similaire:",
        error,
      );
      return [];
    }
  }

  // Mettre à jour le contenu
  static async updateContent(
    id: string,
    updates: Database["public"]["Tables"]["contents"]["Update"],
  ) {
    try {
      const { data, error } = await supabase
        .from("contents")
        .update(updates)
        .eq("id", id)
        .select(
          `
          *,
          author:profiles(*),
          category:categories(*)
        `,
        )
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du contenu:", error);
      throw error;
    }
  }

  // Supprimer le contenu
  static async deleteContent(id: string) {
    try {
      const { error } = await supabase.from("contents").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Erreur lors de la suppression du contenu:", error);
      throw error;
    }
  }

  // Générer un slug unique
  static async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);

    let slug = baseSlug;
    let counter = 1;

    // Vérifier l'unicité
    while (await this.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Vérifier si un slug existe
  static async slugExists(slug: string): Promise<boolean> {
    const { data } = await supabase
      .from("contents")
      .select("id")
      .eq("slug", slug)
      .single();

    return !!data;
  }

  // Incrémenter les vues
  static async incrementViews(contentId: string) {
    try {
      // Enregistrer l'événement analytics
      await AnalyticsService.trackEvent(contentId, "view");
    } catch (error) {
      console.error("Erreur lors de l'incrémentation des vues:", error);
    }
  }
}

// =============================================
// SERVICES D'ANALYTICS
// =============================================
export class AnalyticsService {
  // Enregistrer un événement
  static async trackEvent(
    contentId: string,
    eventType: Database["public"]["Tables"]["analytics"]["Row"]["event_type"],
    metadata: Partial<Database["public"]["Tables"]["analytics"]["Insert"]> = {},
  ) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const eventData: Database["public"]["Tables"]["analytics"]["Insert"] = {
        content_id: contentId,
        event_type: eventType,
        user_id: user?.id || null,
        country: await this.getCountryFromIP(),
        // device_type: this.getDeviceType(), // Commenté car non défini dans le type
        // referrer: document.referrer || null, // Commenté car non défini dans le type
        ...metadata,
      };

      const { error } = await supabase.from("analytics").insert(eventData);

      if (error) throw error;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'événement:", error);
    }
  }

  // Obtenir les statistiques de contenu
  static async getContentStats(contentId?: string, period = "30d") {
    try {
      let query = supabase
        .from("analytics")
        .select("event_type, created_at, country")
        .gte("created_at", this.getPeriodDate(period));

      if (contentId) {
        query = query.eq("content_id", contentId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return this.processAnalyticsData(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return null;
    }
  }

  // Utilitaires privées
  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem("amani_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("amani_session_id", sessionId);
    }
    return sessionId;
  }

  private static async getCountryFromIP(): Promise<string> {
    try {
      // Utiliser un service de géolocalisation IP
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      return data.country_code?.toLowerCase() || "unknown";
    } catch {
      return "unknown";
    }
  }

  private static getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "tablet";
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent,
      )
    )
      return "mobile";
    return "desktop";
  }

  private static getPeriodDate(period: string): string {
    const now = new Date();
    const days = parseInt(period.replace("d", ""));
    now.setDate(now.getDate() - days);
    return now.toISOString();
  }

  private static processAnalyticsData(data: any[]) {
    // Traiter les données analytics pour générer des insights
    const stats = {
      totalEvents: data.length,
      views: data.filter((d) => d.event_type === "view").length,
      likes: data.filter((d) => d.event_type === "like").length,
      shares: data.filter((d) => d.event_type === "share").length,
      topCountries: this.getTopCountries(data),
      dailyStats: this.getDailyStats(data),
    };

    return stats;
  }

  private static getTopCountries(data: any[]) {
    const countryCounts = data.reduce((acc, item) => {
      acc[item.country] = (acc[item.country] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(countryCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);
  }

  private static getDailyStats(data: any[]) {
    const dailyStats = data.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dailyStats).map(([date, count]) => ({
      date,
      count,
    }));
  }
}

// =============================================
// SERVICES D'INTERACTION UTILISATEUR
// =============================================
export class InteractionService {
  // Like/Unlike du contenu
  static async toggleLike(contentId: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const { data: existing } = await supabase
        .from("user_interactions")
        .select("is_liked")
        .eq("user_id", user.id)
        .eq("content_id", contentId)
        .single();

      if (existing) {
        // Mettre à jour l'interaction existante
        const newLikedState = !existing.is_liked;
        await supabase
          .from("user_interactions")
          .update({ is_liked: newLikedState })
          .eq("user_id", user.id)
          .eq("content_id", contentId);

        // Enregistrer l'événement analytics
        if (newLikedState) {
          await AnalyticsService.trackEvent(contentId, "like");
        }

        return newLikedState;
      } else {
        // Créer une nouvelle interaction
        await supabase.from("user_interactions").insert({
          user_id: user.id,
          content_id: contentId,
          is_liked: true,
        });

        await AnalyticsService.trackEvent(contentId, "like");
        return true;
      }
    } catch (error) {
      console.error("Erreur lors du like:", error);
      throw error;
    }
  }

  // Bookmark/Unbookmark du contenu
  static async toggleBookmark(contentId: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const { data: existing } = await supabase
        .from("user_interactions")
        .select("is_bookmarked")
        .eq("user_id", user.id)
        .eq("content_id", contentId)
        .single();

      if (existing) {
        const newBookmarkedState = !existing.is_bookmarked;
        await supabase
          .from("user_interactions")
          .update({ is_bookmarked: newBookmarkedState })
          .eq("user_id", user.id)
          .eq("content_id", contentId);

        return newBookmarkedState;
      } else {
        await supabase.from("user_interactions").insert({
          user_id: user.id,
          content_id: contentId,
          is_bookmarked: true,
        });

        return true;
      }
    } catch (error) {
      console.error("Erreur lors du bookmark:", error);
      throw error;
    }
  }

  // Obtenir les interactions de l'utilisateur
  static async getUserInteractions(userId: string, contentIds: string[]) {
    try {
      const { data, error } = await supabase
        .from("user_interactions")
        .select("content_id, is_liked, is_bookmarked")
        .eq("user_id", userId)
        .in("content_id", contentIds);

      if (error) throw error;

      // Convertir en map pour faciliter l'accès
      type Interaction = { content_id: string; is_liked: boolean | null; is_bookmarked: boolean | null };
      const rows: Interaction[] = (data || []) as Interaction[];
      const interactionsMap = rows.reduce((acc, interaction) => {
        acc[interaction.content_id] = interaction;
        return acc;
      }, {} as Record<string, Interaction>);

      return interactionsMap;
    } catch (error) {
      console.error("Erreur lors de la récupération des interactions:", error);
      return {};
    }
  }
}

// =============================================
// SERVICES DE COMMENTAIRES
// =============================================
export class CommentService {
  // Créer un commentaire
  static async createComment(
    contentId: string,
    comment: string,
    parentId?: string,
  ) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const { data, error } = await supabase
        .from("comments")
        .insert({
          content_id: contentId,
          user_id: user.id,
          parent_id: parentId || null,
          comment: comment.trim(),
        })
        .select(
          `
          *,
          user:profiles(first_name, last_name, avatar_url)
        `,
        )
        .single();

      if (error) throw error;

      // Enregistrer l'événement analytics
      await AnalyticsService.trackEvent(contentId, "view");

      return data;
    } catch (error) {
      console.error("Erreur lors de la création du commentaire:", error);
      throw error;
    }
  }

  // Récupérer les commentaires d'un contenu
  static async getComments(contentId: string) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          user:profiles(first_name, last_name, avatar_url)
        `,
        )
        .eq("content_id", contentId)
        .eq("is_approved", true)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Organiser les commentaires en arbre (parents/enfants)
      return this.organizeCommentsTree(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des commentaires:", error);
      return [];
    }
  }

  // Organiser les commentaires en arbre
  private static organizeCommentsTree(comments: any[]) {
    const commentMap = new Map();
    const rootComments: any[] = [];

    // Première passe : créer la map des commentaires
    comments.forEach((comment) => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    // Deuxième passe : organiser en arbre
    comments.forEach((comment) => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }
}

// =============================================
// SERVICES D'AUTHENTIFICATION
// =============================================
export class AuthService {
  // Inscription
  static async signUp(email: string, password: string, metadata: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  }

  // Connexion
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Mettre à jour la dernière connexion
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ last_login: new Date().toISOString() })
          .eq("id", data.user.id);
      }

      return data;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  }

  // Déconnexion
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  }

  // Obtenir le profil utilisateur
  static async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      throw error;
    }
  }

  // Mettre à jour le profil
  static async updateProfile(
    userId: string,
    updates: Database["public"]["Tables"]["profiles"]["Update"],
  ) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  }
}

// =============================================
// SERVICES DE STOCKAGE D'IMAGES
// =============================================
export class StorageService {
  // Upload d'image avec compression
  static async uploadImage(
    file: File,
    bucket: string = "images",
    folder: string = "content",
  ): Promise<string> {
    try {
      const fileName = `${folder}/${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Erreur lors de l'upload d'image:", error);
      throw error;
    }
  }

  // Supprimer une image
  static async deleteImage(path: string, bucket: string = "images") {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error("Erreur lors de la suppression d'image:", error);
      throw error;
    }
  }
}

// Note: Les classes sont déjà exportées individuellement avec 'export class'
// Pas besoin de les ré-exporter ici

// Export du client Supabase par défaut
export default supabase;
