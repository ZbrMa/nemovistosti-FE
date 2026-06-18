"use client";

import { memo, useCallback, useMemo, useState, useTransition } from "react";

import {
  DataTableCheckboxFilter,
  DataTableHeaderCell,
  DataTableNumberRangeFilter,
  type DataTableFilterOption,
} from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getPropertyTypeBadgeClassName,
  getPropertyTypeLabel,
} from "@/lib/market-taxonomy";
import type { MarketYieldsInput } from "@/types/market";
import { Download, X } from "lucide-react";

import { getRentalYieldRows } from "../actions";
import type { RentalYieldTableRow } from "../rental-yield-utils";
import {
  formatCurrency,
  formatDecimal,
  formatNullable,
} from "./rental-yield-formatters";

type RentalYieldTableProps = {
  rows: RentalYieldTableRow[];
};

type SortKey =
  | "region"
  | "district"
  | "property_type"
  | "disposition"
  | "avg_purchase_price"
  | "avg_monthly_rent"
  | "payback_years_decimal";

type SortDirection = "asc" | "desc";

type SortState = {
  key: SortKey;
  direction: SortDirection;
};

type FilterState = {
  regions: string[];
  districts: string[];
  propertyTypes: string[];
  dispositions: string[];
  purchasePriceMin: string;
  purchasePriceMax: string;
  rentPriceMin: string;
  rentPriceMax: string;
  paybackYearsMin: string;
  paybackYearsMax: string;
};

type FilterKey = keyof FilterState;

type FilterOptions = {
  regionOptions: DataTableFilterOption[];
  districtOptions: DataTableFilterOption[];
  propertyTypeOptions: DataTableFilterOption[];
  dispositionOptions: DataTableFilterOption[];
};

const propertyTypeOptions: DataTableFilterOption[] = [
  { value: "flat", label: "Byt" },
  { value: "house", label: "Dům" },
  { value: "land", label: "Pozemek" },
  { value: "commercial", label: "Komerční" },
  { value: "other", label: "Ostatní" },
];

function YieldTableColumns() {
  return (
    <colgroup>
      <col className="w-[16%]" />
      <col className="w-[16%]" />
      <col className="w-[10%]" />
      <col className="w-[10%]" />
      <col className="w-[17%]" />
      <col className="w-[16%]" />
      <col className="w-[15%]" />
    </colgroup>
  );
}

function isString(value: string | null): value is string {
  return value !== null;
}

function getOptions(
  rows: RentalYieldTableRow[],
  key: "region" | "district" | "disposition",
): DataTableFilterOption[] {
  const collator = new Intl.Collator("cs-CZ");

  return [...new Set(rows.map((row) => row[key]).filter(isString))]
    .sort(collator.compare)
    .map((value) => ({
      value,
      label: value,
    }));
}

function getInitialFilters({
  regionOptions,
  districtOptions,
  propertyTypeOptions,
  dispositionOptions,
}: FilterOptions): FilterState {
  return {
    regions: regionOptions.map((option) => option.value),
    districts: districtOptions.map((option) => option.value),
    propertyTypes: propertyTypeOptions.map((option) => option.value),
    dispositions: dispositionOptions.map((option) => option.value),
    purchasePriceMin: "",
    purchasePriceMax: "",
    rentPriceMin: "",
    rentPriceMax: "",
    paybackYearsMin: "",
    paybackYearsMax: "",
  };
}

function parseNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));

  return Number.isFinite(parsed) ? parsed : null;
}

function getArrayFilterInput(
  values: string[],
  options: DataTableFilterOption[],
) {
  if (values.length === options.length) {
    return null;
  }

  return values.length === 0 ? ["__none__"] : values;
}

function getFilterInput(
  filters: FilterState,
  options: FilterOptions,
): MarketYieldsInput {
  return {
    p_regions: getArrayFilterInput(filters.regions, options.regionOptions),
    p_districts: getArrayFilterInput(filters.districts, options.districtOptions),
    p_property_types: getArrayFilterInput(
      filters.propertyTypes,
      options.propertyTypeOptions,
    ),
    p_dispositions: getArrayFilterInput(
      filters.dispositions,
      options.dispositionOptions,
    ),
    p_purchase_price_min: parseNumber(filters.purchasePriceMin),
    p_purchase_price_max: parseNumber(filters.purchasePriceMax),
    p_rent_price_min: parseNumber(filters.rentPriceMin),
    p_rent_price_max: parseNumber(filters.rentPriceMax),
    p_payback_years_min: parseNumber(filters.paybackYearsMin),
    p_payback_years_max: parseNumber(filters.paybackYearsMax),
  };
}

