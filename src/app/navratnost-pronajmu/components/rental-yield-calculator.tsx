"use client";

import { useEffect, useMemo, useState } from "react";

import { getRentalMarketValues } from "../actions";
import {
  calculateRentalYield,
  type RentalYieldFacetOptions,
  type RentalYieldMarketValues,
  type RentalYieldRegionGroup,
} from "../rental-yield-utils";
import {
  parseInputValue,
  toInputValue,
} from "./rental-yield-formatters";
import { RentalYieldForm } from "./rental-yield-form";
import { RentalYieldMetrics } from "./rental-yield-metrics";

type RentalYieldCalculatorProps = {
  options: RentalYieldFacetOptions;
  regionGroups: RentalYieldRegionGroup[];
  initialRegion: string;
  initialDistrict: string;
  initialValues: RentalYieldMarketValues;
};

export function RentalYieldCalculator({
  options,
  regionGroups,
  initialRegion,
  initialDistrict,
  initialValues,
}: RentalYieldCalculatorProps) {
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [selectedDisposition, setSelectedDisposition] = useState(
    options.dispositions[0] ?? "",
  );
  const [purchasePrice, setPurchasePrice] = useState(
    toInputValue(initialValues.purchasePrice),
  );
  const [monthlyRent, setMonthlyRent] = useState(
    toInputValue(initialValues.monthlyRent),
  );
  const [defaultPurchasePrice, setDefaultPurchasePrice] = useState(
    initialValues.purchasePrice,
  );
  const [defaultMonthlyRent, setDefaultMonthlyRent] = useState(
    initialValues.monthlyRent,
  );
  const [annualCosts, setAnnualCosts] = useState("0");
  const [locationOpen, setLocationOpen] = useState(false);
  const marketValuesKey = [
    selectedRegion,
    selectedDistrict,
    selectedDisposition,
    options.propertyType,
    options.sellOfferType,
    options.rentOfferType,
  ].join("|");
  const [loadedMarketValuesKey, setLoadedMarketValuesKey] = useState(marketValuesKey);

  const hasLocationOptions = regionGroups.some((group) => group.districts.length > 0);
  const isMarketValuesLoading =
    Boolean(selectedDisposition && selectedRegion && selectedDistrict) &&
    loadedMarketValuesKey !== marketValuesKey;

  useEffect(() => {
    if (!selectedDisposition || !selectedRegion || !selectedDistrict) {
      return;
    }

    let isCurrent = true;

    void getRentalMarketValues({
      region: selectedRegion,
      district: selectedDistrict,
      disposition: selectedDisposition,
      propertyType: options.propertyType,
      sellOfferType: options.sellOfferType,
      rentOfferType: options.rentOfferType,
    }).then((values) => {
      if (!isCurrent) {
        return;
      }

      setDefaultPurchasePrice(values.purchasePrice);
      setDefaultMonthlyRent(values.monthlyRent);
      setPurchasePrice(toInputValue(values.purchasePrice));
      setMonthlyRent(toInputValue(values.monthlyRent));
      setLoadedMarketValuesKey(marketValuesKey);
    }).catch(() => {
      if (isCurrent) {
        setLoadedMarketValuesKey(marketValuesKey);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [
    options.propertyType,
    options.rentOfferType,
    options.sellOfferType,
    selectedDisposition,
    selectedDistrict,
    selectedRegion,
    marketValuesKey,
  ]);

  const result = useMemo(
    () =>
      calculateRentalYield(
        parseInputValue(purchasePrice),
        parseInputValue(monthlyRent),
        parseInputValue(annualCosts),
      ),
    [annualCosts, monthlyRent, purchasePrice],
  );

  return (
    <section className="space-y-4">
      <div className="grid border-y border-dashed bg-background lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <RentalYieldForm
          options={options}
          regionGroups={regionGroups}
          selectedRegion={selectedRegion}
          selectedDistrict={selectedDistrict}
          selectedDisposition={selectedDisposition}
          purchasePrice={purchasePrice}
          monthlyRent={monthlyRent}
          annualCosts={annualCosts}
          defaultPurchasePrice={defaultPurchasePrice}
          defaultMonthlyRent={defaultMonthlyRent}
          isLoadingDefaults={isMarketValuesLoading}
          locationOpen={locationOpen}
          hasLocationOptions={hasLocationOptions}
          onLocationOpenChange={setLocationOpen}
          onLocationChange={(location) => {
            setSelectedRegion(location.region);
            setSelectedDistrict(location.district);
          }}
          onDispositionChange={setSelectedDisposition}
          onPurchasePriceChange={setPurchasePrice}
          onMonthlyRentChange={setMonthlyRent}
          onAnnualCostsChange={setAnnualCosts}
        />

        <RentalYieldMetrics
          annualRent={result.annualRent}
          grossYieldPercent={result.grossYieldPercent}
          netYieldPercent={result.netYieldPercent}
          paybackYears={result.paybackYears}
          isLoading={isMarketValuesLoading}
        />
      </div>
    </section>
  );
}
