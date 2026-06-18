"use client";

import {
  formatCurrency,
  formatPercent,
  formatYears,
} from "./rental-yield-formatters";
import { Skeleton } from "@/components/ui/skeleton";

type RentalYieldMetricsProps = {
  annualRent: number | null;
  grossYieldPercent: number | null;
  netYieldPercent: number | null;
  paybackYears: number | null;
  isLoading?: boolean;
};

function MetricBlock({
  label,
  value,
  description,
  isLoading,
}: {
  label: string;
  value: string;
  description: string;
  isLoading?: boolean;
}) {
  return (
    <div className="border-b border-dashed p-5 last:border-b-0 sm:p-6">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {isLoading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      ) : (
        <>
          <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </>
      )}
    </div>
  );
}

export function RentalYieldMetrics({
  annualRent,
  grossYieldPercent,
  netYieldPercent,
  paybackYears,
  isLoading,
}: RentalYieldMetricsProps) {
  return (
    <section className="bg-accent/50">
      <MetricBlock
        label="Roční nájem"
        value={formatCurrency(annualRent)}
        description="Měsíční nájem vynásobený dvanácti měsíci."
        isLoading={isLoading}
      />
      <MetricBlock
        label="Hrubá návratnost"
        value={formatPercent(grossYieldPercent)}
        description="Roční nájem vůči kupní ceně před náklady."
        isLoading={isLoading}
      />
      <MetricBlock
        label="Čistá návratnost"
        value={formatPercent(netYieldPercent)}
        description="Roční nájem po odečtení provozních nákladů."
        isLoading={isLoading}
      />
      <MetricBlock
        label="Doba návratnosti"
        value={formatYears(paybackYears)}
        description="Kupní cena dělená čistým ročním nájmem."
        isLoading={isLoading}
      />
    </section>
  );
}
