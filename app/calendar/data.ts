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

export const EVENTS: CityEvent[] = [];

export const TODAY = new Date();

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

export const MENTOR_SLOTS: MentorSlot[] = [];

export const MENTOR_NAMES = Array.from(new Set(MENTOR_SLOTS.map((s) => s.mentorName)));
