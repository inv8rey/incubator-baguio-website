const DARK = "#1A1714";
const ORANGE = "#F26522";
const BODY = "#44444C";
const MUTED = "#6E685F";

type Block =
  | { type: "p"; text: React.ReactNode }
  | { type: "ul"; items: React.ReactNode[] }
  | { type: "h3"; text: string }
  | { type: "quote"; text: React.ReactNode };

interface Section {
  num: number;
  id: string;
  title: string;
  blocks: Block[];
}

const p = (text: React.ReactNode): Block => ({ type: "p", text });
const ul = (items: React.ReactNode[]): Block => ({ type: "ul", items });
const h3 = (text: string): Block => ({ type: "h3", text });
const quote = (text: React.ReactNode): Block => ({ type: "quote", text });

const SECTIONS: Section[] = [
  {
    num: 1,
    id: "who-we-are",
    title: "Who We Are",
    blocks: [
      p("Incubator Baguio is a City Government of Baguio initiative established through City Ordinance No. 063, Series of 2023."),
      p("The platform supports Baguio City's innovation ecosystem by connecting innovators, startups, researchers, students, mentors, organizations, government, academia, industry, and other ecosystem participants."),
      p("Incubator Baguio serves as a platform for activities such as:"),
      ul([
        "Innovation and startup support",
        "Open innovation challenges",
        "Programs and opportunities",
        "Organization and ecosystem profiles",
        "Mentor and expert connections",
        "Knowledge and resource sharing",
        "Events and activities",
        "Innovation and startup profiles",
        "Collaboration and referrals",
        "Ecosystem research and intelligence",
      ]),
    ],
  },
  {
    num: 2,
    id: "commitment",
    title: "Our Commitment to Data Privacy",
    blocks: [
      p("Incubator Baguio processes personal information in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173), its implementing rules and regulations, and applicable issuances of the National Privacy Commission."),
      p("Our processing follows the principles of:"),
      h3("Transparency"),
      p("We explain how and why personal information is collected and used."),
      h3("Legitimate Purpose"),
      p("We collect and process information only for declared, specific, and legitimate purposes."),
      h3("Proportionality"),
      p("We collect only information that is adequate, relevant, and necessary for the purpose for which it is processed."),
    ],
  },
  {
    num: 3,
    id: "information-we-collect",
    title: "What Personal Information We Collect",
    blocks: [
      p("The information we collect depends on how you use the platform."),
      h3("Account Information"),
      p("When you create an account, we may collect:"),
      ul(["Full name", "Email address", "Password or authentication information", "Account type", "Account preferences", "Profile information"]),
      h3("Profile Information"),
      p("If you create an ecosystem profile, we may collect information such as:"),
      ul([
        "Profile name",
        "Professional or organizational role",
        "Biography or description",
        "Areas of expertise",
        "Areas of interest",
        "Location",
        "Contact information",
        "Website and social media links",
        "Professional background",
        "Innovation or startup information",
      ]),
      p("You decide which information you provide for your public profile."),
      h3("Organization Information"),
      p("If you create or manage an organization profile, we may collect:"),
      ul([
        "Organization name",
        "Organization type",
        "Organization description",
        "Logo",
        "Address or location",
        "Areas of focus",
        "Contact information",
        "Website and social links",
        "Programs and services",
        "Authorized representatives",
        "Organization membership information",
        "Other information submitted for the organization's profile",
      ]),
      h3("Platform Activity"),
      p("We may collect information about how you interact with the platform, including:"),
      ul([
        "Challenges you view, save, submit, or participate in",
        "Events you view, save, or submit",
        "Resources you upload or access",
        "Organizations you follow or interact with",
        "Mentors or ecosystem participants you connect with",
        "Applications or submissions",
        "Saved opportunities",
        "Other activities performed through your account",
      ]),
      h3("Technical Information"),
      p("When you access the platform, certain technical information may be collected automatically, depending on the technologies implemented on the platform."),
      p("This may include:"),
      ul([
        "IP address",
        "Browser type",
        "Device information",
        "Operating system",
        "Date and time of access",
        "Pages or features accessed",
        "Referring website or platform",
        "Basic usage and security logs",
      ]),
      p("The specific technical information collected will depend on the platform's actual configuration."),
    ],
  },
  {
    num: 4,
    id: "how-we-use",
    title: "How We Use Your Information",
    blocks: [
      p("We process personal information for purposes including:"),
      h3("Account Management"),
      p("To:"),
      ul(["Create and manage your account", "Authenticate users", "Maintain account security", "Verify account information", "Provide access to platform features"]),
      h3("Ecosystem Participation"),
      p("To help you:"),
      ul([
        "Build an innovation profile",
        "Discover opportunities",
        "Connect with mentors",
        "Discover organizations",
        "Find potential collaborators",
        "Participate in challenges",
        "Discover events and resources",
        "Contribute to the ecosystem",
      ]),
      h3("Organization Management"),
      p("For organization accounts, information may be used to:"),
      ul(["Create and maintain organization profiles", "Verify organizations", "Manage authorized organization users", "Publish organization information", "Facilitate ecosystem connections"]),
      h3("Open Innovation"),
      p("Information may be processed to facilitate:"),
      ul(["Challenge participation", "Solution submissions", "Connections between challenge owners and innovators", "Innovation referrals", "Pilot or collaboration opportunities"]),
      h3("Programs and Activities"),
      p("We may process information to administer:"),
      ul(["Incubation and entrepreneurship activities", "Innovation programs", "Learning activities", "Mentoring", "Events", "Community activities", "Other ecosystem initiatives"]),
      h3("Ecosystem Intelligence"),
      p("Incubator Baguio may use appropriately handled and protected information to understand the development of Baguio City's innovation ecosystem."),
      p("This may include generating aggregated or statistical insights about areas such as:"),
      ul(["Ecosystem participation", "Innovation activity", "Startup activity", "Organization participation", "Challenges", "Programs", "Events", "Collaboration"]),
      p("Where possible, information used for reporting and ecosystem insights should be aggregated or anonymized so individuals are not unnecessarily identified."),
      h3("Platform Security"),
      p("We may process information to:"),
      ul(["Detect unauthorized activity", "Protect accounts", "Investigate security incidents", "Prevent fraud or abuse", "Maintain platform integrity"]),
      h3("Government and Administrative Functions"),
      p("As a City Government initiative, information may also be processed when necessary for legitimate government functions, legal obligations, administrative requirements, records management, or other purposes authorized by applicable law."),
    ],
  },
  {
    num: 5,
    id: "legal-basis",
    title: "Legal Basis for Processing",
    blocks: [
      p("Depending on the specific processing activity, Incubator Baguio may process personal information based on applicable lawful criteria under the Data Privacy Act, including:"),
      ul([
        "Your consent",
        "Performance of a contract or service",
        "Compliance with a legal obligation",
        "Protection of vital interests",
        "A lawful function of a public authority or government institution",
        "Legitimate interests, where applicable and where your rights and freedoms are appropriately considered",
      ]),
      p("Not all processing activities rely on consent."),
      p("A privacy notice informs you about processing. It is not itself a substitute for consent where consent is the applicable lawful basis."),
    ],
  },
  {
    num: 6,
    id: "public-information",
    title: "Information You Choose to Make Public",
    blocks: [
      p("Some features of the platform are designed to make ecosystem information discoverable."),
      p("If you choose to publish a profile, organization, innovation, event, challenge, resource, or other information publicly, some of the information you provide may be visible to other platform visitors."),
      p("For example, public information may include:"),
      ul([
        "Name",
        "Organization",
        "Profile description",
        "Areas of expertise",
        "Areas of focus",
        "Public contact information",
        "Website or social links",
        "Innovation information",
        "Public events",
        "Public resources",
        "Public opportunities",
      ]),
      p("Before publishing information, review what you are submitting."),
      quote("Do not publish confidential, proprietary, or sensitive information unless you are certain it is appropriate for public disclosure."),
      p("This is particularly important for unpublished inventions, trade secrets, confidential research, and patent-sensitive information."),
    ],
  },
  {
    num: 7,
    id: "organization-profiles",
    title: "Organization Profiles",
    blocks: [
      p("Organization profiles may be publicly displayed to help ecosystem participants discover and connect with organizations."),
      p("If you manage an organization profile, you are responsible for ensuring that:"),
      ul([
        "You are authorized to represent the organization.",
        "Information submitted is accurate.",
        "Information intended to be public is appropriate for publication.",
        "Authorized users have appropriate access.",
      ]),
      p("Incubator Baguio may review organization profiles before they become publicly visible."),
    ],
  },
  {
    num: 8,
    id: "sharing",
    title: "Information Sharing and Disclosure",
    blocks: [
      p("Incubator Baguio does not sell personal information."),
      p("We may disclose or provide access to personal information when reasonably necessary for legitimate and lawful purposes, including to:"),
      h3("Authorized Personnel"),
      p("City Government personnel and authorized Incubator Baguio administrators who need access to perform their responsibilities."),
      h3("Service Providers"),
      p("Third-party providers that help operate the platform or provide services such as:"),
      ul(["Hosting", "Authentication", "Email delivery", "Cloud storage", "Security", "Analytics", "Technical maintenance"]),
      p("Where third-party providers process personal information on behalf of Incubator Baguio, appropriate contractual and organizational safeguards should be maintained."),
      h3("Ecosystem Partners"),
      p("Where appropriate and legally permitted, information may be shared with government agencies, academic institutions, industry partners, ecosystem organizations, program partners, or other stakeholders to facilitate a specific ecosystem activity or service."),
      p("Where sharing is required, Incubator Baguio will apply appropriate legal and privacy safeguards."),
      h3("Government Agencies"),
      p("Information may be shared with other government entities when permitted or required by applicable law or when necessary for a lawful government function."),
      h3("Legal and Regulatory Authorities"),
      p("Information may be disclosed when required by law, regulation, court order, lawful government request, or other applicable legal process."),
    ],
  },
  {
    num: 9,
    id: "public-vs-private",
    title: "Public Information vs. Private Information",
    blocks: [
      p("We distinguish between information intended for public ecosystem discovery and information used primarily for account administration."),
      h3("Public-facing information"),
      p("Information you intentionally submit for publication may be displayed publicly."),
      h3("Account and administrative information"),
      p("Information such as authentication credentials, account records, internal administrative information, and other restricted information is not intended for public display."),
      p("However, information may still be disclosed where legally required or necessary for legitimate platform operations."),
    ],
  },
  {
    num: 10,
    id: "retention",
    title: "Data Retention",
    blocks: [
      p("We retain personal information only for as long as reasonably necessary for the purpose for which it was collected, or for as long as required or permitted by applicable laws, government records requirements, administrative requirements, dispute resolution, security, or other lawful purposes."),
      p("Retention periods may therefore differ depending on the type of information and the purpose of processing."),
      p("When personal information is no longer required, it should be securely deleted, anonymized, or otherwise disposed of in accordance with applicable requirements."),
      quote("Specific retention periods for each category of information should be published once Incubator Baguio and the City Government's appropriate privacy and records-management authorities have finalized them."),
    ],
  },
  {
    num: 11,
    id: "security",
    title: "Data Security",
    blocks: [
      p("Incubator Baguio takes reasonable organizational, physical, and technical measures to protect personal information against:"),
      ul(["Unauthorized access", "Unauthorized disclosure", "Loss", "Destruction", "Alteration", "Misuse", "Other unlawful processing"]),
      p("Security measures may include:"),
      ul(["Access controls", "Authentication mechanisms", "User permissions", "Secure data transmission", "Monitoring and logging", "System maintenance", "Backup procedures", "Security reviews", "Staff awareness and privacy practices"]),
      p("No online system can guarantee absolute security. If a security incident involving personal information occurs, Incubator Baguio will respond in accordance with applicable laws, regulations, and internal incident-response procedures."),
    ],
  },
  {
    num: 12,
    id: "cookies",
    title: "Cookies and Similar Technologies",
    blocks: [
      p("The platform may use cookies and similar technologies to support functionality, security, preferences, analytics, or other legitimate platform purposes."),
      p("Depending on the technologies implemented, these may include:"),
      ul(["Essential cookies", "Authentication cookies", "Preference cookies", "Analytics technologies", "Security technologies"]),
      p("You may be able to manage cookies through your browser settings."),
      p("If Incubator Baguio introduces non-essential cookies or tracking technologies that require additional notice or consent, the appropriate notice or consent mechanism will be provided."),
    ],
  },
  {
    num: 13,
    id: "third-party",
    title: "Third-Party Websites and Services",
    blocks: [
      p("The platform may contain links to external websites, social media pages, registration systems, partner platforms, or other third-party services."),
      p("When you leave the Incubator Baguio platform, the privacy practices of the third-party service will apply."),
      p("Incubator Baguio does not control the privacy policies or practices of third-party websites."),
      p("We recommend reviewing the privacy policy of any third-party service before providing personal information."),
    ],
  },
  {
    num: 14,
    id: "minors",
    title: "Minors",
    blocks: [
      p("The platform is intended primarily for participants in the innovation ecosystem."),
      p("Where personal information relating to minors is collected, Incubator Baguio will apply the safeguards required by applicable law and relevant privacy guidance."),
      p("Where appropriate, participation may require the involvement or authorization of a parent, guardian, school, or other authorized institution."),
    ],
  },
  {
    num: 15,
    id: "your-rights",
    title: "Your Rights as a Data Subject",
    blocks: [
      p("Under the Data Privacy Act, you may have the right to:"),
      h3("Right to Be Informed"),
      p("To know whether your personal information is being processed and how it is processed."),
      h3("Right to Access"),
      p("To request access to personal information about you that is being processed, subject to applicable limitations."),
      h3("Right to Rectification"),
      p("To request correction of inaccurate or incomplete personal information."),
      h3("Right to Object"),
      p("To object to certain processing of your personal information where the applicable conditions under law are met."),
      h3("Right to Erasure or Blocking"),
      p("To request the removal, blocking, or deletion of personal information where legally warranted."),
      h3("Right to Data Portability"),
      p("Where applicable, to obtain and electronically transfer personal information in a structured and commonly used format."),
      h3("Right to File a Complaint"),
      p("To raise a privacy concern with Incubator Baguio and, where appropriate, file a complaint with the National Privacy Commission."),
      h3("Right to Damages"),
      p("Where applicable under law, to seek compensation for damages resulting from unlawful or unauthorized processing."),
      p("These rights are subject to the limitations and conditions provided by the Data Privacy Act and other applicable laws."),
    ],
  },
  {
    num: 16,
    id: "exercise-rights",
    title: "How to Exercise Your Privacy Rights",
    blocks: [
      p("If you want to:"),
      ul([
        "Access your personal information",
        "Correct your information",
        "Request deletion or blocking",
        "Object to processing",
        "Ask how your information is being used",
        "Raise a privacy concern",
        "Report a possible privacy violation",
      ]),
      p("contact Incubator Baguio through the privacy contact information provided below."),
      p("To protect your account and personal information, we may need to verify your identity before processing certain requests."),
    ],
  },
  {
    num: 17,
    id: "complaints",
    title: "Data Privacy Concerns and Complaints",
    blocks: [
      p("If you believe that your personal information has been improperly collected, used, disclosed, or otherwise processed, you may contact Incubator Baguio so that the matter can be reviewed."),
      p(
        <>
          You also have the right to lodge a complaint with the <strong style={{ color: DARK }}>National Privacy Commission</strong> where appropriate.
        </>
      ),
    ],
  },
  {
    num: 18,
    id: "policy-changes",
    title: "Changes to This Privacy Policy",
    blocks: [
      p("As the platform, programs, technologies, and legal requirements evolve, this Privacy Policy may be updated."),
      p("When material changes are made, Incubator Baguio will publish the updated Privacy Policy and revise the Last Updated date."),
      p("Where required, users will be provided with additional notice or an opportunity to provide or withdraw consent."),
      p("Previous versions may be retained for appropriate accountability and reference purposes."),
    ],
  },
  {
    num: 19,
    id: "contact",
    title: "Contact Us",
    blocks: [
      p("For questions about this Privacy Policy or Incubator Baguio's processing of personal information:"),
      p(
        <>
          <strong style={{ color: DARK }}>Incubator Baguio</strong>
          <br />
          City Government of Baguio
        </>
      ),
      p(
        <>
          <strong style={{ color: DARK }}>Email:</strong> incubatorbaguio63@gmail.com
        </>
      ),
      p("For formal privacy concerns, please use the designated Data Protection Officer or privacy contact once published."),
    ],
  },
];

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "p":
      return (
        <p key={i} style={{ margin: "0 0 14px", fontSize: 14.5, lineHeight: 1.7, color: BODY }}>
          {block.text}
        </p>
      );
    case "h3":
      return (
        <h3 key={i} style={{ margin: "18px 0 8px", fontSize: 15, fontWeight: 700, color: DARK }}>
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul key={i} style={{ margin: "0 0 14px", paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6 }}>
          {block.items.map((it, j) => (
            <li key={j} style={{ fontSize: 14.5, lineHeight: 1.6, color: BODY }}>{it}</li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <p
          key={i}
          style={{
            margin: "0 0 14px",
            fontSize: 14.5,
            lineHeight: 1.7,
            fontWeight: 600,
            color: DARK,
            background: "rgba(242,101,34,0.07)",
            borderLeft: `3px solid ${ORANGE}`,
            padding: "12px 16px",
            borderRadius: 8,
          }}
        >
          {block.text}
        </p>
      );
  }
}

export default function PrivacyContent({ bp }: { bp: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 40, alignItems: "start" }} className="ib-terms-grid">
      {/* TABLE OF CONTENTS */}
      <nav className="ib-terms-toc" style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 2, maxHeight: "calc(100vh - 48px)", overflowY: "auto", paddingRight: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>On this page</div>
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} style={{ fontSize: 12.5, color: BODY, textDecoration: "none", padding: "5px 0", lineHeight: 1.4 }} className="ib-footlink">
            {s.num}. {s.title}
          </a>
        ))}
      </nav>

      {/* BODY */}
      <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: "40px 44px", minWidth: 0 }}>
        <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.7, color: BODY }}>
          <strong style={{ color: DARK }}>Incubator Baguio</strong> respects your privacy.
        </p>
        <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.7, color: BODY }}>
          This Privacy Policy explains how Incubator Baguio, a City Government of Baguio initiative, collects, uses, stores, shares, and protects personal information when you use the Incubator Baguio website and platform.
        </p>
        <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.7, color: BODY }}>
          Our goal is simple: <strong style={{ color: DARK }}>collect only what we need, use it for clear purposes, protect it appropriately, and give you reasonable control over your personal information.</strong>
        </p>
        <p style={{ margin: "0 0 32px", fontSize: 15, lineHeight: 1.7, color: BODY }}>
          This Privacy Policy should be read together with the <a href={`${bp}/terms/`} style={{ color: ORANGE, fontWeight: 600, textDecoration: "none" }}>Incubator Baguio Terms of Service</a>.
        </p>

        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} style={{ marginBottom: 32, paddingTop: 8, borderTop: "1px solid rgba(64,50,34,0.08)" }}>
            <h2 style={{ margin: "16px 0 12px", fontSize: 19, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>
              {s.num}. {s.title}
            </h2>
            {s.blocks.map((b, i) => renderBlock(b, i))}
          </section>
        ))}

        <section style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(64,50,34,0.08)", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 19, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>Your Privacy Matters</h2>
          <p style={{ margin: "0 0 10px", fontSize: 14.5, lineHeight: 1.7, color: BODY }}>Incubator Baguio is building a connected innovation ecosystem for Baguio City.</p>
          <p style={{ margin: "0 0 10px", fontSize: 14.5, lineHeight: 1.7, color: BODY }}>That connection depends on trust.</p>
          <p style={{ margin: "0 0 20px", fontSize: 14.5, lineHeight: 1.7, color: BODY }}>
            We are committed to handling personal information responsibly, protecting the people who participate in the ecosystem, and being transparent about how information is used.
          </p>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: MUTED }}>Last Updated: August 28, 2026</p>
        </section>
      </div>
    </div>
  );
}
