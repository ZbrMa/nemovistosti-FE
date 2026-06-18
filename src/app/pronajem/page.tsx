import type { Metadata } from "next";

import { MarketOverviewPage } from "@/features/market-overview/market-overview-page";
import { OFFER_TYPE } from "@/lib/market-taxonomy";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Pronájem nemovitostí aktuálně",
  description:
    "Aktuální analytický přehled trhu pronájmu nemovitostí v Česku. Ceny, aktivita trhu, regionální srovnání a vývoj nabídek.",
  path: "/pronajem",
});

export const revalidate = 86400;

type RentPageProps = {
  searchParams: Promise<{
    kraj?: string;
    okres?: string;
  }>;
};

export default async function RentPage({ searchParams }: RentPageProps) {
  return (
    <MarketOverviewPage
      offerType={OFFER_TYPE.rent}
      searchParams={await searchParams}
    />
  );
}
