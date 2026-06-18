"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";

import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  getPropertyTypeLabel,
  normalizePropertyType,
  PROPERTY_TYPES,
} from "@/lib/market-taxonomy";
import { cn } from "@/lib/utils";
import type {
  MarketHeatmapDistrictRow,
  MarketOverviewDistribution,
} from "@/types/market";

import { formatCount, formatPercent, formatPricePerM2 } from "./market-formatters";

type MarketDistributionProps = {
  distribution: MarketOverviewDistribution;
  districtRows: MarketHeatmapDistrictRow[];
};

type DistributionItem = {
  key: string;
  label: string;
  count: number;
  percent: number;
  fill: string;
};

const distributionColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary-700)",
  "var(--muted-foreground)",
];

const propertyColors: Record<string, string> = {
  flat: "var(--chart-1)",
  house: "var(--chart-2)",
  land: "var(--chart-3)",
  commercial: "var(--chart-4)",
  other: "var(--chart-5)",
};

export function MarketDistribution({
  distribution,
  districtRows,
}: MarketDistributionProps) {
  const { title, items } = getDistributionView(distribution);
  const chartConfig = getChartConfig(items);
  const hasDistribution = items.some((item) => item.count > 0);
  const chartItems = items.filter((item) => item.count > 0);
  const rankedDistricts = getRankedDistricts(districtRows);
  const mostExpensive = rankedDistricts.slice(0, 6);
  const cheapest = [...rankedDistricts].reverse().slice(0, 6);

  return (
    <section className="pb-8 sm:pb-12">
      <div className="grid border-b border-dashed bg-background lg:grid-cols-3">
        <div className="border-b border-dashed p-5 sm:px-16 sm:py-8 lg:border-b-0 lg:border-r lg:px-8">
          <h2 className="text-sm font-medium text-muted-foreground">
            {title}
          </h2>
          {hasDistribution ? (
            <>
              <ChartContainer
                config={chartConfig}
                className="mx-auto mt-4 aspect-square h-56 max-h-56"
              >
                <PieChart>
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      color: "var(--popover-foreground)",
                      boxShadow: "none",
                    }}
                    formatter={(value, name) => [
                      formatCount(Number(value)),
                      String(name),
                    ]}
                  />
                  <Pie
                    data={chartItems}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={48}
                    outerRadius={84}
                    paddingAngle={2}
                    stroke="var(--background)"
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {chartItems.map((item) => (
                      <Cell key={item.key} fill={item.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>

              <div className="mt-5 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2 rounded-sm"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className=" tabular-nums text-muted-foreground">
                      {formatCount(item.count)}
                    </span>
                    <span className="w-14 text-right  tabular-nums">
                      {formatPercent(item.percent)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        <DistrictRanking
          title="Nejdražší okresy"
          rows={mostExpensive}
          className="border-b border-dashed lg:border-b-0 lg:border-r"
        />
        <DistrictRanking title="Nejlevnější okresy" rows={cheapest} />
      </div>
    </section>
  );
}

function getDistributionView(distribution: MarketOverviewDistribution) {
  if (distribution.kind === "property_type") {
    return {
      title: "Typy nemovitostí",
      items: sortDistributionItems(
        withPercent(
          PROPERTY_TYPES.map((propertyType) => ({
            key: propertyType,
            label: getPropertyTypeLabel(propertyType),
            count: sumRows(
              distribution.rows.filter(
                (row) => normalizePropertyType(row.property_type) === propertyType,
              ),
              "listings_count",
            ),
            fill: propertyColors[propertyType] ?? "var(--muted)",
          })),
        ),
      ),
    };
  }

  if (distribution.kind === "disposition") {
    return {
      title: "Dispozice",
      items: withProvidedPercent(
        distribution.rows.map((row, index) => ({
          key: row.disposition ?? "Neuvedeno",
          label: row.disposition ?? "Neuvedeno",
          count: toNumber(row.listings_count),
          percent: toNullableNumber(row.share_percent),
          fill: getDistributionColor(index),
        })),
      ),
    };
  }

  return {
    title: "Metry čtvereční",
    items: withProvidedPercent(
      distribution.rows.map((row, index) => ({
        key: row.area_bucket ?? "Neuvedeno",
        label: row.area_bucket ?? "Neuvedeno",
        count: toNumber(row.listings_count),
        percent: toNullableNumber(row.share_percent),
        fill: getDistributionColor(index),
      })),
    ),
  };
}

function getChartConfig(items: DistributionItem[]) {
  return Object.fromEntries(
    items.map((item) => [
      item.key,
      {
        label: item.label,
        color: item.fill,
      },
    ]),
  ) satisfies ChartConfig;
}

function DistrictRanking({
  title,
  rows,
  className,
}: {
  title: string;
  rows: MarketHeatmapDistrictRow[];
  className?: string;
}) {
  return (
    <div className={cn("p-5 sm:px-16 sm:py-8 lg:px-8", className)}>
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      {rows.length > 0 ? (
        <div className="mt-5 space-y-3">
          {rows.map((row, index) => (
            <div
              key={`${row.region}-${row.district}`}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm"
            >
              <span className="flex size-6 items-center justify-center rounded-md bg-accent  text-xs text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="truncate font-medium">
                  {row.district ?? "Neznámý okres"}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {row.region ?? "Bez kraje"}
                </div>
              </div>
              <span className=" text-sm tabular-nums">
                {formatPricePerM2(row.avg_price_per_m2)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-4 flex h-40 items-center justify-center border border-dashed text-sm text-muted-foreground">
      Data pro vybraný trh nejsou dostupná.
    </div>
  );
}

function withPercent(items: Omit<DistributionItem, "percent">[]) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return items.map((item) => ({
    ...item,
    percent: total > 0 ? (item.count / total) * 100 : 0,
  }));
}

function withProvidedPercent(
  items: Array<Omit<DistributionItem, "percent"> & { percent: number | null }>,
) {
  const needsComputedPercent = items.some((item) => item.percent === null);

  if (needsComputedPercent) {
    return withPercent(
      items.map((item) => ({
        key: item.key,
        label: item.label,
        count: item.count,
        fill: item.fill,
      })),
    );
  }

  return items.map((item) => ({
    ...item,
    percent: item.percent ?? 0,
  }));
}

function getDistributionColor(index: number) {
  return distributionColors[index % distributionColors.length] ?? "var(--muted)";
}

function sortDistributionItems(items: DistributionItem[]) {
  return [...items].sort((a, b) => {
    const countDifference = b.count - a.count;

    return countDifference === 0
      ? a.label.localeCompare(b.label, "cs-CZ")
      : countDifference;
  });
}

function getRankedDistricts(rows: MarketHeatmapDistrictRow[]) {
  return rows
    .filter((row) => typeof row.avg_price_per_m2 === "number")
    .sort((a, b) => (b.avg_price_per_m2 ?? 0) - (a.avg_price_per_m2 ?? 0));
}

function sumRows<T extends Record<string, unknown>>(rows: T[], key: keyof T) {
  return rows.reduce((sum, row) => {
    const value = row[key];

    return sum + toNumber(value);
  }, 0);
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = toNumber(value);

  return Number.isFinite(parsed) ? parsed : null;
}
