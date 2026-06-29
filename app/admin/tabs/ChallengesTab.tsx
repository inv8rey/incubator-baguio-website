"use client";

import { StatCard } from "../StatCard";
import { CHALLENGES, CHALLENGE_STATS, DARK } from "../data";

export default function ChallengesTab() {
  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="ib-admin-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {CHALLENGE_STATS.map((s) => (
          <StatCard key={s.label} {...s} compact />
        ))}
      </div>

      <div className="ib-admin-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {CHALLENGES.map((c) => (
          <div key={c.title} style={{ background: "#fff", border: "1.5px solid rgba(20,20,25,0.09)", borderRadius: 18, padding: 24, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: c.sectorColor, background: c.sectorBg, padding: "5px 12px", borderRadius: 999 }}>
                {c.sector}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: c.urgencyColor, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.urgencyColor, display: "inline-block" }} />
                {c.urgency}
              </span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: DARK, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>{c.title}</h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73", marginBottom: 18, flex: 1 }}>{c.desc}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(20,20,25,0.08)" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: c.orgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {c.orgInitials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{c.org}</div>
                <div style={{ fontSize: 11, color: "#9A958B", marginTop: 1 }}>{c.submissions} submissions</div>
              </div>
              <button style={{ background: DARK, color: "#fff", fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 999, border: "none", cursor: "pointer" }}>View</button>
            </div>
          </div>
        ))}

        <div
          style={{
            background: "#F5F4F0",
            border: "1.5px dashed rgba(20,20,25,0.16)",
            borderRadius: 18,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            minHeight: 200,
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 999, background: "#EDEAE5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Post a new challenge</div>
          <p style={{ fontSize: 13.5, color: "#9A958B", marginBottom: 18, lineHeight: 1.4, maxWidth: 200 }}>For government, industry, and academic institutions.</p>
          <button style={{ background: "#F26522", color: "#fff", fontSize: 13.5, fontWeight: 600, padding: "10px 22px", borderRadius: 999, border: "none", cursor: "pointer" }}>
            Post Challenge →
          </button>
        </div>
      </div>
    </div>
  );
}