function compareNullable(
  a: string | number | null,
  b: string | number | null,
  direction: SortDirection,
) {
  if (a === null && b === null) {
    return 0;
  }

  if (a === null) {
    return 1;
  }

  if (b === null) {
    return -1;
  }

  const result =
    typeof a === "number" && typeof b === "number"
      ? a - b
      : String(a).localeCompare(String(b), "cs-CZ");

  return direction === "asc" ? result : -result;
}

function compareRows(
  a: RentalYieldTableRow,
  b: RentalYieldTableRow,
  sort: SortState[],
) {
  for (const sortItem of sort) {
    const result = compareNullable(
      a[sortItem.key],
      b[sortItem.key],
      sortItem.direction,
    );

    if (result !== 0) {
      return result;
    }
  }

  return 0;
}

function isCheckboxFilterActive(
  values: string[],
  options: DataTableFilterOption[],
) {
  return values.length !== options.length;
}

function isRangeFilterActive(min: string, max: string) {
  return min.trim().length > 0 || max.trim().length > 0;
}

function getCheckboxFilterCount(
  values: string[],
  options: DataTableFilterOption[],
) {
  return isCheckboxFilterActive(values, options) ? values.length : undefined;
}

function getRangeFilterCount(min: string, max: string) {
  const count = Number(min.trim().length > 0) + Number(max.trim().length > 0);

  return count > 0 ? count : undefined;
}

function hasActiveFilters(filters: FilterState, options: FilterOptions) {
  return (
    isCheckboxFilterActive(filters.regions, options.regionOptions) ||
    isCheckboxFilterActive(filters.districts, options.districtOptions) ||
    isCheckboxFilterActive(
      filters.propertyTypes,
      options.propertyTypeOptions,
    ) ||
    isCheckboxFilterActive(filters.dispositions, options.dispositionOptions) ||
    isRangeFilterActive(filters.purchasePriceMin, filters.purchasePriceMax) ||
    isRangeFilterActive(filters.rentPriceMin, filters.rentPriceMax) ||
    isRangeFilterActive(filters.paybackYearsMin, filters.paybackYearsMax)
  );
}

function isArrayFilterMatch(
  value: string | null,
  selectedValues: string[],
  options: DataTableFilterOption[],
) {
  if (selectedValues.length === options.length) {
    return true;
  }

  if (selectedValues.length === 0 || value === null) {
    return false;
  }

  return selectedValues.includes(value);
}

function isNumberFilterMatch(value: number | null, min: string, max: string) {
  const minValue = parseNumber(min);
  const maxValue = parseNumber(max);

  if (value === null) {
    return minValue === null && maxValue === null;
  }

  return (
    (minValue === null || value >= minValue) &&
    (maxValue === null || value <= maxValue)
  );
}

function isRowMatchForFacets(
  row: RentalYieldTableRow,
  filters: FilterState,
  options: FilterOptions,
  excludedKeys: FilterKey[],
) {
  const excluded = new Set<FilterKey>(excludedKeys);

  return (
    (excluded.has("regions") ||
      isArrayFilterMatch(row.region, filters.regions, options.regionOptions)) &&
    (excluded.has("districts") ||
      isArrayFilterMatch(
        row.district,
        filters.districts,
        options.districtOptions,
      )) &&
    (excluded.has("propertyTypes") ||
      isArrayFilterMatch(
        row.property_type,
        filters.propertyTypes,
        options.propertyTypeOptions,
      )) &&
    (excluded.has("dispositions") ||
      isArrayFilterMatch(
        row.disposition,
        filters.dispositions,
        options.dispositionOptions,
      )) &&
    (excluded.has("purchasePriceMin") ||
      excluded.has("purchasePriceMax") ||
      isNumberFilterMatch(
        row.avg_purchase_price,
        filters.purchasePriceMin,
        filters.purchasePriceMax,
      )) &&
    (excluded.has("rentPriceMin") ||
      excluded.has("rentPriceMax") ||
      isNumberFilterMatch(
        row.avg_monthly_rent,
        filters.rentPriceMin,
        filters.rentPriceMax,
      )) &&
    (excluded.has("paybackYearsMin") ||
      excluded.has("paybackYearsMax") ||
      isNumberFilterMatch(
        row.payback_years_decimal,
        filters.paybackYearsMin,
        filters.paybackYearsMax,
      ))
  );
}

