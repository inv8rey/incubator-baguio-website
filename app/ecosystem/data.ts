export type EcosystemCategory = "Startups" | "Mentors" | "TBIs" | "Corporate" | "Government" | "Community" | "Coworking Spaces" | "Makerspaces & Labs";

export interface StartupEntry {
  name: string;
  sector: string;
  tbiAffiliation: string;
  description: string;
  logoUrl?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  initial: string;
  color: string;
  bg: string;
}

export const MENTOR_SPECIALIZATIONS = [
  "Startup & Entrepreneurship",
  "Business Development",
  "Finance & Investment",
  "Marketing & Growth",
  "Product & Technology",
  "Legal & Intellectual Property",
  "Research & Commercialization",
  "Industry Experts",
] as const;
export type MentorSpecialization = (typeof MENTOR_SPECIALIZATIONS)[number];

export const SPECIALIZATION_COLORS: Record<string, { color: string; bg: string }> = {
  "Startup & Entrepreneurship": { color: "#F26522", bg: "rgba(242,101,34,0.14)" },
  "Business Development": { color: "#285E7A", bg: "rgba(40,94,122,0.14)" },
  "Finance & Investment": { color: "#1A6B3C", bg: "rgba(26,107,60,0.12)" },
  "Marketing & Growth": { color: "#9E2A52", bg: "rgba(158,42,82,0.12)" },
  "Product & Technology": { color: "#7C5CD6", bg: "rgba(124,92,214,0.14)" },
  "Legal & Intellectual Property": { color: "#D88A0A", bg: "rgba(245,166,35,0.16)" },
  "Research & Commercialization": { color: "#0055A5", bg: "rgba(0,85,165,0.12)" },
  "Industry Experts": { color: "#E23A2E", bg: "rgba(226,58,46,0.12)" },
};

export interface MentorEntry {
  name: string;
  position: string;
  company: string;
  bio: string;
  specializations: string[];
  initials: string;
  color: string;
  bg: string;
  photoUrl?: string;
}

export interface TbiEntry {
  name: string;
  host: string;
  focus: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
}

export interface CommunityEntry {
  name: string;
  type: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
}

export interface CorporateEntry {
  name: string;
  type: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
}

export interface GovernmentEntry {
  name: string;
  type: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
}

export interface CoworkingEntry {
  name: string;
  type: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
}

export interface MakerspaceEntry {
  name: string;
  type: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
}

// Startups aren't seeded here — the Ecosystem directory's Startups tab reads
// live from Supabase only (see dynamicData.ts), sourced from the admin
// dashboard and self-service founder submissions.

export const MENTORS: MentorEntry[] = [
  { name: "Maria Aquino", position: "Founder & Advisor", company: "Independent", bio: "Serial entrepreneur and fundraising expert helping early-stage startups build and scale.", specializations: ["Startup & Entrepreneurship", "Finance & Investment"], initials: "MA", color: "#F26522", bg: "rgba(242,101,34,0.12)" },
  { name: "Ramon Dizon", position: "CTO & Mentor", company: "Fintech Startup", bio: "Product engineer and tech leader passionate about building scalable fintech solutions.", specializations: ["Product & Technology"], initials: "RD", color: "#285E7A", bg: "rgba(40,94,122,0.16)" },
  { name: "Liza Tan", position: "Researcher & IP Advisor", company: "Saint Louis University", bio: "IP strategist and researcher helping innovators protect and commercialize their ideas.", specializations: ["Legal & Intellectual Property", "Research & Commercialization"], initials: "LT", color: "#D88A0A", bg: "rgba(245,166,35,0.16)" },
  { name: "Jun Baltazar", position: "Growth & Strategy Mentor", company: "Independent", bio: "Growth strategist helping startups find product-market fit and scale sustainably.", specializations: ["Marketing & Growth", "Business Development"], initials: "JB", color: "#9E2A52", bg: "rgba(158,42,82,0.18)" },
  { name: "Anna Cruz", position: "Legal & Compliance Advisor", company: "Independent", bio: "Corporate lawyer advising startups on legal structure, contracts, and compliance.", specializations: ["Legal & Intellectual Property"], initials: "AC", color: "#1A6B3C", bg: "rgba(26,107,60,0.16)" },
  { name: "Paolo Reyes", position: "Operations Mentor", company: "Manufacturing Co.", bio: "Operations leader focused on process optimization and building efficient teams.", specializations: ["Business Development", "Industry Experts"], initials: "PR", color: "#0055A5", bg: "rgba(0,85,165,0.16)" },
  { name: "Grace Lim", position: "Brand & Marketing Advisor", company: "Independent", bio: "Brand builder and marketer helping startups craft strong brands and engage their audience.", specializations: ["Marketing & Growth"], initials: "GL", color: "#E23A2E", bg: "rgba(226,58,46,0.14)" },
  { name: "Carlo Mendoza", position: "Data & AI Mentor", company: "Independent", bio: "Data scientist and AI practitioner helping startups build data-driven products.", specializations: ["Product & Technology", "Research & Commercialization"], initials: "CM", color: "#7C5CD6", bg: "rgba(124,92,214,0.16)" },
];

