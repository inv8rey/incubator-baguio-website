"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthProvider";
import { supabase } from "../../lib/supabaseClient";
import { cardStyle, DARK, ORANGE } from "./styles";
import { CHALLENGES as STATIC_CHALLENGES } from "../challenges/data";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface Counts {
  startups: number;
  isMentor: boolean;
  organizations: number;
  challengesPosted: number;
  applicationsSent: number;
  connectionsReceived: number;
}

interface SiteStats {
  openChallenges: number;
  activeMentors: number;
  partnerOrgs: number;
  registeredStartups: number;
}

interface RecommendedItem {
  key: string;
  title: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  org: string;
  deadline: string;
  href: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  venue: string;
  event_date: string;
  event_time: string;
}

const CARDS: { key: keyof Counts | "isMentor"; title: string; href: string; color: string; bg: string; icon: React.ReactNode }[] = [
  {
    key: "startups",
    title: "Startup profiles",
    href: "/dashboard/startup/",
    color: "#F26522",
    bg: "rgba(242,101,34,0.12)",
    icon: <path d="M5 13.5L3 21l7.5-2M14.5 5.5C17 3 21 3 21 3s0 4-2.5 6.5L11 17l-4-4z" />,
  },
  {
    key: "isMentor",
    title: "Mentor Hub",
    href: "/dashboard/mentor/",
    color: "#3A7BD5",
    bg: "rgba(58,123,213,0.12)",
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
    key: "organizations",
    title: "Organizations",
    href: "/dashboard/organizations/",
    color: "#0F9B8E",
    bg: "rgba(15,155,142,0.12)",
    icon: <path d="M4 21V7l8-4 8 4v14M9 21v-6h6v6M4 21h16" />,
  },
  {
    key: "challengesPosted",
    title: "Posted challenges",
    href: "/challenges/post/",
    color: "#7C5CD6",
    bg: "rgba(124,92,214,0.12)",
    icon: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  },
  {
    key: "applicationsSent",
    title: "Applications",
    href: "/challenges/",
    color: "#D88A0A",
    bg: "rgba(245,166,35,0.16)",
    icon: <path d="M9 12h6M9 16h6M9 8h6M6 3h9l3 3v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />,
  },
];

function formatEventDate(iso: string): { month: string; day: string } {
  const d = new Date(iso);
  return { month: d.toLocaleDateString([], { month: "short" }).toUpperCase(), day: String(d.getDate()) };
}

function ScrollCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div style={{ position: "relative" }}>
      <div
        ref={ref}
        className="ib-hide-scrollbar"
        style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x proximity", paddingBottom: 4 }}
      >
        {children}
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const { user, profile } = useAuth();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [recommended, setRecommended] = useState<RecommendedItem[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    if (!supabase || !user) return;
    (async () => {
      const { data: mentorRow } = await supabase!.from("mentors").select("id").eq("owner_id", user.id).maybeSingle();

      const [startups, orgs, challenges, applications, received] = await Promise.all([
        supabase!.from("startups").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
        supabase!.from("organizations").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
        supabase!.from("challenge_submissions").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
        supabase!.from("challenge_applications").select("id", { count: "exact", head: true }).eq("applicant_id", user.id),
        mentorRow
          ? supabase!.from("mentor_connections").select("id", { count: "exact", head: true }).eq("mentor_id", mentorRow.id)
          : Promise.resolve({ count: 0 }),
      ]);
      setCounts({
        startups: startups.count ?? 0,
        isMentor: !!mentorRow,
        organizations: orgs.count ?? 0,
        challengesPosted: challenges.count ?? 0,
        applicationsSent: applications.count ?? 0,
        connectionsReceived: received.count ?? 0,
      });
    })();
  }, [user]);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const [mentorsCount, orgsCount, startupsCount, submissionsCount] = await Promise.all([
        supabase!.from("mentors").select("id", { count: "exact", head: true }),
        supabase!.from("organizations").select("id", { count: "exact", head: true }),
        supabase!.from("startups").select("id", { count: "exact", head: true }),
        supabase!.from("challenge_submissions").select("id", { count: "exact", head: true }),
      ]);
      setSiteStats({
        openChallenges: STATIC_CHALLENGES.length + (submissionsCount.count ?? 0),
        activeMentors: mentorsCount.count ?? 0,
        partnerOrgs: orgsCount.count ?? 0,
        registeredStartups: startupsCount.count ?? 0,
      });

      const staticItems: RecommendedItem[] = STATIC_CHALLENGES.slice(0, 5).map((c) => ({
        key: c.id,
        title: c.title,
        tag: c.sector,
        tagColor: c.sectorColor,
        tagBg: c.sectorBg,
        org: c.orgFull,
        deadline: c.deadline,
        href: `${BP}/challenges/${c.id}/`,
      }));
      const { data: submissionRows } = await supabase!
        .from("challenge_submissions")
        .select("id,title,org_name,sector,deadline")
        .order("created_at", { ascending: false })
        .limit(5);
      const submittedItems: RecommendedItem[] = (submissionRows ?? []).map((c: any) => ({
        key: c.id,
        title: c.title,
        tag: c.sector || "General",
        tagColor: "#9A958B",
        tagBg: "rgba(154,149,139,0.14)",
        org: c.org_name,
        deadline: c.deadline ? `Due ${c.deadline}` : "",
        href: `${BP}/challenges/community/?id=${c.id}`,
      }));
      setRecommended([...staticItems, ...submittedItems]);

      const todayIso = new Date().toISOString().slice(0, 10);
      const { data: eventRows } = await supabase!
        .from("event_submissions")
        .select("id,title,venue,event_date,event_time")
        .eq("status", "approved")
        .gte("event_date", todayIso)
        .order("event_date", { ascending: true })
        .limit(3);
      setEvents((eventRows as UpcomingEvent[]) ?? []);
    })();
  }, []);

  const doneStartup = !!counts && counts.startups > 0;
  const doneMentor = !!counts?.isMentor;
  const doneOrg = !!counts && counts.organizations > 0;
  const setupDoneCount = [doneStartup, doneMentor, doneOrg].filter(Boolean).length;
  const setupPct = Math.round((setupDoneCount / 3) * 100);

  const firstName = profile?.full_name?.trim().split(" ")[0];

  return (
    <div>
      <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>
        Welcome back{firstName ? `, ${firstName}` : ""}! <span aria-hidden>👋</span>
      </h2>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "#6B6B73" }}>Here's what you can do as a logged-in member of Incubator Baguio.</p>

      {counts && counts.connectionsReceived > 0 && (
        <div style={{ marginBottom: 24, background: "rgba(226,58,46,0.06)", border: "1px solid rgba(226,58,46,0.2)", borderRadius: 14, padding: "16px 20px", fontSize: 13.5, color: DARK }}>
          You have <strong>{counts.connectionsReceived}</strong> mentor connection request{counts.connectionsReceived === 1 ? "" : "s"} waiting.{" "}
          <a href={`${BP}/dashboard/connections/`} style={{ color: ORANGE, fontWeight: 600, textDecoration: "none" }}>Review now →</a>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }} className="ib-dashboard-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          {/* STAT ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }} className="ib-dashboard-stats">
            {CARDS.map((c) => {
              const value =
                c.key === "isMentor"
                  ? counts
                    ? counts.isMentor
                      ? "Active"
                      : "Not registered"
                    : "…"
                  : counts
                  ? String(counts[c.key as keyof Counts])
                  : "…";
              return (
                <a key={c.href} href={`${BP}${c.href}`} style={{ ...cardStyle, padding: "18px 16px", textDecoration: "none", display: "block" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{c.icon}</svg>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: DARK, letterSpacing: "-0.02em", marginBottom: 2 }}>{value}</div>
                  <div style={{ fontSize: 12, color: "#9A958B" }}>{c.title}</div>
                </a>
              );
            })}
          </div>

          {/* RECOMMENDED FOR YOU */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: DARK }}>Recommended for you</div>
              <a href={`${BP}/challenges/`} style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE, textDecoration: "none" }}>View all</a>
            </div>
            {recommended.length === 0 ? (
              <div style={{ fontSize: 13, color: "#9A958B" }}>No open challenges right now.</div>
            ) : (
              <ScrollCarousel>
                {recommended.map((r) => (
                  <a
                    key={r.key}
                    href={r.href}
                    className="ib-challenge-hover"
                    style={{ scrollSnapAlign: "start", flex: "0 0 240px", display: "block", background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 14, padding: 18, textDecoration: "none" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 6 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: r.tagColor, background: r.tagBg, padding: "4px 9px", borderRadius: 9999 }}>{r.tag}</span>
                    </div>
                    <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: DARK, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.title}</h3>
                    <div style={{ fontSize: 11.5, color: "#9A958B", marginBottom: 4 }}>{r.org}</div>
                    {r.deadline && <div style={{ fontSize: 11.5, color: "#6B6B73" }}>{r.deadline}</div>}
                  </a>
                ))}
              </ScrollCarousel>
            )}
          </div>

          {/* NEXT STEPS */}
          <div style={cardStyle}>
            <div style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 16 }}>Your next steps</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{doneStartup ? "Manage your startup" : "Create your startup profile"}</div>
                  <div style={{ fontSize: 11.5, color: "#9A958B" }}>{doneStartup ? "Keep your listing up to date." : "Get discovered by mentors and programs."}</div>
                </div>
                <a href={`${BP}/dashboard/startup/`} style={{ fontSize: 12, fontWeight: 600, color: doneStartup ? DARK : "#fff", background: doneStartup ? "none" : ORANGE, border: doneStartup ? "1.5px solid rgba(20,20,25,0.15)" : "none", padding: "8px 14px", borderRadius: 9999, textDecoration: "none", flexShrink: 0 }}>
                  {doneStartup ? "Manage" : "Start now"}
                </a>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>Find a co-founder</div>
                  <div style={{ fontSize: 11.5, color: "#9A958B" }}>Browse founders looking to team up.</div>
                </div>
                <a href={`${BP}/dashboard/cofounder/`} style={{ fontSize: 12, fontWeight: 600, color: DARK, background: "none", border: "1.5px solid rgba(20,20,25,0.15)", padding: "8px 14px", borderRadius: 9999, textDecoration: "none", flexShrink: 0 }}>Find one</a>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>Explore open challenges</div>
                  <div style={{ fontSize: 11.5, color: "#9A958B" }}>Find problems to solve and opportunities.</div>
                </div>
                <a href={`${BP}/challenges/`} style={{ fontSize: 12, fontWeight: 600, color: DARK, background: "none", border: "1.5px solid rgba(20,20,25,0.15)", padding: "8px 14px", borderRadius: 9999, textDecoration: "none", flexShrink: 0 }}>Explore</a>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>Connect with mentors</div>
                  <div style={{ fontSize: 11.5, color: "#9A958B" }}>Request guidance from experts.</div>
                </div>
                <a href={`${BP}/ecosystem/`} style={{ fontSize: 12, fontWeight: 600, color: DARK, background: "none", border: "1.5px solid rgba(20,20,25,0.15)", padding: "8px 14px", borderRadius: 9999, textDecoration: "none", flexShrink: 0 }}>Find mentors</a>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <div style={cardStyle}>
            <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 16 }}>Grow your presence</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: `conic-gradient(${ORANGE} ${setupPct * 3.6}deg, rgba(20,20,25,0.08) 0deg)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, color: DARK }}>{setupPct}%</div>
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#6B6B73" }}>
                {setupDoneCount === 3
                  ? "You've set up your startup, mentor, and organization presence."
                  : "Set up your presence to unlock more opportunities."}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[
                { label: "Startup profile", done: doneStartup },
                { label: "Mentor profile", done: doneMentor },
                { label: "Organization listing", done: doneOrg },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: item.done ? DARK : "#9A958B" }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: item.done ? "#1A6B3C" : "rgba(20,20,25,0.08)" }}>
                    {item.done && (
                      <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><path d="M20 6 9 17l-5-5" /></svg>
                    )}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>Upcoming events</div>
              <a href={`${BP}/calendar/`} style={{ fontSize: 12, fontWeight: 600, color: ORANGE, textDecoration: "none" }}>View calendar</a>
            </div>
            {events.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "#9A958B" }}>No upcoming events yet — check the calendar.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {events.map((e) => {
                  const { month, day } = formatEventDate(e.event_date);
                  return (
                    <div key={e.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 42, textAlign: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: ORANGE, letterSpacing: "0.04em" }}>{month}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: DARK, lineHeight: 1.1 }}>{day}</div>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                        <div style={{ fontSize: 11, color: "#9A958B" }}>{e.venue}{e.event_time ? ` · ${e.event_time}` : ""}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>Opportunities at a glance</div>
              <a href={`${BP}/ecosystem/`} style={{ fontSize: 12, fontWeight: 600, color: ORANGE, textDecoration: "none" }}>View all</a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Open challenges", value: siteStats?.openChallenges, color: "#7C5CD6", bg: "rgba(124,92,214,0.12)" },
                { label: "Active mentors", value: siteStats?.activeMentors, color: "#3A7BD5", bg: "rgba(58,123,213,0.12)" },
                { label: "Partner orgs", value: siteStats?.partnerOrgs, color: "#0F9B8E", bg: "rgba(15,155,142,0.12)" },
                { label: "Startups", value: siteStats?.registeredStartups, color: "#F26522", bg: "rgba(242,101,34,0.12)" },
              ].map((s) => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value ?? "…"}</div>
                  <div style={{ fontSize: 10.5, color: "#6B6B73" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
