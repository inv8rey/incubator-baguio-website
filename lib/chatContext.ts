import { supabase } from "./supabaseClient";
import { slugify } from "./slug";
import { embedTexts } from "./chatbotDocumentPipeline";

export type ChatEntityType = "challenge" | "mentor" | "startup" | "resource";

export interface ChatIntent {
  wantsChallenges: boolean;
  wantsMentors: boolean;
  wantsStartups: boolean;
  wantsKnowledge: boolean;
}

const MENTOR_WORDS = /mentor|coach|advis(or|er)|guidance/i;
const CHALLENGE_WORDS = /challenge|problem\s*statement|open innovation|opportunit/i;
const KNOWLEDGE_WORDS = /resource|guide|template|pdf|policy|policies|report|knowledge|toolkit|funding opportun/i;
const STARTUP_WORDS = /collaborat|partner|co-?founder|other startup|team up|teammate/i;

export function classifyIntent(message: string): ChatIntent {
  const wantsMentors = MENTOR_WORDS.test(message);
  const wantsChallenges = CHALLENGE_WORDS.test(message);
  const wantsKnowledge = KNOWLEDGE_WORDS.test(message);
  const wantsStartups = STARTUP_WORDS.test(message);

  // No strong signal at all — go broad so a vague "help me find
  // opportunities" still returns something from every category.
  if (!wantsMentors && !wantsChallenges && !wantsKnowledge && !wantsStartups) {
    return { wantsChallenges: true, wantsMentors: true, wantsStartups: true, wantsKnowledge: true };
  }
  return { wantsChallenges, wantsMentors, wantsStartups, wantsKnowledge };
}

