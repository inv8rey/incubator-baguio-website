// Deterministic color + initials for entities that don't have a logo,
// shared by the ecosystem directory and the admin dashboard so the same
// name always renders the same way everywhere.

export const PALETTE = [
  { color: "#F26522", bg: "rgba(242,101,34,0.14)" },
  { color: "#3F9E4D", bg: "rgba(126,217,87,0.16)" },
  { color: "#285E7A", bg: "rgba(40,94,122,0.14)" },
  { color: "#9E2A52", bg: "rgba(158,42,82,0.12)" },
  { color: "#D88A0A", bg: "rgba(245,166,35,0.16)" },
  { color: "#E23A2E", bg: "rgba(226,58,46,0.12)" },
  { color: "#7C5CD6", bg: "rgba(124,92,214,0.14)" },
  { color: "#1A6B3C", bg: "rgba(26,107,60,0.12)" },
  { color: "#0055A5", bg: "rgba(0,85,165,0.12)" },
];

function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

export function paletteFor(name: string) {
  return PALETTE[hashName(name) % PALETTE.length];
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

const ACRONYM_STOPWORDS = new Set(["of", "and", "the", "for", "in", "on", "a", "an", "&"]);

// Turns a long org name into a short badge label, e.g. "Department of
// Information and Communications Technology - Cordillera Administrative
// Region" -> "DICT-CAR". Used as the badge fallback when no explicit
// type/host label has been set for an org.
export function acronymOf(name: string): string {
  const withoutParens = name.replace(/\([^)]*\)/g, " ");
  const segments = withoutParens.split(/\s*[-–—]\s*/).filter((s) => s.trim());
  const abbreviate = (segment: string) => {
    const words = segment.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].toUpperCase().slice(0, 8);
    // Words that are already an acronym (e.g. "CAR") are kept whole rather
    // than reduced to a single letter, so "Cordillera Administrative
    // Region" -> "CAR" but so does the literal segment "CAR".
    const existingAcronyms = words.filter((w) => /^[A-Z]{3,}$/.test(w));
    if (existingAcronyms.length) return existingAcronyms.join("");
    const letters = words
      .filter((w) => !ACRONYM_STOPWORDS.has(w.toLowerCase()))
      .map((w) => w[0])
      .join("");
    return (letters || words.map((w) => w[0]).join("")).toUpperCase();
  };
  return segments.map(abbreviate).filter(Boolean).join("-") || "?";
}

export function truncate(text: string, n: number) {
  const t = (text || "").trim();
  return t.length > n ? `${t.slice(0, n).trim()}…` : t;
}
