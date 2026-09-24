"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { checkFormGuard, honeypotProps } from "../../../lib/formGuard";
import { CARD, HAIR, ICONS, Icon, MUTED, ORANGE, TEXT, inputStyle, labelStyle, primaryBtn } from "../teams/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_EMAIL = "incubatorbaguio63@gmail.com";
const ORG_TYPES = ["Government agency", "School or university", "Company or startup", "Nonprofit or community organization", "Individual", "Other"];
const WAYS = ["Mentorship", "Judging", "Technical infrastructure", "Participant kits and merchandise", "Prizes", "Post-event pathways (incubation, acceleration, adoption)", "Food and refreshments", "Something else"];

function Field({ label, error, required, htmlFor, hint, children }: { label: string; error?: string; required?: boolean; htmlFor?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {htmlFor ? <label htmlFor={htmlFor} style={labelStyle}>{label}{required && <span style={{ color: ORANGE }}> *</span>}</label> : <div style={labelStyle}>{label}{required && <span style={{ color: ORANGE }}> *</span>}</div>}
      {hint && <div style={{ fontSize: 12.5, color: MUTED, marginTop: -2, marginBottom: 8 }}>{hint}</div>}
      {children}
      {error && <div role="alert" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tf-red)", marginTop: 7 }}>{error}</div>}
    </div>
  );
}

function Tile({ on, type, label, onChange }: { on: boolean; type: "radio" | "checkbox"; label: string; onChange: () => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${on ? ORANGE : "var(--tf-hair2)"}`, background: on ? "rgba(var(--tf-accent-rgb),0.09)" : "transparent", cursor: "pointer", fontSize: 14, color: TEXT }}>
      <input type={type} checked={on} onChange={onChange} style={{ accentColor: ORANGE, width: 16, height: 16, flexShrink: 0 }} />
      {label}
    </label>
  );
}

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 10 } as const;

export default function PartnerForm() {
  const [v, setV] = useState({ org_name: "", org_type: "", contact_name: "", email: "", phone: "", details: "" });
  const [ways, setWays] = useState<string[]>([]);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof v, val: string) => {
    setV((p) => ({ ...p, [k]: val }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };
  const input = (k: keyof typeof v, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input id={`p-${k}`} value={v[k]} onChange={(e) => set(k, e.target.value)} style={{ ...inputStyle, borderColor: errors[k] ? "var(--tf-red)" : undefined }} {...extra} />
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!v.org_name.trim()) er.org_name = "Tell us your organization, or your name if you're an individual.";
    if (!v.contact_name.trim()) er.contact_name = "Who should we talk to?";
    if (!EMAIL_RE.test(v.email.trim())) er.email = "Enter a valid email address.";
    if (ways.length === 0) er.ways = "Pick at least one way you'd like to help.";
    setErrors(er);
    if (Object.keys(er).length) return;
    if (!supabase) {
      setSubmitError(`We couldn't send that just now. Please email us at ${CONTACT_EMAIL}.`);
      return;
    }
    setBusy(true);
    setSubmitError("");
    const guard = await checkFormGuard(honeypot, "siklab-partner");
    if (!guard.ok) {
      setBusy(false);
      if (guard.error) setSubmitError(guard.error);
      else setDone(true);
      return;
    }
    const { error } = await supabase.from("siklab_partner_inquiries").insert({
      org_name: v.org_name.trim(), org_type: v.org_type, contact_name: v.contact_name.trim(), email: v.email.trim().toLowerCase(),
      phone: v.phone.trim(), ways, details: v.details.trim(),
    });
    setBusy(false);
    if (error) {
      setSubmitError(`We couldn't send your message. Please try again, or email us at ${CONTACT_EMAIL}.`);
      return;
    }
    setDone(true);
  }

  const wrap: React.CSSProperties = { maxWidth: 820, margin: "0 auto", padding: "56px 24px 80px" };
  const card: React.CSSProperties = { background: CARD, border: `1px solid ${HAIR}`, borderRadius: 22, padding: "30px 32px" };

  if (done) {
    return (
      <div className="ib-siklab-tf" data-theme="light" style={{ background: "#F6F2EA" }}>
        <div style={wrap}>
          <div style={{ ...card, textAlign: "center", padding: "48px 32px" }}>
            <div style={{ width: 60, height: 60, borderRadius: 9999, background: "var(--tf-green-bg)", color: "var(--tf-green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}><Icon d={ICONS.check} size={28} /></div>
            <h2 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", color: TEXT }}>Thank you</h2>
            <p style={{ margin: "0 auto", maxWidth: 480, fontSize: 15.5, lineHeight: 1.65, color: "var(--tf-body)" }}>We&rsquo;ve received your message and will get back to you at <strong style={{ color: TEXT }}>{v.email}</strong> soon.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ib-siklab-tf" data-theme="light" style={{ background: "#F6F2EA" }}>
      <div style={wrap}>
        <form onSubmit={submit} noValidate style={card}>
          <input {...honeypotProps} value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em", color: TEXT }}>Become a partner</h2>
          <p style={{ margin: "6px 0 26px", fontSize: 14.5, lineHeight: 1.55, color: "var(--tf-body)" }}>Tell us how you&rsquo;d like to help. There&rsquo;s no commitment yet. We&rsquo;ll reach out to talk it through.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
              <Field label="Organization (or your name)" required htmlFor="p-org_name" error={errors.org_name}>{input("org_name", { maxLength: 160 })}</Field>
              <Field label="Contact person" required htmlFor="p-contact_name" error={errors.contact_name}>{input("contact_name", { maxLength: 120, autoComplete: "name" })}</Field>
              <Field label="Email" required htmlFor="p-email" error={errors.email}>{input("email", { type: "email", autoComplete: "email", maxLength: 254 })}</Field>
              <Field label="Phone" htmlFor="p-phone">{input("phone", { type: "tel", autoComplete: "tel", maxLength: 40 })}</Field>
            </div>
            <Field label="What best describes you?">
              <div style={grid}>{ORG_TYPES.map((o) => <Tile key={o} type="radio" label={o} on={v.org_type === o} onChange={() => set("org_type", o)} />)}</div>
            </Field>
            <Field label="How would you like to help?" required error={errors.ways} hint="Pick all that apply.">
              <div style={grid}>{WAYS.map((w) => <Tile key={w} type="checkbox" label={w} on={ways.includes(w)} onChange={() => { setWays((p) => (p.includes(w) ? p.filter((x) => x !== w) : [...p, w])); setErrors((p) => ({ ...p, ways: "" })); }} />)}</div>
            </Field>
            <Field label="Tell us more" htmlFor="p-details" hint="What can you contribute to PinaSIKLab Baguio? Please describe the type of support you can provide and any relevant details about your proposed contribution.">
              <textarea id="p-details" value={v.details} onChange={(e) => set("details", e.target.value)} rows={5} maxLength={3000} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
            </Field>
          </div>

          {submitError && <div role="alert" style={{ marginTop: 18, padding: "12px 16px", borderRadius: 12, background: "var(--tf-red-bg)", color: "var(--tf-red)", fontSize: 13.5, fontWeight: 600 }}>{submitError}</div>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginTop: 26, paddingTop: 22, borderTop: `1px solid ${HAIR}` }}>
            <span style={{ fontSize: 12.5, color: MUTED }}>Prefer email? <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: ORANGE, fontWeight: 600 }}>{CONTACT_EMAIL}</a></span>
            <button type="submit" disabled={busy} style={{ ...primaryBtn, padding: "13px 28px", opacity: busy ? 0.7 : 1 }}>{busy ? "Sending…" : "Send inquiry"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
