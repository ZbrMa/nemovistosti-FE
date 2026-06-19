"use server";

import {
  getMarketOverview,
  getMarketYields,
  getMarketYieldsByArea,
} from "@/lib/api/market";
import { safeQuery } from "@/lib/api/safe-query";
import type { MarketYieldsByAreaInput, MarketYieldsInput } from "@/types/market";

import { getPreferredValue, type RentalYieldMarketValues } from "./rental-yield-utils";

type GetRentalMarketValuesInput = {
  region: string;
  district: string;
  disposition: string;
  propertyType: string;
  sellOfferType: string;
  rentOfferType: string;
};

export async function getRentalMarketValues({
  region,
  district,
  disposition,
  propertyType,
  sellOfferType,
  rentOfferType,
}: GetRentalMarketValuesInput): Promise<RentalYieldMarketValues> {
  const [sellOverview, rentOverview] = await Promise.all([
    safeQuery(
      "rental_yield.market_overview.sell",
      () =>
        getMarketOverview({
          p_region: region,
          p_district: district,
          p_disposition: disposition,
          p_offer_type: sellOfferType,
          p_property_type: propertyType,
        }),
      null,
    ),
    safeQuery(
      "rental_yield.market_overview.rent",
      () =>
        getMarketOverview({
          p_region: region,
          p_district: district,
          p_disposition: disposition,
          p_offer_type: rentOfferType,
          p_property_type: propertyType,
        }),
      null,
    ),
  ]);

  return {
    purchasePrice: getPreferredValue(sellOverview),
    monthlyRent: getPreferredValue(rentOverview),
  };
}

export async function getRentalYieldRows(input: MarketYieldsInput) {
  return safeQuery(
    "rental_yield.market_yields",
    () => getMarketYields(input),
    [],
  );
}

export async function getRentalYieldAreaRows(input: MarketYieldsByAreaInput) {
  return safeQuery(
    "rental_yield.market_yields_by_area",
    () => getMarketYieldsByArea(input),
    [],
  );
}
