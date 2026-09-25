import { requireUser, LOGIN_REQUIRED } from '../../../../lib/idea-lab/auth';
import { llmConfigured, makeNote, modelName } from '../../../../lib/idea-lab/llm';
import { bumpLimit, getIdea, getNote, getSession, recordUsage, saveNote, storeConfigured, tokensToday } from '../../../../lib/idea-lab/store';
import { DAILY_LIMIT, DAILY_TOKEN_BUDGET, limitMessage, json, sanitizeText } from '../../../../lib/idea-lab/http';
import { ideaCoreFrom, publicIdea, sessionInput } from '../../../../lib/idea-lab/service';
import { noteSchema } from '../../../../lib/idea-lab/schema';
import { NOTE_DISCLAIMER } from '../../../../lib/idea-lab/programs';

export const maxDuration = 60;

const withDisclaimer = (bg: string) => (bg.startsWith(NOTE_DISCLAIMER) ? bg : `${NOTE_DISCLAIMER} ${bg}`);

// GET ?ideaId= : the saved note (and its idea), if any.
export async function GET(req: Request) {
  const user = await requireUser(req);
  if (!user) return json({ error: LOGIN_REQUIRED, code: 'login' }, 401);
  const ideaId = new URL(req.url).searchParams.get('ideaId') || '';
  if (!/^[0-9a-f-]{36}$/i.test(ideaId)) return json({ error: 'Not found.' }, 404);
  const idea = await getIdea(ideaId);
  if (!idea) return json({ error: 'That idea was not found.' }, 404);
  return json({ idea: publicIdea(idea as unknown as Record<string, unknown>), note: await getNote(ideaId) });
}

// POST {ideaId}: creates the note (half a generation), or returns the existing one.
export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return json({ error: LOGIN_REQUIRED, code: 'login' }, 401);
  let body: { ideaId?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Bad request.' }, 400);
  }
  const idea = body.ideaId ? await getIdea(body.ideaId) : null;
  const session = idea ? await getSession(idea.session_id) : null;
  if (!idea || !session) return json({ error: 'That idea was not found.' }, 404);
  const existing = await getNote(idea.id);
  if (existing) return json({ note: existing });

  if (!llmConfigured() || !storeConfigured()) return json({ error: 'Idea Lab is not open yet. Please check back soon.', code: 'not_configured' }, 503);
  // Past the daily AI budget the template generator serves instead, so Idea Lab stays up.
  const useAi = (await tokensToday()) < DAILY_TOKEN_BUDGET;
  const hash = user.key;
  // Limits are per account and per category: 3 capstone, 3 thesis, 3 startup generations a day.
  const bucket = `${user.key}|${session.project_type}`;
  const limit = await bumpLimit(bucket, 0.5, DAILY_LIMIT);
  if (!limit.ok) return json({ error: limitMessage, code: 'limit' }, 429);

  try {
    const { note, usage } = await makeNote({ useAi, input: sessionInput(session as never), idea: ideaCoreFrom(idea as unknown as Record<string, unknown>) as never });
    const safe = { ...note, background: withDisclaimer(note.background) };
    await saveNote(idea.id, safe);
    await recordUsage({ device_hash: hash, kind: 'note', model: modelName(), input_tokens: usage.input_tokens, output_tokens: usage.output_tokens, session_id: session.id });
    return json({ note: safe });
  } catch (err) {
    console.error('idea-lab note failed:', err instanceof Error ? err.message : err);
    await bumpLimit(bucket, -0.5, DAILY_LIMIT).catch(() => {});
    return json({ error: 'We could not write the outline right now. Please try again.' }, 502);
  }
}

// PUT {ideaId, note}: saves the user's edits to their note. Editing does not use the model.
export async function PUT(req: Request) {
  const user = await requireUser(req);
  if (!user) return json({ error: LOGIN_REQUIRED, code: 'login' }, 401);
  let body: { ideaId?: string; note?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Bad request.' }, 400);
  }
  const idea = body.ideaId ? await getIdea(body.ideaId) : null;
  if (!idea) return json({ error: 'That idea was not found.' }, 404);
  const parsed = noteSchema.safeParse(body.note);
  if (!parsed.success) return json({ error: 'Some fields are empty or too long.' }, 400);
  const note = { ...parsed.data, working_title: sanitizeText(parsed.data.working_title, 200), background: withDisclaimer(parsed.data.background) };
  await saveNote(idea.id, note);
  return json({ note });
}
