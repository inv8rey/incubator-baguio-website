// Hostnames the link-preview fetcher must never contact (SSRF protection).
// Kept outside the route file so it can be unit tested.

// Loopback, private, link-local (incl. cloud metadata 169.254.169.254),
// carrier-grade NAT, benchmarking, and IPv6 local/unique-local/mapped ranges.
const PRIVATE_HOST_RE =
  /^(localhost|0\.|127\.|10\.|192\.168\.|169\.254\.|198\.1[89]\.|::1?$|f[cd][0-9a-f]{2}:|fe80:|::ffff:)/i;
/** 172.16.0.0 - 172.31.255.255 */
function isPrivate172(host: string) {
  const m = host.match(/^172\.(\d{1,3})\./);
  return !!m && Number(m[1]) >= 16 && Number(m[1]) <= 31;
}
/** 100.64.0.0 - 100.127.255.255 (carrier-grade NAT) */
function isCgnat(host: string) {
  const m = host.match(/^100\.(\d{1,3})\./);
  return !!m && Number(m[1]) >= 64 && Number(m[1]) <= 127;
}

export function isBlockedHost(hostname: string): boolean {
  // URL.hostname keeps IPv6 brackets ("[::1]"); strip them before matching.
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return PRIVATE_HOST_RE.test(h) || isPrivate172(h) || isCgnat(h) || h.endsWith(".local") || h.endsWith(".internal") || !h.includes(".") && !h.includes(":");
}
