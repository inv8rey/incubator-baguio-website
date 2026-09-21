import { supabase } from "./supabaseClient";
import { slugify } from "./slug";
import { SITE_URL } from "../app/seo";

export type SuggestionKind = "Challenge" | "Opportunity" | "Event" | "Organization" | "Resource";

export interface SuggestionItem {
  kind: SuggestionKind;
  refId: string;
  title: string;
  /** Auto-derived one-line context -- the editor is expected to review/
   * rewrite this before send, not ship it verbatim (see the plan's
   * "never a bare title + link" rule). */
  blurb: string;
  href: string;
  createdAt: string;
}

export interface SuggestedSection {
  sectionName: string;
  items: SuggestionItem[];
}

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Trims to a single-sentence-ish blurb so the compose UI doesn't show a wall of text next to a checkbox. */
function truncate(s: string, max = 140): string {
  const t = (s || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

/**
 * Candidate content for a newsletter issue, grouped into the newsletter's
 * own section taxonomy (see the plan doc) rather than notificationFeed.ts's
 * four content-type buckets -- adapted from that same file's pattern of
 * parallel-querying the platform's content tables and normalizing into one
 * shape, but with per-section logic suited to what actually belongs in a
 * curated digest:
 *
 * - Open Challenges & Opportunities: not `since`-gated -- a still-open
 *   challenge or funding call should keep surfacing as a candidate every
 *   issue until it closes, not just the issue it was first posted in.
 * - Upcoming Events: filtered to the future (event_date >= today), not by
 *   creation date -- a past event is never a useful suggestion regardless
 *   of when the row was created.
 * - Ecosystem Watch: genuinely `since`-gated (new orgs / new evergreen
 *   resources published since the last issue) -- this section is actually
 *   about "what's new."
 * - Community / Jobs / Get Involved: no automatic source exists yet in this
 *   codebase (no jobs board, no forum-highlight extraction) -- returned
 *   empty on purpose; the compose UI lets an editor add items to it by
 *   hand, and the template omits the section entirely when empty rather
 *   than padding it.
 *
 * This is a *candidate pool* for a human editor to pick from in the admin
 * "Compose Issue" screen -- never sent as-is.
 *
 * @param since ISO timestamp of the previous issue's sent_at. Omit to build
 *   the very first issue (Ecosystem Watch then just shows the most recent
 *   items instead of nothing).
 */
export async function fetchNewsletterSuggestions(since?: string): Promise<SuggestedSection[]> {
  if (!supabase) return [];
  const today = todayIso();

  const [openChallengesQ, openResourcesQ, eventsQ, orgsQ, evergreenResourcesQ] = await Promise.all([
    supabase
      .from("challenges")
      .select("id,title,category,summary,org_name,deadline_date")
      .eq("status", "Open")
      .order("deadline_date", { ascending: true, nullsFirst: false })
      .limit(6),
    supabase
      .from("knowledge_resources")
      .select("id,title,description,funding_amount,deadline_date,link_url,file_url")
      .eq("category", "Funding & Opportunities")
      .or(`deadline_date.is.null,deadline_date.gte.${today}`)
      .order("deadline_date", { ascending: true, nullsFirst: false })
      .limit(6),
    supabase
      .from("public_events")
      .select("id,title,org,category,event_date,venue,format")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(8),
    supabase
      .from("organizations")
      .select("id,name,org_type,description,slug,created_at")
      .eq("approval_status", "approved")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(since ? 6 : 4)
      .then((res) => (since ? { ...res, data: (res.data ?? []).filter((o: any) => o.created_at >= since) } : res)),
    supabase
      .from("knowledge_resources")
      .select("id,title,description,category,link_url,file_url,created_at")
      .in("category", ["Startup Resources", "Research & Innovation", "Policies & Reports"])
      .order("created_at", { ascending: false })
      .limit(since ? 6 : 4)
      .then((res) => (since ? { ...res, data: (res.data ?? []).filter((r: any) => r.created_at >= since) } : res)),
  ]);

  const challengeItems: SuggestionItem[] = (openChallengesQ.data ?? []).map((c: any) => ({
    kind: "Challenge",
    refId: c.id,
    title: c.title,
    blurb: truncate(c.summary) || `Posted by ${c.org_name || "an ecosystem partner"}.`,
    href: `${SITE_URL}/challenges/${slugify(c.title || c.id)}/`,
    createdAt: c.deadline_date || "",
  }));

  const opportunityItems: SuggestionItem[] = (openResourcesQ.data ?? []).map((r: any) => ({
    kind: "Opportunity",
    refId: r.id,
    title: r.title,
    blurb: truncate(r.funding_amount ? `${r.funding_amount}. ${r.description || ""}` : r.description),
    href: r.link_url || r.file_url || `${SITE_URL}/knowledge/?category=${encodeURIComponent("Funding & Opportunities")}`,
    createdAt: r.deadline_date || "",
  }));

  const eventItems: SuggestionItem[] = (eventsQ.data ?? []).map((e: any) => ({
    kind: "Event",
    refId: e.id,
    title: e.title,
    blurb: truncate([e.org, e.venue, e.format].filter(Boolean).join(" — ")),
    href: `${SITE_URL}/calendar/`,
    createdAt: e.event_date,
  }));

  const orgItems: SuggestionItem[] = (orgsQ.data ?? []).map((o: any) => ({
    kind: "Organization",
    refId: o.id,
    title: o.name,
    blurb: truncate(o.description) || `New ${o.org_type} in the Ecosystem directory.`,
    href: `${SITE_URL}/organizations/${o.slug}/`,
    createdAt: o.created_at,
  }));

  const resourceItems: SuggestionItem[] = (evergreenResourcesQ.data ?? []).map((r: any) => ({
    kind: "Resource",
    refId: r.id,
    title: r.title,
    blurb: truncate(r.description),
    href: r.link_url || r.file_url || `${SITE_URL}/knowledge/?category=${encodeURIComponent(r.category)}`,
    createdAt: r.created_at,
  }));

  return [
    { sectionName: "Open Challenges & Opportunities", items: [...challengeItems, ...opportunityItems] },
    { sectionName: "Upcoming Events", items: eventItems },
    { sectionName: "Ecosystem Watch", items: [...orgItems, ...resourceItems] },
    { sectionName: "Community / Jobs / Get Involved", items: [] },
  ];
}
