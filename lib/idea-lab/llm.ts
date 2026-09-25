import Anthropic from '@anthropic-ai/sdk';
import { RULES_PROMPT, NOTE_RULES, agendaBlock, ideasUserTurn, setupForPrompt } from './prompt';
import { CF_IDEAS_SCHEMA, CF_ONE_IDEA_SCHEMA, IDEAS_TOOL, NOTE_TOOL, ONE_IDEA_TOOL } from './toolSchemas';
import { IdeaStreamParser } from './streamParser';
import { areaBySlug, STATUTORY_AREAS } from './agenda';
import { cloudflareConfigured, cfJson, cfStream, CF_MODEL, type CfMessage } from './cloudflare';
import { cleanIdea, enforceVerify, ideaProblems, ideaSchema, noteSchema, type IdeaCore, type NoteContent, type SetupInput } from './schema';

export interface Usage { input_tokens: number; output_tokens: number }

export class NotConfiguredError extends Error {}

// Which engine writes the ideas. Cloudflare Workers AI is the default (the
// site already has it for the chatbot, and it has a free daily allowance).
// Anthropic is used only if an API key is set. With neither, or when the AI
// call fails, the template generator below takes over.
const MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
const KEY = (process.env.ANTHROPIC_API_KEY || '').trim();
type Provider = 'anthropic' | 'cloudflare' | 'template';
const PROVIDER_DEFAULT: Provider = KEY ? 'anthropic' : cloudflareConfigured() ? 'cloudflare' : 'template';

export function modelName() {
  return PROVIDER_DEFAULT === 'anthropic' ? MODEL : PROVIDER_DEFAULT === 'cloudflare' ? CF_MODEL : 'template';
}

// Always true: the template generator means there is always something to serve.
export function llmConfigured() {
  return true;
}

let client: Anthropic | null = null;
function anthropic() {
  if (!KEY) throw new NotConfiguredError('ANTHROPIC_API_KEY is not set');
  if (!client) client = new Anthropic({ apiKey: KEY });
  return client;
}

// The static blocks are marked for prompt caching (Anthropic): the rules first, then the
// agenda and local context, with the cache breakpoint on the last static block.
function systemBlocks(rules: string, withAgenda: boolean) {
  const blocks: { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }[] = [{ type: 'text', text: rules }];
  if (withAgenda) blocks.push({ type: 'text', text: agendaBlock() });
  blocks[blocks.length - 1].cache_control = { type: 'ephemeral' };
  return blocks;
}

// Cloudflare takes a plain system string and a JSON schema for the answer.
const cfSystem = (rules: string, withAgenda: boolean) => (withAgenda ? `${rules}\n\n${agendaBlock()}` : rules) + '\n\nRespond with JSON only, matching the schema.';
const ideasSchema = () => ({ name: IDEAS_TOOL.name, schema: CF_IDEAS_SCHEMA, strict: false });
const oneSchema = () => ({ name: ONE_IDEA_TOOL.name, schema: CF_ONE_IDEA_SCHEMA, strict: false });

// The slim Cloudflare answer omits fields the card does not show; fill them in.
const withDefaults = (raw: unknown) => ({
  emerging: false,
  data_and_partners: [
    { label: 'Records from the relevant city office', kind: 'data', verify: true },
    { label: 'A barangay office or local partner', kind: 'partner', verify: true },
  ],
  feasibility: 'year',
  difficulty: 'intermediate',
  common_idea_warning: null,
  related_challenge_id: null,
  ...(raw as Record<string, unknown>),
});
const noteJsonSchema = () => ({ name: NOTE_TOOL.name, schema: NOTE_TOOL.input_schema, strict: false });

