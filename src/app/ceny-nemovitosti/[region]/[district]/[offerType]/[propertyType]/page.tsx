import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Clock3,
  Percent,
  PlusCircle,
  Ruler,
  TrendingDown,
} from "lucide-react";
import { notFound } from "next/navigation";

import { MarketTimeseriesChart } from "@/features/market-overview/market-timeseries-chart";
import {
  formatCount,
  formatCurrency,
  formatDays,
  formatPricePerM2,
} from "@/features/market-overview/market-formatters";
import { SeoMarketSummary } from "@/app/homepage/components/seo-market-summary";
import { buttonVariants } from "@/components/ui/button";
import {
  getMarketActivitySummary,
  getMarketFacets,
  getMarketOverview,
  getMarketTimeseries,
  getSeoLandingPageBySlug,
} from "@/lib/api/market";
import {
  buildSeoLandingDescription,
  buildSeoLandingHeadline,
  buildSeoLandingMetaTitle,
  buildSeoLandingSummary,
  getSeoOfferTypeLabel,
  getSeoPropertyTypePlural,
} from "@/lib/seo-landing-pages";
import { buildCollectionPageSchema } from "@/lib/seo";
import {
  normalizeOfferType,
  normalizePropertyType,
  type OfferType,
  type PropertyType,
} from "@/lib/market-taxonomy";
import { toAbsoluteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import type {
  MarketActivitySummary,
  MarketFacets,
  MarketOverview,
  MarketTimeseriesPoint,
  SeoLandingPage,
} from "@/types/market";

export const revalidate = 86400;

type SeoLandingPageProps = {
  params: Promise<{
    region: string;
    district: string;
    offerType: string;
    propertyType: string;
  }>;
};

type SeoLandingData = {
  overview: MarketOverview | null;
  benchmarkOverview: MarketOverview | null;
  activitySummary: MarketActivitySummary | null;
  timeseries: MarketTimeseriesPoint[];
  facets: MarketFacets | null;
};

type TrendSummary = {
  hasEnoughData: boolean;
  points: MarketTimeseriesPoint[];
  commentary: ReactNode;
};

export async function generateMetadata({
  params,
}: SeoLandingPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = buildLandingSlug(resolvedParams);
  const page = await getSeoLandingPageBySlug(slug);

  if (!page || !isSupportedSeoLandingPage(page)) {
    return {};
  }

  const overview = await getSeoLandingOverview(page);
  const title = buildSeoLandingMetaTitle(page);
  const description = buildSeoLandingDescription(overview);

  return {
    title,
    description,
    alternates: {
      canonical: page.slug,
    },
    openGraph: {
      title,
      description,
      url: toAbsoluteUrl(page.slug),
    },
  };
}

export default async function SeoLandingPageRoute({
  params,
}: SeoLandingPageProps) {
  const resolvedParams = await params;
  const slug = buildLandingSlug(resolvedParams);
  const page = await getSeoLandingPageBySlug(slug);

  if (!page || !isSupportedSeoLandingPage(page)) {
    notFound();
  }

  const { overview, benchmarkOverview, activitySummary, timeseries, facets } =
    await getSeoLandingData(page);
  const title = buildSeoLandingHeadline(page);
  const metaTitle = buildSeoLandingMetaTitle(page);
  const metaDescription = buildSeoLandingDescription(overview);
  const intro = buildSeoLandingSummary(page, overview);
  const priceInterpretation = buildPriceInterpretation(
    page,
    overview,
    benchmarkOverview,
  );
  const listingHref = buildSegmentListingsHref(page);
  const hasListings = (overview?.listings_count ?? 0) > 0;
  const trendData = getTrendSummary(timeseries);
  const activityCommentary = buildActivityCommentary(activitySummary);
  const seoSchema = buildCollectionPageSchema({
    title: metaTitle,
    description: metaDescription,
    path: page.slug,
  });
  const stats = [
    {
      label: "Počet aktivních nabídek",
      value: formatNullableMetric(overview?.listings_count, formatCount, hasListings),
      description: "Denní agregace aktivního trhu",
      icon: Building2,
    },
    {
      label: "Průměrná cena",
      value: formatNullableMetric(overview?.avg_price, formatCurrency, hasListings),
      description: "Průměr aktuálně evidovaných nabídek",
      icon: BarChart3,
    },
    {
      label: "Mediánová cena",
      value: formatNullableMetric(overview?.median_price, formatCurrency, hasListings),
      description: "Středová hodnota nabídkových cen",
      icon: BarChart3,
    },
    {
      label: "Průměrná cena za m²",
      value: formatNullableMetric(
        overview?.avg_price_per_m2,
        formatPricePerM2,
        hasListings,
      ),
      description: "Srovnatelná metrika mezi nabídkami",
      icon: Percent,
    },
    {
      label: "Mediánová cena za m²",
      value: formatNullableMetric(
        overview?.median_price_per_m2,
        formatPricePerM2,
        hasListings,
      ),
      description: "Středová hodnota ceny za m²",
      icon: Percent,
    },
    {
      label: "Průměrná plocha",
      value: formatAreaMetric(overview?.avg_area_m2, hasListings),
      description: "Průměrná evidovaná plocha nabídek",
      icon: Ruler,
    },
  ];
  const activityItems = [
    {
      label: "Nové nabídky za 30 dní",
      value: formatNullableMetric(
        activitySummary?.new_listings_30d,
        formatCount,
        true,
      ),
      icon: PlusCircle,
    },
    {
      label: "Stažené nabídky za 30 dní",
      value: formatNullableMetric(
        activitySummary?.inactive_listings_30d,
        formatCount,
        true,
      ),
      icon: TrendingDown,
    },
    {
      label: "Zlevněné aktivní nabídky",
      value: formatNullableMetric(
        activitySummary?.discounted_listings_30d,
        formatCount,
        true,
      ),
      icon: TrendingDown,
    },
    {
      label: "Průměrné stáří aktivních nabídek",
      value:
        activitySummary?.avg_listing_age_days === null ||
        activitySummary?.avg_listing_age_days === undefined
          ? "Nedostatek dat"
          : formatDays(activitySummary.avg_listing_age_days),
      icon: Clock3,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoSchema) }}
      />
      <div className="mx-auto w-full max-w-[1300px] px-0 lg:px-8">
        <div className="border-x border-dashed">
        <section className="border-b border-dashed px-5 py-8 sm:px-16 sm:py-12">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              {intro.map((paragraph, paragraphIndex) => (
                <p key={`intro-${paragraphIndex}`}>
                  {paragraph.map((part, partIndex) =>
                    part.strong ? (
                      <strong key={partIndex} className="text-foreground">
                        {part.text}
                      </strong>
                    ) : (
                      <span key={partIndex}>{part.text}</span>
                    ),
                  )}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Link
              href={listingHref}
              className={cn(
                buttonVariants({ variant: "primaryOutline" }),
                "group",
              )}
            >
              Zobrazit související nabídky
              <ArrowRight className="transition-transform duration-150 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        <section className="grid border-y border-dashed bg-background sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={cn(
                  "relative border-b border-dashed bg-accent/50 p-5 last:border-b-0 sm:border-r sm:p-8 sm:[&:nth-child(2n)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:px-8 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-last-child(-n+3)]:border-b-0",
                  index % 2 === 0 ? "sm:pl-8" : "sm:pr-8",
                  index % 3 === 0 && "lg:pl-8",
                  index % 3 === 2 && "lg:pr-8",
                )}
              >
                <Icon className="absolute right-5 top-5 size-10 text-border/50" />
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                  {item.value}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </section>

        <section className="border-b border-dashed px-5 py-8 sm:px-16 sm:py-10">
          <div className="max-w-4xl">
            <h2 className="text-xl font-semibold tracking-tight">
              Co z cen vyplývá
            </h2>
            <div className="mt-3 text-sm leading-7 text-muted-foreground">
              {priceInterpretation}
            </div>
          </div>
        </section>

        <section className="border-b border-dashed py-8 sm:py-10">

          {trendData.hasEnoughData ? (
            <>
              <MarketTimeseriesChart points={trendData.points} />
              {trendData.commentary ? (
                <div className="px-5 pb-8 sm:px-16">
                  <div className="max-w-4xl text-sm leading-7 text-muted-foreground">
                    {trendData.commentary}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="px-5 pt-6 sm:px-16">
              <div className="flex min-h-40 items-center justify-center border border-dashed bg-accent/20 text-sm text-muted-foreground">
                Pro vývoj trhu zatím nemáme dostupnou časovou řadu aktivních nabídek.
              </div>
            </div>
          )}
        </section>

        <section className="border-b border-dashed py-8 sm:py-10">
          <div className="px-5 sm:px-16">
            <h2 className="text-xl font-semibold tracking-tight">
              Aktivita trhu za posledních 30 dní
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Přehled pracuje pouze s aktuálně evidovanými a historicky zachycenými
              nabídkami v databázi, nikoliv s celým trhem.
            </p>
          </div>

          <div className="mt-6 grid border-y border-dashed bg-accent/25 sm:grid-cols-2 lg:grid-cols-4">
            {activityItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={cn(
                    "relative border-b border-dashed p-5 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0",
                    index >= 2 && "lg:border-b-0",
                  )}
                >
                  <Icon className="absolute right-5 top-5 size-5 text-muted-foreground/45" />
                  <div className="text-2xl font-semibold tracking-tight tabular-nums">
                    {item.value}
                  </div>
                  <p className="mt-2 max-w-44 text-sm text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          {activityCommentary ? (
            <div className="px-5 pt-6 sm:px-16">
              <div className="max-w-4xl text-sm leading-7 text-muted-foreground">
                {activityCommentary}
              </div>
            </div>
          ) : null}
        </section>

        <SeoMarketSummary
          facets={facets}
          ctaHref={listingHref}
          ctaLabel="Zobrazit další analýzy"
        />
        </div>
      </div>
    </>
  );
}

function buildLandingSlug(params: {
  region: string;
  district: string;
  offerType: string;
  propertyType: string;
}) {
  return `/ceny-nemovitosti/${params.region}/${params.district}/${params.offerType}/${params.propertyType}`;
}

function isSupportedSeoLandingPage(
  page: SeoLandingPage,
): page is SeoLandingPage & {
  offer_type: OfferType;
  property_type: Exclude<PropertyType, "other">;
} {
  return (
    normalizeOfferType(page.offer_type) !== null &&
    normalizePropertyType(page.property_type) !== null &&
    normalizePropertyType(page.property_type) !== "other"
  );
}

async function getSeoLandingData(page: SeoLandingPage): Promise<SeoLandingData> {
  const [overview, benchmarkOverview, activitySummary, timeseries, facets] = await Promise.all([
    getSeoLandingOverview(page),
    getSeoLandingBenchmarkOverview(page),
    getSeoLandingActivitySummary(page),
    getSeoLandingTimeseries(page),
    getMarketFacets().catch(() => null),
  ]);

  return {
    overview,
    benchmarkOverview,
    activitySummary,
    timeseries,
    facets,
  };
}

async function getSeoLandingOverview(page: SeoLandingPage): Promise<MarketOverview | null> {
  try {
    return await getMarketOverview({
      p_region: page.region,
      p_district: page.district,
      p_property_type: page.property_type,
      p_offer_type: page.offer_type,
      p_city: null,
      p_disposition: null,
    });
  } catch (error) {
    console.error(
      "[seo_landing.market_overview]",
      error instanceof Error ? error.message : error,
    );

    return null;
  }
}

async function getSeoLandingBenchmarkOverview(
  page: SeoLandingPage,
): Promise<MarketOverview | null> {
  try {
    return await getMarketOverview({
      p_region: null,
      p_district: null,
      p_property_type: page.property_type,
      p_offer_type: page.offer_type,
      p_city: null,
      p_disposition: null,
    });
  } catch (error) {
    console.error(
      "[seo_landing.market_overview_benchmark]",
      error instanceof Error ? error.message : error,
    );

    return null;
  }
}

async function getSeoLandingActivitySummary(
  page: SeoLandingPage,
): Promise<MarketActivitySummary | null> {
  try {
    return await getMarketActivitySummary({
      p_regions: [page.region],
      p_districts: [page.district],
      p_property_types: [page.property_type],
      p_offer_types: [page.offer_type],
      p_metric_date: getDateToday(),
    });
  } catch (error) {
    console.error(
      "[seo_landing.market_activity_summary]",
      error instanceof Error ? error.message : error,
    );

    return null;
  }
}

async function getSeoLandingTimeseries(
  page: SeoLandingPage,
): Promise<MarketTimeseriesPoint[]> {
  try {
    return await getMarketTimeseries({
      p_region: page.region,
      p_district: page.district,
      p_property_type: page.property_type,
      p_offer_type: page.offer_type,
      p_from: getDateMonthsAgo(12),
      p_to: getDateToday(),
    });
  } catch (error) {
    console.error(
      "[seo_landing.market_timeseries]",
      error instanceof Error ? error.message : error,
    );

    return [];
  }
}

function buildSegmentListingsHref(page: SeoLandingPage) {
  const offerTypeSegment = page.offer_type === "rent" ? "pronajem" : "prodej";
  const propertyTypeSegment = getPropertyTypeSegment(page.property_type);
  const searchParams = new URLSearchParams({
    kraj: page.region,
    okres: page.district,
  });

  return `/${offerTypeSegment}/${propertyTypeSegment}?${searchParams.toString()}`;
}

function getPropertyTypeSegment(propertyType: string) {
  if (propertyType === "house") {
    return "domy";
  }

  if (propertyType === "land") {
    return "pozemky";
  }

  if (propertyType === "commercial") {
    return "komercni";
  }

  return "byty";
}

function buildPriceInterpretation(
  page: SeoLandingPage,
  overview: MarketOverview | null,
  benchmarkOverview: MarketOverview | null,
) {
  const propertyPlural = getSeoPropertyTypePlural(
    page.property_type as Exclude<PropertyType, "other">,
  );
  const offerLabel = getSeoOfferTypeLabel(page.offer_type as OfferType);
  const comments: ReactNode[] = [
    <p key="context">
      Podle aktuálně evidovaných aktivních nabídek v databázi pro segment{" "}
      <strong>{propertyPlural} {offerLabel}</strong> v okrese{" "}
      <strong>{page.district}</strong> je vhodné číst cenové metriky jako
      orientační obraz nabídkové strany trhu, nikoliv jako realizované ceny.
    </p>,
  ];

  if (
    typeof overview?.avg_price === "number" &&
    typeof overview?.median_price === "number" &&
    overview.median_price > 0
  ) {
    const diffRatio = (overview.avg_price - overview.median_price) / overview.median_price;

    if (diffRatio >= 0.1) {
      comments.push(
        <p key="avg-high">
          <strong>Průměrná cena</strong> je výrazně nad <strong>mediánem</strong>,
          což může ukazovat na několik dražších nabídek, které průměr vytahují
          nahoru.
        </p>,
      );
    } else if (diffRatio <= -0.1) {
      comments.push(
        <p key="median-high">
          <strong>Mediánová cena</strong> je výš než <strong>průměr</strong>,
          takže cenové rozložení může být ovlivněno větším počtem levnějších
          nabídek.
        </p>,
      );
    } else {
      comments.push(
        <p key="balanced">
          <strong>Průměr</strong> a <strong>medián</strong> jsou si blízko, takže
          cenové rozložení aktivních nabídek působí relativně vyrovnaně.
        </p>,
      );
    }
  }

  if (
    typeof overview?.avg_price_per_m2 === "number" ||
    typeof overview?.median_price_per_m2 === "number"
  ) {
    comments.push(
      <p key="per-m2">
        <strong>Cena za m²</strong> pomáhá porovnávat různě velké nemovitosti a
        doplňuje celkovou nabídkovou cenu o srovnatelnější pohled mezi menšími a
        většími jednotkami.
      </p>,
    );
  }

  if (typeof overview?.avg_area_m2 === "number") {
    comments.push(
      <p key="area">
        <strong>Průměrná evidovaná plocha</strong> vychází na{" "}
        <strong>{formatAreaMetric(overview.avg_area_m2, true)}</strong>, což
        pomáhá zasadit cenovou hladinu do kontextu typické velikosti nabídek v
        databázi.
      </p>,
    );
  }

  const segmentComparison = buildSegmentComparison(
    page,
    overview,
    benchmarkOverview,
  );

  if (segmentComparison) {
    comments.push(segmentComparison);
  }

  return <div className="space-y-3">{comments}</div>;
}

function buildSegmentComparison(
  page: SeoLandingPage,
  overview: MarketOverview | null,
  benchmarkOverview: MarketOverview | null,
) {
  const localPricePerM2 = overview?.median_price_per_m2 ?? overview?.avg_price_per_m2;
  const benchmarkPricePerM2 =
    benchmarkOverview?.median_price_per_m2 ?? benchmarkOverview?.avg_price_per_m2;
  const propertyPlural = getSeoPropertyTypePlural(
    page.property_type as Exclude<PropertyType, "other">,
  );

  if (
    typeof localPricePerM2 !== "number" ||
    typeof benchmarkPricePerM2 !== "number" ||
    benchmarkPricePerM2 <= 0
  ) {
    return null;
  }

  const ratio = (localPricePerM2 - benchmarkPricePerM2) / benchmarkPricePerM2;

  if (ratio >= 0.1) {
    return (
      <p key="benchmark-high">
        Ve srovnání s celkovým přehledem bez regionálních filtrů vychází tato
        lokalita u segmentu <strong>{propertyPlural}</strong>{" "}
        <strong>nad celkovým průměrem</strong>. Cena za m² je zde podle aktuálně
        evidovaných nabídek vyšší než celorepublikový průměr stejného segmentu.
      </p>
    );
  }

  if (ratio <= -0.1) {
    return (
      <p key="benchmark-low">
        Ve srovnání s celkovým přehledem bez regionálních filtrů vychází tato
        lokalita u segmentu <strong>{propertyPlural}</strong>{" "}
        <strong>pod celkovým průměrem</strong>. Cena za m² je zde podle
        aktuálně evidovaných nabídek nižší než průměr stejného segmentu bez
        omezení na konkrétní okres.
      </p>
    );
  }

  return (
    <p key="benchmark-balanced">
      Ve srovnání s celkovým přehledem bez regionálních filtrů se tato lokalita
      u segmentu <strong>{propertyPlural}</strong> pohybuje{" "}
      <strong>blízko celkového průměru</strong>. Z pohledu ceny za m² tedy
      nejde ani o výrazně dražší, ani o výrazně levnější část sledovaného
      segmentu.
    </p>
  );
}

function getTrendSummary(points: MarketTimeseriesPoint[]): TrendSummary {
  const sortedPoints = points
    .filter(
      (point) =>
        typeof point.listings_count === "number" ||
        typeof point.avg_price === "number" ||
        typeof point.avg_price_per_m2 === "number",
    )
    .sort((a, b) => a.period.localeCompare(b.period));

  if (sortedPoints.length === 0) {
    return {
      hasEnoughData: false,
      points,
      commentary: "",
    };
  }

  if (sortedPoints.length < 2) {
    return {
      hasEnoughData: true,
      points: sortedPoints,
      commentary: "",
    };
  }

  const firstPoint = sortedPoints[0];
  const lastPoint = sortedPoints[sortedPoints.length - 1];
  const firstValue = firstPoint.avg_price;
  const lastValue = lastPoint.avg_price;

  if (
    typeof firstValue !== "number" ||
    typeof lastValue !== "number" ||
    firstValue <= 0
  ) {
    return {
      hasEnoughData: true,
      points,
      commentary: "",
    };
  }

  const changeRatio = (lastValue - firstValue) / firstValue;
  const metricLabel = "průměrné evidované nabídkové ceny";
  let commentary: ReactNode;

  if (changeRatio >= 0.1) {
    commentary = (
      <p>
        Ve sledovaném období <strong>{metricLabel}</strong> vzrostly. Nejde o
        realizované ceny, ale o posun v cenové hladině aktuálně evidovaných
        nabídek v databázi.
      </p>
    );
  } else if (changeRatio <= -0.1) {
    commentary = (
      <p>
        Ve sledovaném období <strong>{metricLabel}</strong> klesly. Komentář
        vychází z evidovaných nabídkových cen, nikoliv z uzavřených transakcí.
      </p>
    );
  } else {
    commentary = (
      <p>
        Ve sledovaném období byly <strong>{metricLabel}</strong> relativně
        stabilní a bez výrazného posunu v rámci aktuálně evidovaných nabídek.
      </p>
    );
  }

  return {
    hasEnoughData: true,
    points,
    commentary,
  };
}

function buildActivityCommentary(summary: MarketActivitySummary | null) {
  if (!summary) {
    return null;
  }

  const comments: ReactNode[] = [];

  if (summary.new_listings_30d >= 20) {
    comments.push(
      <p key="new">
        <strong>Vyšší počet nových nabídek</strong> naznačuje zvýšenou aktivitu
        na straně nabídky v posledních 30 dnech.
      </p>,
    );
  }

  if (summary.discounted_listings_30d >= 10) {
    comments.push(
      <p key="discounted">
        Část prodávajících nebo pronajímatelů v posledním období{" "}
        <strong>upravovala cenu směrem dolů</strong>, což je v datech vidět na
        počtu zlevněných aktivních nabídek.
      </p>,
    );
  }

  if (
    typeof summary.avg_listing_age_days === "number" &&
    summary.avg_listing_age_days >= 90
  ) {
    comments.push(
      <p key="age">
        <strong>Průměrné stáří aktivních nabídek</strong> je vyšší, takže některé
        nabídky zůstávají v databázi delší dobu.
      </p>,
    );
  }

  if (comments.length === 0) {
    return null;
  }

  return <div className="space-y-3">{comments}</div>;
}

function getDateMonthsAgo(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);

  return date.toISOString().slice(0, 10);
}

function getDateToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatNullableMetric(
  value: number | null | undefined,
  formatter: (value: number | null | undefined) => string,
  hasData: boolean,
) {
  if (!hasData || value === null || value === undefined) {
    return "Nedostatek dat";
  }

  return formatter(value);
}

function formatAreaMetric(value: number | null | undefined, hasData: boolean) {
  if (!hasData || value === null || value === undefined) {
    return "Nedostatek dat";
  }

  return `${new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 1,
  }).format(value)} m²`;
}
