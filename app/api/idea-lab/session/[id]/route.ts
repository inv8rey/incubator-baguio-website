import { getSession, listIdeas, getNote } from '../../../../../lib/idea-lab/store';
import { json } from '../../../../../lib/idea-lab/http';
import { publicIdea } from '../../../../../lib/idea-lab/service';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Not found.' }, 404);
  const session = await getSession(id);
  if (!session) return json({ error: 'That session was not found. It may have expired.' }, 404);
  const ideas = await listIdeas(id);
  const notes = await Promise.all(ideas.map(async (i) => [i.id, !!(await getNote(i.id))] as const));
  return json({
    session: {
      id: session.id,
      project_type: session.project_type,
      program: session.program,
      level: session.level,
      priority_area: session.priority_area,
      skills: session.skills,
      time_available: session.time_available,
      budget: session.budget,
      partner_pref: session.partner_pref,
    },
    ideas: ideas.map((i) => publicIdea(i as unknown as Record<string, unknown>)),
    notes: Object.fromEntries(notes),
  });
}
