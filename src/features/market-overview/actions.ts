"use server";

import { getMarketTimeseries } from "@/lib/api/market";
import type { MarketTimeseriesPoint } from "@/types/market";

type TimeseriesFilterInput = {
  offerType: string;
  propertyType?: string | null;
  selectedRegions: string[];
  selectedDistricts: string[];
  allRegions: string[];
  allDistricts: string[];
};

export async function getFilteredMarketTimeseries({
  offerType,
  propertyType = null,
  selectedRegions,
  selectedDistricts,
  allRegions,
  allDistricts,
}: TimeseriesFilterInput) {
  if (selectedRegions.length === 0 || selectedDistricts.length === 0) {
    return [];
  }

  const regionFilter =
    selectedRegions.length === allRegions.length ? null : selectedRegions;
  const districtFilter =
    selectedDistricts.length === allDistricts.length ? null : selectedDistricts;
  const timeseriesFrom = getDateMonthsAgo(12);
  const timeseriesTo = getDateToday();

  if (regionFilter === null && districtFilter === null) {
    return getMarketTimeseries({
      p_offer_type: offerType,
      p_property_type: propertyType,
      p_from: timeseriesFrom,
      p_to: timeseriesTo,
    });
  }

  const queries = getTimeseriesQueries(regionFilter, districtFilter);
  const series = await Promise.all(
    queries.map((query) =>
      getMarketTimeseries({
        p_offer_type: offerType,
        p_property_type: propertyType,
        p_region: query.region,
        p_district: query.district,
        p_from: timeseriesFrom,
        p_to: timeseriesTo,
      }),
    ),
  );

  return mergeTimeseries(series.flat());
}

function getTimeseriesQueries(
  regions: string[] | null,
  districts: string[] | null,
) {
  if (districts !== null) {
    const regionValues = regions ?? [null];

    return regionValues.flatMap((region) =>
      districts.map((district) => ({
        region,
        district,
      })),
    );
  }

  return (regions ?? [null]).map((region) => ({
    region,
    district: null,
  }));
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
    const count = toNumber(point.listings_count);

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
          ? round(point.avg_price_weighted_sum / point.price_weight)
          : null,
      median_price: null,
      avg_price_per_m2:
        point.price_per_m2_weight > 0
          ? round(point.avg_price_per_m2_weighted_sum / point.price_per_m2_weight)
          : null,
      median_price_per_m2: null,
    }));
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function getDateMonthsAgo(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);

  return date.toISOString().slice(0, 10);
}

function getDateToday() {
  return new Date().toISOString().slice(0, 10);
}
