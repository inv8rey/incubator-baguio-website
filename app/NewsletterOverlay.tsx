"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { checkFormGuard, honeypotProps } from "../lib/formGuard";
import { triggerNewsletterWelcome } from "../lib/triggerNewsletterWelcome";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEEN_KEY = "ib_newsletter_overlay_seen";
const DELAY_MS = 18_000;
const ORANGE = "#F26522";
const DARK = "#1A1714";

// Skipped on the unsubscribe page (perverse to pitch a resubscribe right
// there), and on auth pages and the PinaSIKLab application form (already
// mid-flow on something else). The admin
// panel lives at a secret, per-deploy slug (ADMIN_ROUTE_SLUG) that's
// deliberately never sent to the client bundle, so it can't be pattern
// matched here by path -- instead RequireAdmin.tsx marks its own DOM with
// [data-ib-admin-root], checked separately at display time below.
function shouldSkip(pathname: string): boolean {
  return pathname.startsWith("/unsubscribe") || pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/pinasiklab/register");
}

export default function NewsletterOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    if (shouldSkip(pathname)) return;
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // Storage unavailable (private mode, blocked cookies) -- fail open and
      // show it once; worst case a visitor sees it more than once per session.
    }
    if (seen) return;
    const t = setTimeout(() => {
      // Re-checked here, not just via `pathname`, because the admin route's
      // path is a secret slug this component is never told -- see shouldSkip.
      if (document.querySelector("[data-ib-admin-root]")) return;
      setVisible(true);
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  function markSeen() {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Nothing to do -- it'll just show again next session.
    }
  }

  function dismiss() {
    markSeen();
    setClosing(true);
    // Let the slide-out transition finish before unmounting.
    setTimeout(() => setVisible(false), 220);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!supabase) {
      setError("Sign-ups aren't configured yet.");
      return;
    }
    setError("");
    setStatus("loading");

    const guard = await checkFormGuard(honeypot, "newsletter");
    if (!guard.ok) {
      if (guard.error) {
        setError(guard.error);
        setStatus("error");
      } else {
        setStatus("done");
      }
      return;
    }

    const { error: err } = await supabase.from("newsletter_subscribers").insert({ email: email.trim(), source: "overlay" });
    if (err && err.code !== "23505") {
      setError(err.message);
      setStatus("error");
      return;
    }
    if (!err) triggerNewsletterWelcome(email.trim());
    setStatus("done");
    markSeen();
    setTimeout(dismiss, 2400);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Newsletter signup"
      style={{
        position: "fixed",
        left: 20,
        bottom: 20,
        zIndex: 94,
        // Capped so the card's right edge never reaches the chat bubble /
        // feedback widget cluster anchored in the bottom-right corner, at
        // any viewport width (fixed 320px on desktop, narrower on mobile).
        width: "min(320px, calc(100vw - 112px))",
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 20px 48px rgba(23,18,13,0.22)",
        border: "1px solid rgba(64,50,34,0.1)",
        padding: "20px 20px 18px",
        transform: closing ? "translateY(12px)" : "translateY(0)",
        opacity: closing ? 0 : 1,
        transition: "transform 0.22s ease, opacity 0.22s ease",
      }}
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{ position: "absolute", top: 10, right: 10, width: 26, height: 26, borderRadius: 9999, border: "none", background: "#F5F4F0", color: "#6E685F", cursor: "pointer", fontSize: 15, lineHeight: 1 }}
      >
        &times;
      </button>

      {status === "done" ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 2px" }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.6} style={{ flexShrink: 0 }}><path d="M20 6 9 17l-5-5" /></svg>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1A6B3C" }}>You&rsquo;re on the list.</span>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: 9999, background: "rgba(242,101,34,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={2.2}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            </span>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>Stay in the loop</div>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 12.5, lineHeight: 1.5, color: "#5A544B" }}>
            Baguio&rsquo;s innovation news, biweekly — new challenges, events, and ecosystem updates.
          </p>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input {...honeypotProps} value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.16)", fontSize: 13, color: DARK, outline: "none" }}
            />
            {error && <p style={{ margin: 0, fontSize: 11.5, color: "#E23A2E" }}>{error}</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              style={{ padding: "9px 14px", borderRadius: 9, border: "none", background: ORANGE, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: status === "loading" ? "default" : "pointer", opacity: status === "loading" ? 0.7 : 1 }}
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
