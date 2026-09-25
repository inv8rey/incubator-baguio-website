import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { IdeaCore, NoteContent, SetupInput } from './schema';
import { PRIORITY_AREAS } from './agenda';

// Server-only data access. Uses the Supabase service role (SUPABASE_SERVICE_ROLE_KEY).
// In local development with no service key it falls back to an in-memory store
// so the whole flow can be tried without a database. That fallback is never
// used in production.

export interface SessionRow extends SetupInput {
  id: string;
  created_at: string;
  device_hash: string;
  model: string | null;
}
export interface IdeaRow extends IdeaCore {
  id: string;
  session_id: string;
  created_at: string;
  parent_idea_id: string | null;
  cache_key: string | null;
}
export interface SharedRow {
  id: string;
  idea_id: string;
  shared_at: string;
  show_name: boolean;
  display_name: string | null;
  school: string | null;
  contact_email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  moderator_note: string | null;
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const useMemory = !SERVICE_KEY && process.env.NODE_ENV !== 'production';

export class StoreNotConfiguredError extends Error {}

let sb: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!URL || !SERVICE_KEY) throw new StoreNotConfiguredError('SUPABASE_SERVICE_ROLE_KEY is not set');
  if (!sb) sb = createClient(URL, SERVICE_KEY, { auth: { persistSession: false } });
  return sb;
}
export function storeConfigured() {
  return useMemory || (!!URL && !!SERVICE_KEY);
}

// ---------------------------------------------------------------------------
// In-memory fallback (development only)
// ---------------------------------------------------------------------------
interface Mem {
  sessions: Map<string, SessionRow>;
  ideas: Map<string, IdeaRow>;
  notes: Map<string, NoteContent>;
  shared: Map<string, SharedRow>;
  usage: { day: string; tokens: number }[];
  limits: Map<string, number>;
}
const g = globalThis as unknown as { __ideaLabMem?: Mem };
function mem(): Mem {
  if (!g.__ideaLabMem) g.__ideaLabMem = { sessions: new Map(), ideas: new Map(), notes: new Map(), shared: new Map(), usage: [], limits: new Map() };
  return g.__ideaLabMem;
}
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => crypto.randomUUID();

// ---------------------------------------------------------------------------
export async function createSession(input: SetupInput, deviceHash: string, model: string): Promise<SessionRow> {
  if (useMemory) {
    const row: SessionRow = { ...input, id: uid(), created_at: new Date().toISOString(), device_hash: deviceHash, model };
    mem().sessions.set(row.id, row);
    return row;
  }
  const { data, error } = await db().from('idea_sessions').insert({ ...input, device_hash: deviceHash, model }).select('*').single();
  if (error) throw new Error(error.message);
  return data as SessionRow;
}

export async function getSession(id: string): Promise<SessionRow | null> {
  if (useMemory) return mem().sessions.get(id) ?? null;
  const { data } = await db().from('idea_sessions').select('*').eq('id', id).maybeSingle();
  return (data as SessionRow) ?? null;
}

export async function listIdeas(sessionId: string): Promise<IdeaRow[]> {
  if (useMemory) return [...mem().ideas.values()].filter((i) => i.session_id === sessionId).sort((a, b) => a.created_at.localeCompare(b.created_at));
  const { data } = await db().from('ideas').select('*').eq('session_id', sessionId).order('created_at');
  return (data as IdeaRow[]) ?? [];
}

export async function getIdea(id: string): Promise<IdeaRow | null> {
  if (useMemory) return mem().ideas.get(id) ?? null;
  const { data } = await db().from('ideas').select('*').eq('id', id).maybeSingle();
  return (data as IdeaRow) ?? null;
}

export async function insertIdea(sessionId: string, core: IdeaCore, extra: { parent_idea_id?: string | null; cache_key?: string | null } = {}): Promise<IdeaRow> {
  const base = { ...core, session_id: sessionId, parent_idea_id: extra.parent_idea_id ?? null, cache_key: extra.cache_key ?? null };
  if (useMemory) {
    const row: IdeaRow = { ...base, id: uid(), created_at: new Date().toISOString() };
    mem().ideas.set(row.id, row);
    return row;
  }
  const { data, error } = await db().from('ideas').insert(base).select('*').single();
  if (error) throw new Error(error.message);
  return data as IdeaRow;
}

