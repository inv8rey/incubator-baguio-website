"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MENTOR_SPECIALIZATIONS, type EcosystemCategory, type StartupEntry, type TbiEntry, type AcademeEntry, type CompanyEntry, type ServiceProviderEntry, type GovernmentEntry, type CommunityEntry, type CoworkingEntry, type MakerspaceEntry, type FundedProjectEntry } from "./data";
import { fetchDynamicStartups, fetchDynamicMentors, fetchDynamicOrganizations, fetchDynamicFundedProjects, type DynamicMentorEntry } from "./dynamicData";
import ConnectMentorButton from "./ConnectMentorButton";

const DARK = "#1A1714";
const ORANGE = "#F26522";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const ALL_CATEGORIES: EcosystemCategory[] = ["Startups", "Mentors", "TBIs", "Academe", "Companies", "Service Providers", "Government", "Community", "Coworking Spaces", "Makerspaces & Labs", "Funded Projects"];

// Shared by every filter/sort <select> in the directory's toolbar.
// minWidth/maxWidth are load-bearing: a <select> is intrinsically as wide as
// its longest <option> ("Artificial Intelligence & Emerging Technologies" in
// the sector list), and as a flex item its default min-width:auto stops it
// shrinking — which pushed the page 53px past a 320px viewport.
// appearance:auto's native dropdown arrow sits flush against the select's
// padding-box, which on a 9999px-radius pill reads as crowding the curved
// edge. Swap to a custom chevron (appearance:none + background-image) with
// its own breathing room instead of the 16px shared with the pill's corner.
const CHEVRON_SVG =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236E685F' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E";

const filterSelectStyle: React.CSSProperties = {
  height: 44,
  fontSize: 13.5,
  fontWeight: 600,
  color: DARK,
  background: `#F6F2EA url("${CHEVRON_SVG}") no-repeat right 16px center`,
  backgroundSize: "12px",
  border: "1px solid rgba(64,50,34,0.14)",
  borderRadius: 9999,
  padding: "0 38px 0 16px",
  outline: "none",
  appearance: "none",
  cursor: "pointer",
  minWidth: 0,
  maxWidth: "100%",
};

function matches(haystacks: string[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystacks.some((h) => h.toLowerCase().includes(q));
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Renders a contact email without a static mailto: href or a literal "@" in
// the markup, so basic scrapers that read raw HTML/attributes (rather than
// running a real browser) can't harvest it. The address is only assembled
// into a real mailto: link on click.
function ObfuscatedEmail({ email, style }: { email: string; style?: React.CSSProperties }) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return null;
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = `mailto:${user}@${domain}`;
      }}
      style={{ fontSize: 12, fontWeight: 600, color: "#44444C", background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", ...style }}
    >
      {user}
      <span aria-hidden>&#64;</span>
      {domain}
    </button>
  );
}

// Every logo/photo/cover in the directory already has a placeholder for
// when no URL is on file — but a URL that IS on file can still 404 (deleted
// upload, expired storage link) and an <img> just renders blank in that
// case since there's no built-in retry/fallback. This swaps to the same
// placeholder the "no URL" branch would have rendered once the image
// actually fails to load.
function SafeImg({ src, fallback, ...imgProps }: { src?: string; fallback: React.ReactNode; alt: string } & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{fallback}</>;
  return <img src={src} onError={() => setFailed(true)} {...imgProps} />;
}

