import { getRegionGroups } from "@/app/kalkulacky/rental-yield-utils";
import { MarketActivitySummary } from "@/features/market-overview/market-activity-summary";
import { MarketDistribution } from "@/features/market-overview/market-distribution";
import { MarketFilters } from "@/features/market-overview/market-filters";
import { MarketHeatmap } from "@/features/market-overview/market-heatmap";
import { MarketRegionsTable } from "@/features/market-overview/market-regions-table";
import { MarketTimeseriesChart } from "@/features/market-overview/market-timeseries-chart";
import {
  getMarketActivitySummary,
  getMarketDistribution,
  getMarketDistributionArea,
  getMarketDistributionDisposition,
  getMarketFacets,
  getMarketHeatmapDistricts,
  getMarketHeatmapRegions,
  getMarketRegions,
  getMarketTimeseries,
} from "@/lib/api/market";
import { safeQuery } from "@/lib/api/safe-query";
import {
  getOfferTypeLabel,
  normalizePropertyType,
  PROPERTY_TYPE,
  type OfferType,
  type PropertyType,
} from "@/lib/market-taxonomy";
import type {
  MarketActivitySummary as MarketActivitySummaryType,
  MarketActivitySummaryInput,
  MarketDistributionInput,
  MarketFilterInput,
  MarketHeatmapDistrictsInput,
  MarketHeatmapDistrictRow,
  MarketHeatmapRegionRow,
  MarketHeatmapRegionsInput,
  MarketOverviewDistribution,
  MarketTimeseriesPoint,
} from "@/types/market";

import { getPropertyCategory } from "./market-overview-routes";

type MarketOverviewPageProps = {
  offerType: OfferType;
  propertyType?: PropertyType | null;
  searchParams?: Record<string, string | string[] | undefined>;
};

type MarketOverviewPageData = {
  distribution: MarketOverviewDistribution;
  activitySummary: MarketActivitySummaryType | null;
  districtRows: MarketHeatmapDistrictRow[];
  regionRows: MarketHeatmapRegionRow[];
  timeseries: MarketTimeseriesPoint[];
};

export async function MarketOverviewPage({
  offerType,
  propertyType = null,
  searchParams,
}: MarketOverviewPageProps) {
  const selectedRegions = normalizeQueryValues(searchParams?.kraj);
  const selectedDistricts = normalizeQueryValues(searchParams?.okres);
  const filters: MarketFilterInput = {
    p_offer_type: offerType,
    p_property_type: propertyType,
  };
  const [data, marketRegions, marketFacets] = await Promise.all([
    getMarketOverviewPageData(filters, selectedRegions, selectedDistricts),
    safeQuery("market_overview.market_regions", () => getMarketRegions(), []),
    safeQuery("market_overview.market_facets", () => getMarketFacets(), null),
  ]);
  const regionGroups = getRegionGroups(marketRegions, marketFacets);
  const offerLabel = getOfferTypeLabel(offerType).toLowerCase();
  const category = getPropertyCategory(propertyType);
  const title = category
    ? `Přehled trhu ${category.pluralLabel}`
    : "Přehled trhu nemovitostí";

  return (
    <div className="mx-auto w-full max-w-[1300px] px-5 lg:px-8">
      <div className="border-x border-dashed">
        <section>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
            <div className="px-5 py-4 sm:px-16 sm:py-8">
              <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Aktuální analytický přehled českého trhu{" "}
                {category ? "v segmentu" : "s nemovitostmi pro"}{" "}
                {category ? category.pluralLabel : offerLabel}{" "}
                {category
                  ? `pro ${offerLabel}`
                  : "napříč kraji, okresy a hlavními segmenty"}
                .
              </p>
            </div>
            <MarketFilters
              selectedOfferType={offerType}
              selectedPropertyType={propertyType}
              regionGroups={regionGroups}
              selectedRegions={selectedRegions}
              selectedDistricts={selectedDistricts}
            />
          </div>
        </section>
        <MarketActivitySummary summary={data.activitySummary} />
        <MarketDistribution
          distribution={data.distribution}
          districtRows={data.districtRows}
        />
        <MarketRegionsTable rows={data.regionRows} />
        <MarketHeatmap rows={data.districtRows} />
        <MarketTimeseriesChart points={data.timeseries} />
      </div>
    </div>
  );
}

