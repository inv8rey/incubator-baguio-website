// Run with: npm run test:idea-lab
// Covers the Idea Lab acceptance criteria that can be checked without a browser:
// 2 (official area names only), 3 (idea validity), 4 (varied output), 5 (daily limit
// and budget guard), 7 (moderation gate), 10 (no em dashes).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

(process.env as Record<string, string | undefined>).NODE_ENV = 'test';
delete process.env.ANTHROPIC_API_KEY;
delete process.env.CLOUDFLARE_ACCOUNT_ID;
delete process.env.CLOUDFLARE_API_TOKEN;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;

const ROOT = process.cwd();
const EM_DASH = String.fromCharCode(0x2014);

function walk(dir: string, exts: string[], out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === '.git') continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, exts, out);
    else if (exts.includes(extname(p))) out.push(p);
  }
  return out;
}

test('criterion 2: no superseded placeholder area names anywhere in the code', () => {
  const superseded = ['Agriculture & Food Security', 'Health & Wellness', 'Tourism & Creative Industries', 'Environment & Sustainability', 'Education & Digital Innovation', 'Governance & Public Services'];
  const files = ['app', 'lib', 'public', 'supabase', 'scripts'].flatMap((d) => walk(join(ROOT, d), ['.ts', '.tsx', '.sql', '.md', '.css', '.html', '.json']));
  const hits: string[] = [];
  for (const f of files) {
    if (f.endsWith('idea-lab.test.ts')) continue;
    const text = readFileSync(f, 'utf8');
    // A single name can be innocent (the admin startup sector filters use some of
    // these words). The old Agenda list is recognisable as three or more together.
    const found = superseded.filter((name) => text.includes(name) || text.includes(name.replace('&', '&amp;')));
    if (found.length >= 3) hits.push(`${f}: ${found.join(', ')}`);
  }
  assert.deepEqual(hits, []);
});

test('criterion 2: the six official priority area names appear exactly', async () => {
  const { PRIORITY_AREAS } = await import('../lib/idea-lab/agenda');
  assert.deepEqual(PRIORITY_AREAS.map((a) => a.name), [
    'Environmental Action',
    'Social Protection and Inclusivity',
    'Economic Expansion and the Creative Economy',
    'Infrastructure and Smart City Development',
    'Resilience and Disaster Risk Reduction',
    'Good Governance and Institutional Growth',
  ]);
});

test('criterion 10: no em dashes in Idea Lab code, copy, or generated text', async () => {
  const dirs = ['lib/idea-lab', 'app/idea-lab', 'app/api/idea-lab'];
  const files = [...dirs.flatMap((d) => walk(join(ROOT, d), ['.ts', '.tsx'])), join(ROOT, 'app/admin/tabs/IdeaLabTab.tsx'), join(ROOT, 'supabase/migrations/2026-10-02-idea-lab.sql')];
  const hits = files.filter((f) => readFileSync(f, 'utf8').includes(EM_DASH));
  assert.deepEqual(hits, []);

  const { cleanText } = await import('../lib/idea-lab/schema');
  assert.ok(!cleanText(`a ${EM_DASH} b${EM_DASH}c`).includes(EM_DASH));
});

const input = { project_type: 'capstone', program: 'BS Computer Science', level: 'undergraduate', priority_area: 'infrastructure-smart-city', skills: [], time_available: 'semester', budget: 'low', partner_pref: '' } as const;

test('criteria 3 and 4: ideas are valid, and identical inputs give different sets', async () => {
  const { generateIdeas } = await import('../lib/idea-lab/llm');
  const { ideaSchema, ideaProblems } = await import('../lib/idea-lab/schema');
  const run = async (seed: string) => {
    const ideas: unknown[] = [];
    await generateIdeas({ input: { ...input, skills: [] }, count: 5, seed, avoidTitles: [], onIdea: (i) => { ideas.push(i); } });
    return ideas as ReturnType<typeof ideaSchema.parse>[];
  };
  const a = await run('seed-one');
  const b = await run('seed-two');
  assert.equal(a.length, 5);
  for (const idea of a) {
    ideaSchema.parse(idea);
    assert.deepEqual(ideaProblems(idea, input.priority_area), []);
    assert.ok(idea.data_and_partners.some((d) => d.verify), 'at least one item marked verify');
  }
  assert.notDeepEqual(a.map((i) => i.title), b.map((i) => i.title));
});

test('validation rejects a theme outside the chosen area unless it is flagged emerging', async () => {
  const { ideaProblems, enforceVerify } = await import('../lib/idea-lab/schema');
  const base = { title: 't', problem: 'p', agenda_theme: 'smart mobility', emerging: false, agenda_fit: 'f', statutory_area: 'Transportation services', deliverable: 'd', data_and_partners: [{ label: 'x', kind: 'data', verify: false }], feasibility: 'semester', difficulty: 'beginner', common_idea_warning: null, related_challenge_id: null } as const;
  assert.deepEqual(ideaProblems(base as never, 'infrastructure-smart-city'), []);
  assert.equal(ideaProblems({ ...base, agenda_theme: 'poverty' } as never, 'infrastructure-smart-city').length, 1);
  assert.deepEqual(ideaProblems({ ...base, agenda_theme: 'poverty', emerging: true } as never, 'infrastructure-smart-city'), []);
  assert.ok(enforceVerify(base as never).data_and_partners.every((d) => d.verify));
});

