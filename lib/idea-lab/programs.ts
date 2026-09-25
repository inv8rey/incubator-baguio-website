export const PROGRAMS = [
  'BS Computer Science',
  'BS Information Technology',
  'BS Civil Engineering',
  'BS Electronics Engineering',
  'BS Nursing',
  'BS Education',
  'BS Architecture',
  'BS Business Administration',
  'BS Agriculture',
  'BS Environmental Science',
  'BS Tourism/Hospitality',
  'BS Psychology',
  'BS Social Work',
  'Fine Arts/Design',
  'Other',
] as const;

export const SKILL_CHIPS = [
  'Programming', 'Data analysis', 'Mobile apps', 'Web design', 'Hardware / IoT', 'Graphic design',
  'Research writing', 'Surveys and interviews', 'GIS and mapping', 'Business planning', 'Community organizing', 'Video and media',
] as const;

export const TIME_OPTIONS = [
  { value: 'semester', label: 'One semester' },
  { value: 'year', label: 'One year' },
  { value: 'more', label: 'More than a year' },
] as const;

export const BUDGET_OPTIONS = [
  { value: 'very-low', label: 'Very low' },
  { value: 'low', label: 'Low' },
  { value: 'some', label: 'Some funding' },
] as const;

export const LEVELS = [
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'professional', label: 'Not a student (innovator or professional)' },
] as const;

export const PROJECT_TYPES = [
  { value: 'capstone', label: 'Capstone' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'startup', label: 'Startup' },
] as const;

export const REFINE_PRESETS = [
  'More research-focused',
  'Cheaper to build',
  'Narrower scope',
  'Different angle',
  'For a different program',
] as const;

export const FOOTER_DISCLAIMER = 'Ideas are AI-generated starting points. Check feasibility with your adviser and verify any data or partners before relying on them.';
export const NOTE_DISCLAIMER = 'Starting outline, not a finished paper.';
export const NOTE_DISCLAIMER_LONG = 'This is a starting outline for you to develop and cite properly. It is not a finished paper.';
