"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { COMMUNITY, CORPORATE, COWORKING, GOVERNMENT, MAKERSPACES, MENTORS, TBIS, type EcosystemCategory, type StartupEntry, type TbiEntry, type CorporateEntry, type GovernmentEntry, type CommunityEntry, type CoworkingEntry, type MakerspaceEntry } from "./data";
import { fetchDynamicStartups, fetchDynamicMentors, fetchDynamicOrganizations, type DynamicMentorEntry } from "./dynamicData";
import ConnectMentorButton from "./ConnectMentorButton";

const EcosystemMap = dynamic(() => import("./EcosystemMap"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: 480, borderRadius: 20, border: "1px solid rgba(20,20,25,0.10)", background: "#FAFAF7", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A958B", fontSize: 14 }}>
      Loading map&hellip;
    </div>
  ),
});

const DARK = "#141417";
const ORANGE = "#F26522";

function matches(haystacks: string[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystacks.some((h) => h.toLowerCase().includes(q));
}

type ViewMode = "list" | "map";

export default function EcosystemDirectory() {
  const [tab, setTab] = useState<EcosystemCategory>("Startups");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("list");

  const [dynStartups, setDynStartups] = useState<StartupEntry[]>([]);
  const [dynMentors, setDynMentors] = useState<DynamicMentorEntry[]>([]);
  const [dynOrgs, setDynOrgs] = useState<{
    TBIs: TbiEntry[];
    Corporate: CorporateEntry[];
    Government: GovernmentEntry[];
    Community: CommunityEntry[];
    "Coworking Spaces": CoworkingEntry[];
    "Makerspaces & Labs": MakerspaceEntry[];
  }>({ TBIs: [], Corporate: [], Government: [], Community: [], "Coworking Spaces": [], "Makerspaces & Labs": [] });

  useEffect(() => {
    fetchDynamicStartups().then(setDynStartups);
    fetchDynamicMentors().then(setDynMentors);
    fetchDynamicOrganizations().then(setDynOrgs);
  }, []);

  const allStartups = dynStartups;
  const allMentors = useMemo(() => [...dynMentors, ...MENTORS], [dynMentors]);
  const allTbis = useMemo(() => [...dynOrgs.TBIs, ...TBIS], [dynOrgs]);
  const allCorporate = useMemo(() => [...dynOrgs.Corporate, ...CORPORATE], [dynOrgs]);
  const allGovernment = useMemo(() => [...dynOrgs.Government, ...GOVERNMENT], [dynOrgs]);
  const allCommunity = useMemo(() => [...dynOrgs.Community, ...COMMUNITY], [dynOrgs]);
  const allCoworking = useMemo(() => [...dynOrgs["Coworking Spaces"], ...COWORKING], [dynOrgs]);
  const allMakerspaces = useMemo(() => [...dynOrgs["Makerspaces & Labs"], ...MAKERSPACES], [dynOrgs]);

  const TABS: { id: EcosystemCategory; label: string; count: number }[] = [
    { id: "Startups", label: "Startups", count: allStartups.length },
    { id: "Mentors", label: "Mentors", count: allMentors.length },
    { id: "TBIs", label: "TBIs", count: allTbis.length },
    { id: "Corporate", label: "Corporate", count: allCorporate.length },
    { id: "Government", label: "Government", count: allGovernment.length },
    { id: "Community", label: "Community", count: allCommunity.length },
    { id: "Coworking Spaces", label: "Coworking Spaces", count: allCoworking.length },
    { id: "Makerspaces & Labs", label: "Makerspaces & Labs", count: allMakerspaces.length },
  ];

  const filtered = useMemo(() => {
    if (tab === "Startups") return allStartups.filter((s) => matches([s.name, s.sector, s.description], query));
    if (tab === "Mentors") return allMentors.filter((m) => matches([m.name, m.expertise, m.bio], query));
    if (tab === "TBIs") return allTbis.filter((t) => matches([t.name, t.host, t.focus], query));
    if (tab === "Corporate") return allCorporate.filter((c) => matches([c.name, c.type, c.description], query));
    if (tab === "Government") return allGovernment.filter((g) => matches([g.name, g.type, g.description], query));
    if (tab === "Coworking Spaces") return allCoworking.filter((c) => matches([c.name, c.type, c.description], query));
    if (tab === "Makerspaces & Labs") return allMakerspaces.filter((m) => matches([m.name, m.type, m.description], query));
    return allCommunity.filter((c) => matches([c.name, c.type, c.description], query));
  }, [tab, query, allStartups, allMentors, allTbis, allCorporate, allGovernment, allCoworking, allMakerspaces, allCommunity]);

  // Normalized pin data for the map placeholder — swap this for real coordinates once a map API is wired up.
  const pins = useMemo(
    () =>
      filtered.map((item: any) => ({
        key: item.name,
        label: item.initial ?? item.initials,
        color: item.color,
        bg: item.bg,
        name: item.name,
        sub: item.sector ?? item.type ?? item.expertise ?? item.host ?? "",
      })),
    [filtered]
  );

  return (
    <div style={{ background: "#fff", padding: "72px 40px", borderTop: "1px solid rgba(20,20,25,0.06)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>Ecosystem database</div>
          <h2 style={{ margin: 0, fontSize: 38, fontWeight: 700, letterSpacing: "-0.025em", color: DARK }}>Browse the people and places building Baguio</h2>
          <p style={{ margin: "14px auto 0", fontSize: 15, lineHeight: 1.6, color: "#6B6B73", maxWidth: 560 }}>
            Search across registered startups, mentors, TBIs, corporate, government, community partners, coworking spaces, and makerspaces.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: tab === t.id ? "#fff" : "#44444C",
                  background: tab === t.id ? DARK : "#F4F2EC",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 9999,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                {t.label}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: tab === t.id ? "#fff" : "#9A958B",
                    background: tab === t.id ? "rgba(255,255,255,0.18)" : "rgba(20,20,25,0.08)",
                    padding: "2px 7px",
                    borderRadius: 9999,
                  }}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ height: 44, background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.14)", borderRadius: 9999, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", minWidth: 240 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2}><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${tab.toLowerCase()}`}
                style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, color: DARK, width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", background: "#F4F2EC", borderRadius: 9999, padding: 3, gap: 2, flexShrink: 0 }}>
              <button
                onClick={() => setView("list")}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 9999, border: "none", cursor: "pointer", color: view === "list" ? "#fff" : "#6B6B73", background: view === "list" ? DARK : "transparent" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
                List
              </button>
              <button
                onClick={() => setView("map")}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 9999, border: "none", cursor: "pointer", color: view === "map" ? "#fff" : "#6B6B73", background: view === "map" ? ORANGE : "transparent" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                Map view
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 && (
          <p style={{ textAlign: "center", fontSize: 14, color: "#9A958B", padding: "32px 0" }}>No {tab.toLowerCase()} match &ldquo;{query}&rdquo;.</p>
        )}

        {view === "map" && filtered.length > 0 && <EcosystemMap pins={pins} />}

        {view === "list" && tab === "Startups" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as StartupEntry[]).map((s) => (
              <div key={s.name} className="ib-challenge-hover ib-startup-card" style={{ position: "relative", background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  {s.logoUrl ? (
                    <img src={s.logoUrl} alt={`${s.name} logo`} style={{ width: 46, height: 46, borderRadius: 12, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: s.color }}>{s.initial}</div>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: s.color, background: s.bg, padding: "5px 11px", borderRadius: 9999 }}>{s.sector}</span>
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 600, color: DARK }}>{s.name}</h3>
                <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.description}</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#44444C" }}>{s.tbiAffiliation}</span>
                {s.website && (
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ib-startup-link-btn"
                    aria-label={`Visit ${s.name}`}
                    style={{ position: "absolute", right: 16, bottom: 16, width: 34, height: 34, borderRadius: 9999, background: DARK, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {view === "list" && tab === "Mentors" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as (DynamicMentorEntry | (typeof MENTORS)[number])[]).map((m) => (
              <div key={m.name} style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 24, textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: 9999, margin: "0 auto 16px", background: `linear-gradient(150deg,${m.color},${m.bg})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff", border: "1px solid rgba(20,20,25,0.06)" }}>{m.initials}</div>
                <h3 style={{ margin: "0 0 3px", fontSize: 15.5, fontWeight: 600, color: DARK }}>{m.name}</h3>
                <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#9A958B" }}>{m.expertise}</p>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#44444C", background: "#F4F2EC", padding: "5px 11px", borderRadius: 9999 }}>{m.tag}</span>
                {"id" in m && <div style={{ marginTop: 14 }}><ConnectMentorButton mentorId={m.id} mentorName={m.name} /></div>}
              </div>
            ))}
          </div>
        )}

        {view === "list" && tab === "TBIs" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as typeof TBIS).map((t) => (
              <div key={t.name} style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 26, display: "flex", gap: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: t.color, flexShrink: 0 }}>{t.initials}</div>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 600, color: DARK }}>{t.name}</h3>
                  <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "#9A958B" }}>{t.host} &middot; {t.focus}</p>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73" }}>{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === "list" && tab === "Corporate" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as typeof CORPORATE).map((c) => (
              <div key={c.name} style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: c.color, flexShrink: 0 }}>{c.initials}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: DARK }}>{c.name}</h3>
                    <span style={{ fontSize: 11.5, color: "#9A958B" }}>{c.type}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73" }}>{c.description}</p>
              </div>
            ))}
          </div>
        )}

        {view === "list" && tab === "Government" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as typeof GOVERNMENT).map((g) => (
              <div key={g.name} style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: g.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: g.color, flexShrink: 0 }}>{g.initials}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: DARK }}>{g.name}</h3>
                    <span style={{ fontSize: 11.5, color: "#9A958B" }}>{g.type}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73" }}>{g.description}</p>
              </div>
            ))}
          </div>
        )}

        {view === "list" && tab === "Community" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as typeof COMMUNITY).map((c) => (
              <div key={c.name} style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: c.color, flexShrink: 0 }}>{c.initials}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: DARK }}>{c.name}</h3>
                    <span style={{ fontSize: 11.5, color: "#9A958B" }}>{c.type}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73" }}>{c.description}</p>
              </div>
            ))}
          </div>
        )}

        {view === "list" && tab === "Coworking Spaces" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as typeof COWORKING).map((c) => (
              <div key={c.name} style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: c.color, flexShrink: 0 }}>{c.initials}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: DARK }}>{c.name}</h3>
                    <span style={{ fontSize: 11.5, color: "#9A958B" }}>{c.type}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73" }}>{c.description}</p>
              </div>
            ))}
          </div>
        )}

        {view === "list" && tab === "Makerspaces & Labs" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as typeof MAKERSPACES).map((m) => (
              <div key={m.name} style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: m.color, flexShrink: 0 }}>{m.initials}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: DARK }}>{m.name}</h3>
                    <span style={{ fontSize: 11.5, color: "#9A958B" }}>{m.type}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73" }}>{m.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
