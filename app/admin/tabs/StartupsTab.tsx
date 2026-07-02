"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { StatCard } from "../StatCard";
import { DARK, ORANGE, SECTOR_FILTERS, STAGE_BADGE, STAGE_FILTERS, STARTUP_STATS } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { initialsOf, paletteFor } from "../../../lib/visualIdentity";
import { uploadStartupLogo } from "../../../lib/uploadLogo";
import type { LocationValue } from "../../LocationPicker";

const LocationPicker = dynamic(() => import("../../LocationPicker"), { ssr: false });

const NAME_MAX = 60;
const DESCRIPTION_MAX = 280;
const TBI_MAX = 60;

interface Startup {
  id: string;
  name: string;
  sector: string;
  stage: string;
  tbi: string;
  funding: string;
  since: string;
  description: string;
  logoUrl: string;
  website: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  initials: string;
  color: string;
}

const EMPTY_FORM = {
  name: "",
  sector: SECTOR_FILTERS[0].label,
  stage: STAGE_FILTERS[1],
  tbi: "Independent",
  funding: "",
  since: "",
  description: "",
  logoUrl: "",
  website: "",
};

export default function StartupsTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [stage, setStage] = useState("All");
  const [sector, setSector] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const { data } = await supabase.from("startups").select("*").order("created_at", { ascending: false });
    setStartups(
      (data ?? []).map((s: any) => {
        const p = paletteFor(s.name);
        return {
          id: s.id,
          name: s.name,
          sector: s.sector,
          stage: s.lifecycle_stage,
          tbi: s.tbi_affiliation,
          funding: s.funding_raised,
          since: s.founded_year,
          description: s.description,
          logoUrl: s.logo_url,
          website: s.website,
          address: s.address,
          latitude: s.latitude,
          longitude: s.longitude,
          initials: initialsOf(s.name),
          color: p.color,
        };
      })
    );
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  const q = searchQuery.toLowerCase();
  const filtered = startups.filter((s) => (stage === "All" || s.stage === stage) && (!sector || s.sector === sector) && (!q || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q)));

  function update<K extends keyof typeof EMPTY_FORM>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openAddModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setLocation(null);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(s: Startup) {
    setEditingId(s.id);
    setForm({ name: s.name, sector: s.sector, stage: s.stage, tbi: s.tbi, funding: s.funding, since: s.since, description: s.description, logoUrl: s.logoUrl, website: s.website });
    setLocation(s.latitude != null && s.longitude != null ? { lat: s.latitude, lng: s.longitude, address: s.address } : null);
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadStartupLogo(file);
      update("logoUrl", url);
    } catch (err: any) {
      setError(err.message || "Logo upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function deleteStartup(id: string) {
    if (!supabase) return;
    if (!window.confirm("Delete this startup? This can't be undone.")) return;
    const { error: err } = await supabase.from("startups").delete().eq("id", id);
    if (err) {
      window.alert(err.message);
      return;
    }
    load();
  }

  async function submitStartup(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !form.name.trim()) return;
    setError("");
    const payload = {
      name: form.name.trim(),
      sector: form.sector,
      lifecycle_stage: form.stage,
      tbi_affiliation: form.tbi.trim(),
      funding_raised: form.funding.trim(),
      founded_year: form.since.trim(),
      description: form.description.trim(),
      logo_url: form.logoUrl,
      website: form.website.trim(),
      address: location?.address ?? "",
      latitude: location?.lat ?? null,
      longitude: location?.lng ?? null,
    };
    const { error: err } = editingId
      ? await supabase.from("startups").update(payload).eq("id", editingId)
      : await supabase.from("startups").insert(payload);
    if (err) {
      setError(err.message);
      return;
    }
    closeModal();
    load();
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="ib-admin-grid-5" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
        {STARTUP_STATS.map((s) => (
          <StatCard key={s.label} {...s} compact />
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(20,20,25,0.09)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", background: "#F5F4F0", borderRadius: 999, padding: 3, gap: 2 }}>
          {STAGE_FILTERS.map((s) => {
            const active = stage === s;
            return (
              <button
                key={s}
                onClick={() => setStage(s)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: active ? 600 : 500,
                  color: active ? "#fff" : "#6B6B73",
                  background: active ? "#0E0E10" : "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {s}
                {s === "All" && (
                  <span style={{ fontSize: 10, background: active ? "rgba(255,255,255,0.2)" : "rgba(20,20,25,0.08)", padding: "1px 5px", borderRadius: 999, marginLeft: 4 }}>
                    {startups.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ width: 1, height: 26, background: "rgba(20,20,25,0.08)" }} />
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          {SECTOR_FILTERS.map((f) => {
            const active = sector === f.label;
            return (
              <button
                key={f.label}
                onClick={() => setSector(active ? null : f.label)}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "5px 11px",
                  borderRadius: 999,
                  border: active ? `1.5px solid ${f.color}4D` : "1.5px solid rgba(20,20,25,0.09)",
                  color: active ? f.color : "#6B6B73",
                  background: active ? `${f.color}14` : "#fff",
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={openAddModal}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600, border: "none", color: "#fff", background: "#F26522", cursor: "pointer" }}
        >
          + Add Startup
        </button>
      </div>

      <div className="ib-admin-table" style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)", overflow: "hidden", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 760 }}>
          <thead>
            <tr style={{ background: "#F5F4F0" }}>
              {["Startup", "Sector", "Stage", "TBI", "Funding", "Since", "Actions"].map((h, i) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    fontSize: 10.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                    color: "#9A958B",
                    padding: i === 0 ? "12px 14px 12px 20px" : "12px 14px",
                    borderBottom: "1.5px solid rgba(20,20,25,0.09)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loaded && filtered.map((s, i) => {
              const badge = STAGE_BADGE[s.stage] ?? STAGE_BADGE.Idea;
              return (
                <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(20,20,25,0.06)" : "none" }}>
                  <td style={{ padding: "13px 14px 13px 20px", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {s.logoUrl ? (
                        <img src={s.logoUrl} alt="" style={{ width: 32, height: 32, borderRadius: 9, objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                          {s.initials}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>{s.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "13px 14px", verticalAlign: "middle", color: "#6B6B73" }}>{s.sector}</td>
                  <td style={{ padding: "13px 14px", verticalAlign: "middle" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 600, padding: "3px 9px", borderRadius: 999, color: badge.color, background: badge.bg }}>● {s.stage}</span>
                  </td>
                  <td style={{ padding: "13px 14px", verticalAlign: "middle", color: "#6B6B73" }}>{s.tbi}</td>
                  <td style={{ padding: "13px 14px", verticalAlign: "middle", fontWeight: 600, color: DARK }}>{s.funding || "—"}</td>
                  <td style={{ padding: "13px 14px", verticalAlign: "middle", color: "#9A958B" }}>{s.since || "—"}</td>
                  <td style={{ padding: "13px 14px", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button onClick={() => openEditModal(s)} style={{ fontSize: 12, fontWeight: 600, color: "#285E7A", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        Edit
                      </button>
                      <button onClick={() => deleteStartup(s.id)} style={{ fontSize: 12, fontWeight: 600, color: "#E23A2E", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {loaded && filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "28px 20px", textAlign: "center", color: "#9A958B", fontSize: 13 }}>
                  {startups.length === 0 ? "No startups yet — add the first one." : "No startups match these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div
          onClick={closeModal}
          style={{ position: "fixed", inset: 0, background: "rgba(15,15,17,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitStartup}
            style={{ background: "#fff", borderRadius: 18, padding: 26, width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 16, maxHeight: "90vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: DARK }}>{editingId ? "Edit startup" : "Add startup"}</div>
              <button type="button" onClick={closeModal} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#9A958B", lineHeight: 1 }}>
                ×
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover" }} />
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: 12, background: "#F5F4F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A958B", fontSize: 10.5, textAlign: "center" }}>
                  No logo
                </div>
              )}
              <div>
                <label style={{ display: "inline-block", fontSize: 12.5, fontWeight: 600, color: "#285E7A", cursor: "pointer" }}>
                  {uploading ? "Uploading…" : "Upload logo"}
                  <input type="file" accept="image/*" onChange={handleLogoChange} disabled={uploading} style={{ display: "none" }} />
                </label>
                <div style={{ fontSize: 11, color: "#9A958B", marginTop: 2 }}>PNG or JPG, up to 2MB</div>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Startup name</label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. ColdTrail"
                required
                maxLength={NAME_MAX}
                style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>
                <span>Description</span>
                <span style={{ color: "#9A958B", fontWeight: 500 }}>{form.description.length}/{DESCRIPTION_MAX}</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="One or two sentences for the public card."
                maxLength={DESCRIPTION_MAX}
                style={{ width: "100%", fontSize: 13.5, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box", minHeight: 74, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Sector</label>
                <select
                  value={form.sector}
                  onChange={(e) => update("sector", e.target.value)}
                  style={{ width: "100%", fontSize: 13.5, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
                >
                  {SECTOR_FILTERS.map((f) => (
                    <option key={f.label} value={f.label}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Stage</label>
                <select
                  value={form.stage}
                  onChange={(e) => update("stage", e.target.value)}
                  style={{ width: "100%", fontSize: 13.5, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
                >
                  {STAGE_FILTERS.filter((s) => s !== "All").map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>TBI affiliation</label>
              <input
                value={form.tbi}
                onChange={(e) => update("tbi", e.target.value)}
                placeholder="Independent"
                maxLength={TBI_MAX}
                style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Website / Facebook link</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://facebook.com/... or https://..."
                style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
              />
              <div style={{ fontSize: 11, color: "#9A958B", marginTop: 4 }}>Shown as a link button on the startup's public card.</div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Location</label>
              <LocationPicker value={location} onChange={setLocation} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Funding raised</label>
                <input
                  value={form.funding}
                  onChange={(e) => update("funding", e.target.value)}
                  placeholder="₱500K"
                  style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Since (year)</label>
                <input
                  value={form.since}
                  onChange={(e) => update("since", e.target.value)}
                  placeholder="2024"
                  maxLength={4}
                  style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {error && <p style={{ color: "#E23A2E", fontSize: 12.5, margin: 0 }}>{error}</p>}

            <button
              type="submit"
              disabled={uploading}
              style={{ marginTop: 4, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 999, padding: "11px 22px", cursor: "pointer", opacity: uploading ? 0.7 : 1 }}
            >
              {editingId ? "Save changes" : "Add startup"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
