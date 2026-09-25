import { setupSchema, type SetupInput } from './schema';
import { sanitizeText } from './http';
import { PRIORITY_AREAS } from './agenda';

export function cacheKeyFor(i: SetupInput): string {
  return [i.project_type, i.program, i.level, i.priority_area, i.time_available ?? '', i.budget ?? ''].join('|').toLowerCase();
}

/** Sanitizes free text, then validates. Returns the input or a friendly error. */
export function parseSetup(raw: unknown): { ok: true; input: SetupInput; surprise: boolean } | { ok: false; error: string } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const surprise = r.priority_area === 'surprise';
  const cleaned = {
    ...r,
    program: sanitizeText(r.program, 120),
    partner_pref: sanitizeText(r.partner_pref, 200),
    skills: Array.isArray(r.skills) ? r.skills.map((s) => sanitizeText(s, 60)).filter(Boolean).slice(0, 5) : [],
    priority_area: surprise ? PRIORITY_AREAS[0].slug : r.priority_area,
  };
  const parsed = setupSchema.safeParse(cleaned);
  if (!parsed.success) return { ok: false, error: 'Please check your answers and try again.' };
  if (!PRIORITY_AREAS.some((a) => a.slug === parsed.data.priority_area)) return { ok: false, error: 'Please pick one of the priority areas.' };
  return { ok: true, input: parsed.data, surprise };
}

export function sessionInput(s: SetupInput & Record<string, unknown>): SetupInput {
  return {
    project_type: s.project_type,
    program: s.program,
    level: s.level,
    priority_area: s.priority_area,
    skills: s.skills ?? [],
    time_available: (s.time_available as SetupInput['time_available']) ?? null,
    budget: (s.budget as SetupInput['budget']) ?? null,
    partner_pref: (s.partner_pref as string) ?? '',
  };
}

export function ideaCoreFrom(row: Record<string, unknown>) {
  return {
    title: row.title as string,
    problem: row.problem as string,
    agenda_theme: (row.agenda_theme as string) ?? '',
    emerging: !!row.emerging,
    agenda_fit: row.agenda_fit as string,
    statutory_area: row.statutory_area as never,
    deliverable: row.deliverable as string,
    data_and_partners: (row.data_and_partners as never) ?? [],
    feasibility: row.feasibility as never,
    difficulty: row.difficulty as never,
    common_idea_warning: (row.common_idea_warning as string) ?? null,
    related_challenge_id: (row.related_challenge_id as string) ?? null,
  };
}

/** Public shape of an idea row: no device data, no session internals. */
export function publicIdea(row: Record<string, unknown>) {
  return { id: row.id, session_id: row.session_id, parent_idea_id: row.parent_idea_id ?? null, ...ideaCoreFrom(row) };
}