test('the stream parser emits each idea as its closing brace arrives', async () => {
  const { IdeaStreamParser } = await import('../lib/idea-lab/streamParser');
  const body = JSON.stringify({ ideas: [{ title: 'A "quoted" {brace}', n: 1 }, { title: 'B', nested: { x: [1, 2] } }] });
  const p = new IdeaStreamParser();
  const got: unknown[] = [];
  for (let i = 0; i < body.length; i += 7) got.push(...p.feed(body.slice(i, i + 7)));
  assert.equal(got.length, 2);
  assert.equal((got[0] as { title: string }).title, 'A "quoted" {brace}');
});

test('criterion 5: the daily limit blocks after the allowance, and half-cost actions count', async () => {
  const { bumpLimit } = await import('../lib/idea-lab/store');
  const dev = 'limit-test-device';
  for (let i = 0; i < 4; i++) assert.equal((await bumpLimit(dev, 1, 5)).ok, true);
  assert.equal((await bumpLimit(dev, 0.5, 5)).ok, true);
  assert.equal((await bumpLimit(dev, 0.5, 5)).ok, true);
  const blocked = await bumpLimit(dev, 0.5, 5);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.used, 5);
  // A different device is unaffected.
  assert.equal((await bumpLimit('another-device', 1, 5)).ok, true);
  // A refund frees the allowance again.
  assert.equal((await bumpLimit(dev, -1, 5)).ok, true);
});

test('criterion 5: the global token budget is measured from recorded usage', async () => {
  const { recordUsage, tokensToday } = await import('../lib/idea-lab/store');
  const before = await tokensToday();
  await recordUsage({ device_hash: 'x', kind: 'generate', model: 'mock', input_tokens: 700, output_tokens: 300 });
  assert.equal((await tokensToday()) - before, 1000);
});

test('criterion 7: a shared idea stays out of the public bank until approved', async () => {
  const store = await import('../lib/idea-lab/store');
  const session = await store.createSession({ ...input, skills: [] } as never, 'dev-hash', 'mock');
  const idea = await store.insertIdea(session.id, { title: 'Shared test idea', problem: 'p', agenda_theme: 'smart mobility', emerging: false, agenda_fit: 'f', statutory_area: 'Transportation services', deliverable: 'd', data_and_partners: [{ label: 'x', kind: 'data', verify: true }], feasibility: 'semester', difficulty: 'beginner', common_idea_warning: null, related_challenge_id: null } as never);
  const shared = await store.shareIdea({ idea_id: idea.id, show_name: true, display_name: 'Ana', school: 'BSU', contact_email: 'ana@example.com', moderator_note: null });
  assert.equal(shared.status, 'pending');
  assert.equal((await store.listBank({})).some((b) => b.idea.id === idea.id), false);
  shared.status = 'approved';
  const bank = await store.listBank({});
  const item = bank.find((b) => b.idea.id === idea.id);
  assert.ok(item);
  // Contact email is never part of a bank item.
  assert.equal(JSON.stringify(item).includes('ana@example.com'), false);
});

test('criterion 8: the device hash is not the raw IP', async () => {
  const { deviceHash } = await import('../lib/idea-lab/http');
  const req = new Request('http://x', { headers: { 'x-forwarded-for': '203.0.113.9', 'user-agent': 'ua' } });
  const h = deviceHash(req);
  assert.match(h, /^[0-9a-f]{64}$/);
  assert.ok(!h.includes('203.0.113.9'));
});

test('login required: every tool route checks the signed-in user', () => {
  for (const r of ['session', 'generate', 'refine', 'note', 'share', 'claim']) {
    const text = readFileSync(join(ROOT, 'app/api/idea-lab', r, 'route.ts'), 'utf8');
    const handlers = (text.match(/export async function (GET|POST|PUT)/g) || []).length;
    const guards = (text.match(/await requireUser\(req\)/g) || []).length;
    assert.equal(guards, handlers, `${r}: every handler must call requireUser`);
  }
});

test('limits are per category: 3 capstone generations do not use up thesis or startup', async () => {
  const { bumpLimit } = await import('../lib/idea-lab/store');
  const user = 'acct-hash';
  for (let i = 0; i < 3; i++) assert.equal((await bumpLimit(`${user}|capstone`, 1, 3)).ok, true);
  assert.equal((await bumpLimit(`${user}|capstone`, 1, 3)).ok, false);
  assert.equal((await bumpLimit(`${user}|thesis`, 1, 3)).ok, true);
  assert.equal((await bumpLimit(`${user}|startup`, 1, 3)).ok, true);
});
