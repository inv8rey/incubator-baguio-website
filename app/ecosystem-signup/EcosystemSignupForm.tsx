"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, DARK, ORANGE } from "../dashboard/styles";
import { SECTOR_FILTERS } from "../admin/data";
import { MENTOR_SPECIALIZATIONS } from "../ecosystem/data";

const ENTITY_TYPES = [
  { value: "startup", label: "Startup" },
  { value: "mentor", label: "Mentor" },
  { value: "organization", label: "Organization" },
] as const;
type EntityType = (typeof ENTITY_TYPES)[number]["value"];

const ORG_TYPES = ["TBIs", "Corporate", "Government", "Community", "Coworking Spaces", "Makerspaces & Labs"] as const;
const MAX_SPECIALIZATIONS = 3;

const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: 90, resize: "vertical" };

export default function EcosystemSignupForm() {
  const [entityType, setEntityType] = useState<EntityType>("startup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Startup fields
  const [suName, setSuName] = useState("");
  const [suSector, setSuSector] = useState(SECTOR_FILTERS[0].label);
  const [suTbi, setSuTbi] = useState("");
  const [suDescription, setSuDescription] = useState("");
  const [suWebsite, setSuWebsite] = useState("");

  // Mentor fields
  const [mName, setMName] = useState("");
  const [mPosition, setMPosition] = useState("");
  const [mCompany, setMCompany] = useState("");
  const [mBio, setMBio] = useState("");
  const [mSpecializations, setMSpecializations] = useState<string[]>([]);

  // Organization fields
  const [oName, setOName] = useState("");
  const [oOrgType, setOOrgType] = useState<string>(ORG_TYPES[0]);
  const [oType, setOType] = useState("");
  const [oDescription, setODescription] = useState("");
  const [oWebsite, setOWebsite] = useState("");

  // Contact fields
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  function toggleSpecialization(s: string) {
    setMSpecializations((prev) => {
      if (prev.includes(s)) return prev.filter((x) => x !== s);
      if (prev.length >= MAX_SPECIALIZATIONS) return prev;
      return [...prev, s];
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactName.trim() || !email.trim()) return;
    if (!supabase) {
      setError("Signups aren't configured yet.");
      return;
    }

    let payload: Record<string, unknown>;
    if (entityType === "startup") {
      if (!suName.trim()) return;
      payload = { name: suName.trim(), sector: suSector, tbi_affiliation: suTbi.trim(), description: suDescription.trim(), website: suWebsite.trim() };
    } else if (entityType === "mentor") {
      if (!mName.trim()) return;
      payload = { name: mName.trim(), position: mPosition.trim(), company: mCompany.trim(), bio: mBio.trim(), specializations: mSpecializations };
    } else {
      if (!oName.trim()) return;
      payload = { name: oName.trim(), org_type: oOrgType, type: oType.trim(), description: oDescription.trim(), website: oWebsite.trim() };
    }

    setError("");
    setBusy(true);
    const { error: err } = await supabase.from("ecosystem_signups").insert({
      entity_type: entityType,
      contact_name: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      payload,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ ...cardStyle, textAlign: "center", padding: "56px 40px" }}>
        <div style={{ width: 56, height: 56, borderRadius: 9999, background: "rgba(26,107,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Thanks — submitted for review</h2>
        <p style={{ margin: "0 auto", fontSize: 14.5, lineHeight: 1.6, color: "#6B6B73", maxWidth: 420 }}>
          We&rsquo;ll take a look and reach out at {email} once it&rsquo;s approved and live in the Ecosystem directory.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label style={labelStyle}>I&rsquo;m submitting a&hellip;</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ENTITY_TYPES.map((t) => {
            const active = entityType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setEntityType(t.value)}
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  padding: "10px 20px",
                  borderRadius: 9999,
                  border: active ? "1.5px solid " + ORANGE : "1.5px solid rgba(20,20,25,0.12)",
                  color: active ? ORANGE : "#6B6B73",
                  background: active ? "rgba(242,101,34,0.08)" : "#fff",
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {entityType === "startup" && (
        <>
          <div>
            <label style={labelStyle}>Startup name</label>
            <input style={inputStyle} required value={suName} onChange={(e) => setSuName(e.target.value)} placeholder="e.g. Tasarap Ecobites" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Sector</label>
              <select style={{ ...inputStyle, appearance: "auto" }} value={suSector} onChange={(e) => setSuSector(e.target.value)}>
                {SECTOR_FILTERS.map((s) => (
                  <option key={s.label} value={s.label}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>TBI affiliation (optional)</label>
              <input style={inputStyle} value={suTbi} onChange={(e) => setSuTbi(e.target.value)} placeholder="e.g. Independent" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={textareaStyle} value={suDescription} onChange={(e) => setSuDescription(e.target.value)} placeholder="What does your startup do?" />
          </div>
          <div>
            <label style={labelStyle}>Website (optional)</label>
            <input style={inputStyle} value={suWebsite} onChange={(e) => setSuWebsite(e.target.value)} placeholder="https://" />
          </div>
        </>
      )}

      {entityType === "mentor" && (
        <>
          <div>
            <label style={labelStyle}>Full name</label>
            <input style={inputStyle} required value={mName} onChange={(e) => setMName(e.target.value)} placeholder="e.g. Maria Aquino" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Position</label>
              <input style={inputStyle} value={mPosition} onChange={(e) => setMPosition(e.target.value)} placeholder="e.g. CTO & Mentor" />
            </div>
            <div>
              <label style={labelStyle}>Company</label>
              <input style={inputStyle} value={mCompany} onChange={(e) => setMCompany(e.target.value)} placeholder="e.g. Independent" />
            </div>
          </div>
          <div>
            <label style={{ ...labelStyle, display: "flex", justifyContent: "space-between" }}>
              <span>Specialization</span>
              <span style={{ color: "#9A958B", fontWeight: 500 }}>{mSpecializations.length}/{MAX_SPECIALIZATIONS}</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {MENTOR_SPECIALIZATIONS.map((s) => {
                const active = mSpecializations.includes(s);
                const disabled = !active && mSpecializations.length >= MAX_SPECIALIZATIONS;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialization(s)}
                    disabled={disabled}
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: 999,
                      border: active ? "1.5px solid " + ORANGE : "1.5px solid rgba(20,20,25,0.12)",
                      color: active ? ORANGE : disabled ? "#C9C5BB" : "#6B6B73",
                      background: active ? "rgba(242,101,34,0.08)" : "#fff",
                      cursor: disabled ? "default" : "pointer",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Bio</label>
            <textarea style={textareaStyle} value={mBio} onChange={(e) => setMBio(e.target.value)} placeholder="Background and how you can help founders." />
          </div>
        </>
      )}

      {entityType === "organization" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Organization name</label>
              <input style={inputStyle} required value={oName} onChange={(e) => setOName(e.target.value)} placeholder="e.g. Cordillera Founders Guild" />
            </div>
            <div>
              <label style={labelStyle}>Organization type</label>
              <select style={{ ...inputStyle, appearance: "auto" }} value={oOrgType} onChange={(e) => setOOrgType(e.target.value)}>
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          {oOrgType !== "TBIs" && (
            <div>
              <label style={labelStyle}>Type (short label shown on your card)</label>
              <input style={inputStyle} value={oType} onChange={(e) => setOType(e.target.value)} placeholder="e.g. Coworking space" />
            </div>
          )}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={textareaStyle} value={oDescription} onChange={(e) => setODescription(e.target.value)} placeholder="What does this organization do?" />
          </div>
          <div>
            <label style={labelStyle}>Website (optional)</label>
            <input style={inputStyle} value={oWebsite} onChange={(e) => setOWebsite(e.target.value)} placeholder="https://" />
          </div>
        </>
      )}

      <div style={{ borderTop: "1px solid rgba(20,20,25,0.08)", paddingTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle}>Your name</label>
          <input style={inputStyle} required value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Juan Dela Cruz" />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Phone (optional)</label>
        <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09XX XXX XXXX" />
      </div>

      {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}

      <div>
        <button type="submit" disabled={busy} style={{ ...primaryButtonStyle, opacity: busy ? 0.7 : 1 }}>
          {busy ? "Submitting…" : "Submit for review"}
        </button>
      </div>
    </form>
  );
}
