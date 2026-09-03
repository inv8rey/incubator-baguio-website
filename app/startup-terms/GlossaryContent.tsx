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
      { term: "Startup", definition: "A temporary organization designed to search for a repeatable and scalable business model, rather than simply execute a known business model." },
      { term: "Founder", definition: "An individual who starts a startup and takes responsibility for developing the idea, finding customers, building the business, and creating a viable company." },
      { term: "Co-founder", definition: "An individual who starts and builds a startup together with one or more founders, sharing responsibility, ownership, and key decisions." },
      { term: "MVP", definition: "A Minimum Viable Product is the simplest version of a product that allows a startup to test its key assumptions and learn from real customers with minimal time and resources." },
      { term: "Pivot", definition: "A significant change in a startup's product, customer, business model, or strategy based on what has been learned from customers and market evidence." },
      { term: "Product-Market Fit", definition: "The point at which a product solves a meaningful problem for a specific market and customers consistently want, use, and pay for it." },
      { term: "Traction", definition: "Evidence that a startup is gaining real market adoption, demonstrated through indicators such as customers, revenue, usage, retention, growth, or successful partnerships." },
      { term: "Runway", definition: "The amount of time a startup can continue operating before it runs out of cash, based on its available funds and rate of spending." },
      { term: "Burn Rate", definition: "The rate at which a startup spends its cash to operate, typically measured on a monthly basis." },
      { term: "Scalability", definition: "The ability of a business to grow its customers, revenue, or operations without a proportional increase in costs, resources, or complexity." },
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
      { term: "Pre-seed", definition: "The earliest stage of startup funding, typically used to validate a problem, develop an initial product, and test the business idea before raising a larger seed round." },
      { term: "Seed Funding", definition: "Early-stage funding used to develop the product, validate product-market fit, acquire initial customers, and build the foundation for growth." },
      { term: "Series A", definition: "The first major institutional funding round, typically raised by startups with validated demand and early traction to develop a repeatable business model and scale." },
      { term: "Series B", definition: "A later-stage funding round used by startups with a proven business model and significant traction to accelerate growth, expand markets, and scale operations." },
      { term: "Angel Investor", definition: "An individual who invests their own money in an early-stage startup, often providing funding, expertise, mentorship, and connections in exchange for equity or another form of ownership." },
      { term: "Venture Capital (VC)", definition: "Investment from a professional fund into high-growth startups in exchange for equity, typically targeting companies with the potential to achieve significant scale and returns." },
      { term: "Private Equity", definition: "Investment in established companies, usually involving larger amounts of capital and a focus on improving, expanding, or restructuring the business to generate returns." },
      { term: "Equity", definition: "Ownership in a company, usually represented by shares. When a founder gives investors equity, the investor receives a portion of ownership in exchange for their investment." },
      { term: "Valuation", definition: "The estimated monetary value of a company, used to determine how much ownership an investor receives for a given investment." },
      { term: "Cap Table", definition: "A capitalization table that records who owns a company, how much they own, and how ownership changes as shares, options, and investments are issued." },
      { term: "Convertible Note", definition: "A loan that can convert into equity in a future funding round, usually under agreed terms such as an interest rate, maturity date, valuation cap, or discount." },
      { term: "Grant", definition: "Non-dilutive funding provided by a government, institution, foundation, or other organization to support a specific project, activity, or objective, without requiring ownership in return." },
    ],
  },
  {
    id: "ecosystem",
    title: "Ecosystem & Support",
    color: "#1A6B3C",
    terms: [
      { term: "Technology Business Incubator", definition: "An organization that supports early-stage, technology-based startups with resources such as workspace, mentorship, funding linkages, and networking — typically based at a university, research institution, or government program, and working with companies over a longer, less structured timeline than an accelerator." },
      { term: "Accelerator", definition: "A fixed-term, cohort-based program that helps startups grow quickly through mentorship, structured curriculum, and often a small investment — usually culminating in a demo day, and shorter and more intensive than an incubator." },
      { term: "Mentor", definition: "An experienced individual — often a founder, executive, or subject-matter expert — who provides guidance, feedback, and connections to a startup founder, without necessarily holding equity or a formal role." },
      { term: "Co-working Space", definition: "A shared workspace used by founders, freelancers, and small teams, offering desks, meeting rooms, and often a built-in community of other entrepreneurs." },
      { term: "Demo Day", definition: "An event, usually at the end of an accelerator program, where startups pitch their progress to an audience of investors, mentors, and press." },
      { term: "Pitch Deck", definition: "A short slide presentation founders use to explain their business to investors, partners, or customers — typically covering the problem, solution, market, traction, team, and funding ask." },
      { term: "Open Innovation", definition: "An approach where an organization looks outside its own walls — to startups, researchers, or the public — to source and develop new ideas and solutions, rather than relying only on internal R&D." },
      { term: "Startup Ecosystem", definition: "The network of founders, startups, investors, mentors, incubators, accelerators, universities, and government bodies in a given place, whose interactions and support for one another determine how easily new companies can start and grow there." },
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
