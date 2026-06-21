import type { Metadata } from "next";

import { MarketOverviewPage } from "@/features/market-overview/market-overview-page";
import { OFFER_TYPE, PROPERTY_TYPE } from "@/lib/market-taxonomy";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Komerční nemovitosti na prodej aktuálně",
  description:
    "Aktuální analytický přehled trhu komerčních nemovitostí na prodej v Česku. Ceny, aktivita trhu, regionální srovnání a vývoj nabídek.",
  path: "/prodej/komercni",
});

export const revalidate = 86400;

type SellCommercialPageProps = {
  searchParams: Promise<{
    kraj?: string;
    okres?: string;
  }>;
};

export default async function SellCommercialPage({
  searchParams,
}: SellCommercialPageProps) {
  return (
    <MarketOverviewPage
      offerType={OFFER_TYPE.sell}
      propertyType={PROPERTY_TYPE.commercial}
      searchParams={await searchParams}
    />
  );
}