function getPropertyTypeOptions(rows: RentalYieldTableRow[]) {
  const availableValues = new Set(rows.map((row) => row.property_type));

  return propertyTypeOptions.filter((option) =>
    availableValues.has(option.value),
  );
}

function getFacetedOptions(
  rows: RentalYieldTableRow[],
  filters: FilterState,
  allOptions: FilterOptions,
): FilterOptions {
  return {
    regionOptions: getOptions(
      rows.filter((row) =>
        isRowMatchForFacets(row, filters, allOptions, ["regions"]),
      ),
      "region",
    ),
    districtOptions: getOptions(
      rows.filter((row) =>
        isRowMatchForFacets(row, filters, allOptions, ["districts"]),
      ),
      "district",
    ),
    propertyTypeOptions: getPropertyTypeOptions(
      rows.filter((row) =>
        isRowMatchForFacets(row, filters, allOptions, ["propertyTypes"]),
      ),
    ),
    dispositionOptions: getOptions(
      rows.filter((row) =>
        isRowMatchForFacets(row, filters, allOptions, ["dispositions"]),
      ),
      "disposition",
    ),
  };
}

type YieldTableHeaderProps = {
  filters: FilterState;
  filterOptions: FilterOptions;
  allFilterOptions: FilterOptions;
  sort: SortState[];
  onSort: (key: string) => void;
  onFilterChange: (key: FilterKey, value: FilterState[FilterKey]) => void;
  onApplyFilters: () => void;
  onApplyFilterPatch: (values: Partial<FilterState>) => void;
};

