"use client";

import { useState } from "react";
import type { Challenge } from "../../data";

const ORANGE = "#F26522";
const DARK = "#141417";

interface FormState {
  teamName: string;
  contactName: string;
  email: string;
  phone: string;
  teamSize: string;
  approach: string;
  whyYou: string;
  agree: boolean;
}

const STEPS = ["Team & contact", "Your approach", "Review & submit"];

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

export default function ApplyForm({ challenge, bp }: { challenge: Challenge; bp: string }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    teamName: "",
    contactName: "",
    email: "",
    phone: "",
    teamSize: "",
    approach: "",
    whyYou: "",
    agree: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!form.teamName.trim()) errs.teamName = "Team or organization name is required.";
      if (!form.contactName.trim()) errs.contactName = "Contact name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address.";
      if (!form.teamSize.trim()) errs.teamSize = "Let us know how many people are on your team.";
    }
    if (s === 1) {
      if (!form.approach.trim() || form.approach.trim().length < 30) errs.approach = "Describe your approach in at least a few sentences.";
      if (!form.whyYou.trim()) errs.whyYou = "Tell us why your team is right for this challenge.";
    }
    if (s === 2) {
      if (!form.agree) errs.agree = "You must confirm before submitting.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }
  function submit() {
    if (validateStep(2)) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "56px 40px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 9999, background: "rgba(26,107,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Application submitted</h2>
        <p style={{ margin: "0 auto 28px", fontSize: 14.5, lineHeight: 1.6, color: "#6B6B73", maxWidth: 440 }}>
          Thanks, {form.contactName.split(" ")[0] || "there"}. {challenge.orgName} will review submissions for &ldquo;{challenge.title}&rdquo; and reach out to shortlisted teams by {challenge.timeline[1]?.date ?? "the announced date"}.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={`${bp}/challenges/${challenge.id}/`} style={{ fontSize: 14, fontWeight: 600, color: DARK, textDecoration: "none", border: "1px solid rgba(20,20,25,0.18)", padding: "12px 22px", borderRadius: 9999 }}>
            Back to challenge
          </a>
          <a href={`${bp}/challenges/`} style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: DARK, padding: "12px 22px", borderRadius: 9999 }}>
            Browse more challenges
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "36px 40px" }}>
      {/* Compact step indicator (mobile only) */}
      <div className="ib-apply-mobile-step" style={{ display: "none", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <span style={{ width: 26, height: 26, borderRadius: 9999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, color: "#fff", background: ORANGE }}>
          {step + 1}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </span>
      </div>

      {/* Stepper */}
      <div className="ib-apply-stepper" style={{ display: "flex", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 6 }}>
        {STEPS.map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "0 0 auto", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 9999,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: i <= step ? "#fff" : "#9A958B",
                  background: i <= step ? ORANGE : "#F4F2EC",
                }}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: i === step ? DARK : "#9A958B", whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <span style={{ flex: 1, height: 1.5, background: i < step ? ORANGE : "rgba(20,20,25,0.1)", margin: "0 14px" }} />}
          </div>
        ))}
      </div>

      {/* Step 0 */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Team / organization name</label>
            <input style={inputStyle} value={form.teamName} onChange={(e) => update("teamName", e.target.value)} placeholder="e.g. Cordillera Cold Chain Collective" />
            {errors.teamName && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.teamName}</p>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Contact name</label>
              <input style={inputStyle} value={form.contactName} onChange={(e) => update("contactName", e.target.value)} placeholder="Full name" />
              {errors.contactName && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.contactName}</p>}
            </div>
            <div>
              <label style={labelStyle}>Team size</label>
              <input style={inputStyle} value={form.teamSize} onChange={(e) => update("teamSize", e.target.value)} placeholder="e.g. 4" />
              {errors.teamSize && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.teamSize}</p>}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
              {errors.email && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.email}</p>}
            </div>
            <div>
              <label style={labelStyle}>Phone (optional)</label>
              <input style={inputStyle} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="09xx xxx xxxx" />
            </div>
          </div>
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Your approach to this challenge</label>
            <textarea style={{ ...inputStyle, minHeight: 130, resize: "vertical" }} value={form.approach} onChange={(e) => update("approach", e.target.value)} placeholder="What would you build, and how does it address the scope described in this challenge?" />
            {errors.approach && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.approach}</p>}
          </div>
          <div>
            <label style={labelStyle}>Why your team is right for this</label>
            <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.whyYou} onChange={(e) => update("whyYou", e.target.value)} placeholder="Relevant experience, prior work, or why you care about this problem." />
            {errors.whyYou && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.whyYou}</p>}
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.08)", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958B", marginBottom: 14 }}>Review your application</div>
            <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 10, columnGap: 12, fontSize: 13.5 }}>
              <dt style={{ color: "#9A958B" }}>Challenge</dt><dd style={{ margin: 0, color: DARK, fontWeight: 600 }}>{challenge.title}</dd>
              <dt style={{ color: "#9A958B" }}>Team</dt><dd style={{ margin: 0, color: DARK }}>{form.teamName || "—"} ({form.teamSize || "?"} people)</dd>
              <dt style={{ color: "#9A958B" }}>Contact</dt><dd style={{ margin: 0, color: DARK }}>{form.contactName || "—"} &middot; {form.email || "—"}</dd>
              <dt style={{ color: "#9A958B" }}>Approach</dt><dd style={{ margin: 0, color: "#44444C", lineHeight: 1.5 }}>{form.approach || "—"}</dd>
            </dl>
          </div>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, color: "#44444C", cursor: "pointer" }}>
            <input type="checkbox" checked={form.agree} onChange={(e) => update("agree", e.target.checked)} style={{ marginTop: 2 }} />
            I confirm this information is accurate and I&rsquo;m authorized to submit on behalf of my team.
          </label>
          {errors.agree && <p style={{ color: "#E23A2E", fontSize: 12, margin: 0 }}>{errors.agree}</p>}
        </div>
      )}

      {/* Nav buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30, paddingTop: 22, borderTop: "1px solid rgba(20,20,25,0.08)" }}>
        <button
          onClick={back}
          disabled={step === 0}
          style={{ fontSize: 14, fontWeight: 600, color: step === 0 ? "#C9C5BB" : "#44444C", background: "none", border: "none", cursor: step === 0 ? "default" : "pointer", padding: "10px 4px" }}
        >
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={next} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "13px 26px", cursor: "pointer" }}>
            Continue
          </button>
        ) : (
          <button onClick={submit} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "13px 26px", cursor: "pointer" }}>
            Submit application
          </button>
        )}
      </div>
    </div>
  );
}
