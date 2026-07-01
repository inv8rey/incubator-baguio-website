"use client";

import { useState } from "react";
import { StatCard } from "../StatCard";
import { DARK, FOUNDERS, FOUNDER_STATS, ORANGE, SECTOR_FILTERS, STAGE_FILTERS } from "../data";

const NEXT_COLORS = [ORANGE, "#285E7A", "#1A6B3C", "#9E2A52", "#F5A623", "#6B5BD6", "#0E5C44", "#8B4513"];

export default function FoundersTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [founders, setFounders] = useState(FOUNDERS);
  const [addOpen, setAddOpen] = useState(false);

  const [fName, setFName] = useState("");
  const [fRole, setFRole] = useState("CEO & Founder");
  const [fSector, setFSector] = useState(SECTOR_FILTERS[0].label);
  const [fStage, setFStage] = useState(STAGE_FILTERS[1]);
  const [fFunding, setFFunding] = useState("");
  const [fPrograms, setFPrograms] = useState("0");
  const [fStartup, setFStartup] = useState("");

  function resetForm() {
    setFName(""); setFRole("CEO & Founder"); setFSector(SECTOR_FILTERS[0].label);
    setFStage(STAGE_FILTERS[1]); setFFunding(""); setFPrograms("0"); setFStartup("");
  }

  function addFounder(e: React.FormEvent) {
    e.preventDefault();
    if (!fName.trim()) return;
    const initials = fName.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const color = NEXT_COLORS[founders.length % NEXT_COLORS.length];
    const sectorEntry = SECTOR_FILTERS.find((s) => s.label === fSector);
    const sectorColor = sectorEntry?.color ?? ORANGE;
    const stageBadge = fStage === "Growth" ? { color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" } : fStage === "Launch" ? { color: ORANGE, bg: "rgba(242,101,34,0.10)" } : { color: "#F5A623", bg: "rgba(245,166,35,0.12)" };
    setFounders((prev) => [
      {
        initials,
        color,
        name: fName.trim(),
        role: fRole.trim() || "Founder",
        tags: [
          { label: fSector, color: sectorColor, bg: `${sectorColor}1A` },
          { label: fStage, ...stageBadge },
        ],
        funding: fFunding.trim() || "—",
        programs: parseInt(fPrograms) || 0,
        startup: fStartup.trim() || "—",
      },
      ...prev,
    ]);
    resetForm();
    setAddOpen(false);
  }

  const q = searchQuery.toLowerCase();
  const filtered = founders.filter((f) => !q || f.name.toLowerCase().includes(q) || f.startup.toLowerCase().includes(q));

  const modalBg: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 };
  const modalBox: React.CSSProperties = { background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: 20 };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.14)", fontSize: 13.5, color: DARK, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 5, display: "block" };

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="ib-admin-grid-5" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, flex: 1 }}>
          {FOUNDER_STATS.map((s) => (
            <StatCard key={s.label} {...s} compact />
          ))}
        </div>
        <button
          onClick={() => setAddOpen(true)}
          style={{ marginLeft: 16, display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, background: DARK, color: "#fff", border: "none", fontSize: 13.5, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Add Founder
        </button>
      </div>

      <div className="ib-admin-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {filtered.map((f) => (
          <div
            key={f.name}
            style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1.5px solid rgba(20,20,25,0.09)", display: "flex", flexDirection: "column", gap: 12, textAlign: "center", cursor: "pointer" }}
          >
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: f.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 auto" }}>
              {f.initials}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: DARK, marginBottom: 2 }}>{f.name}</div>
              <div style={{ fontSize: 11.5, color: "#6B6B73" }}>{f.role}</div>
            </div>
            <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap" }}>
              {f.tags.map((t) => (
                <span key={t.label} style={{ fontSize: 10.5, fontWeight: 600, padding: "3px 8px", borderRadius: 999, color: t.color, background: t.bg }}>
                  {t.label}
                </span>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "#F5F4F0", borderRadius: 8, padding: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{f.funding}</div>
                <div style={{ fontSize: 9.5, color: "#9A958B", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600, marginTop: 2 }}>Funding</div>
              </div>
              <div style={{ background: "#F5F4F0", borderRadius: 8, padding: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{f.programs}</div>
                <div style={{ fontSize: 9.5, color: "#9A958B", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600, marginTop: 2 }}>Programs</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#9A958B" }}>{f.startup}</div>
          </div>
        ))}
      </div>

      {addOpen && (
        <div style={modalBg} onClick={() => setAddOpen(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Add Founder</div>
              <button onClick={() => setAddOpen(false)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F5F4F0", cursor: "pointer", fontSize: 18, color: "#6B6B73", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <form onSubmit={addFounder} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} value={fName} onChange={(e) => setFName(e.target.value)} placeholder="e.g. Maria Santos" required />
              </div>
              <div>
                <label style={labelStyle}>Role / Title</label>
                <input style={inputStyle} value={fRole} onChange={(e) => setFRole(e.target.value)} placeholder="e.g. CEO & Founder" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Sector</label>
                  <select style={inputStyle} value={fSector} onChange={(e) => setFSector(e.target.value)}>
                    {SECTOR_FILTERS.map((s) => <option key={s.label}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Stage</label>
                  <select style={inputStyle} value={fStage} onChange={(e) => setFStage(e.target.value)}>
                    {STAGE_FILTERS.filter((s) => s !== "All").map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Funding Raised</label>
                  <input style={inputStyle} value={fFunding} onChange={(e) => setFFunding(e.target.value)} placeholder="e.g. ₱500K" />
                </div>
                <div>
                  <label style={labelStyle}>Programs Joined</label>
                  <input style={inputStyle} type="number" min={0} value={fPrograms} onChange={(e) => setFPrograms(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Startup / Company</label>
                <input style={inputStyle} value={fStartup} onChange={(e) => setFStartup(e.target.value)} placeholder="e.g. Dontog Technofarms" />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                <button type="button" onClick={() => setAddOpen(false)} style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", background: "#fff", fontSize: 13.5, fontWeight: 500, cursor: "pointer", color: "#44444C" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: DARK, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Add Founder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
