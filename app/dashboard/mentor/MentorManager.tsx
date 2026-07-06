"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";
import { uploadMentorPhoto } from "../../../lib/uploadLogo";
import { MENTOR_SPECIALIZATIONS } from "../../ecosystem/data";
import { SECTOR_FILTERS } from "../../admin/data";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, DARK, ORANGE } from "../styles";

const MAX_SPECIALIZATIONS = 3;

interface MentorProfile {
  id: string;
  name: string;
  position: string;
  company: string;
  bio: string;
  specializations: string[];
  photo_url: string;
  sector: string;
  social_link: string;
}

const EMPTY = { name: "", position: "", company: "", bio: "", specializations: [] as string[], photo_url: "", sector: SECTOR_FILTERS[0].label, social_link: "" };

export default function MentorManager() {
  const { user, profile, refreshProfile } = useAuth();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!supabase || !user) return;
    (async () => {
      const { data } = await supabase!.from("mentors").select("*").eq("owner_id", user.id).maybeSingle();
      if (data) {
        setMentor(data as MentorProfile);
        setForm({ name: data.name, position: data.position, company: data.company, bio: data.bio, specializations: data.specializations ?? [], photo_url: data.photo_url, sector: data.sector || SECTOR_FILTERS[0].label, social_link: data.social_link || "" });
      } else {
        setForm((f) => ({ ...f, name: profile?.full_name || "" }));
      }
      setLoaded(true);
    })();
  }, [user, profile]);

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
      const url = await uploadMentorPhoto(file);
      update("photo_url", url);
    } catch (err: any) {
      setError(err.message || "Photo upload failed.");
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
    const isIndustryExpert = form.specializations.includes("Industry Experts");
    const { data, error: err } = await supabase
      .from("mentors")
      .upsert({ ...form, sector: isIndustryExpert ? form.sector : "", owner_id: user.id }, { onConflict: "owner_id" })
      .select()
      .single();
    if (!err) {
      await supabase.from("profiles").update({ is_mentor: true }).eq("id", user.id);
      await refreshProfile();
    }
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMentor(data as MentorProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!loaded) return null;

  return (
    <div style={cardStyle}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: DARK }}>{mentor ? "Your mentor profile" : "Become a mentor"}</h2>
      <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "#6B6B73" }}>
        {mentor ? "Editing updates what founders see on the Ecosystem directory." : "Share your expertise and appear on the Ecosystem directory so founders can connect with you."}
      </p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {form.photo_url ? (
            <img src={form.photo_url} alt="" style={{ width: 56, height: 56, borderRadius: 9999, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: 9999, background: "#F4F2EC", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A958B", fontSize: 10.5, textAlign: "center" }}>
              No photo
            </div>
          )}
          <div>
            <label style={{ display: "inline-block", fontSize: 13, fontWeight: 600, color: "#F26522", cursor: "pointer" }}>
              {uploading ? "Uploading…" : "Upload photo"}
              <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} style={{ display: "none" }} />
            </label>
            <div style={{ fontSize: 11.5, color: "#9A958B", marginTop: 2 }}>Shown as your card background on the Ecosystem directory.</div>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Full name</label>
          <input style={inputStyle} required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Position</label>
            <input style={inputStyle} value={form.position} onChange={(e) => update("position", e.target.value)} placeholder="e.g. CTO & Mentor" />
          </div>
          <div>
            <label style={labelStyle}>Company</label>
            <input style={inputStyle} value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="e.g. Independent" />
          </div>
        </div>
        <div>
          <label style={{ ...labelStyle, display: "flex", justifyContent: "space-between" }}>
            <span>Specialization</span>
            <span style={{ fontWeight: 500, color: "#9A958B" }}>{form.specializations.length}/{MAX_SPECIALIZATIONS}</span>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {MENTOR_SPECIALIZATIONS.map((s) => {
              const active = form.specializations.includes(s);
              const disabled = !active && form.specializations.length >= MAX_SPECIALIZATIONS;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialization(s)}
                  disabled={disabled}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "7px 13px",
                    borderRadius: 999,
                    border: active ? `1.5px solid ${ORANGE}` : "1.5px solid rgba(20,20,25,0.12)",
                    color: active ? ORANGE : disabled ? "#C9C5BB" : "#6B6B73",
                    background: active ? "rgba(242,101,34,0.08)" : "#FAFAF7",
                    cursor: disabled ? "default" : "pointer",
                  }}
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
            <div style={{ fontSize: 11, color: "#9A958B", marginTop: 4 }}>Which sector is your expertise in?</div>
          </div>
        )}
        <div>
          <label style={labelStyle}>Bio</label>
          <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Your background and how you can help founders." />
        </div>
        <div>
          <label style={labelStyle}>Facebook / LinkedIn / Website (optional)</label>
          <input style={inputStyle} value={form.social_link} onChange={(e) => update("social_link", e.target.value)} placeholder="https://" />
        </div>
        {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
        {saved && <p style={{ color: "#1A6B3C", fontSize: 13, margin: 0 }}>Saved.</p>}
        <div>
          <button type="submit" disabled={busy || uploading} style={{ ...primaryButtonStyle, opacity: busy || uploading ? 0.7 : 1 }}>
            {busy ? "Saving…" : mentor ? "Save changes" : "Publish mentor profile"}
          </button>
        </div>
      </form>
      {mentor && (
        <p style={{ marginTop: 18, fontSize: 12.5, color: "#9A958B" }}>
          Requests from founders show up under <a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/dashboard/connections/`} style={{ color: ORANGE, fontWeight: 600, textDecoration: "none" }}>Connections</a>.
        </p>
      )}
    </div>
  );
}
