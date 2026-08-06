// Server-only. Mirrors admin edits (startups, programs, events) out to a
// Google Sheet for staff who want to read/export the data outside the admin
// panel. One-way only -- nothing here ever reads the sheet back into the
// site, so edits made directly in the sheet have no effect and get
// overwritten by the next sync. Auth uses a Google service-account key
// (not OAuth), so the sheet must be shared with the service account's
// email as Editor.
import { JWT } from "google-auth-library";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export function sheetsConfigured(): boolean {
  return !!(SPREADSHEET_ID && SERVICE_ACCOUNT_EMAIL && SERVICE_ACCOUNT_PRIVATE_KEY);
}

let cachedClient: JWT | null = null;

function getClient(): JWT {
  if (!SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_PRIVATE_KEY) {
    throw new Error("Google Sheets isn't configured (missing service account credentials).");
  }
  if (!cachedClient) {
    cachedClient = new JWT({ email: SERVICE_ACCOUNT_EMAIL, key: SERVICE_ACCOUNT_PRIVATE_KEY, scopes: SCOPES });
  }
  return cachedClient;
}

/**
 * Fully replaces the contents of one sheet tab with a header row plus data
 * rows -- clear-then-write rather than diffing individual rows, since these
 * tables are small and this keeps the sheet always an exact mirror of
 * Supabase (including deletes) with no row-number bookkeeping.
 */
export async function writeSheetTab(tabName: string, headers: string[], rows: unknown[][]): Promise<void> {
  if (!SPREADSHEET_ID) {
    throw new Error("Google Sheets isn't configured (missing GOOGLE_SHEETS_SPREADSHEET_ID).");
  }
  const client = getClient();
  const { token } = await client.getAccessToken();
  if (!token) throw new Error("Couldn't obtain a Google API access token.");

  const range = encodeURIComponent(`${tabName}!A1:ZZ`);
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`;

  const clearRes = await fetch(`${base}:clear`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  if (!clearRes.ok) {
    const body = await clearRes.json().catch(() => null);
    throw new Error(body?.error?.message || `Failed to clear "${tabName}" tab (${clearRes.status}).`);
  }

  const updateRange = encodeURIComponent(`${tabName}!A1`);
  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${updateRange}?valueInputOption=RAW`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ range: `${tabName}!A1`, values: [headers, ...rows] }),
  });
  if (!updateRes.ok) {
    const body = await updateRes.json().catch(() => null);
    throw new Error(body?.error?.message || `Failed to write "${tabName}" tab (${updateRes.status}).`);
  }
}
