export type EcosystemCategory = "Startups" | "Mentors" | "TBIs" | "Community";

export interface StartupEntry {
  name: string;
  sector: string;
  stage: string;
  description: string;
  initial: string;
  color: string;
  bg: string;
}

export interface MentorEntry {
  name: string;
  expertise: string;
  bio: string;
  initials: string;
  color: string;
  bg: string;
  tagColor: string;
  tagBg: string;
  tag: string;
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

export const STARTUPS: StartupEntry[] = [
  { name: "HarvestLink", sector: "Agritech", stage: "Incubation · Cohort 2025", description: "Connects highland farmers directly to Baguio buyers, cutting spoilage and middlemen.", initial: "H", color: "#3F9E4D", bg: "rgba(126,217,87,0.16)" },
  { name: "PineCycle", sector: "Cleantech", stage: "Incubation · Cohort 2025", description: "Turns the city's pine and food waste into compost and biochar for urban gardens.", initial: "P", color: "#285E7A", bg: "rgba(40,94,122,0.14)" },
  { name: "TrailMate", sector: "Tourism", stage: "Pre-incubation · 2025", description: "A guide app for Cordillera trails and homegrown experiences beyond peak season.", initial: "T", color: "#9E2A52", bg: "rgba(158,42,82,0.12)" },
  { name: "ColdTrail", sector: "Agritech / Hardware", stage: "Incubation · Cohort 2025", description: "Low-cost insulated transport crates with IoT temperature monitoring for highland produce.", initial: "C", color: "#D88A0A", bg: "rgba(245,166,35,0.16)" },
  { name: "CareCall", sector: "Health Tech", stage: "Pre-incubation · 2026", description: "A simple voice-call and SMS booking line so senior citizens can schedule barangay check-ups.", initial: "C", color: "#E23A2E", bg: "rgba(226,58,46,0.12)" },
  { name: "OffSeason", sector: "Tourism Tech", stage: "Incubation · Cohort 2025", description: "Discovery app surfacing local creative businesses and shoulder-season itineraries.", initial: "O", color: "#9E2A52", bg: "rgba(158,42,82,0.12)" },
  { name: "PermitRunner", sector: "Govtech", stage: "Pre-incubation · 2026", description: "Pre-fill workflow that helps MSMEs renew business permits without redundant paperwork.", initial: "P", color: "#F26522", bg: "rgba(242,101,34,0.14)" },
  { name: "OfflineLearn", sector: "EdTech", stage: "Incubation · Cohort 2025", description: "Pre-loaded learning modules for students in barangays with limited connectivity.", initial: "O", color: "#0055A5", bg: "rgba(0,85,165,0.12)" },
  { name: "SortRight", sector: "Environment / IoT", stage: "Pre-incubation · 2026", description: "Smart bin system with fill-level alerts for vendor stalls at public markets.", initial: "S", color: "#1A6B3C", bg: "rgba(26,107,60,0.12)" },
];

export const MENTORS: MentorEntry[] = [
  { name: "Maria Aquino", expertise: "Startup & fundraising", bio: "Founder, 2 exits", initials: "MA", color: "rgba(242,101,34,0.5)", bg: "rgba(242,101,34,0.12)", tagColor: "#FFB489", tagBg: "rgba(242,101,34,0.12)", tag: "Founder, 2 exits" },
  { name: "Ramon Dizon", expertise: "Product & engineering", bio: "CTO, fintech", initials: "RD", color: "rgba(40,94,122,0.5)", bg: "rgba(40,94,122,0.12)", tagColor: "#5B9BC0", tagBg: "rgba(40,94,122,0.16)", tag: "CTO, fintech" },
  { name: "Liza Tan", expertise: "Research & IP", bio: "Professor, SLU", initials: "LT", color: "rgba(245,166,35,0.5)", bg: "rgba(245,166,35,0.12)", tagColor: "#F5C06B", tagBg: "rgba(245,166,35,0.16)", tag: "Professor, SLU" },
  { name: "Jun Baltazar", expertise: "Go-to-market", bio: "Growth lead", initials: "JB", color: "rgba(158,42,82,0.5)", bg: "rgba(158,42,82,0.12)", tagColor: "#D87BA0", tagBg: "rgba(158,42,82,0.18)", tag: "Growth lead" },
  { name: "Anna Cruz", expertise: "Legal & compliance", bio: "Corporate lawyer", initials: "AC", color: "rgba(26,107,60,0.5)", bg: "rgba(26,107,60,0.12)", tagColor: "#7AC79A", tagBg: "rgba(26,107,60,0.16)", tag: "Corporate lawyer" },
  { name: "Paolo Reyes", expertise: "Manufacturing & ops", bio: "Plant manager", initials: "PR", color: "rgba(0,85,165,0.5)", bg: "rgba(0,85,165,0.12)", tagColor: "#7BAEE8", tagBg: "rgba(0,85,165,0.16)", tag: "Plant manager" },
  { name: "Grace Lim", expertise: "Brand & marketing", bio: "Agency founder", initials: "GL", color: "rgba(226,58,46,0.5)", bg: "rgba(226,58,46,0.12)", tagColor: "#F0938C", tagBg: "rgba(226,58,46,0.14)", tag: "Agency founder" },
  { name: "Carlo Mendoza", expertise: "Data & AI", bio: "ML engineer", initials: "CM", color: "rgba(124,92,214,0.5)", bg: "rgba(124,92,214,0.12)", tagColor: "#B7A4EE", tagBg: "rgba(124,92,214,0.16)", tag: "ML engineer" },
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
  { name: "Baguio Maker Society", type: "Civil society / makerspace", description: "Community workshop space offering tools and peer support for hardware prototyping.", color: "#285E7A", bg: "rgba(40,94,122,0.12)", initials: "BMS" },
  { name: "Women in Tech Cordillera", type: "Community group", description: "Mentorship circle and meetup network supporting women founders and engineers.", color: "#7C5CD6", bg: "rgba(124,92,214,0.14)", initials: "WTC" },
];
