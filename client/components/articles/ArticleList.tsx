import React, { useEffect } from 'react';
import { useArticles } from '@/hooks/useArticles';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export const ArticleList: React.FC<{ status?: 'published' | 'draft' | 'archived' | 'all' }> = ({ status = 'published' }) => {
  const { articles, loading, error } = useArticles({ status });

  // Debug: inspect featured_image URLs received by the list
  useEffect(() => {
    try {
      // Log a light summary to avoid noise
      const summary = articles.map(a => ({ title: a.title, featured_image: a.featured_image }));
      console.log('🧪 ArticleList featured_image check:', summary);
    } catch {}
  }, [articles]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Erreur lors du chargement des articles : {error.message}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucun article trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <article key={article.id} className="border-b pb-6 mb-6">
          <Link to={`/article/${article.slug || article.id}`} className="group flex flex-col md:flex-row gap-6 block">
            {article.featured_image && (
              <div className="md:w-1/3 overflow-hidden rounded-lg">
                <img
                  src={article.featured_image}
                  alt={article.featured_image_alt || article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
            )}
            <div className={`${article.featured_image ? 'md:w-2/3' : 'w-full'}`}>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>{article.category_info?.name}</span>
                <span>•</span>
                <span>
                  {format(new Date(article.published_at || article.created_at), 'd MMMM yyyy', { locale: fr })}
                </span>
                <span>•</span>
                <span>{article.read_time || '5'} min de lecture</span>
              </div>
              
              <h2 className="text-2xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h2>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{article.summary}</p>
              
              <div className="flex items-center gap-2">
                {article.author.avatar_url && (
                  <img 
                    src={article.author.avatar_url} 
                    alt={`${article.author.first_name} ${article.author.last_name}`}
                    className="w-8 h-8 rounded-full"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/placeholder.svg";
                    }}
                  />
                )}
                <span className="text-sm text-gray-600">
                  Par {article.author.first_name} {article.author.last_name}
                </span>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
};

export default ArticleList;
