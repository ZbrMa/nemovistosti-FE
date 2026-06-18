import type { Metadata } from "next";

import { MarketOverviewPage } from "@/features/market-overview/market-overview-page";
import { OFFER_TYPE, PROPERTY_TYPE } from "@/lib/market-taxonomy";

export const metadata: Metadata = {
  title: "Domy na prodej aktuálně | Ceny nemovitostí",
  description:
    "Aktuální analytický přehled trhu domů na prodej v Česku. Ceny, aktivita trhu, regionální srovnání a vývoj nabídek.",
};

export const revalidate = 86400;

type SellHousesPageProps = {
  searchParams: Promise<{
    kraj?: string;
    okres?: string;
  }>;
};

export default async function SellHousesPage({
  searchParams,
}: SellHousesPageProps) {
  return (
    <MarketOverviewPage
      offerType={OFFER_TYPE.sell}
      propertyType={PROPERTY_TYPE.house}
      searchParams={await searchParams}
    />
  );
}
