import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const quickLinks = [
  { title: "Byty na prodej", href: "/prodej/byty" },
  { title: "Byty k pronájmu", href: "/pronajem/byty" },
  { title: "Domy na prodej", href: "/prodej/domy" },
  { title: "Pozemky na prodej", href: "/prodej/pozemky" },
  { title: "Seznam nabídek", href: "/nabidky" },
  { title: "Návratnost pronájmu", href: "/kalkulacky" },
] as const;

export function QuickMarketLinks() {
  return (
    <section className="space-y-4 py-8 sm:pb-12 sm:pt-0 sm:px-16">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Rychlý přehled</h2>
        <p className="text-muted-foreground">
          Nejčastější vstupy do tržních přehledů a analytických nástrojů.
        </p>
      </div>
      <div className="gap-3 flex flex-wrap">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-1 min-h-20 items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3 transition-colors hover:border-primary-500/40 hover:bg-muted/30"
          >
            <span className="text-sm font-medium text-foreground group-hover:text-primary-500">
              {item.title}
            </span>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary-500" />
          </Link>
        ))}
      </div>
    </section>
  );
}
