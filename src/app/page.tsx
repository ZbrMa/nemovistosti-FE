import type { Metadata } from "next";

import { HomeHero } from "@/app/homepage/components/home-hero";
import { MarketKpiSection } from "@/app/homepage/components/market-kpi-section";
import { PropertyTypeSection } from "@/app/homepage/components/property-type-section";
import { SeoMarketSummary } from "@/app/homepage/components/seo-market-summary";
import {
  buildCollectionPageSchema,
  buildOrganizationSchema,
  buildPageMetadata,
  buildWebsiteSchema,
} from "@/lib/seo";
import {
  getMarketFacets,
  getMarketActivitySummary,
  getMarketOverview,
  getMarketScreener,
} from "@/lib/api/market";
import { OFFER_TYPE } from "@/lib/market-taxonomy";
import { safeQuery } from "@/lib/api/safe-query";
import type {
  MarketActivitySummary,
  MarketFacets,
  MarketOverview,
  MarketScreenerRow,
  MarketTimeseriesPoint,
} from "@/types/market";

const HOME_TITLE = "Analýza realitního trhu v Česku";
const HOME_DESCRIPTION =
  "Sledujte vývoj cen bytů, domů a pozemků v Česku. Denně aktualizovaná realitní data, ceny za m², trendy, reporty a přehledné tržní statistiky.";

export const metadata: Metadata = buildPageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
});

export const revalidate = 86400;

type HomeData = {
  sellOverview: MarketOverview | null;
  rentOverview: MarketOverview | null;
  sellActivitySummary: MarketActivitySummary | null;
  rentActivitySummary: MarketActivitySummary | null;
  timeseries: MarketTimeseriesPoint[];
  screenerRows: MarketScreenerRow[];
  facets: MarketFacets | null;
  hasDataError: boolean;
};

async function getHomeData(): Promise<HomeData> {
  // market_timeseries is intentionally skipped on the homepage until the
  // database exposes a precomputed time series.
  const timeseries: MarketTimeseriesPoint[] = [];

  const [
    sellOverview,
    rentOverview,
    sellActivitySummary,
    rentActivitySummary,
    screenerRows,
    facets,
  ] =
    await Promise.all([
      safeQuery(
        "homepage.market_overview.sell",
        () =>
          getMarketOverview({
            p_offer_type: OFFER_TYPE.sell,
          }),
        null,
      ),
      safeQuery(
        "homepage.market_overview.rent",
        () =>
          getMarketOverview({
            p_offer_type: OFFER_TYPE.rent,
          }),
        null,
      ),
      safeQuery(
        "homepage.activity_summary.sell",
        () =>
          getMarketActivitySummary({
            p_offer_types: [OFFER_TYPE.sell],
          }),
        null,
      ),
      safeQuery(
        "homepage.activity_summary.rent",
        () =>
          getMarketActivitySummary({
            p_offer_types: [OFFER_TYPE.rent],
          }),
        null,
      ),
      safeQuery(
        "homepage.market_screener",
        () =>
          getMarketScreener({
            p_limit: 8,
          }),
        [],
      ),
      safeQuery("homepage.market_facets", () => getMarketFacets(), null),
    ]);

  return {
    sellOverview,
    rentOverview,
    sellActivitySummary,
    rentActivitySummary,
    timeseries,
    screenerRows,
    facets,
    hasDataError:
      sellOverview === null ||
      rentOverview === null ||
      facets === null,
  };
}

export default async function Home() {
  const data = await getHomeData();
  const websiteSchema = buildWebsiteSchema();
  const organizationSchema = buildOrganizationSchema();
  const homepageSchema = buildCollectionPageSchema({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: "/",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            websiteSchema,
            organizationSchema,
            homepageSchema,
          ]),
        }}
      />
      <div className="mx-auto w-full max-w-[1300px] px-5 lg:px-8">
        <HomeHero hasDataError={data.hasDataError} />
        <div className="space-y-12 border-x border-border border-dashed">
          <MarketKpiSection
            rentActivitySummary={data.rentActivitySummary}
            rentOverview={data.rentOverview}
            sellActivitySummary={data.sellActivitySummary}
            sellOverview={data.sellOverview}
          />
          <PropertyTypeSection />
          <SeoMarketSummary facets={data.facets} />
        </div>
      </div>
    </>
  );
}
