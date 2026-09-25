import { requireUser, LOGIN_REQUIRED } from '../../../../lib/idea-lab/auth';
import { llmConfigured, modelName, refineIdea } from '../../../../lib/idea-lab/llm';
import { bumpLimit, getIdea, getSession, insertIdea, recordUsage, storeConfigured, tokensToday } from '../../../../lib/idea-lab/store';
import { DAILY_LIMIT, DAILY_TOKEN_BUDGET, LIMIT_MESSAGE, json, sanitizeText } from '../../../../lib/idea-lab/http';
import { cacheKeyFor, ideaCoreFrom, publicIdea, sessionInput } from '../../../../lib/idea-lab/service';
import { REFINE_PRESETS } from '../../../../lib/idea-lab/programs';

export const maxDuration = 60;

// Rewrites one idea. Costs half a generation. The new idea points at its parent.
export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return json({ error: LOGIN_REQUIRED, code: 'login' }, 401);
  let body: { ideaId?: string; preset?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Bad request.' }, 400);
  }
  if (!llmConfigured() || !storeConfigured()) return json({ error: 'Idea Lab is not open yet. Please check back soon.', code: 'not_configured' }, 503);

  const preset = (REFINE_PRESETS as readonly string[]).includes(body.preset ?? '') ? body.preset! : '';
  const instruction = [preset, sanitizeText(body.text, 200)].filter(Boolean).join('. ');
  if (!instruction) return json({ error: 'Pick a refinement or write a short note.' }, 400);

  const idea = body.ideaId ? await getIdea(body.ideaId) : null;
  const session = idea ? await getSession(idea.session_id) : null;
  if (!idea || !session) return json({ error: 'That idea was not found.' }, 404);

  // Past the daily AI budget the template generator serves instead, so Idea Lab stays up.
  const useAi = (await tokensToday()) < DAILY_TOKEN_BUDGET;
  const hash = user.key;
  const limit = await bumpLimit(hash, 0.5, DAILY_LIMIT);
  if (!limit.ok) return json({ error: LIMIT_MESSAGE, code: 'limit' }, 429);

  try {
    const input = sessionInput(session as never);
    const { idea: next, usage } = await refineIdea({ useAi, input, base: ideaCoreFrom(idea as unknown as Record<string, unknown>) as never, instruction, seed: crypto.randomUUID() });
    const row = await insertIdea(session.id, next, { parent_idea_id: idea.id, cache_key: cacheKeyFor(input) });
    await recordUsage({ device_hash: hash, kind: 'refine', model: modelName(), input_tokens: usage.input_tokens, output_tokens: usage.output_tokens, session_id: session.id });
    return json({ idea: publicIdea(row as unknown as Record<string, unknown>) });
  } catch (err) {
    console.error('idea-lab refine failed:', err instanceof Error ? err.message : err);
    await bumpLimit(hash, -0.5, DAILY_LIMIT).catch(() => {});
    return json({ error: 'We could not refine that idea right now. Please try again.' }, 502);
  }
}
