import { NextRequest, NextResponse } from "next/server";

// Auto-thumbnail for a Knowledge Hub resource's reference link. Rather than
// screenshotting the page (needs a paid third-party API + a key someone has
// to sign up for), this pulls the page's own og:image/twitter:image -- the
// same preview image Slack, Twitter, or iMessage would show for that link.
// Free, no API key, and it's what most sites already publish for exactly
// this purpose.
//
// <img src="/api/link-preview?url=..."> and this redirects straight to the
// resolved image, so the browser fetches the image from its original host
// (no bytes proxied through us) and a 404 here just fails the <img> quietly
// -- the caller's onError hides the wrapper. Never persisted: a resource's
// coverImageUrl (an admin upload) always wins over this and is checked
// first by the caller, so this only ever runs for resources that don't
// have one.

export const dynamic = "force-dynamic";

const FETCH_TIMEOUT_MS = 5000;
// Enough to comfortably reach </head> on real-world pages without
// downloading an entire (possibly huge) document body just to read meta tags.
const MAX_BYTES = 300_000;

const PRIVATE_HOST_RE =
  /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0|::1$|::$|f[cd][0-9a-f]{2}:)/i;
/** 172.16.0.0 - 172.31.255.255 */
function isPrivate172(host: string) {
  const m = host.match(/^172\.(\d{1,3})\./);
  return !!m && Number(m[1]) >= 16 && Number(m[1]) <= 31;
}

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return PRIVATE_HOST_RE.test(h) || isPrivate172(h) || h.endsWith(".local");
}

/** Reads meta tags one at a time so `property`/`content` order doesn't matter. */
function extractMetaContent(html: string, keys: string[]): string | null {
  const metaTagRe = /<meta\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = metaTagRe.exec(html))) {
    const tag = match[0];
    const nameMatch = tag.match(/(?:property|name)\s*=\s*["']([^"']+)["']/i);
    if (!nameMatch || !keys.includes(nameMatch[1].toLowerCase())) continue;
    const contentMatch = tag.match(/content\s*=\s*["']([^"']*)["']/i);
    if (contentMatch?.[1]) return contentMatch[1];
  }
  return null;
}

/** Fetches just enough of the page to read its <head>, capped at MAX_BYTES. */
async function fetchHead(url: string, signal: AbortSignal): Promise<string> {
  const res = await fetch(url, {
    signal,
    redirect: "follow",
    headers: {
      // Identifies the fetch as a link-preview bot (same courtesy real
      // preview services extend) rather than pretending to be a browser.
      "User-Agent": "Mozilla/5.0 (compatible; IncubatorBaguioLinkPreview/1.0; +https://incubatorbaguio.online)",
      Accept: "text/html",
    },
  });
  if (!res.ok || !res.body) throw new Error(`Fetch failed: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let html = "";
  let bytes = 0;
  while (bytes < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    html += decoder.decode(value, { stream: true });
    if (/<\/head>/i.test(html)) break;
  }
  reader.cancel().catch(() => {});
  return html;
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) return new NextResponse("Missing url", { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return new NextResponse("Unsupported protocol", { status: 400 });
  }
  if (isBlockedHost(target.hostname)) {
    return new NextResponse("Host not allowed", { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const html = await fetchHead(target.toString(), controller.signal);
    const image =
      extractMetaContent(html, ["og:image", "og:image:url", "og:image:secure_url"]) ??
      extractMetaContent(html, ["twitter:image", "twitter:image:src"]);
    if (!image) return new NextResponse("No preview image", { status: 404 });

    const resolved = new URL(image, target).toString();
    if (isBlockedHost(new URL(resolved).hostname)) {
      return new NextResponse("Host not allowed", { status: 400 });
    }

    return NextResponse.redirect(resolved, {
      status: 302,
      headers: {
        // Cached aggressively -- a site's preview image essentially never
        // changes, and this saves re-fetching + re-parsing its HTML on
        // every Knowledge Hub page view.
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      },
    });
  } catch {
    return new NextResponse("Could not fetch preview", { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
