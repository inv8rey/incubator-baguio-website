import { createClient } from "@supabase/supabase-js";

// Server-side only — never exposed to the browser (no NEXT_PUBLIC_ prefix).
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SYSTEM_PROMPT = `You are an analyst for Incubator Baguio, a city-run startup ecosystem alliance. You'll be given a JSON snapshot of the ecosystem's current stats (startups, founders, funding, sectors, stages, TBI affiliations, partner organizations, recent activity).

Write 3 to 5 short, specific, plain-English insights a program manager could act on. Each insight goes on its own line, starting with "• ". No markdown headers, no bold, no preamble, no closing summary — just the bullet lines. Reference actual numbers from the data. Call out things like fastest-growing or stalling sectors, funding concentration, stage distribution imbalances, or notable recent activity. If a metric is at zero or the data is too sparse to say something meaningful, skip it rather than inventing a trend.`;

// Verifies the request carries a valid Supabase session for a user whose
// profile has is_admin = true, so this paid third-party API call can't be
// triggered by an anonymous visitor hitting the endpoint directly.
async function isAdminRequest(req: Request): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return false;

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) return false;

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", userData.user.id).single();
  return !!profile?.is_admin;
}

export async function POST(req: Request) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    return Response.json({ error: "AI insights aren't configured yet." }, { status: 503 });
  }

  const authorized = await isAdminRequest(req);
  if (!authorized) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  let stats: unknown;
  try {
    stats = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const cfRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(stats) },
        ],
        max_tokens: 500,
      }),
    }
  );

  if (!cfRes.ok) {
    const detail = await cfRes.text().catch(() => "");
    return Response.json({ error: `Workers AI request failed (${cfRes.status}).`, detail }, { status: 502 });
  }

  const cfData = await cfRes.json();
  const text: string | undefined = cfData?.result?.response;
  if (!text) {
    return Response.json({ error: "Workers AI returned no response." }, { status: 502 });
  }

  const insights = text
    .split("\n")
    .map((line) => line.replace(/^[•\-*]\s*/, "").trim())
    .filter(Boolean);

  return Response.json({ insights });
}
