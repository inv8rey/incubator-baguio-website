import { createClient } from "@supabase/supabase-js";
import { generateAndCacheInsights } from "../../../lib/aiInsightsGenerator";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function supabaseAsCaller(token: string) {
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

// Verifies the request carries a valid Supabase session for a user whose
// profile has is_admin = true, so this paid third-party API call can't be
// triggered by an anonymous visitor hitting the endpoint directly.
async function requireAdmin(req: Request): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return false;

  const supabase = supabaseAsCaller(token);
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) return false;

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", userData.user.id).single();
  return !!profile?.is_admin;
}

// Reads the most recently cached insights (written by the daily cron job or
// a previous "Regenerate" click) instead of calling the model on page load.
export async function GET(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return Response.json({ error: "The backend isn't configured yet." }, { status: 503 });
  }
  const authorized = await requireAdmin(req);
  if (!authorized) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const supabase = supabaseAsCaller(token);

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
  const authorized = await requireAdmin(req);
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
