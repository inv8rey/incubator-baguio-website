// Shared by the /pinasiklab/ page and the homepage promo banner so the
// registration link only ever has to be changed in one place.
// The in-site application form (replaces the old Google Form).
export const REGISTER_URL = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/pinasiklab/register/`;

// Shown on the page, the homepage banner, and the application form. Empty
// reads "to be announced" until the real date is set.
export const REGISTRATION_DEADLINE = "October 13, 2026";

// Applications stop at the end of this day, Philippine time. The database
// enforces the same cutoff (see the registrations migration).
export const REGISTRATION_CLOSES_AT = "2026-10-14T00:00:00+08:00";
