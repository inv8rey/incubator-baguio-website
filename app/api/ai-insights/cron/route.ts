import { generateAndCacheInsights } from "../../../../lib/aiInsightsGenerator";

// Hit once daily at 7:30am Asia/Manila by Vercel Cron (see vercel.json).
// Vercel automatically sends `Authorization: Bearer $CRON_SECRET` on its own
// scheduled invocations when CRON_SECRET is set, so this route stays closed
// to anyone else who finds the URL.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await generateAndCacheInsights("cron");
    return Response.json(result);
  } catch (err: any) {
    return Response.json({ error: err.message || "Couldn't generate insights." }, { status: 502 });
  }
}
