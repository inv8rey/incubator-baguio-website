import { supabase } from "../../lib/supabaseClient";
import { slugify } from "../../lib/slug";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export type ActivityKind = "Challenge" | "Resource" | "Event" | "Organization";

export const ACTIVITY_KIND_STYLE: Record<ActivityKind, { color: string; bg: string }> = {
  Challenge: { color: "#D9531E", bg: "rgba(217,83,30,0.12)" },
  Resource: { color: "#285E7A", bg: "rgba(40,94,122,0.12)" },
  Event: { color: "#6B5BD6", bg: "rgba(107,91,214,0.12)" },
  Organization: { color: "#1A6B3C", bg: "rgba(26,107,60,0.12)" },
};

export interface ActivityItem {
  key: string;
  kind: ActivityKind;
  title: string;
  tag: string;
  href: string;
  createdAt: string;
}

export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * The four content types worth surfacing as "new on the platform" --
 * matches the four headline stat tiles on the Dashboard Overview (Open
 * Challenges, Opportunities/Resources, Ecosystem Organizations) plus the
 * calendar. Deliberately not wider than this: an activity feed that
 * includes every connection request or profile edit stops being something
 * anyone scans.
 *
 * @param since  Only rows created after this ISO timestamp. Omit for "just
 *               the most recent items regardless of read state" (the
 *               always-on Dashboard Overview card); pass it for "what's new
 *               since I last checked" (the header bell's unread count).
 * @param limit  Cap per content type before merging -- not a cap on the
 *               final list, so passing a small `limit` with a wide `since`
 *               window can still undercount how much is actually new. The
 *               bell only needs an accurate *count is-nonzero* signal
 *               plus a handful of examples, not a complete accounting.
 */
export async function fetchActivity(since?: string, limit = 8): Promise<ActivityItem[]> {
  if (!supabase) return [];

  let challengeQ = supabase.from("challenges").select("id,title,category,created_at").order("created_at", { ascending: false }).limit(limit);
  let resourceQ = supabase.from("knowledge_resources").select("id,title,category,created_at").order("created_at", { ascending: false }).limit(limit);
  let eventQ = supabase.from("public_events").select("id,title,category,created_at").order("created_at", { ascending: false }).limit(limit);
  let orgQ = supabase
    .from("organizations")
    .select("id,name,org_type,slug,created_at")
    .eq("approval_status", "approved")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (since) {
    challengeQ = challengeQ.gte("created_at", since);
    resourceQ = resourceQ.gte("created_at", since);
    eventQ = eventQ.gte("created_at", since);
    orgQ = orgQ.gte("created_at", since);
  }

  const [{ data: challengeRows }, { data: resourceRows }, { data: eventRows }, { data: orgRows }] = await Promise.all([challengeQ, resourceQ, eventQ, orgQ]);

  const items: ActivityItem[] = [
    ...(challengeRows ?? []).map((c: any) => ({
      key: `challenge-${c.id}`,
      kind: "Challenge" as const,
      title: c.title,
      tag: c.category || "Challenge",
      href: `${BP}/challenges/${slugify(c.title || c.id)}/`,
      createdAt: c.created_at,
    })),
    ...(resourceRows ?? []).map((r: any) => ({
      key: `resource-${r.id}`,
      kind: "Resource" as const,
      title: r.title,
      tag: r.category || "Knowledge Hub",
      href: `${BP}/knowledge/`,
      createdAt: r.created_at,
    })),
    ...(eventRows ?? []).map((e: any) => ({
      key: `event-${e.id}`,
      kind: "Event" as const,
      title: e.title,
      tag: e.category || "Event",
      href: `${BP}/calendar/`,
      createdAt: e.created_at,
    })),
    ...(orgRows ?? []).map((o: any) => ({
      key: `org-${o.id}`,
      kind: "Organization" as const,
      title: o.name,
      tag: o.org_type || "Organization",
      href: `${BP}/organizations/${o.slug}/`,
      createdAt: o.created_at,
    })),
  ];

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
