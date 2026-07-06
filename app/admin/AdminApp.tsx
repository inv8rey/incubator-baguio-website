"use client";

import { useState } from "react";
import { NAV, ORANGE, SUBS, TITLES, type TabId } from "./data";
import DashboardTab from "./tabs/DashboardTab";
import StartupsTab from "./tabs/StartupsTab";
import FoundersTab from "./tabs/FoundersTab";
import ChallengesTab from "./tabs/ChallengesTab";
import EventsTab from "./tabs/EventsTab";
import EcosystemSignupsTab from "./tabs/EcosystemSignupsTab";
import PartnersTab from "./tabs/PartnersTab";

const NAV_ICON_PATHS: Record<TabId, React.JSX.Element> = {
  dashboard: (
    <>
      <rect x={3} y={3} width={7} height={7} rx={1} />
      <rect x={14} y={3} width={7} height={7} rx={1} />
      <rect x={3} y={14} width={7} height={7} rx={1} />
      <rect x={14} y={14} width={7} height={7} rx={1} />
    </>
  ),
  startups: (
    <>
      <path d="M5 13.5L3 21l7.5-2M14.5 5.5C17 3 21 3 21 3s0 4-2.5 6.5L11 17l-4-4z" />
      <circle cx={15} cy={9} r={1.2} fill="currentColor" stroke="none" />
    </>
  ),
  founders: (
    <>
      <circle cx={9} cy={8} r={3.5} />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx={17} cy={7} r={2.5} />
      <path d="M21 19c0-2.4-1.8-4.5-4-5" />
    </>
  ),
  challenges: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  events: (
    <>
      <rect x={3} y={4} width={18} height={17} rx={2} />
      <path d="M8 2v4M16 2v4M3 9h18" />
    </>
  ),
  signups: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx={9} cy={7} r={4} />
      <path d="M19 8v6M22 11h-6" />
    </>
  ),
  partners: (
    <>
      <circle cx={7} cy={7} r={3} />
      <circle cx={17} cy={7} r={3} />
      <path d="M2 21c0-3.3 2.2-5.5 5-5.5S12 17.7 12 21M12 21c0-3.3 2.2-5.5 5-5.5S22 17.7 22 21" />
    </>
  ),
};

function NavIcon({ id }: { id: TabId }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {NAV_ICON_PATHS[id]}
    </svg>
  );
}

export default function AdminApp() {
  const [page, setPage] = useState<TabId>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const Sidebar = (
    <aside
      className="ib-admin-sidebar"
      style={{
        background: "#0E0E10",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/cpdso-logo.png`} alt="CPDSO" style={{ width: 36, height: 36, borderRadius: 9, objectFit: "contain" }} />
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/ib-icon.png`} alt="IB" style={{ width: 36, height: 36, borderRadius: 9, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>Incubator Baguio</div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Innovation Dashboard</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 12px 8px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: "rgba(255,255,255,0.28)", padding: "8px 10px 6px" }}>Main</div>
        {NAV.map((n) => {
          const active = page === n.id;
          return (
            <button
              key={n.id}
              onClick={() => {
                setPage(n.id);
                setMenuOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: active ? 600 : 500,
                color: active ? ORANGE : "rgba(255,255,255,0.52)",
                width: "100%",
                textAlign: "left",
                background: active ? "rgba(242,101,34,0.12)" : "transparent",
                border: "none",
                cursor: "pointer",
                marginBottom: 2,
              }}
            >
              <span style={{ display: "flex", color: "inherit" }}>
                <NavIcon id={n.id} />
              </span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.cnt != null && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "1px 7px",
                    borderRadius: 999,
                    background: active ? "rgba(242,101,34,0.18)" : "rgba(255,255,255,0.08)",
                    color: active ? ORANGE : "rgba(255,255,255,0.40)",
                  }}
                >
                  {n.cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "14px 20px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${ORANGE},#FF9A6C)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            LG
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>Leandro R. Gepila</div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.38)", marginTop: 1 }}>Innovation Operator</div>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="ib-admin" style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", fontFamily: "'General Sans',ui-sans-serif,system-ui,sans-serif", color: "#141417" }}>
      {Sidebar}

      {/* Mobile sidebar overlay */}
      {menuOpen && (
        <div
          className="ib-admin-overlay"
          onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90 }}
        />
      )}
      <div className={`ib-admin-mobile-sidebar ${menuOpen ? "ib-admin-mobile-open" : ""}`}>{Sidebar}</div>

      <main style={{ display: "flex", flexDirection: "column", minWidth: 0, background: "#F5F4F0" }}>
        {/* TOPBAR */}
        <div style={{ background: "#ffffff", borderBottom: "1.5px solid rgba(20,20,25,0.08)", padding: "15px 28px", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 10 }}>
          <button
            className="ib-admin-burger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            style={{ display: "none", width: 36, height: 36, borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.09)", background: "#F5F4F0", flexDirection: "column", justifyContent: "center", gap: 4, flexShrink: 0, cursor: "pointer" }}
          >
            <span style={{ width: 16, height: 2, background: "#141417", margin: "0 auto", borderRadius: 2 }} />
            <span style={{ width: 16, height: 2, background: "#141417", margin: "0 auto", borderRadius: 2 }} />
            <span style={{ width: 16, height: 2, background: "#141417", margin: "0 auto", borderRadius: 2 }} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 21, fontWeight: 700, color: "#141417", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{TITLES[page]}</div>
            <div className="ib-admin-pagesub" style={{ fontSize: 12, color: "#9A958B", marginTop: 2 }}>{SUBS[page]}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="ib-admin-search" style={{ display: "flex", alignItems: "center", gap: 7, background: "#F5F4F0", border: "1.5px solid rgba(20,20,25,0.09)", borderRadius: 9, padding: "7px 14px", minWidth: 220 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2} strokeLinecap="round">
                <circle cx={11} cy={11} r={7} />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: "none", background: "transparent", fontSize: 12.5, color: "#141417", width: "100%", outline: "none" }} />
              <span style={{ fontSize: 10, color: "#9A958B", background: "rgba(20,20,25,0.07)", borderRadius: 4, padding: "1px 5px", fontWeight: 500 }}>⌘K</span>
            </div>
            <div style={{ position: "relative" }}>
              <button style={{ width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F4F0", border: "1.5px solid rgba(20,20,25,0.09)", cursor: "pointer" }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6B6B73" strokeWidth={1.9} strokeLinecap="round">
                  <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5z" />
                  <path d="M10 20a2 2 0 0 0 4 0" />
                </svg>
              </button>
              <span style={{ position: "absolute", top: -4, right: -4, background: "#E23A2E", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 999, padding: "0 5px", minWidth: 17, textAlign: "center", lineHeight: "17px", border: "2px solid #fff" }}>
                3
              </span>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${ORANGE},#FF9A6C)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              LG
            </div>
          </div>
        </div>

        {page === "dashboard" && <DashboardTab />}
        {page === "startups" && <StartupsTab searchQuery={searchQuery} />}
        {page === "founders" && <FoundersTab searchQuery={searchQuery} />}
        {page === "challenges" && <ChallengesTab searchQuery={searchQuery} />}
        {page === "events" && <EventsTab searchQuery={searchQuery} />}
        {page === "signups" && <EcosystemSignupsTab searchQuery={searchQuery} />}
        {page === "partners" && <PartnersTab searchQuery={searchQuery} />}
      </main>
    </div>
  );
}
