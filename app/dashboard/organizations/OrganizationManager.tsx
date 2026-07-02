"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, rowItemStyle, DARK } from "../styles";

const ORG_TYPES = ["TBIs", "Corporate", "Government", "Community", "Coworking Spaces", "Makerspaces & Labs"] as const;

interface Organization {
  id: string;
  name: string;
  org_type: string;
  description: string;
  website: string;
  contact_email: string;
}

const EMPTY = { name: "", org_type: ORG_TYPES[0] as string, description: "", website: "", contact_email: "" };

export default function OrganizationManager() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!supabase || !user) return;
    const { data } = await supabase.from("organizations").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
    setOrgs((data as Organization[]) ?? []);
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
    const { error: err } = await supabase.from("organizations").insert({ ...form, owner_id: user.id });
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
    await supabase.from("organizations").delete().eq("id", id);
    load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: DARK }}>Publish an organization</h2>
        <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "#6B6B73" }}>
          Published immediately to the Ecosystem directory under the matching category.
        </p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Organization name</label>
              <input style={inputStyle} required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Cordillera Founders Guild" />
            </div>
            <div>
              <label style={labelStyle}>Organization type</label>
              <select style={{ ...inputStyle, appearance: "auto" }} value={form.org_type} onChange={(e) => update("org_type", e.target.value)}>
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What does this organization do?" />
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
              {busy ? "Publishing…" : "Publish organization"}
            </button>
          </div>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 700, color: DARK }}>Your organizations ({orgs.length})</h2>
        {orgs.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13.5, color: "#9A958B" }}>No organizations published yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orgs.map((o) => (
              <div key={o.id} style={rowItemStyle}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{o.name}</div>
                  <div style={{ fontSize: 12.5, color: "#9A958B" }}>{o.org_type}</div>
                </div>
                <button onClick={() => remove(o.id)} style={{ fontSize: 12.5, fontWeight: 600, color: "#E23A2E", background: "none", border: "none", cursor: "pointer" }}>
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
