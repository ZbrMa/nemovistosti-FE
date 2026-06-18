import type { Metadata } from "next";

import { MarketOverviewPage } from "@/features/market-overview/market-overview-page";
import { OFFER_TYPE, PROPERTY_TYPE } from "@/lib/market-taxonomy";

export const metadata: Metadata = {
  title: "Byty k pronájmu aktuálně | Ceny nemovitostí",
  description:
    "Aktuální analytický přehled trhu bytů k pronájmu v Česku. Ceny, aktivita trhu, regionální srovnání a vývoj nabídek.",
};

export const revalidate = 86400;

type RentFlatsPageProps = {
  searchParams: Promise<{
    kraj?: string;
    okres?: string;
  }>;
};

export default async function RentFlatsPage({
  searchParams,
}: RentFlatsPageProps) {
  return (
    <MarketOverviewPage
      offerType={OFFER_TYPE.rent}
      propertyType={PROPERTY_TYPE.flat}
      searchParams={await searchParams}
    />
  );
}
