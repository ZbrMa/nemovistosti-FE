import { unstable_cache } from "next/cache";
import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  toDatabaseOfferType,
  toDatabaseOfferTypes,
  toDatabasePropertyType,
  toDatabasePropertyTypes,
} from "@/lib/market-taxonomy";
import type {
  MarketActivitySummary,
  MarketActivitySummaryInput,
  MarketDistributionInput,
  MarketDistributionAreaInput,
  MarketDistributionAreaRow,
  MarketDistributionDispositionInput,
  MarketDistributionDispositionRow,
  MarketDistributionRow,
  MarketFacets,
  MarketHeatmapDistrictRow,
  MarketHeatmapDistrictsInput,
  MarketHeatmapRegionsInput,
  MarketHeatmapRegionRow,
  MarketOverview,
  MarketOverviewInput,
  MarketRegion,
  SeoLandingPage,
  MarketScreenerInput,
  MarketScreenerRow,
  MarketTimeseriesInput,
  MarketTimeseriesPoint,
  MarketYieldByAreaRow,
  MarketYieldRow,
  MarketYieldsByAreaInput,
  MarketYieldsInput,
} from "@/types/market";

import {
  emptyArrayToNull,
  emptyStringToNull,
  formatSupabaseError,
  normalizeLimit,
  normalizeOffset,
  unwrapSingleRpcRow,
} from "./utils";

const MARKET_DATA_REVALIDATE_SECONDS = 86400;
export const MARKET_DATA_CACHE_TAG = "market-data";

const cachedMarketRpc = unstable_cache(
  async (functionName: string, params: Record<string, unknown>) => {
    const client = getSupabaseServerClient() as unknown as {
      rpc: (
        functionName: string,
        params?: Record<string, unknown>,
      ) => PromiseLike<{ data: unknown; error: PostgrestError | null }>;
    };
    const { data, error } = await client.rpc(functionName, params);

    if (error) {
      throw formatSupabaseError(functionName, error);
    }

    return data;
  },
  ["market-rpc"],
  {
    revalidate: MARKET_DATA_REVALIDATE_SECONDS,
    tags: [MARKET_DATA_CACHE_TAG],
  },
);

function normalizeMarketFilters<T extends MarketOverviewInput>(params: T): T {
  return {
    ...params,
    p_region: emptyStringToNull(params.p_region),
    p_city: emptyStringToNull(params.p_city),
    p_district: emptyStringToNull(params.p_district),
    p_property_type: emptyStringToNull(toDatabasePropertyType(params.p_property_type)),
    p_offer_type: emptyStringToNull(toDatabaseOfferType(params.p_offer_type)),
    p_disposition: emptyStringToNull(params.p_disposition),
  };
}

function normalizeMarketArrayFilters<T extends MarketDistributionInput>(
  params: T,
): T {
  return {
    ...params,
    p_regions: emptyArrayToNull(params.p_regions),
    p_districts: emptyArrayToNull(params.p_districts),
    p_property_types: emptyArrayToNull(
      toDatabasePropertyTypes(params.p_property_types),
    ),
    p_offer_types: emptyArrayToNull(toDatabaseOfferTypes(params.p_offer_types)),
  };
}

function normalizeMarketActivitySummaryFilters(
  params: MarketActivitySummaryInput,
): MarketActivitySummaryInput {
  return {
    p_regions: emptyArrayToNull(params.p_regions),
    p_districts: emptyArrayToNull(params.p_districts),
    p_property_types: emptyArrayToNull(
      toDatabasePropertyTypes(params.p_property_types),
    ),
    p_offer_types: emptyArrayToNull(toDatabaseOfferTypes(params.p_offer_types)),
    p_metric_date: emptyStringToNull(params.p_metric_date),
  };
}

function normalizeMarketHeatmapDistrictFilters(
  params: MarketHeatmapDistrictsInput,
): MarketHeatmapDistrictsInput {
  return {
    p_region: emptyStringToNull(params.p_region),
    p_property_type: emptyStringToNull(
      toDatabasePropertyType(params.p_property_type),
    ),
    p_offer_type: emptyStringToNull(toDatabaseOfferType(params.p_offer_type)),
  };
}

function normalizeMarketHeatmapRegionFilters(
  params: MarketHeatmapRegionsInput,
): MarketHeatmapRegionsInput {
  return {
    p_property_type: emptyStringToNull(
      toDatabasePropertyType(params.p_property_type),
    ),
    p_offer_type: emptyStringToNull(toDatabaseOfferType(params.p_offer_type)),
  };
}

