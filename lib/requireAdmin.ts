import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseAsCaller(token: string): SupabaseClient {
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export interface AdminCheck {
  authorized: boolean;
  supabase: SupabaseClient | null;
}

// Verifies the request carries a valid Supabase session for a user whose
// profile has is_admin = true, so admin-only server routes can't be
// triggered by an anonymous visitor hitting the endpoint directly. Returns
// a supabase client scoped to the caller's own token (RLS still applies)
// for the route to reuse rather than re-deriving the token itself.
export async function requireAdmin(req: Request): Promise<AdminCheck> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { authorized: false, supabase: null };
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { authorized: false, supabase: null };

  const supabase = supabaseAsCaller(token);
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) return { authorized: false, supabase: null };

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", userData.user.id).single();
  return { authorized: !!profile?.is_admin, supabase };
}
