"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, rowItemStyle, DARK } from "../styles";

interface Startup {
  id: string;
  name: string;
  tagline: string;
  sector: string;
  stage: string;
  description: string;
  website: string;
  contact_email: string;
}

const EMPTY = { name: "", tagline: "", sector: "", stage: "", description: "", website: "", contact_email: "" };

export default function StartupManager() {
  const { user } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !user) return;
    setError("");
    setBusy(true);
    const { error: err } = await supabase.from("startups").insert({ ...form, owner_id: user.id });
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
    await supabase.from("startups").delete().eq("id", id);
    load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: DARK }}>Add a startup profile</h2>
        <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "#6B6B73" }}>Published immediately to the Ecosystem directory under Startups.</p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Startup name</label>
              <input style={inputStyle} required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. HarvestLink" />
            </div>
            <div>
              <label style={labelStyle}>Tagline</label>
              <input style={inputStyle} value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="One line description" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Sector</label>
              <input style={inputStyle} required value={form.sector} onChange={(e) => update("sector", e.target.value)} placeholder="e.g. Agritech" />
            </div>
            <div>
              <label style={labelStyle}>Stage</label>
              <input style={inputStyle} value={form.stage} onChange={(e) => update("stage", e.target.value)} placeholder="e.g. Pre-incubation · 2026" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What does this startup do?" />
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
          {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
          <div>
            <button type="submit" disabled={busy} style={{ ...primaryButtonStyle, opacity: busy ? 0.7 : 1 }}>
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
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{s.name}</div>
                  <div style={{ fontSize: 12.5, color: "#9A958B" }}>{s.sector}{s.stage ? ` · ${s.stage}` : ""}</div>
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
