import { supabase } from "../../lib/supabaseClient";
import type { Profile } from "../AuthProvider";

export interface ForumThread {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoUrl: string;
  title: string;
  body: string;
  createdAt: string;
  replyCount: number;
}

export interface ForumReply {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorPhotoUrl: string;
  body: string;
  createdAt: string;
}

// Retries on a transient error (a flaky connection dropping a request
// mid-flight) instead of a bare query resolving to `data: null` on failure --
// indistinguishable from "genuinely nothing here" otherwise. Same fix as
// challenges/knowledge-hub fetching got after they were found silently
// appearing empty on mobile.
async function retrying<T>(run: () => PromiseLike<{ data: T | null; error: unknown }>): Promise<T | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await run();
    if (!error) return data;
    if (attempt < 2) await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  return null;
}

/** "What people call you" if set, else full name -- the same display-name
 *  precedence the rest of the dashboard already uses for a member's own
 *  profile-facing name. */
export function displayNameOf(profile: Profile | null): string {
  if (!profile) return "Member";
  return profile.preferred_name?.trim() || profile.full_name?.trim() || "Member";
}

function mapThread(r: any, replyCount: number): ForumThread {
  return {
    id: r.id,
    authorId: r.author_id,
    authorName: r.author_name || "Member",
    authorPhotoUrl: r.author_photo_url || "",
    title: r.title,
    body: r.body,
    createdAt: r.created_at,
    replyCount,
  };
}

function mapReply(r: any): ForumReply {
  return {
    id: r.id,
    threadId: r.thread_id,
    authorId: r.author_id,
    authorName: r.author_name || "Member",
    authorPhotoUrl: r.author_photo_url || "",
    body: r.body,
    createdAt: r.created_at,
  };
}

// Not a per-thread count query (no N+1) -- fetches every reply's thread_id
// and tallies client-side. Fine at the scale a flat, uncategorized forum
// operates at; revisit with a DB-side count if the table grows large.
async function fetchReplyCounts(): Promise<Record<string, number>> {
  if (!supabase) return {};
  const rows = await retrying<any[]>(() => supabase!.from("forum_replies").select("thread_id"));
  const counts: Record<string, number> = {};
  (rows ?? []).forEach((r) => {
    counts[r.thread_id] = (counts[r.thread_id] ?? 0) + 1;
  });
  return counts;
}

export async function fetchThreads(): Promise<ForumThread[]> {
  if (!supabase) return [];
  const [rows, counts] = await Promise.all([
    retrying<any[]>(() => supabase!.from("forum_threads").select("*").order("created_at", { ascending: false })),
    fetchReplyCounts(),
  ]);
  return (rows ?? []).map((r) => mapThread(r, counts[r.id] ?? 0));
}

export async function fetchThreadById(id: string): Promise<ForumThread | null> {
  if (!supabase) return null;
  const [rows, counts] = await Promise.all([
    retrying<any[]>(() => supabase!.from("forum_threads").select("*").eq("id", id).limit(1)),
    fetchReplyCounts(),
  ]);
  const r = rows?.[0];
  return r ? mapThread(r, counts[r.id] ?? 0) : null;
}

export async function fetchReplies(threadId: string): Promise<ForumReply[]> {
  if (!supabase) return [];
  const rows = await retrying<any[]>(() =>
    supabase!.from("forum_replies").select("*").eq("thread_id", threadId).order("created_at", { ascending: true })
  );
  return (rows ?? []).map(mapReply);
}

export async function postThread(profile: Profile, title: string, body: string): Promise<{ id: string } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("forum_threads")
    .insert({
      author_id: profile.id,
      author_name: displayNameOf(profile),
      author_photo_url: profile.photo_url || "",
      title: title.trim(),
      body: body.trim(),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function postReply(profile: Profile, threadId: string, body: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("forum_replies").insert({
    thread_id: threadId,
    author_id: profile.id,
    author_name: displayNameOf(profile),
    author_photo_url: profile.photo_url || "",
    body: body.trim(),
  });
  if (error) throw error;
}

export async function reportContent(
  reporterId: string,
  targetType: "thread" | "reply",
  targetId: string,
  threadId: string,
  targetPreview: string,
  reason: string
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("forum_reports").insert({
    target_type: targetType,
    target_id: targetId,
    thread_id: threadId,
    target_preview: targetPreview.slice(0, 240),
    reporter_id: reporterId,
    reason: reason.trim(),
  });
  if (error) throw error;
}

export async function deleteThread(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("forum_threads").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteReply(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("forum_replies").delete().eq("id", id);
  if (error) throw error;
}
