"use client";

import { memo, useMemo, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type DataTableFilterOption = {
  value: string;
  label: string;
};

type DataTableCheckboxFilterProps = {
  label: string;
  values: string[];
  options: DataTableFilterOption[];
  allValues?: string[];
  onChange: (values: string[]) => void;
  onApply: () => void;
  onClear?: () => void;
  onClose?: () => void;
  searchPlaceholder?: string;
};

function DataTableCheckboxFilterComponent({
  label,
  values,
  options,
  allValues: allValuesProp,
  onChange,
  onApply,
  onClear,
  onClose,
  searchPlaceholder = "Hledat možnost",
}: DataTableCheckboxFilterProps) {
  const [query, setQuery] = useState("");
  const optionValues = useMemo(
    () => options.map((option) => option.value),
    [options],
  );
  const allValues = allValuesProp ?? optionValues;
  const isEverythingSelected = values.length === allValues.length;
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  function toggleValue(value: string, checked: boolean) {
    if (checked) {
      onChange([...new Set([...values, value])]);
      return;
    }

    onChange(values.filter((item) => item !== value));
  }

  function applyFilter() {
    onApply();
    onClose?.();
  }

  function clearFilter() {
    if (onClear) {
      onClear();
    } else {
      onChange(allValues);
      onApply();
    }

    onClose?.();
  }

  function selectSearchResults() {
    onChange(filteredOptions.map((option) => option.value));
  }

  const canSelectSearchResults =
    query.trim().length > 0 && filteredOptions.length > 0;

  return (
    <div className="flex max-h-[420px] flex-col">
      <div className="space-y-2 border-b p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{label}</p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground p-0"
              onClick={onClose}
              aria-label="Zavřít filtr"
            >
              <X />
            </Button>
          </div>
        </div>
        <Input
          className="h-8"
          value={query}
          placeholder={searchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
        />
        {canSelectSearchResults ? (
          <Button
            type="button"
            variant="link"
            size="xs"
            className="w-full justify-start px-0 text-muted-foreground hover:text-foreground no-underline!"
            onClick={selectSearchResults}
          >
            Vybrat nalezené ({filteredOptions.length})
          </Button>
        ) : null}
      </div>

      <div className="min-h-0 h-32 overflow-y-auto px-3 py-2 flex-1">
          <Label className="flex h-8 cursor-pointer items-center gap-2 rounded-md group">
            <Checkbox
              checked={isEverythingSelected}
              onCheckedChange={(checked) => {
                onChange(checked ? allValues : []);
              }}
            />
            <span>Vybrat vše</span>
          </Label>
          {filteredOptions.map((option) => (
            <Label
              key={option.value}
              className="flex h-8 cursor-pointer items-center gap-2 rounded-md group"
            >
              <Checkbox
                checked={values.includes(option.value)}
                onCheckedChange={(checked) =>
                  toggleValue(option.value, Boolean(checked))
                }
              />
              <span>{option.label}</span>
            </Label>
          ))}
      </div>

      <div className="flex justify-end border-t p-3 gap-2">
          <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={isEverythingSelected}
              onClick={clearFilter}
            >
              Vymazat filtr
            </Button>
        <Button
          type="button"
          variant="primary"
          size="xs"
          onClick={applyFilter}
        >
          Potvrdit filtr
        </Button>
      </div>
    </div>
  );
}

export const DataTableCheckboxFilter = memo(DataTableCheckboxFilterComponent);
