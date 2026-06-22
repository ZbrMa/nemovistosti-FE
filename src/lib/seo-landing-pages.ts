import type { OfferType, PropertyType } from "@/lib/market-taxonomy";
import { SITE_NAME } from "@/lib/seo";
import type { MarketOverview, SeoLandingPage } from "@/types/market";

export type SeoLandingSummaryPart = {
  text: string;
  strong?: boolean;
};

export type SeoLandingSummaryParagraph = SeoLandingSummaryPart[];

const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  sell: "na prodej",
  rent: "k pronájmu",
};

const PROPERTY_TYPE_PLURALS: Record<Exclude<PropertyType, "other">, string> = {
  flat: "byty",
  house: "domy",
  land: "pozemky",
  commercial: "komerční nemovitosti",
};

const PROPERTY_TYPE_GENITIVES: Record<Exclude<PropertyType, "other">, string> = {
  flat: "bytů",
  house: "domů",
  land: "pozemků",
  commercial: "komerčních nemovitostí",
};

const PROPERTY_TYPE_CONTEXT: Record<Exclude<PropertyType, "other">, string> = {
  flat: "bytů",
  house: "domů",
  land: "pozemků",
  commercial: "komerčních nemovitostí",
};

export function getSeoOfferTypeLabel(offerType: OfferType) {
  return OFFER_TYPE_LABELS[offerType];
}

export function getSeoPropertyTypePlural(
  propertyType: Exclude<PropertyType, "other">,
) {
  return PROPERTY_TYPE_PLURALS[propertyType];
}

export function getSeoPropertyTypeGenitive(
  propertyType: Exclude<PropertyType, "other">,
) {
  return PROPERTY_TYPE_GENITIVES[propertyType];
}

export function buildSeoLandingHeadline(
  page: Pick<SeoLandingPage, "district" | "offer_type" | "property_type">,
) {
  return `Kolik stojí ${getSeoPropertyTypePlural(page.property_type as Exclude<PropertyType, "other">)} ${getSeoOfferTypeLabel(page.offer_type as OfferType)} v okrese ${page.district}?`;
}

export function buildSeoLandingMetaTitle(
  page: Pick<SeoLandingPage, "district" | "offer_type" | "property_type">,
) {
  return `Ceny ${getSeoPropertyTypeGenitive(page.property_type as Exclude<PropertyType, "other">)} ${getSeoOfferTypeLabel(page.offer_type as OfferType)} v okrese ${page.district}`;
}

export function buildSeoLandingDescription(overview: MarketOverview | null) {
  const overviewPart =
    overview?.avg_price !== null && overview?.median_price !== null
      ? "průměrnou a mediánovou nabídkovou cenu"
      : "přehled aktivních nabídek";

  return `Přehled aktuálně sledovaných aktivních nabídek včetně ${overviewPart}, ceny za m² a vývoje evidovaných nabídkových cen.`;
}

export function buildSeoLandingSummary(
  page: Pick<SeoLandingPage, "district" | "region" | "offer_type" | "property_type">,
  overview: MarketOverview | null,
) {
  const propertyType = page.property_type as Exclude<PropertyType, "other">;
  const offerType = page.offer_type as OfferType;
  const propertyPlural = getSeoPropertyTypePlural(propertyType);
  const propertyGenitive = PROPERTY_TYPE_CONTEXT[propertyType];
  const offerLabel = getSeoOfferTypeLabel(offerType);
  const listingsCount = getPositiveNumber(overview?.listings_count);
  const avgPrice = formatCurrencyValue(overview?.avg_price);
  const medianPrice = formatCurrencyValue(overview?.median_price);
  const avgPricePerM2 = formatPricePerM2Value(overview?.avg_price_per_m2);
  const medianPricePerM2 = formatPricePerM2Value(overview?.median_price_per_m2);
  const priceParts: SeoLandingSummaryPart[][] = [];

  if (medianPrice) {
    priceParts.push([
      { text: "mediánově kolem " },
      { text: medianPrice, strong: true },
    ]);
  }

  if (avgPrice) {
    priceParts.push([
      { text: "průměrně na " },
      { text: avgPrice, strong: true },
    ]);
  }

  const perM2Price = medianPricePerM2 ?? avgPricePerM2;

  if (perM2Price) {
    priceParts.push([
      { text: "cena za metr čtvereční se pohybuje okolo " },
      { text: perM2Price, strong: true },
    ]);
  }

  const paragraphs: SeoLandingSummaryParagraph[] = [];

  if (priceParts.length > 0) {
    paragraphs.push([
      { text: `${capitalize(propertyPlural)} ${offerLabel}` },
      { text: ` v okrese ` },
      { text: page.district, strong: true },
      {
        text: " se podle aktuálně evidovaných aktivních nabídek pohybují ",
      },
      ...joinSummaryParts(priceParts),
      { text: "." },
    ]);
  } else {
    paragraphs.push([
      { text: `${capitalize(propertyPlural)} ${offerLabel}` },
      { text: " v okrese " },
      { text: page.district, strong: true },
      {
        text: " sledujeme podle aktuálně evidovaných aktivních nabídek. Stránka poskytuje orientační přehled nabídkových cen a vývoje monitorovaných nabídek.",
      },
    ]);
  }

  const contextParagraph: SeoLandingSummaryParagraph = [];

  if (listingsCount) {
    contextParagraph.push(
      { text: "Aktuálně eviduji " },
      {
        text: `${formatCountValue(listingsCount)} aktivních nabídek`,
        strong: true,
      },
      { text: " v tomto segmentu. " },
    );
  }

  contextParagraph.push(
    { text: "Stránka sleduje segment " },
    { text: `${propertyGenitive} ${offerLabel}`, strong: true },
    { text: " v okrese " },
    { text: page.district, strong: true },
    { text: " v regionu " },
    { text: page.region, strong: true },
    {
      text: " a ukazuje nabídkové ceny, cenu za m² i vývoj počtu aktivních nabídek.",
    },
  );

  paragraphs.push(contextParagraph);

  paragraphs.push([
    {
      text: "Data berte jako orientační přehled monitorované nabídkové strany trhu. Nejde o realizované prodejní ceny ani o úplný obraz celého trhu.",
    },
  ]);

  return paragraphs;
}

function getPositiveNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function formatCountValue(value: number) {
  return new Intl.NumberFormat("cs-CZ").format(value);
}

function formatCurrencyValue(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPricePerM2Value(value: number | null | undefined) {
  const formatted = formatCurrencyValue(value);

  return formatted ? `${formatted}/m²` : null;
}

function joinSummaryParts(parts: SeoLandingSummaryPart[][]) {
  if (parts.length <= 1) {
    return parts[0] ?? [];
  }

  if (parts.length === 2) {
    return [...parts[0], { text: " a " }, ...parts[1]];
  }

  return parts.flatMap((part, index) => {
    if (index === 0) {
      return part;
    }

    if (index === parts.length - 1) {
      return [{ text: " a " }, ...part];
    }

    return [{ text: ", " }, ...part];
  });
}

function capitalize(value: string) {
  return value.length > 0 ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}
