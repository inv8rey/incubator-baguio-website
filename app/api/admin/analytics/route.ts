import { requireAdmin } from "../../../../lib/requireAdmin";
import { postHogConfigured, runHogQL } from "../../../../lib/postHogQuery";

// Only these three windows are accepted. The value is interpolated straight
// into HogQL, so it must never come from the query string unvalidated.
const ALLOWED_DAYS = [7, 30, 90] as const;
type Days = (typeof ALLOWED_DAYS)[number];

function parseDays(raw: string | null): Days {
  const n = Number(raw);
  return (ALLOWED_DAYS as readonly number[]).includes(n) ? (n as Days) : 30;
}

// $current_url is what PostHogPageView (app/PostHogProvider.tsx) actually
// sends on every capture -- despite the name, it's already just the path
// (+ query string), e.g. "/challenges" or "/challenges?category=Government".
// Stripping the query string here groups those back into one page.
const totalsQuery = (d: Days) => `
  select
    countIf(timestamp >= now() - interval ${d} day) as views,
    countIf(timestamp >= now() - interval ${d * 2} day and timestamp < now() - interval ${d} day) as viewsPrev,
    uniqIf(person_id, timestamp >= now() - interval ${d} day) as visitors,
    uniqIf(person_id, timestamp >= now() - interval ${d * 2} day and timestamp < now() - interval ${d} day) as visitorsPrev
  from events
  where event = '$pageview'
`;

const dailyQuery = (d: Days) => `
  select toDate(timestamp) as day, count() as views, uniq(person_id) as visitors
  from events
  where event = '$pageview' and timestamp >= now() - interval ${d} day
  group by day
  order by day
`;

const topPagesQuery = (d: Days) => `
  select splitByChar('?', properties.$current_url)[1] as page, count() as views
  from events
  where event = '$pageview' and timestamp >= now() - interval ${d} day and page != ''
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

  const days = parseDays(new URL(req.url).searchParams.get("days"));

  try {
    const [totalsRows, dailyRows, pagesRows] = await Promise.all([
      runHogQL(totalsQuery(days)),
      runHogQL(dailyQuery(days)),
      runHogQL(topPagesQuery(days)),
    ]);

    const t = totalsRows[0] ?? [0, 0, 0, 0];
    const daily = dailyRows.map((r) => ({ day: String(r[0]).slice(0, 10), views: Number(r[1]) || 0, visitors: Number(r[2]) || 0 }));
    const topPages = pagesRows.map((r) => ({ page: String(r[0]) || "/", views: Number(r[1]) || 0 }));

    return Response.json({
      configured: true,
      days,
      totals: {
        views: Number(t[0]) || 0,
        viewsPrev: Number(t[1]) || 0,
        visitors: Number(t[2]) || 0,
        visitorsPrev: Number(t[3]) || 0,
      },
      daily,
      topPages,
    });
  } catch (err: any) {
    console.error("admin/analytics: PostHog query failed", err);
    return Response.json({ error: err.message || "Couldn't load traffic data from PostHog." }, { status: 502 });
  }
}
