import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";
export interface SortState<K extends string> {
  key: K;
  direction: SortDirection;
}

/**
 * Shared table sorting state: click cycles asc → desc → default (null).
 * Sorting always runs on the full (filtered) dataset before pagination.
 */
export function useTableSort<K extends string>(defaultSort: SortState<K> | null = null) {
  const [sort, setSort] = useState<SortState<K> | null>(defaultSort);

  const toggle = (key: K) =>
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return defaultSort && defaultSort.key !== key ? defaultSort : null;
    });

  return { sort, toggle };
}

type Value = string | number | null | undefined;

/** null/empty values always sort last, regardless of direction */
export function compareValues(a: Value, b: Value, direction: SortDirection) {
  const emptyA = a === null || a === undefined || a === "";
  const emptyB = b === null || b === undefined || b === "";
  if (emptyA && emptyB) return 0;
  if (emptyA) return 1;
  if (emptyB) return -1;

  const result =
    typeof a === "number" && typeof b === "number"
      ? a - b
      : String(a).localeCompare(String(b), "tr", { numeric: true });
  return direction === "asc" ? result : -result;
}

/** timestamp-safe comparison for ISO date strings */
export const dateValue = (value?: string | null) => {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
};

export function useSortedRows<T, K extends string>(
  rows: T[],
  sort: SortState<K> | null,
  accessor: (row: T, key: K) => Value,
) {
  return useMemo(() => {
    if (!sort) return rows;
    return [...rows].sort((a, b) =>
      compareValues(accessor(a, sort.key), accessor(b, sort.key), sort.direction),
    );
  }, [rows, sort, accessor]);
}

export function SortableTh<K extends string>({
  label,
  sortKey,
  sort,
  onToggle,
  className,
  align = "left",
}: {
  label: string;
  sortKey?: K;
  sort: SortState<K> | null;
  onToggle: (key: K) => void;
  className?: string;
  align?: "left" | "right";
}) {
  const active = sortKey && sort?.key === sortKey ? sort.direction : null;
  const Icon = active === "asc" ? ArrowUp : active === "desc" ? ArrowDown : ChevronsUpDown;

  return (
    <th
      scope="col"
      className={cn(
        "tech-label px-4 py-3 font-normal",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
      aria-sort={active ? (active === "asc" ? "ascending" : "descending") : "none"}
    >
      {sortKey ? (
        <button
          type="button"
          onClick={() => onToggle(sortKey)}
          className={cn(
            "inline-flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-foreground",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <span>{label}</span>
          <Icon className={cn("size-3 shrink-0", !active && "opacity-50")} />
        </button>
      ) : (
        label
      )}
    </th>
  );
}
