import type { MetadataRoute } from "next";
import { SITE_URL } from "./seo";
import { CHALLENGES } from "./challenges/data";

export default function sitemap(): MetadataRoute.Sitemap {
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
  ];

  const challengeRoutes = CHALLENGES.map((c) => ({
    path: `/challenges/${c.id}/`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...challengeRoutes].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
