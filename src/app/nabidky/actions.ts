"use server";

import { searchListings, searchListingsCount } from "@/lib/api/listings";
import { MAX_LIMIT } from "@/lib/api/utils";
import { safeQuery } from "@/lib/api/safe-query";
import type { ListingSearchInput } from "@/types/listings";

export async function getListingRows(input: ListingSearchInput) {
  const [rows, totalCount] = await Promise.all([
    safeQuery(
      "market_listings.search_listings",
      () => searchListings(input),
      [],
    ),
    safeQuery(
      "market_listings.search_listings_count",
      () => searchListingsCount({ p_filters: input.p_filters }),
      0,
    ),
  ]);

  return {
    rows,
    totalCount,
  };
}

export async function exportListingRows(input: ListingSearchInput) {
  const totalCount = await safeQuery(
    "market_listings.search_listings_count",
    () => searchListingsCount({ p_filters: input.p_filters }),
    0,
  );

  if (totalCount <= 0) {
    return [];
  }

  const rows = [];

  for (let offset = 0; offset < totalCount; offset += MAX_LIMIT) {
    const batch = await safeQuery(
      "market_listings.search_listings",
      () =>
        searchListings({
          ...input,
          p_limit: MAX_LIMIT,
          p_offset: offset,
        }),
      [],
    );

    rows.push(...batch);
  }

  return rows;
}
