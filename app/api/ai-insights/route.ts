import { generateAndCacheInsights } from "../../../lib/aiInsightsGenerator";
import { requireAdmin } from "../../../lib/requireAdmin";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Reads the most recently cached insights (written by the daily cron job or
// a previous "Regenerate" click) instead of calling the model on page load.
export async function GET(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return Response.json({ error: "The backend isn't configured yet." }, { status: 503 });
  }
  const { authorized, supabase } = await requireAdmin(req);
  if (!authorized || !supabase) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("ai_insights")
    .select("insights,source,generated_at")
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return Response.json({ insights: [], source: null, generatedAt: null });
  }
  return Response.json({ insights: data.insights, source: data.source, generatedAt: data.generated_at });
}

// Admin-triggered "Regenerate" — a real-time call to Workers AI, unlike GET.
export async function POST(req: Request) {
  const { authorized } = await requireAdmin(req);
  if (!authorized) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const result = await generateAndCacheInsights("manual");
    return Response.json(result);
  } catch (err: any) {
    return Response.json({ error: err.message || "Couldn't generate insights." }, { status: 502 });
  }
}
