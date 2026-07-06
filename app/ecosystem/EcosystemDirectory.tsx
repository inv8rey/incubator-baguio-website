"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MENTOR_SPECIALIZATIONS, type EcosystemCategory, type StartupEntry, type TbiEntry, type CompanyEntry, type ServiceProviderEntry, type GovernmentEntry, type CommunityEntry, type CoworkingEntry, type MakerspaceEntry } from "./data";
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

// Mentors without an uploaded photo fall back to a branded gradient card
// (orange or black, chosen deterministically per name) instead of a photo.
function mentorFallbackGradient(name: string): string {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return sum % 2 === 0
    ? "linear-gradient(160deg,#F26522 0%,#7A2E0A 100%)"
    : "linear-gradient(160deg,#3A3A3E 0%,#0B0B0D 100%)";
}

interface OrgPhotoCardProps {
  name: string;
  type: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
  logoUrl?: string;
  coverUrl?: string;
  website?: string;
}

// Shared photo-style card for Coworking Spaces and Makerspaces & Labs —
// physical locations read better with a cover image than a plain icon row.
function OrgPhotoCard({ name, type, description, color, bg, initials, logoUrl, coverUrl, website }: OrgPhotoCardProps) {
  const banner = coverUrl || logoUrl;
  return (
    <div className="ib-card-hover ib-org-photo-card" style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, overflow: "hidden" }}>
      <div style={{ position: "relative", height: 150 }}>
        {banner ? (
          <img src={banner} alt={`${name} cover`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "repeating-linear-gradient(135deg,#F4F2EC,#F4F2EC 11px,#EDEAE1 11px,#EDEAE1 22px)",
            }}
          />
        )}
        {type && (
          <span style={{ position: "absolute", top: 12, right: 12, fontSize: 11, fontWeight: 700, color, background: "#fff", padding: "6px 12px", borderRadius: 9999, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
            {type}
          </span>
        )}
        <div style={{ position: "absolute", left: 16, bottom: -18, width: 46, height: 46, borderRadius: 12, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, border: "2px solid #fff" }}>
          {initials}
        </div>
      </div>
      <div style={{ position: "relative", padding: "30px 22px 22px" }}>
        <h3 style={{ margin: "0 0 3px", fontSize: 17, fontWeight: 600, color: DARK }}>{name}</h3>
        {type && <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "#9A958B" }}>{type}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 12, color: "#6B6B73" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2}><path d="M12 22s7-6.5 7-12A7 7 0 0 0 5 10c0 5.5 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" /></svg>
            Baguio City
          </span>
          <span style={{ color: "rgba(20,20,25,0.15)" }}>|</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2}><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="7" r="2.5" /><path d="M21 19c0-2.4-1.8-4.5-4-5" /></svg>
            Open to public
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}</p>
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${name}`}
            className="ib-orglist-btn"
            style={{ position: "absolute", right: 20, bottom: 20, height: 34, borderRadius: 9999, background: bg, color, display: "flex", alignItems: "center", justifyContent: "flex-end", overflow: "hidden", textDecoration: "none" }}
          >
            <span className="ib-orglist-label" style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>View website</span>
            <span style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </span>
          </a>
        )}
      </div>
    </div>
  );
}

interface OrgListCardProps {
  name: string;
  badge: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
  logoUrl?: string;
  website?: string;
}

// Shared card for TBIs, Companies, Service Providers, Government, and
// Community: a white logo
// tile + colored badge up top, a divider, then description and a "visit
// website" pill that's icon-only until the card is hovered.
function OrgListCard({ name, badge, description, color, bg, initials, logoUrl, website }: OrgListCardProps) {
  return (
    <div className="ib-card-hover ib-org-list-card" style={{ position: "relative", background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
        {logoUrl ? (
          <img src={logoUrl} alt={`${name} logo`} style={{ width: 64, height: 64, borderRadius: 14, objectFit: "contain", background: "#fff", border: "1px solid rgba(20,20,25,0.08)", flexShrink: 0, padding: 6, boxSizing: "border-box" }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color, flexShrink: 0 }}>{initials}</div>
        )}
        <div style={{ minWidth: 0 }}>
          {badge && (
            <span style={{ display: "inline-block", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.02em", color, background: bg, padding: "4px 10px", borderRadius: 9999, marginBottom: 6 }}>
              {badge}
            </span>
          )}
          <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: DARK, lineHeight: 1.3 }}>{name}</h3>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(20,20,25,0.08)", paddingTop: 14, flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}</p>
      </div>
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${name}`}
          className="ib-orglist-btn"
          style={{ marginTop: 16, alignSelf: "flex-end", height: 34, borderRadius: 9999, background: "#141417", color: "#fff", display: "flex", alignItems: "center", justifyContent: "flex-end", overflow: "hidden", textDecoration: "none", flexShrink: 0 }}
        >
          <span className="ib-orglist-label" style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>View website</span>
          <span style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </span>
        </a>
      )}
    </div>
  );
}

