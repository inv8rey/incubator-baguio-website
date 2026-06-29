export const ORANGE = "#F26522";
export const DARK = "#141417";

export type EventCategory =
  | "Workshop"
  | "Hackathon"
  | "Forum"
  | "Demo Day"
  | "Webinar"
  | "Networking"
  | "Flagship";

export const CATEGORY_COLORS: Record<EventCategory, { color: string; bg: string }> = {
  Workshop: { color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
  Hackathon: { color: "#285E7A", bg: "rgba(40,94,122,0.10)" },
  Forum: { color: "#9E2A52", bg: "rgba(158,42,82,0.10)" },
  "Demo Day": { color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" },
  Webinar: { color: "#3A5FA0", bg: "rgba(58,95,160,0.10)" },
  Networking: { color: "#6B5BD6", bg: "rgba(107,91,214,0.10)" },
  Flagship: { color: ORANGE, bg: "rgba(242,101,34,0.12)" },
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
  { id: "ev1", date: "2026-06-30", title: "Founders Office Hours", category: "Workshop", time: "2:00 PM", venue: "Incubator Baguio Hub", org: "Incubator Baguio", cta: "Register" },
  { id: "ev2", date: "2026-07-04", title: "Innovation Camp Demo Day", category: "Demo Day", time: "9:00 AM", venue: "SLU Gym", org: "Incubator Baguio", cta: "Attend" },
  { id: "ev3", date: "2026-07-14", title: "Design Thinking for Founders", category: "Workshop", time: "2:00 PM", venue: "Baguio City Hall", org: "CPDSO", cta: "Register" },
  { id: "ev4", date: "2026-07-22", title: "Cordillera Climate Sprint", category: "Hackathon", time: "9:00 AM", venue: "UP Baguio", org: "UP Baguio", cta: "Join" },
  { id: "ev5", date: "2026-07-30", title: "Investor Connect: Baguio", category: "Forum", time: "1:00 PM", venue: "UC Gym", org: "University of the Cordilleras", cta: "Register" },
  { id: "ev6", date: "2026-08-05", title: "City Research Forum 2026 — Call for Papers Deadline", category: "Forum", time: "8:30 AM", venue: "Saint Louis University", org: "SLU SIRIB", cta: "Submit" },
  { id: "ev7", date: "2026-08-12", title: "AI & Emerging Tech Meetup", category: "Webinar", time: "4:00 PM", venue: "Online", org: "DICT", cta: "Join online" },
  { id: "ev8", date: "2026-08-19", title: "MSME Digitalization Bootcamp", category: "Workshop", time: "9:00 AM", venue: "Baguio Convention Center", org: "DTI", cta: "Register" },
  { id: "ev9", date: "2026-09-03", title: "Mentor Network Mixer", category: "Networking", time: "5:30 PM", venue: "Casa Vallejo", org: "Incubator Baguio", cta: "RSVP" },
  { id: "ev10", date: "2027-04-19", endDate: "2027-04-25", title: "Innovation Startup Week 2027", category: "Flagship", time: "All week", venue: "Citywide", org: "Incubator Baguio", cta: "Learn more" },
];

export const TODAY = new Date(2026, 5, 29); // 2026-06-29, matches the site's "current" context
