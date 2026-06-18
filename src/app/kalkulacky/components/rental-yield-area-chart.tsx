"use client";

import { memo, useCallback, useMemo, useState, useTransition } from "react";
import { Download, Filter, X } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  DataTableCheckboxFilter,
  type DataTableFilterOption,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketYieldByAreaRow } from "@/types/market";

import { getRentalYieldAreaRows } from "../actions";

type RentalYieldAreaChartProps = {
  rows: MarketYieldByAreaRow[];
};

type AreaChartRow = {
  areaBucket: string;
  areaBucketMin: number | null;
  paybackYearsDecimal: number | null;
};

const chartConfig = {
  paybackYearsDecimal: {
    label: "Návratnost",
    color: "var(--primary-500)",
  },
} satisfies ChartConfig;

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
      values: number[];
    }
  >();

  for (const row of rows) {
    if (row.area_bucket === null || row.payback_years_decimal === null) {
      continue;
    }

    const current = buckets.get(row.area_bucket) ?? {
      areaBucket: row.area_bucket,
      areaBucketMin: row.area_bucket_min,
      values: [],
    };

    current.values.push(row.payback_years_decimal);
    buckets.set(row.area_bucket, current);
  }

  return Array.from(buckets.values())
    .sort((a, b) => (a.areaBucketMin ?? 0) - (b.areaBucketMin ?? 0))
    .map((bucket) => ({
      areaBucket: bucket.areaBucket,
      areaBucketMin: bucket.areaBucketMin,
      paybackYearsDecimal:
        bucket.values.length > 0
          ? Number(
              (
                bucket.values.reduce((sum, value) => sum + value, 0) /
                bucket.values.length
              ).toFixed(2),
            )
          : null,
    }));
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
          <span className="ml-1 rounded-full bg-primary-500 px-1.5 text-[10px] font-semibold leading-4 text-primary-foreground">
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
  const chartHeight = Math.max(320, chartData.length * 46 + 72);

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
    <section className="space-y-4 px-5 lg:px-8 border-t border-dashed pt-8 lg:pt-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight">
            Návratnost pronájmu bytů podle plochy
          </h2>
          <p className="mt-1 text-muted-foreground">
            Srovnání návratnosti bytů podle velikostních pásem.
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
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

      <div className="rounded-lg border bg-card p-4">
        {isPending ? (
          <Skeleton className="h-[360px] w-full" />
        ) : chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto w-full"
            style={{ height: chartHeight }}
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: 16, right: 24, top: 8, bottom: 8 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} let`}
              />
              <YAxis
                dataKey="areaBucket"
                type="category"
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <span className=" font-medium tabular-nums text-foreground">
                        {Number(value).toLocaleString("cs-CZ", {
                          maximumFractionDigits: 2,
                        })}{" "}
                        let
                      </span>
                    )}
                  />
                }
              />
              <Bar
                dataKey="paybackYearsDecimal"
                name="Návratnost"
                fill="var(--color-foreground)"
                radius={3}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
            Data pro vybrané filtry nejsou dostupná.
          </div>
        )}
      </div>
    </section>
  );
}
