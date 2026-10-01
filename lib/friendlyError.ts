/**
 * Turns a Supabase/Postgres error into a message that is safe to show a
 * visitor. Raw database errors name tables, policies, and constraints
 * ("new row violates row-level security policy for table …"), which helps an
 * attacker map the database and means nothing to a real user.
 *
 * Messages our own SQL functions raise on purpose (RAISE EXCEPTION, code
 * P0001, e.g. "This team is full.") are already written for people, so they
 * pass through unchanged. The technical detail always goes to the console.
 *
 * Returns "" for a missing error, so `friendlyError(err) || "fallback"` works.
 */
export function friendlyError(err: unknown): string {
  if (!err) return "";
  const e = err as { code?: string; message?: string; name?: string; status?: number; details?: unknown };
  if (typeof console !== "undefined") console.error(err);
  // Supabase Auth messages ("Invalid login credentials", "Password should be
  // at least 6 characters") are written for users.
  if (typeof e.name === "string" && e.name.startsWith("Auth")) return e.message || "Something went wrong. Please try again.";
  // A plain Error our own code threw on purpose ("Image must be under 2MB.").
  if (err instanceof Error && e.code === undefined && e.status === undefined && e.details === undefined && e.name === "Error") return e.message || "Something went wrong. Please try again.";
  switch (e.code) {
    case "P0001":
      return e.message || "Something went wrong. Please try again.";
    case "23505":
      return "That already exists.";
    case "23502":
      return "Please fill in all required fields.";
    case "23514":
    case "22001":
    case "22P02":
      return "Some details are invalid or too long. Please check and try again.";
    case "42501":
    case "PGRST301":
      return "You don't have permission to do that. Try logging in again.";
    case "PGRST116":
      return "That item could not be found.";
  }
  if (/fetch|network/i.test(e.message || "")) return "We couldn't reach the server. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}

/** Maps a Supabase Storage upload error to a message for the person uploading. */
export function storageErrorMessage(message: string | undefined): string {
  const m = message || "";
  if (/mime type|not supported|invalid_mime/i.test(m)) return "That file type isn't supported. Use a PNG, JPG, WebP, or GIF image (or a PDF for documents).";
  if (/maximum allowed size|too large|payload/i.test(m)) return "That file is too large.";
  if (/row-level security|unauthorized|not allowed|permission/i.test(m)) return "You don't have permission to upload here. Try logging in again.";
  if (typeof console !== "undefined") console.error("Upload failed:", m);
  return "The upload failed. Please try again.";
}
