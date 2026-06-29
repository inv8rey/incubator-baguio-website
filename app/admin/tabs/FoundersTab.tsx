"use client";

import { StatCard } from "../StatCard";
import { DARK, FOUNDERS, FOUNDER_STATS } from "../data";

export default function FoundersTab() {
  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="ib-admin-grid-5" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
        {FOUNDER_STATS.map((s) => (
          <StatCard key={s.label} {...s} compact />
        ))}
      </div>

      <div className="ib-admin-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {FOUNDERS.map((f) => (
          <div
            key={f.name}
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 20,
              border: "1.5px solid rgba(20,20,25,0.09)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              textAlign: "center",
              cursor: "pointer",
            }}
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
    </div>
  );
}
