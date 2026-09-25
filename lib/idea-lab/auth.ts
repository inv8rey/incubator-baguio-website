import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SALT = process.env.IDEA_LAB_SALT || 'idea-lab-dev-salt';

export interface IdeaLabUser {
  id: string;
  /** Salted hash of the account id: the key for daily limits, so no raw account id is stored. */
  key: string;
}

/**
 * Idea Lab needs a signed-in site account. The browser sends its Supabase
 * session token; this verifies it with Supabase and returns the user, or null.
 */
export async function requireUser(req: Request): Promise<IdeaLabUser | null> {
  if (!URL || !ANON) return null;
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const supabase = createClient(URL, ANON, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return { id: data.user.id, key: createHash('sha256').update(`${SALT}user:${data.user.id}`).digest('hex') };
}

export const LOGIN_REQUIRED = 'Please log in or sign up to use the Idea Lab.';
