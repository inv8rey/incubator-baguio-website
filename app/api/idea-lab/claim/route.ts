import { addClaim, getIdea, getShared, storeConfigured } from '../../../../lib/idea-lab/store';
import { requireUser, LOGIN_REQUIRED } from '../../../../lib/idea-lab/auth';
import { json, sanitizeText } from '../../../../lib/idea-lab/http';
import { notifyStaffOfClaim } from '../../../../lib/idea-lab/notify';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Someone (a student, school, barangay, or MSME) says they want to take on a shared idea.
export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return json({ error: LOGIN_REQUIRED, code: 'login' }, 401);
  let body: { sharedId?: string; email?: string; message?: string; hp?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Bad request.' }, 400);
  }
  if (body.hp) return json({ error: 'Please try again.' }, 400);
  if (!storeConfigured()) return json({ error: 'Claiming is not open yet.', code: 'not_configured' }, 503);

  const shared = body.sharedId ? await getShared(body.sharedId) : null;
  if (!shared || shared.status !== 'approved') return json({ error: 'That idea is not available.' }, 404);
  const email = sanitizeText(body.email, 254).toLowerCase();
  if (email && !EMAIL_RE.test(email)) return json({ error: 'That email address does not look right.' }, 400);
  const message = sanitizeText(body.message, 400);
  if (!email && !message) return json({ error: 'Add an email or a short message so we can follow up.' }, 400);

  await addClaim({ shared_idea_id: shared.id, contact_email: email || null, message: message || null });
  const idea = await getIdea(shared.idea_id);
  await notifyStaffOfClaim({ ideaTitle: idea?.title ?? 'A shared idea', email: email || null, message: message || null });
  return json({ ok: true });
}
