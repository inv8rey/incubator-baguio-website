"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { uploadStartupLogo } from "../../../../lib/uploadLogo";
import { useRequiredOrg, OrgRequiredNotice } from "../OrgRequired";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, DARK, ORANGE } from "../../styles";
import { STAGE_FILTERS } from "../../../admin/data";

const STAGE_OPTIONS = STAGE_FILTERS.filter((s) => s !== "All");

interface StartupRow {
  id: string;
  name: string;
  tagline: string;
  sector: string;
  lifecycle_stage: string;
  description: string;
  website: string;
  contact_email: string;
  logo_url: string;
}

const EMPTY = { name: "", tagline: "", sector: "", lifecycle_stage: STAGE_OPTIONS[0], description: "", website: "", contact_email: "", logo_url: "" };

function Manager({ orgId, isAcademe }: { orgId: string; isAcademe: boolean }) {
  const noun = isAcademe ? "research project" : "startup";
  const [rows, setRows] = useState<StartupRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from("startups").select("*").eq("organization_id", orgId).order("created_at", { ascending: false });
    setRows((data as StartupRow[]) ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  function update<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      update("logo_url", await uploadStartupLogo(file));
    } catch (err: any) {
      setError(err.message || "Logo upload failed.");
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
    const { error: err } = await supabase.from("startups").insert({ ...form, owner_id: null, organization_id: orgId });
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>{isAcademe ? "Add a startup or research project" : "Add a startup"}</h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#5A544B" }}>Published immediately to the Ecosystem directory under Startups.</p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {form.logo_url ? (
              <img src={form.logo_url} alt="" style={{ width: 48, height: 48, borderRadius: 11, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: 11, background: "#F6F2EA", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B8479", fontSize: 10, textAlign: "center" }}>No logo</div>
            )}
            <label style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE, cursor: "pointer" }}>
              {uploading ? "Uploading…" : "Upload logo"}
              <input type="file" accept="image/*" onChange={handleLogoChange} disabled={uploading} style={{ display: "none" }} />
            </label>
          </div>

          <div>
            <label style={labelStyle}>Name</label>
            <input style={inputStyle} required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={isAcademe ? "e.g. Low-cost Water Filtration Study" : "e.g. Baguio AgriTech"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Sector</label>
              <input style={inputStyle} value={form.sector} onChange={(e) => update("sector", e.target.value)} placeholder="e.g. AgriTech" />
            </div>
            <div>
              <label style={labelStyle}>Stage</label>
              <select style={{ ...inputStyle, appearance: "auto" }} value={form.lifecycle_stage} onChange={(e) => update("lifecycle_stage", e.target.value)}>
                {STAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tagline</label>
            <input style={inputStyle} value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="One line summary" />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.description} onChange={(e) => update("description", e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Website (optional)</label>
              <input style={inputStyle} value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" />
            </div>
            <div>
              <label style={labelStyle}>Contact email (optional)</label>
              <input style={inputStyle} type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} />
            </div>
          </div>

          {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
          <div>
            <button type="submit" disabled={busy || uploading} style={{ ...primaryButtonStyle, opacity: busy ? 0.7 : 1 }}>
              {busy ? "Adding…" : `Add ${noun}`}
            </button>
          </div>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>{isAcademe ? "Research & Innovations" : "Startups you're incubating"}</h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#5A544B" }}>{isAcademe ? "Research projects and innovations associated with your organization." : "Startups hosted under this organization."}</p>
        {!loaded ? (
          <p style={{ margin: 0, fontSize: 13, color: "#8B8479" }}>Loading…</p>
        ) : rows.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "#8B8479" }}>None added yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.1)", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                  <div style={{ fontSize: 11.5, color: "#8B8479", marginTop: 1 }}>{r.sector}{r.lifecycle_stage ? ` · ${r.lifecycle_stage}` : ""}</div>
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

export default function OrganizationStartups() {
  const { selectedOrg, loaded } = useRequiredOrg();
  if (!loaded) return <div style={{ padding: "40px 0", textAlign: "center", color: "#8B8479", fontSize: 14 }}>Loading&hellip;</div>;
  if (!selectedOrg) return <OrgRequiredNotice />;
  return <Manager orgId={selectedOrg.id} isAcademe={selectedOrg.org_type === "Academe"} />;
}
