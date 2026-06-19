"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MarketTimeseriesPoint } from "@/types/market";

import {
  formatCount,
  formatCurrency,
  formatPricePerM2,
  formatShortMonth,
} from "./market-formatters";
import { MetricButtonCarousel } from "./metric-button-carousel";

type MarketTimeseriesChartProps = {
  points: MarketTimeseriesPoint[];
};

type TimeseriesMetricKey = "listings_count" | "avg_price" | "avg_price_per_m2";

type ChartPoint = {
  period: string;
  value: number | null;
};

const metricOptions: Array<{
  key: TimeseriesMetricKey;
  label: string;
  format: (value: number | null | undefined) => string;
}> = [
  { key: "listings_count", label: "Aktivní nabídky", format: formatCount },
  { key: "avg_price", label: "Průměrná cena", format: formatCurrency },
  {
    key: "avg_price_per_m2",
    label: "Průměrná cena za m²",
    format: formatPricePerM2,
  },
];

const chartConfig = {
  value: {
    label: "Hodnota",
    color: "var(--primary-500)",
  },
} satisfies ChartConfig;

export function MarketTimeseriesChart({
  points,
}: MarketTimeseriesChartProps) {
  const [metricKey, setMetricKey] =
    useState<TimeseriesMetricKey>("listings_count");
  const activeMetric =
    metricOptions.find((metric) => metric.key === metricKey) ?? metricOptions[0];
  const data: ChartPoint[] = useMemo(
    () =>
      points.map((point) => ({
        period: point.period,
        value: point[metricKey],
      })),
    [metricKey, points],
  );
  const ticks = useMemo(() => getTimelineTicks(data), [data]);
  const hasData = data.some((point) => typeof point.value === "number");

  return (
    <section className="pb-8 sm:pb-12">
      <div className="flex flex-col gap-4 px-5 sm:px-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Vývoj trhu za posledních 12 měsíců</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Denní vývoj počtu aktivních nabídek, průměrné ceny a průměrné ceny za m² za posledních 12 měsíců.
            </p>
          </div>

          <MetricButtonCarousel className="lg:ml-auto">
            {metricOptions.map((metric) => (
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

      <div className="mt-6 border-b border-dashed bg-white p-5 sm:px-16 sm:py-6">
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-80 w-full"
          >
            <LineChart
              accessibilityLayer
              data={data}
              margin={{ left: 8, right: 16, top: 12, bottom: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="period"
                ticks={ticks}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={18}
                tickFormatter={formatTimelineTick}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={72}
                tickFormatter={(value) => formatAxisValue(Number(value), metricKey)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) =>
                      payload[0]?.payload.period ?? ""
                    }
                    formatter={(value) => (
                      <span className="font-medium tabular-nums text-foreground">
                        {activeMetric.format(Number(value))}
                      </span>
                    )}
                  />
                }
              />
              <Line
                type="linear"
                dataKey="value"
                name={activeMetric.label}
                stroke="var(--color-value)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex min-h-80 items-center justify-center border border-dashed text-sm text-muted-foreground">
            Časová řada pro vybrané filtry není dostupná.
          </div>
        )}
      </div>
    </section>
  );
}

function formatAxisValue(value: number, metricKey: TimeseriesMetricKey) {
  if (metricKey === "listings_count") {
    return value >= 1000 ? `${Math.round(value / 1000)} tis.` : String(value);
  }

  if (value >= 1000000) {
    return `${Math.round(value / 1000000)} mil.`;
  }

  if (value >= 1000) {
    return `${Math.round(value / 1000)} tis.`;
  }

  return String(value);
}

function getTimelineTicks(data: ChartPoint[]) {
  const periods = data.map((point) => point.period);

  if (periods.length <= 14) {
    return periods;
  }

  const ticks: string[] = [];
  const seenMonths = new Set<string>();

  periods.forEach((period, index) => {
    const date = parsePeriodDate(period);

    if (!date) {
      return;
    }

    if (periods.length <= 90) {
      if (index === 0 || index === periods.length - 1 || index % 7 === 0) {
        ticks.push(period);
      }

      return;
    }

    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

    if (!seenMonths.has(monthKey)) {
      seenMonths.add(monthKey);
      ticks.push(period);
    }
  });

  const lastPeriod = periods[periods.length - 1];

  if (lastPeriod && !ticks.includes(lastPeriod)) {
    ticks.push(lastPeriod);
  }

  return ticks.length > 0 ? ticks : periods;
}

function formatTimelineTick(value: string) {
  const date = parsePeriodDate(value);

  if (!date) {
    return formatShortMonth(value);
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function parsePeriodDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (match) {
    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}
