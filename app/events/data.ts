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

export interface CityEvent {
  id: string;
  date: string; // ISO yyyy-mm-dd
  endDate?: string;
  title: string;
  category: EventCategory;
  time: string;
  venue: string;
  org: string;
  cta: string;
}

export const EVENTS: CityEvent[] = [
  { id: "ev1", date: "2026-06-02", title: "Founder Fundamentals Webinar", category: "Webinar", time: "4:00 PM", venue: "Online", org: "Incubator Baguio", cta: "Join online" },
  { id: "ev2", date: "2026-06-03", title: "Lean Canvas Workshop", category: "Workshop", time: "9:00 AM", venue: "Incubator Baguio Hub", org: "Incubator Baguio", cta: "Register" },
  { id: "ev3", date: "2026-06-03", title: "MSME Digitalization Bootcamp", category: "Government", time: "1:00 PM", venue: "Baguio Convention Center", org: "DTI", cta: "Register" },
  { id: "ev4", date: "2026-06-05", title: "Cohort 3 Demo Day", category: "Demo Day", time: "2:00 PM", venue: "SLU Gym", org: "Incubator Baguio", cta: "Attend" },
  { id: "ev5", date: "2026-06-08", title: "Highland Innovation Conference", category: "Conference", time: "10:00 AM", venue: "UC Gym", org: "University of the Cordilleras", cta: "Register" },
  { id: "ev6", date: "2026-06-10", title: "Founders & Friends Mixer", category: "Networking", time: "6:00 PM", venue: "Casa Vallejo", org: "Incubator Baguio", cta: "RSVP" },
  { id: "ev7", date: "2026-06-12", title: "Funding Fundamentals Webinar", category: "Webinar", time: "1:00 PM", venue: "Online", org: "Incubator Baguio", cta: "Join online" },
  { id: "ev8", date: "2026-06-12", title: "City Research Forum — Call for Papers Deadline", category: "Other", time: "5:00 PM", venue: "Saint Louis University", org: "SLU SIRIB", cta: "Submit" },
  { id: "ev9", date: "2026-06-16", title: "Cordillera Climate Sprint", category: "Competition", time: "9:00 AM", venue: "UP Baguio", org: "UP Baguio", cta: "Join" },
  { id: "ev10", date: "2026-06-16", title: "Digital Governance Roundtable", category: "Government", time: "2:00 PM", venue: "Baguio City Hall", org: "CPDSO", cta: "Attend" },
  { id: "ev11", date: "2026-06-17", title: "Founders Office Hours", category: "Workshop", time: "2:00 PM", venue: "Incubator Baguio Hub", org: "Incubator Baguio", cta: "Register" },
  { id: "ev12", date: "2026-06-17", title: "Startup Showcase Lunch", category: "Demo Day", time: "11:00 AM", venue: "Casa Vallejo", org: "Incubator Baguio", cta: "Attend" },
  { id: "ev13", date: "2026-06-17", title: "AI & Emerging Tech Meetup", category: "Webinar", time: "4:00 PM", venue: "Online", org: "DICT", cta: "Join online" },
  { id: "ev14", date: "2026-06-19", title: "Innovation Camp Demo Day", category: "Demo Day", time: "9:00 AM", venue: "SLU Gym", org: "Incubator Baguio", cta: "Attend" },
  { id: "ev15", date: "2026-06-22", title: "Design Thinking for Founders", category: "Workshop", time: "2:00 PM", venue: "Baguio City Hall", org: "CPDSO", cta: "Register" },
  { id: "ev16", date: "2026-06-24", title: "IP Basics for Startups", category: "Workshop", time: "2:00 PM", venue: "Incubator Baguio Hub", org: "Incubator Baguio", cta: "Register" },
  { id: "ev17", date: "2026-06-25", title: "Baguio Startup Summit 2026", category: "Conference", time: "9:00 AM", venue: "SM City Baguio Convention Center", org: "Incubator Baguio", cta: "Register" },
  { id: "ev18", date: "2026-06-27", title: "Mentor Network Mixer", category: "Networking", time: "5:30 PM", venue: "Casa Vallejo", org: "Incubator Baguio", cta: "RSVP" },
  { id: "ev19", date: "2026-06-30", title: "Investor Office Hours", category: "Webinar", time: "4:00 PM", venue: "Online", org: "Incubator Baguio", cta: "Join online" },
  { id: "ev20", date: "2027-04-19", endDate: "2027-04-25", title: "Innovation Startup Week 2027", category: "Conference", time: "All week", venue: "Citywide", org: "Incubator Baguio", cta: "Learn more" },
];

export const TODAY = new Date(2026, 5, 17); // 2026-06-17
