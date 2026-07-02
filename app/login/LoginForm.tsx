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

export default function LoginForm({ bp }: { bp: string }) {
  const params = useSearchParams();
  const redirect = params.get("redirect") || `${bp}/dashboard/`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "36px 40px" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Log in</h2>
      <p style={{ margin: "0 0 26px", fontSize: 13.5, color: "#6B6B73" }}>
        New here? <a href={`${bp}/signup/${params.get("redirect") ? `?redirect=${encodeURIComponent(params.get("redirect")!)}` : ""}`} style={{ color: ORANGE, fontWeight: 600, textDecoration: "none" }}>Create an account</a>
      </p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={busy}
          style={{ marginTop: 6, fontSize: 14.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "13px 26px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}
        >
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
