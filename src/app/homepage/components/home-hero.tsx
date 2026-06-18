import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HomeHeroProps = {
  hasDataError: boolean;
};

export function HomeHero({ hasDataError }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden border-x border-dashed border-border">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
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
      <div className="pointer-events-none absolute inset-0 bg-background/70" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-4 text-center py-12 md:py-24">
        <div className="space-y-3">
          <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Vývoj cen nemovitostí v Česku
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Denně aktualizovaný přehled nabídkových cen bytů, domů a pozemků
            podle měst, okresů a typu nabídky.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Link href="/prodej" className={cn(buttonVariants({ variant: "primaryOutline"}))}>
            Trh aktuálně
            <ArrowRight />
          </Link>
          <Link
            href="/nabidky"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Seznam nabídek
          </Link>
        </div>
        {hasDataError ? (
          <p className="max-w-2xl text-sm text-muted-foreground">
            Některé tržní statistiky nejsou momentálně dostupné. Zobrazené
            sekce se doplní po úspěšném načtení dat.
          </p>
        ) : null}
      </div>
    </section>
  );
}
