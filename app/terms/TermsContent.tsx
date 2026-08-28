const DARK = "#1A1714";
const ORANGE = "#F26522";
const BODY = "#44444C";
const MUTED = "#8B8479";

type Block =
  | { type: "p"; text: React.ReactNode }
  | { type: "ul"; items: React.ReactNode[] }
  | { type: "ol"; items: React.ReactNode[] }
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
const ol = (items: React.ReactNode[]): Block => ({ type: "ol", items });
const h3 = (text: string): Block => ({ type: "h3", text });
const quote = (text: React.ReactNode): Block => ({ type: "quote", text });

const SECTIONS: Section[] = [
  {
    num: 1,
    id: "about",
    title: "About Incubator Baguio",
    blocks: [
      p("Incubator Baguio is a City Government of Baguio initiative established through City Ordinance No. 063, Series of 2023."),
      p("The Platform supports the development of Baguio City's innovation ecosystem by connecting innovators, startups, researchers, students, mentors, organizations, government, academia, industry, and other ecosystem participants."),
      p("The Platform may provide access to:"),
      ul([
        "Innovation and startup support",
        "Open innovation challenges",
        "Programs and opportunities",
        "Organizations and ecosystem profiles",
        "Mentor and expert information",
        "Research and knowledge resources",
        "Events and activities",
        "Innovation and startup profiles",
        "Collaboration opportunities",
        "Ecosystem information and insights",
      ]),
      p("Incubator Baguio is primarily an ecosystem coordinator and connector. The Platform does not represent that every opportunity, organization, innovation, program, or individual listed on the Platform has been endorsed by Incubator Baguio unless expressly identified as such."),
    ],
  },
  {
    num: 2,
    id: "eligibility",
    title: "Eligibility",
    blocks: [
      p("You may use the Platform if you are legally capable of entering into these Terms."),
      p("If you are registering or using the Platform on behalf of an organization, you represent that you are authorized to act on behalf of that organization."),
      p("If you are under the applicable age of majority, you should use the Platform only with the involvement and consent of a parent, guardian, or authorized institution where required by law."),
      p("Incubator Baguio may require additional information or confirmation where necessary to establish eligibility, authority, or identity."),
    ],
  },
  {
    num: 3,
    id: "your-account",
    title: "Your Account",
    blocks: [
      p("Certain Platform features require an account."),
      p("When creating an account, you agree to:"),
      ul([
        "Provide accurate and current information.",
        "Keep your account information updated.",
        "Use an email address that you are authorized to use.",
        "Maintain the confidentiality of your password.",
        "Take reasonable steps to protect your account.",
        "Notify Incubator Baguio if you believe your account has been compromised.",
        "Not allow another person to use your individual account.",
      ]),
      p("You are responsible for activities performed through your account unless you can demonstrate that the activity occurred without your authorization and despite reasonable security measures."),
      p("Incubator Baguio may require email verification or other verification measures before allowing access to certain Platform features."),
    ],
  },
  {
    num: 4,
    id: "individual-accounts",
    title: "Individual Accounts",
    blocks: [
      p("An individual account represents a person participating in the Incubator Baguio ecosystem."),
      p("Depending on the features available, an individual may create or manage:"),
      ul([
        "An innovation or startup profile",
        "A mentor profile",
        "Resources",
        "Events",
        "Challenge participation",
        "Saved opportunities and resources",
        "Other ecosystem information",
      ]),
      p("You are responsible for ensuring that information associated with your individual profile is accurate and appropriate for public display."),
    ],
  },
  {
    num: 5,
    id: "organization-accounts",
    title: "Organization Accounts",
    blocks: [
      p("An organization profile represents an organization participating in the Incubator Baguio ecosystem."),
      p("Organizations may include, among others:"),
      ul([
        "Schools and universities",
        "Government offices",
        "Startups and companies",
        "Technology Business Incubators",
        "Research institutions",
        "Nonprofit organizations",
        "Industry organizations",
        "Community organizations",
        "Other ecosystem institutions",
      ]),
      h3("One organization, one organization profile"),
      p("Each organization should maintain one official organization profile on the Platform."),
      p("An organization may have one or more authorized users who manage the same organization profile."),
      p("Authorized users may include representatives, administrators, staff, or other persons authorized by the organization."),
      p("Organizations must not create duplicate profiles for the same organization for the purpose of bypassing Platform rules, verification, or other requirements."),
      p("Incubator Baguio may consolidate, suspend, or remove duplicate organization profiles."),
    ],
  },
  {
    num: 6,
    id: "organization-authorization",
    title: "Organization Authorization",
    blocks: [
      p("If you manage an organization profile, you represent that you have the authority to provide and manage information on behalf of that organization."),
      p("You are responsible for ensuring that:"),
      ul([
        "The organization information you submit is accurate.",
        "You are authorized to represent the organization.",
        "Other people given access to the organization profile are authorized.",
        "Access is removed or reported when a person is no longer authorized to manage the organization.",
      ]),
      p("Incubator Baguio may request documentation or confirmation to verify an organization's identity or a user's authority to represent it."),
    ],
  },
  {
    num: 7,
    id: "organization-verification",
    title: "Organization Verification",
    blocks: [
      p("Incubator Baguio may review organizations before allowing their profiles to become publicly visible."),
      p("An organization may be identified as:"),
      h3("Pending Review"),
      p("The organization has submitted information but has not yet been confirmed by Incubator Baguio."),
      h3("Verified Organization"),
      p("Incubator Baguio has confirmed the existence or legitimacy of the organization based on its review process."),
      p("Verification does not mean that Incubator Baguio endorses, guarantees, certifies, or assumes responsibility for all activities, products, services, claims, or representations of the organization."),
      p("Incubator Baguio may remove, suspend, or change an organization's verification status when appropriate."),
    ],
  },
  {
    num: 8,
    id: "public-profiles",
    title: "Public Profiles",
    blocks: [
      p("Some information submitted to the Platform may be displayed publicly."),
      p("Public information may include:"),
      ul([
        "Organization name",
        "Organization description",
        "Logo",
        "Location",
        "Areas of focus",
        "Expertise",
        "Public contact information",
        "Website and social links",
        "Programs or services",
        "Public resources",
        "Public events",
        "Public opportunities",
        "Other information intentionally submitted for public display",
      ]),
      p("Private account information, passwords, authentication information, internal assessments, and other restricted information should not be publicly displayed."),
      p("Users and organizations are responsible for reviewing information before submitting it for public display."),
    ],
  },
  {
    num: 9,
    id: "platform-content",
    title: "Platform Content and User Content",
    blocks: [
      p("The Platform may contain two broad categories of content:"),
      h3("Incubator Baguio Content"),
      p("Content created or published by Incubator Baguio, including official information, announcements, program information, platform materials, and other materials owned or controlled by Incubator Baguio or the City Government of Baguio."),
      h3("User Content"),
      p("Content submitted or published by users or organizations, including:"),
      ul([
        "Profiles",
        "Startup and innovation information",
        "Organization information",
        "Challenges",
        "Resources",
        "Events",
        "Research information",
        "Documents",
        "Images",
        "Links",
        "Descriptions",
        "Applications",
        "Other submissions",
      ]),
      p("You remain responsible for the User Content you submit."),
    ],
  },
  {
    num: 10,
    id: "content-responsibility",
    title: "Your Responsibility for Submitted Content",
    blocks: [
      p("When submitting User Content, you represent that:"),
      ol([
        "You have the necessary rights or authorization to submit the content.",
        "The content is accurate to the best of your knowledge.",
        "The content does not knowingly violate applicable law.",
        "The content does not infringe another person's intellectual property, privacy, or other rights.",
        "You have obtained appropriate consent before submitting personal information belonging to another person.",
        "The content does not contain malicious software or harmful code.",
        "The content is appropriate for the Platform and its intended audience.",
      ]),
      p("Incubator Baguio may remove or restrict content that violates these Terms or applicable policies."),
    ],
  },
  {
    num: 11,
    id: "intellectual-property",
    title: "Intellectual Property",
    blocks: [
      p("You retain ownership of intellectual property that you lawfully own and submit to the Platform."),
      p("Submitting information to Incubator Baguio does not by itself transfer ownership of your inventions, research, technology, business, trademarks, designs, copyrights, or other intellectual property."),
      p("However, by submitting content to the Platform, you grant Incubator Baguio a non-exclusive, limited, royalty-free license to host, store, reproduce, display, format, and publish that content as reasonably necessary to operate the Platform and provide the services you requested."),
      p("For content intentionally submitted for public display, this license includes making the content available through the Platform."),
      p("Incubator Baguio will not claim ownership of your intellectual property merely because you submit information about it to the Platform."),
    ],
  },
  {
    num: 12,
    id: "sensitive-information",
    title: "Sensitive or Confidential Information",
    blocks: [
      quote("Do not submit confidential or sensitive information unless the relevant Platform feature expressly indicates that it is intended to receive such information."),
      p("This is particularly important for:"),
      ul([
        "Unpublished inventions",
        "Trade secrets",
        "Confidential business information",
        "Patent-sensitive information",
        "Proprietary technical information",
        "Confidential research",
        "Personal information about other individuals",
        "Confidential government information",
        "Financial information",
        "Passwords or credentials",
      ]),
      p("Submitting information to a public profile, challenge, resource, event, or other publicly accessible area may cause that information to become publicly available."),
      p("If your innovation or research is subject to confidentiality or intellectual property protection, you are responsible for determining what information may safely be disclosed."),
    ],
  },
  {
    num: 13,
    id: "open-innovation-challenges",
    title: "Open Innovation Challenges",
    blocks: [
      p("The Platform may allow organizations to publish challenges and allow innovators, startups, researchers, students, or other participants to discover and respond to them."),
      p("Participation in a challenge does not automatically create:"),
      ul([
        "A contract",
        "An employment relationship",
        "A procurement agreement",
        "A funding agreement",
        "A partnership",
        "An intellectual property transfer",
        "A government adoption commitment",
      ]),
      p("Any such relationship must be established through a separate agreement or process where required."),
      p("Incubator Baguio does not guarantee that a submitted solution will be selected, funded, piloted, adopted, commercialized, or otherwise pursued."),
      p("Challenge-specific rules may apply and will take precedence where expressly stated."),
    ],
  },
  {
    num: 14,
    id: "opportunities",
    title: "Opportunities, Programs, and Referrals",
    blocks: [
      p("The Platform may display opportunities from Incubator Baguio, government agencies, universities, companies, organizations, and other ecosystem partners."),
      p("Incubator Baguio may facilitate referrals or introductions between ecosystem participants."),
      p("A referral or introduction does not constitute an endorsement, guarantee, accreditation, or contractual relationship."),
      p("Users should independently evaluate an opportunity, organization, individual, program, or offer before entering into any agreement or providing additional information."),
    ],
  },
  {
    num: 15,
    id: "events",
    title: "Events",
    blocks: [
      p("Users and organizations may submit events for consideration for publication on the Platform."),
      p("Submitting an event does not guarantee publication."),
      p("Incubator Baguio may review event information before publishing it and may reject, modify, unpublish, or remove event information where appropriate."),
      p("Event organizers remain responsible for their events, including:"),
      ul([
        "Event accuracy",
        "Venue and logistics",
        "Registration",
        "Safety",
        "Fees",
        "Cancellations",
        "Participant management",
        "Compliance with applicable laws and regulations",
      ]),
      p("Incubator Baguio is not responsible for the organization, delivery, cancellation, or outcome of third-party events."),
    ],
  },
  {
    num: 16,
    id: "knowledge-hub",
    title: "Knowledge Hub and Resources",
    blocks: [
      p("The Platform may allow users and organizations to contribute resources to the Knowledge Hub."),
      p("You must have the right to share any material you upload."),
      p("You must not upload:"),
      ul([
        "Pirated materials",
        "Unauthorized copies",
        "Confidential documents",
        "Malware",
        "Content that violates applicable law",
        "Content that infringes intellectual property rights",
      ]),
      p("Incubator Baguio may remove resources that do not meet Platform requirements."),
    ],
  },
  {
    num: 17,
    id: "prohibited-activities",
    title: "Prohibited Activities",
    blocks: [
      p("You must not use the Platform to:"),
      ul([
        "Provide false or misleading information.",
        "Impersonate another person or organization.",
        "Create fraudulent organization profiles.",
        "Create duplicate accounts to evade restrictions.",
        "Gain unauthorized access to another user's account.",
        "Attempt to access restricted Platform systems.",
        "Circumvent security or authentication controls.",
        "Upload malicious code or software.",
        "Harass, threaten, abuse, or discriminate against other users.",
        "Publish unlawful, defamatory, fraudulent, or harmful content.",
        "Infringe intellectual property rights.",
        "Collect personal information from other users without proper authority.",
        "Use the Platform for unauthorized advertising, spam, or solicitation.",
        "Manipulate Platform information or metrics.",
        "Misrepresent an Incubator Baguio endorsement or government affiliation.",
        "Use the Platform for activities that violate applicable laws or regulations.",
      ]),
      p("Incubator Baguio may take appropriate action when prohibited activity is identified."),
    ],
  },
  {
    num: 18,
    id: "accuracy",
    title: "Accuracy of Information",
    blocks: [
      p("Incubator Baguio aims to maintain useful and accurate ecosystem information."),
      p("However, the Platform may contain information submitted by third parties."),
      p("Incubator Baguio does not guarantee that all user-submitted information is:"),
      ul(["Complete", "Accurate", "Current", "Suitable for a particular purpose", "Independently verified"]),
      p("Users should exercise appropriate judgment before relying on information published by other users or organizations."),
    ],
  },
  {
    num: 19,
    id: "government-relationships",
    title: "Government and Ecosystem Relationships",
    blocks: [
      p("The presence of a person, organization, startup, technology, event, opportunity, or resource on the Platform does not necessarily mean that the City Government of Baguio or Incubator Baguio:"),
      ul([
        "Endorses it",
        "Certifies it",
        "Guarantees it",
        "Funds it",
        "Has entered into a partnership with it",
        "Guarantees its performance",
        "Guarantees its commercial success",
        "Guarantees its government adoption",
      ]),
      p("Where official endorsement, partnership, verification, funding, or participation exists, Incubator Baguio may identify it separately."),
    ],
  },
  {
    num: 20,
    id: "platform-availability",
    title: "Platform Availability",
    blocks: [
      p("Incubator Baguio will make reasonable efforts to maintain the Platform and keep it available."),
      p("However, the Platform may occasionally be unavailable because of:"),
      ul([
        "Maintenance",
        "Updates",
        "Security incidents",
        "Technical failures",
        "Infrastructure problems",
        "Third-party service interruptions",
        "Internet or telecommunications failures",
        "Events beyond reasonable control",
      ]),
      p("Incubator Baguio does not guarantee uninterrupted or error-free operation of the Platform."),
    ],
  },
  {
    num: 21,
    id: "third-party",
    title: "Third-Party Services and Links",
    blocks: [
      p("The Platform may contain links to websites, services, organizations, programs, or resources operated by third parties."),
      p("These third-party services are outside the control of Incubator Baguio."),
      p("Accessing a third-party service may subject you to that third party's own terms and privacy policies."),
      p("Incubator Baguio is not responsible for the content, security, availability, policies, or practices of third-party websites or services."),
    ],
  },
  {
    num: 22,
    id: "privacy",
    title: "Privacy and Personal Information",
    blocks: [
      p("Incubator Baguio processes personal information in accordance with applicable Philippine data privacy laws and its separate Privacy Policy."),
      p("The Platform is designed to collect and process information for purposes such as:"),
      ul([
        "Account management",
        "Ecosystem participation",
        "Organization and user profiles",
        "Program administration",
        "Challenge participation",
        "Event participation",
        "Referrals and connections",
        "Ecosystem coordination",
        "Research and ecosystem intelligence",
        "Government planning and related legitimate functions",
        "Platform security and administration",
      ]),
      p("Personal information will be processed in accordance with applicable requirements on transparency, legitimate purpose, proportionality, security, retention, and data-subject rights."),
      p("For details about how personal information is collected, used, stored, shared, retained, and protected, please refer to the Incubator Baguio Privacy Policy."),
    ],
  },
  {
    num: 23,
    id: "account-security",
    title: "Account Security",
    blocks: [
      p("You are responsible for protecting your login credentials."),
      p("You must not:"),
      ul([
        "Share your individual password.",
        "Store your password where unauthorized people can access it.",
        "Allow another person to access your individual account.",
        "Attempt to access another person's account.",
      ]),
      p("If you believe your account has been compromised, contact Incubator Baguio as soon as reasonably possible."),
      p("For organization accounts, access should be granted only to authorized representatives of the organization."),
    ],
  },
  {
    num: 24,
    id: "suspension",
    title: "Suspension and Termination",
    blocks: [
      p("Incubator Baguio may suspend, restrict, hide, or terminate an account, organization profile, submission, or access to the Platform when reasonably necessary, including when:"),
      ul([
        "These Terms are violated.",
        "False or fraudulent information is submitted.",
        "An account is used for unlawful activity.",
        "Security is compromised.",
        "An organization cannot be reasonably verified.",
        "The Platform is being abused.",
        "Continued access presents a security, legal, or operational risk.",
      ]),
      p("Where appropriate, Incubator Baguio may provide notice and an opportunity to address the issue."),
      p("Incubator Baguio may also remove or restrict content that violates applicable rules or creates a significant risk to users or the Platform."),
    ],
  },
  {
    num: 25,
    id: "account-closure",
    title: "Account Closure",
    blocks: [
      p("You may request closure of your individual account subject to applicable legal, administrative, recordkeeping, and operational requirements."),
      p("Closing an account does not necessarily mean that all information associated with the account will be immediately deleted."),
      p("Certain information may need to be retained where required by law, government records requirements, legitimate administrative purposes, dispute resolution, security, or other lawful purposes."),
      p("Personal information will be handled in accordance with the applicable Privacy Policy and data-retention requirements."),
    ],
  },
  {
    num: 26,
    id: "disclaimer",
    title: "Disclaimer",
    blocks: [
      p("The Platform is provided on an “as available” basis."),
      p("To the extent permitted by applicable law, Incubator Baguio does not guarantee that:"),
      ul([
        "The Platform will always be available.",
        "Information submitted by third parties will always be accurate.",
        "An opportunity will produce a particular result.",
        "A challenge will result in a solution.",
        "A solution will be selected or adopted.",
        "A startup will receive funding or investment.",
        "A research project will be commercialized.",
        "A connection or referral will result in a partnership.",
        "A mentor relationship will produce a particular outcome.",
      ]),
      p("The Platform facilitates ecosystem participation. It does not replace the professional, legal, financial, technical, commercial, procurement, or other due diligence that users may need to undertake."),
    ],
  },
  {
    num: 27,
    id: "no-advice",
    title: "No Professional or Commercial Advice",
    blocks: [
      p("Information available through the Platform is provided for general ecosystem and innovation purposes."),
      p("Unless expressly identified otherwise, Incubator Baguio does not provide:"),
      ul(["Legal advice", "Financial advice", "Investment advice", "Tax advice", "Medical advice", "Professional engineering advice", "Procurement advice", "Intellectual property advice"]),
      p("Users should seek qualified professionals when appropriate."),
    ],
  },
  {
    num: 28,
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    blocks: [
      p("To the extent permitted by applicable law, Incubator Baguio and the City Government of Baguio shall not be responsible for indirect, incidental, consequential, special, or other losses arising from:"),
      ul([
        "Use or inability to use the Platform.",
        "Reliance on third-party information.",
        "Third-party activities.",
        "Third-party events or opportunities.",
        "User-submitted content.",
        "Interactions between users.",
        "Business or investment decisions made by users.",
        "Unauthorized acts of third parties despite reasonable security measures.",
      ]),
      p("Nothing in these Terms is intended to exclude or limit liability that cannot lawfully be excluded or limited under applicable Philippine law."),
    ],
  },
  {
    num: 29,
    id: "indemnification",
    title: "Indemnification",
    blocks: [
      p("To the extent permitted by applicable law, you agree to be responsible for claims, losses, damages, liabilities, and reasonable expenses arising from your:"),
      ul(["Violation of these Terms;", "Violation of applicable law;", "Infringement of another person's rights;", "Unauthorized use of the Platform; or", "User Content that you submit to the Platform."]),
      p("This provision will apply only to the extent permitted by applicable law."),
    ],
  },
  {
    num: 30,
    id: "platform-changes",
    title: "Changes to the Platform",
    blocks: [
      p("Incubator Baguio may modify, add, suspend, or discontinue Platform features as the ecosystem platform evolves."),
      p("This may include changes to:"),
      ul(["Profiles", "Challenges", "Programs", "Opportunities", "Events", "Resources", "Directories", "Account features", "Matching or recommendation features", "Other ecosystem services"]),
      p("Incubator Baguio will make reasonable efforts to communicate material changes where appropriate."),
    ],
  },
  {
    num: 31,
    id: "terms-changes",
    title: "Changes to These Terms",
    blocks: [
      p("Incubator Baguio may update these Terms from time to time."),
      p("When material changes are made, the updated Terms will be published on the Platform with a revised Last Updated date."),
      p("Where required, users may be asked to affirmatively accept updated Terms before continuing to use certain services."),
      p("Your continued use of the Platform after the effective date of updated Terms constitutes acceptance of the updated Terms to the extent permitted by law."),
    ],
  },
  {
    num: 32,
    id: "governing-law",
    title: "Governing Law",
    blocks: [
      p("These Terms shall be governed by and interpreted in accordance with the laws of the Republic of the Philippines."),
      p("Any dispute arising from these Terms or use of the Platform shall be subject to applicable Philippine laws and the jurisdiction of the appropriate courts, subject to applicable rules governing government entities and public officials."),
    ],
  },
  {
    num: 33,
    id: "institutional-continuity",
    title: "Government Authority and Institutional Continuity",
    blocks: [
      p("Incubator Baguio operates within the institutional framework of the City Government of Baguio."),
      p("The Platform may evolve as government programs, policies, ordinances, administrative requirements, technology, and ecosystem priorities change."),
      p("No individual employee, staff member, representative, or ecosystem partner may independently make commitments on behalf of the City Government of Baguio unless properly authorized."),
    ],
  },
  {
    num: 34,
    id: "severability",
    title: "Severability",
    blocks: [p("If any provision of these Terms is found to be invalid, unlawful, or unenforceable, the remaining provisions will continue to apply to the extent permitted by law.")],
  },
  {
    num: 35,
    id: "no-waiver",
    title: "No Waiver",
    blocks: [p("Failure by Incubator Baguio to enforce any provision of these Terms does not constitute a waiver of its right to enforce that provision later.")],
  },
  {
    num: 36,
    id: "entire-agreement",
    title: "Entire Agreement",
    blocks: [
      p("These Terms, together with the Privacy Policy and any additional terms specifically applicable to particular Platform services, constitute the agreement governing your use of the Platform."),
      p("Additional rules may apply to specific programs, challenges, events, or services."),
      p("Where additional terms expressly apply to a particular service, those terms will govern that service to the extent of any inconsistency."),
    ],
  },
  {
    num: 37,
    id: "contact",
    title: "Contact Us",
    blocks: [
      p("If you have questions about these Terms, your account, organization profile, or use of the Platform, you may contact Incubator Baguio through the official contact channels provided on the Platform."),
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
      p("For privacy-related concerns, please refer to the Incubator Baguio Privacy Policy and the designated Data Protection Officer or privacy contact published by the City Government of Baguio."),
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
    case "ol":
      return (
        <ol key={i} style={{ margin: "0 0 14px", paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6 }}>
          {block.items.map((it, j) => (
            <li key={j} style={{ fontSize: 14.5, lineHeight: 1.6, color: BODY }}>{it}</li>
          ))}
        </ol>
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

export default function TermsContent() {
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
        <a href="#acceptance" style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE, textDecoration: "none", padding: "5px 0", lineHeight: 1.4 }}>
          Acceptance
        </a>
      </nav>

      {/* BODY */}
      <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: "40px 44px", minWidth: 0 }}>
        <p style={{ margin: "0 0 20px", fontSize: 15, lineHeight: 1.7, color: BODY }}>
          Welcome to <strong style={{ color: DARK }}>Incubator Baguio</strong>, Baguio City&rsquo;s innovation platform.
        </p>
        <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.7, color: BODY }}>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the Incubator Baguio website, digital platform, accounts, profiles, directories, challenges, opportunities, resources, events, and other services made available through the platform (collectively, the &ldquo;Platform&rdquo;).
        </p>
        <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.7, color: BODY }}>
          By creating an account, accessing the Platform, submitting information, or otherwise using the Platform, you agree to these Terms.
        </p>
        <p style={{ margin: "0 0 32px", fontSize: 15, lineHeight: 1.7, color: BODY }}>
          If you do not agree with these Terms, please do not create an account or use the Platform.
        </p>

        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} style={{ marginBottom: 32, paddingTop: 8, borderTop: "1px solid rgba(64,50,34,0.08)" }}>
            <h2 style={{ margin: "16px 0 12px", fontSize: 19, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>
              {s.num}. {s.title}
            </h2>
            {s.blocks.map((b, i) => renderBlock(b, i))}
          </section>
        ))}

        <section id="acceptance" style={{ marginTop: 32, paddingTop: 8, borderTop: "1px solid rgba(64,50,34,0.08)" }}>
          <h2 style={{ margin: "16px 0 12px", fontSize: 19, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>Acceptance</h2>
          <p style={{ margin: "0 0 14px", fontSize: 14.5, lineHeight: 1.7, color: BODY }}>By selecting:</p>
          <p
            style={{
              margin: "0 0 14px",
              fontSize: 14.5,
              fontWeight: 600,
              color: DARK,
              background: "rgba(242,101,34,0.07)",
              borderLeft: `3px solid ${ORANGE}`,
              padding: "12px 16px",
              borderRadius: 8,
            }}
          >
            I agree to the Terms of Service and Privacy Policy
          </p>
          <p style={{ margin: "0 0 14px", fontSize: 14.5, lineHeight: 1.7, color: BODY }}>and creating an account, you confirm that:</p>
          <ul style={{ margin: "0 0 14px", paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6 }}>
            <li style={{ fontSize: 14.5, lineHeight: 1.6, color: BODY }}>You have read and understood these Terms.</li>
            <li style={{ fontSize: 14.5, lineHeight: 1.6, color: BODY }}>You agree to comply with these Terms.</li>
            <li style={{ fontSize: 14.5, lineHeight: 1.6, color: BODY }}>The information you provide is accurate to the best of your knowledge.</li>
            <li style={{ fontSize: 14.5, lineHeight: 1.6, color: BODY }}>You are authorized to create and use the account you are registering.</li>
            <li style={{ fontSize: 14.5, lineHeight: 1.6, color: BODY }}>If registering for an organization, you are authorized to represent that organization.</li>
          </ul>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: MUTED }}>Last Updated: August 28, 2026</p>
        </section>
      </div>
    </div>
  );
}
