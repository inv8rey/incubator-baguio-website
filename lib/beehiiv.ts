// Beehiiv is where the newsletter is sent from, so every website signup is
// pushed to the publication there. Server-side only: the API key never
// reaches the browser.
//
// Needs BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID (starts with "pub_") in the
// environment. When either is missing, callers fall back to the built-in
// Resend welcome email so signups still get something.

import { SITE_URL } from "../app/seo";

// Trimmed (and unquoted): a stray space or quote pasted into the host's env
// settings ends up inside the request URL and Beehiiv rejects it.
const clean = (v?: string) => (v || "").trim().replace(/^["']|["']$/g, "").trim();
const API_KEY = clean(process.env.BEEHIIV_API_KEY);
const PUBLICATION_ID = clean(process.env.BEEHIIV_PUBLICATION_ID);

export function beehiivConfigured(): boolean {
  return !!API_KEY && !!PUBLICATION_ID;
}

/**
 * Adds (or re-uses) a subscriber in the Beehiiv publication. `sendWelcome`
 * asks Beehiiv to send the welcome email you set up there; pass false for
 * back-fills so existing subscribers aren't all welcomed at once. Never throws.
 */
export async function syncToBeehiiv(email: string, opts: { sendWelcome: boolean; source?: string }): Promise<{ ok: boolean; reason?: string }> {
  if (!beehiivConfigured()) return { ok: false, reason: "Beehiiv is not configured" };
  try {
    const res = await fetch(`https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: opts.sendWelcome,
        utm_source: "website",
        utm_medium: opts.source || "signup",
        referring_site: SITE_URL,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("syncToBeehiiv: Beehiiv returned", res.status, body);
      // Beehiiv error bodies describe the problem (bad key, wrong publication
      // ID, plan without API access...) and never echo the key back.
      return { ok: false, reason: `Beehiiv responded ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("syncToBeehiiv: request failed", err);
    return { ok: false, reason: "request failed" };
  }
}
