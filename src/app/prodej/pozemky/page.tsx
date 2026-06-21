import type { Metadata } from "next";

import { MarketOverviewPage } from "@/features/market-overview/market-overview-page";
import { OFFER_TYPE, PROPERTY_TYPE } from "@/lib/market-taxonomy";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Pozemky na prodej aktuálně",
  description:
    "Aktuální analytický přehled trhu pozemků na prodej v Česku. Ceny, aktivita trhu, regionální srovnání a vývoj nabídek.",
  path: "/prodej/pozemky",
});

export const revalidate = 86400;

type SellLandPageProps = {
  searchParams: Promise<{
    kraj?: string;
    okres?: string;
  }>;
};

export default async function SellLandPage({
  searchParams,
}: SellLandPageProps) {
  return (
    <MarketOverviewPage
      offerType={OFFER_TYPE.sell}
      propertyType={PROPERTY_TYPE.land}
      searchParams={await searchParams}
    />
  );
}
