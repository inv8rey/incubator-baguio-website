// Single source of truth for the Baguio City Research and Innovation Agenda
// used by the Idea Lab prompt and UI. The six priority areas and their themes
// come from the official City of Baguio Research & Innovation Agenda (based on
// the CDP 2023-2029 and the Baguio 2043 Vision). An older placeholder list of
// areas is superseded and must not appear anywhere (see scripts/idea-lab.test.ts).

export const PRIORITY_AREAS = [
  { slug: 'environmental-action', name: 'Environmental Action',
    themes: ['net zero', 'circularity', 'water and resource security', 'urban agriculture'] },
  { slug: 'social-protection-inclusivity', name: 'Social Protection and Inclusivity',
    themes: ['poverty', 'universal health care', 'education', 'cultural preservation', 'livability', 'social vulnerability'] },
  { slug: 'economic-expansion-creative-economy', name: 'Economic Expansion and the Creative Economy',
    themes: ['creative industries', 'sustainable tourism', 'innovation ecosystems', 'economic formalisation'] },
  { slug: 'infrastructure-smart-city', name: 'Infrastructure and Smart City Development',
    themes: ['smart mobility', 'digital systems', 'green buildings', 'universal access'] },
  { slug: 'resilience-drr', name: 'Resilience and Disaster Risk Reduction',
    themes: ['climate risk', 'resilient infrastructure', 'nature-based solutions', 'multi-hazard preparedness', 'structural resilience'] },
  { slug: 'good-governance', name: 'Good Governance and Institutional Growth',
    themes: ['institutional capacity', 'public service delivery', 'transparency', 'evidence-based policymaking'] },
] as const;

export type PriorityAreaSlug = (typeof PRIORITY_AREAS)[number]['slug'];

export const STATUTORY_AREAS = [
  'Food security and sustainable urban agriculture',
  'Education and the academe',
  'Health',
  'Social development',
  'Environmental protection',
  'Entrepreneurship',
  'Safety and security',
  'Youth, family and social work',
  'Secure, clean and renewable energy',
  'Traditional knowledge and cultural expressions',
  'Development of human capital',
  'Transportation services',
  'Creative research',
] as const;

export function areaBySlug(slug: string) {
  return PRIORITY_AREAS.find((a) => a.slug === slug);
}

// Maps an Idea Lab priority area to the existing challenges.category values,
// used only when staff send a shared idea to the challenge repository.
export const CHALLENGE_CATEGORY: Record<PriorityAreaSlug, string> = {
  'environmental-action': 'Environmental Action',
  'social-protection-inclusivity': 'Social Protection & Inclusivity',
  'economic-expansion-creative-economy': 'Economic Expansion',
  'infrastructure-smart-city': 'Smart City',
  'resilience-drr': 'Resilience',
  'good-governance': 'Good Governance',
};
