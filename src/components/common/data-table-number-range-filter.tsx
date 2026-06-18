"use client";

import { memo } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DataTableNumberRangeFilterProps = {
  label: string;
  min: string;
  max: string;
  minPlaceholder: string;
  maxPlaceholder: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  onClose?: () => void;
};

function isRangeFilterActive(min: string, max: string) {
  return min.trim().length > 0 || max.trim().length > 0;
}

function DataTableNumberRangeFilterComponent({
  label,
  min,
  max,
  minPlaceholder,
  maxPlaceholder,
  onMinChange,
  onMaxChange,
  onApply,
  onClear,
  onClose,
}: DataTableNumberRangeFilterProps) {
  const isClearDisabled = !isRangeFilterActive(min, max);

  function applyFilter() {
    onApply();
    onClose?.();
  }

  function clearFilter() {
    onClear();
    onClose?.();
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b p-3">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Zavřít filtr"
          >
            <X />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        <Input
          className="h-8"
          inputMode="decimal"
          value={min}
          placeholder={minPlaceholder}
          onChange={(event) => onMinChange(event.target.value)}
        />
        <Input
          className="h-8"
          inputMode="decimal"
          value={max}
          placeholder={maxPlaceholder}
          onChange={(event) => onMaxChange(event.target.value)}
        />
      </div>
      <div className="flex justify-end border-t p-3 gap-2">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={isClearDisabled}
          onClick={clearFilter}
        >
          Vymazat filtr
        </Button>
        <Button type="button" variant="primary" size="xs" onClick={applyFilter}>
          Potvrdit filtr
        </Button>
      </div>
    </div>
  );
}

export const DataTableNumberRangeFilter = memo(
  DataTableNumberRangeFilterComponent,
);
