import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Analýza domů ",
  description:
    "Vývoj cen a nabídky rodinných domů podle měst, okresů a typu nabídky bude doplněn později.",
};

export default function AnalyzaDomuPage() {
  return (
    <PlaceholderPage
      title="Analýza domů"
      description="Vývoj cen a nabídky rodinných domů podle měst, okresů a typu nabídky bude doplněn později."
    />
  );
}