export async function recordUsage(u: { device_hash: string; kind: 'generate' | 'refine' | 'note'; model: string; input_tokens: number; output_tokens: number; session_id?: string }) {
  if (useMemory) {
    mem().usage.push({ day: today(), tokens: u.input_tokens + u.output_tokens });
    return;
  }
  await db().from('idea_usage').insert(u);
  if (u.kind === 'generate' && u.session_id) {
    const { data } = await db().from('idea_sessions').select('input_tokens, output_tokens').eq('id', u.session_id).maybeSingle();
    await db().from('idea_sessions').update({ input_tokens: (data?.input_tokens ?? 0) + u.input_tokens, output_tokens: (data?.output_tokens ?? 0) + u.output_tokens }).eq('id', u.session_id);
  }
}

export async function tokensToday(): Promise<number> {
  if (useMemory) return mem().usage.filter((u) => u.day === today()).reduce((s, u) => s + u.tokens, 0);
  const { data } = await db().from('idea_usage').select('input_tokens, output_tokens').gte('created_at', `${today()}T00:00:00Z`);
  return (data ?? []).reduce((s: number, r: { input_tokens: number; output_tokens: number }) => s + r.input_tokens + r.output_tokens, 0);
}

/** Atomically adds `cost` (1 per generation, 0.5 per refine or note) if it fits under `limit`. */
export async function bumpLimit(deviceHash: string, cost: number, limit: number): Promise<{ ok: boolean; used: number }> {
  if (useMemory) {
    const key = `${deviceHash}|${today()}`;
    const used = mem().limits.get(key) ?? 0;
    if (used + cost > limit) return { ok: false, used };
    mem().limits.set(key, used + cost);
    return { ok: true, used: used + cost };
  }
  const { data, error } = await db().rpc('idea_lab_bump_limit', { p_device: deviceHash, p_cost: cost, p_limit: limit });
  if (error) throw new Error(error.message);
  const row = (data as { ok: boolean; used: number }[])[0];
  return { ok: row.ok, used: Number(row.used) };
}

export async function cachedIdeas(cacheKey: string, deviceHash: string, n: number): Promise<IdeaRow[]> {
  if (useMemory) {
    const mine = new Set([...mem().sessions.values()].filter((s) => s.device_hash === deviceHash).map((s) => s.id));
    return [...mem().ideas.values()].filter((i) => i.cache_key === cacheKey && !mine.has(i.session_id)).slice(0, n);
  }
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const { data } = await db().from('ideas').select('*, idea_sessions!inner(device_hash)').eq('cache_key', cacheKey).gte('created_at', since).neq('idea_sessions.device_hash', deviceHash).limit(40);
  const rows = ((data as (IdeaRow & { idea_sessions?: unknown })[]) ?? []).map((r) => { const { idea_sessions: _s, ...rest } = r; void _s; return rest as IdeaRow; });
  // Shuffle so popular combinations do not always hand out the same two.
  for (let i = rows.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [rows[i], rows[j]] = [rows[j], rows[i]]; }
  return rows.slice(0, n);
}

/** The priority area with the fewest ideas so far, for "Surprise me". */
export async function leastRepresentedArea(): Promise<string> {
  const counts = new Map<string, number>(PRIORITY_AREAS.map((a) => [a.slug, 0]));
  if (useMemory) {
    for (const s of mem().sessions.values()) counts.set(s.priority_area, (counts.get(s.priority_area) ?? 0) + 1);
  } else {
    const { data } = await db().from('idea_sessions').select('priority_area');
    for (const r of (data as { priority_area: string }[]) ?? []) if (counts.has(r.priority_area)) counts.set(r.priority_area, (counts.get(r.priority_area) ?? 0) + 1);
  }
  const min = Math.min(...counts.values());
  const lowest = [...counts.entries()].filter(([, n]) => n === min).map(([slug]) => slug);
  return lowest[Math.floor(Math.random() * lowest.length)];
}

