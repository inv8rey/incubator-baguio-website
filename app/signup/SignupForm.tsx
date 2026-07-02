"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const ORANGE = "#F26522";
const DARK = "#141417";

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 14.5,
  color: DARK,
  background: "#FAFAF7",
  border: "1.5px solid rgba(20,20,25,0.12)",
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

export default function SignupForm({ bp }: { bp: string }) {
  const params = useSearchParams();
  const redirectParam = params.get("redirect");
  const redirect = redirectParam || `${bp}/dashboard/`;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!supabase) {
      setError("The backend isn't configured yet. Ask the site admin to set up Supabase.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, full_name: fullName, email });
    }
    setBusy(false);
    if (!data.session) {
      setCheckEmail(true);
      return;
    }
    window.location.href = redirect;
  }

  if (checkEmail) {
    return (
      <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "40px", textAlign: "center" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: DARK }}>Check your email</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#6B6B73" }}>
          We sent a confirmation link to <strong>{email}</strong>. Confirm your address, then log in.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "36px 40px" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Create your account</h2>
      <p style={{ margin: "0 0 26px", fontSize: 13.5, color: "#6B6B73" }}>
        Already have one? <a href={`${bp}/login/${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ""}`} style={{ color: ORANGE, fontWeight: 600, textDecoration: "none" }}>Log in</a>
      </p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>Full name</label>
          <input style={inputStyle} required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan Dela Cruz" />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <label style={labelStyle}>Confirm password</label>
            <input style={inputStyle} type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={busy}
          style={{ marginTop: 6, fontSize: 14.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "13px 26px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