export const TBIS: TbiEntry[] = [
  { name: "SLU iDEYA", host: "Saint Louis University", focus: "Agritech, health, and social innovation", description: "Runs pre-incubation bootcamps and the SLU startup accelerator track for student and faculty ventures.", color: "#0055A5", bg: "rgba(0,85,165,0.12)", initials: "SLU" },
  { name: "UB Innovation & Technology Support Office", host: "University of Baguio", focus: "Hardware, IoT, and engineering ventures", description: "Provides prototyping labs, technical mentoring, and IP support for engineering-led startups.", color: "#285E7A", bg: "rgba(40,94,122,0.12)", initials: "UB" },
  { name: "UP Baguio TBI", host: "University of the Philippines Baguio", focus: "Research commercialization", description: "Bridges UP Baguio research output with market-ready ventures and government partners.", color: "#7E0707", bg: "rgba(126,7,7,0.1)", initials: "UP" },
  { name: "UC Innovation Hub", host: "University of the Cordilleras", focus: "Tourism, creative, and digital startups", description: "Hosts demo days and a creative-industries track for student and alumni founders.", color: "#1A6B3C", bg: "rgba(26,107,60,0.12)", initials: "UC" },
];

export const COMMUNITY: CommunityEntry[] = [
  { name: "Baguio Creatives Guild", type: "Creative community", description: "A network of designers, artists, and makers collaborating on creative-economy projects.", color: "#9E2A52", bg: "rgba(158,42,82,0.12)", initials: "BCG" },
  { name: "Cordillera Youth Innovators Network", type: "Youth organization", description: "Connects student innovators across Cordillera campuses to challenges, camps, and mentors.", color: "#F26522", bg: "rgba(242,101,34,0.14)", initials: "CYIN" },
  { name: "Benguet Farmers Cooperative", type: "Cooperative", description: "Represents highland farmer groups piloting agritech solutions from the startup portfolio.", color: "#3F9E4D", bg: "rgba(126,217,87,0.16)", initials: "BFC" },
  { name: "Barangay Innovation Council Network", type: "Barangay councils", description: "A coalition of barangay officials coordinating local pilots for civic-tech startups.", color: "#D88A0A", bg: "rgba(245,166,35,0.16)", initials: "BIC" },
  { name: "Women in Tech Cordillera", type: "Community group", description: "Mentorship circle and meetup network supporting women founders and engineers.", color: "#7C5CD6", bg: "rgba(124,92,214,0.14)", initials: "WTC" },
];

