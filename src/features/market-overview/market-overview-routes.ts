import {
  OFFER_TYPE,
  PROPERTY_TYPE,
  type OfferType,
  type PropertyType,
} from "@/lib/market-taxonomy";

export type PropertyCategoryRoute = {
  label: string;
  pluralLabel: string;
  slug: string;
  propertyType: PropertyType;
};

export type MarketOverviewQueryFilters = {
  regions?: string[];
  districts?: string[];
};

export const offerTypeBasePaths: Record<OfferType, string> = {
  [OFFER_TYPE.sell]: "/prodej",
  [OFFER_TYPE.rent]: "/pronajem",
};

export const propertyCategoryRoutes: PropertyCategoryRoute[] = [
  {
    label: "Byty",
    pluralLabel: "bytů",
    slug: "byty",
    propertyType: PROPERTY_TYPE.flat,
  },
  {
    label: "Domy",
    pluralLabel: "domů",
    slug: "domy",
    propertyType: PROPERTY_TYPE.house,
  },
  {
    label: "Pozemky",
    pluralLabel: "pozemků",
    slug: "pozemky",
    propertyType: PROPERTY_TYPE.land,
  },
  {
    label: "Komerční",
    pluralLabel: "komerčních nemovitostí",
    slug: "komercni",
    propertyType: PROPERTY_TYPE.commercial,
  },
  {
    label: "Ostatní",
    pluralLabel: "ostatních nemovitostí",
    slug: "ostatni",
    propertyType: PROPERTY_TYPE.other,
  },
];

export function getOfferTypePath(
  offerType: OfferType,
  propertyType?: PropertyType | null,
) {
  const basePath = offerTypeBasePaths[offerType];
  const category = propertyType
    ? propertyCategoryRoutes.find((item) => item.propertyType === propertyType)
    : null;

  return category ? `${basePath}/${category.slug}` : basePath;
}

export function getMarketOverviewHref(
  offerType: OfferType,
  propertyType?: PropertyType | null,
  filters?: MarketOverviewQueryFilters,
) {
  const pathname = getOfferTypePath(offerType, propertyType);
  const searchParams = new URLSearchParams();

  for (const region of filters?.regions ?? []) {
    searchParams.append("kraj", region);
  }

  for (const district of filters?.districts ?? []) {
    searchParams.append("okres", district);
  }

  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function getPropertyCategory(propertyType: PropertyType | null | undefined) {
  return propertyType
    ? propertyCategoryRoutes.find((item) => item.propertyType === propertyType) ??
        null
    : null;
}