// Mentors without an uploaded photo fall back to a branded gradient card
// (orange or black, chosen deterministically per name) instead of a photo.
function mentorFallbackGradient(name: string): string {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return sum % 2 === 0
    ? "linear-gradient(160deg,#F26522 0%,#7A2E0A 100%)"
    : "linear-gradient(160deg,#3A3A3E 0%,#100D0B 100%)";
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
  return (
    <div className="ib-card-hover ib-org-photo-card" style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", height: 150, flexShrink: 0 }}>
        <SafeImg
          src={coverUrl}
          alt={`${name} cover`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          fallback={
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "repeating-linear-gradient(135deg,#F6F2EA,#F6F2EA 11px,#EDEAE1 11px,#EDEAE1 22px)",
              }}
            />
          }
        />
        {type && (
          <span style={{ position: "absolute", top: 12, right: 12, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color, background: "#fff", padding: "4px 10px", borderRadius: 9999, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
            {type}
          </span>
        )}
        <SafeImg
          src={logoUrl}
          alt={`${name} logo`}
          style={{ position: "absolute", left: 16, bottom: -18, width: 46, height: 46, borderRadius: 12, objectFit: "contain", background: "#fff", border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}
          fallback={
            <div style={{ position: "absolute", left: 16, bottom: -18, width: 46, height: 46, borderRadius: 12, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
              {initials}
            </div>
          }
        />
      </div>
      <div style={{ padding: "30px 22px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 16.5, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 12, color: "#5A544B" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6E685F" strokeWidth={2}><path d="M12 22s7-6.5 7-12A7 7 0 0 0 5 10c0 5.5 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" /></svg>
            Baguio City
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#5A544B", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>{description}</p>
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${name}`}
            className="ib-orglist-btn"
            style={{ marginTop: 16, alignSelf: "flex-end", height: 34, borderRadius: 9999, background: "#1A1714", color: "#fff", display: "flex", alignItems: "center", justifyContent: "flex-end", overflow: "hidden", textDecoration: "none", flexShrink: 0 }}
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
  profileHref?: string;
}

// Shared card for TBIs, Companies, Service Providers, Government, and
// Community: a white logo
// tile + colored badge up top, a divider, then description and a "visit
// website" pill that's icon-only until the card is hovered.
function OrgListCard({ name, badge, description, color, bg, initials, logoUrl, website, profileHref }: OrgListCardProps) {
  return (
    <div className="ib-card-hover ib-org-list-card" style={{ position: "relative", background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
        <SafeImg
          src={logoUrl}
          alt={`${name} logo`}
          style={{ width: 64, height: 64, borderRadius: 14, objectFit: "contain", background: "#fff", border: "1px solid rgba(64,50,34,0.11)", flexShrink: 0, padding: 6, boxSizing: "border-box" }}
          fallback={<div style={{ width: 64, height: 64, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, color, flexShrink: 0 }}>{initials}</div>}
        />
        <div style={{ minWidth: 0 }}>
          {badge && (
            <span style={{ display: "inline-block", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color, background: bg, padding: "4px 10px", borderRadius: 9999, marginBottom: 6 }}>
              {badge}
            </span>
          )}
          <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{name}</h3>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(64,50,34,0.11)", paddingTop: 14, flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#5A544B", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}</p>
      </div>
      {(profileHref || website) && (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: profileHref ? "space-between" : "flex-end", gap: 10 }}>
          {profileHref && (
            <a href={profileHref} aria-label={`View ${name}'s profile`} style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE, textDecoration: "none", flexShrink: 0 }}>
              View profile
            </a>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${name}`}
              className="ib-orglist-btn"
              style={{ height: 34, borderRadius: 9999, background: "#1A1714", color: "#fff", display: "flex", alignItems: "center", justifyContent: "flex-end", overflow: "hidden", textDecoration: "none", flexShrink: 0 }}
            >
              <span className="ib-orglist-label" style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>View website</span>
              <span style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

const PROJECT_STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  Ongoing: { color: "#1A6B3C", bg: "rgba(26,107,60,0.12)" },
  Completed: { color: "#285E7A", bg: "rgba(40,94,122,0.10)" },
  Upcoming: { color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
};

function FundedProjectCard({ title, fundingAgency, leadInstitution, duration, status, color, bg, initials, partnerLogoUrl, partnerName }: FundedProjectEntry) {
  const statusStyle = PROJECT_STATUS_COLORS[status] || { color: "#5A544B", bg: "#F6F2EA" };
  return (
    <div className="ib-card-hover" style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
        <SafeImg
          src={partnerLogoUrl}
          alt={partnerName}
          title={partnerName}
          style={{ width: 46, height: 46, borderRadius: 12, objectFit: "contain", background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.1)", flexShrink: 0 }}
          fallback={<div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, color, flexShrink: 0 }}>{initials}</div>}
        />
        <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: statusStyle.color, background: statusStyle.bg, padding: "5px 11px", borderRadius: 9999, whiteSpace: "nowrap" }}>{status}</span>
      </div>
      <h3 style={{ margin: "0 0 14px", fontSize: 16.5, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, borderTop: "1px solid rgba(64,50,34,0.11)", paddingTop: 14, fontSize: 13, color: "#44444C" }}>
        <div><span style={{ color: "#6E685F" }}>Funding agency: </span>{fundingAgency || "—"}</div>
        <div><span style={{ color: "#6E685F" }}>Lead institution: </span>{leadInstitution || "—"}</div>
        <div><span style={{ color: "#6E685F" }}>Duration: </span>{duration || "—"}</div>
      </div>
    </div>
  );
}

// Extracted so a broken photoUrl (upload deleted, expired link) can fall
// back to the same gradient placeholder the "no photo on file" case uses —
// that swap needs its own failed-to-load state, which a plain .map() callback
// can't hold.
function MentorFlipCard({ m, isHighlighted, cardRef }: { m: DynamicMentorEntry; isHighlighted: boolean; cardRef: (el: HTMLDivElement | null) => void }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const photoUrl = photoFailed ? undefined : m.photoUrl;
  return (
    <div
      ref={cardRef}
      className="ib-mentor-flip"
      style={{
        height: 300,
        borderRadius: 18,
        boxShadow: isHighlighted ? `0 0 0 3px ${ORANGE}, 0 0 0 7px rgba(242,101,34,0.16)` : undefined,
      }}
    >
      <div className="ib-mentor-flip-inner">
        {/* FRONT */}
        <div
          className="ib-mentor-flip-face"
          style={{ background: photoUrl ? "#1A1714" : mentorFallbackGradient(m.name) }}
        >
          {photoUrl && (
            <img src={photoUrl} alt={m.name} onError={() => setPhotoFailed(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
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
            <h3 style={{ margin: "0 0 2px", fontSize: 16.5, fontWeight: 600, color: "#fff" }}>{m.name}</h3>
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
          style={{ background: "#1A1714", padding: "20px 20px 18px", display: "flex", flexDirection: "column" }}
        >
          <h3 style={{ margin: "0 0 2px", fontSize: 15.5, fontWeight: 600, color: "#fff" }}>{m.name}</h3>
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
}

type ViewMode = "list" | "map";

type SortOrder = "random" | "az" | "za";

export default function EcosystemDirectory() {
  const [tab, setTab] = useState<EcosystemCategory>("Startups");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [sort, setSort] = useState<SortOrder>("random");
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [specializationFilter, setSpecializationFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [institutionFilter, setInstitutionFilter] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function selectTab(next: EcosystemCategory) {
    setTab(next);
    setQuery("");
    setSectorFilter(null);
    setSpecializationFilter(null);
    setStatusFilter(null);
    setInstitutionFilter(null);
    setHighlightId(null);
  }

  // Deep-link support for "/ecosystem?tab=<category>" (from the homepage
  // stat tiles) and "/ecosystem?tab=mentors&id=<id>" (used by the chat
  // widget's result cards) — jumps straight to the right tab, and
  // scrolls/highlights the matching card once its data has loaded if an id
  // was given. Matched case-insensitively so both "startups" and "Startups"
  // (and "tbis") work.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const id = params.get("id");
    if (tabParam) {
      const match = ALL_CATEGORIES.find((c) => c.toLowerCase() === tabParam.toLowerCase());
      if (match) setTab(match);
    }
    if (id) setHighlightId(id);
  }, []);

  const [dynStartups, setDynStartups] = useState<StartupEntry[]>([]);
  const [dynMentors, setDynMentors] = useState<DynamicMentorEntry[]>([]);
  const [dynOrgs, setDynOrgs] = useState<{
    TBIs: TbiEntry[];
    Academe: AcademeEntry[];
    Companies: CompanyEntry[];
    "Service Providers": ServiceProviderEntry[];
    Government: GovernmentEntry[];
    Community: CommunityEntry[];
    "Coworking Spaces": CoworkingEntry[];
    "Makerspaces & Labs": MakerspaceEntry[];
  }>({ TBIs: [], Academe: [], Companies: [], "Service Providers": [], Government: [], Community: [], "Coworking Spaces": [], "Makerspaces & Labs": [] });
  const [dynFundedProjects, setDynFundedProjects] = useState<FundedProjectEntry[]>([]);

  useEffect(() => {
    fetchDynamicStartups().then((r) => setDynStartups(shuffle(r)));
    fetchDynamicMentors().then((r) => setDynMentors(shuffle(r)));
    fetchDynamicOrganizations().then((r) =>
      setDynOrgs({
        TBIs: shuffle(r.TBIs),
        Academe: shuffle(r.Academe),
        Companies: shuffle(r.Companies),
        "Service Providers": shuffle(r["Service Providers"]),
        Government: shuffle(r.Government),
        Community: shuffle(r.Community),
        "Coworking Spaces": shuffle(r["Coworking Spaces"]),
        "Makerspaces & Labs": shuffle(r["Makerspaces & Labs"]),
      })
    );
    fetchDynamicFundedProjects().then((r) => setDynFundedProjects(shuffle(r)));
  }, []);

  useEffect(() => {
    if (!highlightId) return;
    const el = cardRefs.current[highlightId];
    if (!el) return;
    const timer = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
    return () => clearTimeout(timer);
  }, [highlightId, dynMentors, dynStartups, tab]);

  const allStartups = dynStartups;
  const allMentors = dynMentors;
  const allTbis = dynOrgs.TBIs;
  const allAcademe = dynOrgs.Academe;
  const allCompanies = dynOrgs.Companies;
  const allServiceProviders = dynOrgs["Service Providers"];
  const allGovernment = dynOrgs.Government;
  const allCommunity = dynOrgs.Community;
  const allCoworking = dynOrgs["Coworking Spaces"];
  const allMakerspaces = dynOrgs["Makerspaces & Labs"];
  const allFundedProjects = dynFundedProjects;

  const TABS: { id: EcosystemCategory; label: string; count: number }[] = [
    { id: "Startups", label: "Startups", count: allStartups.length },
    { id: "Mentors", label: "Mentors", count: allMentors.length },
    { id: "TBIs", label: "TBIs", count: allTbis.length },
    { id: "Academe", label: "Academe", count: allAcademe.length },
    // Companies hidden from the directory for now — data stays intact
    // (allCompanies, the Companies branch below) so this is a one-line
    // revert, not a data change.
    { id: "Service Providers", label: "Service Providers", count: allServiceProviders.length },
    { id: "Government", label: "Government", count: allGovernment.length },
    { id: "Community", label: "Community", count: allCommunity.length },
    { id: "Coworking Spaces", label: "Coworking Spaces", count: allCoworking.length },
    { id: "Makerspaces & Labs", label: "Makerspaces & Labs", count: allMakerspaces.length },
    { id: "Funded Projects", label: "Funded Projects", count: allFundedProjects.length },
  ];

  const availableSectors = useMemo(
    () => Array.from(new Set(allStartups.map((s) => s.sector).filter(Boolean))).sort(),
    [allStartups]
  );

  const availableProjectStatuses = useMemo(
    () => Array.from(new Set(allFundedProjects.map((f) => f.status).filter(Boolean))).sort(),
    [allFundedProjects]
  );
  const availableInstitutions = useMemo(
    () => Array.from(new Set(allFundedProjects.map((f) => f.leadInstitution).filter(Boolean))).sort(),
    [allFundedProjects]
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
    } else if (tab === "Academe") {
      list = allAcademe.filter((a) => matches([a.name, a.type, a.description], query));
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
    } else if (tab === "Funded Projects") {
      list = allFundedProjects.filter((f) => matches([f.title, f.fundingAgency, f.leadInstitution, f.status], query));
      if (statusFilter) list = list.filter((f) => f.status === statusFilter);
      if (institutionFilter) list = list.filter((f) => f.leadInstitution === institutionFilter);
    } else {
      list = allCommunity.filter((c) => matches([c.name, c.type, c.description], query));
    }
    if (sort === "random") return list;
    return [...list].sort((a, b) => {
      const an = a.name ?? a.title ?? "";
      const bn = b.name ?? b.title ?? "";
      return sort === "az" ? an.localeCompare(bn) : bn.localeCompare(an);
    });
  }, [tab, query, sort, sectorFilter, specializationFilter, statusFilter, institutionFilter, allStartups, allMentors, allTbis, allAcademe, allCompanies, allServiceProviders, allGovernment, allCoworking, allMakerspaces, allCommunity, allFundedProjects]);

  return (
    <div style={{ background: "#fff", padding: "72px 40px", borderTop: "1px solid rgba(64,50,34,0.09)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>Ecosystem database</div>
          <h2 style={{ margin: 0, fontSize: 38, fontWeight: 500, letterSpacing: "-0.025em", color: DARK }}>Browse the people and places building Baguio</h2>
          <p style={{ margin: "14px auto 0", fontSize: 15, lineHeight: 1.6, color: "#5A544B", maxWidth: 560 }}>
            Search across registered startups, mentors, TBIs, service providers, government, community partners, coworking spaces, and makerspaces.
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
                  background: tab === t.id ? DARK : "#F6F2EA",
                  border: "none",
                  padding: "10px 18px",
                  minHeight: 44,
                  boxSizing: "border-box",
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
                    fontWeight: 600,
                    color: tab === t.id ? "#fff" : "#6E685F",
                    background: tab === t.id ? "rgba(255,255,255,0.18)" : "rgba(64,50,34,0.11)",
                    padding: "2px 7px",
                    borderRadius: 9999,
                  }}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
          {/* minWidth: 0 — as a flex item this defaults to min-width:auto and
              refuses to shrink below its widest child. The sector <select> is
              intrinsically as wide as "Artificial Intelligence & Emerging
              Technologies", so without this the toolbar forced the page 53px
              past a 320px viewport. */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", minWidth: 0 }}>
            {tab === "Startups" && (
              <select
                value={sectorFilter ?? ""}
                onChange={(e) => setSectorFilter(e.target.value || null)}
                style={filterSelectStyle}
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
                style={filterSelectStyle}
              >
                <option value="">All specializations</option>
                {MENTOR_SPECIALIZATIONS.map((sp) => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            )}
            {tab === "Funded Projects" && (
              <>
                <select
                  value={statusFilter ?? ""}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                  style={filterSelectStyle}
                >
                  <option value="">All statuses</option>
                  {availableProjectStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={institutionFilter ?? ""}
                  onChange={(e) => setInstitutionFilter(e.target.value || null)}
                  style={filterSelectStyle}
                >
                  <option value="">All institutions</option>
                  {availableInstitutions.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </>
            )}
            <div style={{ height: 44, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.14)", borderRadius: 9999, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", minWidth: 240 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6E685F" strokeWidth={2}><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
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
              style={filterSelectStyle}
            >
              <option value="random">Sort: Random</option>
              <option value="az">Sort: A to Z</option>
              <option value="za">Sort: Z to A</option>
            </select>
            <div style={{ display: "flex", background: "#F6F2EA", borderRadius: 9999, padding: 3, gap: 2, flexShrink: 0 }}>
              <button
                onClick={() => setView("list")}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 9999, border: "none", cursor: "pointer", color: view === "list" ? "#fff" : "#5A544B", background: view === "list" ? DARK : "transparent" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
                List
              </button>
              <button
                onClick={() => setView("map")}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 9999, border: "none", cursor: "pointer", color: view === "map" ? "#fff" : "#5A544B", background: view === "map" ? ORANGE : "transparent" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                Map view
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 && (
          <p style={{ textAlign: "center", fontSize: 14, color: "#6E685F", padding: "32px 0" }}>No {tab.toLowerCase()} match &ldquo;{query}&rdquo;.</p>
        )}

        {view === "map" && filtered.length > 0 && (
          <div
            style={{
              width: "100%",
              minHeight: 340,
              borderRadius: 20,
              border: "1px solid rgba(64,50,34,0.13)",
              background: "#F6F2EA",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 10,
              padding: "48px 24px",
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 9999, background: "#fff", border: `1.5px solid ${ORANGE}`, color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: DARK }}>Map view is on its way</h3>
            <p style={{ margin: 0, fontSize: 13.5, color: "#6E685F", maxWidth: 360 }}>
              We&rsquo;re plotting the ecosystem on a real map. For now, switch back to the list view to browse everyone.
            </p>
          </div>
        )}

        {view === "list" && tab === "Startups" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as StartupEntry[]).map((s) => (
              <div
                key={s.name}
                ref={(el) => {
                  if (s.id) cardRefs.current[s.id] = el;
                }}
                className="ib-challenge-hover ib-startup-card"
                style={{
                  background: "#F6F2EA",
                  border: s.id && highlightId === s.id ? `2px solid ${ORANGE}` : "1px solid rgba(64,50,34,0.13)",
                  boxShadow: s.id && highlightId === s.id ? "0 0 0 4px rgba(242,101,34,0.16)" : undefined,
                  borderRadius: 18,
                  padding: 26,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                  <SafeImg
                    src={s.logoUrl}
                    alt={`${s.name} logo`}
                    style={{ width: 52, height: 52, borderRadius: 12, objectFit: "contain", background: "#fff", border: "1px solid rgba(64,50,34,0.11)", flexShrink: 0, padding: 5, boxSizing: "border-box" }}
                    fallback={<div style={{ width: 52, height: 52, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 600, color: s.color, flexShrink: 0 }}>{s.initial}</div>}
                  />
                  <div style={{ minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
                    <span style={{ display: "inline-block", alignSelf: "flex-start", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color: s.color, background: s.bg, padding: "4px 10px", borderRadius: 9999, lineHeight: 1.35 }}>{s.sector}</span>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{s.name}</h3>
                  </div>
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.55, color: "#5A544B", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.description}</p>
                {(s.contactEmail || s.website) && (
                  <div style={{ marginTop: "auto", paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    {s.contactEmail ? (
                      <ObfuscatedEmail email={s.contactEmail} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }} />
                    ) : <span />}
                    {s.website && (
                      <a
                        href={s.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ib-orglist-btn"
                        aria-label={`Visit ${s.name}`}
                        style={{ height: 34, borderRadius: 9999, background: DARK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "flex-end", overflow: "hidden", textDecoration: "none", flexShrink: 0 }}
                      >
                        <span className="ib-orglist-label" style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>View website</span>
                        <span style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                        </span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {view === "list" && tab === "Mentors" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as DynamicMentorEntry[]).map((m) => (
              <MentorFlipCard
                key={m.name}
                m={m}
                isHighlighted={highlightId === m.id}
                cardRef={(el) => {
                  cardRefs.current[m.id] = el;
                }}
              />
            ))}
          </div>
        )}

        {view === "list" && tab === "TBIs" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as TbiEntry[]).map((t) => (
              <OrgListCard key={t.name} name={t.name} badge={t.host} description={t.description} color={t.color} bg={t.bg} initials={t.initials} logoUrl={t.logoUrl} website={t.website} profileHref={t.slug ? `${BP}/organizations/${t.slug}` : undefined} />
            ))}
          </div>
        )}

        {view === "list" && tab === "Academe" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as AcademeEntry[]).map((a) => (
              <OrgListCard key={a.name} name={a.name} badge={a.type} description={a.description} color={a.color} bg={a.bg} initials={a.initials} logoUrl={a.logoUrl} website={a.website} profileHref={a.slug ? `${BP}/organizations/${a.slug}` : undefined} />
            ))}
          </div>
        )}

        {view === "list" && tab === "Companies" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as CompanyEntry[]).map((c) => (
              <OrgListCard key={c.name} name={c.name} badge={c.type} description={c.description} color={c.color} bg={c.bg} initials={c.initials} logoUrl={c.logoUrl} website={c.website} profileHref={c.slug ? `${BP}/organizations/${c.slug}` : undefined} />
            ))}
          </div>
        )}

        {view === "list" && tab === "Service Providers" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as ServiceProviderEntry[]).map((s) => (
              <OrgListCard key={s.name} name={s.name} badge={s.type} description={s.description} color={s.color} bg={s.bg} initials={s.initials} logoUrl={s.logoUrl} website={s.website} profileHref={s.slug ? `${BP}/organizations/${s.slug}` : undefined} />
            ))}
          </div>
        )}

        {view === "list" && tab === "Government" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as GovernmentEntry[]).map((g) => (
              <OrgListCard key={g.name} name={g.name} badge={g.type} description={g.description} color={g.color} bg={g.bg} initials={g.initials} logoUrl={g.logoUrl} website={g.website} profileHref={g.slug ? `${BP}/organizations/${g.slug}` : undefined} />
            ))}
          </div>
        )}

        {view === "list" && tab === "Community" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as CommunityEntry[]).map((c) => (
              <OrgListCard key={c.name} name={c.name} badge={c.type} description={c.description} color={c.color} bg={c.bg} initials={c.initials} logoUrl={c.logoUrl} website={c.website} profileHref={c.slug ? `${BP}/organizations/${c.slug}` : undefined} />
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

        {view === "list" && tab === "Funded Projects" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as FundedProjectEntry[]).map((f) => (
              <FundedProjectCard key={f.id} {...f} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
