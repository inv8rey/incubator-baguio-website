// Shared constants for the Co-Founder Finder, kept in a plain (non "use
// client") module so the public Ecosystem directory can import just the
// values it needs (e.g. ROLE_OPTIONS for its filter dropdown) without
// pulling CofounderFinder.tsx's whole dashboard component tree into the
// public page's client bundle.

// Must match the `role_needed` check constraint in supabase/schema.sql --
// a value here that isn't in that constraint would let a filter select an
// option no listing can ever have.
export const ROLE_OPTIONS = ["Any", "Technical", "Business/Marketing", "Design"] as const;
