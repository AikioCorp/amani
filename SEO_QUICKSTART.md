# 🚀 Guide Rapide SEO - Amani Finance

## Utilisation Simple

### 1. Dans une page standard

```tsx
import { useSEO } from '@/hooks/useSEO';

function MaPage() {
  useSEO({
    title: 'Mon Titre | Amani Finance',
    description: 'Ma description optimisée pour le SEO',
    keywords: 'mots, clés, pertinents',
  });
  
  return <div>Contenu de ma page</div>;
}
```

### 2. Dans une page article

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
      />
      <article>{/* Contenu */}</article>
    </>
  );
}
```

### 3. Dans une page catégorie

```tsx
import { CategorySEO } from '@/components/SEOHead';

function EconomiePage() {
  return (
    <>
      <CategorySEO
        category="Économie"
        description="Analyses et actualités économiques africaines"
        keywords="économie, Afrique, analyses, BRVM"
      />
      <div>{/* Contenu */}</div>
    </>
  );
}
```

## Génération du Sitemap

```bash
# Générer manuellement
npm run generate:sitemap

# Automatique avant chaque build
npm run build
```

## Checklist Rapide

- [ ] Ajouter `useSEO()` ou `<SEOHead />` à chaque page
- [ ] Titre unique < 60 caractères
- [ ] Description < 155 caractères
- [ ] Image OG 1200x630px
- [ ] Alt text sur les images
- [ ] Générer le sitemap avant déploiement

## Fichiers Importants

- `index.html` - Métadonnées de base
- `public/robots.txt` - Configuration crawlers
- `public/sitemap.xml` - Liste des URLs
- `client/hooks/useSEO.ts` - Hook SEO
- `client/components/SEOHead.tsx` - Composants SEO

## Support

Voir `SEO_DOCUMENTATION.md` pour la documentation complète.
