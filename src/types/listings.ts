export type ListingPriceHistoryInput = {
  p_listing_id: string;
};

export type ListingPriceHistoryRow = {
  listing_id: string;
  listing_url: string;
  region: string | null;
  city: string;
  district: string | null;
  property_type: string | null;
  offer_type: string | null;
  disposition: string | null;
  area_m2: number | null;
  scraped_at: string;
  price: number;
  price_per_m2: number | null;
  area_m2_snapshot: number | null;
  description: string | null;
};

export type ListingSearchInput = {
  p_filters?: ListingSearchFilter[];
  p_sorts?: ListingSearchSort[];
  p_limit?: number;
  p_offset?: number;
};

export type ListingSearchCountInput = {
  p_filters?: ListingSearchFilter[];
};

export type ListingExportInput = {
  p_filters?: ListingSearchFilter[];
  p_limit?: number;
  p_offset?: number;
};

export type ListingSearchFilter = {
  column: ListingSearchColumn;
  op:
    | "eq"
    | "neq"
    | "contains"
    | "starts_with"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "between"
    | "in"
    | "not_in"
    | "is_null"
    | "is_not_null";
  value?: string | number | boolean | string[] | number[] | boolean[] | null;
  value_to?: string | number | null;
};

export type ListingSearchSort = {
  column: ListingSearchColumn;
  dir: "asc" | "desc";
  nulls?: "first" | "last";
};

export type PriceChangeDirection =
  | "decreased"
  | "increased"
  | "unchanged"
  | "unknown";

export type ListingSearchColumn =
  | "listing_id"
  | "listing_url"
  | "source_listing_id"
  | "region"
  | "district"
  | "city"
  | "latitude"
  | "longitude"
  | "property_type"
  | "offer_type"
  | "disposition"
  | "area_m2"
  | "first_seen_at"
  | "last_seen_at"
  | "is_active"
  | "latest_price"
  | "previous_price"
  | "price_change_amount"
  | "price_change_percent"
  | "price_change_direction"
  | "latest_price_per_m2"
  | "latest_property_type_snapshot"
  | "latest_offer_type_snapshot"
  | "latest_description"
  | "latest_scraped_at";

export type ListingSearchRow = {
  listing_id: string;
  listing_url: string;
  source_listing_id: string;
  region: string | null;
  city: string;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  property_type: string | null;
  offer_type: string | null;
  disposition: string | null;
  area_m2: number | null;
  first_seen_at: string;
  last_seen_at: string;
  is_active?: boolean;
  latest_price: number | null;
  previous_price: number | null;
  price_change_amount: number | null;
  price_change_percent: number | null;
  price_change_direction?: PriceChangeDirection | null;
  latest_price_per_m2: number | null;
  latest_property_type_snapshot: string | null;
  latest_offer_type_snapshot: string | null;
  latest_description: string | null;
  latest_scraped_at: string | null;
};
