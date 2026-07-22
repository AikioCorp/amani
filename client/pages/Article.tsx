import React from "react";
import { API_BASE_URL as API_BASE } from "../services/apiConfig";
import { useParams, Link } from "react-router-dom";
import { Calendar, ArrowLeft, Share2, Mail, Send } from "lucide-react";
import { useArticles } from "../hooks/useArticles";
import { useToast } from "../context/ToastContext";

export default function Article() {
  const { id } = useParams();
  const { fetchArticleByIdOrSlug } = useArticles({ status: 'all', limit: 1, offset: 0 });

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
    <div className="min-h-screen bg-[#E5DDD2]">
      {/* Sticky header on scroll */}
      {article && (
        <div
          className={`sticky top-16 z-50 transition-all duration-200 ${showSticky ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
        >
          <div className="backdrop-blur bg-white/80 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-3">
              <Link to="/" className="inline-flex items-center gap-2 text-amani-primary hover:text-amani-primary/80">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Retour</span>
              </Link>
              <div className="truncate text-sm sm:text-base font-medium text-amani-primary">
                {article?.title}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Categories */}
          <aside className="lg:col-span-3 order-2 lg:order-1 self-start">
            <CategoriesSidebar />
          </aside>

          {/* Center: Article */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            {/* Back button */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-amani-primary hover:text-amani-primary/80 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>

            {loading && (
              <div className="bg-white rounded-lg shadow-md p-8">Chargement…</div>
            )}
            {error && !loading && (
              <div className="bg-white rounded-lg shadow-md p-8 text-red-600">{error}</div>
            )}
            {!loading && !error && article && (
              <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={article.featured_image || "/placeholder.svg"}
              alt={article.title}
              className="w-full h-64 md:h-80 object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = "/placeholder.svg";
              }}
            />

            <div className="p-6 md:p-8">
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="bg-amani-secondary text-amani-primary px-3 py-1 rounded-full text-sm font-medium">
                  {article.category_info?.name || 'Actualités'}
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {article.published_at
                    ? new Date(article.published_at).toLocaleDateString('fr-FR')
                    : (article.created_at ? new Date(article.created_at).toLocaleDateString('fr-FR') : '')}
                </span>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-amani-primary ml-auto">
                  <Share2 className="w-4 h-4" />
                  Partager
                </button>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-amani-primary mb-6">
                {article.title}
              </h1>

              {/* Summary */}
              {article.summary && (
                <div className="bg-amani-secondary/30 p-4 rounded-lg mb-8">
                  <h2 className="font-semibold text-amani-primary mb-2">Ce qu'il faut retenir</h2>
                  <p className="text-gray-700">{article.summary}</p>
                </div>
              )}

              {/* Tags */}
              {Array.isArray(article.tags) && article.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-amani-primary mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-amani-secondary/50 cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Articles */}
              <RelatedArticles
                currentId={article.id}
                categorySlug={article.category_info?.slug}
                categoryId={article.category_id}
              />
            </div>
              </article>
            )}
          </div>

          {/* Right: Newsletter mini form */}
          <aside className="lg:col-span-3 order-3">
            <NewsletterMiniForm />
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
    <div className="sticky top-24 bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-amani-primary mb-4">Catégories</h3>
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
      )}
      {err && !loading && (
        <div className="text-sm text-gray-500">Impossible de charger les catégories.</div>
      )}
      {!loading && !err && (
        <ul className="space-y-2">
          {categories.map((c) => {
            const href = slugToRoute[c.slug] || '/actualites';
            return (
              <li key={c.id}>
                <Link
                  to={href}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-amani-secondary/30 text-amani-primary text-sm hover:bg-amani-secondary/40"
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
    <div className="sticky top-24 bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-amani-primary mb-2">Newsletter</h3>
      <p className="text-gray-600 text-sm mb-4">Recevez nos analyses chaque semaine.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="sr-only">Email</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amani-primary"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-3 py-2 bg-amani-primary text-white rounded-md hover:bg-amani-primary/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? '...' : "S'abonner"}
            </button>
          </div>
        </div>
      </form>
      <div className="text-xs text-gray-500 mt-3">En vous inscrivant, vous acceptez notre politique de confidentialité.</div>
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
              {a.featured_image && (
                <img
                  src={a.featured_image}
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
              )}
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