export async function getNote(ideaId: string): Promise<NoteContent | null> {
  if (useMemory) return mem().notes.get(ideaId) ?? null;
  const { data } = await db().from('concept_notes').select('content').eq('idea_id', ideaId).maybeSingle();
  return (data?.content as NoteContent) ?? null;
}

export async function saveNote(ideaId: string, content: NoteContent) {
  if (useMemory) { mem().notes.set(ideaId, content); return; }
  const existing = await db().from('concept_notes').select('id').eq('idea_id', ideaId).maybeSingle();
  if (existing.data) await db().from('concept_notes').update({ content, updated_at: new Date().toISOString() }).eq('id', existing.data.id);
  else await db().from('concept_notes').insert({ idea_id: ideaId, content });
}

export async function shareIdea(v: { idea_id: string; show_name: boolean; display_name: string | null; school: string | null; contact_email: string | null; moderator_note: string | null }): Promise<SharedRow> {
  if (useMemory) {
    const row: SharedRow = { id: uid(), shared_at: new Date().toISOString(), status: 'pending', ...v };
    mem().shared.set(row.id, row);
    return row;
  }
  const { data, error } = await db().from('shared_ideas').insert(v).select('*').single();
  if (error) throw new Error(error.message);
  return data as SharedRow;
}

export interface BankItem {
  shared_id: string;
  shared_at: string;
  display_name: string | null;
  school: string | null;
  project_type: string;
  program: string | null;
  priority_area: string;
  idea: IdeaRow;
}

export async function listBank(f: { type?: string; area?: string; program?: string; difficulty?: string }): Promise<BankItem[]> {
  const out: BankItem[] = [];
  if (useMemory) {
    for (const s of mem().shared.values()) {
      if (s.status !== 'approved') continue;
      const idea = mem().ideas.get(s.idea_id);
      const sess = idea && mem().sessions.get(idea.session_id);
      if (!idea || !sess) continue;
      out.push({ shared_id: s.id, shared_at: s.shared_at, display_name: s.show_name ? s.display_name : null, school: s.show_name ? s.school : null, project_type: sess.project_type, program: sess.program, priority_area: sess.priority_area, idea });
    }
  } else {
    const { data } = await db().from('shared_ideas').select('id, shared_at, show_name, display_name, school, ideas!inner(*, idea_sessions!inner(project_type, program, priority_area))').eq('status', 'approved').order('shared_at', { ascending: false }).limit(200);
    for (const s of (data as unknown as { id: string; shared_at: string; show_name: boolean; display_name: string | null; school: string | null; ideas: IdeaRow & { idea_sessions: { project_type: string; program: string | null; priority_area: string } } }[]) ?? []) {
      const { idea_sessions: sess, ...idea } = s.ideas;
      out.push({ shared_id: s.id, shared_at: s.shared_at, display_name: s.show_name ? s.display_name : null, school: s.show_name ? s.school : null, project_type: sess.project_type, program: sess.program, priority_area: sess.priority_area, idea: idea as IdeaRow });
    }
  }
  return out.filter((b) => (!f.type || b.project_type === f.type) && (!f.area || b.priority_area === f.area) && (!f.program || b.program === f.program) && (!f.difficulty || b.idea.difficulty === f.difficulty));
}

export async function getShared(id: string): Promise<SharedRow | null> {
  if (useMemory) return mem().shared.get(id) ?? null;
  const { data } = await db().from('shared_ideas').select('*').eq('id', id).maybeSingle();
  return (data as SharedRow) ?? null;
}

export async function addClaim(v: { shared_idea_id: string; contact_email: string | null; message: string | null }) {
  if (useMemory) return;
  const { error } = await db().from('idea_claims').insert(v);
  if (error) throw new Error(error.message);
}

export async function findSharedByIdea(ideaId: string): Promise<SharedRow | null> {
  if (useMemory) return [...mem().shared.values()].find((s) => s.idea_id === ideaId) ?? null;
  const { data } = await db().from('shared_ideas').select('*').eq('idea_id', ideaId).limit(1).maybeSingle();
  return (data as SharedRow) ?? null;
}
