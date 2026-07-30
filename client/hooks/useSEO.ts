import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonical?: string;
  noindex?: boolean;
}

const DEFAULT_SEO = {
  title: 'Amani Finance - Actualités Économiques, BRVM, Forex & Analyses Financières en Afrique',
  description: "Plateforme d'information et d'analyse financière de référence en Afrique et au Sahel. Suivez les cours de la BRVM, le taux du Franc CFA (FCFA), l'or, le pétrole, les titres publics UEMOA et les opportunités d'investissement.",
  keywords: [
    'Amani Finance', 'Amani', 'amani-finance.com',
    'BRVM', 'BRVM Composite', 'BRVM 30', 'actions BRVM', 'cours BRVM', 'dividendes BRVM', 'titres publics', 'bons du trésor UEMOA', 'obligations TPCI',
    'BCEAO', 'UEMOA', 'CEMAC', 'BAD', 'BOAD', 'FMI', 'Banque Mondiale',
    'actualités économiques Afrique', 'finance Sahel', 'économie Mali', 'économie Sénégal', 'économie Côte d\'Ivoire', 'économie Burkina Faso', 'économie Niger',
    'Franc CFA', 'FCFA', 'EUR XOF', 'USD XOF', 'taux de change FCFA', 'convertisseur devises FCFA', 'forex Afrique', 'parité Euro CFA',
    'cours de l\'or', 'or Sahel', 'cours du coton', 'cours du cacao', 'matières premières Afrique', 'pétrole Brent',
    'investissement Afrique', 'diaspora investissement', 'capital risque Afrique', 'private equity UEMOA', 'fintech Afrique', 'mobile money', 'microfinance', 'analyses financières'
  ].join(', '),
  image: 'https://www.amani-finance.com/financeafrique.avif',
  type: 'website' as const,
};

export function useSEO(config: Partial<SEOConfig> = {}) {
  const location = useLocation();
  
  useEffect(() => {
    const seoConfig = { ...DEFAULT_SEO, ...config };
    const baseUrl = 'https://www.amani-finance.com';
    const currentUrl = `${baseUrl}${location.pathname}`;
    
    // Update title
    document.title = seoConfig.title;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };
    
    // Primary meta tags
    updateMetaTag('title', seoConfig.title);
    updateMetaTag('description', seoConfig.description);
    if (seoConfig.keywords) {
      updateMetaTag('keywords', seoConfig.keywords);
    }
    if (seoConfig.author) {
      updateMetaTag('author', seoConfig.author);
    }
    
    // Robots
    if (seoConfig.noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }
    
    // Open Graph
    updateMetaTag('og:type', seoConfig.type, true);
    updateMetaTag('og:url', seoConfig.canonical || currentUrl, true);
    updateMetaTag('og:title', seoConfig.title, true);
    updateMetaTag('og:description', seoConfig.description, true);
    updateMetaTag('og:image', seoConfig.image || DEFAULT_SEO.image, true);
    updateMetaTag('og:site_name', 'Amani Finance', true);
    updateMetaTag('og:locale', 'fr_FR', true);
    
    // Article specific
    if (seoConfig.type === 'article') {
      if (seoConfig.publishedTime) {
        updateMetaTag('article:published_time', seoConfig.publishedTime, true);
      }
      if (seoConfig.modifiedTime) {
        updateMetaTag('article:modified_time', seoConfig.modifiedTime, true);
      }
      if (seoConfig.author) {
        updateMetaTag('article:author', seoConfig.author, true);
      }
    }
    
    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:url', seoConfig.canonical || currentUrl, true);
    updateMetaTag('twitter:title', seoConfig.title, true);
    updateMetaTag('twitter:description', seoConfig.description, true);
    updateMetaTag('twitter:image', seoConfig.image || DEFAULT_SEO.image, true);
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seoConfig.canonical || currentUrl);
    
  }, [config, location]);
}

// Helper function to generate structured data
export function generateArticleStructuredData(article: {
  title: string;
  description: string;
  image: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Amani Finance',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.amani-finance.com/Fav%20Icon.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

// Helper to inject structured data
export function injectStructuredData(data: object) {
  // Remove existing structured data script if any
  const existingScript = document.querySelector('script[data-structured-data]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Create new script
  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.setAttribute('data-structured-data', 'true');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}
