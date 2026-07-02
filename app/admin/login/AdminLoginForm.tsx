"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

const ORANGE = "#F26522";

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 14.5,
  color: "#fff",
  background: "rgba(255,255,255,0.06)",
  border: "1.5px solid rgba(255,255,255,0.14)",
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
  color: "rgba(255,255,255,0.6)",
  marginBottom: 7,
};

export default function AdminLoginForm({ bp }: { bp: string }) {
  const params = useSearchParams();
  const redirect = params.get("redirect") || `${bp}/admin/`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!supabase) {
      setError("The backend isn't configured yet.");
      return;
    }
    setBusy(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).maybeSingle();
    setBusy(false);
    if (!profile?.is_admin) {
      setError("This account doesn't have admin access. Ask an existing admin to grant it.");
      return;
    }
    window.location.href = redirect;
  }

  return (
    <div style={{ background: "#141417", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "36px 40px" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Admin log in</h2>
      <p style={{ margin: "0 0 26px", fontSize: 13.5, color: "rgba(255,255,255,0.5)" }}>Restricted to accounts with admin access.</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p style={{ color: "#F2887B", fontSize: 13, margin: 0 }}>{error}</p>}
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
