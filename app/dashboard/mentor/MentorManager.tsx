"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";
import { uploadMentorPhoto } from "../../../lib/uploadLogo";
import { MENTOR_EXPERTISE_COLORS, type MentorExpertise } from "../../calendar/data";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, DARK, ORANGE } from "../styles";

const EXPERTISE_LIST = Object.keys(MENTOR_EXPERTISE_COLORS) as MentorExpertise[];

interface MentorProfile {
  id: string;
  name: string;
  expertise: string;
  bio: string;
  tag: string;
  photo_url: string;
}

export default function MentorManager() {
  const { user, profile, refreshProfile } = useAuth();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [form, setForm] = useState({ name: "", expertise: EXPERTISE_LIST[0], bio: "", tag: "", photo_url: "" });
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
        setForm({ name: data.name, expertise: data.expertise, bio: data.bio, tag: data.tag, photo_url: data.photo_url });
      } else {
        setForm((f) => ({ ...f, name: profile?.full_name || "" }));
      }
      setLoaded(true);
    })();
  }, [user, profile]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
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
    const { data, error: err } = await supabase
      .from("mentors")
      .upsert({ ...form, owner_id: user.id }, { onConflict: "owner_id" })
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
            <label style={labelStyle}>Area of expertise</label>
            <select style={{ ...inputStyle, appearance: "auto" }} value={form.expertise} onChange={(e) => update("expertise", e.target.value)}>
              {EXPERTISE_LIST.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tag (short label shown on your card)</label>
            <input style={inputStyle} value={form.tag} onChange={(e) => update("tag", e.target.value)} placeholder="e.g. Fundraising" />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Bio</label>
          <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Your background and how you can help founders." />
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