const YieldTableHeader = memo(function YieldTableHeader({
  filters,
  filterOptions,
  allFilterOptions,
  sort,
  onSort,
  onFilterChange,
  onApplyFilters,
  onApplyFilterPatch,
}: YieldTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>
          <DataTableHeaderCell
            label="Kraj"
            sortKey="region"
            sort={sort}
            isFiltered={isCheckboxFilterActive(
              filters.regions,
              allFilterOptions.regionOptions,
            )}
            filterCount={getCheckboxFilterCount(
              filters.regions,
              allFilterOptions.regionOptions,
            )}
            onSort={onSort}
          >
            <DataTableCheckboxFilter
              label="Filtrovat kraj"
              values={filters.regions}
              options={filterOptions.regionOptions}
              allValues={allFilterOptions.regionOptions.map(
                (option) => option.value,
              )}
              onChange={(values) => onFilterChange("regions", values)}
              onApply={onApplyFilters}
              onClear={() =>
                onApplyFilterPatch({
                  regions: allFilterOptions.regionOptions.map(
                    (option) => option.value,
                  ),
                })
              }
            />
          </DataTableHeaderCell>
        </TableHead>
        <TableHead>
          <DataTableHeaderCell
            label="Okres"
            sortKey="district"
            sort={sort}
            isFiltered={isCheckboxFilterActive(
              filters.districts,
              allFilterOptions.districtOptions,
            )}
            filterCount={getCheckboxFilterCount(
              filters.districts,
              allFilterOptions.districtOptions,
            )}
            onSort={onSort}
          >
            <DataTableCheckboxFilter
              label="Filtrovat okres"
              values={filters.districts}
              options={filterOptions.districtOptions}
              allValues={allFilterOptions.districtOptions.map(
                (option) => option.value,
              )}
              onChange={(values) => onFilterChange("districts", values)}
              onApply={onApplyFilters}
              onClear={() =>
                onApplyFilterPatch({
                  districts: allFilterOptions.districtOptions.map(
                    (option) => option.value,
                  ),
                })
              }
            />
          </DataTableHeaderCell>
        </TableHead>
        <TableHead>
          <DataTableHeaderCell
            label="Typ"
            sortKey="property_type"
            sort={sort}
            isFiltered={isCheckboxFilterActive(
              filters.propertyTypes,
              allFilterOptions.propertyTypeOptions,
            )}
            filterCount={getCheckboxFilterCount(
              filters.propertyTypes,
              allFilterOptions.propertyTypeOptions,
            )}
            onSort={onSort}
          >
            <DataTableCheckboxFilter
              label="Filtrovat typ"
              values={filters.propertyTypes}
              options={filterOptions.propertyTypeOptions}
              allValues={allFilterOptions.propertyTypeOptions.map(
                (option) => option.value,
              )}
              onChange={(values) => onFilterChange("propertyTypes", values)}
              onApply={onApplyFilters}
              onClear={() =>
                onApplyFilterPatch({
                  propertyTypes: allFilterOptions.propertyTypeOptions.map(
                    (option) => option.value,
                  ),
                })
              }
            />
          </DataTableHeaderCell>
        </TableHead>
        <TableHead>
          <DataTableHeaderCell
            label="Dispozice"
            sortKey="disposition"
            sort={sort}
            isFiltered={isCheckboxFilterActive(
              filters.dispositions,
              allFilterOptions.dispositionOptions,
            )}
            filterCount={getCheckboxFilterCount(
              filters.dispositions,
              allFilterOptions.dispositionOptions,
            )}
            onSort={onSort}
          >
            <DataTableCheckboxFilter
              label="Filtrovat dispozici"
              values={filters.dispositions}
              options={filterOptions.dispositionOptions}
              allValues={allFilterOptions.dispositionOptions.map(
                (option) => option.value,
              )}
              onChange={(values) => onFilterChange("dispositions", values)}
              onApply={onApplyFilters}
              onClear={() =>
                onApplyFilterPatch({
                  dispositions: allFilterOptions.dispositionOptions.map(
                    (option) => option.value,
                  ),
                })
              }
            />
          </DataTableHeaderCell>
        </TableHead>
        <TableHead className="text-right">
          <DataTableHeaderCell
            label="Průměrná cena"
            sortKey="avg_purchase_price"
            sort={sort}
            align="right"
            isFiltered={isRangeFilterActive(
              filters.purchasePriceMin,
              filters.purchasePriceMax,
            )}
            filterCount={getRangeFilterCount(
              filters.purchasePriceMin,
              filters.purchasePriceMax,
            )}
            onSort={onSort}
          >
            <DataTableNumberRangeFilter
              label="Kupní cena"
              min={filters.purchasePriceMin}
              max={filters.purchasePriceMax}
              minPlaceholder="Min"
              maxPlaceholder="Max"
              onMinChange={(value) => onFilterChange("purchasePriceMin", value)}
              onMaxChange={(value) => onFilterChange("purchasePriceMax", value)}
              onApply={onApplyFilters}
              onClear={() =>
                onApplyFilterPatch({
                  purchasePriceMin: "",
                  purchasePriceMax: "",
                })
              }
            />
          </DataTableHeaderCell>
        </TableHead>
        <TableHead className="text-right">
          <DataTableHeaderCell
            label="Průměrný nájem"
            sortKey="avg_monthly_rent"
            sort={sort}
            align="right"
            isFiltered={isRangeFilterActive(
              filters.rentPriceMin,
              filters.rentPriceMax,
            )}
            filterCount={getRangeFilterCount(
              filters.rentPriceMin,
              filters.rentPriceMax,
            )}
            onSort={onSort}
          >
            <DataTableNumberRangeFilter
              label="Měsíční nájem"
              min={filters.rentPriceMin}
              max={filters.rentPriceMax}
              minPlaceholder="Min"
              maxPlaceholder="Max"
              onMinChange={(value) => onFilterChange("rentPriceMin", value)}
              onMaxChange={(value) => onFilterChange("rentPriceMax", value)}
              onApply={onApplyFilters}
              onClear={() =>
                onApplyFilterPatch({
                  rentPriceMin: "",
                  rentPriceMax: "",
                })
              }
            />
          </DataTableHeaderCell>
        </TableHead>
        <TableHead className="text-right">
          <DataTableHeaderCell
            label="Návratnost"
            sortKey="payback_years_decimal"
            sort={sort}
            align="right"
            isFiltered={isRangeFilterActive(
              filters.paybackYearsMin,
              filters.paybackYearsMax,
            )}
            filterCount={getRangeFilterCount(
              filters.paybackYearsMin,
              filters.paybackYearsMax,
            )}
            onSort={onSort}
          >
            <DataTableNumberRangeFilter
              label="Návratnost v letech"
              min={filters.paybackYearsMin}
              max={filters.paybackYearsMax}
              minPlaceholder="Min"
              maxPlaceholder="Max"
              onMinChange={(value) => onFilterChange("paybackYearsMin", value)}
              onMaxChange={(value) => onFilterChange("paybackYearsMax", value)}
              onApply={onApplyFilters}
              onClear={() =>
                onApplyFilterPatch({
                  paybackYearsMin: "",
                  paybackYearsMax: "",
                })
              }
            />
          </DataTableHeaderCell>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
});