function accept(raw: unknown, areaSlug: string): IdeaCore | null {
  const parsed = ideaSchema.safeParse(raw);
  if (!parsed.success) return null;
  const idea = enforceVerify(cleanIdea(parsed.data));
  if (ideaProblems(idea, areaSlug).length) return null;
  return idea;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Streams ideas: onIdea fires once per validated idea as soon as it is
 * complete. If the AI returns too few valid ideas (or fails, for example when
 * the free allowance is used up), the template generator fills the gap.
 * Returns total usage.
 */
export async function generateIdeas(opts: {
  input: SetupInput;
  count: number;
  seed: string;
  avoidTitles: string[];
  openChallenges?: { id: string; title: string; category: string }[];
  /** false once the daily AI budget is used: the template generator serves instead. */
  useAi?: boolean;
  onIdea: (idea: IdeaCore) => Promise<void> | void;
}): Promise<Usage> {
  const usage: Usage = { input_tokens: 0, output_tokens: 0 };
  const PROVIDER = opts.useAi === false ? 'template' : PROVIDER_DEFAULT;
  const got: IdeaCore[] = [];
  const seen = [...opts.avoidTitles];

  const emit = async (raw: unknown) => {
    if (got.length >= opts.count) return;
    const idea = accept(raw, opts.input.priority_area);
    if (!idea || seen.some((t) => t.toLowerCase() === idea.title.toLowerCase())) return;
    got.push(idea);
    seen.push(idea.title);
    await opts.onIdea(idea);
  };

  const runTemplate = async (count: number) => {
    for (const raw of mockIdeas(opts.input, count + seen.length, opts.seed + String(seen.length))) {
      if (got.length >= opts.count) break;
      await sleep(450);
      await emit(raw);
    }
    usage.input_tokens += 0;
  };

  const runAi = async (count: number) => {
    const user = ideasUserTurn({ input: opts.input, count, seed: opts.seed, avoidTitles: seen, openChallenges: opts.openChallenges });
    const parser = new IdeaStreamParser();
    if (PROVIDER === 'cloudflare') {
      const messages: CfMessage[] = [{ role: 'system', content: cfSystem(RULES_PROMPT, true) }, { role: 'user', content: user }];
      const u = await cfStream(messages, ideasSchema(), 450 * count + 250, async (t) => {
        for (const raw of parser.feed(t)) await emit(withDefaults(raw));
      });
      usage.input_tokens += u.input_tokens;
      usage.output_tokens += u.output_tokens;
      return;
    }
    const stream = anthropic().messages.stream({
      model: MODEL,
      max_tokens: 900 * count + 400,
      system: systemBlocks(RULES_PROMPT, true),
      messages: [{ role: 'user', content: user }],
      tools: [IDEAS_TOOL],
      tool_choice: { type: 'tool', name: IDEAS_TOOL.name },
    });
    for await (const ev of stream) {
      if (ev.type === 'content_block_delta' && ev.delta.type === 'input_json_delta') {
        for (const raw of parser.feed(ev.delta.partial_json)) await emit(raw);
      }
    }
    const final = await stream.finalMessage();
    usage.input_tokens += final.usage.input_tokens + (final.usage.cache_read_input_tokens ?? 0) + (final.usage.cache_creation_input_tokens ?? 0);
    usage.output_tokens += final.usage.output_tokens;
  };

  if (PROVIDER !== 'template') {
    try {
      await runAi(opts.count);
      if (got.length < opts.count) await runAi(opts.count - got.length);
    } catch (err) {
      console.error('idea-lab: AI call failed, using the template generator:', err instanceof Error ? err.message : err);
    }
  }
  if (got.length < opts.count) await runTemplate(opts.count - got.length);
  if (got.length === 0) throw new Error('No ideas could be generated.');
  return usage;
}

export async function refineIdea(opts: { input: SetupInput; base: IdeaCore; instruction: string; seed: string; useAi?: boolean }): Promise<{ idea: IdeaCore; usage: Usage }> {
  const PROVIDER = opts.useAi === false ? 'template' : PROVIDER_DEFAULT;
  const userContent = JSON.stringify({
    task: 'Rewrite ONE idea according to the refinement instruction. Keep it in the same priority area. Return one idea.',
    user: setupForPrompt(opts.input),
    original_idea: opts.base,
    refinement_instruction: opts.instruction,
    variety_seed: opts.seed,
  });
  const attempt = async (): Promise<{ idea: IdeaCore | null; usage: Usage }> => {
    if (PROVIDER === 'cloudflare') {
      const r = await cfJson([{ role: 'system', content: cfSystem(RULES_PROMPT, true) }, { role: 'user', content: userContent }], oneSchema(), 1400);
      return { idea: accept(withDefaults(r.data), opts.input.priority_area), usage: { input_tokens: r.input_tokens, output_tokens: r.output_tokens } };
    }
    const res = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 1400,
      system: systemBlocks(RULES_PROMPT, true),
      messages: [{ role: 'user', content: userContent }],
      tools: [ONE_IDEA_TOOL],
      tool_choice: { type: 'tool', name: ONE_IDEA_TOOL.name },
    });
    const block = res.content.find((b) => b.type === 'tool_use');
    const idea = block && block.type === 'tool_use' ? accept(block.input, opts.input.priority_area) : null;
    return { idea, usage: { input_tokens: res.usage.input_tokens + (res.usage.cache_read_input_tokens ?? 0), output_tokens: res.usage.output_tokens } };
  };

  let total: Usage = { input_tokens: 0, output_tokens: 0 };
  if (PROVIDER !== 'template') {
    for (let i = 0; i < 2; i++) {
      try {
        const r = await attempt();
        total = { input_tokens: total.input_tokens + r.usage.input_tokens, output_tokens: total.output_tokens + r.usage.output_tokens };
        if (r.idea) return { idea: r.idea, usage: total };
      } catch (err) {
        console.error('idea-lab: refine AI call failed:', err instanceof Error ? err.message : err);
        break;
      }
    }
  }
  // Template fallback: a fresh idea in the same area, tagged with the instruction.
  const [raw] = mockIdeas({ ...opts.input }, 1, opts.seed + opts.instruction);
  const idea = accept(raw, opts.input.priority_area);
  if (!idea) throw new Error('No idea could be generated.');
  return { idea, usage: total };
}

