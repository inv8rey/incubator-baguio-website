import type { MetadataRoute } from "next";
import { SITE_URL } from "./seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The admin panel is intentionally absent from this list: it now
        // lives at an unguessable, unlinked path (ADMIN_ROUTE_SLUG), and
        // robots.txt is public — a disallow entry would advertise exactly
        // the path it's supposed to hide.
        disallow: ["/dashboard", "/dashboard/", "/evaluation", "/evaluation/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
