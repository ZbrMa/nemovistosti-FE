import type { Metadata } from "next";

import {
  getMarketFacets,
  getMarketRegions,
  getMarketYields,
  getMarketYieldsByArea,
} from "@/lib/api/market";
import { safeQuery } from "@/lib/api/safe-query";
import { buildPageMetadata } from "@/lib/seo";

import { getRentalMarketValues } from "./actions";
import { KalkulackyPageHeader } from "./components/kalkulacky-page-header";
import { RentalYieldCalculator } from "./components/rental-yield-calculator";
import { RentalYieldAreaChart } from "./components/rental-yield-area-chart";
import { RentalYieldTable } from "./components/rental-yield-table";
import {
  getRegionGroups,
  getRentalYieldFacetOptions,
} from "./rental-yield-utils";

export const metadata: Metadata = buildPageMetadata({
  title: "Kalkulačka návratnosti pronájmu",
  description:
    "Spočítejte orientační návratnost investice do bytu podle kupní ceny, nájmu a provozních nákladů.",
  path: "/kalkulacky",
});

export const revalidate = 86400;

export default async function KalkulackyPage() {
  const facets = await safeQuery(
    "rental_yield.market_facets",
    () => getMarketFacets(),
    null,
  );
  const options = getRentalYieldFacetOptions(facets);
  const marketRegions = await safeQuery(
    "rental_yield.market_regions",
    () => getMarketRegions(),
    [],
  );
  const regionGroups = getRegionGroups(marketRegions, facets);
  const initialGroup = regionGroups.find((group) => group.districts.length > 0);
  const initialRegion = initialGroup?.region ?? "";
  const initialDistrict = initialGroup?.districts[0] ?? "";
  const initialDisposition = options.dispositions[0] ?? "";

  const initialValues =
    initialDisposition && initialRegion && initialDistrict
      ? await getRentalMarketValues({
          region: initialRegion,
          district: initialDistrict,
          disposition: initialDisposition,
          propertyType: options.propertyType,
          sellOfferType: options.sellOfferType,
          rentOfferType: options.rentOfferType,
        })
      : { purchasePrice: null, monthlyRent: null };

  const tableRows = await safeQuery(
    "rental_yield.market_yields",
    () => getMarketYields(),
    [],
  );
  const areaRows = await safeQuery(
    "rental_yield.market_yields_by_area",
    () => getMarketYieldsByArea(),
    [],
  );

  return (
    <div className="mx-auto w-full max-w-[1300px] space-y-16 border-x border-dashed border-border pt-8 lg:pt-12 pb-8 lg:pb-12">
      <KalkulackyPageHeader />

      <RentalYieldCalculator
        options={options}
        regionGroups={regionGroups}
        initialRegion={initialRegion}
        initialDistrict={initialDistrict}
        initialValues={initialValues}
      />

      <RentalYieldTable rows={tableRows} />

      <RentalYieldAreaChart rows={areaRows} />

      {/*<RentalYieldMethodology />*/}
    </div>
  );
}
