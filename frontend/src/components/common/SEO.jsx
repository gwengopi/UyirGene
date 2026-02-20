import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Uyirgene International';
const DEFAULT_DESCRIPTION = 'Professional Training Institute | ISO 9001 Certified | Training Partner of Skill India Digital Hub. Courses in Food Safety, Quality Management, Microbiology & more.';
const DEFAULT_IMAGE = 'https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/UI_color-removebg-preview%202.png';
const BASE_URL = 'https://uyirgene.com';

/**
 * Reusable SEO component for managing page meta tags and structured data.
 *
 * @param {string} title - Page title (appended with site name)
 * @param {string} description - Meta description (max ~160 chars for search results)
 * @param {string} [path] - Page path for canonical URL (e.g., '/about')
 * @param {string} [image] - OG image URL
 * @param {string} [type='website'] - OG type (website, article, etc.)
 * @param {object} [article] - Article metadata for blog posts
 * @param {object} [structuredData] - JSON-LD structured data object
 * @param {boolean} [noindex=false] - Set true to prevent indexing
 */
function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_IMAGE,
  type = 'website',
  article,
  structuredData,
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = path ? `${BASE_URL}${path}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article-specific */}
      {article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {article?.author && <meta property="article:author" content={article.author} />}
      {article?.tags?.map((tag) => (
        <meta property="article:tag" content={tag} key={tag} />
      ))}

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// --- Structured Data Helpers ---

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: DEFAULT_IMAGE,
    description: DEFAULT_DESCRIPTION,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
    },
    sameAs: [],
  };
}

export function courseSchema(course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.shortDescription || course.description,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
    },
    ...(course.trainerName && {
      instructor: {
        '@type': 'Person',
        name: course.trainerName,
      },
    }),
    ...(course.category && { courseCategory: course.category }),
    ...(course.durationHours && {
      timeRequired: `PT${course.durationHours}H`,
    }),
    ...(course.price != null && {
      offers: {
        '@type': 'Offer',
        price: course.price,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    }),
  };
}

export function articleSchema(blog, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.shortDescription,
    author: {
      '@type': 'Person',
      name: blog.authorName || 'Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: DEFAULT_IMAGE },
    },
    url: `${BASE_URL}${url}`,
    ...(blog.publishDate && { datePublished: blog.publishDate }),
    ...(blog.updatedAt && { dateModified: blog.updatedAt }),
    ...(blog.featuredImage && { image: blog.imageUrl }),
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    })),
  };
}

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export default SEO;
