"use client";

import { memo, useCallback, useMemo, useState, useTransition } from "react";
import { Download, Filter, X } from "lucide-react";

import {
  DataTableCheckboxFilter,
  type DataTableFilterOption,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MarketYieldByAreaRow } from "@/types/market";

import { getRentalYieldAreaRows } from "../actions";

type RentalYieldAreaChartProps = {
  rows: MarketYieldByAreaRow[];
};

type AreaChartRow = {
  areaBucket: string;
  areaBucketMin: number | null;
  paybackYearsDecimal: number | null;
  avgPurchasePrice: number | null;
  avgMonthlyRent: number | null;
  avgAreaM2: number | null;
};

function isString(value: string | null): value is string {
  return value !== null;
}

function getOptions(values: Array<string | null>): DataTableFilterOption[] {
  const collator = new Intl.Collator("cs-CZ");

  return [...new Set(values.filter(isString))]
    .sort(collator.compare)
    .map((value) => ({ value, label: value }));
}

function getArrayFilterInput(values: string[], options: DataTableFilterOption[]) {
  if (values.length === options.length) {
    return null;
  }

  return values.length === 0 ? ["__none__"] : values;
}

function getDistrictOptionsForRegions(
  rows: MarketYieldByAreaRow[],
  selectedRegions: string[],
  allRegionOptions: DataTableFilterOption[],
) {
  const isAllRegionsSelected = selectedRegions.length === allRegionOptions.length;
  const selectedRegionSet = new Set(selectedRegions);

  return getOptions(
    rows
      .filter(
        (row) =>
          isAllRegionsSelected ||
          (row.region !== null && selectedRegionSet.has(row.region)),
      )
      .map((row) => row.district),
  );
}

function getVisibleDistricts(
  selectedDistricts: string[],
  districtOptions: DataTableFilterOption[],
) {
  const availableDistricts = new Set(districtOptions.map((option) => option.value));

  return selectedDistricts.filter((district) => availableDistricts.has(district));
}

function getChartData(rows: MarketYieldByAreaRow[]): AreaChartRow[] {
  const buckets = new Map<
    string,
    {
      areaBucket: string;
      areaBucketMin: number | null;
      paybackValues: number[];
      purchaseValues: number[];
      rentValues: number[];
      areaValues: number[];
    }
  >();

  for (const row of rows) {
    if (row.area_bucket === null) {
      continue;
    }

    const current = buckets.get(row.area_bucket) ?? {
      areaBucket: row.area_bucket,
      areaBucketMin: row.area_bucket_min,
      paybackValues: [],
      purchaseValues: [],
      rentValues: [],
      areaValues: [],
    };

    pushNumber(current.paybackValues, row.payback_years_decimal);
    pushNumber(current.purchaseValues, row.avg_purchase_price);
    pushNumber(current.rentValues, row.avg_monthly_rent);
    pushNumber(current.areaValues, row.avg_area_m2);
    buckets.set(row.area_bucket, current);
  }

  return Array.from(buckets.values())
    .sort((a, b) => (a.areaBucketMin ?? 0) - (b.areaBucketMin ?? 0))
    .map((bucket) => ({
      areaBucket: bucket.areaBucket,
      areaBucketMin: bucket.areaBucketMin,
      paybackYearsDecimal: average(bucket.paybackValues),
      avgPurchasePrice: average(bucket.purchaseValues),
      avgMonthlyRent: average(bucket.rentValues),
      avgAreaM2: average(bucket.areaValues),
    }));
}

function pushNumber(values: number[], value: number | null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    values.push(value);
  }
}

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2),
  );
}

function escapeCsvValue(value: string | number | null) {
  const normalizedValue = value === null ? "" : String(value);

  return `"${normalizedValue.replace(/"/g, '""')}"`;
}

function formatCsvNumber(value: number | null) {
  return value === null ? "" : String(value).replace(".", ",");
}

