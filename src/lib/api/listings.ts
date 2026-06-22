import { unstable_cache } from "next/cache";
import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ListingExportInput,
  ListingPriceHistoryRow,
  ListingSearchCountInput,
  ListingSearchInput,
  ListingSearchRow,
} from "@/types/listings";

import {
  emptyStringToNull,
  formatSupabaseError,
  normalizeLimit,
  normalizeOffset,
} from "./utils";

const LISTINGS_DATA_REVALIDATE_SECONDS = 86400;
export const LISTINGS_DATA_CACHE_TAG = "listings-data";

const cachedListingsRpc = unstable_cache(
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
  ["listings-rpc"],
  {
    revalidate: LISTINGS_DATA_REVALIDATE_SECONDS,
    tags: [LISTINGS_DATA_CACHE_TAG],
  },
);

export async function getListingPriceHistory(
  listingId: string,
): Promise<ListingPriceHistoryRow[]> {
  const normalizedListingId = emptyStringToNull(listingId);

  if (!normalizedListingId) {
    throw new Error("listingId is required for listing_price_history.");
  }

  const data = await cachedListingsRpc("listing_price_history", {
    p_listing_id: normalizedListingId,
  });

  return data as ListingPriceHistoryRow[];
}

export async function searchListings(
  params: ListingSearchInput = {},
): Promise<ListingSearchRow[]> {
  const normalizedParams: ListingSearchInput = {
    p_filters: params.p_filters ?? [],
    p_sorts: params.p_sorts ?? [{ column: "last_seen_at", dir: "desc" }],
    p_limit: normalizeLimit(params.p_limit),
    p_offset: normalizeOffset(params.p_offset),
  };

  const data = await cachedListingsRpc(
    "search_listings",
    normalizedParams as Record<string, unknown>,
  );

  return data as ListingSearchRow[];
}

export async function searchListingsCount(
  params: ListingSearchCountInput = {},
): Promise<number> {
  const normalizedParams: ListingSearchCountInput = {
    p_filters: params.p_filters ?? [],
  };

  const data = await cachedListingsRpc(
    "search_listings_count",
    normalizedParams as Record<string, unknown>,
  );

  return Number(data ?? 0);
}

export async function exportListings(
  params: ListingExportInput = {},
): Promise<ListingSearchRow[]> {
  const normalizedParams: ListingExportInput = {
    p_filters: params.p_filters ?? [],
  };

  const data = await cachedListingsRpc(
    "export_listings",
    normalizedParams as Record<string, unknown>,
  );

  return data as ListingSearchRow[];
}
