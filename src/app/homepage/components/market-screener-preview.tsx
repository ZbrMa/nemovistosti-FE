import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getOfferTypeLabel,
  getPropertyTypeLabel,
} from "@/lib/market-taxonomy";
import { cn } from "@/lib/utils";
import type { MarketScreenerRow } from "@/types/market";

import { formatCount, formatPricePerM2 } from "./home-formatters";

type MarketScreenerPreviewProps = {
  rows: MarketScreenerRow[];
};

function formatNullable(value: string | null | undefined) {
  return value ?? "—";
}

export function MarketScreenerPreview({ rows }: MarketScreenerPreviewProps) {
  return (
    <section className="space-y-4 border-b border-dashed py-8 sm:pb-12 sm:pt-0 sm:px-16 sm:px-16">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Market screener</h2>
          <p className="mt-1 text-muted-foreground">
            Náhled agregovaných segmentů trhu bez jednotlivých inzerátů.
          </p>
        </div>
        <Link
          href="/prodej"
          className={cn(
            buttonVariants({ variant: "primaryOutline", size: "sm" }),
            "ml-auto bg-primary-300",
          )}
        >
          Otevřít celý screener
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        {rows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kraj</TableHead>
                <TableHead>Okres</TableHead>
                <TableHead>Město</TableHead>
                <TableHead>Typ nemovitosti</TableHead>
                <TableHead>Nabídka</TableHead>
                <TableHead>Dispozice</TableHead>
                <TableHead className="text-right">Aktivní nabídky</TableHead>
                <TableHead className="text-right">Medián Kč/m²</TableHead>
                <TableHead className="text-right">Průměr Kč/m²</TableHead>
                <TableHead className="text-right">Nové nabídky za 30 dní</TableHead>
                <TableHead className="text-right">Zlevněné aktivní nabídky</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow
                  key={[
                    row.region,
                    row.district,
                    row.city,
                    row.property_type,
                    row.offer_type,
                    row.disposition,
                    index,
                  ].join("-")}
                >
                  <TableCell>{formatNullable(row.region)}</TableCell>
                  <TableCell>{formatNullable(row.district)}</TableCell>
                  <TableCell>{formatNullable(row.city)}</TableCell>
                  <TableCell>{getPropertyTypeLabel(row.property_type)}</TableCell>
                  <TableCell>{getOfferTypeLabel(row.offer_type)}</TableCell>
                  <TableCell>{formatNullable(row.disposition)}</TableCell>
                  <TableCell className="text-right">
                    {formatCount(row.listings_count)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPricePerM2(row.median_price_per_m2) ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPricePerM2(row.avg_price_per_m2) ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCount(row.new_listings_30d)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCount(row.discounted_listings_30d)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex min-h-48 items-center justify-center p-6 text-sm text-muted-foreground">
            Agregovaná data pro screener zatím nejsou dostupná.
          </div>
        )}
      </div>
    </section>
  );
}
