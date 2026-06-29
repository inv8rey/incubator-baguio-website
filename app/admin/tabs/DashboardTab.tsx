"use client";

import { Sparkline, StageDonut, RadarChart, FundingPie } from "../charts";
import { ACTIVITY, DARK, FUNDING_BREAKDOWN, KPIS, MATURITY_AXES, SECTORS, STAGE_MIX } from "../data";

const KPI_ICONS = [
  <path key="0" d="M5 13.5L3 21l7.5-2M14.5 5.5C17 3 21 3 21 3s0 4-2.5 6.5L11 17l-4-4z" />,
  <>
    <circle key="1a" cx={9} cy={8} r={3.5} />
    <path key="1b" d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle key="1c" cx={17} cy={7} r={2.5} />
    <path key="1d" d="M21 19c0-2.4-1.8-4.5-4-5" />
  </>,
  <path key="2" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  <>
    <ellipse key="3a" cx={9} cy={7} rx={6} ry={3} />
    <path key="3b" d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7" />
    <path key="3c" d="M3 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-2" />
  </>,
];

export default function DashboardTab() {
  const stageTotal = STAGE_MIX.reduce((s, x) => s + x.count, 0);

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI ROW */}
      <div className="ib-admin-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {KPIS.map((k, idx) => (
          <div key={k.label} style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1.5px solid rgba(20,20,25,0.09)", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={k.color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                {KPI_ICONS[idx]}
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, color: "#9A958B", fontWeight: 500, marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: DARK, letterSpacing: "-0.025em", lineHeight: 1.1 }}>{k.value}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "#22C55E" }}>{k.delta}</span>
                <span style={{ fontSize: 11, color: "#9A958B" }}>{k.deltaNote}</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <Sparkline data={k.spark} color={k.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE ROW */}
      <div className="ib-admin-grid-3-mid" style={{ display: "grid", gridTemplateColumns: "2fr 1.35fr 1.35fr", gap: 16, alignItems: "start" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid rgba(20,20,25,0.09)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 3 }}>Startups by Sector</div>
          <div style={{ fontSize: 11.5, color: "#9A958B", marginBottom: 18 }}>82 startups across 13 sectors</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {SECTORS.map((s, i) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: i < SECTORS.length - 1 ? "1px solid rgba(20,20,25,0.05)" : "none",
                }}
              >
                <div style={{ width: 26, height: 26, borderRadius: 7, background: `${s.color}1F`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 500, color: "#44444C", width: 190, flexShrink: 0, lineHeight: 1.3 }}>{s.label}</span>
                <div style={{ flex: 1, height: 7, background: "rgba(20,20,25,0.06)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${s.pct}%`, height: "100%", background: s.color, borderRadius: 999 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: DARK, width: 22, textAlign: "right", flexShrink: 0 }}>{s.count}</span>
                <span style={{ fontSize: 11, color: "#9A958B", width: 44, textAlign: "right", flexShrink: 0 }}>{s.pct}%</span>
              </div>
            ))}
          </div>
          <button style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", marginTop: 14, padding: 9, border: "1.5px solid rgba(20,20,25,0.09)", borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: "#6B6B73", background: "#fff", cursor: "pointer" }}>
            View all sectors →
          </button>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid rgba(20,20,25,0.09)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 3 }}>Stage Mix</div>
          <div style={{ fontSize: 11.5, color: "#9A958B", marginBottom: 18 }}>Distribution by development stage</div>
          <StageDonut data={STAGE_MIX} total={stageTotal} />
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid rgba(20,20,25,0.09)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 3 }}>Ecosystem Maturity</div>
          <div style={{ fontSize: 11.5, color: "#9A958B", marginBottom: 8 }}>SCMM Score</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 16 }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: DARK, letterSpacing: "-0.03em", lineHeight: 1 }}>2.6</span>
            <span style={{ fontSize: 16, color: "#9A958B" }}>/5</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#F26522", marginLeft: 6 }}>Level 2 · Foundational</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <RadarChart axes={MATURITY_AXES} />
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="ib-admin-grid-2-bottom" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid rgba(20,20,25,0.09)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 3 }}>Funding Breakdown</div>
          <div style={{ fontSize: 11.5, color: "#9A958B", marginBottom: 10 }}>YTD 2026 by source</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: DARK, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4 }}>₱36.0M</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#22C55E", marginBottom: 16 }}>↑ +13.4% vs 2025</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 180 }}>
              {FUNDING_BREAKDOWN.map((f) => (
                <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: f.color, flexShrink: 0, display: "inline-block" }} />
                  <span style={{ color: "#6B6B73", flex: 1 }}>{f.label}</span>
                  <span style={{ fontWeight: 600, color: DARK }}>{f.value}</span>
                  <span style={{ fontSize: 11, color: "#9A958B", marginLeft: 2 }}>{f.pct}%</span>
                </div>
              ))}
            </div>
            <FundingPie slices={FUNDING_BREAKDOWN} />
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid rgba(20,20,25,0.09)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>Recent Activity</div>
            <button style={{ fontSize: 12, fontWeight: 600, color: "#F26522", background: "none", border: "none", cursor: "pointer" }}>View all →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {ACTIVITY.map((a, i) => (
              <div
                key={a.name + i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 11,
                  padding: "10px 0",
                  borderBottom: i < ACTIVITY.length - 1 ? "1px solid rgba(20,20,25,0.05)" : "none",
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: a.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {a.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{a.name}</div>
                  <div style={{ fontSize: 11.5, color: "#6B6B73", marginTop: 2, lineHeight: 1.4 }}>{a.note}</div>
                  <div style={{ fontSize: 11, color: "#9A958B", marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
