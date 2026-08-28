// Single source of truth for the site's canonical production URL, used by
// layout metadata, robots.ts, sitemap.ts, and the dynamic OG image.
// Falls back through Vercel's own production-domain variable before the
// hardcoded default, so a deployment on a custom domain emits correct
// canonical/sitemap URLs even when NEXT_PUBLIC_SITE_URL hasn't been set.
const VERCEL_PROD_URL = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (VERCEL_PROD_URL ? `https://${VERCEL_PROD_URL}` : "https://incubator-baguio.vercel.app");
