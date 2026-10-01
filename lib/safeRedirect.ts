/**
 * Returns `target` only if it is a path on this site; otherwise `fallback`.
 *
 * Login, signup, and admin login take a `?redirect=` parameter. Without this
 * check, a crafted link could send someone to another site right after they
 * sign in (phishing), or run script through a `javascript:` URL.
 *
 * Allowed: "/dashboard/", "/idea-lab/?x=1". Rejected: "https://…",
 * "//evil.com", "/\evil.com", "javascript:…", and anything with control
 * characters.
 */
export function safeRedirect(target: string | null | undefined, fallback: string): string {
  if (!target) return fallback;
  const t = target.trim();
  // Must be a single-slash absolute path. "//host" and "/\host" are treated as
  // other hosts by browsers, so both are refused.
  if (!t.startsWith("/") || t.startsWith("//") || t.startsWith("/\\")) return fallback;
  // Control characters (tabs, newlines) can be stripped by the browser and turn
  // "/\t/evil.com" into "//evil.com".
  if (/[\u0000-\u001f\u007f]/.test(t)) return fallback;
  try {
    const base = typeof window !== "undefined" ? window.location.origin : "https://incubatorbaguio.online";
    const resolved = new URL(t, base);
    if (resolved.origin !== base) return fallback;
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return fallback;
  }
}
