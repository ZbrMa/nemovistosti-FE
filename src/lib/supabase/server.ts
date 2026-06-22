import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type {
  MarketFacets,
  MarketFacetsInput,
  MarketActivitySummary,
  MarketActivitySummaryInput,
  MarketDistributionInput,
  MarketDistributionAreaInput,
  MarketDistributionAreaRow,
  MarketDistributionDispositionInput,
  MarketDistributionDispositionRow,
  MarketDistributionRow,
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
import type {
  ListingExportInput,
  ListingPriceHistoryInput,
  ListingPriceHistoryRow,
  ListingSearchCountInput,
  ListingSearchInput,
  ListingSearchRow,
} from "@/types/listings";

type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: {
      market_overview: {
        Args: MarketOverviewInput;
        Returns: MarketOverview | MarketOverview[];
      };
      market_distribution: {
        Args: MarketDistributionInput;
        Returns: MarketDistributionRow[];
      };
      market_distribution_area: {
        Args: MarketDistributionAreaInput;
        Returns: MarketDistributionAreaRow[];
      };
      market_distribution_disposition: {
        Args: MarketDistributionDispositionInput;
        Returns: MarketDistributionDispositionRow[];
      };
      market_activity_summary: {
        Args: MarketActivitySummaryInput;
        Returns: MarketActivitySummary | MarketActivitySummary[];
      };
      market_heatmap_regions: {
        Args: MarketHeatmapRegionsInput;
        Returns: MarketHeatmapRegionRow[];
      };
      market_heatmap_districts: {
        Args: MarketHeatmapDistrictsInput;
        Returns: MarketHeatmapDistrictRow[];
      };
      market_timeseries: {
        Args: MarketTimeseriesInput;
        Returns: MarketTimeseriesPoint[];
      };
      market_screener: {
        Args: MarketScreenerInput;
        Returns: MarketScreenerRow[];
      };
      market_yields: {
        Args: MarketYieldsInput;
        Returns: MarketYieldRow[];
      };
      market_yields_by_area: {
        Args: MarketYieldsByAreaInput;
        Returns: MarketYieldByAreaRow[];
      };
      listing_price_history: {
        Args: ListingPriceHistoryInput;
        Returns: ListingPriceHistoryRow[];
      };
      market_facets: {
        Args: MarketFacetsInput;
        Returns: MarketFacets | MarketFacets[];
      };
      market_regions: {
        Args: Record<string, never>;
        Returns: MarketRegion[];
      };
      get_seo_landing_page_by_slug: {
        Args: { p_slug: string };
        Returns: SeoLandingPage | SeoLandingPage[] | null;
      };
      search_listings: {
        Args: ListingSearchInput;
        Returns: ListingSearchRow[];
      };
      search_listings_count: {
        Args: ListingSearchCountInput;
        Returns: number;
      };
      export_listings: {
        Args: ListingExportInput;
        Returns: ListingSearchRow[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let supabaseServerClient: SupabaseClient<Database> | null = null;

export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  if (!supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  }

  supabaseServerClient ??= createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseServerClient;
}