export async function makeNote(opts: { input: SetupInput; idea: IdeaCore; useAi?: boolean }): Promise<{ note: NoteContent; usage: Usage }> {
  const PROVIDER = opts.useAi === false ? 'template' : PROVIDER_DEFAULT;
  const clean = (n: NoteContent) => JSON.parse(JSON.stringify(n), (_k, v) => (typeof v === 'string' ? v.replace(new RegExp('\\s*' + String.fromCharCode(0x2014) + '\\s*', 'g'), ', ') : v)) as NoteContent;
  let total: Usage = { input_tokens: 0, output_tokens: 0 };
  if (PROVIDER !== 'template') {
    for (let i = 0; i < 2; i++) {
      try {
        if (PROVIDER === 'cloudflare') {
          const r = await cfJson([{ role: 'system', content: cfSystem(NOTE_RULES, false) }, { role: 'user', content: JSON.stringify({ user: setupForPrompt(opts.input), idea: opts.idea }) }], noteJsonSchema(), 2200);
          total = { input_tokens: total.input_tokens + r.input_tokens, output_tokens: total.output_tokens + r.output_tokens };
          const parsed = noteSchema.safeParse(r.data);
          if (parsed.success) return { note: clean(parsed.data), usage: total };
          continue;
        }
        const res = await anthropic().messages.create({
          model: MODEL,
          max_tokens: 2200,
          system: systemBlocks(NOTE_RULES, false),
          messages: [{ role: 'user', content: JSON.stringify({ user: setupForPrompt(opts.input), idea: opts.idea }) }],
          tools: [NOTE_TOOL],
          tool_choice: { type: 'tool', name: NOTE_TOOL.name },
        });
        total = { input_tokens: total.input_tokens + res.usage.input_tokens, output_tokens: total.output_tokens + res.usage.output_tokens };
        const block = res.content.find((b) => b.type === 'tool_use');
        const parsed = block && block.type === 'tool_use' ? noteSchema.safeParse(block.input) : null;
        if (parsed?.success) return { note: clean(parsed.data), usage: total };
      } catch (err) {
        console.error('idea-lab: note AI call failed:', err instanceof Error ? err.message : err);
        break;
      }
    }
  }
  return { note: mockNote(opts.idea), usage: total };
}

