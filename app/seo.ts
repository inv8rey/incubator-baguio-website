// Single source of truth for the site's canonical production URL, used by
// layout metadata, robots.ts, sitemap.ts, and the dynamic OG image.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://incubator-baguio.vercel.app";
