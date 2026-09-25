// JSON Schemas handed to the model as tool input schemas.
const ideaProps = {
  title: { type: 'string', description: 'Capstone: "SystemName: A ... for ...". Thesis: a formal research title. Startup: a brand name only.' },
  problem: { type: 'string', description: '1 or 2 sentences: the specific Baguio situation, who is affected, when or where. Follows on from deliverable.' },
  agenda_theme: { type: 'string', description: 'A theme of the chosen priority area, or the closest related theme if emerging' },
  emerging: { type: 'boolean', description: 'true only for a related and emerging idea beyond the listed themes' },
  agenda_fit: { type: 'string', description: 'One line on why it fits the Agenda' },
  statutory_area: { type: 'string', description: 'Closest statutory area, exactly as listed' },
  deliverable: { type: 'string', description: '2 sentences that open by naming the project from the title (thesis: "This study...") and say what it does or finds.' },
  data_and_partners: {
    type: 'array',
    items: {
      type: 'object',
      properties: { label: { type: 'string' }, kind: { type: 'string', enum: ['data', 'partner'] }, verify: { type: 'boolean' } },
      required: ['label', 'kind', 'verify'],
    },
  },
  feasibility: { type: 'string', enum: ['semester', 'year', 'larger'] },
  difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
  common_idea_warning: { type: ['string', 'null'] },
  related_challenge_id: { type: ['string', 'null'] },
};
const ideaRequired = ['title', 'problem', 'agenda_theme', 'emerging', 'agenda_fit', 'statutory_area', 'deliverable', 'data_and_partners', 'feasibility', 'difficulty', 'common_idea_warning', 'related_challenge_id'];

export const IDEAS_TOOL = {
  name: 'submit_ideas',
  description: 'Submit the generated project ideas.',
  input_schema: {
    type: 'object' as const,
    properties: { ideas: { type: 'array', items: { type: 'object', properties: ideaProps, required: ideaRequired } } },
    required: ['ideas'],
  },
};

export const ONE_IDEA_TOOL = {
  name: 'submit_idea',
  description: 'Submit one revised project idea.',
  input_schema: { type: 'object' as const, properties: ideaProps, required: ideaRequired },
};

export const NOTE_TOOL = {
  name: 'submit_note',
  description: 'Submit the concept note.',
  input_schema: {
    type: 'object' as const,
    properties: {
      working_title: { type: 'string' },
      background: { type: 'string' },
      problem_statement: { type: 'string' },
      objectives: { type: 'array', items: { type: 'string' } },
      proposed_approach: { type: 'string' },
      expected_output: { type: 'string' },
      possible_partners: { type: 'array', items: { type: 'string' } },
      risks: { type: 'array', items: { type: 'string' } },
      next_steps: { type: 'array', items: { type: 'string' }, description: 'Exactly three next steps' },
    },
    required: ['working_title', 'background', 'problem_statement', 'objectives', 'proposed_approach', 'expected_output', 'possible_partners', 'risks', 'next_steps'],
  },
};

// Slimmer schema for Cloudflare: only the fields the card shows. The rest are
// filled with defaults on the server, which keeps the answer short and fast.
const slimKeys = ['title', 'deliverable', 'problem', 'agenda_theme', 'emerging', 'agenda_fit', 'statutory_area'] as const;
const slimProps = Object.fromEntries(slimKeys.map((k) => [k, (ideaProps as Record<string, unknown>)[k]]));
export const CF_IDEAS_SCHEMA = {
  type: 'object' as const,
  properties: { ideas: { type: 'array', items: { type: 'object', properties: slimProps, required: [...slimKeys] } } },
  required: ['ideas'],
};
export const CF_ONE_IDEA_SCHEMA = { type: 'object' as const, properties: slimProps, required: [...slimKeys] };
