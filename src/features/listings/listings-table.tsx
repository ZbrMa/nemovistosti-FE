"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Download, Equal, ExternalLink, X } from "lucide-react";

import {
  DataTableCheckboxFilter,
  DataTableHeaderCell,
  DataTableNumberRangeFilter,
  type DataTableFilterOption,
} from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  getPropertyTypeBadgeClassName,
  getPropertyTypeLabel,
} from "@/lib/market-taxonomy";
import { cn } from "@/lib/utils";
import type { MarketFacets } from "@/types/market";
import type { ListingSearchRow, PriceChangeDirection } from "@/types/listings";
import type { ListingSearchFilter, ListingSearchInput } from "@/types/listings";

import { exportListingRows, getListingRows } from "@/app/nabidky/actions";
import {
  formatCurrency,
  formatPricePerM2,
} from "../market-overview/market-formatters";

type ListingsTableProps = {
  rows: ListingSearchRow[];
  totalCount: number;
  facets: MarketFacets | null;
  initialCriteria?: {
    region?: string;
    district?: string;
    offer_type?: string;
    property_type?: string;
    price_change_direction?: string;
  };
};

const PAGE_SIZE = 500;

type SortKey =
  | "region"
  | "district"
  | "city"
  | "property_type"
  | "offer_type"
  | "disposition"
  | "area_m2"
  | "latest_price"
  | "price_change_amount"
  | "price_change_percent"
  | "price_change_direction"
  | "latest_price_per_m2";

type SortDirection = "asc" | "desc";

type SortState = {
  key: SortKey;
  direction: SortDirection;
};

type PriceChangeSortPreset =
  | "discount_amount"
  | "increase_amount"
  | "discount_percent"
  | "increase_percent";

type PriceChangeFilterValue = "changed_down" | "changed_up" | "neutral";

type FilterState = {
  regions: string[];
  districts: string[];
  cities: string[];
  propertyTypes: string[];
  offerTypes: string[];
  dispositions: string[];
  areaMin: string;
  areaMax: string;
  priceMin: string;
  priceMax: string;
  priceChangeDirections: PriceChangeFilterValue[];
  pricePerM2Min: string;
  pricePerM2Max: string;
};

const PRICE_CHANGE_DIRECTION_OPTIONS: Array<{
  value: PriceChangeFilterValue;
  label: string;
}> = [
  { value: "changed_down", label: "Zlevněno" },
  { value: "changed_up", label: "Zdraženo" },
  { value: "neutral", label: "Beze změny" },
];

const PRICE_CHANGE_SORT_OPTIONS: Array<{
  value: PriceChangeSortPreset;
  label: string;
  sort: SortState;
}> = [
  {
    value: "discount_amount",
    label: "Největší zlevnění",
    sort: { key: "price_change_amount", direction: "asc" },
  },
  {
    value: "increase_amount",
    label: "Největší zdražení",
    sort: { key: "price_change_amount", direction: "desc" },
  },
  {
    value: "discount_percent",
    label: "Největší procentuální zlevnění",
    sort: { key: "price_change_percent", direction: "asc" },
  },
  {
    value: "increase_percent",
    label: "Největší procentuální zdražení",
    sort: { key: "price_change_percent", direction: "desc" },
  },
];

