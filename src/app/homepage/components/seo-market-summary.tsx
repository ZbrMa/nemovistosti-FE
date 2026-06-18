import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MarketFacets } from "@/types/market";

import { formatCount } from "./home-formatters";

type SeoMarketSummaryProps = {
  facets: MarketFacets | null;
  ctaHref?: string;
  ctaLabel?: string;
};

export function SeoMarketSummary({
  facets,
  ctaHref = "/o-projektu",
  ctaLabel = "Více o projektu",
}: SeoMarketSummaryProps) {
  const regionCount = formatCount(facets?.regions?.length ?? 0);
  const districtCount = formatCount(facets?.districts.length);
  const cityCount = formatCount(facets?.cities.length);
  const hasLocationCounts =
    (facets?.regions?.length ?? 0) > 0 &&
    (facets?.districts.length ?? 0) > 0 &&
    (facets?.cities.length ?? 0) > 0;

  return (
    <section className="relative overflow-hidden px-8 py-12 md:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--muted) 1px, transparent 1px), linear-gradient(to bottom, var(--muted) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%), linear-gradient(to bottom, black 0%, black 58%, transparent 100%)",
          maskComposite: "intersect",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%), linear-gradient(to bottom, black 0%, black 58%, transparent 100%)",
          WebkitMaskComposite: "source-in",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-background/70"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4 px-5 text-center">
        <h2 className="mx-auto max-w-2xl text-xl font-bold tracking-tight text-foreground sm:text-3xl">
          Denně aktualizovaný přehled realitního trhu
        </h2>
        <div className="max-w-xl space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
          <p>
            Web sleduje agregovaná data realitního trhu a pomáhá porovnávat ceny
            za m², aktivitu nabídky a změny v čase napříč kraji, okresy a městy.
          </p>
          <p>
            Přehledy pokrývají byty, domy a pozemky, prodej i pronájem.{" "}
            {hasLocationCounts ? (
              <>
                Datová vrstva aktuálně rozlišuje{" "}
                <strong>{regionCount} krajů</strong>,{" "}
                <strong>{districtCount} okresů</strong> a{" "}
                <strong>{cityCount} měst</strong>.
              </>
            ) : (
              "Po připojení dat se zde zobrazí také rozsah sledovaných lokalit."
            )}
          </p>
        </div>
        <Link
          href={ctaHref}
          className={cn(buttonVariants({ variant: "primaryOutline" }))}
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