async function getMarketOverviewPageData(
  filters: MarketFilterInput,
  selectedRegions: string[],
  selectedDistricts: string[],
): Promise<MarketOverviewPageData> {
  const timeseriesFrom = getDateMonthsAgo(12);
  const timeseriesTo = getDateToday();
  const arrayFilters = getArrayFilters(filters, selectedRegions, selectedDistricts);
  const heatmapDistrictFilters = getHeatmapDistrictFilters(filters);
  const heatmapRegionFilters = getHeatmapRegionFilters(filters);
  const [
    distribution,
    activitySummary,
    districtRows,
    regionRows,
    timeseries,
  ] = await Promise.all([
    safeQuery(
      "market_overview.distribution",
      () => getDistributionForCurrentView(filters, arrayFilters),
      getEmptyDistribution(filters.p_property_type),
    ),
    safeQuery(
      "market_overview.activity_summary",
      () => getMarketActivitySummary(arrayFilters),
      null,
    ),
    safeQuery(
      "market_overview.heatmap_districts",
      () => getMarketHeatmapDistricts(heatmapDistrictFilters),
      [],
    ),
    safeQuery(
      "market_overview.heatmap_regions",
      () => getMarketHeatmapRegions(heatmapRegionFilters),
      [],
    ),
    safeQuery(
      "market_overview.timeseries",
      () =>
        getFilteredTimeseries(
          filters,
          selectedRegions,
          selectedDistricts,
          timeseriesFrom,
          timeseriesTo,
        ),
      [],
    ),
  ]);

  const filteredDistrictRows = filterDistrictRows(
    districtRows,
    selectedRegions,
    selectedDistricts,
  );
  const filteredRegionRows = filterRegionRows(regionRows, selectedRegions);

  return {
    distribution,
    activitySummary,
    districtRows: filteredDistrictRows,
    regionRows: filteredRegionRows,
    timeseries,
  };
}

async function getDistributionForCurrentView(
  filters: MarketFilterInput,
  arrayFilters: MarketDistributionInput,
): Promise<MarketOverviewDistribution> {
  const propertyType = normalizePropertyType(filters.p_property_type);

  if (propertyType === null) {
    return {
      kind: "property_type",
      rows: await getMarketDistribution(arrayFilters),
    };
  }

  if (propertyType === PROPERTY_TYPE.flat) {
    return {
      kind: "disposition",
      rows: await getMarketDistributionDisposition(arrayFilters),
    };
  }

  return {
    kind: "area",
    rows: await getMarketDistributionArea(arrayFilters),
  };
}

function getEmptyDistribution(
  propertyTypeValue: string | null | undefined,
): MarketOverviewDistribution {
  const propertyType = normalizePropertyType(propertyTypeValue);

  if (propertyType === null) {
    return {
      kind: "property_type",
      rows: [],
    };
  }

  if (propertyType === PROPERTY_TYPE.flat) {
    return {
      kind: "disposition",
      rows: [],
    };
  }

  return {
    kind: "area",
    rows: [],
  };
}

function getArrayFilters(
  filters: MarketFilterInput,
  selectedRegions: string[],
  selectedDistricts: string[],
): MarketDistributionInput & MarketActivitySummaryInput {
  return {
    p_regions: selectedRegions.length > 0 ? selectedRegions : null,
    p_districts: selectedDistricts.length > 0 ? selectedDistricts : null,
    p_property_types: filters.p_property_type ? [filters.p_property_type] : null,
    p_offer_types: filters.p_offer_type ? [filters.p_offer_type] : null,
  };
}

function getHeatmapDistrictFilters(
  filters: MarketFilterInput,
): MarketHeatmapDistrictsInput {
  return {
    p_region: null,
    p_property_type: filters.p_property_type,
    p_offer_type: filters.p_offer_type,
  };
}

function getHeatmapRegionFilters(
  filters: MarketFilterInput,
): MarketHeatmapRegionsInput {
  return {
    p_property_type: filters.p_property_type,
    p_offer_type: filters.p_offer_type,
  };
}

function getDateMonthsAgo(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);

  return date.toISOString().slice(0, 10);
}

