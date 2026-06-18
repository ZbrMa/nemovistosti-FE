export function formatCount(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return new Intl.NumberFormat("cs-CZ").format(value);
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPricePerM2(value: number | null | undefined) {
  const formatted = formatCurrency(value);

  return formatted ? `${formatted}/m²` : null;
}

export function formatShortDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    month: "short",
    year: "2-digit",
  }).format(date);
}
