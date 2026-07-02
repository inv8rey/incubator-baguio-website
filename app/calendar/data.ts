export const ORANGE = "#F26522";
export const DARK = "#141417";

export type EventCategory =
  | "Workshop"
  | "Webinar"
  | "Demo Day"
  | "Conference"
  | "Networking"
  | "Competition"
  | "Government"
  | "Other";

export const CATEGORY_COLORS: Record<EventCategory, { color: string; bg: string }> = {
  Workshop: { color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
  Webinar: { color: "#3A5FA0", bg: "rgba(58,95,160,0.10)" },
  "Demo Day": { color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" },
  Conference: { color: "#6B5BD6", bg: "rgba(107,91,214,0.10)" },
  Networking: { color: "#E23A2E", bg: "rgba(226,58,46,0.10)" },
  Competition: { color: "#F5A623", bg: "rgba(245,166,35,0.14)" },
  Government: { color: "#5B9BC0", bg: "rgba(91,155,192,0.12)" },
  Other: { color: "#9A958B", bg: "rgba(154,149,139,0.14)" },
};

export type OrganizerType =
  | "Incubator Baguio"
  | "Technology Business Incubators"
  | "Government"
  | "Academe"
  | "Private Sector"
  | "Community Partners";

export const ORGANIZER_TYPES: OrganizerType[] = [
  "Incubator Baguio",
  "Technology Business Incubators",
  "Government",
  "Academe",
  "Private Sector",
  "Community Partners",
];

export type EventFormat = "In-Person" | "Online" | "Hybrid";

export const EVENT_FORMATS: EventFormat[] = ["In-Person", "Online", "Hybrid"];

export interface CityEvent {
  id: string;
  date: string; // ISO yyyy-mm-dd
  endDate?: string;
  title: string;
  category: EventCategory;
  time: string;
  venue: string;
  org: string;
  orgType: OrganizerType;
  format: EventFormat;
  cta: string;
}

export const EVENTS: CityEvent[] = [
  { id: "ev1", date: "2026-06-02", title: "Founder Fundamentals Webinar", category: "Webinar", time: "4:00 PM", venue: "Online", org: "Incubator Baguio", orgType: "Incubator Baguio", format: "Online", cta: "Join online" },
  { id: "ev2", date: "2026-06-03", title: "Lean Canvas Workshop", category: "Workshop", time: "9:00 AM", venue: "Incubator Baguio Hub", org: "Incubator Baguio", orgType: "Incubator Baguio", format: "In-Person", cta: "Register" },
  { id: "ev3", date: "2026-06-03", title: "MSME Digitalization Bootcamp", category: "Government", time: "1:00 PM", venue: "Baguio Convention Center", org: "DTI", orgType: "Government", format: "In-Person", cta: "Register" },
  { id: "ev4", date: "2026-06-05", title: "Cohort 3 Demo Day", category: "Demo Day", time: "2:00 PM", venue: "SLU Gym", org: "Incubator Baguio", orgType: "Incubator Baguio", format: "In-Person", cta: "Attend" },
  { id: "ev5", date: "2026-06-08", title: "Highland Innovation Conference", category: "Conference", time: "10:00 AM", venue: "UC Gym", org: "UC Innovation Hub", orgType: "Technology Business Incubators", format: "Hybrid", cta: "Register" },
  { id: "ev6", date: "2026-06-10", title: "Founders & Friends Mixer", category: "Networking", time: "6:00 PM", venue: "Casa Vallejo", org: "Incubator Baguio", orgType: "Incubator Baguio", format: "In-Person", cta: "RSVP" },
  { id: "ev7", date: "2026-06-12", title: "Funding Fundamentals Webinar", category: "Webinar", time: "1:00 PM", venue: "Online", org: "Incubator Baguio", orgType: "Incubator Baguio", format: "Online", cta: "Join online" },
  { id: "ev8", date: "2026-06-12", title: "City Research Forum — Call for Papers Deadline", category: "Other", time: "5:00 PM", venue: "Saint Louis University", org: "SLU SIRIB", orgType: "Academe", format: "Online", cta: "Submit" },
  { id: "ev9", date: "2026-06-16", title: "Cordillera Climate Sprint", category: "Competition", time: "9:00 AM", venue: "UP Baguio", org: "UP Baguio", orgType: "Academe", format: "In-Person", cta: "Join" },
  { id: "ev10", date: "2026-06-16", title: "Digital Governance Roundtable", category: "Government", time: "2:00 PM", venue: "Baguio City Hall", org: "CPDSO", orgType: "Government", format: "In-Person", cta: "Attend" },
  { id: "ev11", date: "2026-06-17", title: "Founders Office Hours", category: "Workshop", time: "2:00 PM", venue: "Incubator Baguio Hub", org: "Incubator Baguio", orgType: "Incubator Baguio", format: "In-Person", cta: "Register" },
  { id: "ev12", date: "2026-06-17", title: "Startup Showcase Lunch", category: "Demo Day", time: "11:00 AM", venue: "Casa Vallejo", org: "Incubator Baguio", orgType: "Incubator Baguio", format: "In-Person", cta: "Attend" },
  { id: "ev13", date: "2026-06-17", title: "AI & Emerging Tech Meetup", category: "Webinar", time: "4:00 PM", venue: "Online", org: "DICT", orgType: "Government", format: "Online", cta: "Join online" },
  { id: "ev14", date: "2026-06-19", title: "Innovation Camp Demo Day", category: "Demo Day", time: "9:00 AM", venue: "SLU Gym", org: "Incubator Baguio", orgType: "Incubator Baguio", format: "In-Person", cta: "Attend" },
  { id: "ev15", date: "2026-06-22", title: "Design Thinking for Founders", category: "Workshop", time: "2:00 PM", venue: "Baguio City Hall", org: "CPDSO", orgType: "Government", format: "In-Person", cta: "Register" },
  { id: "ev16", date: "2026-06-24", title: "IP Basics for Startups", category: "Workshop", time: "2:00 PM", venue: "Incubator Baguio Hub", org: "Incubator Baguio", orgType: "Incubator Baguio", format: "In-Person", cta: "Register" },
  { id: "ev17", date: "2026-06-25", title: "Baguio Startup Summit 2026", category: "Conference", time: "9:00 AM", venue: "SM City Baguio Convention Center", org: "Incubator Baguio", orgType: "Incubator Baguio", format: "Hybrid", cta: "Register" },
  { id: "ev18", date: "2026-06-27", title: "Mentor Network Mixer", category: "Networking", time: "5:30 PM", venue: "Casa Vallejo", org: "Incubator Baguio", orgType: "Incubator Baguio", format: "In-Person", cta: "RSVP" },
  { id: "ev19", date: "2026-06-30", title: "Investor Office Hours", category: "Webinar", time: "4:00 PM", venue: "Online", org: "Incubator Baguio", orgType: "Incubator Baguio", format: "Online", cta: "Join online" },
  { id: "ev20", date: "2027-04-19", endDate: "2027-04-25", title: "Innovation Startup Week 2027", category: "Conference", time: "All week", venue: "Citywide", org: "Incubator Baguio", orgType: "Incubator Baguio", format: "Hybrid", cta: "Learn more" },
  { id: "ev21", date: "2026-06-09", title: "MSME Growth Clinic", category: "Workshop", time: "10:00 AM", venue: "Baguio Chamber of Commerce", org: "Baguio Chamber of Commerce", orgType: "Private Sector", format: "In-Person", cta: "Register" },
  { id: "ev22", date: "2026-06-23", title: "Community Innovators Night", category: "Networking", time: "6:00 PM", venue: "Baguio Maker Society", org: "Cordillera Youth Innovators Network", orgType: "Community Partners", format: "In-Person", cta: "RSVP" },
];

export const TODAY = new Date(2026, 5, 17); // 2026-06-17

// ---- Mentoring ----
export type MentorExpertise =
  | "Fundraising & Finance"
  | "Product & Engineering"
  | "Research & IP"
  | "Go-to-Market"
  | "Legal & Compliance"
  | "Operations & Manufacturing"
  | "Marketing & Brand"
  | "Data & AI";

export const MENTOR_EXPERTISE_COLORS: Record<MentorExpertise, { color: string; bg: string }> = {
  "Fundraising & Finance": { color: ORANGE, bg: "rgba(242,101,34,0.12)" },
  "Product & Engineering": { color: "#285E7A", bg: "rgba(40,94,122,0.12)" },
  "Research & IP": { color: "#D88A0A", bg: "rgba(245,166,35,0.16)" },
  "Go-to-Market": { color: "#9E2A52", bg: "rgba(158,42,82,0.12)" },
  "Legal & Compliance": { color: "#1A6B3C", bg: "rgba(26,107,60,0.12)" },
  "Operations & Manufacturing": { color: "#0055A5", bg: "rgba(0,85,165,0.12)" },
  "Marketing & Brand": { color: "#E23A2E", bg: "rgba(226,58,46,0.12)" },
  "Data & AI": { color: "#7C5CD6", bg: "rgba(124,92,214,0.14)" },
};

export type MentorFormat = "Online" | "In-Person";
export const MENTOR_FORMATS: MentorFormat[] = ["Online", "In-Person"];

export interface MentorSlot {
  id: string;
  mentorName: string;
  initials: string;
  color: string;
  expertise: MentorExpertise;
  date: string; // ISO
  time: string;
  duration: string;
  format: MentorFormat;
  venue: string;
}

export const MENTOR_SLOTS: MentorSlot[] = [
  { id: "ms1", mentorName: "Maria Aquino", initials: "MA", color: ORANGE, expertise: "Fundraising & Finance", date: "2026-06-03", time: "10:00 AM", duration: "30 min", format: "Online", venue: "Online" },
  { id: "ms2", mentorName: "Maria Aquino", initials: "MA", color: ORANGE, expertise: "Fundraising & Finance", date: "2026-06-17", time: "3:00 PM", duration: "30 min", format: "Online", venue: "Online" },
  { id: "ms3", mentorName: "Maria Aquino", initials: "MA", color: ORANGE, expertise: "Fundraising & Finance", date: "2026-06-24", time: "11:00 AM", duration: "30 min", format: "In-Person", venue: "Incubator Baguio Hub" },
  { id: "ms4", mentorName: "Ramon Dizon", initials: "RD", color: "#285E7A", expertise: "Product & Engineering", date: "2026-06-04", time: "3:00 PM", duration: "30 min", format: "Online", venue: "Online" },
  { id: "ms5", mentorName: "Ramon Dizon", initials: "RD", color: "#285E7A", expertise: "Product & Engineering", date: "2026-06-18", time: "9:00 AM", duration: "30 min", format: "In-Person", venue: "Incubator Baguio Hub" },
  { id: "ms6", mentorName: "Liza Tan", initials: "LT", color: "#D88A0A", expertise: "Research & IP", date: "2026-06-09", time: "1:00 PM", duration: "30 min", format: "Online", venue: "Online" },
  { id: "ms7", mentorName: "Liza Tan", initials: "LT", color: "#D88A0A", expertise: "Research & IP", date: "2026-06-23", time: "10:00 AM", duration: "30 min", format: "Online", venue: "Online" },
  { id: "ms8", mentorName: "Jun Baltazar", initials: "JB", color: "#9E2A52", expertise: "Go-to-Market", date: "2026-06-10", time: "4:00 PM", duration: "30 min", format: "Online", venue: "Online" },
  { id: "ms9", mentorName: "Jun Baltazar", initials: "JB", color: "#9E2A52", expertise: "Go-to-Market", date: "2026-06-25", time: "2:00 PM", duration: "30 min", format: "In-Person", venue: "Incubator Baguio Hub" },
  { id: "ms10", mentorName: "Anna Cruz", initials: "AC", color: "#1A6B3C", expertise: "Legal & Compliance", date: "2026-06-05", time: "11:00 AM", duration: "30 min", format: "Online", venue: "Online" },
  { id: "ms11", mentorName: "Anna Cruz", initials: "AC", color: "#1A6B3C", expertise: "Legal & Compliance", date: "2026-06-19", time: "3:00 PM", duration: "30 min", format: "Online", venue: "Online" },
  { id: "ms12", mentorName: "Paolo Reyes", initials: "PR", color: "#0055A5", expertise: "Operations & Manufacturing", date: "2026-06-11", time: "9:00 AM", duration: "30 min", format: "In-Person", venue: "Incubator Baguio Hub" },
  { id: "ms13", mentorName: "Paolo Reyes", initials: "PR", color: "#0055A5", expertise: "Operations & Manufacturing", date: "2026-06-26", time: "1:00 PM", duration: "30 min", format: "Online", venue: "Online" },
  { id: "ms14", mentorName: "Grace Lim", initials: "GL", color: "#E23A2E", expertise: "Marketing & Brand", date: "2026-06-12", time: "2:00 PM", duration: "30 min", format: "Online", venue: "Online" },
  { id: "ms15", mentorName: "Grace Lim", initials: "GL", color: "#E23A2E", expertise: "Marketing & Brand", date: "2026-06-22", time: "10:00 AM", duration: "30 min", format: "Online", venue: "Online" },
  { id: "ms16", mentorName: "Carlo Mendoza", initials: "CM", color: "#7C5CD6", expertise: "Data & AI", date: "2026-06-16", time: "3:00 PM", duration: "30 min", format: "Online", venue: "Online" },
  { id: "ms17", mentorName: "Carlo Mendoza", initials: "CM", color: "#7C5CD6", expertise: "Data & AI", date: "2026-06-29", time: "11:00 AM", duration: "30 min", format: "In-Person", venue: "Incubator Baguio Hub" },
];

export const MENTOR_NAMES = Array.from(new Set(MENTOR_SLOTS.map((s) => s.mentorName)));