type YieldTableBodyProps = {
  rows: RentalYieldTableRow[];
  isPending: boolean;
};

const YieldTableBody = memo(function YieldTableBody({
  rows,
  isPending,
}: YieldTableBodyProps) {
  return (
    <TooltipProvider>
      <TableBody className={isPending ? "opacity-50 animate-pulse" : undefined}>
        {rows.map((row) => (
          <YieldTableRow
            key={`${row.region}-${row.district}-${row.property_type}-${row.disposition}`}
            row={row}
          />
        ))}
      </TableBody>
    </TooltipProvider>
  );
});

type YieldTableToolbarProps = {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onExport: () => void;
};

const YieldTableToolbar = memo(function YieldTableToolbar({
  hasActiveFilters,
  onResetFilters,
  onExport,
}: YieldTableToolbarProps) {
  return (
    <div className="flex items-center justify-end gap-2 border-b px-3 py-2">
      {hasActiveFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onResetFilters}
        >
          <X data-icon="inline-start" />
          Zrušit filtry
        </Button>
      ) : null}
      <Button type="button" variant="outline" size="xs" onClick={onExport}>
        <Download data-icon="inline-start" />
        Export do Excelu
      </Button>
    </div>
  );
});

type YieldTableRowProps = {
  row: RentalYieldTableRow;
};

const YieldTableRow = memo(function YieldTableRow({ row }: YieldTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{formatNullable(row.region)}</TableCell>
      <TableCell>{formatNullable(row.district)}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={getPropertyTypeBadgeClassName(row.property_type)}
        >
          {getPropertyTypeLabel(row.property_type)}
        </Badge>
      </TableCell>
      <TableCell>{formatNullable(row.disposition)}</TableCell>
      <TableCell className="text-right  tabular-nums">
        {formatCurrency(row.avg_purchase_price)}
      </TableCell>
      <TableCell className="text-right  tabular-nums">
        {formatCurrency(row.avg_monthly_rent)}
      </TableCell>
      <TableCell className="text-right  tabular-nums">
        <Tooltip>
          <TooltipTrigger>
            <span
              className="cursor-help underline decoration-dotted underline-offset-4"
              tabIndex={0}
            >
              {formatDecimal(row.payback_years_decimal)}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {row.payback_years ?? "Návratnost není dostupná"}
          </TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
});

function escapeCsvValue(value: string | number | null) {
  const normalizedValue = value === null ? "" : String(value);

  return `"${normalizedValue.replace(/"/g, '""')}"`;
}

function formatCsvNumber(value: number | null) {
  return value === null ? "" : String(value).replace(".", ",");
}

