import { createHash } from "crypto";
import { supabase } from "./supabaseClient";

const WINDOW_MS = 60_000; // 1 minute rolling window
const MAX_REQUESTS_PER_WINDOW = 8; // ~1 message every 7.5s sustained
const MAX_REQUESTS_PER_HOUR = 60; // coarser second cap

function hashKey(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

// Two-round-trip counter, not atomic under a simultaneous burst from the
// same IP — acceptable given Workers AI's own account-level throttling as a
// backstop. Fail-open if Supabase isn't configured (local dev without env).
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  if (!supabase) return { allowed: true };
  const key = hashKey(ip);
  const now = Date.now();
  const minuteWindow = new Date(Math.floor(now / WINDOW_MS) * WINDOW_MS).toISOString();

  const { data: existing } = await supabase
    .from("chat_rate_limits")
    .select("id, request_count")
    .eq("client_key", key)
    .eq("window_start", minuteWindow)
    .maybeSingle();

  if (existing) {
    if (existing.request_count >= MAX_REQUESTS_PER_WINDOW) {
      return { allowed: false, retryAfterSeconds: 60 };
    }
    await supabase.from("chat_rate_limits").update({ request_count: existing.request_count + 1 }).eq("id", existing.id);
  } else {
    await supabase.from("chat_rate_limits").insert({ client_key: key, window_start: minuteWindow, request_count: 1 });
  }

  const hourAgo = new Date(now - 60 * 60_000).toISOString();
  const { data: hourRows } = await supabase
    .from("chat_rate_limits")
    .select("request_count")
    .eq("client_key", key)
    .gte("window_start", hourAgo);
  const hourTotal = (hourRows ?? []).reduce((sum, r) => sum + r.request_count, 0);
  if (hourTotal > MAX_REQUESTS_PER_HOUR) {
    return { allowed: false, retryAfterSeconds: 3600 };
  }

  return { allowed: true };
}

// Vercel forwards the real client IP as the first entry in x-forwarded-for.
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
