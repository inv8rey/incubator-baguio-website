// Path Finder questionnaire, scoring weights, and result content.
//
// Kept in a plain (non-"use client") module so the page shell can import the
// pathway copy for its hero/SEO without pulling the interactive component --
// the same split used for app/dashboard/cofounder/data.ts.

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export type PathKey = "startup" | "msme" | "city";

/**
 * Per-option pathway weights. Absent keys score 0.
 *
 * Deliberately never asks "are you a startup or an MSME?" -- every question
 * is about the user's situation, and the label falls out of the weights.
 * The load-bearing consequence (see the PRD's core principle): being at the
 * idea stage adds almost nothing to `startup` on its own. Q1 "a new business
 * idea" and Q7 "just exploring an idea" are close to neutral, so an
 * idea-stage person building a carinderia lands on MSME via Q3/Q4/Q6, not on
 * Startup by default.
 */
export interface Weights {
  startup?: number;
  msme?: number;
  city?: number;
}

export interface Option {
  /** Stable id -- answers persist to localStorage, so never renumber these. */
  id: string;
  label: string;
  w: Weights;
}

export interface Question {
  id: string;
  /** Short label for the review list on the result screen. */
  short: string;
  text: string;
  help?: string;
  options: Option[];
  /**
   * Skip this question when it cannot tell us anything new. Returns true to
   * skip. Keeps the run near the PRD's 1-2 minute target instead of making
   * people answer "Not applicable" three times.
   */
  skipIf?: (answers: Record<string, string>) => boolean;
}

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    short: "Working on",
    text: "What are you currently working on?",
    options: [
      { id: "idea", label: "A new business idea", w: { startup: 1, msme: 1 } },
      { id: "product", label: "A new product, service, or solution", w: { startup: 3, city: 1 } },
      { id: "existing", label: "An existing business", w: { msme: 4 } },
      { id: "cityproblem", label: "A solution to a problem faced by the City or community", w: { city: 4 } },
      { id: "exploring", label: "I'm still exploring an idea", w: { startup: 1, msme: 1 } },
      { id: "unsure", label: "I'm not sure yet", w: {} },
    ],
  },
  {
    id: "q2",
    short: "Business today",
    text: "Do you currently operate a business?",
    options: [
      { id: "operating", label: "Yes, and it is already operating", w: { msme: 4 } },
      { id: "building", label: "Yes, but it is still being developed", w: { msme: 2, startup: 2 } },
      { id: "wantto", label: "No, but I want to start a business", w: { msme: 2, startup: 1 } },
      { id: "solution", label: "No, I am developing an idea or solution", w: { startup: 2, city: 1 } },
      { id: "unsure", label: "Not sure", w: {} },
    ],
  },
  {
    id: "q3",
    short: "Kind of business",
    text: "What kind of business are you building?",
    help: "If you're not starting a business, pick the last option.",
    // Someone whose business is already running isn't "building" one, and
    // they've already told us so in Q2 -- asking again only adds a question.
    skipIf: (a) => a.q2 === "operating",
    options: [
      {
        id: "traditional",
        label: "A traditional or local business — food, retail, services, tourism, or similar",
        w: { msme: 5 },
      },
      { id: "innovative", label: "A new business built around a product, technology, or innovative solution", w: { startup: 4 } },
      { id: "scalable", label: "A business designed to grow across many customers or markets", w: { startup: 5 } },
      { id: "unsure", label: "I'm not sure yet", w: {} },
      { id: "na", label: "I'm not starting a business", w: { city: 1 } },
    ],
  },
  {
    id: "q4",
    short: "Who you serve",
    text: "Who do you primarily want to serve?",
    options: [
      { id: "market", label: "Customers or a specific market", w: { msme: 2, startup: 1 } },
      { id: "mycustomers", label: "Customers of my existing business", w: { msme: 4 } },
      { id: "city", label: "The City or government", w: { city: 5 } },
      { id: "community", label: "A community or specific group of people", w: { city: 3, msme: 1 } },
      { id: "several", label: "Several markets or communities", w: { startup: 4 } },
      { id: "unsure", label: "I'm still figuring this out", w: {} },
    ],
  },
  {
    id: "q5",
    short: "Main goal",
    text: "What are you mainly trying to achieve?",
    options: [
      { id: "start", label: "Start a new business", w: { msme: 2, startup: 2 } },
      { id: "grow", label: "Improve or grow an existing business", w: { msme: 5 } },
      { id: "test", label: "Build and test a new product, service, or business model", w: { startup: 4 } },
      { id: "solve", label: "Solve a problem faced by the City or community", w: { city: 5 } },
      { id: "orgs", label: "Develop a solution that organizations could use", w: { city: 4, startup: 1 } },
      { id: "unsure", label: "I'm still figuring this out", w: {} },
    ],
  },
  {
    id: "q6",
    short: "How you grow",
    text: "How do you expect your idea or business to grow?",
    options: [
      { id: "local", label: "Mainly by serving customers in my local area", w: { msme: 4 } },
      { id: "steady", label: "By steadily growing an existing business", w: { msme: 4 } },
      { id: "many", label: "By reaching many customers, markets, or locations", w: { startup: 5 } },
      { id: "adopted", label: "By being adopted or used by organizations or government", w: { city: 5 } },
      { id: "nothought", label: "I haven't thought about this yet", w: {} },
      { id: "unsure", label: "I'm not sure", w: {} },
    ],
  },
  {
    id: "q7",
    short: "Stage",
    text: "What stage are you currently in?",
    options: [
      { id: "exploring", label: "Just exploring an idea", w: {} },
      { id: "developing", label: "Developing a product, service, or prototype", w: { startup: 2, city: 1 } },
      { id: "testing", label: "Testing with potential users or customers", w: { startup: 3 } },
      { id: "preparing", label: "Preparing to start operating", w: { msme: 3, startup: 1 } },
      { id: "selling", label: "Already selling or operating", w: { msme: 4 } },
      { id: "growing", label: "Growing an existing business", w: { msme: 5 } },
      { id: "adoption", label: "Preparing a solution for testing or adoption", w: { city: 4 } },
    ],
  },
  {
    id: "q8",
    short: "Who benefits",
    text: "Who would benefit most if your idea succeeds?",
    options: [
      { id: "customers", label: "Customers", w: { msme: 2, startup: 1 } },
      { id: "mybusiness", label: "My business and its customers", w: { msme: 4 } },
      { id: "city", label: "The City or government", w: { city: 5 } },
      { id: "community", label: "A specific community or group", w: { city: 3 } },
      { id: "multiple", label: "Multiple markets or communities", w: { startup: 3, city: 1 } },
      { id: "unsure", label: "I'm not sure yet", w: {} },
    ],
  },
  {
    id: "q9",
    short: "Support needed",
    text: "What kind of support do you need most right now?",
    options: [
      { id: "planning", label: "Business planning and development", w: { msme: 3 } },
      { id: "mentoring", label: "Startup mentoring and business model development", w: { startup: 4 } },
      { id: "improve", label: "Business improvement and growth", w: { msme: 4 } },
      { id: "funding", label: "Funding or investment", w: { startup: 2, msme: 1 } },
      { id: "product", label: "Product or solution development", w: { startup: 2, city: 2 } },
      { id: "partners", label: "Finding customers or partners", w: { msme: 2, startup: 1 } },
      { id: "orgs", label: "Connecting with organizations or the City", w: { city: 5 } },
      { id: "unsure", label: "I'm not sure where to start", w: {} },
    ],
  },
  {
    id: "q10",
    short: "Next step",
    text: "What would you like to do next?",
    options: [
      { id: "build", label: "Start or build my business", w: { msme: 3, startup: 1 } },
      { id: "grow", label: "Grow or improve my existing business", w: { msme: 5 } },
      { id: "develop", label: "Develop and test my new solution", w: { startup: 4 } },
      { id: "cityproblem", label: "Find an organization or City problem I can help solve", w: { city: 5 } },
      { id: "connect", label: "Find opportunities, mentors, or partners", w: { startup: 1, msme: 1, city: 1 } },
      { id: "unsure", label: "I'm not sure", w: {} },
    ],
  },
];

