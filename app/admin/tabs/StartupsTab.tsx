"use client";

import { useState } from "react";
import { StatCard } from "../StatCard";
import { DARK, SECTOR_FILTERS, STAGE_BADGE, STAGE_FILTERS, STARTUPS, STARTUP_STATS } from "../data";

export default function StartupsTab() {
  const [stage, setStage] = useState("All");
  const [sector, setSector] = useState<string | null>(null);

  const filtered = STARTUPS.filter((s) => (stage === "All" || s.stage === stage) && (!sector || s.sector === sector));

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
                    {STARTUPS.length}
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
        <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600, border: "none", color: "#fff", background: "#F26522", cursor: "pointer" }}>
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
    </div>
  );
}
