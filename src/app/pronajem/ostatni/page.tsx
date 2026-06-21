import type { Metadata } from "next";

import { MarketOverviewPage } from "@/features/market-overview/market-overview-page";
import { OFFER_TYPE, PROPERTY_TYPE } from "@/lib/market-taxonomy";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Ostatní nemovitosti k pronájmu aktuálně",
  description:
    "Aktuální analytický přehled trhu ostatních nemovitostí k pronájmu v Česku. Ceny, aktivita trhu, regionální srovnání a vývoj nabídek.",
  path: "/pronajem/ostatni",
});

export const revalidate = 86400;

type RentOtherPageProps = {
  searchParams: Promise<{
    kraj?: string;
    okres?: string;
  }>;
};

export default async function RentOtherPage({
  searchParams,
}: RentOtherPageProps) {
  return (
    <MarketOverviewPage
      offerType={OFFER_TYPE.rent}
      propertyType={PROPERTY_TYPE.other}
      searchParams={await searchParams}
    />
  );
}
