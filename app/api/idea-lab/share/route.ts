import { findSharedByIdea, getIdea, shareIdea, storeConfigured } from '../../../../lib/idea-lab/store';
import { requireUser, LOGIN_REQUIRED } from '../../../../lib/idea-lab/auth';
import { json, sanitizeText } from '../../../../lib/idea-lab/http';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_RE = /(@|\d{7,}|https?:|www\.)/i;

// Shares an idea with Incubator Baguio. It stays private until staff approve it.
export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return json({ error: LOGIN_REQUIRED, code: 'login' }, 401);
  let body: { ideaId?: string; showName?: boolean; displayName?: string; school?: string; email?: string; consent?: boolean; hp?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Bad request.' }, 400);
  }
  if (body.hp) return json({ error: 'Please try again.' }, 400);
  if (!storeConfigured()) return json({ error: 'Sharing is not open yet.', code: 'not_configured' }, 503);

  const idea = body.ideaId ? await getIdea(body.ideaId) : null;
  if (!idea) return json({ error: 'That idea was not found.' }, 404);
  if (await findSharedByIdea(idea.id)) return json({ ok: true, already: true });

  const email = sanitizeText(body.email, 254).toLowerCase();
  if (email && !EMAIL_RE.test(email)) return json({ error: 'That email address does not look right.' }, 400);
  if (!body.consent) return json({ error: 'Please tick the box to share your idea.' }, 400);

  const showName = !!body.showName;
  const displayName = showName ? sanitizeText(body.displayName, 80) : '';
  const school = showName ? sanitizeText(body.school, 120) : '';
  const flags: string[] = [];
  if (CONTACT_RE.test(displayName) || CONTACT_RE.test(school)) flags.push('contact details in the name or school');

  await shareIdea({
    idea_id: idea.id,
    show_name: showName && !!displayName,
    display_name: displayName || null,
    school: school || null,
    contact_email: email || null,
    moderator_note: flags.length ? `Auto-flag: ${flags.join(', ')}` : null,
  });
  return json({ ok: true });
}
