"use client";

import { useMemo, useState } from "react";
import { CHALLENGES, type ChallengeOrgType } from "./data";

const DARK = "#141417";
const ORANGE = "#F26522";

const SECTORS = ["Agriculture", "Environment", "Tourism", "Health", "Education", "Govtech", "Other"];
const ORG_TYPES: ChallengeOrgType[] = ["Government", "Academe", "Private Sector", "Community"];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        fontSize: 13.5,
        fontWeight: active ? 600 : 500,
        color: active ? "#fff" : "#44444C",
        background: active ? DARK : "#F4F2EC",
        padding: "9px 18px",
        borderRadius: 9999,
        cursor: "pointer",
      }}
    >
      {label}
    </span>
  );
}

export default function ChallengesBrowser({ bp }: { bp: string }) {
  const [sector, setSector] = useState<string | null>(null);
  const [orgType, setOrgType] = useState<ChallengeOrgType | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHALLENGES.filter((c) => {
      if (sector && c.sector !== sector) return false;
      if (orgType && c.orgType !== orgType) return false;
      if (q && !`${c.title} ${c.summary} ${c.orgName} ${c.sector}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sector, orgType, query]);

  return (
    <div style={{ background: "#fff", padding: "56px 40px 64px", borderTop: "1px solid rgba(20,20,25,0.06)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: ORANGE, marginBottom: 10 }}>Open now</div>
            <h2 style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: "-0.025em", color: DARK }}>Browse challenges</h2>
          </div>
          <div style={{ height: 46, background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.14)", borderRadius: 9999, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", minWidth: 260 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2}><circle cx={11} cy={11} r={7} /><path d="m20 20-3.5-3.5" /></svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search challenges"
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, color: DARK, width: "100%" }}
            />
          </div>
        </div>

        {/* SECTOR FILTER */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B", marginBottom: 10 }}>Startup category</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Chip label="All sectors" active={sector === null} onClick={() => setSector(null)} />
            {SECTORS.map((s) => (
              <Chip key={s} label={s} active={sector === s} onClick={() => setSector(s)} />
            ))}
          </div>
        </div>

        {/* ORG TYPE FILTER */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B", marginBottom: 10 }}>Posted by</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Chip label="All organizations" active={orgType === null} onClick={() => setOrgType(null)} />
            {ORG_TYPES.map((o) => (
              <Chip key={o} label={o} active={orgType === o} onClick={() => setOrgType(o)} />
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", fontSize: 14, color: "#9A958B", padding: "48px 0" }}>No challenges match your filters.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {filtered.map((c) => (
              <div key={c.id} className="ib-challenge-hover" style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 24, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: c.sectorColor, background: c.sectorBg, padding: "5px 11px", borderRadius: 9999 }}>{c.sector}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: c.deadlineColor }}>
                    <span style={{ width: 6, height: 6, borderRadius: 9999, background: c.deadlineColor, display: "inline-block" }} />
                    {c.deadline}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{c.title}</h3>
                <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73", flex: 1 }}>{c.summary}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: c.orgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: c.orgInitialsFontSize, fontWeight: 700, color: "#fff" }}>{c.orgInitials}</div>
                  <span style={{ fontSize: 12.5, color: "#9A958B" }}>{c.orgName}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: "#9A958B", background: "#F4F2EC", padding: "3px 9px", borderRadius: 9999, marginLeft: "auto" }}>{c.orgType}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid rgba(20,20,25,0.08)" }}>
                  <a href={`${bp}/challenges/${c.id}/`} style={{ fontSize: 13, fontWeight: 600, color: DARK, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    View challenge <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth={2.3}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", marginTop: 30 }}>
          <a href="#" style={{ fontSize: 14, fontWeight: 600, color: DARK, textDecoration: "none", border: "1px solid rgba(20,20,25,0.18)", padding: "13px 28px", borderRadius: 9999 }}>Load more challenges</a>
        </div>
      </div>
    </div>
  );
}