function getDateToday() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeQueryValues(value: string | string[] | undefined) {
  if (value === undefined) {
    return [];
  }

  const source = Array.isArray(value) ? value : [value];

  return source.map((item) => item.trim()).filter((item) => item.length > 0);
}

async function getFilteredTimeseries(
  filters: MarketFilterInput,
  selectedRegions: string[],
  selectedDistricts: string[],
  timeseriesFrom: string,
  timeseriesTo: string,
) {
  if (selectedRegions.length === 0 && selectedDistricts.length === 0) {
    return getMarketTimeseries({
      p_region: filters.p_region,
      p_district: filters.p_district,
      p_property_type: filters.p_property_type,
      p_offer_type: filters.p_offer_type,
      p_from: timeseriesFrom,
      p_to: timeseriesTo,
    });
  }

  if (selectedDistricts.length === 0) {
    const series = await Promise.all(
      selectedRegions.map((region) =>
        getMarketTimeseries({
          p_property_type: filters.p_property_type,
          p_offer_type: filters.p_offer_type,
          p_region: region,
          p_from: timeseriesFrom,
          p_to: timeseriesTo,
        }),
      ),
    );

    return mergeTimeseries(series.flat());
  }

  const regionsToQuery = selectedRegions.length > 0 ? selectedRegions : [null];
  const series = await Promise.all(
    regionsToQuery.flatMap((region) =>
      selectedDistricts.map((district) =>
        getMarketTimeseries({
          p_property_type: filters.p_property_type,
          p_offer_type: filters.p_offer_type,
          p_region: region,
          p_district: district,
          p_from: timeseriesFrom,
          p_to: timeseriesTo,
        }),
      ),
    ),
  );

  return mergeTimeseries(series.flat());
}

function filterDistrictRows(
  rows: MarketHeatmapDistrictRow[],
  selectedRegions: string[],
  selectedDistricts: string[],
) {
  const regionSet = selectedRegions.length > 0 ? new Set(selectedRegions) : null;
  const districtSet =
    selectedDistricts.length > 0 ? new Set(selectedDistricts) : null;

  return rows.filter((row) => {
    if (regionSet && !regionSet.has(row.region ?? "")) {
      return false;
    }

    if (districtSet && !districtSet.has(row.district ?? "")) {
      return false;
    }

    return true;
  });
}

function filterRegionRows(
  rows: MarketHeatmapRegionRow[],
  selectedRegions: string[],
) {
  if (selectedRegions.length === 0) {
    return rows;
  }

  const regionSet = new Set(selectedRegions);

  return rows.filter((row) => regionSet.has(row.region ?? ""));
}

function mergeTimeseries(points: MarketTimeseriesPoint[]) {
  const byPeriod = new Map<
    string,
    {
      period: string;
      listings_count: number;
      avg_price_weighted_sum: number;
      avg_price_per_m2_weighted_sum: number;
      price_weight: number;
      price_per_m2_weight: number;
    }
  >();

  for (const point of points) {
    const current = byPeriod.get(point.period) ?? {
      period: point.period,
      listings_count: 0,
      avg_price_weighted_sum: 0,
      avg_price_per_m2_weighted_sum: 0,
      price_weight: 0,
      price_per_m2_weight: 0,
    };
    const count = typeof point.listings_count === "number" ? point.listings_count : 0;

    current.listings_count += count;

    if (typeof point.avg_price === "number") {
      current.avg_price_weighted_sum += point.avg_price * count;
      current.price_weight += count;
    }

    if (typeof point.avg_price_per_m2 === "number") {
      current.avg_price_per_m2_weighted_sum += point.avg_price_per_m2 * count;
      current.price_per_m2_weight += count;
    }

    byPeriod.set(point.period, current);
  }

  return [...byPeriod.values()]
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((point): MarketTimeseriesPoint => ({
      period: point.period,
      listings_count: point.listings_count,
      avg_price:
        point.price_weight > 0
          ? Math.round((point.avg_price_weighted_sum / point.price_weight) * 100) /
            100
          : null,
      median_price: null,
      avg_price_per_m2:
        point.price_per_m2_weight > 0
          ? Math.round(
              (point.avg_price_per_m2_weighted_sum / point.price_per_m2_weight) *
                100,
            ) / 100
          : null,
      median_price_per_m2: null,
    }));
}
