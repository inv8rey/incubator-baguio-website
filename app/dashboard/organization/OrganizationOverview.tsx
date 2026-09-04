"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRequiredOrg, OrgRequiredNotice } from "./OrgRequired";
import { cardStyle, DARK, ORANGE } from "../styles";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface OrgRow {
  id: string;
  name: string;
  logo_url: string;
  org_type: string;
  type: string;
  slug: string;
  short_description: string;
  description: string;
  contact_email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  sectors: string[];
  expertise: string[];
  can_offer: string[];
  looking_for: string[];
  approval_status: "pending" | "approved" | "rejected" | "suspended";
  is_public: boolean;
}

interface ActivityItem {
  id: string;
  kind: "Challenge" | "Event" | "Opportunity" | "Resource" | "Startup" | "Mentor";
  title: string;
  status: "pending" | "approved" | "rejected" | "live";
  created_at: string;
}

const STATUS_BADGE: Record<ActivityItem["status"], { label: string; color: string; bg: string }> = {
  pending: { label: "Pending review", color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
  approved: { label: "Live", color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" },
  rejected: { label: "Not approved", color: "#E23A2E", bg: "rgba(226,58,46,0.10)" },
  live: { label: "Live", color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" },
};

const STATUS_BANNER: Record<OrgRow["approval_status"], { bg: string; color: string; text: (o: OrgRow) => string }> = {
  pending: { bg: "rgba(245,166,35,0.12)", color: "#D88A0A", text: () => "Your organization is pending Incubator Baguio review — it isn't public yet." },
  approved: { bg: "rgba(26,107,60,0.10)", color: "#1A6B3C", text: (o) => (o.is_public ? "Approved and public in the Ecosystem directory." : "Approved, but currently hidden from the public directory by Incubator Baguio.") },
  rejected: { bg: "rgba(226,58,46,0.10)", color: "#E23A2E", text: () => "This organization wasn't approved. Contact Incubator Baguio if you believe this is a mistake." },
  suspended: { bg: "rgba(226,58,46,0.10)", color: "#E23A2E", text: () => "This organization has been suspended and is not visible publicly." },
};

function completeness(o: OrgRow) {
  const checks = [
    { label: "Basic Information", done: !!(o.name && o.short_description) },
    { label: "Contact Information", done: !!(o.contact_email || o.phone || o.website) },
    { label: "Location", done: !!(o.address || o.city) },
    { label: "Areas of Focus", done: o.sectors.length > 0 },
    { label: "What We Do", done: !!(o.description.trim() || o.expertise.length > 0) },
  ];
  const pct = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);
  return { checks, pct };
}

const ICON_STARTUPS = <path d="M5 13.5L3 21l7.5-2M14.5 5.5C17 3 21 3 21 3s0 4-2.5 6.5L11 17l-4-4z" />;
const ICON_MENTORS = <><circle cx={9} cy={8} r={3.5} /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx={17} cy={7} r={2.5} /><path d="M21 19c0-2.4-1.8-4.5-4-5" /></>;
const ICON_LAB = <><path d="M9 3h6M10 3v5.5L5.5 17a2 2 0 0 0 1.7 3h9.6a2 2 0 0 0 1.7-3L14 8.5V3" /><path d="M7.5 14h9" /></>;
const ICON_BUILDING = <path d="M4 21V7l8-4 8 4v14M9 21v-6h6v6M4 21h16" />;
const ICON_EDIT = <><circle cx={12} cy={12} r={3} /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></>;

const QUICK_LINKS_BASE: { label: string; href: string; icon: React.ReactNode }[] = [
  { href: "/dashboard/organization/members/", label: "Members", icon: <><circle cx={9} cy={7} r={4} /><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
  { href: "/dashboard/organization/challenges/", label: "Challenges", icon: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /> },
  { href: "/dashboard/organization/opportunities/", label: "Opportunities", icon: <><rect x={3} y={7} width={18} height={13} rx={2} /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></> },
  { href: "/dashboard/organization/events/", label: "Events", icon: <><rect x={3} y={4} width={18} height={17} rx={2} /><path d="M3 9h18M8 2v4M16 2v4" /></> },
  { href: "/dashboard/organization/resources/", label: "Resources", icon: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" /> },
  { href: "/dashboard/organizations/", label: "Edit Profile", icon: ICON_EDIT },
];

function quickLinksFor(orgType: string): { label: string; href: string; icon: React.ReactNode }[] {
  const typeSpecific =
    orgType === "TBIs"
      ? [
          { href: "/dashboard/organization/startups/", label: "Add a Startup", icon: ICON_STARTUPS },
          { href: "/dashboard/organization/mentors/", label: "Add a Mentor", icon: ICON_MENTORS },
          { href: `/dashboard/organizations/?newOrgType=${encodeURIComponent("Makerspaces & Labs")}`, label: "Add a Lab", icon: ICON_LAB },
          { href: `/dashboard/organizations/?newOrgType=${encodeURIComponent("Coworking Spaces")}`, label: "Add a Coworking Space", icon: ICON_BUILDING },
        ]
      : orgType === "Academe"
      ? [
          { href: "/dashboard/organization/startups/", label: "Add Research", icon: ICON_STARTUPS },
          { href: `/dashboard/organizations/?newOrgType=${encodeURIComponent("Makerspaces & Labs")}`, label: "Add a Lab", icon: ICON_LAB },
        ]
      : [];
  return [...QUICK_LINKS_BASE.slice(0, 1), ...typeSpecific, ...QUICK_LINKS_BASE.slice(1)];
}

function Overview({ orgId }: { orgId: string }) {
  const [org, setOrg] = useState<OrgRow | null>(null);
  const [membersCount, setMembersCount] = useState<number | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [counts, setCounts] = useState({ challenges: 0, opportunities: 0, resources: 0, events: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const [{ data: orgRow }, { count: members }, { data: challenges }, { data: events }, { data: resources }, { data: startups }, { data: mentors }] = await Promise.all([
        supabase!.from("organizations").select("*").eq("id", orgId).single(),
        supabase!.from("organization_members").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
        supabase!.from("challenge_submissions").select("id,title,created_at").eq("organization_id", orgId).order("created_at", { ascending: false }),
        supabase!.from("event_submissions").select("id,title,status,created_at").eq("organization_id", orgId).order("created_at", { ascending: false }),
        supabase!.from("knowledge_resources").select("id,title,category,status,created_at").eq("organization_id", orgId).order("created_at", { ascending: false }),
        supabase!.from("startups").select("id,name,created_at").eq("organization_id", orgId).order("created_at", { ascending: false }),
        supabase!.from("mentors").select("id,name,created_at").eq("organization_id", orgId).order("created_at", { ascending: false }),
      ]);

      const o = orgRow as OrgRow | null;
      setOrg(
        o
          ? { ...o, sectors: o.sectors ?? [], expertise: o.expertise ?? [], can_offer: o.can_offer ?? [], looking_for: o.looking_for ?? [] }
          : null
      );
      setMembersCount(members ?? 0);

      const opportunityRows = (resources ?? []).filter((r: any) => r.category === "Funding & Opportunities");
      const resourceRows = (resources ?? []).filter((r: any) => r.category !== "Funding & Opportunities");
      setCounts({
        challenges: (challenges ?? []).length,
        opportunities: opportunityRows.length,
        resources: resourceRows.length,
        events: (events ?? []).length,
      });

      const merged: ActivityItem[] = [
        ...(challenges ?? []).map((c: any) => ({ id: `c-${c.id}`, kind: "Challenge" as const, title: c.title, status: "live" as const, created_at: c.created_at })),
        ...(events ?? []).map((e: any) => ({ id: `e-${e.id}`, kind: "Event" as const, title: e.title, status: e.status, created_at: e.created_at })),
        ...(resources ?? []).map((r: any) => ({ id: `r-${r.id}`, kind: (r.category === "Funding & Opportunities" ? "Opportunity" : "Resource") as ActivityItem["kind"], title: r.title, status: r.status, created_at: r.created_at })),
        ...(startups ?? []).map((s: any) => ({ id: `s-${s.id}`, kind: "Startup" as const, title: s.name, status: "live" as const, created_at: s.created_at })),
        ...(mentors ?? []).map((m: any) => ({ id: `m-${m.id}`, kind: "Mentor" as const, title: m.name, status: "live" as const, created_at: m.created_at })),
      ].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      setActivity(merged.slice(0, 6));

      setLoaded(true);
    })();
  }, [orgId]);

  if (!loaded || !org) {
    return <div style={{ padding: "40px 0", textAlign: "center", color: "#6E685F", fontSize: 14 }}>Loading&hellip;</div>;
  }

  const { checks, pct } = completeness(org);
  const banner = STATUS_BANNER[org.approval_status];

  const STAT_TILES = [
    { label: "Members", value: membersCount ?? 0, note: "Active on your team", color: "#6B5BD6", bg: "rgba(107,91,214,0.12)", icon: <><circle cx={9} cy={7} r={4} /><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" /></> },
    { label: "Challenges Posted", value: counts.challenges, note: "Live on the marketplace", color: "#D9531E", bg: "rgba(217,83,30,0.12)", icon: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /> },
    { label: "Opportunities & Resources", value: counts.opportunities + counts.resources, note: "Submitted to the Knowledge Hub", color: "#285E7A", bg: "rgba(40,94,122,0.12)", icon: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" /> },
    { label: "Events Submitted", value: counts.events, note: "On the community calendar", color: "#1A6B3C", bg: "rgba(26,107,60,0.12)", icon: <><rect x={3} y={4} width={18} height={17} rx={2} /><path d="M3 9h18M8 2v4M16 2v4" /></> },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
        {org.logo_url ? (
          <img src={org.logo_url} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }} />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F6F2EA", flexShrink: 0 }} />
        )}
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>{org.name}</h2>
          <div style={{ fontSize: 13, color: "#6E685F" }}>{org.org_type}{org.type ? ` · ${org.type}` : ""}</div>
        </div>
      </div>
      <p style={{ margin: "10px 0 24px", fontSize: 14, color: "#5A544B" }}>Here&rsquo;s what&rsquo;s happening with your organization on Incubator Baguio.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }} className="ib-dashboard-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          {/* PROFILE COMPLETENESS */}
          {pct < 100 ? (
            <div style={{ ...cardStyle, background: "linear-gradient(135deg, rgba(242,101,34,0.08), rgba(242,101,34,0.03))", border: "1px solid rgba(242,101,34,0.18)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }} className="ib-dashboard-nextstep">
                <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: `conic-gradient(${ORANGE} ${pct * 3.6}deg, rgba(64,50,34,0.11) 0deg)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: DARK }}>{pct}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 6 }}>Complete your profile</div>
                    <div style={{ fontSize: 19, fontWeight: 600, color: DARK, marginBottom: 6 }}>A complete profile gets found more often</div>
                    <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.55, color: "#5A544B", maxWidth: 380 }}>
                      Fill in contact details, location, and collaboration info so the ecosystem can find and reach {org.name}.
                    </p>
                    <a href={`${BP}/dashboard/organizations/`} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#fff", background: ORANGE, padding: "10px 18px", borderRadius: 9999, textDecoration: "none" }}>
                      Complete profile
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </a>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, minWidth: 168 }} className="ib-dashboard-nextstep-checks">
                  {checks.map((c, i) => (
                    <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: c.done ? DARK : "#6E685F" }}>
                      <span style={{ width: 17, height: 17, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: c.done ? "#1A6B3C" : "#fff", border: c.done ? "none" : "1.5px solid rgba(64,50,34,0.18)" }}>
                        {c.done && <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><path d="M20 6 9 17l-5-5" /></svg>}
                      </span>
                      <span style={{ fontWeight: 600 }}>Step {i + 1}</span>&nbsp;&mdash; {c.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 12, background: "rgba(26,107,60,0.06)", border: "1px solid rgba(26,107,60,0.18)" }}>
              <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#1A6B3C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><path d="M20 6 9 17l-5-5" /></svg>
              </span>
              <div style={{ fontSize: 13.5, color: DARK }}>{org.name}&rsquo;s profile is complete and ready to be discovered across the ecosystem.</div>
            </div>
          )}

          {/* STAT ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }} className="ib-dashboard-stats">
            {STAT_TILES.map((s) => (
              <div key={s.label} style={{ ...cardStyle, padding: "18px 16px" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, color: DARK, letterSpacing: "-0.02em", marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: DARK, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#6E685F" }}>{s.note}</div>
              </div>
            ))}
          </div>

          {/* QUICK ACTIONS */}
          <div style={cardStyle}>
            <div style={{ fontSize: 16, fontWeight: 600, color: DARK, marginBottom: 16 }}>Manage your organization</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }} className="ib-dashboard-stats">
              {quickLinksFor(org.org_type).map((l) => (
                <a
                  key={l.label}
                  href={`${BP}${l.href}`}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", textDecoration: "none", background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.1)", borderRadius: 14, padding: "18px 10px" }}
                >
                  <span style={{ width: 36, height: 36, borderRadius: 9999, background: "rgba(242,101,34,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{l.icon}</svg>
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: DARK }}>{l.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <div style={cardStyle}>
            <div style={{ background: banner.bg, color: banner.color, fontSize: 12.5, fontWeight: 600, borderRadius: 12, padding: "12px 14px", marginBottom: org.is_public ? 14 : 0 }}>
              {banner.text(org)}
            </div>
            {org.is_public && (
              <a href={`${BP}/organizations/${org.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: ORANGE, textDecoration: "none" }}>
                View Public Profile →
              </a>
            )}
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: 15, fontWeight: 600, color: DARK, marginBottom: 14 }}>Recent activity</div>
            {activity.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "#6E685F" }}>Nothing submitted yet — post a challenge, event, or resource to see it here.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {activity.map((a) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: "#6E685F" }}>{a.kind}</div>
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: STATUS_BADGE[a.status].color, background: STATUS_BADGE[a.status].bg, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>{STATUS_BADGE[a.status].label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: 15, fontWeight: 600, color: DARK, marginBottom: 6 }}>Need help or have questions?</div>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#6E685F" }}>Reach out to our team.</p>
            <a href="mailto:incubatorbaguio63@gmail.com" style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE, textDecoration: "none" }}>incubatorbaguio63@gmail.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrganizationOverview() {
  const { selectedOrg, loaded } = useRequiredOrg();
  if (!loaded) return <div style={{ padding: "40px 0", textAlign: "center", color: "#6E685F", fontSize: 14 }}>Loading&hellip;</div>;
  if (!selectedOrg) return <OrgRequiredNotice />;
  return <Overview orgId={selectedOrg.id} />;
}
