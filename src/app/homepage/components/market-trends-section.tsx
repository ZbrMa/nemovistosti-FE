import type { MarketTimeseriesPoint } from "@/types/market";

import { MarketTrendChart } from "./market-trend-chart";

type MarketTrendsSectionProps = {
  points: MarketTimeseriesPoint[];
};

export function MarketTrendsSection({ points }: MarketTrendsSectionProps) {
  const hasChartData = points.some(
    (point) => point.avg_price_per_m2 !== null || point.median_price_per_m2 !== null,
  );

  return (
    <section className="space-y-4 py-8 sm:pb-12 sm:pt-0 sm:px-16 sm:px-16 border-b border-dashed">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Vývoj cen za m²</h2>
        <p className="mt-1 text-muted-foreground">
          Měsíční trend průměrné a mediánové nabídkové ceny za m².
        </p>
      </div>
      <div className="rounded-lg border bg-card p-5 sm:p-6">
        {hasChartData ? (
          <MarketTrendChart points={points} />
        ) : (
          <div className="flex h-72 items-center justify-center border border-dashed text-sm text-muted-foreground">
            Historický graf bude dostupný po načtení časové řady.
          </div>
        )}
      </div>
    </section>
  );
}
