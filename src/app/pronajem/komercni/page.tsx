import type { Metadata } from "next";

import { MarketOverviewPage } from "@/features/market-overview/market-overview-page";
import { OFFER_TYPE, PROPERTY_TYPE } from "@/lib/market-taxonomy";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Komerční nemovitosti k pronájmu aktuálně",
  description:
    "Aktuální analytický přehled trhu komerčních nemovitostí k pronájmu v Česku. Ceny, aktivita trhu, regionální srovnání a vývoj nabídek.",
  path: "/pronajem/komercni",
});

export const revalidate = 86400;

type RentCommercialPageProps = {
  searchParams: Promise<{
    kraj?: string;
    okres?: string;
  }>;
};

export default async function RentCommercialPage({
  searchParams,
}: RentCommercialPageProps) {
  return (
    <MarketOverviewPage
      offerType={OFFER_TYPE.rent}
      propertyType={PROPERTY_TYPE.commercial}
      searchParams={await searchParams}
    />
  );
}