function normalizeMarketTimeseriesFilters(
  params: MarketTimeseriesInput,
): MarketTimeseriesInput {
  return {
    p_region: emptyStringToNull(params.p_region),
    p_district: emptyStringToNull(params.p_district),
    p_property_type: emptyStringToNull(
      toDatabasePropertyType(params.p_property_type),
    ),
    p_offer_type: emptyStringToNull(toDatabaseOfferType(params.p_offer_type)),
    p_from: emptyStringToNull(params.p_from),
    p_to: emptyStringToNull(params.p_to),
  };
}

export async function getMarketOverview(
  params: MarketOverviewInput = {},
): Promise<MarketOverview> {
  const data = await cachedMarketRpc(
    "market_overview",
    normalizeMarketFilters(params) as Record<string, unknown>,
  );

  return unwrapSingleRpcRow(
    "market_overview",
    data as MarketOverview | MarketOverview[] | null,
  );
}

export async function getMarketDistribution(
  params: MarketDistributionInput = {},
): Promise<MarketDistributionRow[]> {
  const data = await cachedMarketRpc(
    "market_distribution",
    normalizeMarketArrayFilters(params) as Record<string, unknown>,
  );

  return (data as MarketDistributionRow[] | null) ?? [];
}

export async function getMarketDistributionArea(
  params: MarketDistributionAreaInput = {},
): Promise<MarketDistributionAreaRow[]> {
  const data = await cachedMarketRpc(
    "market_distribution_area",
    normalizeMarketArrayFilters(params) as Record<string, unknown>,
  );

  return (data as MarketDistributionAreaRow[] | null) ?? [];
}

export async function getMarketDistributionDisposition(
  params: MarketDistributionDispositionInput = {},
): Promise<MarketDistributionDispositionRow[]> {
  const data = await cachedMarketRpc(
    "market_distribution_disposition",
    normalizeMarketArrayFilters(params) as Record<string, unknown>,
  );

  return (data as MarketDistributionDispositionRow[] | null) ?? [];
}

export async function getMarketActivitySummary(
  params: MarketActivitySummaryInput = {},
): Promise<MarketActivitySummary> {
  const data = await cachedMarketRpc(
    "market_activity_summary",
    normalizeMarketActivitySummaryFilters(params) as Record<string, unknown>,
  );

  return normalizeActivitySummary(data);
}

function normalizeActivitySummary(data: unknown): MarketActivitySummary {
  const row = Array.isArray(data) ? data[0] : data;
  const summary = (row ?? {}) as Record<string, unknown>;

  return {
    active_listings: toFiniteNumber(summary.active_listings) ?? 0,
    new_listings_30d: toFiniteNumber(summary.new_listings_30d) ?? 0,
    inactive_listings_30d: toFiniteNumber(summary.inactive_listings_30d) ?? 0,
    discounted_listings_30d:
      toFiniteNumber(summary.discounted_listings_30d) ?? 0,
    avg_listing_age_days: toFiniteNumber(summary.avg_listing_age_days),
  };
}

export async function getMarketHeatmapRegions(
  params: MarketHeatmapRegionsInput = {},
): Promise<MarketHeatmapRegionRow[]> {
  const data = await cachedMarketRpc(
    "market_heatmap_regions",
    normalizeMarketHeatmapRegionFilters(params) as Record<string, unknown>,
  );

  return (data as MarketHeatmapRegionRow[] | null) ?? [];
}

export async function getMarketHeatmapDistricts(
  params: MarketHeatmapDistrictsInput = {},
): Promise<MarketHeatmapDistrictRow[]> {
  const data = await cachedMarketRpc(
    "market_heatmap_districts",
    normalizeMarketHeatmapDistrictFilters(params) as Record<string, unknown>,
  );

  return (data as MarketHeatmapDistrictRow[] | null) ?? [];
}

export async function getMarketTimeseries(
  params: MarketTimeseriesInput = {},
): Promise<MarketTimeseriesPoint[]> {
  const data = await cachedMarketRpc(
    "market_timeseries",
    normalizeMarketTimeseriesFilters(params) as Record<string, unknown>,
  );

  return ((data as unknown[] | null) ?? []).map(normalizeTimeseriesPoint);
}

