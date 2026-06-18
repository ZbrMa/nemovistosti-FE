import type { Metadata } from "next";

import { MarketOverviewPage } from "@/features/market-overview/market-overview-page";
import { OFFER_TYPE } from "@/lib/market-taxonomy";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Prodej nemovitostí aktuálně",
  description:
    "Aktuální analytický přehled trhu prodeje nemovitostí v Česku. Ceny, aktivita trhu, regionální srovnání a vývoj nabídek.",
  path: "/prodej",
});

export const revalidate = 86400;

type SellPageProps = {
  searchParams: Promise<{
    kraj?: string;
    okres?: string;
  }>;
};

export default async function SellPage({ searchParams }: SellPageProps) {
  return (
    <MarketOverviewPage
      offerType={OFFER_TYPE.sell}
      searchParams={await searchParams}
    />
  );
}