// ---------------------------------------------------------------------------
// Template generator. A hand-written set of Baguio problems for every Agenda
// theme, assembled into properly styled titles and descriptions. It is the
// fallback whenever no AI provider is configured or the free AI allowance runs
// out, so Idea Lab never goes offline.
// ---------------------------------------------------------------------------
function pick<T>(arr: readonly T[], n: number): T { return arr[Math.abs(n) % arr.length]; }
function hashOf(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }

// theme -> [system name, what the system does, who it serves, thesis topic, startup name, the Baguio problem]
const MOCK_THEMES: Record<string, [string, string, string, string, string, string]> = {
  'net zero': ['KuryenteWatch', 'Energy Use Monitoring Dashboard', 'Small Lodging Houses', 'Energy-Saving Practices', 'Lamig Power', 'Many small inns and boarding houses have no simple way to see where their electricity goes, so peak-season bills climb with no plan to cut them.'],
  'circularity': ['BalikBote', 'Reverse Vending and Rewards System', 'Session Road Cafes', 'Reuse and Refill Behavior', 'Balik Baguio', 'Single-use cups and bottles pile up around Session Road and Burnham Park during weekends and festivals.'],
  'water and resource security': ['TubigTrack', 'Household Water Rationing and Alert App', 'Hillside Households', 'Water Storage and Rationing Practices', 'Tubig Tayo', 'Hillside households wait days for scheduled water deliveries in the dry months and often do not know when the next one comes.'],
  'urban agriculture': ['TaniMap', 'Rooftop and Container Garden Planner', 'Urban Households', 'Participation in Urban Container Gardening', 'Hardin Hilltop', 'With little flat land in the city, families who want to grow food at home have no local guide for rooftops and small spaces.'],
  'poverty': ['KabuhayanLink', 'Informal Job Matching Platform', 'Daily-Wage Workers', 'Income Stability and Job-Finding Practices', 'Trabaho Taas', 'Daily-wage workers near the market find work mostly by word of mouth, which leaves many idle on slow days.'],
  'universal health care': ['KonsultaNow', 'Barangay Health Center Queue System', 'Barangay Health Center Patients', 'Waiting Time and Access to Primary Care', 'Salud Sakay', 'Patients at barangay health centers line up early without knowing if the doctor is in or how long the wait will be.'],
  'education': ['AralKita', 'Offline Learning Module Sharing System', 'Public High School Students', 'Learning Continuity During Class Suspensions', 'Aral Akyat', 'Typhoon class suspensions leave students without lessons, especially those with weak home internet.'],
  'cultural preservation': ['Salaysay', 'Digital Archive of Cordillera Oral Stories', 'Elders and Youth', 'Intergenerational Transfer of Indigenous Knowledge', 'Kultura Kwento', 'Stories and practices held by Cordillera elders are fading because few of them are recorded in a form the youth use.'],
  'livability': ['LakadLigtas', 'Walkability and Sidewalk Reporting App', 'Pedestrians', 'Perceived Walkability of Downtown Streets', 'Lakad Baguio', 'Narrow and broken sidewalks push pedestrians onto busy roads in the city center.'],
  'social vulnerability': ['KalingaMap', 'Vulnerable Household Registry for Emergencies', 'Senior Citizens Living Alone', 'Social Isolation and Emergency Reach', 'Kalinga Kapit', 'Seniors living alone on steep streets are hard to reach quickly during storms and power outages.'],
  'creative industries': ['LikhaMarket', 'Online Catalog and Order System', 'Local Woodcarvers and Weavers', 'Market Access and Off-Season Income', 'Likha Cordillera', 'Woodcarvers and weavers depend on walk-in tourists, so sales drop sharply outside peak season.'],
  'sustainable tourism': ['DaloyTuro', 'Crowd Level Forecast and Alternative Spot Guide', 'Tourists and Residents', 'Tourist Crowding and Resident Well-Being', 'Daloy Travel', 'Panagbenga and holiday crowds overload a few popular spots while nearby places stay empty.'],
  'innovation ecosystems': ['UgnayLab', 'Student Project and Mentor Matching Portal', 'College Student Teams', 'Research-to-Industry Linkages', 'Ugnay Hub', 'Good student projects end after grading because teams cannot find mentors or partners to keep going.'],
  'economic formalisation': ['NegosyoReg', 'Guided Business Registration Assistant', 'Micro Vendors', 'Barriers to Business Registration', 'Rehistro Ready', 'Many small vendors stay unregistered because the steps and requirements feel confusing and far away.'],
  'smart mobility': ['TaraBiyahe', 'Jeepney Route and Fare Guide', 'First-Time Students', 'Commuting Experience of Student Commuters', 'Sakay Smart', 'New students struggle to learn which jeepney lines go where, and they lose time in the downtown traffic.'],
  'digital systems': ['SerbisyoQ', 'Online Appointment and Queue System', 'City Hall Walk-In Clients', 'Readiness for Online Appointments', 'Pila Less', 'Walk-in clients wait long hours at city offices for simple requests that could be scheduled.'],
  'green buildings': ['GreenGusali', 'Building Energy and Ventilation Checker', 'Boarding House Owners', 'Adoption of Green Building Practices', 'Gusali Green', 'Older boarding houses trap damp and cold air, which raises health risks and heating costs.'],
  'universal access': ['DaanPara', 'Accessible Route Finder', 'Persons with Disabilities', 'Accessibility of Public Spaces', 'Access Akyat', 'Steep stairs and uneven paths make many public spaces hard to reach for wheelchair users.'],
  'climate risk': ['UlanAlert', 'Hyperlocal Rainfall Alert System', 'Residents in Landslide-Prone Areas', 'Community Response to Heavy Rainfall Warnings', 'Ulan Ready', 'Heavy rain warnings are issued for the whole city, so people on the most at-risk slopes do not know when to act.'],
  'resilient infrastructure': ['TulayCheck', 'Drainage and Culvert Inspection Log', 'Barangay Engineers', 'Maintenance Practices for Small Drainage Structures', 'Daloy Guard', 'Clogged drainage and culverts cause street flooding during typhoons, and inspections are recorded on paper.'],
  'nature-based solutions': ['PunoPlan', 'Tree Planting and Slope Stabilization Tracker', 'Community Volunteers', 'Community Participation in Slope Reforestation', 'Pine Guard', 'Tree planting on bare slopes is common, but few groups track which seedlings survive.'],
  'multi-hazard preparedness': ['HandaKit', 'Family Preparedness Planner', 'Households', 'Household Disaster Preparedness Levels', 'Handa Pamilya', 'Many families have no written plan for typhoons, earthquakes, and landslides that all hit the same neighborhoods.'],
  'structural resilience': ['LindolCheck', 'Rapid Building Vulnerability Survey Tool', 'Owners of Older Houses', 'Earthquake Risk Awareness and Retrofitting Intentions', 'Tibay Bahay', 'Many older houses on steep lots were built before current codes, and owners do not know how safe they are.'],
  'institutional capacity': ['KaalamanDesk', 'Office Knowledge Base and Handover System', 'City Office Staff', 'Knowledge Retention in Local Government Offices', 'Turnover Ready', 'When staff move or retire, office know-how leaves with them because little is written down.'],
  'public service delivery': ['BarangayConnect', 'Online Certificate Request and Tracking System', 'Barangay Residents', 'Efficiency of Barangay Certificate Processing', 'Serbisyo Sakto', 'Residents make repeated trips to the barangay hall to request and follow up on certificates.'],
  'transparency': ['BukasBudget', 'Plain-Language Barangay Budget Viewer', 'Barangay Residents', 'Citizen Awareness of Barangay Budgets', 'Open Barangay', 'Residents rarely see how barangay funds are planned and spent because reports are hard to read.'],
  'evidence-based policymaking': ['DatosBaguio', 'Community Survey and Data Dashboard', 'Barangay Planning Councils', 'Use of Local Data in Barangay Planning', 'Datos Lab', 'Barangay plans are often made without recent local data because surveys are slow and costly to run.'],
};