export function ListingsTable({
  rows,
  totalCount: initialTotalCount,
  facets,
  initialCriteria,
}: ListingsTableProps) {
  const [tableRows, setTableRows] = useState(rows);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [pageIndex, setPageIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);
  const filterOptions = useMemo(
    () => getFilterOptions(rows, facets),
    [facets, rows],
  );
  const initialFilters = useMemo(
    () => getInitialFilters(filterOptions, initialCriteria),
    [filterOptions, initialCriteria],
  );
  const [filters, setFilters] = useState<FilterState>(() => initialFilters);
  const [sort, setSort] = useState<SortState>({
    key: "latest_price",
    direction: "desc",
  });
  const activePriceChangeSortPreset = getPriceChangeSortPreset(sort);

  const hasActiveFilters = useMemo(
    () => hasFilters(filters, filterOptions),
    [filterOptions, filters],
  );
  const pageCount = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);
  const hasNextPage = pageIndex + 1 < pageCount;
  const pageStart = totalCount === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
  const pageEnd = Math.min((pageIndex + 1) * PAGE_SIZE, totalCount);

  function updateFilter<K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function fetchRows(
    nextFilters: FilterState,
    nextSort: SortState,
    nextPageIndex: number,
  ) {
    startTransition(async () => {
      const result = await getListingRows(
        getListingSearchInput(
          nextFilters,
          nextSort,
          nextPageIndex,
          filterOptions,
        ),
      );

      setTableRows(result.rows);
      setTotalCount(result.totalCount);
      setPageIndex(nextPageIndex);
    });
  }

  function resetFilters() {
    setFilters(initialFilters);
    fetchRows(initialFilters, sort, 0);
  }

  function handleSort(key: SortKey) {
    const nextSort: SortState =
      sort.key !== key
        ? { key, direction: getDefaultDirection(key) }
        : {
            key,
            direction: sort.direction === "asc" ? "desc" : "asc",
          };

    setSort(nextSort);
    fetchRows(filters, nextSort, 0);
  }

  function handlePriceChangeSortPreset(value: string | null) {
    if (!value) {
      return;
    }

    const option = PRICE_CHANGE_SORT_OPTIONS.find((item) => item.value === value);

    if (!option) {
      return;
    }

    setSort(option.sort);
    fetchRows(filters, option.sort, 0);
  }

  function applyFilterPatch(values: Partial<FilterState>) {
    const nextFilters = {
      ...filters,
      ...values,
    };

    setFilters(nextFilters);
    fetchRows(nextFilters, sort, 0);
  }

  function updatePage(nextPageIndex: number) {
    fetchRows(filters, sort, nextPageIndex);
  }

  async function handleExport() {
    setIsExporting(true);

    try {
      const exportRows = await exportListingRows(
        getListingSearchInput(filters, sort, 0, filterOptions, false),
      );

      exportRowsToCsv(exportRows);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-col gap-3 px-5 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight">
            Seznam nabídek
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kompletní výpis aktivních nabídek z procedury search_listings s
            lokálním filtrováním, řazením a exportem.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Select
            value={activePriceChangeSortPreset ?? ""}
            onValueChange={handlePriceChangeSortPreset}
          >
            <SelectTrigger size="sm" className="h-7">
              <SelectValue placeholder="Řazení změny ceny" />
            </SelectTrigger>
            <SelectContent align="end">
              {PRICE_CHANGE_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={resetFilters}
            >
              <X data-icon="inline-start" />
              Zrušit filtry
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleExport}
            disabled={isPending || isExporting || totalCount === 0}
          >
            <Download data-icon="inline-start" />
            {isExporting ? "Exportuji..." : "Export do Excelu"}
          </Button>
        </div>
      </div>

      <div
        className="flex min-h-0 flex-1 overflow-hidden border-y border-dashed"
        aria-busy={isPending}
      >
        <Table containerClassName="min-h-full flex-1 overflow-auto [scrollbar-gutter:stable]">
          <TableHeader>
            <TableRow className="border-b-0">
              <FilterHead
                label="Kraj"
                sortKey="region"
                sort={sort}
                selected={filters.regions}
                options={filterOptions.regionOptions}
                onSort={handleSort}
                onChange={(values) => updateFilter("regions", values)}
                onApply={() => fetchRows(filters, sort, 0)}
                onClear={() =>
                  applyFilterPatch({
                    regions: filterOptions.regionOptions.map(
                      (option) => option.value,
                    ),
                  })
                }
              />
              <FilterHead
                label="Okres"
                sortKey="district"
                sort={sort}
                selected={filters.districts}
                options={filterOptions.districtOptions}
                onSort={handleSort}
                onChange={(values) => updateFilter("districts", values)}
                onApply={() => fetchRows(filters, sort, 0)}
                onClear={() =>
                  applyFilterPatch({
                    districts: filterOptions.districtOptions.map(
                      (option) => option.value,
                    ),
                  })
                }
              />
              <FilterHead
                label="Město"
                sortKey="city"
                sort={sort}
                selected={filters.cities}
                options={filterOptions.cityOptions}
                onSort={handleSort}
                onChange={(values) => updateFilter("cities", values)}
                onApply={() => fetchRows(filters, sort, 0)}
                onClear={() =>
                  applyFilterPatch({
                    cities: filterOptions.cityOptions.map(
                      (option) => option.value,
                    ),
                  })
                }
              />
              <FilterHead
                label="Typ"
                sortKey="property_type"
                sort={sort}
                selected={filters.propertyTypes}
                options={filterOptions.propertyTypeOptions}
                onSort={handleSort}
                onChange={(values) => updateFilter("propertyTypes", values)}
                onApply={() => fetchRows(filters, sort, 0)}
                onClear={() =>
                  applyFilterPatch({
                    propertyTypes: filterOptions.propertyTypeOptions.map(
                      (option) => option.value,
                    ),
                  })
                }
              />
              <FilterHead
                label="Nabídka"
                sortKey="offer_type"
                sort={sort}
                selected={filters.offerTypes}
                options={filterOptions.offerTypeOptions}
                onSort={handleSort}
                onChange={(values) => updateFilter("offerTypes", values)}
                onApply={() => fetchRows(filters, sort, 0)}
                onClear={() =>
                  applyFilterPatch({
                    offerTypes: filterOptions.offerTypeOptions.map(
                      (option) => option.value,
                    ),
                  })
                }
              />
              <FilterHead
                label="Dispozice"
                sortKey="disposition"
                sort={sort}
                selected={filters.dispositions}
                options={filterOptions.dispositionOptions}
                onSort={handleSort}
                onChange={(values) => updateFilter("dispositions", values)}
                onApply={() => fetchRows(filters, sort, 0)}
                onClear={() =>
                  applyFilterPatch({
                    dispositions: filterOptions.dispositionOptions.map(
                      (option) => option.value,
                    ),
                  })
                }
              />
              <NumberHead
                label="Plocha"
                sortKey="area_m2"
                sort={sort}
                min={filters.areaMin}
                max={filters.areaMax}
                onSort={handleSort}
                onMinChange={(value) => updateFilter("areaMin", value)}
                onMaxChange={(value) => updateFilter("areaMax", value)}
                onApply={() => fetchRows(filters, sort, 0)}
                onClear={() => {
                  applyFilterPatch({ areaMin: "", areaMax: "" });
                }}
              />
              <NumberHead
                label="Cena"
                sortKey="latest_price"
                sort={sort}
                min={filters.priceMin}
                max={filters.priceMax}
                onSort={handleSort}
                onMinChange={(value) => updateFilter("priceMin", value)}
                onMaxChange={(value) => updateFilter("priceMax", value)}
                onApply={() => fetchRows(filters, sort, 0)}
                onClear={() => {
                  applyFilterPatch({ priceMin: "", priceMax: "" });
                }}
              />
              <NumberHead
                label="Kč/m²"
                sortKey="latest_price_per_m2"
                sort={sort}
                min={filters.pricePerM2Min}
                max={filters.pricePerM2Max}
                onSort={handleSort}
                onMinChange={(value) => updateFilter("pricePerM2Min", value)}
                onMaxChange={(value) => updateFilter("pricePerM2Max", value)}
                onApply={() => fetchRows(filters, sort, 0)}
                onClear={() => {
                  applyFilterPatch({ pricePerM2Min: "", pricePerM2Max: "" });
                }}
              />
              <FilterHead
                label="Změna"
                sortKey="price_change_amount"
                sort={sort}
                selected={filters.priceChangeDirections}
                options={PRICE_CHANGE_DIRECTION_OPTIONS}
                onSort={handleSort}
                onChange={(values) =>
                  updateFilter(
                    "priceChangeDirections",
                    values.filter(isPriceChangeFilterValue),
                  )
                }
                onApply={() => fetchRows(filters, sort, 0)}
                onClear={() =>
                  applyFilterPatch({
                    priceChangeDirections: PRICE_CHANGE_DIRECTION_OPTIONS.map(
                      (option) => option.value,
                    ),
                  })
                }
              />
              <TableHead className="w-10" aria-label="Odkaz" />
            </TableRow>
          </TableHeader>
          <TableBody
            className={cn(
              "transition-opacity",
              isPending && "animate-pulse opacity-50",
            )}
          >
            {tableRows.length > 0 ? (
              tableRows.map((row) => (
                <ListingRow key={row.listing_id} row={row} />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="h-[calc(100svh-22rem)] text-center text-muted-foreground"
                >
                  Data pro vybrané filtry nejsou dostupná.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex shrink-0 items-center justify-between px-5 text-sm text-muted-foreground lg:px-8">
        <span>
          {pageStart}–{pageEnd} z {formatInteger(totalCount)} záznamů
          {isPending ? " · načítám…" : null}
        </span>
        <div className="flex items-center gap-2">
          <ListingsPagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            isPending={isPending}
            hasNextPage={hasNextPage}
            onPageChange={updatePage}
          />
        </div>
      </div>
    </section>
  );
}

function ListingRow({ row }: { row: ListingSearchRow }) {
  return (
    <TableRow>
      <TableCell className="py-1">{formatNullable(row.region)}</TableCell>
      <TableCell className="py-1">{formatNullable(row.district)}</TableCell>
      <TableCell className="py-1">{formatNullable(row.city)}</TableCell>
      <TableCell className="py-1">
        <Badge
          variant="outline"
          className={getPropertyTypeBadgeClassName(row.property_type)}
        >
          {getPropertyTypeLabel(row.property_type)}
        </Badge>
      </TableCell>
      <TableCell className="py-1">
        {getOfferTypeLabel(row.offer_type)}
      </TableCell>
      <TableCell className="py-1">{formatNullable(row.disposition)}</TableCell>
      <NumberCell>{formatArea(row.area_m2)}</NumberCell>
      <NumberCell>{formatCurrency(row.latest_price)}</NumberCell>
      <NumberCell>{formatPricePerM2(row.latest_price_per_m2)}</NumberCell>
      <TableCell className="py-1">
        <PriceChangeBadge
          amount={row.price_change_amount}
          direction={row.price_change_direction}
          percent={row.price_change_percent}
          previousPrice={row.previous_price}
        />
      </TableCell>
      <TableCell className="text-right py-1">
        <Button
          variant="ghost"
          size="icon-xs"
          nativeButton={false}
          render={
            <a
              href={row.listing_url}
              target="_blank"
              rel="noreferrer"
              aria-label="Otevřít původní nabídku"
            />
          }
        >
          <ExternalLink className="size-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function NumberCell({ children }: { children: ReactNode }) {
  return <TableCell className="text-right py-1">{children}</TableCell>;
}

function PriceChangeBadge({
  amount,
  direction,
  percent,
  previousPrice,
}: {
  amount: number | null | undefined;
  direction: PriceChangeDirection | null | undefined;
  percent: number | null | undefined;
  previousPrice: number | null | undefined;
}) {
  const normalizedDirection = getDisplayPriceChangeDirection(
    direction,
    amount,
    percent,
    previousPrice,
  );

  if (normalizedDirection === "decreased") {
    return <ChevronDown className="text-primary" aria-label="Zlevněno" />;
  }

  if (normalizedDirection === "increased") {
    return <ChevronUp className="text-destructive" aria-label="Zdraženo" />;
  }

  return (
    <Equal
      className="text-muted"
      aria-label="Beze změny"
    />
  );
}

function ListingsPagination({
  pageIndex,
  pageCount,
  isPending,
  hasNextPage,
  onPageChange,
}: {
  pageIndex: number;
  pageCount: number;
  isPending: boolean;
  hasNextPage: boolean;
  onPageChange: (pageIndex: number) => void;
}) {
  const pageItems = getPaginationItems(pageIndex, pageCount);

  return (
    <Pagination className="mx-0 w-auto justify-end">
      <PaginationContent className="gap-1">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text=""
            size="icon-xs"
            aria-label="Předchozí stránka"
            aria-disabled={pageIndex === 0 || isPending}
            className={
              pageIndex === 0 || isPending
                ? "pointer-events-none border-border bg-background p-0! opacity-50 hover:bg-background"
                : "border-border bg-background p-0! hover:bg-accent hover:text-foreground"
            }
            onClick={(event) => {
              event.preventDefault();
              if (pageIndex > 0 && !isPending) {
                onPageChange(pageIndex - 1);
              }
            }}
          />
        </PaginationItem>
        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis className="size-6 text-muted-foreground [&_svg]:size-3" />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                size="icon-xs"
                isActive={item === pageIndex}
                className={
                  item === pageIndex
                    ? "border-border bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }
                onClick={(event) => {
                  event.preventDefault();
                  if (item !== pageIndex && !isPending) {
                    onPageChange(item);
                  }
                }}
              >
                {item + 1}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            text=""
            size="icon-xs"
            aria-label="Další stránka"
            aria-disabled={!hasNextPage || isPending}
            className={
              !hasNextPage || isPending
                ? "pointer-events-none border-border bg-background p-0! opacity-50 hover:bg-background"
                : "border-border bg-background p-0! hover:bg-accent hover:text-foreground"
            }
            onClick={(event) => {
              event.preventDefault();
              if (hasNextPage && !isPending) {
                onPageChange(pageIndex + 1);
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function FilterHead({
  label,
  sortKey,
  sort,
  selected,
  options,
  onSort,
  onChange,
  onApply,
  onClear,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  selected: string[];
  options: DataTableFilterOption[];
  onSort: (key: SortKey) => void;
  onChange: (values: string[]) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  const isFiltered = selected.length !== options.length;

  return (
    <TableHead>
      <DataTableHeaderCell
        label={label}
        sortKey={sortKey}
        sort={[sort]}
        isFiltered={isFiltered}
        filterCount={isFiltered ? selected.length : undefined}
        onSort={(key) => onSort(key as SortKey)}
      >
        <DataTableCheckboxFilter
          label={`Filtrovat ${label.toLowerCase()}`}
          values={selected}
          options={options}
          allValues={options.map((option) => option.value)}
          onChange={onChange}
          onApply={onApply}
          onClear={onClear}
        />
      </DataTableHeaderCell>
    </TableHead>
  );
}

function NumberHead({
  label,
  sortKey,
  sort,
  min,
  max,
  onSort,
  onMinChange,
  onMaxChange,
  onApply,
  onClear,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  min: string;
  max: string;
  onSort: (key: SortKey) => void;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  const isFiltered = min.trim().length > 0 || max.trim().length > 0;

  return (
    <TableHead className="text-right">
      <DataTableHeaderCell
        label={label}
        sortKey={sortKey}
        sort={[sort]}
        align="left"
        isFiltered={isFiltered}
        filterCount={isFiltered ? 1 : undefined}
        onSort={(key) => onSort(key as SortKey)}
      >
        <DataTableNumberRangeFilter
          label={`Filtrovat ${label.toLowerCase()}`}
          min={min}
          max={max}
          minPlaceholder="Min"
          maxPlaceholder="Max"
          onMinChange={onMinChange}
          onMaxChange={onMaxChange}
          onApply={onApply}
          onClear={onClear}
        />
      </DataTableHeaderCell>
    </TableHead>
  );
}

type FilterOptions = {
  regionOptions: DataTableFilterOption[];
  districtOptions: DataTableFilterOption[];
  cityOptions: DataTableFilterOption[];
  propertyTypeOptions: DataTableFilterOption[];
  offerTypeOptions: DataTableFilterOption[];
  dispositionOptions: DataTableFilterOption[];
};

function getFilterOptions(
  rows: ListingSearchRow[],
  facets: MarketFacets | null,
): FilterOptions {
  return {
    regionOptions: getFacetOptions(facets?.regions, () =>
      getOptions(rows, "region"),
    ),
    districtOptions: getFacetOptions(facets?.districts, () =>
      getOptions(rows, "district"),
    ),
    cityOptions: getFacetOptions(facets?.cities, () =>
      getOptions(rows, "city"),
    ),
    propertyTypeOptions: getFacetOptions(
      facets?.property_types,
      () => getOptions(rows, "property_type", getPropertyTypeLabel),
      getPropertyTypeLabel,
    ),
    offerTypeOptions: getFacetOptions(
      facets?.offer_types,
      () => getOptions(rows, "offer_type", getOfferTypeLabel),
      getOfferTypeLabel,
    ),
    dispositionOptions: getFacetOptions(facets?.dispositions, () =>
      getOptions(rows, "disposition"),
    ),
  };
}

function getInitialFilters(
  options: FilterOptions,
  initialCriteria?: ListingsTableProps["initialCriteria"],
): FilterState {
  return {
    regions: getInitialSelectedValues(
      options.regionOptions,
      initialCriteria?.region,
    ),
    districts: getInitialSelectedValues(
      options.districtOptions,
      initialCriteria?.district,
    ),
    cities: options.cityOptions.map((option) => option.value),
    propertyTypes: getInitialSelectedValues(
      options.propertyTypeOptions,
      initialCriteria?.property_type,
    ),
    offerTypes: getInitialSelectedValues(
      options.offerTypeOptions,
      initialCriteria?.offer_type,
    ),
    dispositions: options.dispositionOptions.map((option) => option.value),
    areaMin: "",
    areaMax: "",
    priceMin: "",
    priceMax: "",
    priceChangeDirections: getInitialPriceChangeFilters(
      initialCriteria?.price_change_direction,
    ),
    pricePerM2Min: "",
    pricePerM2Max: "",
  };
}

function getInitialSelectedValues(
  options: DataTableFilterOption[],
  preferredValue: string | undefined,
) {
  if (!preferredValue) {
    return options.map((option) => option.value);
  }

  const match = options.find((option) => option.value === preferredValue);

  return match ? [match.value] : options.map((option) => option.value);
}

function getInitialPriceChangeFilters(
  preferredValue: string | undefined,
): PriceChangeFilterValue[] {
  if (preferredValue === "decreased" || preferredValue === "changed_down") {
    return ["changed_down"];
  }

  if (preferredValue === "increased" || preferredValue === "changed_up") {
    return ["changed_up"];
  }

  if (
    preferredValue === "unchanged" ||
    preferredValue === "unknown" ||
    preferredValue === "neutral"
  ) {
    return ["neutral"];
  }

  return PRICE_CHANGE_DIRECTION_OPTIONS.map((option) => option.value);
}

function getListingSearchInput(
  filters: FilterState,
  sort: SortState,
  pageIndex: number,
  options: FilterOptions,
  includePagination = true,
): ListingSearchInput {
  const p_filters: ListingSearchFilter[] = [];

  addSelectionFilter(
    p_filters,
    "region",
    filters.regions,
    options.regionOptions,
  );
  addSelectionFilter(
    p_filters,
    "district",
    filters.districts,
    options.districtOptions,
  );
  addSelectionFilter(p_filters, "city", filters.cities, options.cityOptions);
  addSelectionFilter(
    p_filters,
    "property_type",
    filters.propertyTypes,
    options.propertyTypeOptions,
  );
  addSelectionFilter(
    p_filters,
    "offer_type",
    filters.offerTypes,
    options.offerTypeOptions,
  );
  addSelectionFilter(
    p_filters,
    "disposition",
    filters.dispositions,
    options.dispositionOptions,
  );
  addRangeFilters(p_filters, "area_m2", filters.areaMin, filters.areaMax);
  addRangeFilters(
    p_filters,
    "latest_price",
    filters.priceMin,
    filters.priceMax,
  );
  addRangeFilters(
    p_filters,
    "latest_price_per_m2",
    filters.pricePerM2Min,
    filters.pricePerM2Max,
  );
  addPriceChangeDirectionFilter(p_filters, filters.priceChangeDirections);

  const input: ListingSearchInput = {
    p_filters,
    p_sorts: [{ column: sort.key, dir: sort.direction, nulls: "last" }],
  };

  if (includePagination) {
    input.p_limit = PAGE_SIZE;
    input.p_offset = pageIndex * PAGE_SIZE;
  }

  return input;
}

function addSelectionFilter(
  filters: ListingSearchFilter[],
  column: ListingSearchFilter["column"],
  values: string[],
  options: DataTableFilterOption[],
) {
  if (values.length !== options.length) {
    filters.push({
      column,
      op: "in",
      value: values,
    });
  }
}

function addRangeFilters(
  filters: ListingSearchFilter[],
  column: ListingSearchFilter["column"],
  min: string,
  max: string,
) {
  const minValue = parseNumber(min);
  const maxValue = parseNumber(max);

  if (minValue !== null) {
    filters.push({
      column,
      op: "gte",
      value: minValue,
    });
  }

  if (maxValue !== null) {
    filters.push({
      column,
      op: "lte",
      value: maxValue,
    });
  }
}

function addPriceChangeDirectionFilter(
  filters: ListingSearchFilter[],
  values: PriceChangeFilterValue[],
) {
  if (values.length === PRICE_CHANGE_DIRECTION_OPTIONS.length) {
    return;
  }

  const rpcValues = values.flatMap(getPriceChangeFilterRpcValues);

  filters.push({
    column: "price_change_direction",
    op: "in",
    value: [...new Set(rpcValues)],
  });
}

function getPriceChangeFilterRpcValues(
  value: PriceChangeFilterValue,
): PriceChangeDirection[] {
  if (value === "changed_down") {
    return ["decreased"];
  }

  if (value === "changed_up") {
    return ["increased"];
  }

  return ["unchanged", "unknown"];
}

function getOptions(
  rows: ListingSearchRow[],
  key: keyof ListingSearchRow,
  getLabel: (value: string | null | undefined) => string = formatNullable,
) {
  const values = rows
    .map((row) => row[key])
    .filter((value): value is string => typeof value === "string");

  return [...new Set(values)]
    .sort((a, b) => getLabel(a).localeCompare(getLabel(b), "cs-CZ"))
    .map((value) => ({
      value,
      label: getLabel(value),
    }));
}

function getFacetOptions(
  values: string[] | undefined,
  getFallbackOptions: () => DataTableFilterOption[],
  getLabel: (value: string | null | undefined) => string = formatNullable,
) {
  if (!values?.length) {
    return getFallbackOptions();
  }

  return [...new Set(values)]
    .sort((a, b) => getLabel(a).localeCompare(getLabel(b), "cs-CZ"))
    .map((value) => ({
      value,
      label: getLabel(value),
    }));
}

function getPaginationItems(pageIndex: number, pageCount: number) {
  const pages = new Set<number>([
    0,
    pageCount - 1,
    pageIndex - 1,
    pageIndex,
    pageIndex + 1,
  ]);
  const validPages = [...pages]
    .filter((page) => page >= 0 && page < pageCount)
    .sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];

  validPages.forEach((page) => {
    const previous = items[items.length - 1];

    if (typeof previous === "number" && page - previous > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  });

  return items;
}

function hasFilters(filters: FilterState, options: FilterOptions) {
  return (
    filters.regions.length !== options.regionOptions.length ||
    filters.districts.length !== options.districtOptions.length ||
    filters.cities.length !== options.cityOptions.length ||
    filters.propertyTypes.length !== options.propertyTypeOptions.length ||
    filters.offerTypes.length !== options.offerTypeOptions.length ||
    filters.dispositions.length !== options.dispositionOptions.length ||
    filters.areaMin.trim().length > 0 ||
    filters.areaMax.trim().length > 0 ||
    filters.priceMin.trim().length > 0 ||
    filters.priceMax.trim().length > 0 ||
    filters.priceChangeDirections.length !==
      PRICE_CHANGE_DIRECTION_OPTIONS.length ||
    filters.pricePerM2Min.trim().length > 0 ||
    filters.pricePerM2Max.trim().length > 0
  );
}

function parseNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));

  return Number.isFinite(parsed) ? parsed : null;
}

function getDefaultDirection(key: SortKey): SortDirection {
  if (key === "price_change_amount" || key === "price_change_percent") {
    return "asc";
  }

  return isNumericSort(key) ? "desc" : "asc";
}

function getPriceChangeSortPreset(sort: SortState) {
  return (
    PRICE_CHANGE_SORT_OPTIONS.find(
      (option) =>
        option.sort.key === sort.key && option.sort.direction === sort.direction,
    )?.value ?? null
  );
}

function isNumericSort(key: SortKey) {
  return (
    key === "area_m2" ||
    key === "latest_price" ||
    key === "latest_price_per_m2" ||
    key === "price_change_amount" ||
    key === "price_change_percent"
  );
}

function formatNullable(value: string | null | undefined) {
  return value ?? "—";
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("cs-CZ").format(value);
}

function formatArea(value: number | null | undefined) {
  return typeof value === "number"
    ? `${new Intl.NumberFormat("cs-CZ").format(value)} m²`
    : "—";
}

function getDisplayPriceChangeDirection(
  direction: PriceChangeDirection | null | undefined,
  amount: number | null | undefined,
  percent: number | null | undefined,
  previousPrice: number | null | undefined,
): PriceChangeDirection {
  if (
    typeof previousPrice !== "number" ||
    previousPrice <= 0 ||
    (typeof amount !== "number" && typeof percent !== "number")
  ) {
    return "unknown";
  }

  return normalizePriceChangeDirection(direction);
}

function normalizePriceChangeDirection(
  value: string | null | undefined,
): PriceChangeDirection {
  if (
    value === "decreased" ||
    value === "increased" ||
    value === "unchanged" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function isPriceChangeFilterValue(
  value: string,
): value is PriceChangeFilterValue {
  return (
    value === "changed_down" || value === "changed_up" || value === "neutral"
  );
}

function getPriceChangeDirectionLabel(value: string | null | undefined) {
  const direction = normalizePriceChangeDirection(value);

  if (direction === "decreased") {
    return "Zlevněno";
  }

  if (direction === "increased") {
    return "Zdraženo";
  }

  return "Beze změny";
}

function escapeCsvValue(value: string | number | boolean | null) {
  const normalizedValue = value === null ? "" : String(value);

  return `"${normalizedValue.replace(/"/g, '""')}"`;
}

function exportRowsToCsv(rows: ListingSearchRow[]) {
  const headers = [
    "Kraj",
    "Okres",
    "Město",
    "Typ",
    "Nabídka",
    "Dispozice",
    "Plocha",
    "Cena",
    "Předchozí cena",
    "Změna ceny",
    "Změna ceny Kč",
    "Změna ceny %",
    "Cena za m2",
    "URL",
  ];
  const csvRows = rows.map((row) =>
    [
      row.region,
      row.district,
      row.city,
      getPropertyTypeLabel(row.property_type),
      getOfferTypeLabel(row.offer_type),
      row.disposition,
      row.area_m2,
      row.latest_price,
      row.previous_price,
      getPriceChangeDirectionLabel(row.price_change_direction),
      row.price_change_amount,
      row.price_change_percent,
      row.latest_price_per_m2,
      row.listing_url,
    ]
      .map(escapeCsvValue)
      .join(";"),
  );
  const csv = `\uFEFF${[headers.map(escapeCsvValue).join(";"), ...csvRows].join(
    "\r\n",
  )}`;
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "nabidky.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
