import type { Metadata } from "next";

// Single source of truth for the site's canonical production URL, used by
// layout metadata, robots.ts, sitemap.ts, and the dynamic OG image.
// Falls back through Vercel's own production-domain variable before the
// hardcoded default, so a deployment on a custom domain emits correct
// canonical/sitemap URLs even when NEXT_PUBLIC_SITE_URL hasn't been set.
const VERCEL_PROD_URL = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (VERCEL_PROD_URL ? `https://${VERCEL_PROD_URL}` : "https://incubator-baguio.vercel.app");

/**
 * Per-page metadata: a canonical URL plus social tags that actually name the
 * page.
 *
 * Two things this fixes. Every page inherits the root layout's openGraph
 * block unless it sets its own, so sharing /challenges/ used to surface the
 * site-level title and description rather than the page's. And with
 * `trailingSlash: true` and filter links that carry query strings
 * (?category=, ?tab=), a page is reachable at several URLs that all serve the
 * same content — without a canonical those compete with each other in search.
 *
 * `path` is relative and resolved against metadataBase; include the trailing
 * slash so it matches the URL Next.js actually serves.
 */
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    // `images` is repeated from the root layout on purpose. A segment that
    // declares openGraph replaces the parent's block outright instead of
    // merging field by field, so omitting it here drops og:image from the
    // page entirely and social previews render with no card art.
    openGraph: { title, description, url: path, images: [{ url: "/api/og/", width: 1200, height: 630 }] },
    twitter: { title, description, images: ["/api/og/"] },
  };
}
