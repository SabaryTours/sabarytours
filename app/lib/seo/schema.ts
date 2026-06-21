import { resolveSocialLinks } from "../socialLinks";
import { absoluteUrl, getSiteUrl, SITE_NAME } from "./site";

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildOrganizationSchema() {
  const siteUrl = getSiteUrl();
  const sameAs = resolveSocialLinks()
    .map((link) => link.href)
    .filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${siteUrl}/#organization`,
    name: SITE_NAME,
    alternateName: "Sabary Travel and Tour",
    url: siteUrl,
    logo: absoluteUrl("/assets/logo.svg"),
    image: absoluteUrl("/assets/logo.svg"),
    description:
      "Sabary Tours offers expertly crafted tours and experiences across Ghana — from quad biking and batik workshops to Cape Coast adventures and custom itineraries.",
    email: "info@sabarytours.com",
    telephone: "+233576093838",
    address: {
      "@type": "PostalAddress",
      addressCountry: "GH",
      addressLocality: "Accra",
      addressRegion: "Greater Accra",
    },
    areaServed: {
      "@type": "Country",
      name: "Ghana",
    },
    sameAs,
  };
}

export function buildWebSiteSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: SITE_NAME,
    url: siteUrl,
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildBlogArticleSchema(input: {
  title: string;
  slug: string;
  description: string;
  image: string;
  publishedAt: string;
  modifiedAt?: string;
  keywords?: string[];
}) {
  const siteUrl = getSiteUrl();
  const url = absoluteUrl(`/blog/${input.slug}`);
  const image = input.image.startsWith("http") ? input.image : absoluteUrl(input.image);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: stripHtml(input.description).slice(0, 300),
    image: [image],
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: input.publishedAt,
    dateModified: input.modifiedAt || input.publishedAt,
    ...(input.keywords?.length ? { keywords: input.keywords.join(", ") } : {}),
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/assets/logo.svg"),
      },
    },
  };
}

export function buildTourActivitySchema(input: {
  title: string;
  description: string;
  categorySlug: string;
  slug: string;
  image: string;
  gallery?: string[];
  location?: string;
  duration?: string;
  priceValue?: number;
  priceCurrency?: string;
  rating?: number;
  reviewCount?: number;
}) {
  const url = absoluteUrl(`/packages/${input.categorySlug}/${input.slug}`);
  const images = [
    input.image,
    ...(input.gallery || []).filter((img) => img && img !== input.image),
  ]
    .filter(Boolean)
    .map((img) => (img.startsWith("http") ? img : absoluteUrl(img)))
    .slice(0, 5);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: input.title,
    description: stripHtml(input.description).slice(0, 500),
    url,
    image: images.length > 0 ? images : undefined,
    touristType: "Leisure travelers",
    provider: { "@id": `${getSiteUrl()}/#organization` },
  };

  if (input.location) {
    schema.itinerary = {
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "Place",
            name: input.location,
            address: {
              "@type": "PostalAddress",
              addressCountry: "GH",
              addressLocality: input.location,
            },
          },
        },
      ],
    };
  }

  if (input.duration) {
    schema.duration = input.duration;
  }

  if (input.priceValue && input.priceValue > 0) {
    schema.offers = {
      "@type": "Offer",
      url,
      price: input.priceValue,
      priceCurrency: input.priceCurrency || "GHS",
      availability: "https://schema.org/InStock",
      seller: { "@id": `${getSiteUrl()}/#organization` },
    };
  }

  if (input.rating && input.reviewCount && input.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.rating,
      reviewCount: input.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}