function mockIdeas(input: SetupInput, count: number, seed: string): unknown[] {
  const area = areaBySlug(input.priority_area) ?? areaBySlug('environmental-action')!;
  const h = Math.abs(hashOf(seed));
  const designs = ['A Mixed-Methods Study', 'A Descriptive-Correlational Study', 'A Case Study', 'A Qualitative Study', 'A Cross-Sectional Survey'];
  const tech = ['Web-Based', 'Mobile', 'IoT-Based', 'GIS-Enabled', 'SMS-Based'];
  return Array.from({ length: count }, (_, i) => {
    const theme = area.themes[(h + i) % area.themes.length];
    const [sys, what, users, topic, brand, problem] = MOCK_THEMES[theme] ?? ['Proyekto', 'Community Service System', 'Residents', 'Community Needs', 'Baguio Works', 'Residents face a recurring local problem with little shared information.'];
    const variant = Math.floor(h / 7) + i;
    const title = input.project_type === 'startup'
      ? (i >= area.themes.length ? sys : brand)
      : input.project_type === 'thesis'
        ? `${topic} Among ${users} in Baguio City: ${pick(designs, variant)}`
        : `${sys}: ${/^[AEIOU]/.test(pick(tech, variant)) ? 'An' : 'A'} ${pick(tech, variant)} ${what} for ${users} in Baguio City`;
    const deliverable = input.project_type === 'startup'
      ? `${title} gives ${users.toLowerCase()} a simple ${what.toLowerCase()} built for Baguio. It starts as a low-cost pilot and earns through a small subscription from partner businesses.`
      : input.project_type === 'thesis'
        ? `This study examines ${topic.toLowerCase()} among ${users.toLowerCase()} in Baguio City through surveys and interviews. It aims to identify the main barriers and what would help most.`
        : `${sys} is ${/^[AEIOU]/.test(pick(tech, variant)) ? 'an' : 'a'} ${pick(tech, variant)} ${what.toLowerCase()} for ${users.toLowerCase()}. It lets them see and act on the problem in one place and gives the partner office a simple summary.`;
    return {
      title,
      problem,
      agenda_theme: theme,
      emerging: false,
      agenda_fit: `It supports ${theme} under ${area.name} by giving the city a practical, local way to act on it.`,
      statutory_area: pick(STATUTORY_AREAS, h + i),
      deliverable,
      data_and_partners: [
        { label: 'Records from the relevant city office', kind: 'data', verify: true },
        { label: 'A barangay office or local association', kind: 'partner', verify: true },
      ],
      feasibility: pick(['semester', 'year', 'larger'] as const, h + i),
      difficulty: pick(['beginner', 'intermediate', 'advanced'] as const, h + i * 3),
      common_idea_warning: null,
      related_challenge_id: null,
    };
  });
}

function mockNote(idea: IdeaCore): NoteContent {
  return {
    working_title: idea.title,
    background: `Starting outline, not a finished paper. ${idea.problem}`,
    problem_statement: idea.problem,
    objectives: ['Understand the current situation with the people affected.', 'Design a simple, testable approach.', 'Show a clear result to the partner office.'],
    proposed_approach: idea.deliverable,
    expected_output: 'A demonstrable output and a short findings summary.',
    possible_partners: idea.data_and_partners.filter((d) => d.kind === 'partner').map((d) => d.label),
    risks: ['Data may be hard to get.', 'The scope may be too wide for one term.'],
    next_steps: ['Talk to your adviser about scope.', 'Visit or call the partner office.', 'Write a one paragraph problem statement.'],
  };
}
