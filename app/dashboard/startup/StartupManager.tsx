"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";
import { uploadStartupLogo } from "../../../lib/uploadLogo";
import type { LocationValue } from "../../LocationPicker";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, rowItemStyle, DARK } from "../styles";

const LocationPicker = dynamic(() => import("../../LocationPicker"), { ssr: false });

const NAME_MAX = 60;
const TAGLINE_MAX = 100;
const DESCRIPTION_MAX = 280;
const TBI_MAX = 60;
const FOUNDER_STATUSES = ["Student Founder", "Professional Founder"] as const;

interface FounderRow {
  name: string;
  status: (typeof FOUNDER_STATUSES)[number];
}

interface Startup {
  id: string;
  name: string;
  tagline: string;
  sector: string;
  tbi_affiliation: string;
  description: string;
  website: string;
  contact_email: string;
  logo_url: string;
  founders: FounderRow[];
}

const EMPTY = { name: "", tagline: "", sector: "", tbi_affiliation: "", description: "", website: "", contact_email: "", logo_url: "" };

export default function StartupManager() {
  const { user } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [founders, setFounders] = useState<FounderRow[]>([{ name: "", status: "Student Founder" }]);
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function updateFounder(i: number, patch: Partial<FounderRow>) {
    setFounders((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }
  function addFounder() {
    setFounders((prev) => [...prev, { name: "", status: "Student Founder" }]);
  }
  function removeFounder(i: number) {
    setFounders((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  async function load() {
    if (!supabase || !user) return;
    const { data } = await supabase.from("startups").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
    setStartups((data as Startup[]) ?? []);
  }

  useEffect(() => {
    load();
  }, [user]);

  function update<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadStartupLogo(file);
      update("logo_url", url);
    } catch (err: any) {
      setError(err.message || "Logo upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !user) return;
    setError("");
    setBusy(true);
    const cleanFounders = founders.map((f) => ({ name: f.name.trim(), status: f.status })).filter((f) => f.name);
    const { error: err } = await supabase.from("startups").insert({
      ...form,
      owner_id: user.id,
      address: location?.address ?? "",
      latitude: location?.lat ?? null,
      longitude: location?.lng ?? null,
      founders: cleanFounders,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setForm(EMPTY);
    setFounders([{ name: "", status: "Student Founder" }]);
    setLocation(null);
    load();
  }

  async function remove(id: string) {
    if (!supabase) return;
    await supabase.from("startups").delete().eq("id", id);
    load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: DARK }}>Add a startup profile</h2>
        <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "#6B6B73" }}>Published immediately to the Ecosystem directory under Startups.</p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {form.logo_url ? (
              <img src={form.logo_url} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "#F4F2EC", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A958B", fontSize: 10.5, textAlign: "center" }}>
                No logo
              </div>
            )}
            <div>
              <label style={{ display: "inline-block", fontSize: 13, fontWeight: 600, color: "#F26522", cursor: "pointer" }}>
                {uploading ? "Uploading…" : "Upload logo"}
                <input type="file" accept="image/*" onChange={handleLogoChange} disabled={uploading} style={{ display: "none" }} />
              </label>
              <div style={{ fontSize: 11.5, color: "#9A958B", marginTop: 2 }}>PNG or JPG, up to 2MB</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Startup name</label>
              <input style={inputStyle} required maxLength={NAME_MAX} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. HarvestLink" />
            </div>
            <div>
              <label style={labelStyle}>Tagline</label>
              <input style={inputStyle} maxLength={TAGLINE_MAX} value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="One line description" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Sector</label>
              <input style={inputStyle} required value={form.sector} onChange={(e) => update("sector", e.target.value)} placeholder="e.g. Agritech" />
            </div>
            <div>
              <label style={labelStyle}>TBI affiliation</label>
              <input style={inputStyle} maxLength={TBI_MAX} value={form.tbi_affiliation} onChange={(e) => update("tbi_affiliation", e.target.value)} placeholder="e.g. SLU iDEYA, or Independent" />
            </div>
          </div>
          <div>
            <label style={{ ...labelStyle, display: "flex", justifyContent: "space-between" }}>
              <span>Description</span>
              <span style={{ fontWeight: 500, color: "#9A958B" }}>{form.description.length}/{DESCRIPTION_MAX}</span>
            </label>
            <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} maxLength={DESCRIPTION_MAX} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What does this startup do?" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Website (optional)</label>
              <input style={inputStyle} value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" />
            </div>
            <div>
              <label style={labelStyle}>Contact email</label>
              <input style={inputStyle} type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} placeholder="you@example.com" />
            </div>
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
              style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#F26522", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> Add another founder
            </button>
          </div>
          <div>
            <label style={labelStyle}>Location (optional)</label>
            <LocationPicker value={location} onChange={setLocation} />
          </div>
          {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
          <div>
            <button type="submit" disabled={busy || uploading} style={{ ...primaryButtonStyle, opacity: busy || uploading ? 0.7 : 1 }}>
              {busy ? "Publishing…" : "Publish startup profile"}
            </button>
          </div>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 700, color: DARK }}>Your startups ({startups.length})</h2>
        {startups.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13.5, color: "#9A958B" }}>No startup profiles yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {startups.map((s) => (
              <div key={s.id} style={rowItemStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {s.logo_url ? (
                    <img src={s.logo_url} alt="" style={{ width: 34, height: 34, borderRadius: 9, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "#F4F2EC" }} />
                  )}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{s.name}</div>
                    <div style={{ fontSize: 12.5, color: "#9A958B" }}>{s.sector}{s.tbi_affiliation ? ` · ${s.tbi_affiliation}` : ""}</div>
                  </div>
                </div>
                <button onClick={() => remove(s.id)} style={{ fontSize: 12.5, fontWeight: 600, color: "#E23A2E", background: "none", border: "none", cursor: "pointer" }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
