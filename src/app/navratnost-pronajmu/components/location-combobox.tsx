"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { RentalYieldRegionGroup } from "../rental-yield-utils";

type LocationComboboxProps = {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regionGroups: RentalYieldRegionGroup[];
  selectedRegion: string;
  selectedDistrict: string;
  disabled?: boolean;
  onSelect: (location: { region: string; district: string }) => void;
};

function getLocationValue(region: string, district: string) {
  return region && district ? `${region}|||${district}` : "";
}

function getSelectedLabel(region: string, district: string) {
  return region && district ? `${district}, ${region}` : "Vyberte okres";
}

export function LocationCombobox({
  id,
  open,
  onOpenChange,
  regionGroups,
  selectedRegion,
  selectedDistrict,
  disabled,
  onSelect,
}: LocationComboboxProps) {
  const selectedValue = getLocationValue(selectedRegion, selectedDistrict);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className="h-9.5 w-full justify-between rounded-md px-3 font-normal bg-white"
            disabled={disabled}
            aria-label="Vyberte lokalitu"
          />
        }
      >
        <span className={cn(!selectedValue && "text-muted-foreground")}>
          {getSelectedLabel(selectedRegion, selectedDistrict)}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--anchor-width) min-w-64 gap-0 p-0"
      >
        <Command>
          <CommandInput placeholder="Hledat lokalitu..." />
          <CommandList className="max-h-80">
            <CommandEmpty>Žádná lokalita nenalezena.</CommandEmpty>
            {regionGroups.map((group) => (
              <CommandGroup key={group.region} heading={group.region}>
                {group.districts.map((district) => {
                  const value = getLocationValue(group.region, district);
                  const isSelected = value === selectedValue;

                  return (
                    <CommandItem
                      key={value}
                      value={`${district} ${group.region}`}
                      data-checked={isSelected ? true : undefined}
                      onSelect={() => {
                        onSelect({
                          region: group.region,
                          district,
                        });
                        onOpenChange(false);
                      }}
                      className="w-full"
                    >
                      <span>{district}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
