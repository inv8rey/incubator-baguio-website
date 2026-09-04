"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { uploadMentorPhoto } from "../../../../lib/uploadLogo";
import { MENTOR_SPECIALIZATIONS } from "../../../ecosystem/data";
import { SECTOR_FILTERS } from "../../../admin/data";
import { useRequiredOrg, OrgRequiredNotice } from "../OrgRequired";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, DARK, ORANGE } from "../../styles";

const MAX_SPECIALIZATIONS = 3;

interface MentorRow {
  id: string;
  name: string;
  position: string;
  company: string;
  specializations: string[];
  photo_url: string;
}

const EMPTY = { name: "", position: "", company: "", bio: "", specializations: [] as string[], photo_url: "", sector: SECTOR_FILTERS[0].label, social_link: "" };

function Manager({ orgId }: { orgId: string }) {
  const [rows, setRows] = useState<MentorRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from("mentors").select("id,name,position,company,specializations,photo_url").eq("organization_id", orgId).order("created_at", { ascending: false });
    setRows((data as MentorRow[]) ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleSpecialization(s: string) {
    setForm((f) => {
      if (f.specializations.includes(s)) return { ...f, specializations: f.specializations.filter((x) => x !== s) };
      if (f.specializations.length >= MAX_SPECIALIZATIONS) return f;
      return { ...f, specializations: [...f.specializations, s] };
    });
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      update("photo_url", await uploadMentorPhoto(file));
    } catch (err: any) {
      setError(err.message || "Photo upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (!form.name.trim()) return setError("Add a name.");
    setError("");
    setBusy(true);
    const isIndustryExpert = form.specializations.includes("Industry Experts");
    const { error: err } = await supabase.from("mentors").insert({ ...form, sector: isIndustryExpert ? form.sector : "", owner_id: null, organization_id: orgId });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setForm(EMPTY);
    load();
  }

  async function remove(id: string) {
    if (!supabase) return;
    await supabase.from("mentors").delete().eq("id", id);
    load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>Add a mentor</h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#5A544B" }}>Published immediately to the Ecosystem directory under Mentors.</p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {form.photo_url ? (
              <img src={form.photo_url} alt="" style={{ width: 48, height: 48, borderRadius: 9999, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: 9999, background: "#F6F2EA", display: "flex", alignItems: "center", justifyContent: "center", color: "#6E685F", fontSize: 10, textAlign: "center" }}>No photo</div>
            )}
            <label style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE, cursor: "pointer" }}>
              {uploading ? "Uploading…" : "Upload photo"}
              <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} style={{ display: "none" }} />
            </label>
          </div>

          <div>
            <label style={labelStyle}>Name</label>
            <input style={inputStyle} required value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Position</label>
              <input style={inputStyle} value={form.position} onChange={(e) => update("position", e.target.value)} placeholder="e.g. Senior Product Manager" />
            </div>
            <div>
              <label style={labelStyle}>Company</label>
              <input style={inputStyle} value={form.company} onChange={(e) => update("company", e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Bio</label>
            <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.bio} onChange={(e) => update("bio", e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Specializations (up to {MAX_SPECIALIZATIONS})</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {MENTOR_SPECIALIZATIONS.map((s) => {
                const active = form.specializations.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialization(s)}
                    style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 999, border: active ? `1.5px solid ${ORANGE}` : "1.5px solid rgba(64,50,34,0.14)", color: active ? ORANGE : "#5A544B", background: active ? "rgba(242,101,34,0.08)" : "#fff", cursor: "pointer" }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {form.specializations.includes("Industry Experts") && (
            <div>
              <label style={labelStyle}>Sector</label>
              <select style={{ ...inputStyle, appearance: "auto" }} value={form.sector} onChange={(e) => update("sector", e.target.value)}>
                {SECTOR_FILTERS.map((s) => (
                  <option key={s.label} value={s.label}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>Social link (optional)</label>
            <input style={inputStyle} value={form.social_link} onChange={(e) => update("social_link", e.target.value)} placeholder="https://" />
          </div>

          {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
          <div>
            <button type="submit" disabled={busy || uploading} style={{ ...primaryButtonStyle, opacity: busy ? 0.7 : 1 }}>
              {busy ? "Adding…" : "Add mentor"}
            </button>
          </div>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>Mentors you host</h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#5A544B" }}>Mentors affiliated with this organization.</p>
        {!loaded ? (
          <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>Loading…</p>
        ) : rows.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>None added yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.1)", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                  <div style={{ fontSize: 11.5, color: "#6E685F", marginTop: 1 }}>{r.position}{r.company ? ` · ${r.company}` : ""}</div>
                </div>
                <button onClick={() => remove(r.id)} style={{ fontSize: 11.5, fontWeight: 600, color: "#E23A2E", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrganizationMentors() {
  const { selectedOrg, loaded } = useRequiredOrg();
  if (!loaded) return <div style={{ padding: "40px 0", textAlign: "center", color: "#6E685F", fontSize: 14 }}>Loading&hellip;</div>;
  if (!selectedOrg) return <OrgRequiredNotice />;
  return <Manager orgId={selectedOrg.id} />;
}
