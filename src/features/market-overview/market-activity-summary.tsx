import { Activity, ArrowDownRight, Clock, Home, PlusCircle } from "lucide-react";

import type { MarketActivitySummary as MarketActivitySummaryType } from "@/types/market";

import { formatCount, formatDays } from "./market-formatters";

type MarketActivitySummaryProps = {
  summary: MarketActivitySummaryType | null;
};

export function MarketActivitySummary({ summary }: MarketActivitySummaryProps) {
  const items = [
    {
      label: "Aktivní nabídky",
      value: formatCount(summary?.active_listings),
      icon: Home,
    },
    {
      label: "Nové nabídky za 30 dní",
      value: formatCount(summary?.new_listings_30d),
      icon: PlusCircle,
    },
    {
      label: "Stažené nabídky za 30 dní",
      value: formatCount(summary?.inactive_listings_30d),
      icon: Activity,
    },
    {
      label: "Zlevněné aktivní nabídky",
      value: formatCount(summary?.discounted_listings_30d),
      icon: ArrowDownRight,
    },
    {
      label: "Průměrné stáří aktivních nabídek",
      value:
        summary?.avg_listing_age_days === null ||
        summary?.avg_listing_age_days === undefined
          ? "Nedostatek dat"
          : formatDays(summary.avg_listing_age_days),
      icon: Clock,
    },
  ];

  return (
    <section>
      <div className="grid border-y border-dashed bg-accent/40 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="relative border-b border-dashed p-5 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2n)]:border-r lg:last:border-r-0"
            >
              <Icon className="absolute right-5 top-5 size-5 text-muted-foreground/45" />
              <div className="text-2xl font-semibold tracking-tight tabular-nums">
                {item.value}
              </div>
              <p className="mt-2 max-w-36 text-sm text-muted-foreground">
                {item.label}
              </p>
              {index === items.length - 1 ? null : (
                <span className="sr-only">,</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