export interface Action {
  title: string;
  desc: string;
  href: string;
}

export interface Pathway {
  key: PathKey;
  name: string;
  tagline: string;
  /** Shown as "Your path: X" body copy. */
  summary: string;
  /** One-line description used on the About entry point and the hero. */
  blurb: string;
  color: string;
  icon: string;
  actions: Action[];
}

export const PATHWAYS: Record<PathKey, Pathway> = {
  startup: {
    key: "startup",
    name: "Startup",
    tagline: "Building a new, scalable venture",
    summary:
      "You're building a new and potentially scalable business around a product, service, or solution. Your next moves are about validating it, finding the right people, and getting it ready to grow.",
    blurb: "Founders building a new business around a product, service, or solution.",
    color: "#F26522",
    // Rocket
    icon: `<path d="M5 14.5 3 21l6.5-2"></path><path d="M14.5 5.5C17.5 2.5 21.5 2.5 21.5 2.5s0 4-3 7L11 17l-4-4Z"></path><circle cx="15.5" cy="8.5" r="1.3"></circle>`,
    actions: [
      { title: "Find a Mentor", desc: "Connect with mentors and experts in the Baguio ecosystem.", href: `${BP}/ecosystem?tab=Mentors` },
      { title: "Explore Funding", desc: "Grants, competitions, and investment opportunities.", href: `${BP}/knowledge?category=${encodeURIComponent("Funding & Opportunities")}` },
      { title: "Find Partners", desc: "Browse startups, TBIs, academe, and service providers.", href: `${BP}/ecosystem` },
      { title: "Join Programs", desc: "Incubation, training, and acceleration support.", href: `${BP}/programs` },
    ],
  },
  msme: {
    key: "msme",
    name: "MSME / Business",
    tagline: "Growing a business that serves a market",
    summary:
      "You're operating or developing a business and looking to improve, grow, or expand it. Your next moves are about strengthening operations, reaching more customers, and finding the right support.",
    blurb: "Existing businesses, and people developing a traditional or local business.",
    color: "#2F7D5B",
    // Storefront
    icon: `<path d="M3 9.5 4.8 4h14.4L21 9.5"></path><path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"></path><path d="M5 11.8V20h14v-8.2"></path><path d="M10 20v-5h4v5"></path>`,
    actions: [
      { title: "Find a Mentor", desc: "Get guidance from business mentors and advisers.", href: `${BP}/ecosystem?tab=Mentors` },
      { title: "Find Partners", desc: "Suppliers, service providers, and collaborators near you.", href: `${BP}/ecosystem?tab=${encodeURIComponent("Service Providers")}` },
      { title: "Explore Opportunities", desc: "Funding, grants, and programs open to MSMEs.", href: `${BP}/knowledge?category=${encodeURIComponent("Funding & Opportunities")}` },
      { title: "Access Innovation Support", desc: "Research, technology, and innovation resources.", href: `${BP}/knowledge?category=${encodeURIComponent("Research & Innovation")}` },
    ],
  },
  city: {
    key: "city",
    name: "City Adoption",
    tagline: "A solution the City or community can use",
    summary:
      "You're developing a product, technology, service, or solution that could be piloted, adopted, or donated to the City or another public organization. Your next moves are about finding the right problem owner and testing with them.",
    blurb: "Solutions that the City, government, or a community could pilot and adopt.",
    color: "#2F6DB5",
    // Classical building
    icon: `<path d="M3 21h18M4 21V10M20 21V10M12 3 3 8h18l-9-5Z"></path><path d="M8 21V12M12 21V12M16 21V12"></path>`,
    actions: [
      { title: "Explore Challenges", desc: "Real problems posted by the City and partner organizations.", href: `${BP}/challenges` },
      { title: "Find Partners", desc: "Government units, academe, and organizations to build with.", href: `${BP}/ecosystem?tab=Government` },
      { title: "Explore Pilot Opportunities", desc: "Community challenges open for testing and deployment.", href: `${BP}/challenges/community` },
      { title: "Connect with the City", desc: "Reach the Incubator Baguio team at CPDSO.", href: `${BP}/contact` },
    ],
  },
};

