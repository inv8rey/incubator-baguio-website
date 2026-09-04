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

function PersonIcon() {
  return <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={8} r={4} /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>;
}
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

type SignupAs = "individual" | "organization";

const SIGNUP_AS_OPTIONS: { value: SignupAs; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: "individual", label: "Individual", desc: "Join as an innovator, student, researcher, mentor, or professional.", icon: <PersonIcon /> },
  {
    value: "organization",
    label: "Organization",
    desc: "Join as a company, school, organization, or government entity.",
    icon: (
      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 21V7l8-4 8 4v14M9 21v-6h6v6M4 21h16" /></svg>
    ),
  },
];

export default function SignupForm({ bp }: { bp: string }) {
  const params = useSearchParams();
  const redirectParam = params.get("redirect");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [signupAs, setSignupAs] = useState<SignupAs>("individual");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [wantsUpdates, setWantsUpdates] = useState(false);
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
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    setBusy(true);
    // Without this, Supabase sends the confirmation link to whatever "Site
    // URL" is set in the dashboard's Auth settings -- which defaults to
    // http://localhost:3000 and stays there until someone changes it, so
    // every confirmation email points at a dev server that isn't running.
    // This pins it to wherever the signup actually happened instead. The
    // target still has to be on the project's Redirect URLs allow list
    // (Authentication -> URL Configuration) or Supabase silently falls back
    // to the Site URL anyway.
    const emailRedirectTo = `${window.location.origin}${bp}/dashboard/`;
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, wants_updates: wantsUpdates }, emailRedirectTo },
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
    const defaultRedirect = signupAs === "organization" ? `${bp}/dashboard/organizations/` : `${bp}/dashboard/`;
    window.location.href = redirectParam || defaultRedirect;
  }

  if (checkEmail) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 600, color: DARK }}>Check your email</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#5A544B" }}>
          We sent a confirmation link to <strong>{email}</strong>. Confirm your address, then log in.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Create your account</h1>
      <p style={{ margin: "0 0 26px", fontSize: 13.5, color: "#5A544B" }}>
        Already have an account?{" "}
        <a href={`${bp}/login/${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ""}`} style={{ color: ORANGE, fontWeight: 600, textDecoration: "none" }}>Log in</a>
      </p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
          <div>
            <label style={labelStyle}>First name</label>
            <div style={{ position: "relative" }}>
              <span style={fieldIconStyle}><PersonIcon /></span>
              <input style={inputStyle} required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Last name</label>
            <div style={{ position: "relative" }}>
              <span style={fieldIconStyle}><PersonIcon /></span>
              <input style={inputStyle} required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
            </div>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Email address</label>
          <div style={{ position: "relative" }}>
            <span style={fieldIconStyle}><MailIcon /></span>
            <input style={inputStyle} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
          <div>
            <label style={labelStyle}>Password</label>
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
        </div>
        <p style={{ margin: "-10px 0 0", fontSize: 12, color: "#6E685F" }}>Use 8 or more characters with a mix of letters, numbers, and symbols.</p>

        <div>
          <label style={{ ...labelStyle, marginBottom: 10 }}>I am signing up as</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {SIGNUP_AS_OPTIONS.map((o) => {
              const active = signupAs === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setSignupAs(o.value)}
                  style={{
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    padding: 16,
                    borderRadius: 14,
                    border: active ? `1.5px solid ${ORANGE}` : "1.5px solid rgba(64,50,34,0.14)",
                    background: active ? "rgba(242,101,34,0.05)" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 9999, background: active ? ORANGE : "#F6F2EA", color: active ? "#fff" : "#6E685F", display: "flex", alignItems: "center", justifyContent: "center" }}>{o.icon}</span>
                    <span style={{ width: 16, height: 16, borderRadius: 9999, border: active ? `5px solid ${ORANGE}` : "1.5px solid rgba(64,50,34,0.22)", background: "#fff", flexShrink: 0 }} />
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>{o.label}</div>
                  <div style={{ fontSize: 11.5, lineHeight: 1.45, color: "#6E685F" }}>{o.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, color: "#44444C", cursor: "pointer" }}>
            <input type="checkbox" required checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} style={{ marginTop: 1, width: 18, height: 18, flexShrink: 0, accentColor: ORANGE }} />
            <span>
              I agree to the{" "}
              <a href={`${bp}/terms/`} target="_blank" rel="noopener noreferrer" style={{ color: ORANGE, fontWeight: 600 }}>Terms of Service</a>{" "}
              and <a href={`${bp}/privacy/`} target="_blank" rel="noopener noreferrer" style={{ color: ORANGE, fontWeight: 600 }}>Privacy Policy</a>.
            </span>
          </label>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, color: "#44444C", cursor: "pointer" }}>
            <input type="checkbox" checked={wantsUpdates} onChange={(e) => setWantsUpdates(e.target.checked)} style={{ marginTop: 1, width: 18, height: 18, flexShrink: 0, accentColor: ORANGE }} />
            <span>I would like to receive updates, news, and opportunities from Incubator Baguio.</span>
          </label>
        </div>

        {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={busy}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "14px 26px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}
        >
          {busy ? "Creating account…" : "Create account"}
          {!busy && <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6" /></svg>}
        </button>
      </form>

      <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "22px 0 0", fontSize: 11.5, color: "#6E685F" }}>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={4} y={11} width={16} height={10} rx={2} /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
        Your information is secure and will never be shared.
      </p>
    </div>
  );
}
