"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MarketHeatmapDistrictRow } from "@/types/market";

import {
  formatCount,
  formatCurrency,
  formatPricePerM2,
} from "./market-formatters";
import { MetricButtonCarousel } from "./metric-button-carousel";

type MarketHeatmapProps = {
  rows: MarketHeatmapDistrictRow[];
};

type HeatmapMetricKey =
  | "listings_count"
  | "new_listings_30d"
  | "discounted_listings_30d"
  | "avg_price"
  | "avg_price_per_m2";

const metrics: Array<{
  key: HeatmapMetricKey;
  label: string;
  format: (value: number | null | undefined) => string;
}> = [
  { key: "listings_count", label: "Aktivní nabídky", format: formatCount },
  { key: "new_listings_30d", label: "Nové nabídky za 30 dní", format: formatCount },
  {
    key: "discounted_listings_30d",
    label: "Zlevněné aktivní nabídky",
    format: formatCount,
  },
  { key: "avg_price", label: "Průměrná cena", format: formatCurrency },
  { key: "avg_price_per_m2", label: "Cena za m²", format: formatPricePerM2 },
];

export function MarketHeatmap({ rows }: MarketHeatmapProps) {
  const [metricKey, setMetricKey] =
    useState<HeatmapMetricKey>("listings_count");
  const activeMetric =
    metrics.find((metric) => metric.key === metricKey) ?? metrics[0];
  const values = rows
    .map((row) => row[metricKey])
    .filter((value): value is number => typeof value === "number");
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const sortedRows = [...rows].sort((a, b) => {
    const aValue = getNumericValue(a[metricKey]);
    const bValue = getNumericValue(b[metricKey]);
    const valueDifference = bValue - aValue;

    if (valueDifference !== 0) {
      return valueDifference;
    }

    return String(a.district ?? "").localeCompare(
      String(b.district ?? ""),
      "cs-CZ",
    );
  });

  return (
    <section className="pb-8 sm:pb-12">
      <div className="flex flex-col gap-4 px-5 sm:px-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Srovnání okresů
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Okresy jsou seřazené sestupně podle vybrané tržní metriky.
            </p>
          </div>

          <MetricButtonCarousel className="lg:ml-auto">
            {metrics.map((metric) => (
              <Button
                key={metric.key}
                type="button"
                variant={metric.key === metricKey ? "primaryOutline" : "outline"}
                size="xs"
                onClick={() => setMetricKey(metric.key)}
              >
                {metric.label}
              </Button>
            ))}
          </MetricButtonCarousel>
        </div>
      </div>

      <div className="mt-6 border-y border-dashed bg-background">
        {rows.length > 0 ? (
          <TooltipProvider>
            <div className="overflow-auto [scrollbar-gutter:stable] lg:max-h-[560px]">
              <div className="grid min-w-[420px] grid-cols-[max-content_minmax(8rem,1fr)_5.75rem] sm:min-w-[560px] sm:grid-cols-[max-content_minmax(14rem,1fr)_7rem] lg:min-w-[680px] lg:grid-cols-[max-content_minmax(18rem,1fr)_8rem]">
                {sortedRows.map((row) => {
                  const value = row[metricKey];
                  const districtLabel = row.district ?? "Neznámý okres";
                  const formattedValue = activeMetric.format(value);
                  const numericValue = getNumericValue(value);
                  const ratio = maxValue > 0 ? numericValue / maxValue : 0;
                  const colorWeight = getBarColorWeight(ratio);
                  const width = `${Math.max(ratio * 100, numericValue > 0 ? 2 : 0)}%`;

                  return (
                    <Tooltip key={`${row.region}-${row.district}`}>
                      <TooltipTrigger
                        render={
                          <div className="grid grid-cols-subgrid col-span-3 items-center gap-4 px-3 py-0.5 transition-colors last:border-b-0 hover:bg-accent/35" />
                        }
                      >
                        <div className="min-w-0">
                          <div className="truncate text-[10px] font-medium sm:text-xs lg:text-sm">
                            {districtLabel}
                          </div>
                        </div>

                        <div className="h-3 overflow-hidden rounded-[2px] bg-accent">
                          <div
                            className="h-full rounded-[2px]"
                            style={{
                              width,
                              backgroundColor: `color-mix(in oklch, var(--primary-700) ${colorWeight}%, var(--background))`,
                            }}
                          />
                        </div>

                        <div className="text-left font-mono text-xs tabular-nums text-foreground sm:text-right sm:text-sm">
                          {formattedValue}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>{districtLabel}</span>
                        <span className="font-mono tabular-nums">
                          {formattedValue}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </TooltipProvider>
        ) : (
          <div className="flex min-h-64 items-center justify-center border border-dashed text-sm text-muted-foreground">
            Data pro vybrané filtry nejsou dostupná.
          </div>
        )}
      </div>
    </section>
  );
}

function getNumericValue(value: number | null | undefined) {
  return typeof value === "number" ? value : 0;
}

function getBarColorWeight(ratio: number) {
  if (ratio <= 0) {
    return 10;
  }

  return Math.round(18 + ratio * 62);
}
