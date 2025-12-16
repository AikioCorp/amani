# 📊 Documentation SEO - Amani Finance

## Vue d'ensemble

Amani Finance est optimisé pour le SEO avec une approche professionnelle et complète incluant :
- ✅ Métadonnées optimisées (Open Graph, Twitter Cards)
- ✅ Schema.org / JSON-LD pour les rich snippets
- ✅ Sitemap XML dynamique
- ✅ Robots.txt configuré
- ✅ URLs canoniques
- ✅ Performance optimisée
- ✅ Mobile-friendly
- ✅ Accessibilité (a11y)

---

## 🎯 Composants SEO

### 1. Hook `useSEO`

Hook React personnalisé pour gérer le SEO dynamique de chaque page.

**Utilisation :**
```tsx
import { useSEO } from '@/hooks/useSEO';

function MyPage() {
  useSEO({
    title: 'Mon Titre | Amani Finance',
    description: 'Description de ma page',
    keywords: 'mots, clés, pertinents',
    image: 'https://amani-finance.vercel.app/image.jpg',
    type: 'article', // ou 'website'
  });
  
  return <div>Contenu</div>;
}
```

### 2. Composant `SEOHead`

Composant réutilisable pour gérer les métadonnées.

**Utilisation :**
```tsx
import SEOHead from '@/components/SEOHead';

function MyPage() {
  return (
    <>
      <SEOHead
        title="Mon Titre"
        description="Ma description"
        keywords="mots, clés"
        image="/image.jpg"
      />
      <div>Contenu</div>
    </>
  );
}
```

### 3. Composant `ArticleSEO`

Composant spécialisé pour les articles avec structured data.

**Utilisation :**
```tsx
import { ArticleSEO } from '@/components/SEOHead';

function ArticlePage({ article }) {
  return (
    <>
      <ArticleSEO
        title={article.title}
        description={article.summary}
        image={article.featured_image}
        author={article.author.name}
        publishedTime={article.published_at}
        modifiedTime={article.updated_at}
        keywords={article.tags.join(', ')}
      />
      <article>{/* Contenu */}</article>
    </>
  );
}
```

---

## 📄 Fichiers SEO

### `index.html`
Fichier principal avec métadonnées de base :
- Meta tags primaires
- Open Graph
- Twitter Cards
- Favicon et manifest
- Schema.org JSON-LD de base

### `robots.txt`
Configuration pour les crawlers :
- Autorise l'indexation des pages publiques
- Bloque `/dashboard/` et `/api/`
- Référence le sitemap
- Crawl-delay configuré

### `sitemap.xml`
Sitemap statique avec toutes les pages principales.

### `site.webmanifest`
Manifest PWA pour l'installation sur mobile.

---

## 🔄 Génération Dynamique du Sitemap

### Script `generate-sitemap.ts`

Script Node.js pour générer automatiquement le sitemap avec le contenu de Supabase.

**Exécution :**
```bash
# Générer le sitemap
npx tsx scripts/generate-sitemap.ts
```

**Automatisation (recommandé) :**

Ajoutez au `package.json` :
```json
{
  "scripts": {
    "generate:sitemap": "tsx scripts/generate-sitemap.ts",
    "prebuild": "npm run generate:sitemap"
  }
}
```

Le sitemap sera automatiquement régénéré avant chaque build.

---

## 🎨 Métadonnées par Type de Page

### Page d'accueil
```tsx
useSEO({
  title: 'Amani Finance - Actualités Économiques et Marchés Africains',
  description: 'Plateforme d\'information financière pour l\'Afrique...',
  type: 'website',
  priority: 1.0
});
```

### Page Article
```tsx
<ArticleSEO
  title={article.title}
  description={article.summary}
  image={article.featured_image}
  author={article.author}
  publishedTime={article.published_at}
  type="article"
/>
```

### Page Catégorie
```tsx
<CategorySEO
  category="Économie"
  description="Analyses et actualités économiques..."
  keywords="économie, Afrique, analyses"
/>
```

