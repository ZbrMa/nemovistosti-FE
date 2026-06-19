"use client";

import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import type {
  RentalYieldFacetOptions,
  RentalYieldRegionGroup,
} from "../rental-yield-utils";
import { LocationCombobox } from "./location-combobox";
import { formatCurrency } from "./rental-yield-formatters";

type RentalYieldFormProps = {
  options: RentalYieldFacetOptions;
  regionGroups: RentalYieldRegionGroup[];
  selectedRegion: string;
  selectedDistrict: string;
  selectedDisposition: string;
  purchasePrice: string;
  monthlyRent: string;
  annualCosts: string;
  defaultPurchasePrice: number | null;
  defaultMonthlyRent: number | null;
  isLoadingDefaults: boolean;
  locationOpen: boolean;
  hasLocationOptions: boolean;
  onLocationOpenChange: (open: boolean) => void;
  onLocationChange: (location: { region: string; district: string }) => void;
  onDispositionChange: (value: string) => void;
  onPurchasePriceChange: (value: string) => void;
  onMonthlyRentChange: (value: string) => void;
  onAnnualCostsChange: (value: string) => void;
};

export function RentalYieldForm({
  options,
  regionGroups,
  selectedRegion,
  selectedDistrict,
  selectedDisposition,
  purchasePrice,
  monthlyRent,
  annualCosts,
  defaultPurchasePrice,
  defaultMonthlyRent,
  isLoadingDefaults,
  locationOpen,
  hasLocationOptions,
  onLocationOpenChange,
  onLocationChange,
  onDispositionChange,
  onPurchasePriceChange,
  onMonthlyRentChange,
  onAnnualCostsChange,
}: RentalYieldFormProps) {
  return (
    <section className="space-y-6 border-b border-dashed p-5 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">

      <div className="max-w-2xl space-y-6">
        <div className="space-y-2 sm:max-w-[calc(50%)]">
          <Label htmlFor="rental-location">Lokalita</Label>
          <LocationCombobox
            id="rental-location"
            open={locationOpen}
            onOpenChange={onLocationOpenChange}
            regionGroups={regionGroups}
            selectedRegion={selectedRegion}
            selectedDistrict={selectedDistrict}
            disabled={!hasLocationOptions}
            onSelect={onLocationChange}
          />
        </div>

        <div className="space-y-2 sm:max-w-[calc(50%)]">
          <Label htmlFor="rental-disposition">Dispozice</Label>
          <Select
            value={selectedDisposition}
            onValueChange={(value) => {
              if (value) {
                onDispositionChange(value);
              }
            }}
          >
            <SelectTrigger
              id="rental-disposition"
              className="h-9.5 w-full rounded-md px-3"
            >
              <SelectValue placeholder="Vyberte dispozici" />
            </SelectTrigger>
            <SelectContent>
              {options.dispositions.map((disposition) => (
                <SelectItem key={disposition} value={disposition}>
                  {disposition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase-price">Kupní cena</Label>
          <InputWithReference
            input={
              <Input
                id="purchase-price"
                inputMode="numeric"
                value={purchasePrice}
                onChange={(event) => onPurchasePriceChange(event.target.value)}
                placeholder="0"
              />
            }
            referenceLabel="Tržní odhad"
            referenceValue={formatCurrency(defaultPurchasePrice)}
            isLoading={isLoadingDefaults}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthly-rent">Měsíční nájem</Label>
          <InputWithReference
            input={
              <Input
                id="monthly-rent"
                inputMode="numeric"
                value={monthlyRent}
                onChange={(event) => onMonthlyRentChange(event.target.value)}
                placeholder="0"
              />
            }
            referenceLabel="Tržní odhad"
            referenceValue={formatCurrency(defaultMonthlyRent)}
            isLoading={isLoadingDefaults}
          />
        </div>

        <div className="space-y-2 sm:max-w-[calc(50%)]">
          <Label htmlFor="annual-costs">Roční náklady</Label>
          <Input
            id="annual-costs"
            inputMode="numeric"
            value={annualCosts}
            onChange={(event) => onAnnualCostsChange(event.target.value)}
            placeholder="0"
          />
        </div>
      </div>
    </section>
  );
}

function InputWithReference({
  input,
  referenceLabel,
  referenceValue,
  isLoading,
}: {
  input: ReactNode;
  referenceLabel: string;
  referenceValue: string;
  isLoading: boolean;
}) {
  return (
    <div className="grid gap-4 sm:gap-0 sm:grid-cols-2 sm:items-center">
      {input}
      <div className="text-xs text-muted-foreground flex gap-1 items-center lg:ml-16">
        {isLoading ? (
          <Skeleton className="h-9.5 w-32" />
        ) : (
          <>
            <span>{referenceLabel}</span>
            <span className="font-medium text-foreground">
              {referenceValue}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
