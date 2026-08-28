"use client";

import { supabase } from "./supabaseClient";

// Spam protection for the public, unauthenticated forms (contact, event
// submission, ecosystem signup, newsletter, consultation feedback). Two
// cheap layers, no third-party script and no visible friction for a real
// person:
//
//   1. A honeypot field — hidden from sight and from screen readers, skipped
//      by keyboard tabbing. Humans never fill it; naive bots fill every input
//      they find.
//   2. A per-browser submission cap, counted server-side through the same
//      bump_form_usage RPC the chat limiter uses, so a script can't simply
//      clear localStorage to reset it.
//
// Deliberately not a CAPTCHA: these forms are how the ecosystem reaches the
// team, and a puzzle in front of them costs real submissions. Escalate to
// Turnstile only if this proves insufficient.

const HOUR_MS = 60 * 60_000;

export const HONEYPOT_NAME = "website_url_confirm";

/** Spread onto a hidden <input> to bait naive bots. */
export const honeypotProps = {
  type: "text" as const,
  name: HONEYPOT_NAME,
  tabIndex: -1,
  autoComplete: "off",
  "aria-hidden": true as const,
  style: {
    position: "absolute" as const,
    left: "-9999px",
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: "none" as const,
  },
};

/**
 * A stable-ish per-browser key. Not a security boundary on its own — it's the
 * bucket label for the server-side counter, which is what actually enforces
 * the cap.
 */
function clientKey(): string {
  const KEY = "ib_form_client";
  try {
    let v = localStorage.getItem(KEY);
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem(KEY, v);
    }
    return v;
  } catch {
    return "no-storage";
  }
}

function hourWindow(): string {
  return new Date(Math.floor(Date.now() / HOUR_MS) * HOUR_MS).toISOString();
}

export interface GuardResult {
  ok: boolean;
  /** User-facing message when ok is false. Never explains the honeypot. */
  error?: string;
}

/**
 * Call at the top of a public form's submit handler.
 *
 * @param honeypotValue current value of the honeypot input
 * @param formId        distinguishes counters per form, e.g. "contact"
 * @param maxPerHour    submissions allowed from one browser per hour
 */
export async function checkFormGuard(
  honeypotValue: string,
  formId: string,
  maxPerHour = 5
): Promise<GuardResult> {
  // Silent success for bots: telling them why they failed just teaches them
  // to fix it. The caller shows its normal "thanks, submitted" state.
  if (honeypotValue.trim()) return { ok: false, error: "" };

  if (!supabase) return { ok: true };

  try {
    const { data, error } = await supabase.rpc("bump_form_usage", {
      p_client_key: `form:${formId}:${clientKey()}`,
      p_window_start: hourWindow(),
    });
    // Fail open on an infrastructure hiccup — losing a genuine submission is
    // worse than letting one extra through.
    if (error || typeof data !== "number") return { ok: true };
    if (data > maxPerHour) {
      return {
        ok: false,
        error: "You've sent several submissions in the last hour. Please try again later, or email us directly.",
      };
    }
  } catch {
    return { ok: true };
  }

  return { ok: true };
}
