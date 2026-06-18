export function formatCurrency(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNullable(value: string | null) {
  return value || "—";
}

export function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)} %`;
}

export function formatYears(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value)} roku`;
}

export function formatDecimal(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPaybackDuration(totalMonths: number | null) {
  if (totalMonths === null || !Number.isFinite(totalMonths) || totalMonths <= 0) {
    return "—";
  }

  const roundedMonths = Math.round(totalMonths);
  const years = Math.floor(roundedMonths / 12);
  const months = roundedMonths % 12;

  if (years === 0) {
    return `${months} měs.`;
  }

  if (months === 0) {
    return `${years} let`;
  }

  return `${years} let ${months} měs.`;
}

export function toInputValue(value: number | null) {
  return value === null || !Number.isFinite(value)
    ? ""
    : Math.round(value).toString();
}

export function parseInputValue(value: string) {
  const normalized = Number(value.replace(/\s/g, "").replace(",", "."));

  if (!Number.isFinite(normalized)) {
    return null;
  }

  return Math.max(normalized, 0);
}