function exportRowsToCsv(rows: RentalYieldTableRow[]) {
  const headers = [
    "Kraj",
    "Okres",
    "Typ",
    "Dispozice",
    "Průměrná cena",
    "Průměrný nájem",
    "Návratnost",
  ];
  const csvRows = rows.map((row) =>
    [
      row.region,
      row.district,
      getPropertyTypeLabel(row.property_type),
      row.disposition,
      row.avg_purchase_price,
      row.avg_monthly_rent,
      formatCsvNumber(row.payback_years_decimal),
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
  link.download = "navratnost-nemovitosti.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function RentalYieldTable({ rows }: RentalYieldTableProps) {
  const allRegionOptions = useMemo(() => getOptions(rows, "region"), [rows]);
  const allDistrictOptions = useMemo(() => getOptions(rows, "district"), [rows]);
  const allDispositionOptions = useMemo(
    () => getOptions(rows, "disposition"),
    [rows],
  );
  const allFilterOptions = useMemo(
    () => ({
      regionOptions: allRegionOptions,
      districtOptions: allDistrictOptions,
      propertyTypeOptions,
      dispositionOptions: allDispositionOptions,
    }),
    [allDistrictOptions, allDispositionOptions, allRegionOptions],
  );
  const initialFilters = useMemo(
    () => getInitialFilters(allFilterOptions),
    [allFilterOptions],
  );
  const [tableRows, setTableRows] = useState(rows);
  const [filters, setFilters] = useState(() => initialFilters);
  const [sort, setSort] = useState<SortState[]>([
    {
      key: "payback_years_decimal",
      direction: "asc",
    },
  ]);
  const [isPending, startTransition] = useTransition();

  const filterOptions = useMemo(
    () => getFacetedOptions(rows, filters, allFilterOptions),
    [allFilterOptions, filters, rows],
  );

  const sortedRows = useMemo(() => {
    if (sort.length === 0) {
      return tableRows;
    }

    return [...tableRows].sort((a, b) => compareRows(a, b, sort));
  }, [sort, tableRows]);
  const isFilterActive = useMemo(
    () => hasActiveFilters(filters, allFilterOptions),
    [allFilterOptions, filters],
  );

  const updateFilter = useCallback(
    (key: FilterKey, value: FilterState[FilterKey]) => {
      setFilters((current) => ({
        ...current,
        [key]: value,
      }));
    },
    [],
  );

  const handleSort = useCallback((key: SortKey) => {
    setSort((current) => {
      const currentIndex = current.findIndex((item) => item.key === key);

      if (currentIndex === -1) {
        return [...current, { key, direction: "asc" }];
      }

      const currentSort = current[currentIndex];

      if (currentSort.direction === "asc") {
        return current.map((item, index) =>
          index === currentIndex ? { ...item, direction: "desc" } : item,
        );
      }

      return current.filter((_, index) => index !== currentIndex);
    });
  }, []);

  const handleHeaderSort = useCallback(
    (key: string) => handleSort(key as SortKey),
    [handleSort],
  );

  const fetchRows = useCallback(
    (nextFilters: FilterState) => {
      startTransition(async () => {
        const nextRows = await getRentalYieldRows(
          getFilterInput(nextFilters, allFilterOptions),
        );
        setTableRows(nextRows);
      });
    },
    [allFilterOptions],
  );

  const applyFilters = useCallback(() => {
    fetchRows(filters);
  }, [fetchRows, filters]);

  const applyFilterPatch = useCallback(
    (values: Partial<FilterState>) => {
      const nextFilters = {
        ...filters,
        ...values,
      };

      setFilters(nextFilters);
      fetchRows(nextFilters);
    },
    [fetchRows, filters],
  );

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    fetchRows(initialFilters);
  }, [fetchRows, initialFilters]);

  const exportRows = useCallback(() => {
    exportRowsToCsv(sortedRows);
  }, [sortedRows]);

  return (
    <section className="flex max-h-[calc(100svh-72.8px)] flex-col gap-4 ">
      <div className="max-w-2xl shrink-0 px-5 lg:px-8">
        <h2 className="text-xl font-semibold tracking-tight">
          Návratnost podle okresů
        </h2>
        <p className="mt-1 text-muted-foreground">
          Srovnání používá průměrnou kupní cenu, průměrný měsíční nájem a
          dopočtenou dobu návratnosti.
        </p>
      </div>

      <div className="overflow-hidden">
        <YieldTableToolbar
          hasActiveFilters={isFilterActive}
          onResetFilters={resetFilters}
          onExport={exportRows}
        />
        
        <Table containerClassName="max-h-[calc(100svh-9.5rem)] overflow-auto [scrollbar-gutter:stable] w-full">
          <YieldTableColumns />
          <YieldTableHeader
            filters={filters}
            filterOptions={filterOptions}
            allFilterOptions={allFilterOptions}
            sort={sort}
            onSort={handleHeaderSort}
            onFilterChange={updateFilter}
            onApplyFilters={applyFilters}
            onApplyFilterPatch={applyFilterPatch}
          />
          <YieldTableBody rows={sortedRows} isPending={isPending} />
        </Table>
        
        {sortedRows.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center p-6 text-sm text-muted-foreground">
            Data pro vybrané filtry nejsou dostupná.
          </div>
        ) : null}
      </div>
    </section>
  );
}