export const PATH_ORDER: PathKey[] = ["startup", "msme", "city"];

export interface Result {
  primary: PathKey;
  /** Second place, only when it's close enough to be worth naming. */
  alternative: PathKey | null;
  /** Answers that contributed most to the primary path, strongest first. */
  reasons: { question: string; answer: string }[];
  scores: Record<PathKey, number>;
  /** True when nothing scored meaningfully -- mostly "I'm not sure" answers. */
  unclear: boolean;
}

/** A second path is worth naming only if it's within this share of the winner. */
const ALTERNATIVE_THRESHOLD = 0.7;
/** Below this, the answers didn't actually point anywhere. */
const MIN_CONFIDENT_SCORE = 6;

export function score(answers: Record<string, string>): Result {
  const scores: Record<PathKey, number> = { startup: 0, msme: 0, city: 0 };
  const contributions: { question: string; answer: string; weight: number }[] = [];

  // Scored against the *visible* set, not all ten: going back and changing an
  // answer can hide a later question (Q2 "already operating" hides Q3), and
  // the now-stranded answer must stop counting.
  const asked = visibleQuestions(answers);

  for (const q of asked) {
    const chosen = answers[q.id];
    if (!chosen) continue;
    const opt = q.options.find((o) => o.id === chosen);
    if (!opt) continue;
    for (const key of PATH_ORDER) scores[key] += opt.w[key] ?? 0;
  }

  const ranked = [...PATH_ORDER].sort((a, b) => scores[b] - scores[a]);
  const primary = ranked[0];
  const runnerUp = ranked[1];

  // Reasons are computed against the winner, so this has to run after the sort.
  for (const q of asked) {
    const chosen = answers[q.id];
    if (!chosen) continue;
    const opt = q.options.find((o) => o.id === chosen);
    const weight = opt?.w[primary] ?? 0;
    if (opt && weight > 0) contributions.push({ question: q.short, answer: opt.label, weight });
  }
  contributions.sort((a, b) => b.weight - a.weight);

  const unclear = scores[primary] < MIN_CONFIDENT_SCORE;
  const alternative =
    !unclear && scores[runnerUp] > 0 && scores[runnerUp] >= scores[primary] * ALTERNATIVE_THRESHOLD ? runnerUp : null;

  return {
    primary,
    alternative,
    reasons: contributions.slice(0, 3).map(({ question, answer }) => ({ question, answer })),
    scores,
    unclear,
  };
}

/** Questions actually shown, given what's been answered so far. */
export function visibleQuestions(answers: Record<string, string>): Question[] {
  return QUESTIONS.filter((q) => !q.skipIf?.(answers));
}
