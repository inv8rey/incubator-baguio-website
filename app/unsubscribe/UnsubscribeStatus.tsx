"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const ORANGE = "#F26522";
const DARK = "#1A1714";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

type Status = "checking" | "done" | "already" | "invalid" | "error";

/**
 * The unsubscribe link's token lives in the URL, never a raw email or row
 * id -- see unsubscribe_newsletter() in
 * supabase/migrations/2026-09-19-newsletter-issues.sql for why (knowing or
 * guessing someone's email address can't be used to unsubscribe them). This
 * reads it client-side and fires the RPC once on mount; the function itself
 * is the only thing deciding what happens, so there's nothing here to
 * secure beyond "don't call it twice."
 */
export default function UnsubscribeStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("invalid");
      return;
    }
    if (!supabase) {
      setStatus("error");
      return;
    }
    supabase.rpc("unsubscribe_newsletter", { p_token: token }).then(({ data, error }) => {
      if (error) setStatus("error");
      // `data` is the function's `found` boolean: false means the token
      // didn't match any still-subscribed row -- either it was already used
      // (clicking the link twice) or it's simply invalid. Either way the
      // person is not subscribed, which is the outcome they wanted, so this
      // reads as "already unsubscribed" rather than an error.
      else setStatus(data ? "done" : "already");
    });
  }, []);

  if (status === "checking") {
    return <p style={{ margin: 0, fontSize: 14, color: "#6E685F" }}>One moment&hellip;</p>;
  }

  if (status === "error") {
    return (
      <>
        <h2 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Something went wrong</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#5A544B" }}>
          We couldn&rsquo;t process this just now. Try the link again in a moment, or email{" "}
          <a href="mailto:incubatorbaguio63@gmail.com" style={{ color: ORANGE, fontWeight: 600 }}>incubatorbaguio63@gmail.com</a> and we&rsquo;ll remove you directly.
        </p>
      </>
    );
  }

  if (status === "invalid") {
    return (
      <>
        <h2 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Link incomplete</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#5A544B" }}>
          This unsubscribe link is missing its token. Use the link from the bottom of a newsletter email, or email{" "}
          <a href="mailto:incubatorbaguio63@gmail.com" style={{ color: ORANGE, fontWeight: 600 }}>incubatorbaguio63@gmail.com</a> to be removed directly.
        </p>
      </>
    );
  }

  return (
    <>
      <div style={{ width: 56, height: 56, borderRadius: 9999, background: "rgba(26,107,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
      </div>
      <h2 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>
        {status === "done" ? "You're unsubscribed" : "You're already unsubscribed"}
      </h2>
      <p style={{ margin: "0 0 22px", fontSize: 14, lineHeight: 1.6, color: "#5A544B" }}>
        You won&rsquo;t receive the Incubator Baguio newsletter anymore. Changed your mind? You can sign up again any time from the homepage.
      </p>
      <a
        href={`${BP}/`}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: ORANGE, padding: "12px 24px", borderRadius: 9999 }}
      >
        Back to Incubator Baguio
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </a>
    </>
  );
}