---

## 🖼️ Images SEO

### Images Open Graph
- **Dimensions recommandées** : 1200x630px
- **Format** : JPG ou PNG
- **Poids max** : 5MB
- **Emplacement** : `/public/og-image.jpg`

### Images Twitter Card
- **Dimensions recommandées** : 1200x600px
- **Format** : JPG ou PNG
- **Emplacement** : `/public/twitter-image.jpg`

### Favicon
- **Formats requis** :
  - `favicon.ico` (16x16, 32x32)
  - `favicon-16x16.png`
  - `favicon-32x32.png`
  - `apple-touch-icon.png` (180x180)
  - `android-chrome-192x192.png`
  - `android-chrome-512x512.png`

---

## 📊 Schema.org / Structured Data

### Types implémentés

#### WebSite
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Amani Finance",
  "url": "https://amani-finance.vercel.app"
}
```

#### NewsArticle
```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Titre de l'article",
  "datePublished": "2025-12-16",
  "author": { "@type": "Person", "name": "Auteur" }
}
```

#### Organization
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Amani Finance",
  "logo": "https://amani-finance.vercel.app/logo.png"
}
```

---

## ✅ Checklist SEO

### Technique
- [x] Meta tags optimisés
- [x] Open Graph configuré
- [x] Twitter Cards configuré
- [x] Schema.org JSON-LD
- [x] Sitemap XML
- [x] Robots.txt
- [x] URLs canoniques
- [x] Manifest PWA
- [x] Favicon complet

### Contenu
- [ ] Titres H1 uniques par page
- [ ] Descriptions < 155 caractères
- [ ] Titres < 60 caractères
- [ ] Alt text sur toutes les images
- [ ] URLs lisibles et descriptives
- [ ] Liens internes cohérents
- [ ] Contenu original et de qualité

### Performance
- [ ] Images optimisées (WebP)
- [ ] Lazy loading activé
- [ ] Minification CSS/JS
- [ ] Compression Gzip/Brotli
- [ ] CDN configuré
- [ ] Cache headers optimisés

### Mobile
- [x] Responsive design
- [x] Viewport configuré
- [x] Touch-friendly
- [ ] AMP (optionnel)

---

## 🔍 Outils de Test SEO

### Google
- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Rich Results Test](https://search.google.com/test/rich-results)

### Autres
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/)
- [Ahrefs Site Audit](https://ahrefs.com/)
- [SEMrush](https://www.semrush.com/)

---

## 📈 Monitoring SEO

### Métriques à suivre
1. **Indexation** : Nombre de pages indexées
2. **Positions** : Classement des mots-clés
3. **CTR** : Taux de clic dans les SERPs
4. **Impressions** : Visibilité dans les résultats
5. **Core Web Vitals** : LCP, FID, CLS
6. **Backlinks** : Liens entrants

### Outils recommandés
- Google Search Console (gratuit)
- Google Analytics 4 (gratuit)
- Bing Webmaster Tools (gratuit)
- Ahrefs ou SEMrush (payant)

---

## 🚀 Prochaines Étapes

### Court terme
- [ ] Créer les images OG pour chaque catégorie
- [ ] Optimiser les images existantes (WebP)
- [ ] Ajouter des alt texts descriptifs
- [ ] Configurer Google Search Console
- [ ] Soumettre le sitemap

### Moyen terme
- [ ] Créer un blog SEO-optimisé
- [ ] Implémenter le fil d'Ariane (breadcrumbs)
- [ ] Ajouter des FAQ avec Schema.org
- [ ] Optimiser la vitesse de chargement
- [ ] Créer des landing pages par pays

### Long terme
- [ ] Stratégie de link building
- [ ] Contenu evergreen
- [ ] Optimisation multilingue
- [ ] AMP pour les articles
- [ ] Programme d'affiliation

---

## 📞 Support

Pour toute question SEO, contactez l'équipe technique d'Amani Finance.

**Dernière mise à jour** : 16 décembre 2025
