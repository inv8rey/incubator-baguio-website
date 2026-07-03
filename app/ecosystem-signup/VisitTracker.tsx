"use client";

import { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

// Logs one row per page load so the admin Signups tab can show how many
// people opened the link vs. how many actually submitted. Renders nothing.
export default function VisitTracker() {
  useEffect(() => {
    if (!supabase) return;
    // supabase-js query builders are lazy thenables — the request only
    // fires once something awaits/consumes them, so this can't be a bare
    // fire-and-forget statement.
    supabase.from("ecosystem_signup_visits").insert({}).then(() => {});
  }, []);

  return null;
}
