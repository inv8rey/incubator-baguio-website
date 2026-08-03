import { requireAdmin } from "../../../../../lib/requireAdmin";
import { processChatbotDocument } from "../../../../../lib/chatbotDocumentPipeline";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { authorized, supabase } = await requireAdmin(req);
  if (!authorized || !supabase) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  let body: { documentId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.documentId) {
    return Response.json({ error: "documentId is required." }, { status: 400 });
  }

  try {
    const result = await processChatbotDocument(body.documentId, supabase);
    return Response.json(result);
  } catch (err: any) {
    // The document row already carries the failure state (status: 'error',
    // error_message) — return 200 with an error payload rather than 500 so
    // the admin UI's realtime subscription (not this response) is the
    // source of truth for the row's status.
    return Response.json({ error: err.message || "Couldn't process the document." });
  }
}
