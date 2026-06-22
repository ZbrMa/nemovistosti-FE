"use server";

import {
  exportListings,
  searchListings,
  searchListingsCount,
} from "@/lib/api/listings";
import { safeQuery } from "@/lib/api/safe-query";
import type { ListingExportInput, ListingSearchInput } from "@/types/listings";

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

export async function exportListingRows(input: ListingExportInput) {
  return safeQuery(
    "market_listings.export_listings",
    () => exportListings({ p_filters: input.p_filters ?? [] }),
    [],
  );
}