function normalizeTimeseriesPoint(row: unknown): MarketTimeseriesPoint {
  const point = (row ?? {}) as Record<string, unknown>;
  const listingsCount = toFiniteNumber(point.listings_count);
  const legacySnapshotsCount = toFiniteNumber(point.snapshots_count);

  return {
    period: typeof point.period === "string" ? point.period : String(point.period ?? ""),
    listings_count: listingsCount ?? legacySnapshotsCount ?? 0,
    avg_price: toFiniteNumber(point.avg_price),
    median_price: toFiniteNumber(point.median_price),
    avg_price_per_m2: toFiniteNumber(point.avg_price_per_m2),
    median_price_per_m2: toFiniteNumber(point.median_price_per_m2),
  };
}

function toFiniteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const numberValue = Number(value);

    return Number.isFinite(numberValue) ? numberValue : null;
  }

  return null;
}

export async function getMarketScreener(
  params: MarketScreenerInput = {},
): Promise<MarketScreenerRow[]> {
  const normalizedParams: MarketScreenerInput = {
    ...params,
    p_regions: emptyArrayToNull(params.p_regions),
    p_property_types: emptyArrayToNull(toDatabasePropertyTypes(params.p_property_types)),
    p_offer_types: emptyArrayToNull(toDatabaseOfferTypes(params.p_offer_types)),
    p_cities: emptyArrayToNull(params.p_cities),
    p_districts: emptyArrayToNull(params.p_districts),
    p_dispositions: emptyArrayToNull(params.p_dispositions),
    p_limit: normalizeLimit(params.p_limit),
    p_offset: normalizeOffset(params.p_offset),
  };

  const data = await cachedMarketRpc(
    "market_screener",
    normalizedParams as Record<string, unknown>,
  );

  return data as MarketScreenerRow[];
}

export async function getMarketYields(
  params: MarketYieldsInput = {},
): Promise<MarketYieldRow[]> {
  const normalizedParams: MarketYieldsInput = {
    p_regions: emptyArrayToNull(params.p_regions),
    p_districts: emptyArrayToNull(params.p_districts),
    p_property_types: emptyArrayToNull(toDatabasePropertyTypes(params.p_property_types)),
    p_dispositions: emptyArrayToNull(params.p_dispositions),
    p_purchase_price_min: params.p_purchase_price_min ?? null,
    p_purchase_price_max: params.p_purchase_price_max ?? null,
    p_rent_price_min: params.p_rent_price_min ?? null,
    p_rent_price_max: params.p_rent_price_max ?? null,
    p_payback_years_min: params.p_payback_years_min ?? null,
    p_payback_years_max: params.p_payback_years_max ?? null,
  };

  const data = await cachedMarketRpc(
    "market_yields",
    normalizedParams as Record<string, unknown>,
  );

  return (data as MarketYieldRow[] | null) ?? [];
}

export async function getMarketYieldsByArea(
  params: MarketYieldsByAreaInput = {},
): Promise<MarketYieldByAreaRow[]> {
  const normalizedParams: MarketYieldsByAreaInput = {
    p_regions: emptyArrayToNull(params.p_regions),
    p_districts: emptyArrayToNull(params.p_districts),
  };

  const data = await cachedMarketRpc(
    "market_yields_by_area",
    normalizedParams as Record<string, unknown>,
  );

  return (data as MarketYieldByAreaRow[] | null) ?? [];
}

export async function getMarketFacets(): Promise<MarketFacets> {
  const data = await cachedMarketRpc("market_facets", {});

  return unwrapSingleRpcRow(
    "market_facets",
    data as MarketFacets | MarketFacets[] | null,
  );
}

export async function getMarketRegions(): Promise<MarketRegion[]> {
  const data = await cachedMarketRpc("market_regions", {});

  return data as MarketRegion[];
}

export async function getSeoLandingPageBySlug(
  slug: string,
): Promise<SeoLandingPage | null> {
  const normalizedSlug = emptyStringToNull(slug);

  if (!normalizedSlug) {
    return null;
  }

  const data = await cachedMarketRpc("get_seo_landing_page_by_slug", {
    p_slug: normalizedSlug,
  });

  if (Array.isArray(data)) {
    return (data[0] as SeoLandingPage | undefined) ?? null;
  }

  return (data as SeoLandingPage | null) ?? null;
}

export async function getSeoLandingPages(): Promise<SeoLandingPage[]> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("seo_landing_pages")
    .select("id, slug, region, district, offer_type, property_type, created_at, updated_at")
    .neq("property_type", "other")
    .order("slug", { ascending: true });

  if (error) {
    throw formatSupabaseError("seo_landing_pages.select", error);
  }

  return (data as SeoLandingPage[] | null) ?? [];
}
