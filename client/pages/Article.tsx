import React from "react";
import { API_BASE_URL as API_BASE } from "../services/apiConfig";
import { useParams, Link } from "react-router-dom";
import { Calendar, ArrowLeft, Share2, Mail, Send } from "lucide-react";
import { useArticles } from "../hooks/useArticles";
import { useToast } from "../context/ToastContext";
import { ArticleDetailSkeleton } from "../components/ui/SkeletonLoaders";

export default function Article() {
  const { id } = useParams();
  const { fetchArticleByIdOrSlug } = useArticles({ status: 'all', limit: 1, offset: 0 });
  const toast = useToast();

  const [article, setArticle] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showSticky, setShowSticky] = React.useState(false);
  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('Identifiant article manquant');
        const res = await fetchArticleByIdOrSlug(id);
        if (mounted) setArticle(res);
      } catch (e: any) {
        console.error('❌ Erreur chargement article:', e);
        if (mounted) setError(e?.message || 'Erreur inconnue');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [id, fetchArticleByIdOrSlug]);

  // Sticky header visibility on scroll
  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setShowSticky(y > 160);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      {/* Sticky header on scroll */}
      {article && (
        <div
          className={`sticky top-16 z-50 transition-all duration-300 ${showSticky ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
        >
          <div className="backdrop-blur-md bg-white/90 border-b border-gray-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
              <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline font-medium text-sm">Retour</span>
              </Link>
              <div className="h-4 w-px bg-gray-200"></div>
              <div className="truncate text-sm font-semibold text-gray-900">
                {article?.title}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Center: Article */}
          <div className="lg:col-span-8">

            {loading && <ArticleDetailSkeleton />}
            {error && !loading && (
              <div className="bg-white rounded-lg shadow-md p-8 text-red-600">{error}</div>
            )}
            {!loading && !error && article && (
              <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-10 pb-6">
                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="bg-[#9C8464] text-white px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase shadow-sm">
                      {article.category_info?.name || 'Actualités'}
                    </span>
                    <span className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                        : (article.created_at ? new Date(article.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '')}
                    </span>
                    <button 
                      onClick={() => {
                        const url = window.location.href;
                        if (navigator.share) {
                          navigator.share({
                            title: article.title,
                            text: article.summary || 'Découvrez cet article sur Amani Finance',
                            url: url,
                          }).catch(console.error);
                        } else {
                          navigator.clipboard.writeText(url);
                          if (toast && toast.success) {
                            toast.success('Lien copié', 'Le lien de l\'article a été copié dans votre presse-papier.');
                          }
                        }
                      }}
                      className="flex items-center gap-1.5 text-[13px] font-bold text-gray-500 hover:text-[#9C8464] ml-auto transition-colors bg-gray-50 px-3 py-1.5 rounded-full"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Partager
                    </button>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight">
                    {article.title}
                  </h1>

                  {/* Summary */}
                  {article.summary && (
                    <div className="bg-[#FDFBF9] border-l-4 border-[#9C8464] p-6 rounded-r-xl mb-10 shadow-sm">
                      <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm uppercase tracking-widest">
                        Ce qu'il faut retenir
                      </h2>
                      <p className="text-gray-700 text-lg leading-relaxed font-medium">{article.summary}</p>
                    </div>
                  )}
                </div>

                <div className="px-4 md:px-10">
                  <img
                    src={(() => {
                      const img = article.featured_image;
                      if (!img || img === '/placeholder.svg' || img.includes('rrhcctylbczzahgiqoub.supabase.co')) {
                        const defaultImages = [
                          "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80",
                          "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&q=80",
                          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80"
                        ];
                        const hash = String(article.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        return defaultImages[hash % defaultImages.length];
                      }
                      return img;
                    })()}
                    alt={article.title}
                    className="w-full h-[400px] md:h-[500px] object-cover rounded-xl shadow-inner"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/placeholder.svg";
                    }}
                  />
                </div>

                <div className="p-8 md:p-10 pt-10">
                  {/* Full Article Content */}
                  {article.content && article.content.trim().length > 10 ? (
                    <div className="prose prose-lg prose-gray max-w-none text-gray-800 leading-[1.8] mb-12 font-serif">
                      <div dangerouslySetInnerHTML={{ __html: article.content }} />
                    </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 text-center">
                  <p className="text-slate-600 mb-4">
                    Cet article est actuellement présenté en format extrait synthétique.
                  </p>
                  {article.article_data?.original_link && (
                    <a
                      href={article.article_data.original_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors"
                    >
                      Lire la source complète d'origine ↗
                    </a>
                  )}
                </div>
              )}

                  {/* Tags */}
                  {Array.isArray(article.tags) && article.tags.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Mots-clés</h3>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="bg-gray-50 border border-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer shadow-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Articles */}
                  <div className="mt-12">
                    <RelatedArticles
                      currentId={article.id}
                      categorySlug={article.category_info?.slug}
                      categoryId={article.category_id}
                    />
                  </div>
                </div>
              </article>
            )}
          </div>

          {/* Right: Sidebar */}
          <aside className="lg:col-span-4 space-y-8 sticky top-28 self-start">
            <NewsletterMiniForm />
            <CategoriesSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}

// Sidebar: Categories list
function CategoriesSidebar() {
  const [categories, setCategories] = React.useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;


    const load = async () => {
      try {
        setLoading(true);
        setErr(null);
        const resp = await fetch(`${API_BASE}/categories`);
        if (!resp.ok) throw new Error("Erreur de chargement des catégories");
        const result = await resp.json();
        
        if (mounted) setCategories(result.data || []);
      } catch (e: any) {
        if (mounted) setErr(e?.message || 'Erreur chargement catégories');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const slugToRoute: Record<string, string> = {
    'economie': '/economie',
    'marches-financiers': '/marche',
    'politique-monetaire': '/actualites',
    'industrie-miniere': '/industrie',
    'agriculture': '/actualites',
    'technologie': '/tech',
    'investissement': '/investissement',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Catégories</h3>
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 bg-gray-100 rounded-md animate-pulse" />
          ))}
        </div>
      )}
      {err && !loading && (
        <div className="text-sm text-red-500 font-medium">Impossible de charger les catégories.</div>
      )}
      {!loading && !err && (
        <ul className="space-y-3">
          {categories.map((c) => {
            const href = slugToRoute[c.slug] || '/actualites';
            return (
              <li key={c.id}>
                <Link
                  to={href}
                  className="flex items-center text-gray-600 font-medium hover:text-[#9C8464] transition-colors py-1 border-b border-transparent hover:border-[#9C8464]/30"
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Sidebar: Newsletter mini form
function NewsletterMiniForm() {
  const { success, error } = useToast();
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      error('Email requis', 'Veuillez saisir votre adresse email.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      error('Email invalide', 'Veuillez saisir une adresse email valide.');
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    success('Abonnement confirmé', `Vous êtes maintenant abonné avec ${email}`);
    setEmail('');
    setSubmitting(false);
  };

  return (
    <div className="bg-[#373B3A] rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none"></div>
      <h3 className="text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
        <Mail className="w-4 h-4 text-[#9C8464]" />
        Newsletter
      </h3>
      <p className="text-white/70 text-sm mb-6">Ne manquez plus aucune de nos analyses, recevez-les chaque semaine.</p>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 relative z-10">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            disabled={submitting}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-4 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9C8464] text-white placeholder-white/40 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#9C8464] hover:bg-[#857053] text-white py-3 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? 'Abonnement...' : (
            <>
              S'abonner <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
      <p className="text-[10px] text-white/50 mt-4 leading-tight">
        En vous inscrivant, vous acceptez notre politique de confidentialité.
      </p>
    </div>
  );
}

// Section: Articles similaires
function RelatedArticles({
  currentId,
  categorySlug,
  categoryId,
}: {
  currentId: string;
  categorySlug?: string;
  categoryId?: string;
}) {
  // `useArticles` accepte un slug OU un UUID pour `category`
  const category = categorySlug || categoryId || undefined;
  const { articles, loading, error } = useArticles({ status: 'published', limit: 6, offset: 0, category });

  const related = React.useMemo(() => {
    const list = (articles || []).filter((a: any) => a.id !== currentId);
    const sorted = list.sort((a: any, b: any) => {
      const aDate = (a.published_at || a.created_at) ? new Date(a.published_at || a.created_at).getTime() : 0;
      const bDate = (b.published_at || b.created_at) ? new Date(b.published_at || b.created_at).getTime() : 0;
      return bDate - aDate;
    });
    return sorted.slice(0, 4);
  }, [articles, currentId]);

  if (!category) return null;

  return (
    <div className="mt-10 pt-8 border-t border-gray-200">
      <h3 className="text-2xl font-semibold text-amani-primary mb-6">Articles similaires</h3>
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
              <div className="h-32 bg-gray-200 rounded mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}
      {error && !loading && (
        <div className="text-sm text-gray-500">Aucun article similaire pour le moment.</div>
      )}
      {!loading && !error && related.length === 0 && (
        <div className="text-sm text-gray-500">Aucun article similaire pour le moment.</div>
      )}
      {!loading && !error && related.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {related.map((a: any) => (
            <Link
              key={a.id}
              to={`/article/${a.slug || a.id}`}
              className="group block bg-white rounded-lg border hover:shadow transition-shadow overflow-hidden"
            >
              {(() => {
                const img = a.featured_image;
                const isDead = img && img.includes('rrhcctylbczzahgiqoub.supabase.co');
                const finalSrc = (!img || img === '/placeholder.svg' || isDead) 
                  ? [
                      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80",
                      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=80",
                      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80"
                    ][String(a.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 3]
                  : img;
                
                return (
                  <img
                    src={finalSrc}
                    alt={a.featured_image_alt || a.title}
                    className="w-full h-40 object-cover group-hover:opacity-95"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/placeholder.svg";
                    }}
                  />
                );
              })()}
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">{a.category_info?.name}</div>
                <h4 className="font-semibold text-amani-primary mb-2 line-clamp-2">{a.title}</h4>
                {a.summary && (
                  <p className="text-sm text-gray-600 line-clamp-2">{a.summary}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