// Strips obvious prompt-injection markers from user/admin-submitted free
// text (bios, descriptions, summaries) before it's interpolated into the
// LLM context. Not bulletproof — paired with the system prompt's own
// "treat CONTEXT as data" instruction and the match-hydration design in
// hydrateMatches(), which means even a successful injection can only bias
// which real entity gets picked, never fabricate one.
function sanitize(text: string, maxLen = 140): string {
  if (!text) return "";
  const cleaned = text
    .split("\n")
    .filter((line) => !/^\s*(ignore|system:|###)/i.test(line) && !/system prompt|you are now/i.test(line))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > maxLen ? `${cleaned.slice(0, maxLen)}…` : cleaned;
}

export interface ChatChallengeRow {
  id: string;
  title: string;
  category: string;
  summary: string;
  org_name: string;
  status: string;
  deadline_date: string | null;
  scope_region: string;
}

export interface ChatMentorRow {
  id: string;
  name: string;
  position: string;
  company: string;
  specializations: string[];
  sector: string;
  bio: string;
}

export interface ChatStartupRow {
  id: string;
  name: string;
  tagline: string;
  sector: string;
  lifecycle_stage: string;
  description: string;
}

export interface ChatResourceRow {
  id: string;
  title: string;
  category: string;
  description: string;
  source: string;
  file_url: string;
  link_url: string;
}

export interface ChatChunkRow {
  id: string;
  document_id: string;
  content: string;
  similarity: number;
}

export interface ChatContext {
  challenges: ChatChallengeRow[];
  mentors: ChatMentorRow[];
  startups: ChatStartupRow[];
  resources: ChatResourceRow[];
  documentChunks: ChatChunkRow[];
}

const ROW_CAP = 25;
const DOCUMENT_TOP_K = 5;
const DOCUMENT_SIMILARITY_FLOOR = 0.5;

// Embeds the user's own message and semantic-searches the private document
// knowledge base for the closest chunks via the match_chatbot_chunks() RPC
// (raw vector queries aren't expressible through the JS query builder).
// Fails open to [] on any error — a broken embedding call must never break
// the rest of the chat response, matching how every other query here
// degrades to [] instead of throwing.
async function fetchDocumentChunks(userMessage: string): Promise<ChatChunkRow[]> {
  if (!supabase) return [];
  try {
    const [embedding] = await embedTexts([userMessage]);
    const { data, error } = await supabase.rpc("match_chatbot_chunks", {
      query_embedding: embedding,
      match_count: DOCUMENT_TOP_K,
    });
    if (error || !data) return [];
    return (data as ChatChunkRow[]).filter((r) => r.similarity >= DOCUMENT_SIMILARITY_FLOOR);
  } catch {
    return [];
  }
}

export async function fetchChatContext(intent: ChatIntent, userMessage: string): Promise<ChatContext> {
  if (!supabase) return { challenges: [], mentors: [], startups: [], resources: [], documentChunks: [] };

  const [challengesRes, mentorsRes, startupsRes, resourcesRes, documentChunks] = await Promise.all([
    intent.wantsChallenges
      ? supabase
          .from("challenges")
          .select("id,title,category,summary,org_name,status,deadline_date,scope_region")
          .eq("status", "Open")
          .order("deadline_date", { ascending: true, nullsFirst: false })
          .limit(ROW_CAP)
      : Promise.resolve({ data: [] as any[] }),
    intent.wantsMentors
      ? supabase.from("mentors").select("id,name,position,company,specializations,sector,bio").limit(ROW_CAP)
      : Promise.resolve({ data: [] as any[] }),
    intent.wantsStartups
      ? supabase.from("startups").select("id,name,tagline,sector,lifecycle_stage,description").limit(ROW_CAP)
      : Promise.resolve({ data: [] as any[] }),
    intent.wantsKnowledge
      ? supabase.from("knowledge_resources").select("id,title,category,description,source,file_url,link_url").limit(ROW_CAP)
      : Promise.resolve({ data: [] as any[] }),
    // Always searched, unlike the buckets above — relevance here comes from
    // the embedding similarity floor in fetchDocumentChunks(), not from
    // keyword-matching the user's message, so a query never has to name a
    // document (or use words like "guide"/"report") for a genuinely
    // relevant private doc to surface.
    fetchDocumentChunks(userMessage),
  ]);

  const challenges: ChatChallengeRow[] = (challengesRes.data ?? []).map((r: any) => ({
    id: r.id,
    title: sanitize(r.title, 100),
    category: r.category,
    summary: sanitize(r.summary),
    org_name: sanitize(r.org_name, 80),
    status: r.status,
    deadline_date: r.deadline_date,
    scope_region: r.scope_region,
  }));

  const mentors: ChatMentorRow[] = (mentorsRes.data ?? []).map((r: any) => ({
    id: r.id,
    name: sanitize(r.name, 60),
    position: sanitize(r.position, 60),
    company: sanitize(r.company, 60),
    specializations: Array.isArray(r.specializations) ? r.specializations : [],
    sector: r.sector,
    bio: sanitize(r.bio),
  }));

  const startups: ChatStartupRow[] = (startupsRes.data ?? []).map((r: any) => ({
    id: r.id,
    name: sanitize(r.name, 60),
    tagline: sanitize(r.tagline, 100),
    sector: r.sector,
    lifecycle_stage: r.lifecycle_stage,
    description: sanitize(r.description),
  }));

  const resources: ChatResourceRow[] = (resourcesRes.data ?? []).map((r: any) => ({
    id: r.id,
    title: sanitize(r.title, 100),
    category: r.category,
    description: sanitize(r.description),
    source: sanitize(r.source, 60),
    file_url: r.file_url ?? "",
    link_url: r.link_url ?? "",
  }));

  return { challenges, mentors, startups, resources, documentChunks };
}

export function formatContextBlock(ctx: ChatContext): string {
  const blocks: string[] = [];

  if (ctx.challenges.length) {
    blocks.push(
      "### OPEN CHALLENGES (id | title | category | org | deadline | region | summary)\n" +
        ctx.challenges
          .map((c) => `${c.id} | ${c.title} | ${c.category} | ${c.org_name} | ${c.deadline_date ?? "no deadline"} | ${c.scope_region} | ${c.summary}`)
          .join("\n")
    );
  }
  if (ctx.mentors.length) {
    blocks.push(
      "### MENTORS (id | name | position | company | specializations | sector | bio)\n" +
        ctx.mentors
          .map((m) => `${m.id} | ${m.name} | ${m.position} | ${m.company} | ${m.specializations.join(", ")} | ${m.sector} | ${m.bio}`)
          .join("\n")
    );
  }
  if (ctx.startups.length) {
    blocks.push(
      "### STARTUPS (potential collaborators) (id | name | tagline | sector | stage | description)\n" +
        ctx.startups.map((s) => `${s.id} | ${s.name} | ${s.tagline} | ${s.sector} | ${s.lifecycle_stage} | ${s.description}`).join("\n")
    );
  }
  if (ctx.resources.length) {
    blocks.push(
      "### KNOWLEDGE HUB RESOURCES (id | title | category | source | description)\n" +
        ctx.resources.map((r) => `${r.id} | ${r.title} | ${r.category} | ${r.source} | ${r.description}`).join("\n")
    );
  }
  if (ctx.documentChunks.length) {
    blocks.push(
      "### PRIVATE KNOWLEDGE BASE EXCERPTS (supporting context only — do not cite as a clickable item, just use the information)\n" +
        ctx.documentChunks.map((c) => `- ${sanitize(c.content, 900)}`).join("\n")
    );
  }

  if (!blocks.length) return "No matching data is currently available in any category.";
  return blocks.join("\n\n");
}

export interface ChatCard {
  type: ChatEntityType;
  id: string;
  reason: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
}

const TYPE_TO_KEY: Record<ChatEntityType, keyof ChatContext> = {
  challenge: "challenges",
  mentor: "mentors",
  startup: "startups",
  resource: "resources",
};

// Looks up each {type,id} the model returned in the already-fetched rows
// (no second DB round trip) and maps it into card-shaped data for the
// frontend. Any id the model returns that wasn't in the context is silently
// dropped — the hard guard against hallucinated entities.
export function hydrateMatches(matches: { type: ChatEntityType; id: string; reason: string }[], ctx: ChatContext): ChatCard[] {
  const cards: ChatCard[] = [];
  for (const m of matches) {
    const rows = ctx[TYPE_TO_KEY[m.type]] as any[];
    const row = rows.find((r) => r.id === m.id);
    if (!row) continue;

    if (m.type === "challenge") {
      cards.push({
        type: "challenge",
        id: row.id,
        reason: m.reason,
        title: row.title,
        subtitle: `${row.category} · ${row.org_name}`,
        description: row.summary,
        href: `/challenges/${slugify(row.title || row.id)}`,
      });
    } else if (m.type === "mentor") {
      cards.push({
        type: "mentor",
        id: row.id,
        reason: m.reason,
        title: row.name,
        subtitle: [row.position, row.company].filter(Boolean).join(" · "),
        description: row.bio,
        href: `/ecosystem?tab=mentors&id=${row.id}`,
      });
    } else if (m.type === "startup") {
      cards.push({
        type: "startup",
        id: row.id,
        reason: m.reason,
        title: row.name,
        subtitle: [row.sector, row.lifecycle_stage].filter(Boolean).join(" · "),
        description: row.tagline || row.description,
        href: `/ecosystem?tab=startups&id=${row.id}`,
      });
    } else if (m.type === "resource") {
      cards.push({
        type: "resource",
        id: row.id,
        reason: m.reason,
        title: row.title,
        subtitle: row.category,
        description: row.description,
        href: row.file_url || row.link_url || "/knowledge",
      });
    }
  }
  return cards;
}
