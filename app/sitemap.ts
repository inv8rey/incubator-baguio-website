import type { MetadataRoute } from "next";
import { SITE_URL } from "./seo";
import { supabase } from "../lib/supabaseClient";
import { slugify } from "../lib/slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/about/", changeFrequency: "monthly", priority: 0.7 },
    { path: "/programs/", changeFrequency: "weekly", priority: 0.8 },
    { path: "/challenges/", changeFrequency: "daily", priority: 0.9 },
    { path: "/challenges/post/", changeFrequency: "monthly", priority: 0.5 },
    { path: "/knowledge/", changeFrequency: "weekly", priority: 0.6 },
    { path: "/ecosystem/", changeFrequency: "daily", priority: 0.9 },
    { path: "/calendar/", changeFrequency: "weekly", priority: 0.7 },
    { path: "/contact/", changeFrequency: "monthly", priority: 0.5 },
    { path: "/get-started/", changeFrequency: "monthly", priority: 0.6 },
    { path: "/login/", changeFrequency: "yearly", priority: 0.3 },
    { path: "/signup/", changeFrequency: "yearly", priority: 0.4 },
    { path: "/events/", changeFrequency: "weekly", priority: 0.6 },
    { path: "/search/", changeFrequency: "monthly", priority: 0.4 },
    { path: "/gallery/", changeFrequency: "weekly", priority: 0.5 },
    { path: "/community/", changeFrequency: "daily", priority: 0.6 },
    { path: "/terms/", changeFrequency: "yearly", priority: 0.3 },
    { path: "/privacy/", changeFrequency: "yearly", priority: 0.3 },
  ];

  const { data } = supabase ? await supabase.from("challenges").select("id,title") : { data: [] };
  const challengeRoutes = (data ?? []).map((c: { id: string; title: string }) => ({
    path: `/challenges/${slugify(c.title || c.id)}/`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Public organization profiles — approved and public only, matching what
  // app/organizations/[slug] will actually render.
  const { data: orgRows } = supabase
    ? await supabase.from("organizations").select("slug").eq("approval_status", "approved").eq("is_public", true)
    : { data: [] };
  const orgRoutes = (orgRows ?? []).map((o: { slug: string }) => ({
    path: `/organizations/${o.slug}/`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...challengeRoutes, ...orgRoutes].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
