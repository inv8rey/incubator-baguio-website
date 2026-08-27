// Shared vocabulary for the Organization Profile feature (PRD §8) so the
// dashboard edit form, the public profile page, and any future admin tooling
// all render and validate against the same lists.

export const ORG_TYPES_WITH_ACADEME = ["TBIs", "Academe", "Companies", "Service Providers", "Government", "Community", "Coworking Spaces", "Makerspaces & Labs"] as const;
export type OrgTypeWithAcademe = (typeof ORG_TYPES_WITH_ACADEME)[number];

export const ORG_SECTORS = [
  "Technology",
  "Education",
  "Tourism",
  "Agriculture",
  "Creative Industries",
  "Sustainability",
  "Healthcare",
  "Government",
  "Entrepreneurship",
  "Research",
  "Other",
] as const;

// Suggested tags for expertise / can_offer / looking_for. All three fields
// are free-form text[] under the hood (an org can type anything), these are
// just quick-add chips so most orgs never need to.
export const ORG_EXPERTISE_SUGGESTIONS = [
  "Artificial Intelligence",
  "Research",
  "Product Development",
  "Technology Transfer",
  "Entrepreneurship",
  "Training",
  "Innovation",
];

export const ORG_CAN_OFFER_SUGGESTIONS = [
  "Research expertise",
  "Training",
  "Laboratory facilities",
  "Student talent",
  "Mentors",
  "Technical expertise",
  "Industry connections",
];

export const ORG_LOOKING_FOR_SUGGESTIONS = [
  "Industry partners",
  "Research collaborators",
  "Government partners",
  "Startups",
  "Mentors",
  "Funding",
  "Innovation projects",
];

export const PHILIPPINE_REGIONS = [
  "NCR",
  "CAR",
  "Region I — Ilocos",
  "Region II — Cagayan Valley",
  "Region III — Central Luzon",
  "Region IV-A — CALABARZON",
  "MIMAROPA",
  "Region V — Bicol",
  "Region VI — Western Visayas",
  "Region VII — Central Visayas",
  "Region VIII — Eastern Visayas",
  "Region IX — Zamboanga Peninsula",
  "Region X — Northern Mindanao",
  "Region XI — Davao",
  "Region XII — SOCCSKSARGEN",
  "Region XIII — Caraga",
  "BARMM",
];
