import React from "react";
import { API_BASE_URL as API_BASE } from "../services/apiConfig";
import { useParams, Link } from "react-router-dom";
import { Calendar, ArrowLeft, Share2, Mail, Send, Crown, Lock, Sparkles } from "lucide-react";
import { useArticles } from "../hooks/useArticles";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { getSessionToken } from "../services/authService";
import { ArticleDetailSkeleton } from "../components/ui/SkeletonLoaders";
import { apiCache } from "../lib/apiCache";

export default function Article() {
  const { id } = useParams();
  const { fetchArticleByIdOrSlug } = useArticles({ status: 'all', limit: 1, offset: 0 });
  const toast = useToast();
  const { user } = useAuth();

  const [article, setArticle] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showSticky, setShowSticky] = React.useState(false);
  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        if (!id) throw new Error('Identifiant article manquant');
        
        // Instant 0ms cache display
        const cached = apiCache.get(`article_slug_${id}`) || apiCache.get(`article_id_${id}`);
        if (cached && mounted) {
          setArticle(cached);
          setLoading(false);
        } else if (mounted) {
          setLoading(true);
        }
        setError(null);

        const res = await fetchArticleByIdOrSlug(id);
        if (mounted) {
          setArticle(res);
          setLoading(false);
        }
      } catch (e: any) {
        console.error('❌ Erreur chargement article:', e);
        if (mounted && !article) setError(e?.message || 'Erreur inconnue');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [id]);

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
      {/* Sticky Header avec Titre de l'article et bouton Retour */}
      {article && (
        <div
          className={`sticky top-16 lg:top-20 z-40 transition-all duration-300 ${
            showSticky ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="bg-[#373B3A]/95 backdrop-blur-md border-b border-white/10 text-white shadow-md">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-[#E5DDD5]" />
                  <span>Retour</span>
                </button>
                <div className="h-4 w-px bg-white/20 flex-shrink-0" />
                <h2 className="truncate text-xs sm:text-sm font-extrabold text-[#E5DDD5]">
                  {article?.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: article?.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Lien copié !", "Le lien a été copié dans votre presse-papier.");
                  }
                }}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                title="Partager cet article"
              >
                <Share2 className="w-4 h-4" />
              </button>
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
                  {/* Full Article Content / Gated Premium Paywall */}
                  {article.is_premium && !user?.is_premium ? (
                    <div className="space-y-6">
                      {/* Aperçu partiel du résumé */}
                      <div className="prose prose-lg prose-gray max-w-none text-gray-800 leading-[1.8] font-serif blur-[1px] select-none pointer-events-none">
                        <p>{article.summary}</p>
                        <p>Cette analyse financière exclusive contient des données stratégiques réservées aux abonnés...</p>
                      </div>

                      {/* Paywall Card Modern Solid Design */}
                      <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl border border-slate-800 text-center relative overflow-hidden my-8">
                        <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Crown className="w-7 h-7" />
                        </div>

                        <h3 className="text-2xl font-extrabold tracking-tight mb-2">
                          Contenu Exclusif Membre Premium
                        </h3>
                        <p className="text-slate-300 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                          Cet article et ses analyses stratégiques sont réservés aux abonnés Premium Amani Finance. 
                          Abonnez-vous pour débloquer l'accès illimité à tous nos contenus exclusifs, podcasts et dossiers d'analyse.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                          {user ? (
                            <button
                              onClick={async () => {
                                try {
                                  const token = getSessionToken();
                                  const res = await fetch(`${API_BASE}/user/subscribe-premium`, {
                                    method: "POST",
                                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                                  });
                                  const json = await res.json();
                                  if (json.success) {
                                    toast.success("Abonnement Activé !", "Vous avez désormais accès à tous les contenus Premium Amani Finance.");
                                    window.location.reload();
                                  } else {
                                    toast.error("Erreur", json.error || "Échec de l'activation Premium.");
                                  }
                                } catch (e) {
                                  toast.error("Erreur réseau");
                                }
                              }}
                              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
                            >
                              <Sparkles className="w-4 h-4" /> Activer mon Pass Premium Amani
                            </button>
                          ) : (
                            <Link
                              to="/login"
                              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
                            >
                              <Lock className="w-4 h-4" /> Se connecter / S'abonner pour débloquer
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : article.content && article.content.trim().length > 10 ? (
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
