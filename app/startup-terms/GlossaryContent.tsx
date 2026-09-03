const DARK = "#1A1714";
const BODY = "#44444C";
const MUTED = "#8B8479";

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface Category {
  id: string;
  title: string;
  color: string;
  intro?: string;
  terms: GlossaryTerm[];
}

// Definitions for terms that belong to a named framework (Lean Startup, Y
// Combinator's own vocabulary, Design Thinking / Human-Centered Design) are
// written to match that framework's actual meaning rather than a generic
// paraphrase -- e.g. MVP and Pivot are Lean Startup's definitions, Traction
// and Product-Market Fit are the Y Combinator / Andreessen formulations.
// Local/institutional terms are sourced from this site's own About page.
const CATEGORIES: Category[] = [
  {
    id: "startup-basics",
    title: "Startup Basics",
    color: "#F26522",
    terms: [
      { term: "Startup", definition: "A temporary organization designed to search for a repeatable and scalable business model — distinct from a small business, which typically executes a known, proven model." },
      { term: "Founder", definition: "A person who starts a company and takes on the risk of building it from nothing, usually carrying broad, undefined responsibility across the business in its early stages." },
      { term: "Co-founder", definition: "One of two or more people who start a company together, typically sharing equity, risk, and founding decisions from day one." },
      { term: "MVP (Minimum Viable Product)", definition: "The version of a new product that allows a team to collect the maximum amount of validated learning about customers with the least effort — not simply \"an early, rough version,\" but the smallest experiment that completes one full turn of the Build-Measure-Learn loop." },
      { term: "Pivot", definition: "A structured course correction designed to test a new fundamental hypothesis about a product, strategy, or engine of growth — a deliberate strategic change, not just \"changing direction\" on a whim." },
      { term: "Product-Market Fit", definition: "Being in a good market with a product that can satisfy that market — the point at which customer demand for a product is strong enough that the company's main challenge becomes scaling, not finding customers." },
      { term: "Traction", definition: "Quantitative evidence of customer demand — growth in usage, revenue, or engagement that shows a startup's idea is working, as opposed to opinions or anecdotes about potential." },
      { term: "Bootstrapping", definition: "Building and growing a company using personal finances or the business's own revenue, without raising outside investment." },
      { term: "Runway", definition: "The amount of time a company can continue operating before it runs out of cash, at its current rate of spending." },
      { term: "Burn Rate", definition: "The rate at which a company spends its cash reserves before generating positive cash flow, usually measured per month." },
      { term: "Scalability", definition: "The capacity of a business to grow revenue significantly faster than it grows costs, so that growth doesn't require a proportional increase in resources." },
    ],
  },
  {
    id: "methods",
    title: "Lean Startup & Design Thinking Methods",
    color: "#3A5FA0",
    intro: "Frameworks widely used across the startup and innovation world — including by Y Combinator, IDEO, and the Stanford d.school — for building the right thing and testing it quickly.",
    terms: [
      { term: "Lean Startup", definition: "A methodology (developed by Eric Ries) for developing businesses and products that shortens product-development cycles by adopting a combination of business-hypothesis-driven experimentation, iterative product releases, and validated learning." },
      { term: "Build-Measure-Learn", definition: "The core feedback loop of the Lean Startup method: build a minimum viable product, measure how customers actually respond, and learn whether to persevere or pivot — then repeat." },
      { term: "Validated Learning", definition: "Rigorous, empirical evidence — gathered by testing a hypothesis with real customers — that a startup's assumptions about its business are true, as distinct from opinions, guesses, or vanity metrics." },
      { term: "Innovation Accounting", definition: "A quantitative approach (from Lean Startup) to measuring progress when the standard metrics of an established business don't yet apply — setting a baseline, tuning the engine, and deciding whether to pivot or persevere." },
      { term: "Design Thinking", definition: "A human-centered, iterative approach to innovation (popularized by the Stanford d.school and IDEO) that moves through Empathize, Define, Ideate, Prototype, and Test — grounding solutions in a deep understanding of real user needs rather than assumptions." },
      { term: "Human-Centered Design (HCD)", definition: "A creative approach to problem-solving that starts with the people you're designing for and ends with solutions tailored to their needs — the foundation IDEO and the d.school built Design Thinking on." },
      { term: "Empathize, Ideate, Prototype, Test", definition: "Four of the five core Design Thinking stages: Empathize (understand real users through observation and engagement), Ideate (generate a wide range of possible solutions), Prototype (build a quick, low-cost version of an idea), and Test (put the prototype in front of real users and learn from their reaction)." },
      { term: "Design Sprint", definition: "A time-boxed, five-phase process (originated at Google Ventures) for answering critical business questions by designing, prototyping, and testing ideas with users — typically compressed into about a week." },
    ],
  },
  {
    id: "funding",
    title: "Funding & Investment",
    color: "#9E2A52",
    terms: [
      { term: "Pre-Seed", definition: "The earliest stage of startup funding, typically used to validate an idea and build an initial MVP, often funded by founders, friends and family, or very early angel investors." },
      { term: "Seed Funding", definition: "The first official round of outside investment a startup raises, usually used to fund product development and initial market validation before a larger Series A round." },
      { term: "Series A / Series B", definition: "Later funding rounds that follow seed funding — Series A typically funds scaling a proven business model, and Series B funds further growth and market expansion. Each letter marks a new round, usually at a higher valuation." },
      { term: "Angel Investor", definition: "An individual who provides capital for a startup, usually in exchange for equity, often at an earlier and smaller scale than a venture capital firm." },
      { term: "Venture Capital (VC)", definition: "Financing provided by firms to startups and small businesses believed to have long-term growth potential, in exchange for equity, typically at seed stage and beyond." },
      { term: "Equity", definition: "Ownership interest in a company, usually represented as shares — what founders give up in exchange for investment capital." },
      { term: "Valuation", definition: "An estimate of what a company is worth, used to determine how much equity an investor receives in exchange for a given amount of funding." },
      { term: "Cap Table", definition: "Short for \"capitalization table\" — a record of who owns what percentage of a company, including founders, investors, and employees with equity." },
      { term: "Convertible Note", definition: "A short-term debt instrument that converts into equity, typically at a discount, at a future funding round rather than being repaid in cash." },
      { term: "Grant", definition: "Non-dilutive funding — money awarded to a startup or researcher that doesn't require giving up equity or being repaid, often from a government agency or foundation." },
      { term: "Bridge Round", definition: "A smaller funding round raised between two larger rounds, meant to extend a company's runway until it can raise its next major round or reach profitability." },
    ],
  },
  {
    id: "ecosystem",
    title: "Ecosystem & Support",
    color: "#1A6B3C",
    terms: [
      { term: "Incubator", definition: "An organization that supports early-stage startups with resources such as mentorship, workspace, and networking — typically working with companies still shaping their idea or business model, over a longer and less structured timeline than an accelerator." },
      { term: "Accelerator", definition: "A fixed-term, cohort-based program that helps startups grow quickly through mentorship, structured curriculum, and often a small investment — usually culminating in a demo day, and shorter and more intensive than an incubator." },
      { term: "TBI (Technology Business Incubator)", definition: "A formally recognized incubator, often based at a university or research institution, that supports the commercialization of technology-based startups and research outputs." },
      { term: "Mentor", definition: "An experienced individual — often a founder, executive, or subject-matter expert — who provides guidance, feedback, and connections to a startup founder, without necessarily holding equity or a formal role." },
      { term: "Co-working Space", definition: "A shared workspace used by founders, freelancers, and small teams, offering desks, meeting rooms, and often a built-in community of other entrepreneurs." },
      { term: "Demo Day", definition: "An event, usually at the end of an accelerator program, where startups pitch their progress to an audience of investors, mentors, and press." },
      { term: "Pitch Deck", definition: "A short slide presentation founders use to explain their business to investors, partners, or customers — typically covering the problem, solution, market, traction, team, and funding ask." },
      { term: "Open Innovation", definition: "An approach where an organization looks outside its own walls — to startups, researchers, or the public — to source and develop new ideas and solutions, rather than relying only on internal R&D." },
      { term: "Challenge", definition: "A problem statement published by an organization (government, industry, or academia) inviting innovators, startups, or researchers to propose and submit solutions." },
    ],
  },
  {
    id: "business-legal",
    title: "Business & Legal",
    color: "#D9531E",
    terms: [
      { term: "Business Model Canvas", definition: "A one-page strategic template (developed by Alexander Osterwalder) for describing, designing, and testing a business model across nine building blocks — from customer segments and value proposition to revenue streams and cost structure." },
      { term: "Intellectual Property (IP)", definition: "Legal rights over creations of the mind — including inventions, designs, brand names, and creative works — that allow an owner to control and benefit from their use." },
      { term: "Patent", definition: "A government-granted right that gives an inventor exclusive control over an invention for a limited period, in exchange for publicly disclosing how it works." },
      { term: "Trademark", definition: "A recognizable sign, name, or logo legally registered to identify a company's products or services and distinguish them from competitors." },
      { term: "Sole Proprietorship", definition: "A business owned and run by one person, with no legal distinction between the owner and the business — the simplest and most common structure for a solo founder in the Philippines, registered with the DTI." },
      { term: "Corporation", definition: "A business structure that is legally separate from its owners, able to own property, incur debt, and be taxed independently — in the Philippines, registered with the SEC." },
      { term: "DTI Registration", definition: "Registration of a business name with the Department of Trade and Industry, required for a sole proprietorship operating in the Philippines." },
      { term: "SEC Registration", definition: "Registration with the Securities and Exchange Commission, required for a partnership or corporation operating in the Philippines." },
    ],
  },
  {
    id: "local",
    title: "Local & Incubator Baguio",
    color: "#285E7A",
    intro: "Terms and acronyms specific to how Baguio City's own innovation ecosystem is organized.",
    terms: [
      { term: "Incubator Baguio", definition: "A City Government of Baguio initiative, established through City Ordinance No. 063, Series of 2023, that connects government, academia, industry, researchers, startups, and communities to strengthen Baguio's innovation ecosystem." },
      { term: "Baguio City Research and Innovation Alliance", definition: "The formal body created by Ordinance No. 063, Series of 2023, under which Incubator Baguio operates." },
      { term: "Research and Innovation Agenda (RIA)", definition: "Baguio City's guiding framework for research and innovation priorities, which Incubator Baguio's programs and connections are organized around." },
      { term: "Ordinance No. 063, Series of 2023", definition: "The City Ordinance that formally established Incubator Baguio and the Baguio City Research and Innovation Alliance." },
      { term: "CPDSO", definition: "The City Planning, Development and Sustainability Office — the City Government office under which the Baguio City Research and Innovation Alliance was created." },
      { term: "Lifecycle Stage", definition: "How a startup's progress is tracked on this platform, from Idea (concept stage, pre-product) to MVP (early product in testing) to Launch (live in market) to Growth (scaling an established product)." },
    ],
  },
];

