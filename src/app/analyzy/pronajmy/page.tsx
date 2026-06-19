import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Analýza pronájmů ",
  description:
    "Přehled nájemního trhu podle měst, okresů, typů nemovitostí a dispozic bude doplněn později.",
};

export default function AnalyzaPronajmuPage() {
  return (
    <PlaceholderPage
      title="Analýza pronájmů"
      description="Přehled nájemního trhu podle měst, okresů, typů nemovitostí a dispozic bude doplněn později."
    />
  );
}
