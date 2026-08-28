"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const ORANGE = "#F26522";
const DARK = "#1A1714";

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 14.5,
  color: DARK,
  background: "#fff",
  border: "1.5px solid rgba(64,50,34,0.16)",
  borderRadius: 10,
  padding: "12px 14px 12px 40px",
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

const fieldIconStyle: React.CSSProperties = {
  position: "absolute",
  left: 13,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#8B8479",
  pointerEvents: "none",
};

function MailIcon() {
  return <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x={3} y={5} width={18} height={14} rx={2} /><path d="m3 7 9 6 9-6" /></svg>;
}

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
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ width: 56, height: 56, borderRadius: 9999, background: "rgba(26,107,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Check your email</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#5A544B" }}>
          If an account exists for <strong>{email}</strong>, we&rsquo;ve sent a link to reset your password.
        </p>
        <a href={`${bp}/login/`} style={{ display: "inline-block", marginTop: 20, fontSize: 13, fontWeight: 600, color: ORANGE, textDecoration: "none" }}>Back to log in</a>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Reset your password</h2>
      <p style={{ margin: "0 0 26px", fontSize: 13.5, color: "#5A544B" }}>
        Enter the email on your account and we&rsquo;ll send you a link to set a new password.
      </p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>Email address</label>
          <div style={{ position: "relative" }}>
            <span style={fieldIconStyle}><MailIcon /></span>
            <input style={inputStyle} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
        </div>
        {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={busy}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "14px 26px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}
        >
          {busy ? "Sending…" : "Send reset link"}
          {!busy && <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6" /></svg>}
        </button>
        <a href={`${bp}/login/`} style={{ fontSize: 13, fontWeight: 600, color: "#5A544B", textDecoration: "none", textAlign: "center" }}>Back to log in</a>
      </form>
    </div>
  );
}
