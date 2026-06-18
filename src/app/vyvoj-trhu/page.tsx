import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Vývoj trhu",
  description:
    "Časový vývoj cen, nájmů a aktivity realitního trhu bude doplněn později.",
  path: "/vyvoj-trhu",
});

export default function VyvojTrhuPage() {
  return (
    <PlaceholderPage
      title="Vývoj trhu"
      description="Časový vývoj cen, nájmů a aktivity realitního trhu bude doplněn později."
    />
  );
}
