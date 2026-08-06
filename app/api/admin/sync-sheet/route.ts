import { requireAdmin } from "../../../../lib/requireAdmin";
import { sheetsConfigured } from "../../../../lib/googleSheets";
import { syncStartupsToSheet, syncProgramsToSheet, syncEventsToSheet } from "../../../../lib/sheetSync";

const SYNCERS = {
  startups: syncStartupsToSheet,
  programs: syncProgramsToSheet,
  events: syncEventsToSheet,
} as const;

type Table = keyof typeof SYNCERS;

export async function POST(req: Request) {
  const { authorized, supabase } = await requireAdmin(req);
  if (!authorized || !supabase) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  let body: { table?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const table = body.table as Table;
  if (!table || !(table in SYNCERS)) {
    return Response.json({ error: "table must be one of startups, programs, events." }, { status: 400 });
  }

  if (!sheetsConfigured()) {
    return Response.json({ synced: false, reason: "Google Sheets isn't configured yet." });
  }

  try {
    const rows = await SYNCERS[table](supabase);
    return Response.json({ synced: true, rows });
  } catch (err: any) {
    // A Sheets hiccup is logged for diagnosis but never surfaced as a
    // failure of the admin edit itself -- the Supabase write already
    // succeeded and is the thing that actually matters.
    console.error(`sync-sheet failed for ${table}:`, err.message);
    return Response.json({ synced: false, reason: err.message });
  }
}
