"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
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
  color: "#6E685F",
  pointerEvents: "none",
};

function MailIcon() {
  return <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x={3} y={5} width={18} height={14} rx={2} /><path d="m3 7 9 6 9-6" /></svg>;
}
function LockIcon() {
  return <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x={4} y={11} width={16} height={10} rx={2} /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
}
function EyeIcon({ off }: { off: boolean }) {
  return off ? (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx={12} cy={12} r={3} /></svg>
  ) : (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx={12} cy={12} r={3} /><path d="m3 3 18 18" /></svg>
  );
}

export default function LoginForm({ bp }: { bp: string }) {
  const params = useSearchParams();
  const redirectParam = params.get("redirect");
  const redirect = redirectParam || `${bp}/dashboard/`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!supabase) {
      setError("The backend isn't configured yet. Ask the site admin to set up Supabase.");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    window.location.href = redirect;
  }

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Welcome back</h1>
      <p style={{ margin: "0 0 26px", fontSize: 13.5, color: "#5A544B" }}>
        New here?{" "}
        <a href={`${bp}/signup/${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ""}`} style={{ color: ORANGE, fontWeight: 600, textDecoration: "none" }}>Create an account</a>
      </p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>Email address</label>
          <div style={{ position: "relative" }}>
            <span style={fieldIconStyle}><MailIcon /></span>
            <input style={inputStyle} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label style={labelStyle}>Password</label>
            <a href={`${bp}/forgot-password/`} style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE, textDecoration: "none", marginBottom: 7 }}>Forgot password?</a>
          </div>
          <div style={{ position: "relative" }}>
            <span style={fieldIconStyle}><LockIcon /></span>
            <input style={{ ...inputStyle, paddingRight: 48 }} type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"} style={{ position: "absolute", right: 2, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, background: "none", border: "none", color: "#6E685F", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <EyeIcon off={showPassword} />
            </button>
          </div>
        </div>
        {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={busy}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "14px 26px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}
        >
          {busy ? "Logging in…" : "Log in"}
          {!busy && <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6" /></svg>}
        </button>
      </form>
    </div>
  );
}
