"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, DARK, ORANGE } from "../dashboard/styles";
import { SECTOR_FILTERS } from "../admin/data";
import { MENTOR_SPECIALIZATIONS } from "../ecosystem/data";
import { uploadEcosystemSignupLogo, uploadOrgCoverImage } from "../../lib/uploadLogo";

const ENTITY_TYPES = [
  { value: "startup", label: "Startup" },
  { value: "mentor", label: "Mentor" },
  { value: "organization", label: "Organization" },
] as const;
type EntityType = (typeof ENTITY_TYPES)[number]["value"];

const ORG_TYPES = ["TBIs", "Corporate", "Government", "Community", "Coworking Spaces", "Makerspaces & Labs"] as const;
const MAX_SPECIALIZATIONS = 3;
const FOUNDER_STATUSES = ["Student Founder", "Professional Founder"] as const;

interface FounderRow {
  name: string;
  status: (typeof FOUNDER_STATUSES)[number];
}

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
  const [founders, setFounders] = useState<FounderRow[]>([{ name: "", status: "Student Founder" }]);

  // Mentor fields
  const [mName, setMName] = useState("");
  const [mPosition, setMPosition] = useState("");
  const [mCompany, setMCompany] = useState("");
  const [mBio, setMBio] = useState("");
  const [mSpecializations, setMSpecializations] = useState<string[]>([]);
  const [mSector, setMSector] = useState(SECTOR_FILTERS[0].label);
  const [mSocialLink, setMSocialLink] = useState("");

  // Organization fields
  const [oName, setOName] = useState("");
  const [oOrgType, setOOrgType] = useState<string>(ORG_TYPES[0]);
  const [oType, setOType] = useState("");
  const [oDescription, setODescription] = useState("");
  const [oWebsite, setOWebsite] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);

  // Contact fields
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Logo / photo (shared across all three types — only one is active at a time)
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const isIndustryExpert = mSpecializations.includes("Industry Experts");
  const isCoworkingOrMakerspace = oOrgType === "Coworking Spaces" || oOrgType === "Makerspaces & Labs";

  function updateFounder(i: number, patch: Partial<FounderRow>) {
    setFounders((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }
  function addFounder() {
    setFounders((prev) => [...prev, { name: "", status: "Student Founder" }]);
  }
  function removeFounder(i: number) {
    setFounders((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError("");
    try {
      const url = await uploadOrgCoverImage(file);
      setCoverUrl(url);
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  }

  function toggleSpecialization(s: string) {
    setMSpecializations((prev) => {
      if (prev.includes(s)) return prev.filter((x) => x !== s);
      if (prev.length >= MAX_SPECIALIZATIONS) return prev;
      return [...prev, s];
    });
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadEcosystemSignupLogo(file);
      setLogoUrl(url);
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // Mentors don't fill "Your name" separately — it's the same as their
    // full name, already required below.
    const effectiveContactName = entityType === "mentor" ? mName : contactName;
    if (!effectiveContactName.trim() || !email.trim()) return;
    if (!supabase) {
      setError("Signups aren't configured yet.");
      return;
    }

    let payload: Record<string, unknown>;
    if (entityType === "startup") {
      if (!suName.trim()) return;
      const cleanFounders = founders.map((f) => ({ name: f.name.trim(), status: f.status })).filter((f) => f.name);
      payload = { name: suName.trim(), sector: suSector, tbi_affiliation: suTbi.trim(), description: suDescription.trim(), website: suWebsite.trim(), logo_url: logoUrl, founders: cleanFounders };
    } else if (entityType === "mentor") {
      if (!mName.trim()) return;
      payload = {
        name: mName.trim(),
        position: mPosition.trim(),
        company: mCompany.trim(),
        bio: mBio.trim(),
        specializations: mSpecializations,
        logo_url: logoUrl,
        sector: isIndustryExpert ? mSector : "",
        social_link: mSocialLink.trim(),
      };
    } else {
      if (!oName.trim()) return;
      payload = { name: oName.trim(), org_type: oOrgType, type: oType.trim(), description: oDescription.trim(), website: oWebsite.trim(), logo_url: logoUrl, cover_url: isCoworkingOrMakerspace ? coverUrl : "" };
    }

    setError("");
    setBusy(true);
    const { error: err } = await supabase.from("ecosystem_signups").insert({
      entity_type: entityType,
      contact_name: effectiveContactName.trim(),
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

      <div>
        <label style={labelStyle}>{entityType === "mentor" ? "Photo (optional)" : "Logo (optional)"}</label>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {logoUrl ? (
            <img src={logoUrl} alt="" style={{ width: 52, height: 52, borderRadius: entityType === "mentor" ? 9999 : 12, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: entityType === "mentor" ? 9999 : 12, background: "#F5F4F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A958B", fontSize: 10, textAlign: "center" }}>
              No {entityType === "mentor" ? "photo" : "logo"}
            </div>
          )}
          <div>
            <label style={{ display: "inline-block", fontSize: 12.5, fontWeight: 600, color: ORANGE, cursor: "pointer" }}>
              {uploading ? "Uploading…" : `Upload ${entityType === "mentor" ? "photo" : "logo"}`}
              <input type="file" accept="image/*" onChange={handleLogoChange} disabled={uploading} style={{ display: "none" }} />
            </label>
            <div style={{ fontSize: 11, color: "#9A958B", marginTop: 2 }}>PNG or JPG, up to 2MB</div>
          </div>
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
          <div>
            <label style={labelStyle}>Founders</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {founders.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={f.name}
                    onChange={(e) => updateFounder(i, { name: e.target.value })}
                    placeholder={i === 0 ? "Founder name" : "Additional founder name"}
                  />
                  <select
                    style={{ ...inputStyle, appearance: "auto", width: 172, flexShrink: 0 }}
                    value={f.status}
                    onChange={(e) => updateFounder(i, { status: e.target.value as FounderRow["status"] })}
                  >
                    {FOUNDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {founders.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFounder(i)}
                      aria-label="Remove founder"
                      style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9999, border: "1.5px solid rgba(20,20,25,0.12)", background: "#fff", color: "#9A958B", cursor: "pointer", fontSize: 16, lineHeight: 1 }}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFounder}
              style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> Add another founder
            </button>
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
          {isIndustryExpert && (
            <div>
              <label style={labelStyle}>Sector</label>
              <select style={{ ...inputStyle, appearance: "auto" }} value={mSector} onChange={(e) => setMSector(e.target.value)}>
                {SECTOR_FILTERS.map((s) => (
                  <option key={s.label} value={s.label}>{s.label}</option>
                ))}
              </select>
              <div style={{ fontSize: 11, color: "#9A958B", marginTop: 4 }}>Which sector is your expertise in?</div>
            </div>
          )}
          <div>
            <label style={labelStyle}>Bio</label>
            <textarea style={textareaStyle} value={mBio} onChange={(e) => setMBio(e.target.value)} placeholder="Background and how you can help founders." />
          </div>
          <div>
            <label style={labelStyle}>Facebook / LinkedIn / Website (optional)</label>
            <input style={inputStyle} value={mSocialLink} onChange={(e) => setMSocialLink(e.target.value)} placeholder="https://" />
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
          {isCoworkingOrMakerspace && (
            <div>
              <label style={labelStyle}>Cover photo (optional)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {coverUrl ? (
                  <img src={coverUrl} alt="" style={{ width: 84, height: 52, borderRadius: 10, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 84, height: 52, borderRadius: 10, background: "#F5F4F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A958B", fontSize: 10, textAlign: "center" }}>
                    No cover
                  </div>
                )}
                <div>
                  <label style={{ display: "inline-block", fontSize: 12.5, fontWeight: 600, color: ORANGE, cursor: "pointer" }}>
                    {uploadingCover ? "Uploading…" : "Upload cover photo"}
                    <input type="file" accept="image/*" onChange={handleCoverChange} disabled={uploadingCover} style={{ display: "none" }} />
                  </label>
                  <div style={{ fontSize: 11, color: "#9A958B", marginTop: 2 }}>Shown as the banner on your Ecosystem directory card.</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ borderTop: "1px solid rgba(20,20,25,0.08)", paddingTop: 18, display: "grid", gridTemplateColumns: entityType === "mentor" ? "1fr" : "1fr 1fr", gap: 16 }}>
        {entityType !== "mentor" && (
          <div>
            <label style={labelStyle}>Your name</label>
            <input style={inputStyle} required value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Juan Dela Cruz" />
          </div>
        )}
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
