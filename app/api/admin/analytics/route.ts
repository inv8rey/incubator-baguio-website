import { requireAdmin } from "../../../../lib/requireAdmin";
import { postHogConfigured, runHogQL } from "../../../../lib/postHogQuery";

// $current_url is what PostHogPageView (app/PostHogProvider.tsx) actually
// sends on every capture -- despite the name, it's already just the path
// (+ query string), e.g. "/challenges" or "/challenges?category=Government".
// Stripping the query string here groups those back into one page.
const TOTALS_QUERY = `
  select
    countIf(timestamp >= now() - interval 30 day) as views30,
    countIf(timestamp >= now() - interval 60 day and timestamp < now() - interval 30 day) as viewsPrev30,
    uniqIf(person_id, timestamp >= now() - interval 30 day) as visitors30,
    uniqIf(person_id, timestamp >= now() - interval 60 day and timestamp < now() - interval 30 day) as visitorsPrev30
  from events
  where event = '$pageview'
`;

const DAILY_QUERY = `
  select toDate(timestamp) as day, count() as views, uniq(person_id) as visitors
  from events
  where event = '$pageview' and timestamp >= now() - interval 30 day
  group by day
  order by day
`;

const TOP_PAGES_QUERY = `
  select splitByChar('?', properties.$current_url)[1] as page, count() as views
  from events
  where event = '$pageview' and timestamp >= now() - interval 30 day and page != ''
  group by page
  order by views desc
  limit 8
`;

export async function GET(req: Request) {
  const { authorized } = await requireAdmin(req);
  if (!authorized) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  if (!postHogConfigured()) {
    return Response.json({ configured: false });
  }

  try {
    const [totalsRows, dailyRows, pagesRows] = await Promise.all([
      runHogQL(TOTALS_QUERY),
      runHogQL(DAILY_QUERY),
      runHogQL(TOP_PAGES_QUERY),
    ]);

    const t = totalsRows[0] ?? [0, 0, 0, 0];
    const daily = dailyRows.map((r) => ({ day: String(r[0]).slice(0, 10), views: Number(r[1]) || 0, visitors: Number(r[2]) || 0 }));
    const topPages = pagesRows.map((r) => ({ page: String(r[0]) || "/", views: Number(r[1]) || 0 }));

    return Response.json({
      configured: true,
      totals: {
        views30: Number(t[0]) || 0,
        viewsPrev30: Number(t[1]) || 0,
        visitors30: Number(t[2]) || 0,
        visitorsPrev30: Number(t[3]) || 0,
      },
      daily,
      topPages,
    });
  } catch (err: any) {
    console.error("admin/analytics: PostHog query failed", err);
    return Response.json({ error: err.message || "Couldn't load traffic data from PostHog." }, { status: 502 });
  }
}
