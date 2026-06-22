import type { PostgrestError } from "@supabase/supabase-js";

export const DEFAULT_LIMIT = 500;
export const MAX_LIMIT = 500;
export const DEFAULT_EXPORT_LIMIT = 5000;
export const MAX_EXPORT_LIMIT = 5000;

export function emptyStringToNull(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function emptyArrayToNull<T>(value: T[] | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return value && value.length > 0 ? value : null;
}

export function normalizeLimit(value: number | null | undefined) {
  if (value === undefined || value === null) {
    return DEFAULT_LIMIT;
  }

  if (!Number.isFinite(value)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(value), 1), MAX_LIMIT);
}

export function normalizeExportLimit(value: number | null | undefined) {
  if (value === undefined || value === null) {
    return DEFAULT_EXPORT_LIMIT;
  }

  if (!Number.isFinite(value)) {
    return DEFAULT_EXPORT_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(value), 1), MAX_EXPORT_LIMIT);
}

export function normalizeOffset(value: number | null | undefined) {
  if (value === undefined || value === null) {
    return 0;
  }

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(Math.trunc(value), 0);
}

export function formatSupabaseError(
  procedureName: string,
  error: PostgrestError,
) {
  return new Error(
    `Supabase RPC "${procedureName}" failed: ${error.message}`,
  );
}

export function unwrapSingleRpcRow<T>(
  procedureName: string,
  data: T | T[] | null,
): T {
  if (Array.isArray(data)) {
    const [firstRow] = data;

    if (!firstRow) {
      throw new Error(`Supabase RPC "${procedureName}" returned no rows.`);
    }

    return firstRow;
  }

  if (!data) {
    throw new Error(`Supabase RPC "${procedureName}" returned no data.`);
  }

  return data;
}
