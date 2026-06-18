const DEFAULT_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const directUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (directUrl) {
    return directUrl;
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
    ?? process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  }

  return DEFAULT_SITE_URL;
}

export function toAbsoluteUrl(pathname: string) {
  return new URL(pathname, getSiteUrl()).toString();
}
