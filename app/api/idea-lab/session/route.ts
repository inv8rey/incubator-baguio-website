import { requireUser, LOGIN_REQUIRED } from '../../../../lib/idea-lab/auth';
import { llmConfigured, modelName } from '../../../../lib/idea-lab/llm';
import { storeConfigured, createSession, leastRepresentedArea } from '../../../../lib/idea-lab/store';
import { json } from '../../../../lib/idea-lab/http';
import { parseSetup } from '../../../../lib/idea-lab/service';

// Creates a session from the setup form. No model call happens here, and it
// does not count against the daily limit: only generating does.
export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return json({ error: LOGIN_REQUIRED, code: 'login' }, 401);
  let body: { input?: unknown; hp?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Bad request.' }, 400);
  }
  if (body.hp) return json({ error: 'Please try again.' }, 400);
  if (!llmConfigured() || !storeConfigured()) return json({ error: 'Idea Lab is not open yet. Please check back soon.', code: 'not_configured' }, 503);

  const parsed = parseSetup(body.input);
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  const input = parsed.surprise ? { ...parsed.input, priority_area: await leastRepresentedArea() } : parsed.input;
  const session = await createSession(input, user.key, modelName());
  return json({ id: session.id, priority_area: input.priority_area });
}
