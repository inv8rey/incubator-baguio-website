"use client";

import { useEffect, useState } from "react";
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

export default function ResetPasswordForm({ bp }: { bp: string }) {
  // Clicking the emailed link lands here with Supabase automatically parsing
  // the recovery token from the URL into a temporary session (client-side,
  // via detectSessionInUrl) -- so all this needs to check is whether that
  // session actually showed up before letting the user set a new password.
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
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
      <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: "36px 40px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 9999, background: "rgba(26,107,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 600, color: DARK }}>Password updated</h2>
        <p style={{ margin: "0 0 22px", fontSize: 14, lineHeight: 1.6, color: "#5A544B" }}>You can now log in with your new password.</p>
        <a href={`${bp}/login/`} style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: ORANGE, padding: "12px 24px", borderRadius: 9999 }}>Log in</a>
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: "36px 40px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#5A544B" }}>
          This reset link is invalid or has expired. <a href={`${bp}/forgot-password/`} style={{ color: ORANGE, fontWeight: 600, textDecoration: "none" }}>Request a new one</a>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: "36px 40px" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>Set a new password</h2>
      <p style={{ margin: "0 0 26px", fontSize: 13.5, color: "#5A544B" }}>Choose a new password for your account.</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>New password</label>
          <input style={inputStyle} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div>
          <label style={labelStyle}>Confirm password</label>
          <input style={inputStyle} type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={busy}
          style={{ marginTop: 6, fontSize: 14.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "13px 26px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}
        >
          {busy ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}
