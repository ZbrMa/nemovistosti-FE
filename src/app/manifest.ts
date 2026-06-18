import type { MetadataRoute } from "next";

import { SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description:
      "Analytická platforma pro vývoj cen nemovitostí, aktivitu nabídky a regionální srovnání v Česku.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3ECF8E",
    lang: "cs-CZ",
  };
}
