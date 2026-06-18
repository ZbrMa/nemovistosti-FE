import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Analýza pozemků | Ceny nemovitostí",
  description:
    "Vývoj cen a nabídky pozemků podle měst, okresů a typu nabídky bude doplněn později.",
};

export default function AnalyzaPozemkuPage() {
  return (
    <PlaceholderPage
      title="Analýza pozemků"
      description="Vývoj cen a nabídky pozemků podle měst, okresů a typu nabídky bude doplněn později."
    />
  );
}
