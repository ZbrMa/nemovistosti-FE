import { revalidatePath, revalidateTag } from "next/cache";

import { MARKET_DATA_CACHE_TAG } from "@/lib/api/market";

const MARKET_PATHS = [
  "/",
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

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!process.env.REVALIDATE_TOKEN || token !== process.env.REVALIDATE_TOKEN) {
    return Response.json({ ok: false }, { status: 401 });
  }

  revalidateTag(MARKET_DATA_CACHE_TAG, { expire: 0 });

  for (const path of MARKET_PATHS) {
    revalidatePath(path);
  }

  return Response.json({
    ok: true,
    revalidatedAt: new Date().toISOString(),
    paths: MARKET_PATHS,
    tags: [MARKET_DATA_CACHE_TAG],
  });
}
