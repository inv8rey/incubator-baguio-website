"use client";

import { useState } from "react";
import { StatCard } from "../StatCard";
import { CHALLENGES, CHALLENGE_STATS, DARK, ORANGE } from "../data";

const SECTOR_OPTIONS = ["Agriculture", "Environment", "Tourism", "Industry", "Academia", "Health", "Education", "Finance"];
const NEXT_COLORS = ["#1A6B3C", "#285E7A", "#9E2A52", ORANGE, "#3A5FA0", "#E23A2E", "#6B5BD6", "#F5A623"];

type Challenge = typeof CHALLENGES[number];

export default function ChallengesTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [challenges, setChallenges] = useState(CHALLENGES);
  const [postOpen, setPostOpen] = useState(false);
  const [viewChallenge, setViewChallenge] = useState<Challenge | null>(null);

  // Post form state
  const [pTitle, setPTitle] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pSector, setPSector] = useState(SECTOR_OPTIONS[0]);
  const [pOrg, setPOrg] = useState("");
  const [pDays, setPDays] = useState("30");

  function resetPostForm() {
    setPTitle(""); setPDesc(""); setPSector(SECTOR_OPTIONS[0]); setPOrg(""); setPDays("30");
  }

  function addChallenge(e: React.FormEvent) {
    e.preventDefault();
    if (!pTitle.trim() || !pOrg.trim()) return;
    const initials = pOrg.trim().split(" ").map((w) => w[0]).join("").slice(0, 4).toUpperCase();
    const color = NEXT_COLORS[challenges.length % NEXT_COLORS.length];
    const days = parseInt(pDays) || 30;
    setChallenges((prev) => [
      {
        sector: pSector,
        sectorColor: color,
        sectorBg: `${color}1A`,
        urgency: `${days} days left`,
        urgencyColor: days <= 10 ? "#E23A2E" : "#F5A623",
        title: pTitle.trim(),
        desc: pDesc.trim() || "No description provided.",
        org: pOrg.trim(),
        orgInitials: initials,
        orgColor: color,
        submissions: 0,
      },
      ...prev,
    ]);
    resetPostForm();
    setPostOpen(false);
  }

  const q = searchQuery.toLowerCase();
  const filtered = challenges.filter((c) => !q || c.title.toLowerCase().includes(q) || c.org.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q));

  const modalBg: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 };
  const modalBox: React.CSSProperties = { background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: 20 };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.14)", fontSize: 13.5, color: DARK, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 5, display: "block" };

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="ib-admin-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {CHALLENGE_STATS.map((s) => (
          <StatCard key={s.label} {...s} compact />
        ))}
      </div>

      <div className="ib-admin-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {filtered.map((c) => (
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
              <button onClick={() => setViewChallenge(c)} style={{ background: DARK, color: "#fff", fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 999, border: "none", cursor: "pointer" }}>View</button>
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
          <button onClick={() => setPostOpen(true)} style={{ background: "#F26522", color: "#fff", fontSize: 13.5, fontWeight: 600, padding: "10px 22px", borderRadius: 999, border: "none", cursor: "pointer" }}>
            Post Challenge →
          </button>
        </div>
      </div>

      {/* Post Challenge Modal */}
      {postOpen && (
        <div style={modalBg} onClick={() => setPostOpen(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Post a Challenge</div>
              <button onClick={() => setPostOpen(false)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F5F4F0", cursor: "pointer", fontSize: 18, color: "#6B6B73", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <form onSubmit={addChallenge} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Challenge Title *</label>
                <input style={inputStyle} value={pTitle} onChange={(e) => setPTitle(e.target.value)} placeholder="e.g. Reduce plastic waste in public markets" required />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Describe the problem to be solved..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Sector</label>
                  <select style={inputStyle} value={pSector} onChange={(e) => setPSector(e.target.value)}>
                    {SECTOR_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Days Until Deadline</label>
                  <input style={inputStyle} type="number" min={1} value={pDays} onChange={(e) => setPDays(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Posting Organization *</label>
                <input style={inputStyle} value={pOrg} onChange={(e) => setPOrg(e.target.value)} placeholder="e.g. City Government of Baguio" required />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                <button type="button" onClick={() => setPostOpen(false)} style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", background: "#fff", fontSize: 13.5, fontWeight: 500, cursor: "pointer", color: "#44444C" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: ORANGE, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Post Challenge</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Challenge Modal */}
      {viewChallenge && (
        <div style={modalBg} onClick={() => setViewChallenge(null)}>
          <div style={{ ...modalBox, maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: viewChallenge.sectorColor, background: viewChallenge.sectorBg, padding: "4px 10px", borderRadius: 999 }}>
                  {viewChallenge.sector}
                </span>
              </div>
              <button onClick={() => setViewChallenge(null)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F5F4F0", cursor: "pointer", fontSize: 18, color: "#6B6B73", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: DARK, letterSpacing: "-0.025em", lineHeight: 1.2, margin: 0 }}>{viewChallenge.title}</h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#6B6B73", margin: 0 }}>{viewChallenge.desc}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "#F5F4F0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#9A958B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Submissions</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: DARK }}>{viewChallenge.submissions}</div>
              </div>
              <div style={{ background: "#F5F4F0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#9A958B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Deadline</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: viewChallenge.urgencyColor }}>{viewChallenge.urgency}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4, borderTop: "1px solid rgba(20,20,25,0.08)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: viewChallenge.orgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {viewChallenge.orgInitials}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{viewChallenge.org}</div>
                <div style={{ fontSize: 12, color: "#9A958B", marginTop: 2 }}>Challenge sponsor</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
