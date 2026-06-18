import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Analýzy",
  description:
    "Přehled segmentových analýz realitního trhu bude doplněn později.",
  path: "/analyzy",
});

export default function AnalyzyPage() {
  return (
    <PlaceholderPage
      title="Analýzy"
      description="Přehled segmentových analýz realitního trhu bude doplněn později."
    />
  );
}
