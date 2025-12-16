import { useEffect } from 'react';
import { useSEO, generateArticleStructuredData, injectStructuredData } from '@/hooks/useSEO';

interface SEOHeadProps {
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
  structuredData?: object;
}

export function SEOHead(props: SEOHeadProps) {
  useSEO({
    title: props.title,
    description: props.description,
    keywords: props.keywords,
    image: props.image,
    type: props.type,
    author: props.author,
    publishedTime: props.publishedTime,
    modifiedTime: props.modifiedTime,
    canonical: props.canonical,
    noindex: props.noindex,
  });

  useEffect(() => {
    if (props.structuredData) {
      injectStructuredData(props.structuredData);
    }
  }, [props.structuredData]);

  return null;
}

// Composant spécifique pour les articles
interface ArticleSEOProps {
  title: string;
  description: string;
  image: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  keywords?: string;
  category?: string;
}

export function ArticleSEO(props: ArticleSEOProps) {
  const currentUrl = `https://amani-finance.vercel.app${window.location.pathname}`;
  
  const structuredData = generateArticleStructuredData({
    title: props.title,
    description: props.description,
    image: props.image,
    author: props.author,
    publishedTime: props.publishedTime,
    modifiedTime: props.modifiedTime,
    url: currentUrl,
  });

  return (
    <SEOHead
      title={`${props.title} | Amani Finance`}
      description={props.description}
      keywords={props.keywords}
      image={props.image}
      type="article"
      author={props.author}
      publishedTime={props.publishedTime}
      modifiedTime={props.modifiedTime}
      structuredData={structuredData}
    />
  );
}

// Composant pour les pages de catégorie
interface CategorySEOProps {
  category: string;
  description: string;
  keywords?: string;
}

export function CategorySEO(props: CategorySEOProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: props.category,
    description: props.description,
    url: `https://amani-finance.vercel.app${window.location.pathname}`,
    publisher: {
      '@type': 'Organization',
      name: 'Amani Finance',
      logo: {
        '@type': 'ImageObject',
        url: 'https://amani-finance.vercel.app/logo.png',
      },
    },
  };

  return (
    <SEOHead
      title={`${props.category} | Amani Finance`}
      description={props.description}
      keywords={props.keywords}
      type="website"
      structuredData={structuredData}
    />
  );
}

export default SEOHead;
