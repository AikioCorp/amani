import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useArticles, type Article } from '../../../hooks/useArticles';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ArrowLeft, Edit, Eye, Clock, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
// Composant de secours pour le surlignage de code
const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  // Si le code est vide, ne rien afficher
  if (!code?.trim()) return null;
  
  try {
    // Chargement dynamique pour réduire la taille du bundle initial
    const { Prism } = require('react-syntax-highlighter');
    const { vscDarkPlus } = require('react-syntax-highlighter/dist/cjs/styles/prism');
    
    const handleCopyCode = async () => {
      try {
        await navigator.clipboard.writeText(code);
        
        // Créer et afficher une notification
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up';
        notification.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Code copié !
        `;
        
        document.body.appendChild(notification);
        
        // Supprimer la notification après 3 secondes
        setTimeout(() => {
          notification.classList.add('opacity-0', 'translate-y-2', 'transition-all', 'duration-300');
          setTimeout(() => {
            notification.remove();
          }, 300);
        }, 2000);
      } catch (err) {
        console.error('Erreur lors de la copie du code:', err);
      }
    };

    return (
      <div className="relative group my-4">
        <div className="absolute right-2 top-2 flex items-center gap-2">
          <div className="text-xs text-muted-foreground bg-gray-800/80 px-2 py-1 rounded">
            {language || 'text'}
          </div>
          <button
            onClick={handleCopyCode}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 p-1.5 rounded"
            title="Copier le code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
        <Prism
          language={language}
          style={vscDarkPlus}
          className="rounded-lg text-sm !m-0"
          showLineNumbers={code.split('\n').length > 5}
          wrapLines={true}
          wrapLongLines={false}
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            padding: '1rem',
            background: '#1e1e1e',
          }}
        >
          {code}
        </Prism>
      </div>
    );
  } catch (error) {
    console.error('Erreur de chargement du surligneur de syntaxe:', error);
    return (
      <div className="bg-gray-800 text-white p-4 rounded-lg my-4 overflow-x-auto">
        <pre className="text-sm m-0">
          <code>{code}</code>
        </pre>
      </div>
    );
  }
};

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { fetchArticleByIdOrSlug, loading, error } = useArticles();
  const [article, setArticle] = useState<Article | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
    fetchArticleByIdOrSlug(slug)
      .then(setArticle)
      .catch((e) => console.error('Failed to load article', e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        <p>Erreur lors du chargement de l'article : {error?.message || 'Article non trouvé'}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard/articles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/dashboard/articles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux articles
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(`/dashboard/articles/${article.slug}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button onClick={() => window.open(`/articles/${article.slug}`, '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Voir l'article
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        {article.featured_image && (
          <div className="h-64 md:h-80 overflow-hidden">
            <img
              src={article.featured_image}
              alt={article.featured_image_alt || article.title}
              className="w-full h-full object-cover"
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

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
              {article.status === 'published' ? 'Publié' : 'Brouillon'}
            </Badge>
            {article.category_info?.name && (
              <Badge variant="outline">
                {article.category_info.name}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">{article.title}</h1>
          
          <div className="flex items-center text-muted-foreground text-sm mb-6 space-x-4">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{article.author.first_name} {article.author.last_name}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {article.published_at
                  ? `Publié le ${format(new Date(article.published_at), 'PPP', { locale: fr })}`
                  : 'Non publié'}
              </span>
            </div>
            {article.read_time && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{article.read_time} min de lecture</span>
              </div>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-8">{article.summary}</p>
            
            {article.content && (
              <div className="mt-8">
                {article.content.split('\n\n').map((paragraph, i) => {
                  // Vérifier si c'est un bloc de code
                  if (paragraph.startsWith('```')) {
                    const match = paragraph.match(/^```(\w+)?\n([\s\S]*?)\n```$/);
                    if (match) {
                      const [, language, code] = match;
                      return (
                        <CodeBlock 
                          key={i} 
                          language={language || 'text'} 
                          code={code.trim()} 
                        />
                      );
                    }
                  }
                  
                  // Vérifier si c'est un titre
                  if (paragraph.startsWith('#')) {
                    const level = paragraph.match(/^#+/)?.[0].length || 1;
                    const text = paragraph.replace(/^#+\s*/, '');
                    const HeadingTag = `h${Math.min(6, level)}` as keyof JSX.IntrinsicElements;
                    return <HeadingTag key={i} className="mt-6 mb-4 font-bold">{text}</HeadingTag>;
                  }
                  
                  // Vérifier si c'est une liste à puces
                  if (paragraph.match(/^\s*[-*+]\s+/)) {
                    const items = paragraph.split('\n').filter(Boolean);
                    return (
                      <ul key={i} className="list-disc pl-6 mb-4 space-y-2">
                        {items.map((item, j) => (
                          <li key={j} className="text-foreground">
                            {item.replace(/^\s*[-*+]\s+/, '')}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  
                  // Vérifier les images ![alt text](url)
                  const imageMatch = paragraph.match(/!\[([^\]]*)\]\(([^)]+)\)/);
                  if (imageMatch) {
                    const [fullMatch, alt, src] = imageMatch;
                    return (
                      <div key={i} className="my-6">
                        <img 
                          src={src} 
                          alt={alt || 'Image'} 
                          className="mx-auto rounded-lg max-w-full h-auto"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.onerror = null;
                            target.src = "/placeholder.svg";
                          }}
                        />
                        {alt && (
                          <p className="text-center text-sm text-muted-foreground mt-2">
                            {alt}
                          </p>
                        )}
                      </div>
                    );
                  }
                  
                  // Vérifier les liens [texte](url)
                  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                  let lastIndex = 0;
                  const elements = [];
                  let match;
                  
                  while ((match = linkRegex.exec(paragraph)) !== null) {
                    // Ajouter le texte avant le lien
                    if (match.index > lastIndex) {
                      elements.push(paragraph.substring(lastIndex, match.index));
                    }
                    
                    // Ajouter le lien
                    const [fullMatch, text, href] = match;
                    elements.push(
                      <a 
                        key={match.index} 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {text}
                      </a>
                    );
                    
                    lastIndex = match.index + fullMatch.length;
                  }
                  
                  // Ajouter le texte restant après le dernier lien
                  if (lastIndex < paragraph.length) {
                    elements.push(paragraph.substring(lastIndex));
                  }
                  
                  // Si des liens ont été trouvés, les afficher, sinon afficher le paragraphe normal
                  return elements.length > 0 ? (
                    <p key={i} className="mb-4">{elements}</p>
                  ) : (
                    <p key={i} className="mb-4">{paragraph}</p>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Dernière mise à jour : {format(new Date(article.updated_at), 'PPP', { locale: fr })}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(`/dashboard/articles/${article.slug}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>
    </div>
  );
}
