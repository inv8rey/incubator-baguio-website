"use client";

import { useState } from "react";
import { StatCard } from "../StatCard";
import { DARK, ORANGE, SECTOR_FILTERS, STAGE_BADGE, STAGE_FILTERS, STARTUPS, STARTUP_STATS } from "../data";

const NEXT_COLORS = ["#F26522", "#285E7A", "#1A6B3C", "#9E2A52", "#D88A0A", "#7C5CD6", "#0E5C44", "#8B4513"];

export default function StartupsTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [startups, setStartups] = useState(STARTUPS);
  const [stage, setStage] = useState("All");
  const [sector, setSector] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [newSector, setNewSector] = useState(SECTOR_FILTERS[0].label);
  const [newStage, setNewStage] = useState(STAGE_FILTERS[1]);
  const [tbi, setTbi] = useState("Independent");
  const [funding, setFunding] = useState("");

  const q = searchQuery.toLowerCase();
  const filtered = startups.filter((s) => (stage === "All" || s.stage === stage) && (!sector || s.sector === sector) && (!q || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q)));

  function resetForm() {
    setName("");
    setNewSector(SECTOR_FILTERS[0].label);
    setNewStage(STAGE_FILTERS[1]);
    setTbi("Independent");
    setFunding("");
  }

  function addStartup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
    const id = `BG-${String(100 + startups.length).padStart(3, "0")}`;
    setStartups((s) => [
      { id, initials, color: NEXT_COLORS[s.length % NEXT_COLORS.length], name: name.trim(), sector: newSector, stage: newStage, tbi, funding: funding.trim() || "—", since: String(new Date().getFullYear()) },
      ...s,
    ]);
    resetForm();
    setModalOpen(false);
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
          onClick={() => setModalOpen(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600, border: "none", color: "#fff", background: "#F26522", cursor: "pointer" }}
        >
          + Add Startup
        </button>
      </div>

      <div className="ib-admin-table" style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)", overflow: "hidden", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 720 }}>
          <thead>
            <tr style={{ background: "#F5F4F0" }}>
              {["Startup", "Sector", "Stage", "TBI", "Funding", "Since"].map((h, i) => (
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
            {filtered.map((s, i) => {
              const badge = STAGE_BADGE[s.stage];
              return (
                <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(20,20,25,0.06)" : "none", cursor: "pointer" }}>
                  <td style={{ padding: "13px 14px 13px 20px", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {s.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>{s.name}</div>
                        <div style={{ fontSize: 10.5, color: "#9A958B" }}>{s.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "13px 14px", verticalAlign: "middle", color: "#6B6B73" }}>{s.sector}</td>
                  <td style={{ padding: "13px 14px", verticalAlign: "middle" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 600, padding: "3px 9px", borderRadius: 999, color: badge.color, background: badge.bg }}>● {s.stage}</span>
                  </td>
                  <td style={{ padding: "13px 14px", verticalAlign: "middle", color: "#6B6B73" }}>{s.tbi}</td>
                  <td style={{ padding: "13px 14px", verticalAlign: "middle", fontWeight: 600, color: DARK }}>{s.funding}</td>
                  <td style={{ padding: "13px 14px", verticalAlign: "middle", color: "#9A958B" }}>{s.since}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "28px 20px", textAlign: "center", color: "#9A958B", fontSize: 13 }}>
                  No startups match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,15,17,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={addStartup}
            style={{ background: "#fff", borderRadius: 18, padding: 26, width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 16, maxHeight: "90vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: DARK }}>Add startup</div>
              <button type="button" onClick={() => setModalOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#9A958B", lineHeight: 1 }}>
                ×
              </button>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Startup name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ColdTrail"
                required
                style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Sector</label>
                <select
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
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
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  style={{ width: "100%", fontSize: 13.5, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
                >
                  {STAGE_FILTERS.filter((s) => s !== "All").map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>TBI</label>
                <input
                  value={tbi}
                  onChange={(e) => setTbi(e.target.value)}
                  placeholder="Independent"
                  style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Funding raised</label>
                <input
                  value={funding}
                  onChange={(e) => setFunding(e.target.value)}
                  placeholder="₱500K"
                  style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{ marginTop: 4, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 999, padding: "11px 22px", cursor: "pointer" }}
            >
              Add startup
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
