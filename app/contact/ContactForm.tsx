"use client";

import { useState } from "react";

const ORANGE = "#F26522";
const DARK = "#141417";

const REASONS = [
  "General inquiry",
  "Startup incubation",
  "Research submission",
  "Mentor registration",
  "Partner inquiry",
  "Post a challenge",
  "Media / press",
];

interface FormState {
  name: string;
  email: string;
  organization: string;
  reason: string;
  message: string;
}

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

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", organization: "", reason: REASONS[0], message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (!form.message.trim() || form.message.trim().length < 10) errs.message = "Tell us a bit more — at least a sentence or two.";
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "56px 40px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 9999, background: "rgba(26,107,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Message sent</h2>
        <p style={{ margin: "0 auto", fontSize: 14.5, lineHeight: 1.6, color: "#6B6B73", maxWidth: 420 }}>
          Thanks, {form.name.split(" ")[0] || "there"}. The Incubator Baguio team will get back to you at {form.email} within 2&ndash;3 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "36px 40px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle}>Full name</label>
          <input style={inputStyle} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Juan dela Cruz" />
          {errors.name && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.name}</p>}
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
          {errors.email && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.email}</p>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle}>Organization (optional)</label>
          <input style={inputStyle} value={form.organization} onChange={(e) => update("organization", e.target.value)} placeholder="Company, school, or agency" />
        </div>
        <div>
          <label style={labelStyle}>Reason for contact</label>
          <select style={{ ...inputStyle, appearance: "auto" }} value={form.reason} onChange={(e) => update("reason", e.target.value)}>
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Message</label>
        <textarea style={{ ...inputStyle, minHeight: 130, resize: "vertical" }} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="How can we help?" />
        {errors.message && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.message}</p>}
      </div>

      <button
        type="submit"
        style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "13px 28px", cursor: "pointer" }}
      >
        Send message
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
    </form>
  );
}
