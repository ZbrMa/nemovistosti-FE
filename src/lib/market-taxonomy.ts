export const OFFER_TYPES = ["sell", "rent"] as const;
export const PROPERTY_TYPES = ["flat", "house", "land", "commercial", "other"] as const;
export const OFFER_TYPE = {
  sell: "sell",
  rent: "rent",
} as const;
export const PROPERTY_TYPE = {
  flat: "flat",
  house: "house",
  land: "land",
  commercial: "commercial",
  other: "other",
} as const;

export type OfferType = (typeof OFFER_TYPES)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];

const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  sell: "Prodej",
  rent: "Pronájem",
};

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  flat: "Byt",
  house: "Dům",
  land: "Pozemek",
  commercial: "Komerční",
  other: "Ostatní",
};

const PROPERTY_TYPE_BADGE_CLASS_NAMES: Record<PropertyType, string> = {
  land: "border-primary-200 bg-primary-50 text-primary-800",
  house: "border-sky-200 bg-sky-50 text-sky-800",
  flat: "border-amber-200 bg-amber-50 text-amber-800",
  commercial: "border-violet-200 bg-violet-50 text-violet-800",
  other: "border-border bg-accent text-muted-foreground",
};

const OFFER_TYPE_DATABASE_VALUES: Record<OfferType, string> = {
  sell: "sell",
  rent: "rent",
};

const PROPERTY_TYPE_DATABASE_VALUES: Record<PropertyType, string> = {
  flat: "flat",
  house: "house",
  land: "land",
  commercial: "commercial",
  other: "other",
};

function normalizeToken(value: string) {
  return value.trim().toLowerCase();
}

function isString(value: string | null): value is string {
  return value !== null;
}

export function normalizeOfferType(value: string | null | undefined): OfferType | null {
  if (!value) {
    return null;
  }

  const token = normalizeToken(value);

  if (token === "sell" || token === "prodej") {
    return "sell";
  }

  if (token === "rent" || token === "pronajem" || token === "pronájem") {
    return "rent";
  }

  return null;
}

export function normalizePropertyType(
  value: string | null | undefined,
): PropertyType | null {
  if (!value) {
    return null;
  }

  const token = normalizeToken(value);

  if (token === "flat" || token === "byt") {
    return "flat";
  }

  if (token === "house" || token === "dům" || token === "dum") {
    return "house";
  }

  if (token === "land" || token === "pozemek") {
    return "land";
  }

  if (
    token === "commercial" ||
    token === "commercial_property" ||
    token === "komercni" ||
    token === "komerční"
  ) {
    return "commercial";
  }

  if (token === "other" || token === "ostatní" || token === "ostatni") {
    return "other";
  }

  return null;
}

export function getOfferTypeLabel(value: string | null | undefined) {
  const offerType = normalizeOfferType(value);

  return offerType ? OFFER_TYPE_LABELS[offerType] : (value ?? "—");
}

export function getPropertyTypeLabel(value: string | null | undefined) {
  const propertyType = normalizePropertyType(value);

  return propertyType ? PROPERTY_TYPE_LABELS[propertyType] : (value ?? "—");
}

export function getPropertyTypeBadgeClassName(value: string | null | undefined) {
  const propertyType = normalizePropertyType(value);

  return propertyType
    ? PROPERTY_TYPE_BADGE_CLASS_NAMES[propertyType]
    : PROPERTY_TYPE_BADGE_CLASS_NAMES.other;
}

export function toDatabaseOfferType(value: string | null | undefined) {
  const offerType = normalizeOfferType(value);

  return offerType ? OFFER_TYPE_DATABASE_VALUES[offerType] : (value ?? null);
}

export function toDatabasePropertyType(value: string | null | undefined) {
  const propertyType = normalizePropertyType(value);

  return propertyType ? PROPERTY_TYPE_DATABASE_VALUES[propertyType] : (value ?? null);
}

export function toDatabaseOfferTypes(values: string[] | null | undefined) {
  return values?.map(toDatabaseOfferType).filter(isString) ?? null;
}

export function toDatabasePropertyTypes(values: string[] | null | undefined) {
  return values?.map(toDatabasePropertyType).filter(isString) ?? null;
}
