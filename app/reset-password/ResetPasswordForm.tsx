"use client";

import { useEffect, useState } from "react";
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

export default function ResetPasswordForm({ bp }: { bp: string }) {
  // Clicking the emailed link lands here with Supabase automatically parsing
  // the recovery token from the URL into a temporary session (client-side,
  // via detectSessionInUrl) -- so all this needs to check is whether that
  // session actually showed up before letting the user set a new password.
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (!supabase) return;
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ width: 56, height: 56, borderRadius: 9999, background: "rgba(26,107,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Password updated</h2>
        <p style={{ margin: "0 0 22px", fontSize: 14, lineHeight: 1.6, color: "#5A544B" }}>You can now log in with your new password.</p>
        <a
          href={`${bp}/login/`}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: ORANGE, padding: "12px 24px", borderRadius: 9999 }}
        >
          Log in
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Link invalid or expired</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#5A544B" }}>
          This reset link is invalid or has expired.{" "}
          <a href={`${bp}/forgot-password/`} style={{ color: ORANGE, fontWeight: 600, textDecoration: "none" }}>Request a new one</a>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Set a new password</h2>
      <p style={{ margin: "0 0 26px", fontSize: 13.5, color: "#5A544B" }}>Choose a new password for your account.</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>New password</label>
          <div style={{ position: "relative" }}>
            <span style={fieldIconStyle}><LockIcon /></span>
            <input style={{ ...inputStyle, paddingRight: 48 }} type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
            <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"} style={{ position: "absolute", right: 2, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, background: "none", border: "none", color: "#6E685F", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <EyeIcon off={showPassword} />
            </button>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Confirm password</label>
          <div style={{ position: "relative" }}>
            <span style={fieldIconStyle}><LockIcon /></span>
            <input style={{ ...inputStyle, paddingRight: 48 }} type={showConfirm ? "text" : "password"} required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm your password" />
            <button type="button" onClick={() => setShowConfirm((s) => !s)} aria-label={showConfirm ? "Hide password" : "Show password"} style={{ position: "absolute", right: 2, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, background: "none", border: "none", color: "#6E685F", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <EyeIcon off={showConfirm} />
            </button>
          </div>
        </div>
        <p style={{ margin: "-10px 0 0", fontSize: 12, color: "#6E685F" }}>Use 8 or more characters with a mix of letters, numbers, and symbols.</p>
        {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={busy}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "14px 26px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}
        >
          {busy ? "Saving…" : "Save new password"}
          {!busy && <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6" /></svg>}
        </button>
      </form>
    </div>
  );
}
