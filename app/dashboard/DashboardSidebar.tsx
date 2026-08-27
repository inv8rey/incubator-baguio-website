"use client";

import { useAuth } from "../AuthProvider";
import { useOrgContext } from "./orgContext";

const ORANGE = "#F26522";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const INDIVIDUAL_NAV: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: "/dashboard/",
    label: "Dashboard",
    icon: (
      <>
        <rect x={3} y={3} width={7} height={7} rx={1} />
        <rect x={14} y={3} width={7} height={7} rx={1} />
        <rect x={3} y={14} width={7} height={7} rx={1} />
        <rect x={14} y={14} width={7} height={7} rx={1} />
      </>
    ),
  },
  {
    href: "/dashboard/innovator/",
    label: "My Innovations",
    icon: <path d="M5 13.5L3 21l7.5-2M14.5 5.5C17 3 21 3 21 3s0 4-2.5 6.5L11 17l-4-4z" />,
  },
  {
    href: "/dashboard/organizations/",
    label: "My Organization",
    icon: <path d="M4 21V7l8-4 8 4v14M9 21v-6h6v6M4 21h16" />,
  },
  {
    href: "/dashboard/resources/",
    label: "My Resources",
    icon: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" />,
  },
  {
    href: "/dashboard/challenges/",
    label: "Challenges",
    icon: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  },
  {
    href: "/dashboard/events/",
    label: "Events",
    icon: <><rect x={3} y={4} width={18} height={17} rx={2} /><path d="M3 9h18M8 2v4M16 2v4" /></>,
  },
  {
    href: "/dashboard/mentor/",
    label: "Mentor",
    icon: (
      <>
        <circle cx={9} cy={8} r={3.5} />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <circle cx={17} cy={7} r={2.5} />
        <path d="M21 19c0-2.4-1.8-4.5-4-5" />
      </>
    ),
  },
  {
    href: "/dashboard/cofounder/",
    label: "Co-Founder Finder",
    icon: (
      <>
        <circle cx={7} cy={7} r={3} />
        <circle cx={17} cy={7} r={3} />
        <path d="M2 21c0-3.3 2.2-5.5 5-5.5S12 17.7 12 21M12 21c0-3.3 2.2-5.5 5-5.5S22 17.7 22 21" />
      </>
    ),
  },
];

const ACCOUNT_NAV: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: "/dashboard/settings/",
    label: "Account Settings",
    icon: <><circle cx={12} cy={12} r={3} /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></>,
  },
];

const ORG_NAV_BASE: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: "/dashboard/organization/",
    label: "Dashboard",
    icon: (
      <>
        <rect x={3} y={3} width={7} height={7} rx={1} />
        <rect x={14} y={3} width={7} height={7} rx={1} />
        <rect x={3} y={14} width={7} height={7} rx={1} />
        <rect x={14} y={14} width={7} height={7} rx={1} />
      </>
    ),
  },
  {
    href: "/dashboard/organizations/",
    label: "Organization Profile",
    icon: <path d="M4 21V7l8-4 8 4v14M9 21v-6h6v6M4 21h16" />,
  },
];

const ORG_NAV_STARTUPS = {
  href: "/dashboard/organization/startups/",
  label: "Startups",
  icon: <path d="M5 13.5L3 21l7.5-2M14.5 5.5C17 3 21 3 21 3s0 4-2.5 6.5L11 17l-4-4z" />,
};

const ORG_NAV_RESEARCH = { ...ORG_NAV_STARTUPS, label: "Research & Innovations" };

const ORG_NAV_MENTORS = {
  href: "/dashboard/organization/mentors/",
  label: "Mentors",
  icon: (
    <>
      <circle cx={9} cy={8} r={3.5} />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx={17} cy={7} r={2.5} />
      <path d="M21 19c0-2.4-1.8-4.5-4-5" />
    </>
  ),
};

const ORG_NAV_REST: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: "/dashboard/organization/members/",
    label: "Members",
    icon: (
      <>
        <circle cx={9} cy={7} r={4} />
        <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    href: "/dashboard/organization/challenges/",
    label: "Challenges",
    icon: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  },
  {
    href: "/dashboard/organization/opportunities/",
    label: "Opportunities",
    icon: <><rect x={3} y={7} width={18} height={13} rx={2} /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></>,
  },
  {
    href: "/dashboard/organization/events/",
    label: "Events",
    icon: <><rect x={3} y={4} width={18} height={17} rx={2} /><path d="M3 9h18M8 2v4M16 2v4" /></>,
  },
  {
    href: "/dashboard/organization/resources/",
    label: "Resources",
    icon: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" />,
  },
];

