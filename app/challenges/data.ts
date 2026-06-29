export interface Solver {
  initials: string;
  color: string;
  name: string;
  members: number;
  status: "Active" | "In review";
  description: string;
  school: string;
  track: string;
  registered: string;
}

export interface Challenge {
  id: string;
  sector: string;
  sectorColor: string;
  sectorBg: string;
  deadlineColor: string;
  deadline: string;
  daysLeft: number;
  title: string;
  summary: string;
  problem: string[];
  scope: string[];
  support: string[];
  timeline: { label: string; date: string }[];
  status: string;
  scopeRegion: string;
  submissions: number;
  totalSolvers: number;
  solvers: Solver[];
  orgColor: string;
  orgInitials: string;
  orgInitialsFontSize: string;
  orgName: string;
  orgFull: string;
  contactEmail: string;
}

export const CHALLENGES: Challenge[] = [
  {
    id: "agri-cold-chain",
    sector: "Agriculture",
    sectorColor: "#3F9E4D",
    sectorBg: "rgba(126,217,87,0.14)",
    deadlineColor: "#E23A2E",
    deadline: "9 days left",
    daysLeft: 9,
    title: "Cut post-harvest loss for highland vegetable farmers",
    summary: "Build a cold-chain or logistics solution that keeps Benguet produce fresh to market.",
    problem: [
      "Highland vegetable farmers across Benguet and the Mountain Province lose an estimated 20&ndash;30% of harvested produce before it ever reaches a buyer. Poor handling, long road transport in open trucks, and no temporary cold storage at consolidation points are the biggest drivers.",
      "The Department of Agriculture &mdash; CAR wants a practical, deployable solution that small farmer cooperatives can actually adopt, not a lab prototype.",
    ],
    scope: [
      "Design a cold-chain, packaging, or logistics-routing solution that reduces spoilage between farm and market.",
      "Solution must work within the budget and infrastructure realities of a farmer cooperative (limited grid power, rural roads).",
      "Pilot-ready within 3 months of selection, in at least one Benguet municipality.",
    ],
    support: [
      "Access to two pilot cooperatives in La Trinidad and Atok.",
      "Seed funding of up to &#8369;150,000 for pilot materials and equipment.",
      "Incubator Baguio mentorship and DA-CAR technical liaison throughout the pilot.",
    ],
    timeline: [
      { label: "Applications close", date: "July 8, 2026" },
      { label: "Shortlist announced", date: "July 15, 2026" },
      { label: "Pitch & selection", date: "July 24, 2026" },
      { label: "Pilot kickoff", date: "August 4, 2026" },
    ],
    status: "Open",
    scopeRegion: "Cordillera Region",
    submissions: 12,
    totalSolvers: 12,
    solvers: [
      { initials: "CT", color: "#D88A0A", name: "ColdTrail", members: 4, status: "Active", description: "Building a low-cost insulated transport crate with IoT temperature monitoring for highland vegetable routes.", school: "University of the Cordilleras", track: "Engineering / Hardware", registered: "July 2, 2026" },
      { initials: "HV", color: "#285E7A", name: "HarvestLink", members: 3, status: "Active", description: "A mobile-first platform connecting Benguet farmers to direct buyers in Metro Baguio, eliminating spoilage from middlemen delays.", school: "Saint Louis University", track: "Software / Agritech", registered: "July 5, 2026" },
      { initials: "FP", color: "#E23A2E", name: "FreshPath", members: 5, status: "Active", description: "Researching ethylene-absorbing biodegradable packaging materials sourced from local agricultural by-products to extend shelf life.", school: "Benguet State University", track: "Research / Materials", registered: "July 8, 2026" },
      { initials: "AG", color: "#9E2A52", name: "AgroGrid", members: 3, status: "In review", description: "A supply-chain visibility dashboard for DA-CAR field officers to track vegetable movement from farm gate to trading posts in real time.", school: "UP Baguio", track: "Data / Logistics", registered: "July 10, 2026" },
      { initials: "RV", color: "#1A6B3C", name: "RootVault", members: 4, status: "Active", description: "Designing community cold storage co-ops for barangay clusters, powered by solar and managed through a shared app.", school: "University of Baguio", track: "Social Enterprise", registered: "July 11, 2026" },
    ],
    orgColor: "#1A6B3C",
    orgInitials: "DA",
    orgInitialsFontSize: "10px",
    orgName: "Dept of Agriculture, CAR",
    orgFull: "Department of Agriculture &mdash; Cordillera Administrative Region",
    contactEmail: "challenges@da-car.gov.ph",
  },
  {
    id: "waste-segregation",
    sector: "Environment",
    sectorColor: "#285E7A",
    sectorBg: "rgba(40,94,122,0.1)",
    deadlineColor: "#D88A0A",
    deadline: "21 days left",
    daysLeft: 21,
    title: "Smart waste segregation for Baguio public markets",
    summary: "Design a system that improves sorting and diversion at high-traffic market sites.",
    problem: [
      "Baguio's public markets generate large volumes of mixed waste daily. Segregation-at-source compliance is low, and the City Environment and Parks Management Office (CEPMO) spends significant resources re-sorting downstream.",
      "CEPMO is looking for a system &mdash; physical, digital, or behavioral &mdash; that measurably increases sorting accuracy at the point of disposal inside the market itself.",
    ],
    scope: [
      "Propose a segregation system deployable at one or more designated public markets (Baguio City Public Market, Maharlika Market, or a satellite market).",
      "Must address both vendor and shopper behavior, not just bin design.",
      "Include a simple way to measure diversion rate before and after deployment.",
    ],
    support: [
      "Pilot access to the Baguio City Public Market with CEPMO coordination.",
      "Seed funding of up to &#8369;100,000 for materials, signage, or tooling.",
      "Data-sharing on current waste volumes and composition from CEPMO.",
    ],
    timeline: [
      { label: "Applications close", date: "July 20, 2026" },
      { label: "Shortlist announced", date: "July 28, 2026" },
      { label: "Pitch & selection", date: "August 5, 2026" },
      { label: "Pilot kickoff", date: "August 18, 2026" },
    ],
    status: "Open",
    scopeRegion: "Baguio City",
    submissions: 8,
    totalSolvers: 8,
    solvers: [
      { initials: "SR", color: "#285E7A", name: "SortRight", members: 4, status: "Active", description: "A color-coded smart bin system with sensor-based fill alerts for vendor stalls at the Baguio City Public Market.", school: "Saint Louis University", track: "Engineering / IoT", registered: "July 6, 2026" },
      { initials: "WV", color: "#3F9E4D", name: "WasteVision", members: 3, status: "Active", description: "Computer-vision sorting guidance shown on tablets at disposal points to coach vendors in real time.", school: "University of Baguio", track: "Software / Computer Vision", registered: "July 9, 2026" },
      { initials: "MC", color: "#D88A0A", name: "MarketCycle", members: 3, status: "In review", description: "An incentive and rewards app that tracks vendor segregation compliance and ties it to stall fee discounts.", school: "UP Baguio", track: "Behavioral / Civic Tech", registered: "July 12, 2026" },
    ],
    orgColor: "#F26522",
    orgInitials: "CEPMO",
    orgInitialsFontSize: "9px",
    orgName: "City Environment Office",
    orgFull: "City Environment and Parks Management Office, Baguio",
    contactEmail: "challenges@cepmo.baguio.gov.ph",
  },
  {
    id: "tourism-offpeak",
    sector: "Tourism",
    sectorColor: "#9E2A52",
    sectorBg: "rgba(158,42,82,0.1)",
    deadlineColor: "#3F9E4D",
    deadline: "34 days left",
    daysLeft: 34,
    title: "Spread tourism beyond the peak season rush",
    summary: "Create a platform that surfaces off-peak experiences and local creative businesses.",
    problem: [
      "Baguio's tourism economy is heavily concentrated around a handful of peak weekends, which strains infrastructure and crowds out smaller, local-run experiences the rest of the year.",
      "The Baguio Tourism Council wants a platform or product that gives visitors a reason to come &mdash; and a way to discover small, local businesses &mdash; during shoulder and off-peak periods.",
    ],
    scope: [
      "Build a discovery platform, itinerary tool, or incentive mechanism that promotes off-peak experiences and local creative businesses.",
      "Must include a path for small/independent operators to list themselves without heavy onboarding friction.",
      "Should integrate with or complement existing city tourism communications channels.",
    ],
    support: [
      "Introductions to 20+ local creative and hospitality businesses via the Tourism Council network.",
      "Co-promotion through official Baguio tourism channels during the pilot.",
      "Seed funding of up to &#8369;120,000 for platform development or pilot incentives.",
    ],
    timeline: [
      { label: "Applications close", date: "August 2, 2026" },
      { label: "Shortlist announced", date: "August 10, 2026" },
      { label: "Pitch & selection", date: "August 19, 2026" },
      { label: "Pilot kickoff", date: "September 1, 2026" },
    ],
    status: "Open",
    scopeRegion: "Baguio City",
    submissions: 19,
    totalSolvers: 14,
    solvers: [
      { initials: "OF", color: "#9E2A52", name: "OffSeason", members: 5, status: "Active", description: "A discovery app that surfaces local creative businesses and shoulder-season itineraries curated with barangay tourism officers.", school: "University of the Cordilleras", track: "Software / Tourism Tech", registered: "July 14, 2026" },
      { initials: "LB", color: "#D88A0A", name: "LocalBound", members: 4, status: "Active", description: "A self-serve listing tool that lets small independent operators join official tourism channels without heavy onboarding.", school: "Saint Louis University", track: "Software / Marketplace", registered: "July 16, 2026" },
      { initials: "TR", color: "#285E7A", name: "TrailRoute", members: 3, status: "In review", description: "A walkable-itinerary generator that routes visitors through off-peak neighborhoods and lesser-known creative spaces.", school: "Benguet State University", track: "Product / UX Research", registered: "July 19, 2026" },
    ],
    orgColor: "#9E2A52",
    orgInitials: "DOT",
    orgInitialsFontSize: "10px",
    orgName: "Baguio Tourism Council",
    orgFull: "Baguio Tourism Council, in partnership with DOT-CAR",
    contactEmail: "challenges@baguiotourism.ph",
  },
  {
    id: "remote-learning",
    sector: "Education",
    sectorColor: "#D88A0A",
    sectorBg: "rgba(245,166,35,0.14)",
    deadlineColor: "#D88A0A",
    deadline: "18 days left",
    daysLeft: 18,
    title: "Reach remote barangay students with learning tools",
    summary: "Offline-friendly learning for areas with limited connectivity in the Cordillera.",
    problem: [
      "Students in remote barangays across the Cordillera frequently lose access to supplementary learning materials due to unreliable or absent internet connectivity, widening the gap with urban-center peers.",
      "SLU's College of Education is looking for a learning tool or distribution model that works in low- or no-connectivity conditions.",
    ],
    scope: [
      "Design a learning tool, content package, or distribution model that functions offline or in low-bandwidth conditions.",
      "Target at least one subject area and grade band for the initial pilot.",
      "Must be deployable through existing school or barangay infrastructure (no new hardware procurement assumed).",
    ],
    support: [
      "Pilot access to partner schools identified by SLU's College of Education.",
      "Curriculum and pedagogy review support from SLU faculty.",
      "Seed funding of up to &#8369;100,000 for content development or pilot logistics.",
    ],
    timeline: [
      { label: "Applications close", date: "July 17, 2026" },
      { label: "Shortlist announced", date: "July 24, 2026" },
      { label: "Pitch & selection", date: "August 1, 2026" },
      { label: "Pilot kickoff", date: "August 14, 2026" },
    ],
    status: "Open",
    scopeRegion: "Cordillera Region",
    submissions: 6,
    totalSolvers: 6,
    solvers: [
      { initials: "OL", color: "#0055A5", name: "OfflineLearn", members: 4, status: "Active", description: "A pre-loaded SD-card learning module with weekly teacher-distributed content for areas with no reliable signal.", school: "SLU College of Education", track: "EdTech / Content Design", registered: "July 4, 2026" },
      { initials: "BB", color: "#D88A0A", name: "BarangayBox", members: 3, status: "In review", description: "A solar-powered local Wi-Fi hotspot device that syncs lesson packets to student phones when in range of the school.", school: "UP Baguio", track: "Engineering / Hardware", registered: "July 9, 2026" },
    ],
    orgColor: "#0055A5",
    orgInitials: "SLU",
    orgInitialsFontSize: "10px",
    orgName: "SLU College of Education",
    orgFull: "Saint Louis University &mdash; College of Education",
    contactEmail: "challenges@slu.edu.ph",
  },
  {
    id: "permit-renewal",
    sector: "Govtech",
    sectorColor: "#285E7A",
    sectorBg: "rgba(40,94,122,0.1)",
    deadlineColor: "#3F9E4D",
    deadline: "40 days left",
    daysLeft: 40,
    title: "Simplify business permit renewals for MSMEs",
    summary: "Cut the time and paperwork small businesses spend renewing permits each year.",
    problem: [
      "MSMEs in Baguio spend an average of several full business days each year just on permit renewal &mdash; queuing, re-submitting documents the city already has, and reconciling requirements across offices.",
      "The Business Permits and Licensing Office wants a solution that meaningfully cuts time-to-renewal without requiring a full core-system replacement.",
    ],
    scope: [
      "Propose a solution that simplifies, pre-fills, or streamlines the permit renewal process for MSMEs.",
      "Can be a citizen-facing tool, a backend workflow improvement, or both.",
      "Must work within current BPLO data and process constraints &mdash; no assumption of a new system-of-record.",
    ],
    support: [
      "Working sessions with BPLO process owners to map the current renewal workflow.",
      "Sandbox access to anonymized permit data for design and testing.",
      "Seed funding of up to &#8369;130,000 for pilot development.",
    ],
    timeline: [
      { label: "Applications close", date: "August 8, 2026" },
      { label: "Shortlist announced", date: "August 17, 2026" },
      { label: "Pitch & selection", date: "August 26, 2026" },
      { label: "Pilot kickoff", date: "September 9, 2026" },
    ],
    status: "Open",
    scopeRegion: "Baguio City",
    submissions: 15,
    totalSolvers: 11,
    solvers: [
      { initials: "PR", color: "#F26522", name: "PermitRunner", members: 5, status: "Active", description: "A pre-fill workflow that reuses data BPLO already has on file so renewing MSMEs skip redundant document submission.", school: "University of Baguio", track: "Software / Govtech", registered: "July 7, 2026" },
      { initials: "QF", color: "#285E7A", name: "QueueFree", members: 3, status: "Active", description: "A queue-and-status tracking app that lets MSME owners submit renewal documents remotely and get slotted appointment times.", school: "Saint Louis University", track: "Software / Civic Tech", registered: "July 13, 2026" },
      { initials: "BL", color: "#3F9E4D", name: "BizLink", members: 3, status: "In review", description: "A cross-office data-sharing layer that reconciles requirements between BPLO and other permitting offices automatically.", school: "UP Baguio", track: "Backend / Systems Integration", registered: "July 18, 2026" },
    ],
    orgColor: "#F26522",
    orgInitials: "BPLO",
    orgInitialsFontSize: "9px",
    orgName: "Business Permits Office",
    orgFull: "Business Permits and Licensing Office, Baguio City",
    contactEmail: "challenges@bplo.baguio.gov.ph",
  },
  {
    id: "senior-health",
    sector: "Health",
    sectorColor: "#E23A2E",
    sectorBg: "rgba(226,58,46,0.1)",
    deadlineColor: "#D88A0A",
    deadline: "15 days left",
    daysLeft: 15,
    title: "Connect senior citizens to barangay health services",
    summary: "A simple way for elderly residents to book check-ups and track medication.",
    problem: [
      "Senior citizens across Baguio's barangays often miss scheduled check-ups and medication refills because booking and tracking depends on walk-ins, phone trees, or relatives remembering on their behalf.",
      "The City Health Services Office wants a low-friction way for elderly residents &mdash; or their caregivers &mdash; to book appointments and keep track of medication schedules.",
    ],
    scope: [
      "Design a booking and/or medication-tracking solution usable by senior citizens directly or through a caregiver.",
      "Must account for low digital literacy and limited smartphone access in parts of the target population.",
      "Should integrate with existing barangay health worker workflows rather than replace them.",
    ],
    support: [
      "Pilot access to two barangay health centers via CHSO coordination.",
      "Input from barangay health workers during design and testing.",
      "Seed funding of up to &#8369;110,000 for pilot rollout.",
    ],
    timeline: [
      { label: "Applications close", date: "July 14, 2026" },
      { label: "Shortlist announced", date: "July 21, 2026" },
      { label: "Pitch & selection", date: "July 30, 2026" },
      { label: "Pilot kickoff", date: "August 11, 2026" },
    ],
    status: "Open",
    scopeRegion: "Baguio City",
    submissions: 10,
    totalSolvers: 9,
    solvers: [
      { initials: "CC", color: "#009B8D", name: "CareCall", members: 4, status: "Active", description: "A simple voice-call and SMS booking line for senior citizens to schedule barangay health center check-ups without an app.", school: "University of Baguio", track: "Software / Health Tech", registered: "July 8, 2026" },
      { initials: "MD", color: "#E23A2E", name: "MedDial", members: 3, status: "Active", description: "A caregiver-facing medication reminder and refill tracker that syncs with barangay health worker visit schedules.", school: "Saint Louis University", track: "Software / Mobile Health", registered: "July 12, 2026" },
      { initials: "SH", color: "#9E2A52", name: "SeniorHub", members: 2, status: "In review", description: "A printed QR-card system that lets elderly residents check in at health centers and auto-logs visit history for health workers.", school: "Benguet State University", track: "Service Design", registered: "July 15, 2026" },
    ],
    orgColor: "#009B8D",
    orgInitials: "CHSO",
    orgInitialsFontSize: "9px",
    orgName: "City Health Services Office",
    orgFull: "City Health Services Office, Baguio",
    contactEmail: "challenges@chso.baguio.gov.ph",
  },
];

export function getChallenge(id: string) {
  return CHALLENGES.find((c) => c.id === id);
}
