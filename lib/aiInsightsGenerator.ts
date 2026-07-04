import { createClient } from "@supabase/supabase-js";
import { computeAiStats, type MentorRow, type OrgRow, type ProfileRow, type StartupRow, type SubmissionRow } from "./dashboardStats";
import { CHALLENGES as STATIC_CHALLENGES } from "../app/challenges/data";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SYSTEM_PROMPT = `You are an analyst for Incubator Baguio, a city-run startup ecosystem alliance. You'll be given a JSON snapshot of the ecosystem's current stats (startups, founders, funding, sectors, stages, TBI affiliations, partner organizations, recent activity).

Write 3 to 5 short, specific, plain-English insights a program manager could act on. Each insight goes on its own line, starting with "• ". No markdown headers, no bold, no preamble, no closing summary — just the bullet lines. Reference actual numbers from the data. Call out things like fastest-growing or stalling sectors, funding concentration, stage distribution imbalances, or notable recent activity. If a metric is at zero or the data is too sparse to say something meaningful, skip it rather than inventing a trend.`;

// Shared by the admin-triggered "Regenerate" POST and the daily cron job —
// fetches fresh rows, computes the same stats shape the dashboard shows,
// asks Workers AI to summarize them, then caches the result so the
// dashboard never has to call the (paid) model just to render a page load.
export async function generateAndCacheInsights(source: "cron" | "manual") {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("The backend isn't configured yet.");
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) throw new Error("AI insights aren't configured yet.");

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const [s, m, o, p, c] = await Promise.all([
    supabase.from("startups").select("id,name,sector,lifecycle_stage,tbi_affiliation,funding_raised,created_at"),
    supabase.from("mentors").select("id,name,created_at"),
    supabase.from("organizations").select("id,name,org_type,created_at"),
    supabase.from("profiles").select("id,created_at"),
    supabase.from("challenge_submissions").select("id,title,org_name,created_at"),
  ]);

  const stats = computeAiStats({
    startups: (s.data as StartupRow[]) ?? [],
    mentors: (m.data as MentorRow[]) ?? [],
    orgs: (o.data as OrgRow[]) ?? [],
    profiles: (p.data as ProfileRow[]) ?? [],
    submissions: (c.data as SubmissionRow[]) ?? [],
    staticChallengesCount: STATIC_CHALLENGES.length,
  });

  const cfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(stats) },
      ],
      max_tokens: 500,
    }),
  });

  if (!cfRes.ok) {
    const detail = await cfRes.text().catch(() => "");
    throw new Error(`Workers AI request failed (${cfRes.status}). ${detail}`);
  }

  const cfData = await cfRes.json();
  const text: string | undefined = cfData?.result?.response;
  if (!text) throw new Error("Workers AI returned no response.");

  const insights = text
    .split("\n")
    .map((line) => line.replace(/^[•\-*]\s*/, "").trim())
    .filter(Boolean);

  const generatedAt = new Date().toISOString();
  const { error: insertErr } = await supabase.from("ai_insights").insert({ insights, source, generated_at: generatedAt });
  if (insertErr) throw new Error(`Generated insights but failed to cache them: ${insertErr.message}`);

  return { insights, source, generatedAt };
}
