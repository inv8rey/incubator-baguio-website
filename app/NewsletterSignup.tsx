"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

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
    const { error: err } = await supabase.from("newsletter_subscribers").insert({ email: email.trim(), source: "homepage" });
    if (err) {
      // Unique-constraint violation just means they're already on the list.
      if (err.code === "23505") {
        setStatus("done");
        return;
      }
      setError(err.message);
      setStatus("error");
      return;
    }
    setStatus("done");
  }

  return (
    <div style={{ background: "#FAFAF7", padding: "80px 40px" }}>
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          background: "linear-gradient(135deg,#F26522 0%,#E14E12 58%,#C8410C 100%)",
          borderRadius: 24,
          padding: "64px 56px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 30px 60px -22px rgba(226,78,18,0.55)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 120% at 100% 0%,rgba(255,255,255,0.16),transparent 55%)" }} />
        <svg style={{ position: "absolute", top: -30, right: -20, opacity: 0.16 }} width="340" height="300" viewBox="0 0 120 104" fill="none">
          <polyline points="12,40 60,12 108,40" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="12,62 60,34 108,62" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="12,84 60,56 108,84" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ position: "relative", maxWidth: 580 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 8px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.08)", marginBottom: 20 }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: 9999, background: "rgba(255,255,255,0.2)" }}>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: "#fff", display: "block" }} />
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>Stay in the loop</span>
          </div>
          <h2 style={{ margin: "0 0 14px", fontSize: 44, fontWeight: 700, letterSpacing: "-0.032em", color: "#fff", lineHeight: 1.04 }}>Get Baguio&rsquo;s innovation news in your inbox.</h2>
          <p style={{ margin: "0 0 32px", fontSize: 17, lineHeight: 1.55, color: "rgba(255,255,255,0.88)" }}>New challenges, events, and ecosystem updates — no spam, unsubscribe anytime.</p>
        </div>

        {status === "done" ? (
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 9999, padding: "14px 22px", width: "fit-content" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>You&rsquo;re subscribed. Thanks for joining!</span>
          </div>
        ) : (
          <form onSubmit={submit} style={{ position: "relative" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ flex: 1, minWidth: 240, fontSize: 15, padding: "14px 20px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.12)", color: "#fff", outline: "none" }}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="ib-cta-orange"
                style={{ background: "#0B0B0D", color: "#fff", fontWeight: 600, fontSize: 15, padding: "14px 26px", borderRadius: 9999, border: "none", cursor: "pointer", boxShadow: "0 12px 26px -12px rgba(0,0,0,0.6)", opacity: status === "loading" ? 0.7 : 1, whiteSpace: "nowrap" }}
              >
                {status === "loading" ? "Subscribing…" : "Subscribe"}
              </button>
            </div>
            {error && <p style={{ margin: "10px 0 0", fontSize: 13, color: "#FFD9CC" }}>{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