export const COWORKING: CoworkingEntry[] = [
  { name: "Pine Peak Coworking", type: "Coworking space", description: "Hot desks, private pods, and meeting rooms in a converted heritage building near Session Road.", color: "#F26522", bg: "rgba(242,101,34,0.12)", initials: "PPC" },
  { name: "The Attic Baguio", type: "Coworking & event space", description: "A rooftop coworking loft that doubles as a venue for founder meetups and demo nights.", color: "#9E2A52", bg: "rgba(158,42,82,0.12)", initials: "TAB" },
  { name: "Grid Workspace", type: "Coworking space", description: "24/7 access coworking with dedicated desks for early-stage teams graduating from incubation.", color: "#285E7A", bg: "rgba(40,94,122,0.12)", initials: "GW" },
];

export const MAKERSPACES: MakerspaceEntry[] = [
  { name: "Baguio Maker Society", type: "Community makerspace", description: "Community workshop space offering tools and peer support for hardware prototyping.", color: "#285E7A", bg: "rgba(40,94,122,0.12)", initials: "BMS" },
  { name: "Cordillera FabLab", type: "Digital fabrication lab", description: "3D printing, laser cutting, and CNC tools for hardware prototyping and product design, open to student and startup teams.", color: "#1A6B3C", bg: "rgba(26,107,60,0.12)", initials: "CFL" },
  { name: "UB Prototyping Lab", type: "University fabrication lab", description: "Engineering workshop and electronics bench supporting hardware-focused student and alumni ventures.", color: "#0055A5", bg: "rgba(0,85,165,0.12)", initials: "UBP" },
];

export const CORPORATE: CorporateEntry[] = [
  { name: "Baguio Chamber of Commerce and Industry", type: "Business association", description: "Connects local enterprises with startups for pilots, sourcing, and market access.", color: "#E23A2E", bg: "rgba(226,58,46,0.12)", initials: "BCCI" },
  { name: "Cordillera Tech Collective", type: "Local tech firms", description: "A coalition of Baguio-based software and IT services firms offering mentorship and hiring pipelines.", color: "#285E7A", bg: "rgba(40,94,122,0.12)", initials: "CTC" },
  { name: "Pine City Creative Studios", type: "Creative agency", description: "Branding and product design studio supporting early-stage startups with discounted design sprints.", color: "#9E2A52", bg: "rgba(158,42,82,0.12)", initials: "PCS" },
  { name: "Highland Angels Network", type: "Angel investors", description: "A syndicate of local angel investors providing seed funding and advisory to portfolio startups.", color: "#D88A0A", bg: "rgba(245,166,35,0.16)", initials: "HAN" },
  { name: "Cordillera Bank Foundation", type: "Corporate foundation / finance", description: "Funds the Innovation Fund and offers preferential business loans to incubated startups.", color: "#1A6B3C", bg: "rgba(26,107,60,0.12)", initials: "CBF" },
];

export const GOVERNMENT: GovernmentEntry[] = [
  { name: "City Government of Baguio", type: "Lead institution", description: "Convenes the Alliance through CPDSO and provides policy, funding, and venue support.", color: "#F26522", bg: "rgba(242,101,34,0.14)", initials: "CGB" },
  { name: "Department of Science and Technology — CAR", type: "National agency", description: "Provides grants-in-aid, technology transfer support, and S&T scholarships to founders and researchers.", color: "#0055A5", bg: "rgba(0,85,165,0.12)", initials: "DOST" },
  { name: "Department of Trade and Industry — CAR", type: "National agency", description: "Runs MSME development programs and connects startups to trade and export opportunities.", color: "#CE1126", bg: "rgba(206,17,38,0.12)", initials: "DTI" },
  { name: "Commission on Higher Education — CAR", type: "National agency", description: "Coordinates research grants and curriculum alignment with partner universities.", color: "#5B3A99", bg: "rgba(91,58,153,0.14)", initials: "CHED" },
  { name: "Department of Information and Communications Technology", type: "National agency", description: "Supports digital infrastructure, e-governance pilots, and tech talent programs.", color: "#009B8D", bg: "rgba(0,155,141,0.14)", initials: "DICT" },
];
