"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthProvider";
import { supabase } from "../../lib/supabaseClient";
import { cardStyle, DARK, ORANGE } from "./styles";
import { categoryInfo } from "../challenges/data";
import { fetchDynamicChallenges } from "../challenges/dynamicData";
import { fetchSavedItems, toggleSavedItem, type SavedItemType } from "./savedItems";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface Counts {
  startups: number;
  isMentor: boolean;
  organizations: number;
  applicationsSent: number;
  connectionsReceived: number;
}

interface SiteStats {
  openChallenges: number;
  opportunities: number;
  ecosystemOrganizations: number;
  ecosystemMembers: number;
}

type RecKind = "Open Challenge" | "Opportunity" | "Event";

const REC_KIND_TO_SAVED_TYPE: Record<RecKind, SavedItemType> = {
  "Open Challenge": "challenge",
  Opportunity: "opportunity",
  Event: "event",
};

interface RecommendedItem {
  key: string;
  refId: string;
  kind: RecKind;
  title: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  meta: string;
  detail: string;
  href: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  venue: string;
  event_date: string;
  event_time: string;
}

const KIND_STYLE: Record<RecKind, { color: string; bg: string }> = {
  "Open Challenge": { color: "#D9531E", bg: "rgba(217,83,30,0.12)" },
  Opportunity: { color: "#285E7A", bg: "rgba(40,94,122,0.12)" },
  Event: { color: "#6B5BD6", bg: "rgba(107,91,214,0.12)" },
};

