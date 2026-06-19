import { Activity, ArrowDownRight, ArrowRight, Banknote, Home, Percent, Scale } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MarketActivitySummary, MarketOverview } from "@/types/market";

import { formatCount, formatCurrency, formatPricePerM2 } from "./home-formatters";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

type MarketKpiSectionProps = {
  sellOverview: MarketOverview | null;
  rentOverview: MarketOverview | null;
  sellActivitySummary: MarketActivitySummary | null;
  rentActivitySummary: MarketActivitySummary | null;
};

type KpiItem = {
  label: string;
  value: string | null;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

type KpiGroup = {
  title: string;
  description: string;
  overview: MarketOverview | null;
  activitySummary: MarketActivitySummary | null;
};

function getKpiItems(
  overview: MarketOverview | null,
  activitySummary: MarketActivitySummary | null,
): KpiItem[] {
  return [
    {
      label: "Aktivní nabídky na trhu",
      value: formatCount(activitySummary?.active_listings),
      description: "Aktuální agregovaný objem nabídek",
      icon: Home,
    },
    {
      label: "Průměrná nabídková cena",
      value: formatCurrency(overview?.avg_price),
      description: "Průměr napříč sledovanými segmenty",
      icon: Banknote,
    },
    {
      label: "Mediánová nabídková cena",
      value: formatCurrency(overview?.median_price),
      description: "Středová hodnota nabídkových cen",
      icon: Scale,
    },
    {
      label: "Průměrná cena za m²",
      value: formatPricePerM2(overview?.avg_price_per_m2),
      description: "Srovnatelná metrika mezi lokalitami",
      icon: Percent,
    },
    {
      label: "Nové nabídky za 30 dní",
      value: formatCount(activitySummary?.new_listings_30d),
      description: "Nově zachycené nabídky za poslední měsíc",
      icon: Activity,
    },
    {
      label: "Zlevněné aktivní nabídky",
      value: formatCount(activitySummary?.discounted_listings_30d),
      description: "Nabídky se změnou ceny směrem dolů",
      icon: ArrowDownRight,
    },
  ];
}

function KpiGroupBlock({ group }: { group: KpiGroup }) {
  const items = getKpiItems(group.overview, group.activitySummary);

  return (
    <div className="space-y-4">
      <div className="px-5 sm:px-8 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
        <h2 className="text-xl font-bold tracking-tight">{group.title}</h2>
        <p className="mt-1 text-sm lg:text-base text-muted-foreground">{group.description}</p>
        </div>
          <Link href={group.title === "Prodej" ? "/prodej" : "/pronajem"} className={cn(buttonVariants({ variant: "primaryOutline", size:"xs" }),"group w-fit")}>
            {group.title === "Prodej" ? "Analýzy prodeje" : "Analýzy pronájmu"}
            <ArrowRight className="group-hover:translate-x-1 transition-transform duration-150"/>
          </Link>
      </div>
      <div className="grid border-y border-dashed bg-background sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={cn(
                "relative bg-accent/50 border-b border-dashed p-5 last:border-b-0 sm:border-r sm:p-8 sm:[&:nth-child(2n)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:px-8 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-last-child(-n+3)]:border-b-0",
                index % 2 === 0 ? "sm:pl-8" : "sm:pr-8",
                index % 3 === 0 && "lg:pl-8",
                index % 3 === 2 && "lg:pr-8",
              )}
            >
              <Icon className="size-10 text-border/50 absolute right-5 top-5" />
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                
              
              <div className="mt-2 text-2xl font-semibold tracking-tight">
                {item.value ?? "—"}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MarketKpiSection({
  rentActivitySummary,
  rentOverview,
  sellActivitySummary,
  sellOverview,
}: MarketKpiSectionProps) {
  const groups: KpiGroup[] = [
    {
      title: "Prodej",
      description: "Nabídkové ceny a aktivita trhu u prodejních nabídek.",
      overview: sellOverview,
      activitySummary: sellActivitySummary,
    },
    {
      title: "Pronájem",
      description: "Nabídkové ceny a aktivita trhu u nájemních nabídek.",
      overview: rentOverview,
      activitySummary: rentActivitySummary,
    },
  ];

  return (
    <section className="space-y-12">
      {groups.map((group) => (
        <KpiGroupBlock key={group.title} group={group} />
      ))}
    </section>
  );
}
