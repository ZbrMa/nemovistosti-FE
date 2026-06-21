import type { Metadata } from "next";

import { MarketOverviewPage } from "@/features/market-overview/market-overview-page";
import { OFFER_TYPE, PROPERTY_TYPE } from "@/lib/market-taxonomy";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Byty k pronájmu aktuálně",
  description:
    "Aktuální analytický přehled trhu bytů k pronájmu v Česku. Ceny, aktivita trhu, regionální srovnání a vývoj nabídek.",
  path: "/pronajem/byty",
});

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