function exportRowsToCsv(rows: MarketYieldByAreaRow[]) {
  const headers = [
    "Kraj",
    "Okres",
    "Plocha",
    "Plocha od",
    "Plocha do",
    "Průměrná plocha m2",
    "Průměrná kupní cena",
    "Průměrný nájem",
    "Návratnost",
    "Návratnost text",
    "Návratnost měsíce",
  ];
  const csvRows = rows.map((row) =>
    [
      row.region,
      row.district,
      row.area_bucket,
      formatCsvNumber(row.area_bucket_min),
      formatCsvNumber(row.area_bucket_max),
      formatCsvNumber(row.avg_area_m2),
      formatCsvNumber(row.avg_purchase_price),
      formatCsvNumber(row.avg_monthly_rent),
      formatCsvNumber(row.payback_years_decimal),
      row.payback_years,
      formatCsvNumber(row.payback_months),
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
  link.download = "navratnost-podle-plochy.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

type ChartFilterButtonProps = {
  label: string;
  values: string[];
  allValues?: string[];
  options: DataTableFilterOption[];
  onChange: (values: string[]) => void;
  onApply: () => void;
  onClear: () => void;
};

const ChartFilterButton = memo(function ChartFilterButton({
  label,
  values,
  allValues,
  options,
  onChange,
  onApply,
  onClear,
}: ChartFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedValuesCount = allValues?.length ?? options.length;
  const isFiltered = values.length !== selectedValuesCount;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="relative"
          />
        }
      >
        <Filter data-icon="inline-start" />
        {label}
        {isFiltered ? (
          <span className="ml-1 rounded-full bg-primary-500 px-1.5 text-xs font-semibold leading-4 text-primary-foreground">
            {values.length}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <DataTableCheckboxFilter
          label={label}
          values={values}
          options={options}
          allValues={allValues}
          onChange={onChange}
          onApply={onApply}
          onClear={onClear}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
});

export function RentalYieldAreaChart({ rows }: RentalYieldAreaChartProps) {
  const allRegionOptions = useMemo(
    () => getOptions(rows.map((row) => row.region)),
    [rows],
  );
  const allDistrictOptions = useMemo(
    () => getOptions(rows.map((row) => row.district)),
    [rows],
  );
  const [chartRows, setChartRows] = useState(rows);
  const [selectedRegions, setSelectedRegions] = useState(() =>
    allRegionOptions.map((option) => option.value),
  );
  const [selectedDistricts, setSelectedDistricts] = useState(() =>
    allDistrictOptions.map((option) => option.value),
  );
  const [isPending, startTransition] = useTransition();

  const districtOptions = useMemo(
    () => getDistrictOptionsForRegions(rows, selectedRegions, allRegionOptions),
    [allRegionOptions, rows, selectedRegions],
  );
  const visibleDistricts = useMemo(
    () => getVisibleDistricts(selectedDistricts, districtOptions),
    [districtOptions, selectedDistricts],
  );
  const chartData = useMemo(() => getChartData(chartRows), [chartRows]);
  const values = chartData
    .map((row) => row.paybackYearsDecimal)
    .filter((value): value is number => typeof value === "number");
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const sortedChartData = useMemo(
    () =>
      [...chartData].sort((a, b) => {
        const aValue = getNumericValue(a.paybackYearsDecimal);
        const bValue = getNumericValue(b.paybackYearsDecimal);
        const valueDifference = aValue - bValue;

        if (valueDifference !== 0) {
          return valueDifference;
        }

        return (a.areaBucketMin ?? 0) - (b.areaBucketMin ?? 0);
      }),
    [chartData],
  );

  const fetchRows = useCallback(
    (regions: string[], districts: string[]) => {
      startTransition(async () => {
        const nextRows = await getRentalYieldAreaRows({
          p_regions: getArrayFilterInput(regions, allRegionOptions),
          p_districts: getArrayFilterInput(districts, allDistrictOptions),
        });

        setChartRows(nextRows);
      });
    },
    [allDistrictOptions, allRegionOptions],
  );

  const applyFilters = useCallback(() => {
    fetchRows(selectedRegions, visibleDistricts);
  }, [fetchRows, selectedRegions, visibleDistricts]);

  const clearRegionFilter = useCallback(() => {
    const nextRegions = allRegionOptions.map((option) => option.value);

    setSelectedRegions(nextRegions);
    fetchRows(nextRegions, visibleDistricts);
  }, [allRegionOptions, fetchRows, visibleDistricts]);

  const clearDistrictFilter = useCallback(() => {
    const nextDistricts = allDistrictOptions.map((option) => option.value);

    setSelectedDistricts(nextDistricts);
    fetchRows(selectedRegions, nextDistricts);
  }, [allDistrictOptions, fetchRows, selectedRegions]);

  const resetFilters = useCallback(() => {
    const nextRegions = allRegionOptions.map((option) => option.value);
    const nextDistricts = allDistrictOptions.map((option) => option.value);

    setSelectedRegions(nextRegions);
    setSelectedDistricts(nextDistricts);
    fetchRows(nextRegions, nextDistricts);
  }, [allDistrictOptions, allRegionOptions, fetchRows]);

  const exportRows = useCallback(() => {
    exportRowsToCsv(chartRows);
  }, [chartRows]);

  const hasActiveFilters =
    selectedRegions.length !== allRegionOptions.length ||
    selectedDistricts.length !== allDistrictOptions.length;

  return (
    <section className="space-y-4 border-t border-dashed pt-8 lg:pt-12">
      <div className="flex flex-col gap-3 px-5 sm:flex-row sm:items-end sm:justify-between lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight">
            Návratnost pronájmu bytů podle plochy
          </h2>
          <p className="mt-1 text-sm text-muted-foreground lg:text-base">
            Srovnání návratnosti bytů podle velikostních pásem.
          </p>
        </div>
        <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
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
          <ChartFilterButton
            label="Kraj"
            values={selectedRegions}
            options={allRegionOptions}
            onChange={setSelectedRegions}
            onApply={applyFilters}
            onClear={clearRegionFilter}
          />
          <ChartFilterButton
            label="Okres"
            values={visibleDistricts}
            allValues={allDistrictOptions.map((option) => option.value)}
            options={districtOptions}
            onChange={setSelectedDistricts}
            onApply={applyFilters}
            onClear={clearDistrictFilter}
          />
          <Button type="button" variant="outline" size="xs" onClick={exportRows}>
            <Download data-icon="inline-start" />
            Export do Excelu
          </Button>
        </div>
      </div>

      <div className="border-y border-dashed bg-background">
        {isPending ? (
          <div className="p-5 lg:px-8">
            <Skeleton className="h-[360px] w-full" />
          </div>
        ) : chartData.length > 0 ? (
          <TooltipProvider>
            <div className="overflow-auto [scrollbar-gutter:stable] lg:max-h-[560px]">
              <div className="grid min-w-[420px] grid-cols-[max-content_minmax(8rem,1fr)_5.75rem] sm:min-w-[560px] sm:grid-cols-[max-content_minmax(14rem,1fr)_7rem]">
                {sortedChartData.map((row) => {
                  const value = row.paybackYearsDecimal;
                  const formattedValue = formatYears(value);
                  const numericValue = getNumericValue(value);
                  const ratio = maxValue > 0 ? numericValue / maxValue : 0;
                  const colorWeight = getBarColorWeight(ratio);
                  const width = `${Math.max(ratio * 100, numericValue > 0 ? 2 : 0)}%`;

                  return (
                    <Tooltip key={row.areaBucket}>
                      <TooltipTrigger
                        render={
                          <div className="grid grid-cols-subgrid col-span-3 items-center gap-4 px-3 py-0.5 transition-colors last:border-b-0 hover:bg-accent/35" />
                        }
                      >
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium">
                            {row.areaBucket}
                          </div>
                        </div>

                        <div className="h-3 overflow-hidden rounded-[2px] bg-accent">
                          <div
                            className="h-full rounded-[2px]"
                            style={{
                              width,
                              backgroundColor: `color-mix(in oklch, var(--primary-700) ${colorWeight}%, var(--background))`,
                            }}
                          />
                        </div>

                        <div className="text-left font-mono text-xs tabular-nums text-foreground sm:text-right sm:text-sm">
                          {formattedValue}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>{row.areaBucket}</span>
                        <span className="font-mono tabular-nums">
                          {formattedValue}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </TooltipProvider>
        ) : (
          <div className="flex min-h-64 items-center justify-center border border-dashed text-sm text-muted-foreground">
            Data pro vybrané filtry nejsou dostupná.
          </div>
        )}
      </div>
    </section>
  );
}

function getNumericValue(value: number | null | undefined) {
  return typeof value === "number" ? value : 0;
}

function getBarColorWeight(ratio: number) {
  if (ratio <= 0) {
    return 10;
  }

  return Math.round(18 + ratio * 62);
}

function formatYears(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return `${new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 2,
  }).format(value)} let`;
}
