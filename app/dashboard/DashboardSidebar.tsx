"use client";

import { useAuth } from "../AuthProvider";

const ORANGE = "#F26522";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const NAV: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: "/dashboard/",
    label: "Overview",
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
    href: "/dashboard/startup/",
    label: "Startups",
    icon: <path d="M5 13.5L3 21l7.5-2M14.5 5.5C17 3 21 3 21 3s0 4-2.5 6.5L11 17l-4-4z" />,
  },
  {
    href: "/dashboard/mentor/",
    label: "Mentor Hub",
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
    href: "/dashboard/organizations/",
    label: "Organizations",
    icon: <path d="M4 21V7l8-4 8 4v14M9 21v-6h6v6M4 21h16" />,
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

export default function DashboardSidebar({ active, onNavigate }: { active: string; onNavigate?: () => void }) {
  const { profile } = useAuth();
  const initials = profile?.full_name
    ? profile.full_name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "—";

  return (
    <aside
      className="ib-userdash-sidebar"
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
        <a href={`${BP}/`} style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
          <img src={`${BP}/assets/cpdso-logo.png`} alt="CPDSO" style={{ width: 36, height: 36, borderRadius: 9, objectFit: "contain" }} />
          <img src={`${BP}/assets/ib-icon.png`} alt="Incubator Baguio" style={{ width: 36, height: 36, borderRadius: 9, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>Incubator Baguio</div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Member Dashboard</div>
          </div>
        </a>
      </div>
      <div style={{ padding: "12px 12px 8px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: "rgba(255,255,255,0.28)", padding: "8px 10px 6px" }}>Main</div>
        {NAV.map((n) => {
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
      </div>
      <div style={{ padding: "14px 20px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${ORANGE},#FF9A6C)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
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