function orgNavFor(orgType: string | undefined): { href: string; label: string; icon: React.ReactNode }[] {
  const typeSpecific = orgType === "TBIs" ? [ORG_NAV_STARTUPS, ORG_NAV_MENTORS] : orgType === "Academe" ? [ORG_NAV_RESEARCH] : [];
  return [...ORG_NAV_BASE, ...typeSpecific, ...ORG_NAV_REST];
}

function NavList({ items, active, onNavigate }: { items: typeof INDIVIDUAL_NAV; active: string; onNavigate?: () => void }) {
  return (
    <>
      {items.map((n) => {
        const isActive = active === n.href;
        return (
          <a
            key={n.href}
            href={`${BP}${n.href}`}
            onClick={onNavigate}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? ORANGE : "rgba(255,255,255,0.52)",
              width: "100%",
              textAlign: "left",
              background: isActive ? "rgba(242,101,34,0.12)" : "transparent",
              textDecoration: "none",
              marginBottom: 2,
            }}
          >
            <span style={{ display: "flex", color: "inherit" }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                {n.icon}
              </svg>
            </span>
            <span style={{ flex: 1 }}>{n.label}</span>
          </a>
        );
      })}
    </>
  );
}

export default function DashboardSidebar({ active, onNavigate }: { active: string; onNavigate?: () => void }) {
  const { profile } = useAuth();
  const { orgs, selectedOrgId, setSelectedOrgId, loaded } = useOrgContext();
  const initials = profile?.full_name
    ? profile.full_name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "—";

  const inOrgMode = !!selectedOrgId;
  const selectedOrg = orgs.find((o) => o.id === selectedOrgId);

  function onSwitcherChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (value === "individual") {
      setSelectedOrgId(null);
      window.location.href = `${BP}/dashboard/`;
    } else {
      setSelectedOrgId(value);
      window.location.href = `${BP}/dashboard/organization/`;
    }
  }

  return (
    <aside
      className="ib-userdash-sidebar"
      style={{
        background: "#131110",
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
        <a href={`${BP}/`} style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
          <img src={`${BP}/assets/ib-icon.png`} alt="Incubator Baguio" style={{ width: 36, height: 36, borderRadius: 9, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>Incubator Baguio</div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{inOrgMode ? "Organization Management" : "Member Dashboard"}</div>
          </div>
        </a>
      </div>

      {/* Account type switcher — only shown once the account has at least
          one organization to switch into. */}
      {loaded && orgs.length > 0 && (
        <div style={{ padding: "14px 14px 0" }}>
          <label style={{ display: "block", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, color: "rgba(255,255,255,0.32)", marginBottom: 6, padding: "0 4px" }}>
            Viewing as
          </label>
          <select
            value={selectedOrgId ?? "individual"}
            onChange={onSwitcherChange}
            style={{
              width: "100%",
              fontSize: 12.5,
              fontWeight: 600,
              color: "#fff",
              background: "#1D1A17",
              border: "1.5px solid rgba(255,255,255,0.1)",
              borderRadius: 9,
              padding: "9px 10px",
              appearance: "auto",
              cursor: "pointer",
            }}
          >
            <option value="individual">Individual Dashboard</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ padding: "12px 12px 8px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {inOrgMode ? (
          <>
            <div style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: "rgba(255,255,255,0.28)", padding: "8px 10px 6px" }}>
              {selectedOrg?.name || "Organization"}
            </div>
            <NavList items={orgNavFor(selectedOrg?.org_type)} active={active} onNavigate={onNavigate} />
          </>
        ) : (
          <>
            <div style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: "rgba(255,255,255,0.28)", padding: "8px 10px 6px" }}>Main</div>
            <NavList items={INDIVIDUAL_NAV} active={active} onNavigate={onNavigate} />
            <div style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: "rgba(255,255,255,0.28)", padding: "16px 10px 6px" }}>Profile</div>
            <NavList items={ACCOUNT_NAV} active={active} onNavigate={onNavigate} />
          </>
        )}
      </div>

      <div style={{ padding: "14px 20px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${ORANGE},#FF9A6C)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.full_name || "Member"}</div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.38)", marginTop: 1 }}>Ecosystem member</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