type ViewMode = "list" | "map";

type SortOrder = "az" | "za";

export default function EcosystemDirectory() {
  const [tab, setTab] = useState<EcosystemCategory>("Startups");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [sort, setSort] = useState<SortOrder>("az");
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [specializationFilter, setSpecializationFilter] = useState<string | null>(null);

  function selectTab(next: EcosystemCategory) {
    setTab(next);
    setQuery("");
    setSectorFilter(null);
    setSpecializationFilter(null);
  }

  const [dynStartups, setDynStartups] = useState<StartupEntry[]>([]);
  const [dynMentors, setDynMentors] = useState<DynamicMentorEntry[]>([]);
  const [dynOrgs, setDynOrgs] = useState<{
    TBIs: TbiEntry[];
    Companies: CompanyEntry[];
    "Service Providers": ServiceProviderEntry[];
    Government: GovernmentEntry[];
    Community: CommunityEntry[];
    "Coworking Spaces": CoworkingEntry[];
    "Makerspaces & Labs": MakerspaceEntry[];
  }>({ TBIs: [], Companies: [], "Service Providers": [], Government: [], Community: [], "Coworking Spaces": [], "Makerspaces & Labs": [] });

  useEffect(() => {
    fetchDynamicStartups().then(setDynStartups);
    fetchDynamicMentors().then(setDynMentors);
    fetchDynamicOrganizations().then(setDynOrgs);
  }, []);

  const allStartups = dynStartups;
  const allMentors = dynMentors;
  const allTbis = dynOrgs.TBIs;
  const allCompanies = dynOrgs.Companies;
  const allServiceProviders = dynOrgs["Service Providers"];
  const allGovernment = dynOrgs.Government;
  const allCommunity = dynOrgs.Community;
  const allCoworking = dynOrgs["Coworking Spaces"];
  const allMakerspaces = dynOrgs["Makerspaces & Labs"];

  const TABS: { id: EcosystemCategory; label: string; count: number }[] = [
    { id: "Startups", label: "Startups", count: allStartups.length },
    { id: "Mentors", label: "Mentors", count: allMentors.length },
    { id: "TBIs", label: "TBIs", count: allTbis.length },
    { id: "Companies", label: "Companies", count: allCompanies.length },
    { id: "Service Providers", label: "Service Providers", count: allServiceProviders.length },
    { id: "Government", label: "Government", count: allGovernment.length },
    { id: "Community", label: "Community", count: allCommunity.length },
    { id: "Coworking Spaces", label: "Coworking Spaces", count: allCoworking.length },
    { id: "Makerspaces & Labs", label: "Makerspaces & Labs", count: allMakerspaces.length },
  ];

  const availableSectors = useMemo(
    () => Array.from(new Set(allStartups.map((s) => s.sector).filter(Boolean))).sort(),
    [allStartups]
  );

  const filtered = useMemo(() => {
    let list: any[];
    if (tab === "Startups") {
      list = allStartups.filter((s) => matches([s.name, s.sector, s.description], query));
      if (sectorFilter) list = list.filter((s) => s.sector === sectorFilter);
    } else if (tab === "Mentors") {
      list = allMentors.filter((m) => matches([m.name, m.position, m.company, m.bio, ...(m.specializations ?? [])], query));
      if (specializationFilter) list = list.filter((m) => (m.specializations ?? []).includes(specializationFilter));
    } else if (tab === "TBIs") {
      list = allTbis.filter((t) => matches([t.name, t.host, t.focus], query));
    } else if (tab === "Companies") {
      list = allCompanies.filter((c) => matches([c.name, c.type, c.description], query));
    } else if (tab === "Service Providers") {
      list = allServiceProviders.filter((s) => matches([s.name, s.type, s.description], query));
    } else if (tab === "Government") {
      list = allGovernment.filter((g) => matches([g.name, g.type, g.description], query));
    } else if (tab === "Coworking Spaces") {
      list = allCoworking.filter((c) => matches([c.name, c.type, c.description], query));
    } else if (tab === "Makerspaces & Labs") {
      list = allMakerspaces.filter((m) => matches([m.name, m.type, m.description], query));
    } else {
      list = allCommunity.filter((c) => matches([c.name, c.type, c.description], query));
    }
    return [...list].sort((a, b) => (sort === "az" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  }, [tab, query, sort, sectorFilter, specializationFilter, allStartups, allMentors, allTbis, allCompanies, allServiceProviders, allGovernment, allCoworking, allMakerspaces, allCommunity]);

  // Normalized pin data for the map placeholder — swap this for real coordinates once a map API is wired up.
  const pins = useMemo(
    () =>
      filtered.map((item: any) => ({
        key: item.name,
        label: item.initial ?? item.initials,
        color: item.color,
        bg: item.bg,
        name: item.name,
        sub: item.sector ?? item.type ?? item.position ?? item.host ?? "",
        lat: item.latitude,
        lng: item.longitude,
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
            Search across registered startups, mentors, TBIs, companies, service providers, government, community partners, coworking spaces, and makerspaces.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTab(t.id)}
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
            {tab === "Startups" && (
              <select
                value={sectorFilter ?? ""}
                onChange={(e) => setSectorFilter(e.target.value || null)}
                style={{ height: 44, fontSize: 13.5, fontWeight: 600, color: DARK, background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.14)", borderRadius: 9999, padding: "0 16px", outline: "none", appearance: "auto", cursor: "pointer" }}
              >
                <option value="">All sectors</option>
                {availableSectors.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            )}
            {tab === "Mentors" && (
              <select
                value={specializationFilter ?? ""}
                onChange={(e) => setSpecializationFilter(e.target.value || null)}
                style={{ height: 44, fontSize: 13.5, fontWeight: 600, color: DARK, background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.14)", borderRadius: 9999, padding: "0 16px", outline: "none", appearance: "auto", cursor: "pointer" }}
              >
                <option value="">All specializations</option>
                {MENTOR_SPECIALIZATIONS.map((sp) => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            )}
            <div style={{ height: 44, background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.14)", borderRadius: 9999, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", minWidth: 240 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2}><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${tab.toLowerCase()}`}
                style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, color: DARK, width: "100%" }}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOrder)}
              aria-label="Sort"
              style={{ height: 44, fontSize: 13.5, fontWeight: 600, color: DARK, background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.14)", borderRadius: 9999, padding: "0 16px", outline: "none", appearance: "auto", cursor: "pointer" }}
            >
              <option value="az">Sort: A to Z</option>
              <option value="za">Sort: Z to A</option>
            </select>
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
                    className="ib-orglist-btn"
                    aria-label={`Visit ${s.name}`}
                    style={{ position: "absolute", right: 16, bottom: 16, height: 34, borderRadius: 9999, background: DARK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "flex-end", overflow: "hidden", textDecoration: "none" }}
                  >
                    <span className="ib-orglist-label" style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>View website</span>
                    <span style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {view === "list" && tab === "Mentors" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as DynamicMentorEntry[]).map((m) => {
              const photoUrl = m.photoUrl;
              return (
                <div key={m.name} className="ib-mentor-flip" style={{ height: 300, borderRadius: 18 }}>
                  <div className="ib-mentor-flip-inner">
                    {/* FRONT */}
                    <div
                      className="ib-mentor-flip-face"
                      style={{ background: photoUrl ? "#141417" : mentorFallbackGradient(m.name) }}
                    >
                      {photoUrl && (
                        <img src={photoUrl} alt={m.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: photoUrl
                            ? "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.05) 70%)"
                            : "linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 55%)",
                        }}
                      />
                      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "18px 18px 16px" }}>
                        <h3 style={{ margin: "0 0 2px", fontSize: 16.5, fontWeight: 700, color: "#fff" }}>{m.name}</h3>
                        <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{[m.position, m.company].filter(Boolean).join(" · ")}</p>
                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {(m.specializations ?? []).slice(0, 1).map((s) => (
                              <span key={s} style={{ fontSize: 10.5, fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)", padding: "4px 9px", borderRadius: 9999 }}>{s}</span>
                            ))}
                          </div>
                          <ConnectMentorButton mentorId={m.id} mentorName={m.name} variant="icon" />
                        </div>
                      </div>
                    </div>

                    {/* BACK — bio */}
                    <div
                      className="ib-mentor-flip-face ib-mentor-flip-back"
                      style={{ background: "#141417", padding: "20px 20px 18px", display: "flex", flexDirection: "column" }}
                    >
                      <h3 style={{ margin: "0 0 2px", fontSize: 15.5, fontWeight: 700, color: "#fff" }}>{m.name}</h3>
                      {m.sector && (
                        <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 600, color: ORANGE }}>{m.sector}</p>
                      )}
                      <p
                        style={{
                          margin: m.sector ? 0 : "10px 0 0",
                          fontSize: 12.5,
                          lineHeight: 1.6,
                          color: "rgba(255,255,255,0.78)",
                          flex: 1,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: m.socialLink ? 7 : 9,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {m.bio || "This mentor hasn't added a bio yet."}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 12 }}>
                        {m.socialLink ? (
                          <a
                            href={m.socialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 11.5, fontWeight: 600, color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
                          >
                            Visit profile
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                          </a>
                        ) : <span />}
                        <ConnectMentorButton mentorId={m.id} mentorName={m.name} variant="icon" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "list" && tab === "TBIs" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as TbiEntry[]).map((t) => (
              <OrgListCard key={t.name} name={t.name} badge={t.host} description={t.description} color={t.color} bg={t.bg} initials={t.initials} logoUrl={t.logoUrl} website={t.website} />
            ))}
          </div>
        )}

        {view === "list" && tab === "Companies" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as CompanyEntry[]).map((c) => (
              <OrgListCard key={c.name} name={c.name} badge={c.type} description={c.description} color={c.color} bg={c.bg} initials={c.initials} logoUrl={c.logoUrl} website={c.website} />
            ))}
          </div>
        )}

        {view === "list" && tab === "Service Providers" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as ServiceProviderEntry[]).map((s) => (
              <OrgListCard key={s.name} name={s.name} badge={s.type} description={s.description} color={s.color} bg={s.bg} initials={s.initials} logoUrl={s.logoUrl} website={s.website} />
            ))}
          </div>
        )}

        {view === "list" && tab === "Government" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as GovernmentEntry[]).map((g) => (
              <OrgListCard key={g.name} name={g.name} badge={g.type} description={g.description} color={g.color} bg={g.bg} initials={g.initials} logoUrl={g.logoUrl} website={g.website} />
            ))}
          </div>
        )}

        {view === "list" && tab === "Community" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as CommunityEntry[]).map((c) => (
              <OrgListCard key={c.name} name={c.name} badge={c.type} description={c.description} color={c.color} bg={c.bg} initials={c.initials} logoUrl={c.logoUrl} website={c.website} />
            ))}
          </div>
        )}

        {view === "list" && tab === "Coworking Spaces" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as CoworkingEntry[]).map((c) => (
              <OrgPhotoCard key={c.name} name={c.name} type={c.type} description={c.description} color={c.color} bg={c.bg} initials={c.initials} logoUrl={c.logoUrl} coverUrl={c.coverUrl} website={c.website} />
            ))}
          </div>
        )}

        {view === "list" && tab === "Makerspaces & Labs" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as MakerspaceEntry[]).map((m) => (
              <OrgPhotoCard key={m.name} name={m.name} type={m.type} description={m.description} color={m.color} bg={m.bg} initials={m.initials} logoUrl={m.logoUrl} coverUrl={m.coverUrl} website={m.website} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
