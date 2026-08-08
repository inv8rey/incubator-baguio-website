import { createHash } from "crypto";
import { supabase } from "./supabaseClient";

const WINDOW_MS = 60_000; // 1 minute rolling window
const HOUR_MS = 60 * 60_000;
const MAX_REQUESTS_PER_WINDOW = 8; // ~1 message every 7.5s sustained
const MAX_REQUESTS_PER_HOUR = 25;

// Shared ceiling across ALL visitors for one UTC day. Workers AI's free tier
// is 10,000 neurons/day and this model costs roughly 110-160 neurons per
// answer, so the account runs dry somewhere around 65-90 questions. Without a
// shared cap the per-IP limits alone let one visitor drink the whole day's
// budget in about an hour, after which every other visitor gets an error --
// so the cap exists to spread a scarce allowance, not to punish anyone.
// Raise CHAT_DAILY_BUDGET once the Workers AI plan is paid.
const DAILY_BUDGET = Number(process.env.CHAT_DAILY_BUDGET ?? 60);
const GLOBAL_KEY = "__global_day__";

export type RateLimitReason = "ip-burst" | "ip-hour" | "daily-budget";

export interface RateLimitResult {
  allowed: boolean;
  reason?: RateLimitReason;
  retryAfterSeconds?: number;
}

let warnedAboutRpc = false;

function hashKey(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function floorTo(ms: number, size: number): string {
  return new Date(Math.floor(ms / size) * size).toISOString();
}

function startOfUtcDay(now: number): string {
  const d = new Date(now);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
}

function secondsUntilNextUtcDay(now: number): number {
  const d = new Date(now);
  const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
  return Math.max(1, Math.round((next - now) / 1000));
}

/**
 * Atomic increment via the bump_chat_usage RPC. Returns the post-increment
 * count, or null if the counter is unavailable — callers treat null as
 * "can't tell" and fail open rather than locking visitors out over an
 * infrastructure hiccup.
 */
async function bump(key: string, windowStart: string): Promise<number | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("bump_chat_usage", {
    p_client_key: key,
    p_window_start: windowStart,
  });
  if (!error && typeof data === "number") return data;

  // Once per server instance, not once per counter per request — three
  // identical lines on every message would bury everything else in the log
  // for as long as the RPC is missing.
  if (!warnedAboutRpc) {
    warnedAboutRpc = true;
    console.error(
      "bump_chat_usage unavailable, using non-atomic fallback (apply supabase/schema.sql to fix):",
      error?.message ?? "unexpected shape"
    );
  }
  return bumpWithoutRpc(key, windowStart);
}

/**
 * Non-atomic read-modify-write, kept only so the limiter still works before
 * bump_chat_usage has been applied to the database. It can undercount under a
 * simultaneous burst, which is exactly why the RPC is preferred -- but
 * undercounting is far better than the alternative of failing open and
 * enforcing no limit at all.
 */
async function bumpWithoutRpc(key: string, windowStart: string): Promise<number | null> {
  if (!supabase) return null;
  try {
    const { data: existing } = await supabase
      .from("chat_rate_limits")
      .select("id, request_count")
      .eq("client_key", key)
      .eq("window_start", windowStart)
      .maybeSingle();

    if (existing) {
      const next = existing.request_count + 1;
      await supabase.from("chat_rate_limits").update({ request_count: next }).eq("id", existing.id);
      return next;
    }
    await supabase.from("chat_rate_limits").insert({ client_key: key, window_start: windowStart, request_count: 1 });
    return 1;
  } catch {
    return null;
  }
}

/**
 * Per-IP limits are checked first so a single abusive client is turned away
 * without consuming any of the shared daily allowance; the global counter is
 * only incremented for a request that is actually about to reach the model.
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  if (!supabase) return { allowed: true };
  const key = hashKey(ip);
  const now = Date.now();

  const perMinute = await bump(`m:${key}`, floorTo(now, WINDOW_MS));
  if (perMinute !== null && perMinute > MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, reason: "ip-burst", retryAfterSeconds: 60 };
  }

  const perHour = await bump(`h:${key}`, floorTo(now, HOUR_MS));
  if (perHour !== null && perHour > MAX_REQUESTS_PER_HOUR) {
    return { allowed: false, reason: "ip-hour", retryAfterSeconds: 3600 };
  }

  const daily = await bump(GLOBAL_KEY, startOfUtcDay(now));
  if (daily !== null && daily > DAILY_BUDGET) {
    return { allowed: false, reason: "daily-budget", retryAfterSeconds: secondsUntilNextUtcDay(now) };
  }

  return { allowed: true };
}

export const RATE_LIMIT_MESSAGES: Record<RateLimitReason, string> = {
  "ip-burst": "You're sending messages a little too quickly. Give it a few seconds and try again.",
  "ip-hour": "You've reached the hourly limit for the assistant. Please try again later — Challenges, the Knowledge Hub, and the Ecosystem directory are all browsable in the meantime.",
  "daily-budget":
    "The assistant has answered as many questions as it can today and resets at midnight UTC. You can still browse Challenges, the Knowledge Hub, and the Ecosystem directory, or use the contact form to reach the team directly.",
};

// Vercel forwards the real client IP as the first entry in x-forwarded-for.
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
