import { useState, useEffect, useCallback, useRef } from 'react';
import { getContents, getContentBySlug, getContentById, createContent, updateContent, deleteContent as deleteContentApi } from '../services/contentService';
import { getSessionToken } from '../services/authService';

export type ArticleStatus = 'draft' | 'published' | 'archived' | 'review';

export interface Article {
  id: string;
  type: 'article';
  title: string;
  slug: string;
  summary: string;
  description?: string | null;
  content: string | null;
  status: ArticleStatus;
  category_id: string;
  country: string;
  tags?: string[];
  author_id: string;
  meta_title?: string | null;
  meta_description?: string | null;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  views: number;
  likes: number;
  shares: number;
  read_time?: number | null;
  article_data?: Record<string, any>;
  author?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    role: "admin" | "editor" | "analyst" | "moderator" | "subscriber";
    permissions: string[];
    bio?: string;
  };
  category_info?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color: string;
    icon?: string;
  };
  comment_count: number;
  is_liked_by_user?: boolean;
}

interface UseArticlesOptions {
  status?: ArticleStatus | 'all';
  limit?: number;
  offset?: number;
  category?: string;
  authorId?: string;
}

export const useArticles = ({
  status = 'published',
  limit = 10,
  offset = 0,
  category,
  authorId
}: UseArticlesOptions = {}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState<number>(0);
  const didInitialFetch = useRef(false);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getContents({
        type: 'article',
        status: status === 'all' ? undefined : status,
        limit,
        offset,
        category,
        authorId,
      });

      // Formater pour ressembler aux structures attendues par le front
      const formatted: Article[] = result.data.map((c: any) => ({
        ...c,
        type: 'article',
        category_info: c.category || undefined,
        comment_count: c.comment_count?.[0]?.count || 0,
      }));

      setArticles(formatted);
      setCount(result.count);
      return formatted;
    } catch (err: any) {
      console.error('Error in fetchArticles hook:', err);
      setError(err as Error);
      setArticles([]);
      setCount(0);
      return [];
    } finally {
      setLoading(false);
    }
  }, [status, limit, offset, category, authorId]);

  const fetchArticleBySlug = useCallback(async (slug: string): Promise<Article> => {
    try {
      setLoading(true);
      const data = await getContentBySlug(slug);
      
      const formatted: Article = {
        ...(data as any),
        type: 'article',
        category_info: (data as any).category || undefined,
        comment_count: (data as any).comments?.length || 0,
      };

      return formatted;
    } catch (err: any) {
      console.error('Error fetching article by slug:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchArticleById = useCallback(async (id: string): Promise<Article> => {
    try {
      setLoading(true);
      const data = await getContentById(id);
      if (!data) throw new Error("Article introuvable par ID");
      
      return {
        ...(data as any),
        type: 'article',
        category_info: (data as any).category || undefined,
        comment_count: (data as any).comments?.length || 0
      };
    } catch (err: any) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchArticleByIdOrSlug = useCallback(async (identifier: string): Promise<Article> => {
    // Si ressemble à un UUID, récupère par ID, sinon par slug
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(identifier)) {
      return fetchArticleById(identifier);
    }
    return fetchArticleBySlug(identifier);
  }, [fetchArticleById, fetchArticleBySlug]);

  const createArticle = useCallback(async (articleData: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views' | 'likes' | 'shares' | 'comment_count' | 'is_liked_by_user'>) => {
    try {
      setLoading(true);
      
      // Récupérer le token d'auth du localStorage
      const token = getSessionToken();
      
      const response = await fetch("http://localhost:5000/api/contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ...articleData,
          type: 'article',
        }),
      });

      if (!response.ok) throw new Error("Erreur de création de l'article");
      const result = await response.json();
      
      await fetchArticles();
      return result.data as Article;
    } catch (err: any) {
      console.error('Error creating article:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchArticles]);

  const updateArticle = useCallback(async (id: string, updates: Partial<Article>) => {
    try {
      setLoading(true);
      const data = await updateContent(id, updates as any);
      
      setArticles(prev => 
        prev.map(article => 
          article.id === id ? { ...article, ...updates } : article
        )
      );
      
      return data;
    } catch (err: any) {
      console.error('Error updating article:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteArticle = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await deleteContentApi(id);
      
      setArticles(prev => prev.filter(article => article.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting article:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didInitialFetch.current) {
      fetchArticles();
      return;
    }
    didInitialFetch.current = true;
    fetchArticles();
  }, [status, limit, offset, category, authorId, fetchArticles]);

  return {
    articles,
    loading,
    error,
    count,
    refetch: fetchArticles,
    fetchArticleBySlug,
    fetchArticleById,
    fetchArticleByIdOrSlug,
    createArticle,
    updateArticle,
    deleteArticle
  };
};

export const useArticle = (slugOrId: string) => {
  const { fetchArticleByIdOrSlug } = useArticles();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    if (!slugOrId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchArticleByIdOrSlug(slugOrId);
        if (active) setArticle(data);
      } catch (err: any) {
        if (active) setError(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [slugOrId, fetchArticleByIdOrSlug]);

  return { article, loading, error };
};
