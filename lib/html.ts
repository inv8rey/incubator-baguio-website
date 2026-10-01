// Helpers for pages that build HTML strings for dangerouslySetInnerHTML.
// Anything that came from the database (or any user) must go through these
// before it is placed in the markup, or it can inject script into the page.

const ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escapes text for use in HTML content or a quoted attribute. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

/** An http(s) URL, escaped for an attribute; anything else (javascript:, data:, …) becomes "". */
export function safeUrl(value: unknown): string {
  const v = String(value ?? "").trim();
  return /^https?:\/\//i.test(v) ? escapeHtml(v) : "";
}

/** A copy of `obj` with every string (and string array item) HTML-escaped. */
export function escapeFields<T extends object>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = escapeHtml(v);
    else if (Array.isArray(v)) out[k] = v.map((x) => (typeof x === "string" ? escapeHtml(x) : x));
    else out[k] = v;
  }
  return out as T;
}
