"use client";

const DARK = "#141417";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TABS = [
  { href: "/dashboard/", label: "Overview" },
  { href: "/dashboard/startup/", label: "Startups" },
  { href: "/dashboard/mentor/", label: "Mentor Hub" },
  { href: "/dashboard/organizations/", label: "Organizations" },
  { href: "/dashboard/cofounder/", label: "Co-Founder Finder" },
];

export default function DashboardTabs({ active }: { active: string }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
      {TABS.map((t) => (
        <a
          key={t.href}
          href={`${BP}${t.href}`}
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: active === t.href ? "#fff" : "#44444C",
            background: active === t.href ? DARK : "#F4F2EC",
            padding: "10px 18px",
            borderRadius: 9999,
            textDecoration: "none",
          }}
        >
          {t.label}
        </a>
      ))}
    </div>
  );
}
