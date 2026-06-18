import type { Metadata } from "next";

import { toAbsoluteUrl } from "@/lib/site-url";

export const SITE_NAME = "Ceny nemovitostí";

export function buildPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: toAbsoluteUrl(path),
      siteName: SITE_NAME,
      locale: "cs_CZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: toAbsoluteUrl("/"),
    inLanguage: "cs-CZ",
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: toAbsoluteUrl("/"),
  };
}

export function buildCollectionPageSchema({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: toAbsoluteUrl(path),
    inLanguage: "cs-CZ",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: toAbsoluteUrl("/"),
    },
  };
}

export function buildAboutPageSchema({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: title,
    description,
    url: toAbsoluteUrl(path),
    inLanguage: "cs-CZ",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: toAbsoluteUrl("/"),
    },
  };
}
