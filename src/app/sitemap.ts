import type { MetadataRoute } from "next";

import { getSeoLandingPages } from "@/lib/api/market";
import { toAbsoluteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "/",
    "/nabidky",
    "/prodej",
    "/prodej/byty",
    "/prodej/domy",
    "/prodej/pozemky",
    "/prodej/komercni",
    "/prodej/ostatni",
    "/pronajem",
    "/pronajem/byty",
    "/pronajem/domy",
    "/pronajem/pozemky",
    "/pronajem/komercni",
    "/pronajem/ostatni",
    "/analyzy",
    "/analyzy/byty",
    "/analyzy/domy",
    "/analyzy/pozemky",
    "/analyzy/pronajmy",
    "/kalkulacky",
    "/o-projektu",
    "/vyvoj-trhu",
  ];

  const seoLandingPages = await getSeoLandingPages();

  return [
    ...staticRoutes.map((route) => ({
      url: toAbsoluteUrl(route),
      changeFrequency: "daily" as const,
      priority: route === "/" ? 1 : 0.7,
    })),
    ...seoLandingPages.map((page) => ({
      url: toAbsoluteUrl(page.slug),
      lastModified: page.updated_at,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
