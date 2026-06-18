export type MarketFilterInput = {
  p_region?: string | null;
  p_city?: string | null;
  p_district?: string | null;
  p_property_type?: string | null;
  p_offer_type?: string | null;
  p_disposition?: string | null;
};

export type MarketOverviewInput = MarketFilterInput;

export type MarketArrayFilterInput = {
  p_regions?: string[] | null;
  p_districts?: string[] | null;
  p_property_types?: string[] | null;
  p_offer_types?: string[] | null;
};

export type MarketDistributionInput = MarketArrayFilterInput;

export type MarketDistributionRow = {
  property_type: string | null;
  offer_type: string | null;
  listings_count: number;
  share_percent: number | null;
};

export type MarketDistributionAreaInput = MarketArrayFilterInput;

export type MarketDistributionAreaRow = {
  area_bucket: string | null;
  listings_count: number;
  share_percent: number | null;
};

export type MarketDistributionDispositionInput = MarketArrayFilterInput;

export type MarketDistributionDispositionRow = {
  disposition: string | null;
  listings_count: number;
  share_percent: number | null;
};

export type MarketOverviewDistribution =
  | {
      kind: "property_type";
      rows: MarketDistributionRow[];
    }
  | {
      kind: "disposition";
      rows: MarketDistributionDispositionRow[];
    }
  | {
      kind: "area";
      rows: MarketDistributionAreaRow[];
    };

export type MarketActivitySummaryInput = MarketArrayFilterInput & {
  p_metric_date?: string | null;
};

export type MarketActivitySummary = {
  active_listings: number;
  new_listings_30d: number;
  inactive_listings_30d: number;
  discounted_listings_30d: number;
  avg_listing_age_days: number | null;
};

export type MarketHeatmapDistrictsInput = {
  p_region?: string | null;
  p_property_type?: string | null;
  p_offer_type?: string | null;
};

export type MarketHeatmapRegionsInput = {
  p_property_type?: string | null;
  p_offer_type?: string | null;
};

export type MarketHeatmapRegionRow = {
  region: string | null;
  listings_count: number;
  new_listings_30d: number;
  inactive_listings_30d: number;
  discounted_listings_30d: number;
  avg_price: number | null;
  median_price: number | null;
  avg_price_per_m2: number | null;
  median_price_per_m2: number | null;
};

export type MarketHeatmapDistrictRow = MarketHeatmapRegionRow & {
  district: string | null;
};

export type MarketOverview = {
  listings_count: number;
  avg_price: number | null;
  median_price: number | null;
  avg_price_per_m2: number | null;
  median_price_per_m2: number | null;
  avg_area_m2: number | null;
  new_listings_30d: number;
  inactive_listings_30d: number;
  discounted_listings_30d: number;
};

export type SeoLandingPage = {
  id: string;
  slug: string;
  region: string;
  district: string;
  offer_type: string;
  property_type: string;
  created_at: string;
  updated_at: string;
};

export type MarketTimeseriesInput = {
  p_region?: string | null;
  p_district?: string | null;
  p_property_type?: string | null;
  p_offer_type?: string | null;
  p_from?: string | null;
  p_to?: string | null;
};

export type MarketTimeseriesPoint = {
  period: string;
  listings_count: number;
  avg_price: number | null;
  median_price: number | null;
  avg_price_per_m2: number | null;
  median_price_per_m2: number | null;
};

export type MarketScreenerInput = {
  p_regions?: string[] | null;
  p_property_types?: string[] | null;
  p_offer_types?: string[] | null;
  p_cities?: string[] | null;
  p_districts?: string[] | null;
  p_dispositions?: string[] | null;
  p_is_active?: boolean | null;
  p_limit?: number;
  p_offset?: number;
};

export type MarketScreenerRow = {
  region: string | null;
  city: string | null;
  district: string | null;
  property_type: string | null;
  offer_type: string | null;
  disposition: string | null;
  listings_count: number;
  avg_price: number | null;
  median_price: number | null;
  avg_price_per_m2: number | null;
  median_price_per_m2: number | null;
  avg_area_m2: number | null;
  new_listings_30d: number;
  inactive_listings_30d: number;
  discounted_listings_30d: number;
};

export type MarketYieldsInput = {
  p_regions?: string[] | null;
  p_districts?: string[] | null;
  p_property_types?: string[] | null;
  p_dispositions?: string[] | null;
  p_purchase_price_min?: number | null;
  p_purchase_price_max?: number | null;
  p_rent_price_min?: number | null;
  p_rent_price_max?: number | null;
  p_payback_years_min?: number | null;
  p_payback_years_max?: number | null;
};

export type MarketYieldsByAreaInput = {
  p_regions?: string[] | null;
  p_districts?: string[] | null;
};

export type MarketYieldRow = {
  region: string | null;
  district: string | null;
  property_type: string | null;
  disposition: string | null;
  avg_purchase_price: number | null;
  avg_monthly_rent: number | null;
  payback_years: string | null;
  payback_years_decimal: number | null;
  payback_months: number | null;
};

export type MarketYieldByAreaRow = {
  region: string | null;
  district: string | null;
  area_bucket: string | null;
  area_bucket_min: number | null;
  area_bucket_max: number | null;
  avg_area_m2: number | null;
  avg_purchase_price: number | null;
  avg_monthly_rent: number | null;
  payback_years: string | null;
  payback_years_decimal: number | null;
  payback_months: number | null;
};

export type MarketFacetsInput = Record<string, never>;

export type MarketFacets = {
  regions?: string[];
  cities: string[];
  districts: string[];
  property_types: string[];
  offer_types: string[];
  dispositions: string[];
};

export type MarketRegion = {
  region: string;
  districts: string[];
  district?: string | null;
  cities?: string[];
};
