import { z } from 'zod';
import { PRIORITY_AREAS, STATUTORY_AREAS, areaBySlug } from './agenda';

const str = (max: number) => z.string().trim().min(1).max(max);

export const ideaSchema = z.object({
  title: str(140),
  problem: str(900),
  agenda_theme: str(120),
  emerging: z.boolean().default(false),
  agenda_fit: str(400),
  statutory_area: z.enum(STATUTORY_AREAS),
  deliverable: str(900),
  data_and_partners: z
    .array(z.object({ label: str(200), kind: z.enum(['data', 'partner']), verify: z.boolean() }))
    .min(1)
    .max(8),
  feasibility: z.enum(['semester', 'year', 'larger']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  common_idea_warning: z.string().trim().max(400).nullable().default(null),
  related_challenge_id: z.string().trim().max(80).nullable().default(null),
});

export type IdeaCore = z.infer<typeof ideaSchema>;

export const setupSchema = z.object({
  project_type: z.enum(['capstone', 'thesis', 'startup']),
  program: z.string().trim().max(120).default(''),
  level: z.enum(['undergraduate', 'graduate', 'professional']).nullable().default(null),
  priority_area: z.string().trim().min(1).max(80),
  skills: z.array(z.string().trim().min(1).max(60)).max(5).default([]),
  time_available: z.enum(['semester', 'year', 'more']).nullable().default(null),
  budget: z.enum(['very-low', 'low', 'some']).nullable().default(null),
  partner_pref: z.string().trim().max(200).default(''),
});

export type SetupInput = z.infer<typeof setupSchema>;

export const noteSchema = z.object({
  working_title: str(200),
  background: str(1500),
  problem_statement: str(900),
  objectives: z.array(str(300)).min(1).max(6),
  proposed_approach: str(1500),
  expected_output: str(900),
  possible_partners: z.array(str(200)).max(8),
  risks: z.array(str(300)).min(1).max(6),
  next_steps: z.array(str(300)).min(3).max(3),
});

export type NoteContent = z.infer<typeof noteSchema>;

/**
 * Checks the rules a schema cannot: the theme must be one of the chosen area's
 * themes unless the idea is flagged as related and emerging. Returns a list of
 * problems, empty when the idea is fine.
 */
export function ideaProblems(idea: IdeaCore, areaSlug: string): string[] {
  const area = areaBySlug(areaSlug);
  const problems: string[] = [];
  if (area && !idea.emerging && !area.themes.some((t) => t.toLowerCase() === idea.agenda_theme.trim().toLowerCase())) {
    problems.push(`agenda_theme "${idea.agenda_theme}" is not a theme of ${area.name}`);
  }
  return problems;
}

/** Guarantees at least one data or partner item is marked to verify. */
export function enforceVerify(idea: IdeaCore): IdeaCore {
  if (idea.data_and_partners.some((d) => d.verify)) return idea;
  return { ...idea, data_and_partners: idea.data_and_partners.map((d) => ({ ...d, verify: true })) };
}

/** No em dashes in anything we show. */
export function cleanText(s: string): string {
  return s.replace(new RegExp('\\s*' + String.fromCharCode(0x2014) + '\\s*', 'g'), ', ').replace(new RegExp('\\s*' + String.fromCharCode(0x2013) + '\\s*', 'g'), ' to ');
}

export function cleanIdea(idea: IdeaCore): IdeaCore {
  return JSON.parse(JSON.stringify(idea), (_k, v) => (typeof v === 'string' ? cleanText(v) : v));
}

export { PRIORITY_AREAS };
