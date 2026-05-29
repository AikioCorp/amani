import * as fs from 'fs';
import * as path from 'path';

// generate-sitemap.ts — Migré vers l'API REST standalone
// Utilise l'API backend pour récupérer les slugs des contenus publiés

const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = 'https://amani-finance.vercel.app';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

const staticPages: SitemapUrl[] = [
  { loc: '/', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 1.0 },
  { loc: '/actualites', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.9 },
  { loc: '/marche', lastmod: new Date().toISOString().split('T')[0], changefreq: 'hourly', priority: 0.9 },
  { loc: '/economie', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.8 },
  { loc: '/indices', lastmod: new Date().toISOString().split('T')[0], changefreq: 'hourly', priority: 0.9 },
  { loc: '/investissement', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: 0.8 },
  { loc: '/insights', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: 0.8 },
  { loc: '/tech', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: 0.7 },
  { loc: '/industrie', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: 0.7 },
  { loc: '/podcast', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: 0.7 },
  { loc: '/guide-debutant', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.7 },
  { loc: '/calculateur', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.6 },
  { loc: '/newsletter', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.6 },
  { loc: '/about', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.5 },
  { loc: '/contact', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.5 },
];

async function fetchContentsFromAPI(type: string): Promise<Array<{ slug: string; updated_at: string }>> {
  try {
    const resp = await fetch(`${API_BASE}/contents?type=${type}&status=published&limit=500`);
    if (!resp.ok) {
      console.warn(`⚠️ API inaccessible pour le type ${type}, génération du sitemap avec les pages statiques uniquement`);
      return [];
    }
    const result = await resp.json();
    return result.data || [];
  } catch (err) {
    console.warn(`⚠️ Impossible de joindre l'API (${API_BASE}): ${err}. Sitemap statique uniquement.`);
    return [];
  }
}

async function generateSitemap() {
  console.log('🚀 Génération du sitemap...');

  const urls: SitemapUrl[] = [...staticPages];

  // Récupérer les articles
  const articles = await fetchContentsFromAPI('article');
  articles.forEach((article) => {
    urls.push({
      loc: `/article/${article.slug}`,
      lastmod: new Date(article.updated_at).toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.8,
    });
  });
  if (articles.length) console.log(`✅ ${articles.length} articles ajoutés au sitemap`);

  // Récupérer les podcasts
  const podcasts = await fetchContentsFromAPI('podcast');
  podcasts.forEach((podcast) => {
    urls.push({
      loc: `/podcast/${podcast.slug}`,
      lastmod: new Date(podcast.updated_at).toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: 0.7,
    });
  });
  if (podcasts.length) console.log(`✅ ${podcasts.length} podcasts ajoutés au sitemap`);

  // Générer le XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(url => `  <url>
    <loc>${BASE_URL}${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Écrire le fichier
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf-8');

  console.log(`✅ Sitemap généré avec succès: ${urls.length} URLs`);
  console.log(`📄 Fichier: ${sitemapPath}`);
}

// Exécuter
generateSitemap()
  .then(() => {
    console.log('✅ Génération du sitemap terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
