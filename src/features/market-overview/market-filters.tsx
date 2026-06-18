"use client";

import Link from "next/link";
import {
  memo,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";

import {
  DataTableCheckboxFilter,
  type DataTableFilterOption,
} from "@/components/common";
import { buttonVariants, Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getOfferTypeLabel,
  OFFER_TYPE,
  type OfferType,
  type PropertyType,
} from "@/lib/market-taxonomy";
import { cn } from "@/lib/utils";

import {
  getMarketOverviewHref,
  propertyCategoryRoutes,
  type MarketOverviewQueryFilters,
} from "./market-overview-routes";

type MarketFiltersProps = {
  selectedOfferType: OfferType;
  selectedPropertyType?: PropertyType | null;
  regionGroups: Array<{
    region: string;
    districts: string[];
  }>;
  selectedRegions: string[];
  selectedDistricts: string[];
};

const offerLinks: Array<{ value: OfferType }> = [
  { value: OFFER_TYPE.sell },
  { value: OFFER_TYPE.rent },
];

export function MarketFilters({
  selectedOfferType,
  selectedPropertyType = null,
  regionGroups,
  selectedRegions,
  selectedDistricts,
}: MarketFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const regionOptions = useMemo<DataTableFilterOption[]>(
    () =>
      regionGroups.map((group) => ({
        value: group.region,
        label: group.region,
      })),
    [regionGroups],
  );
  const allRegionValues = useMemo(
    () => regionOptions.map((option) => option.value),
    [regionOptions],
  );
  const effectiveRegions =
    selectedRegions.length > 0 ? selectedRegions : allRegionValues;
  const districtOptions = useMemo<DataTableFilterOption[]>(() => {
    const allowedRegions = new Set(effectiveRegions);

    return regionGroups
      .filter((group) => allowedRegions.has(group.region))
      .flatMap((group) =>
        group.districts.map((district) => ({
          value: district,
          label: district,
        })),
      );
  }, [effectiveRegions, regionGroups]);
  const allDistrictValues = useMemo(
    () => districtOptions.map((option) => option.value),
    [districtOptions],
  );
  const effectiveDistricts =
    selectedDistricts.length > 0
      ? selectedDistricts.filter((district) => allDistrictValues.includes(district))
      : allDistrictValues;
  const queryFilters: MarketOverviewQueryFilters = {
    regions: selectedRegions,
    districts: effectiveDistricts.length === allDistrictValues.length ? [] : effectiveDistricts,
  };
  const hasActiveLocationFilters =
    selectedRegions.length > 0 ||
    (effectiveDistricts.length > 0 &&
      effectiveDistricts.length !== allDistrictValues.length);

  function updateQuery(nextRegions: string[], nextDistricts: string[]) {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("kraj");
    params.delete("okres");

    for (const region of nextRegions) {
      params.append("kraj", region);
    }

    for (const district of nextDistricts) {
      params.append("okres", district);
    }

    const query = params.toString();

    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  function clearLocationFilters() {
    updateQuery([], []);
  }

  return (
    <div className="flex w-full flex-col self-stretch sm:w-fit lg:border-l border-dashed">
      <div className="grid grid-cols-2 flex-1">
        {offerLinks.map((item) => {
          const isActive = item.value === selectedOfferType;

          return (
            <Link
              key={item.value}
              href={getMarketOverviewHref(
                item.value,
                selectedPropertyType,
                queryFilters,
              )}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                buttonVariants({
                  variant: isActive ? "primary" : "ghost",
                  size: "sm",
                }),
                "h-full! min-h-10 rounded-none border-transparent px-4",
                !isActive
                  ? "text-muted-foreground hover:text-foreground"
                  : "bg-primary-700! text-white",
              )}
            >
              {getOfferTypeLabel(item.value)}
            </Link>
          );
        })}
      </div>
      <div className="grid grid-cols-3 border-t border-dashed sm:grid-cols-6 flex-1">
        <CategoryLink
          href={getMarketOverviewHref(selectedOfferType, null, queryFilters)}
          isActive={selectedPropertyType === null}
        >
          Vše
        </CategoryLink>
        {propertyCategoryRoutes.map((item) => (
          <CategoryLink
            key={item.propertyType}
            href={getMarketOverviewHref(
              selectedOfferType,
              item.propertyType,
              queryFilters,
            )}
            isActive={selectedPropertyType === item.propertyType}
          >
            {item.label}
          </CategoryLink>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-dashed px-3 py-3">
        {hasActiveLocationFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={clearLocationFilters}
          >
            <X data-icon="inline-start" />
            Zrušit filtry
          </Button>
        ) : null}
        <CheckboxFilterButton
          label="Kraj"
          values={effectiveRegions}
          options={regionOptions}
          onApply={(values) => {
            const allowedRegions = new Set(values);
            const nextDistricts = effectiveDistricts.filter((district) =>
              regionGroups.some(
                (group) =>
                  allowedRegions.has(group.region) &&
                  group.districts.includes(district),
              ),
            );

            updateQuery(values.length === allRegionValues.length ? [] : values, nextDistricts);
          }}
          onClear={() => updateQuery([], effectiveDistricts)}
        />
        <CheckboxFilterButton
          label="Okres"
          values={effectiveDistricts}
          options={districtOptions}
          onApply={(values) =>
            updateQuery(
              selectedRegions,
              values.length === allDistrictValues.length ? [] : values,
            )
          }
          onClear={() => updateQuery(selectedRegions, [])}
        />
      </div>
    </div>
  );
}

function CategoryLink({
  children,
  href,
  isActive,
}: {
  children: ReactNode;
  href: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? "primary" : "ghost",
          size: "sm",
        }),
        "h-full! min-h-10 rounded-none border-transparent px-3 text-xs",
        !isActive && "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

type CheckboxFilterButtonProps = {
  label: string;
  values: string[];
  options: DataTableFilterOption[];
  onApply: (values: string[]) => void;
  onClear: () => void;
};

const CheckboxFilterButton = memo(function CheckboxFilterButton({
  label,
  values,
  options,
  onApply,
  onClear,
}: CheckboxFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftValues, setDraftValues] = useState(values);
  const allValues = options.map((option) => option.value);
  const visibleDraftValues = draftValues.filter((value) => allValues.includes(value));
  const isFiltered = values.length !== allValues.length;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraftValues(values);
    } else {
      setDraftValues(values);
    }

    setIsOpen(nextOpen);
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
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
          label={`Filtrovat ${label.toLowerCase()}`}
          values={visibleDraftValues}
          options={options}
          allValues={allValues}
          onChange={setDraftValues}
          onApply={() => {
            onApply(visibleDraftValues);
            setIsOpen(false);
          }}
          onClear={onClear}
          onClose={() => {
            setDraftValues(values);
            setIsOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
});