const EXPLORE_LINKS: { label: string; tab: string; icon: React.ReactNode }[] = [
  { label: "Mentors", tab: "Mentors", icon: <><circle cx={9} cy={8} r={3.5} /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx={17} cy={7} r={2.5} /><path d="M21 19c0-2.4-1.8-4.5-4-5" /></> },
  { label: "Organizations", tab: "TBIs", icon: <><rect x={3} y={7} width={18} height={13} rx={2} /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><path d="M3 12h18" /></> },
  { label: "Startups", tab: "Startups", icon: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /> },
  { label: "Community", tab: "Community", icon: <><circle cx={12} cy={8} r={4} /><path d="M5 21v-1a7 7 0 0 1 14 0v1" /></> },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatEventDate(iso: string): { month: string; day: string } {
  const d = new Date(iso);
  return { month: d.toLocaleDateString([], { month: "short" }).toUpperCase(), day: String(d.getDate()) };
}

function ScrollCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  const [active, setActive] = useState(0);

  function recompute() {
    const el = ref.current;
    if (!el) return;
    setPages(Math.max(1, Math.ceil(el.scrollWidth / Math.max(el.clientWidth, 1))));
  }
  useEffect(() => {
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [children]);

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setActive(max <= 0 ? 0 : Math.round((el.scrollLeft / max) * (pages - 1)));
  }

  return (
    <div>
      <div
        ref={ref}
        onScroll={onScroll}
        className="ib-hide-scrollbar"
        style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x proximity", paddingBottom: 4 }}
      >
        {children}
      </div>
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
          {Array.from({ length: pages }).map((_, i) => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: 9999, background: i === active ? ORANGE : "rgba(64,50,34,0.16)" }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardOverview() {
  const { user, profile } = useAuth();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [recommended, setRecommended] = useState<RecommendedItem[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    fetchSavedItems(user.id).then((rows) => setSavedKeys(new Set(rows.map((r) => `${r.item_type}:${r.ref_id}`))));
  }, [user]);

  async function onToggleSave(item: RecommendedItem, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const type = REC_KIND_TO_SAVED_TYPE[item.kind];
    const setKey = `${type}:${item.refId}`;
    const nowSaved = await toggleSavedItem(user.id, type, item.refId, item.title, item.meta, item.href);
    setSavedKeys((prev) => {
      const next = new Set(prev);
      if (nowSaved) next.add(setKey);
      else next.delete(setKey);
      return next;
    });
  }

  useEffect(() => {
    if (!supabase || !user) return;
    (async () => {
      const { data: mentorRow } = await supabase!.from("mentors").select("id").eq("owner_id", user.id).maybeSingle();

      const [startups, orgs, applications, received] = await Promise.all([
        supabase!.from("startups").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
        supabase!.from("organizations").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
        supabase!.from("challenge_applications").select("id", { count: "exact", head: true }).eq("applicant_id", user.id),
        mentorRow
          ? supabase!.from("mentor_connections").select("id", { count: "exact", head: true }).eq("mentor_id", mentorRow.id)
          : Promise.resolve({ count: 0 }),
      ]);
      setCounts({
        startups: startups.count ?? 0,
        isMentor: !!mentorRow,
        organizations: orgs.count ?? 0,
        applicationsSent: applications.count ?? 0,
        connectionsReceived: received.count ?? 0,
      });
    })();
  }, [user]);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const todayIso = new Date().toISOString().slice(0, 10);

      const [mentorsCount, orgsCount, startupsCount, submissionsCount, opportunitiesCount, curatedChallenges] = await Promise.all([
        supabase!.from("mentors").select("id", { count: "exact", head: true }),
        // is_public also filters out anything pending/hidden/rejected/suspended
        // -- same rule the public Ecosystem directory itself uses.
        supabase!.from("organizations").select("id", { count: "exact", head: true }).eq("is_public", true),
        supabase!.from("startups").select("id", { count: "exact", head: true }),
        supabase!.from("challenge_submissions").select("id", { count: "exact", head: true }),
        supabase!
          .from("knowledge_resources")
          .select("id", { count: "exact", head: true })
          .eq("category", "Funding & Opportunities")
          .or(`deadline_date.is.null,deadline_date.gte.${todayIso}`),
        fetchDynamicChallenges(),
      ]);
      setSiteStats({
        openChallenges: curatedChallenges.length + (submissionsCount.count ?? 0),
        opportunities: opportunitiesCount.count ?? 0,
        ecosystemOrganizations: orgsCount.count ?? 0,
        ecosystemMembers: (mentorsCount.count ?? 0) + (startupsCount.count ?? 0),
      });

      const challengeItems: RecommendedItem[] = curatedChallenges.slice(0, 4).map((c) => {
        const cat = categoryInfo(c.category);
        return {
          key: `c-${c.id}`,
          refId: `c-${c.id}`,
          kind: "Open Challenge",
          title: c.title,
          tag: c.category,
          tagColor: cat.color,
          tagBg: cat.bg,
          meta: c.orgFull,
          detail: c.deadline,
          href: `${BP}/challenges/${c.slug}/`,
        };
      });

      const { data: opportunityRows } = await supabase!
        .from("knowledge_resources")
        .select("id,title,source,funding_amount,deadline_date")
        .eq("category", "Funding & Opportunities")
        .or(`deadline_date.is.null,deadline_date.gte.${todayIso}`)
        .order("created_at", { ascending: false })
        .limit(3);
      const opportunityItems: RecommendedItem[] = (opportunityRows ?? []).map((o: any) => ({
        key: `o-${o.id}`,
        refId: `o-${o.id}`,
        kind: "Opportunity",
        title: o.title,
        tag: o.funding_amount || "Funding",
        tagColor: KIND_STYLE.Opportunity.color,
        tagBg: KIND_STYLE.Opportunity.bg,
        meta: o.source || "Incubator Baguio",
        detail: o.deadline_date ? `Deadline: ${new Date(o.deadline_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}` : "Rolling deadline",
        href: `${BP}/knowledge/`,
      }));

      const { data: eventRowsForFeed } = await supabase!
        .from("public_events")
        .select("id,title,venue,event_date,category")
        .gte("event_date", todayIso)
        .order("event_date", { ascending: true })
        .limit(3);
      const eventItems: RecommendedItem[] = (eventRowsForFeed ?? []).map((e: any) => ({
        key: `e-${e.id}`,
        refId: `e-${e.id}`,
        kind: "Event",
        title: e.title,
        tag: e.category || "Event",
        tagColor: KIND_STYLE.Event.color,
        tagBg: KIND_STYLE.Event.bg,
        meta: e.venue || "Baguio",
        detail: new Date(e.event_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
        href: `${BP}/calendar/`,
      }));

      const { data: submissionRows } = await supabase!
        .from("challenge_submissions")
        .select("id,title,org_name,sector,deadline")
        .order("created_at", { ascending: false })
        .limit(3);
      const submittedItems: RecommendedItem[] = (submissionRows ?? []).map((c: any) => ({
        key: `s-${c.id}`,
        refId: `s-${c.id}`,
        kind: "Open Challenge",
        title: c.title,
        tag: c.sector || "General",
        tagColor: KIND_STYLE["Open Challenge"].color,
        tagBg: KIND_STYLE["Open Challenge"].bg,
        meta: c.org_name,
        detail: c.deadline ? `Due ${c.deadline}` : "",
        href: `${BP}/challenges/community/?id=${c.id}`,
      }));

      setRecommended([...challengeItems, ...opportunityItems, ...eventItems, ...submittedItems]);

      const { data: eventRows } = await supabase!
        .from("public_events")
        .select("id,title,venue,event_date,event_time")
        .gte("event_date", todayIso)
        .order("event_date", { ascending: true })
        .limit(3);
      setEvents((eventRows as UpcomingEvent[]) ?? []);
    })();
  }, []);

  const doneStartup = !!counts && counts.startups > 0;
  const doneMentor = !!counts?.isMentor;
  const doneOrg = !!counts && counts.organizations > 0;

  const step1Done = !!(
    profile?.full_name?.trim() &&
    profile?.role_title?.trim() &&
    profile?.bio?.trim() &&
    ((profile?.areas_of_interest?.length ?? 0) > 0 || (profile?.skills?.length ?? 0) > 0)
  );
  const step2Done = doneStartup;
  const step3Done = doneMentor || doneOrg;
  const setupSteps = [step1Done, step2Done, step3Done];
  const setupDoneCount = setupSteps.filter(Boolean).length;
  const setupPct = Math.round((setupDoneCount / 3) * 100);
  const nextIncompleteStep = !step1Done ? 1 : !step2Done ? 2 : !step3Done ? 3 : 0;

  const GET_INVOLVED_LINKS = [
    { label: "Become a Mentor", href: "/dashboard/mentor/" },
    { label: "Add a Resource", href: "/dashboard/resources/" },
    { label: "Add an organization", href: "/dashboard/organizations/" },
    { label: "Find or share an Event", href: "/dashboard/events/" },
    { label: "Find a Co-Founder", href: "/dashboard/cofounder/" },
  ];

  const firstName = profile?.full_name?.trim().split(" ")[0];

  const STAT_TILES: { label: string; value: number | undefined; note: string; color: string; bg: string; icon: React.ReactNode }[] = [
    { label: "Open Challenges", value: siteStats?.openChallenges, note: "Looking for ideas and solutions", color: "#D9531E", bg: "rgba(217,83,30,0.12)", icon: <><circle cx={12} cy={12} r={2.5} /><circle cx={12} cy={12} r={7} /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></> },
    { label: "Opportunities", value: siteStats?.opportunities, note: "Programs, funding, and more", color: "#285E7A", bg: "rgba(40,94,122,0.12)", icon: <><rect x={3} y={7} width={18} height={13} rx={2} /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></> },
    { label: "Ecosystem Organizations", value: siteStats?.ecosystemOrganizations, note: "Schools, TBIs, gov't, and more", color: "#1A6B3C", bg: "rgba(26,107,60,0.12)", icon: <><path d="M4 21V7l8-4 8 4v14M9 21v-6h6v6M4 21h16" /></> },
    { label: "Ecosystem Members", value: siteStats?.ecosystemMembers, note: "Innovators, mentors, and more", color: "#6B5BD6", bg: "rgba(107,91,214,0.12)", icon: <><circle cx={9} cy={8} r={3.5} /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx={17} cy={7} r={2.5} /><path d="M21 19c0-2.4-1.8-4.5-4-5" /></> },
  ];

  return (
    <div>
      <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>
        {greeting()}{firstName ? `, ${firstName}` : ""}! <span aria-hidden>👋</span>
      </h2>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "#5A544B" }}>Welcome back! Here&rsquo;s what&rsquo;s happening in Baguio&rsquo;s innovation ecosystem.</p>

      {counts && counts.connectionsReceived > 0 && (
        <div style={{ marginBottom: 20, background: "rgba(226,58,46,0.06)", border: "1px solid rgba(226,58,46,0.2)", borderRadius: 14, padding: "16px 20px", fontSize: 13.5, color: DARK }}>
          You have <strong>{counts.connectionsReceived}</strong> mentor connection request{counts.connectionsReceived === 1 ? "" : "s"} waiting.{" "}
          <a href={`${BP}/dashboard/connections/`} style={{ color: ORANGE, fontWeight: 600, textDecoration: "none" }}>Review now →</a>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }} className="ib-dashboard-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          {/* YOUR NEXT STEP */}
          {setupPct < 100 ? (
            <div style={{ ...cardStyle, background: "linear-gradient(135deg, rgba(242,101,34,0.08), rgba(242,101,34,0.03))", border: "1px solid rgba(242,101,34,0.18)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }} className="ib-dashboard-nextstep">
                <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: `conic-gradient(${ORANGE} ${setupPct * 3.6}deg, rgba(64,50,34,0.11) 0deg)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: DARK }}>{setupPct}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 6 }}>Your next step</div>
                    <div style={{ fontSize: 19, fontWeight: 600, color: DARK, marginBottom: 6 }}>
                      {nextIncompleteStep === 1 && "Build your profile"}
                      {nextIncompleteStep === 2 && "Add your innovations"}
                      {nextIncompleteStep === 3 && "Get involved"}
                    </div>
                    <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.55, color: "#5A544B", maxWidth: 380 }}>
                      {nextIncompleteStep === 1 && "Collect the information people and organizations need to discover and reach you."}
                      {nextIncompleteStep === 2 && "Add a startup, research project, prototype, technology, or innovation you're working on."}
                      {nextIncompleteStep === 3 && "There are lots of ways to plug into the ecosystem — pick one to get started."}
                    </p>
                    {nextIncompleteStep === 1 && (
                      <a href={`${BP}/dashboard/settings/`} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#fff", background: ORANGE, padding: "10px 18px", borderRadius: 9999, textDecoration: "none" }}>
                        Continue profile
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </a>
                    )}
                    {nextIncompleteStep === 2 && (
                      <a href={`${BP}/dashboard/innovator/`} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#fff", background: ORANGE, padding: "10px 18px", borderRadius: 9999, textDecoration: "none" }}>
                        Add an innovation
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </a>
                    )}
                    {nextIncompleteStep === 3 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {GET_INVOLVED_LINKS.map((l) => (
                          <a
                            key={l.label}
                            href={`${BP}${l.href}`}
                            style={{ fontSize: 12, fontWeight: 600, color: ORANGE, background: "rgba(242,101,34,0.1)", padding: "8px 14px", borderRadius: 9999, textDecoration: "none" }}
                          >
                            {l.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, minWidth: 168 }} className="ib-dashboard-nextstep-checks">
                  {[
                    { label: "Build your profile", done: step1Done },
                    { label: "Your Innovations", done: step2Done },
                    { label: "Get Involved", done: step3Done },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: item.done ? DARK : "#6E685F" }}>
                      <span style={{ width: 17, height: 17, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: item.done ? "#1A6B3C" : "#fff", border: item.done ? "none" : "1.5px solid rgba(64,50,34,0.18)" }}>
                        {item.done && <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><path d="M20 6 9 17l-5-5" /></svg>}
                      </span>
                      {item.label}
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
              <div style={{ fontSize: 13.5, color: DARK }}>You&rsquo;re all set — your profile is built, your innovations are listed, and you&rsquo;re plugged into the ecosystem.</div>
            </div>
          )}

          {/* STAT ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }} className="ib-dashboard-stats">
            {STAT_TILES.map((s) => (
              <div key={s.label} style={{ ...cardStyle, padding: "18px 16px" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, color: DARK, letterSpacing: "-0.02em", marginBottom: 2 }}>{s.value ?? "…"}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: DARK, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#6E685F" }}>{s.note}</div>
              </div>
            ))}
          </div>

          {/* RECOMMENDED FOR YOU */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: DARK }}>Recommended for you</div>
              <a href={`${BP}/challenges/`} style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE, textDecoration: "none" }}>View all</a>
            </div>
            {recommended.length === 0 ? (
              <div style={{ fontSize: 13, color: "#6E685F" }}>Nothing new right now — check back soon.</div>
            ) : (
              <ScrollCarousel>
                {recommended.map((r) => {
                  const isSaved = savedKeys.has(`${REC_KIND_TO_SAVED_TYPE[r.kind]}:${r.refId}`);
                  return (
                  <a
                    key={r.key}
                    href={r.href}
                    className="ib-challenge-hover"
                    style={{ scrollSnapAlign: "start", flex: "0 0 240px", display: "block", position: "relative", background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 14, padding: 18, textDecoration: "none" }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: KIND_STYLE[r.kind].color, background: KIND_STYLE[r.kind].bg, padding: "4px 9px", borderRadius: 9999 }}>{r.kind}</span>
                      <button
                        type="button"
                        onClick={(e) => onToggleSave(r, e)}
                        aria-label={isSaved ? "Remove from saved" : "Save"}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0, lineHeight: 0 }}
                      >
                        <svg width={15} height={15} viewBox="0 0 24 24" fill={isSaved ? ORANGE : "none"} stroke={isSaved ? ORANGE : "#6E685F"} strokeWidth={1.8}><path d="M6 4h12v17l-6-4-6 4V4Z" /></svg>
                      </button>
                    </div>
                    <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: DARK, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.title}</h3>
                    <div style={{ fontSize: 11.5, color: "#6E685F", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.meta}</div>
                    {r.detail && <div style={{ fontSize: 11.5, color: "#5A544B" }}>{r.detail}</div>}
                  </a>
                  );
                })}
              </ScrollCarousel>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <div style={cardStyle}>
            <div style={{ fontSize: 15, fontWeight: 600, color: DARK, marginBottom: 14 }}>Your activity</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "My innovations", value: counts?.startups, href: "/dashboard/innovator/", icon: <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0 0 12 2Z" /> },
                { label: "Applications", value: counts?.applicationsSent, href: "/challenges/", icon: <path d="M9 12h6M9 16h6M9 8h6M6 3h9l3 3v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /> },
                { label: "Connections", value: counts?.connectionsReceived, href: "/dashboard/connections/", icon: <><circle cx={9} cy={8} r={3.5} /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx={17} cy={7} r={2.5} /></> },
                { label: "Saved items", value: savedKeys.size, href: undefined, icon: <path d="M6 4h12v17l-6-4-6 4V4Z" /> },
              ].map((a) => {
                const content = (
                  <>
                    <span style={{ width: 26, height: 26, borderRadius: 8, background: "#F6F2EA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#6E685F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{a.icon}</svg>
                    </span>
                    <span style={{ fontSize: 13, color: DARK, flex: 1 }}>{a.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{a.value ?? 0}</span>
                  </>
                );
                return a.href ? (
                  <a key={a.label} href={`${BP}${a.href}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>{content}</a>
                ) : (
                  <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>{content}</div>
                );
              })}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: DARK }}>Upcoming events</div>
              <a href={`${BP}/calendar/`} style={{ fontSize: 12, fontWeight: 600, color: ORANGE, textDecoration: "none" }}>View calendar</a>
            </div>
            {events.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "#6E685F" }}>No upcoming events yet — check the calendar.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {events.map((e) => {
                  const { month, day } = formatEventDate(e.event_date);
                  return (
                    <div key={e.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 42, textAlign: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: ORANGE, letterSpacing: "0.04em" }}>{month}</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: DARK, lineHeight: 1.1 }}>{day}</div>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                        <div style={{ fontSize: 11, color: "#6E685F" }}>{e.venue}{e.event_time ? ` · ${e.event_time}` : ""}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: 15, fontWeight: 600, color: DARK, marginBottom: 14 }}>Explore the ecosystem</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
              {EXPLORE_LINKS.map((l) => (
                <a key={l.label} href={`${BP}/ecosystem?tab=${encodeURIComponent(l.tab)}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, textDecoration: "none" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 9999, background: "rgba(242,101,34,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{l.icon}</svg>
                  </span>
                  <span style={{ fontSize: 10.5, color: "#5A544B", textAlign: "center" }}>{l.label}</span>
                </a>
              ))}
            </div>
            <a href={`${BP}/ecosystem/`} style={{ fontSize: 12, fontWeight: 600, color: ORANGE, textDecoration: "none" }}>Browse all →</a>
          </div>
        </div>
      </div>

      {/* HELP STRIP */}
      <div style={{ ...cardStyle, marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="ib-dashboard-help">
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, marginBottom: 2 }}>Need help or have questions?</div>
          <div style={{ fontSize: 12, color: "#6E685F" }}>Reach out to our team.</div>
        </div>
        <a href="mailto:incubatorbaguio63@gmail.com" style={{ textDecoration: "none" }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, marginBottom: 2 }}>Email us</div>
          <div style={{ fontSize: 12, color: "#6E685F" }}>incubatorbaguio63@gmail.com</div>
        </a>
        <a href={`${BP}/knowledge/`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none" }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, marginBottom: 2 }}>Visit Knowledge Hub</div>
            <div style={{ fontSize: 12, color: "#6E685F" }}>Guides, FAQs, and resources</div>
          </div>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6E685F" strokeWidth={2.2}><path d="m9 6 6 6-6 6" /></svg>
        </a>
      </div>
    </div>
  );
}