export default function GlossaryContent() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 40, alignItems: "start" }} className="ib-terms-grid">
      {/* CATEGORY NAV */}
      <nav className="ib-terms-toc" style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 2, maxHeight: "calc(100vh - 48px)", overflowY: "auto", paddingRight: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>Categories</div>
        {CATEGORIES.map((c) => (
          <a key={c.id} href={`#${c.id}`} style={{ fontSize: 12.5, color: BODY, textDecoration: "none", padding: "5px 0", lineHeight: 1.4 }} className="ib-footlink">
            {c.title}
          </a>
        ))}
      </nav>

      {/* BODY */}
      <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: "40px 44px", minWidth: 0 }}>
        <p style={{ margin: "0 0 32px", fontSize: 15, lineHeight: 1.7, color: BODY }}>
          Plain-language definitions of the words you&rsquo;ll run into most often while exploring startups, funding, and innovation programs — whether here on Incubator Baguio or anywhere else in the startup world.
        </p>

        {CATEGORIES.map((c) => (
          <section key={c.id} id={c.id} style={{ marginBottom: 36, paddingTop: 8, borderTop: "1px solid rgba(64,50,34,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 6px" }}>
              <span style={{ width: 7, height: 7, borderRadius: 9999, background: c.color, flexShrink: 0 }} />
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>{c.title}</h2>
            </div>
            {c.intro && <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.6, color: MUTED }}>{c.intro}</p>}
            <dl style={{ margin: c.intro ? 0 : "12px 0 0", display: "flex", flexDirection: "column", gap: 16 }}>
              {c.terms.map((t) => (
                <div key={t.term}>
                  <dt style={{ fontSize: 14.5, fontWeight: 700, color: DARK, marginBottom: 3 }}>{t.term}</dt>
                  <dd style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: BODY }}>{t.definition}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
