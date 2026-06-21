"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MarketHeatmapRegionRow } from "@/types/market";

import { formatCount, formatCurrency, formatPricePerM2 } from "./market-formatters";

type MarketRegionsTableProps = {
  rows: MarketHeatmapRegionRow[];
};

type SortKey =
  | "region"
  | "listings_count"
  | "new_listings_30d"
  | "discounted_listings_30d"
  | "avg_price"
  | "avg_price_per_m2";

type SortDirection = "asc" | "desc";

const columns: Array<{
  key: SortKey;
  label: string;
  align?: "left" | "right";
}> = [
  { key: "region", label: "Kraj", align: "left" },
  { key: "listings_count", label: "Aktivní nabídky", align: "right" },
  { key: "new_listings_30d", label: "Nové nabídky za 30 dní", align: "right" },
  { key: "discounted_listings_30d", label: "Zlevněné aktivní nabídky", align: "right" },
  { key: "avg_price", label: "Průměrná cena", align: "right" },
  { key: "avg_price_per_m2", label: "Cena za m²", align: "right" },
];

export function MarketRegionsTable({ rows }: MarketRegionsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("listings_count");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const result = compareValues(a[sortKey], b[sortKey]);

      return sortDirection === "asc" ? result : -result;
    });
  }, [rows, sortDirection, sortKey]);

  function updateSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === "region" ? "asc" : "desc");
  }

  return (
    <section className="pb-8 sm:pb-12">
      <div className="px-5 sm:px-16">
        <h2 className="text-xl font-semibold tracking-tight">
          Srovnání krajů
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Porovnání krajů podle objemu, aktivity a nabídkových cen.
        </p>
      </div>

      <div className="mt-6 border-y border-dashed">
        <Table containerClassName="max-h-[560px]">
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.align === "right" ? "text-right" : undefined}
                >
                  <SortButton
                    label={column.label}
                    active={sortKey === column.key}
                    direction={sortDirection}
                    align={column.align}
                    onClick={() => updateSort(column.key)}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.length > 0 ? (
              sortedRows.map((row) => (
                <TableRow key={row.region ?? "unknown"}>
                  <TableCell className="font-medium">
                    {row.region ?? "Bez kraje"}
                  </TableCell>
                  <NumberCell>{formatCount(row.listings_count)}</NumberCell>
                  <NumberCell>{formatCount(row.new_listings_30d)}</NumberCell>
                  <NumberCell>
                    {formatCount(row.discounted_listings_30d)}
                  </NumberCell>
                  <NumberCell>{formatCurrency(row.avg_price)}</NumberCell>
                  <NumberCell>{formatPricePerM2(row.avg_price_per_m2)}</NumberCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  Data pro vybrané filtry nejsou dostupná.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function SortButton({
  label,
  active,
  direction,
  align,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  align?: "left" | "right";
  onClick: () => void;
}) {
  const Icon = !active ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <Button
      type="button"
      variant="link"
      size="xs"
      className={
        align === "right"
          ? "ml-auto p-0 text-foreground no-underline hover:no-underline"
          : "p-0 text-foreground no-underline hover:no-underline"
      }
      onClick={onClick}
    >
      {label}
      <Icon className="ml-1 size-3.5 text-muted-foreground" />
    </Button>
  );
}

function NumberCell({ children }: { children: ReactNode }) {
  return (
    <TableCell className="text-right  tabular-nums">
      {children}
    </TableCell>
  );
}

function compareValues(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
) {
  if (typeof a === "string" || typeof b === "string") {
    return String(a ?? "").localeCompare(String(b ?? ""), "cs-CZ");
  }

  return (a ?? Number.NEGATIVE_INFINITY) - (b ?? Number.NEGATIVE_INFINITY);
}
