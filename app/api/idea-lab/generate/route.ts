import { requireUser, LOGIN_REQUIRED } from '../../../../lib/idea-lab/auth';
import { generateIdeas, llmConfigured, modelName } from '../../../../lib/idea-lab/llm';
import { bumpLimit, cachedIdeas, getSession, insertIdea, listIdeas, recordUsage, storeConfigured, tokensToday } from '../../../../lib/idea-lab/store';
import { DAILY_LIMIT, DAILY_TOKEN_BUDGET, LIMIT_MESSAGE, json } from '../../../../lib/idea-lab/http';
import { cacheKeyFor, ideaCoreFrom, publicIdea, sessionInput } from '../../../../lib/idea-lab/service';

export const maxDuration = 60;

const COUNT = 5;
const CACHED = 2;

// Streams newline-delimited JSON events: {type:'idea'|'done'|'error', ...}.
// Each generate call costs one of the device's daily generations.
export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return json({ error: LOGIN_REQUIRED, code: 'login' }, 401);
  let body: { sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Bad request.' }, 400);
  }
  if (!llmConfigured() || !storeConfigured()) return json({ error: 'Idea Lab is not open yet. Please check back soon.', code: 'not_configured' }, 503);
  const session = body.sessionId ? await getSession(body.sessionId) : null;
  if (!session) return json({ error: 'That session was not found. Please start again.' }, 404);

  // Past the daily AI budget the template generator serves instead, so Idea Lab stays up.
  const useAi = (await tokensToday()) < DAILY_TOKEN_BUDGET;
  const hash = user.key;
  const limit = await bumpLimit(hash, 1, DAILY_LIMIT);
  if (!limit.ok) return json({ error: LIMIT_MESSAGE, code: 'limit' }, 429);

  const input = sessionInput(session as never);
  const key = cacheKeyFor(input);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (o: unknown) => controller.enqueue(encoder.encode(JSON.stringify(o) + '\n'));
      let produced = 0;
      try {
        const existing = await listIdeas(session.id);
        const avoid = existing.map((i) => i.title);

        // Two cached ideas this device has not seen, then fresh ones for the rest.
        const cached = existing.length === 0 ? await cachedIdeas(key, hash, CACHED) : [];
        for (const c of cached) {
          const row = await insertIdea(session.id, ideaCoreFrom(c as unknown as Record<string, unknown>) as never, { cache_key: key });
          avoid.push(row.title);
          produced++;
          send({ type: 'idea', idea: publicIdea(row as unknown as Record<string, unknown>) });
        }

        const usage = await generateIdeas({ useAi,
          input,
          count: COUNT - cached.length,
          seed: crypto.randomUUID(),
          avoidTitles: avoid,
          onIdea: async (idea) => {
            const row = await insertIdea(session.id, idea, { cache_key: key });
            produced++;
            send({ type: 'idea', idea: publicIdea(row as unknown as Record<string, unknown>) });
          },
        });
        await recordUsage({ device_hash: hash, kind: 'generate', model: modelName(), input_tokens: usage.input_tokens, output_tokens: usage.output_tokens, session_id: session.id });
        send({ type: 'done' });
      } catch (err) {
        console.error('idea-lab generate failed:', err instanceof Error ? err.message : err);
        if (produced === 0) await bumpLimit(hash, -1, DAILY_LIMIT).catch(() => {});
        send({ type: 'error', message: produced > 0 ? 'Some ideas could not be generated. Try again for more.' : 'We could not generate ideas right now. Please try again.' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' } });
}
