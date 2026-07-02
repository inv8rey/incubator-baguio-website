"use client";

import { useState } from "react";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";

const ORANGE = "#F26522";
const DARK = "#141417";

interface FormState {
  orgName: string;
  orgType: string;
  contactName: string;
  email: string;
  phone: string;
  title: string;
  sector: string;
  problem: string;
  scope: string;
  support: string;
  deadline: string;
  agree: boolean;
}

const ORG_TYPES = ["Government", "Academe", "Corporate", "Community"];
const SECTORS = ["Agriculture", "Environment", "Tourism", "Health", "Education", "Govtech", "Other"];

const STEPS = ["Organization & contact", "Challenge details", "Review & submit"];

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

export default function PostChallengeForm({ bp }: { bp: string }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState<FormState>({
    orgName: "",
    orgType: "",
    contactName: "",
    email: "",
    phone: "",
    title: "",
    sector: "",
    problem: "",
    scope: "",
    support: "",
    deadline: "",
    agree: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!form.orgName.trim()) errs.orgName = "Organization name is required.";
      if (!form.orgType) errs.orgType = "Select what best describes your organization.";
      if (!form.contactName.trim()) errs.contactName = "Contact name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address.";
    }
    if (s === 1) {
      if (!form.title.trim()) errs.title = "Give your challenge a title.";
      if (!form.sector) errs.sector = "Select a sector.";
      if (!form.problem.trim() || form.problem.trim().length < 30) errs.problem = "Describe the problem in at least a few sentences.";
      if (!form.scope.trim() || form.scope.trim().length < 30) errs.scope = "Describe what solvers should build.";
      if (!form.deadline) errs.deadline = "Set an application deadline.";
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
  async function submit() {
    if (!validateStep(2)) return;
    setSubmitError("");
    if (supabase && user) {
      const { error } = await supabase.from("challenge_submissions").insert({
        owner_id: user.id,
        org_name: form.orgName,
        org_type: form.orgType,
        contact_name: form.contactName,
        email: form.email,
        phone: form.phone,
        title: form.title,
        sector: form.sector,
        problem: form.problem,
        scope: form.scope,
        support: form.support,
        deadline: form.deadline,
      });
      if (error) {
        setSubmitError(error.message);
        return;
      }
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "56px 40px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 9999, background: "rgba(26,107,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Challenge posted</h2>
        <p style={{ margin: "0 auto 28px", fontSize: 14.5, lineHeight: 1.6, color: "#6B6B73", maxWidth: 460 }}>
          Thanks, {form.contactName.split(" ")[0] || "there"}. &ldquo;{form.title}&rdquo; is now live under Community-posted challenges, and the Incubator Baguio team may follow up at {form.email}.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={`${bp}/challenges/`} style={{ fontSize: 14, fontWeight: 600, color: DARK, textDecoration: "none", border: "1px solid rgba(20,20,25,0.18)", padding: "12px 22px", borderRadius: 9999 }}>
            Back to challenges
          </a>
          <a href={`${bp}/`} style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: DARK, padding: "12px 22px", borderRadius: 9999 }}>
            Back to home
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Organization / office name</label>
              <input style={inputStyle} value={form.orgName} onChange={(e) => update("orgName", e.target.value)} placeholder="e.g. City Environment Office" />
              {errors.orgName && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.orgName}</p>}
            </div>
            <div>
              <label style={labelStyle}>We are a&hellip;</label>
              <select style={{ ...inputStyle, appearance: "auto" }} value={form.orgType} onChange={(e) => update("orgType", e.target.value)}>
                <option value="" disabled>Select one</option>
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.orgType && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.orgType}</p>}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Contact name</label>
              <input style={inputStyle} value={form.contactName} onChange={(e) => update("contactName", e.target.value)} placeholder="Full name" />
              {errors.contactName && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.contactName}</p>}
            </div>
            <div>
              <label style={labelStyle}>Phone (optional)</label>
              <input style={inputStyle} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="09xx xxx xxxx" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@organization.ph" />
            {errors.email && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.email}</p>}
          </div>
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Challenge title</label>
            <input style={inputStyle} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Cut post-harvest loss for highland vegetable farmers" />
            {errors.title && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.title}</p>}
          </div>
          <div>
            <label style={labelStyle}>Sector</label>
            <select style={{ ...inputStyle, appearance: "auto" }} value={form.sector} onChange={(e) => update("sector", e.target.value)}>
              <option value="" disabled>Select one</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.sector && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.sector}</p>}
          </div>
          <div>
            <label style={labelStyle}>What&rsquo;s the problem?</label>
            <textarea style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} value={form.problem} onChange={(e) => update("problem", e.target.value)} placeholder="Describe the real-world problem, who it affects, and why it matters." />
            {errors.problem && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.problem}</p>}
          </div>
          <div>
            <label style={labelStyle}>What should solvers build?</label>
            <textarea style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} value={form.scope} onChange={(e) => update("scope", e.target.value)} placeholder="Define the scope and what a successful solution looks like." />
            {errors.scope && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.scope}</p>}
          </div>
          <div>
            <label style={labelStyle}>What support can you offer? (optional)</label>
            <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={form.support} onChange={(e) => update("support", e.target.value)} placeholder="Pilot access, seed funding, data, mentorship, or technical liaison support." />
          </div>
          <div style={{ maxWidth: 260 }}>
            <label style={labelStyle}>Application deadline</label>
            <input style={{ ...inputStyle, appearance: "auto" }} type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
            {errors.deadline && <p style={{ color: "#E23A2E", fontSize: 12, margin: "6px 0 0" }}>{errors.deadline}</p>}
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.08)", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958B", marginBottom: 14 }}>Review your challenge</div>
            <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 10, columnGap: 12, fontSize: 13.5 }}>
              <dt style={{ color: "#9A958B" }}>Title</dt><dd style={{ margin: 0, color: DARK, fontWeight: 600 }}>{form.title || "—"}</dd>
              <dt style={{ color: "#9A958B" }}>Organization</dt><dd style={{ margin: 0, color: DARK }}>{form.orgName || "—"} ({form.orgType || "?"})</dd>
              <dt style={{ color: "#9A958B" }}>Contact</dt><dd style={{ margin: 0, color: DARK }}>{form.contactName || "—"} &middot; {form.email || "—"}</dd>
              <dt style={{ color: "#9A958B" }}>Sector</dt><dd style={{ margin: 0, color: DARK }}>{form.sector || "—"}</dd>
              <dt style={{ color: "#9A958B" }}>Deadline</dt><dd style={{ margin: 0, color: DARK }}>{form.deadline || "—"}</dd>
              <dt style={{ color: "#9A958B" }}>Problem</dt><dd style={{ margin: 0, color: "#44444C", lineHeight: 1.5 }}>{form.problem || "—"}</dd>
              <dt style={{ color: "#9A958B" }}>Scope</dt><dd style={{ margin: 0, color: "#44444C", lineHeight: 1.5 }}>{form.scope || "—"}</dd>
              {form.support.trim() && (<><dt style={{ color: "#9A958B" }}>Support offered</dt><dd style={{ margin: 0, color: "#44444C", lineHeight: 1.5 }}>{form.support}</dd></>)}
            </dl>
          </div>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, color: "#44444C", cursor: "pointer" }}>
            <input type="checkbox" checked={form.agree} onChange={(e) => update("agree", e.target.checked)} style={{ marginTop: 2 }} />
            I confirm this information is accurate and I&rsquo;m authorized to post this challenge on behalf of {form.orgName || "my organization"}.
          </label>
          {errors.agree && <p style={{ color: "#E23A2E", fontSize: 12, margin: 0 }}>{errors.agree}</p>}
          {submitError && <p style={{ color: "#E23A2E", fontSize: 12, margin: 0 }}>{submitError}</p>}
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
            Submit challenge
          </button>
        )}
      </div>
    </div>
  );
}
