import { revalidatePath, revalidateTag } from "next/cache";

import { LISTINGS_DATA_CACHE_TAG } from "@/lib/api/listings";
import { MARKET_DATA_CACHE_TAG } from "@/lib/api/market";

const MARKET_PATHS = [
  "/",
  "/sitemap.xml",
  "/nabidky",
  "/navratnost-pronajmu",
  "/prodej",
  "/prodej/byty",
  "/prodej/domy",
  "/prodej/pozemky",
  "/prodej/komercni",
  "/prodej/ostatni",
  "/pronajem",
  "/pronajem/byty",
  "/pronajem/domy",
  "/pronajem/pozemky",
  "/pronajem/komercni",
  "/pronajem/ostatni",
];

const MARKET_ROUTE_PATTERNS = [
  "/ceny-nemovitosti/[region]/[district]/[offerType]/[propertyType]",
];

const CACHE_TAGS = [MARKET_DATA_CACHE_TAG, LISTINGS_DATA_CACHE_TAG];

export async function GET(request: Request) {
  const expectedToken = process.env.REVALIDATE_TOKEN;

  if (!expectedToken) {
    return Response.json(
      {
        ok: false,
        error: "Missing REVALIDATE_TOKEN environment variable.",
      },
      { status: 500 },
    );
  }

  const token = getRequestToken(request);

  if (token !== expectedToken) {
    return Response.json(
      {
        ok: false,
        error: "Invalid revalidation token.",
      },
      { status: 401 },
    );
  }

  for (const tag of CACHE_TAGS) {
    revalidateTag(tag, { expire: 0 });
  }

  for (const path of MARKET_PATHS) {
    revalidatePath(path);
  }

  for (const pattern of MARKET_ROUTE_PATTERNS) {
    revalidatePath(pattern, "page");
  }

  return Response.json({
    ok: true,
    revalidatedAt: new Date().toISOString(),
    paths: MARKET_PATHS,
    routePatterns: MARKET_ROUTE_PATTERNS,
    tags: CACHE_TAGS,
  });
}

function getRequestToken(request: Request) {
  const queryToken = new URL(request.url).searchParams.get("token");

  if (queryToken) {
    return queryToken;
  }

  const authorization = request.headers.get("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  return scheme?.toLowerCase() === "bearer" ? token : null;
}
