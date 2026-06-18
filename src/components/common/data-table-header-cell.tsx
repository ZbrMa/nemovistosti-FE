"use client";

import {
  cloneElement,
  isValidElement,
  memo,
  useCallback,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DataTableSortDirection = "asc" | "desc";

export type DataTableSortState = {
  key: string;
  direction: DataTableSortDirection;
};

type DataTableSortButtonProps = {
  sortKey: string;
  label: string;
  sort: DataTableSortState[];
  align?: "left" | "right";
  onSort: (key: string) => void;
};

function DataTableSortButtonComponent({
  sortKey,
  label,
  sort,
  align,
  onSort,
}: DataTableSortButtonProps) {
  const sortIndex = sort.findIndex((item) => item.key === sortKey);
  const activeSort = sortIndex >= 0 ? sort[sortIndex] : null;
  const isActive = activeSort !== null;
  const Icon = !isActive
    ? ArrowUpDown
    : activeSort.direction === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <Button
      type="button"
      variant="link"
      size="xs"
      className={cn(
        "relative p-0 no-underline hover:no-underline text-foreground",
        align === "right" && "ml-auto",
      )}
      onClick={() => onSort(sortKey)}
    >
      <span className="truncate">{label}</span>
      <Icon className={cn("size-3.5",isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground")} />
      {sort.length > 1 && isActive ? (
        <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary-500 text-[9px] font-semibold leading-none text-primary-foreground">
          {sortIndex + 1}
        </span>
      ) : null}
    </Button>
  );
}

const DataTableSortButton = memo(DataTableSortButtonComponent);

type DataTableHeaderCellProps = {
  label: string;
  sortKey: string;
  sort: DataTableSortState[];
  align?: "left" | "right";
  isFiltered: boolean;
  filterCount?: number;
  children: ReactElement<{ onClose?: () => void }>;
  onSort: (key: string) => void;
};

function DataTableHeaderCellComponent({
  label,
  sortKey,
  sort,
  align = "left",
  isFiltered,
  filterCount,
  children,
  onSort,
}: DataTableHeaderCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closePopover = useCallback(() => setIsOpen(false), []);
  const filterContent = useMemo(() => {
    if (!isValidElement(children)) {
      return children;
    }

    return cloneElement(children, {
      onClose: closePopover,
    });
  }, [children, closePopover]);

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        align === "right" && "justify-end",
      )}
    >
      <DataTableSortButton
        sortKey={sortKey}
        label={label}
        sort={sort}
        align={align}
        onSort={onSort}
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="link"
              size="xs"
              className={cn(
                "relative p-0 text-muted-foreground hover:text-foreground",
                isFiltered && "text-foreground",
              )}
              aria-label={`Filtrovat sloupec ${label}`}
            />
          }
        >
          <Filter className="size-3.5" />
          {isFiltered && filterCount !== undefined ? (
            <span className="absolute -right-1 -top-1 flex min-w-3.5 px-0.5 items-center justify-center rounded-full bg-primary-500 text-center text-[8px] font-semibold leading-3 text-primary-foreground">
              {filterCount}
            </span>
          ) : null}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-0">
          {filterContent}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const DataTableHeaderCell = memo(DataTableHeaderCellComponent);
