import type { Metadata } from "next";

import { ListingsTable } from "@/features/listings/listings-table";
import { searchListings, searchListingsCount } from "@/lib/api/listings";
import { getMarketFacets } from "@/lib/api/market";
import { safeQuery } from "@/lib/api/safe-query";
import { buildPageMetadata } from "@/lib/seo";
import type { ListingSearchFilter, ListingSearchInput } from "@/types/listings";

export const metadata: Metadata = buildPageMetadata({
  title: "Aktuální nabídky",
  description:
    "Kompletní analytický seznam aktivních realitních nabídek s filtrováním, řazením a exportem.",
  path: "/nabidky",
});

export const revalidate = 86400;

type ListingsPageProps = {
  searchParams: Promise<{
    region?: string;
    district?: string;
    offer_type?: string;
    property_type?: string;
    price_change_direction?: string;
  }>;
};

export default async function ListingsPage({
  searchParams,
}: ListingsPageProps) {
  const initialCriteria = await searchParams;
  const initialSearchInput: ListingSearchInput = {
    p_filters: getInitialListingFilters(initialCriteria),
    p_limit: 100,
    p_offset: 0,
    p_sorts: [{ column: "latest_price", dir: "desc", nulls: "last" }],
  };
  const [rows, totalCount, facets] = await Promise.all([
    safeQuery(
      "market_listings.search_listings",
      () => searchListings(initialSearchInput),
      [],
    ),
    safeQuery(
      "market_listings.search_listings_count",
      () => searchListingsCount({ p_filters: initialSearchInput.p_filters }),
      0,
    ),
    safeQuery("market_listings.market_facets", () => getMarketFacets(), null),
  ]);

  return (
    <div className="mx-auto flex h-[calc(100svh-72.8px)] w-full max-w-[1500px] px-5 lg:px-8">
      <div className="flex min-h-0 flex-1 border-x border-dashed py-6">
        <ListingsTable
          rows={rows}
          totalCount={totalCount}
          facets={facets}
          initialCriteria={initialCriteria}
        />
      </div>
    </div>
  );
}

function getInitialListingFilters(searchParams: {
  region?: string;
  district?: string;
  offer_type?: string;
  property_type?: string;
  price_change_direction?: string;
}): ListingSearchFilter[] {
  const filters: ListingSearchFilter[] = [];

  if (searchParams.region) {
    filters.push({
      column: "region",
      op: "eq",
      value: searchParams.region,
    });
  }

  if (searchParams.district) {
    filters.push({
      column: "district",
      op: "eq",
      value: searchParams.district,
    });
  }

  if (searchParams.offer_type) {
    filters.push({
      column: "offer_type",
      op: "eq",
      value: searchParams.offer_type,
    });
  }

  if (searchParams.property_type) {
    filters.push({
      column: "property_type",
      op: "eq",
      value: searchParams.property_type,
    });
  }

  if (searchParams.price_change_direction) {
    filters.push({
      column: "price_change_direction",
      op: "eq",
      value: searchParams.price_change_direction,
    });
  }

  return filters;
}
