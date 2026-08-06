// Server-only. The write-only client key (NEXT_PUBLIC_POSTHOG_KEY) that the
// site uses to send events can't read data back -- reading requires a
// separate Personal API Key plus the numeric project id, both created from
// the PostHog account (Settings -> Personal API Keys for the key, Project
// Settings -> General for the id). Never expose either as NEXT_PUBLIC_*.
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

export function postHogConfigured(): boolean {
  return !!(POSTHOG_PROJECT_ID && POSTHOG_PERSONAL_API_KEY);
}

/**
 * Runs one HogQL query against PostHog's Query API. Returns rows as
 * positional arrays matching the SELECT column order -- the caller indexes
 * into each row rather than relying on column names, since HogQL doesn't
 * guarantee the `columns` field names match the query's `as` aliases.
 */
export async function runHogQL(query: string): Promise<any[][]> {
  if (!POSTHOG_PROJECT_ID || !POSTHOG_PERSONAL_API_KEY) {
    throw new Error("PostHog isn't configured (missing POSTHOG_PROJECT_ID or POSTHOG_PERSONAL_API_KEY).");
  }
  const res = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // The detailed HogQL/ClickHouse error (bad syntax, unknown column, etc.)
    // is genuinely useful for fixing a query and never contains user data,
    // so it's safe to log in full -- just never forwarded to the client.
    console.error("runHogQL failed:", res.status, JSON.stringify(body));
    throw new Error(body?.detail || body?.error || `PostHog query failed (${res.status}).`);
  }
  return body?.results ?? [];
}
