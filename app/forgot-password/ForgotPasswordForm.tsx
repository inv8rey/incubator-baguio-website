"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const ORANGE = "#F26522";
const DARK = "#1A1714";

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 14.5,
  color: DARK,
  background: "#F6F2EA",
  border: "1.5px solid rgba(64,50,34,0.14)",
  borderRadius: 10,
  padding: "12px 14px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 600,
  color: "#44444C",
  marginBottom: 7,
};

export default function ForgotPasswordForm({ bp }: { bp: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!supabase) {
      setError("The backend isn't configured yet. Ask the site admin to set up Supabase.");
      return;
    }
    setBusy(true);
    const redirectTo = `${window.location.origin}${bp}/reset-password/`;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: "36px 40px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 9999, background: "rgba(26,107,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 600, color: DARK }}>Check your email</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#5A544B" }}>
          If an account exists for <strong>{email}</strong>, we&rsquo;ve sent a link to reset your password.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: "36px 40px" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>Reset your password</h2>
      <p style={{ margin: "0 0 26px", fontSize: 13.5, color: "#5A544B" }}>
        Enter the email on your account and we&rsquo;ll send you a link to set a new password.
      </p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={busy}
          style={{ marginTop: 6, fontSize: 14.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "13px 26px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}
        >
          {busy ? "Sending…" : "Send reset link"}
        </button>
        <a href={`${bp}/login/`} style={{ fontSize: 13, fontWeight: 600, color: "#5A544B", textDecoration: "none", textAlign: "center" }}>Back to log in</a>
      </form>
    </div>
  );
}
