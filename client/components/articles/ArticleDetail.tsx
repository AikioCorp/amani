import React from 'react';
import { useParams } from 'react-router-dom';
import { useArticle } from '@/hooks/useArticles';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { sanitizeHtml } from '@/lib/sanitize';

export const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { article: articleRaw, loading, error } = useArticle(slug || '');
  const article = articleRaw as any;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-96 w-full mb-8" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Erreur lors du chargement de l'article : {error.message}</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
        <p className="text-gray-600">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span className="px-2 py-1 rounded-full text-xs font-medium" 
                style={{ backgroundColor: `${article.category?.color}20`, color: article.category?.color }}>
            {article.category?.name}
          </span>
          <span>•</span>
          <span>
            {format(new Date(article.published_at || article.created_at), 'd MMMM yyyy', { locale: fr })}
          </span>
          <span>•</span>
          <span>{article.read_time || '5'} min de lecture</span>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        
        <div className="flex items-center gap-3 mt-6">
          {article.author.avatar_url && (
            <img 
              src={article.author.avatar_url} 
              alt={`${article.author.first_name} ${article.author.last_name}`}
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <p className="font-medium">
              {article.author.first_name} {article.author.last_name}
            </p>
            <p className="text-sm text-gray-500">
              {article.author.title || 'Auteur'}
            </p>
          </div>
        </div>
      </header>

      {article.featured_image && (
        <div className="mb-8 rounded-xl overflow-hidden">
          <img
            src={article.featured_image}
            alt={article.featured_image_alt || article.title}
            className="w-full h-auto max-h-[500px] object-cover"
          />
          {article.featured_image_caption && (
            <p className="mt-2 text-sm text-gray-500 text-center">
              {article.featured_image_caption}
            </p>
          )}
        </div>
      )}

      <div className="prose max-w-none">
        {article.content ? (
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />
        ) : (
          <p className="text-gray-600">Contenu non disponible.</p>
        )}
      </div>

      <footer className="mt-12 pt-6 border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          {article.tags?.map((tag) => (
            <span 
              key={tag} 
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </footer>
    </article>
  );
};

export default ArticleDetail;
