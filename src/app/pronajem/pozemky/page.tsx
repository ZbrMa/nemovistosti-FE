import type { Metadata } from "next";

import { MarketOverviewPage } from "@/features/market-overview/market-overview-page";
import { OFFER_TYPE, PROPERTY_TYPE } from "@/lib/market-taxonomy";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Pozemky k pronájmu aktuálně",
  description:
    "Aktuální analytický přehled trhu pozemků k pronájmu v Česku. Ceny, aktivita trhu, regionální srovnání a vývoj nabídek.",
  path: "/pronajem/pozemky",
});

export const revalidate = 86400;

type RentLandPageProps = {
  searchParams: Promise<{
    kraj?: string;
    okres?: string;
  }>;
};

export default async function RentLandPage({
  searchParams,
}: RentLandPageProps) {
  return (
    <MarketOverviewPage
      offerType={OFFER_TYPE.rent}
      propertyType={PROPERTY_TYPE.land}
      searchParams={await searchParams}
    />
  );
}
