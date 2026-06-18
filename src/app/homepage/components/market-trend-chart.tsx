"use client";

import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MarketTimeseriesPoint } from "@/types/market";

import { formatPricePerM2, formatShortDate } from "./home-formatters";

type MarketTrendChartProps = {
  points: MarketTimeseriesPoint[];
};

type ChartPoint = {
  period: string;
  label: string;
  avg: number | null;
  median: number | null;
};

export function MarketTrendChart({ points }: MarketTrendChartProps) {
  const data: ChartPoint[] = points.map((point) => ({
    period: point.period,
    label: formatShortDate(point.period),
    avg: point.avg_price_per_m2,
    median: point.median_price_per_m2,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            minTickGap={18}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickFormatter={(value: number) => `${Math.round(value / 1000)} tis.`}
            width={56}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--popover-foreground)",
              boxShadow: "none",
            }}
            formatter={(value, name) => {
              const numericValue = typeof value === "number" ? value : null;

              return [
                formatPricePerM2(numericValue) ?? "—",
                name === "avg" ? "Průměr Kč/m²" : "Medián Kč/m²",
              ];
            }}
            labelFormatter={(_, payload) => payload[0]?.payload.period ?? ""}
          />
          <Area
            type="monotone"
            dataKey="avg"
            stroke="none"
            fill="var(--primary)"
            fillOpacity={0.08}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="median"
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
