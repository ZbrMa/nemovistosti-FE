import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Analýza bytů ",
  description:
    "Vývoj cen a nabídky bytů podle měst, okresů, dispozic a typu nabídky bude doplněn později.",
};

export default function AnalyzaBytuPage() {
  return (
    <PlaceholderPage
      title="Analýza bytů"
      description="Vývoj cen a nabídky bytů podle měst, okresů, dispozic a typu nabídky bude doplněn později."
    />
  );
}
