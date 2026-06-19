import {
  normalizeOfferType,
  normalizePropertyType,
  type OfferType,
  type PropertyType,
} from "@/lib/market-taxonomy";
import type {
  MarketFacets,
  MarketOverview,
  MarketRegion,
  MarketYieldRow,
} from "@/types/market";

export type RentalYieldMarketValues = {
  purchasePrice: number | null;
  monthlyRent: number | null;
};

export type RentalYieldTableRow = MarketYieldRow;

export type RentalYieldFacetOptions = {
  regions: string[];
  dispositions: string[];
  propertyType: PropertyType;
  sellOfferType: OfferType;
  rentOfferType: OfferType;
};

export type RentalYieldRegionGroup = {
  region: string;
  districts: string[];
};

const FALLBACK_DISPOSITIONS = ["1+kk", "1+1", "2+kk", "2+1", "3+kk", "3+1"];

export function getPreferredValue(overview: MarketOverview | null) {
  if (!overview) {
    return null;
  }

  return overview.median_price ?? overview.avg_price;
}

export function getRegionGroups(
  marketRegions: MarketRegion[],
  facets: MarketFacets | null,
): RentalYieldRegionGroup[] {
  const collator = new Intl.Collator("cs-CZ");
  const groups = new Map<string, RentalYieldRegionGroup>();

  for (const row of marketRegions) {
    if (row.region && row.districts?.length) {
      groups.set(row.region, {
        region: row.region,
        districts: [...new Set(row.districts.filter(Boolean))].sort(collator.compare),
      });
      continue;
    }
  }

  if (groups.size === 0) {
    for (const region of facets?.regions ?? []) {
      groups.set(region, {
        region,
        districts: [],
      });
    }
  }

  return [...groups.values()].sort((a, b) => collator.compare(a.region, b.region));
}

export function getRentalYieldFacetOptions(
  facets: MarketFacets | null,
): RentalYieldFacetOptions {
  const propertyTypes =
    facets?.property_types.map(normalizePropertyType).filter((type) => type !== null) ??
    [];
  const offerTypes =
    facets?.offer_types.map(normalizeOfferType).filter((type) => type !== null) ??
    [];
  const propertyType =
    propertyTypes.find((type) => type === "flat") ?? propertyTypes[0] ?? "flat";
  const sellOfferType =
    offerTypes.find((type) => type === "sell") ?? "sell";
  const rentOfferType =
    offerTypes.find((type) => type === "rent") ?? "rent";

  return {
    regions: facets?.regions?.length ? facets.regions : [],
    dispositions: facets?.dispositions.length
      ? facets.dispositions
      : FALLBACK_DISPOSITIONS,
    propertyType,
    sellOfferType,
    rentOfferType,
  };
}

function toPositiveFiniteNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

export function calculateRentalYield(
  purchasePriceInput: number | null,
  monthlyRentInput: number | null,
  annualCostsInput: number | null,
) {
  const purchasePrice = toPositiveFiniteNumber(purchasePriceInput);
  const monthlyRent = toPositiveFiniteNumber(monthlyRentInput);
  const annualCosts =
    typeof annualCostsInput === "number" && Number.isFinite(annualCostsInput)
      ? Math.max(annualCostsInput, 0)
      : 0;

  if (!purchasePrice || !monthlyRent) {
    return {
      annualRent: null,
      grossYieldPercent: null,
      netAnnualRent: null,
      netYieldPercent: null,
      paybackYears: null,
    };
  }

  const annualRent = monthlyRent * 12;
  const grossYieldPercent = (annualRent / purchasePrice) * 100;
  const netAnnualRent = annualRent - annualCosts;

  if (netAnnualRent <= 0) {
    return {
      annualRent,
      grossYieldPercent,
      netAnnualRent,
      netYieldPercent: null,
      paybackYears: null,
    };
  }

  return {
    annualRent,
    grossYieldPercent,
    netAnnualRent,
    netYieldPercent: (netAnnualRent / purchasePrice) * 100,
    paybackYears: purchasePrice / netAnnualRent,
  };
}
