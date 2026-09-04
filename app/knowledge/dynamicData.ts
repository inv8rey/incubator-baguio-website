import { supabase } from "../../lib/supabaseClient";
import type { KnowledgeCategory, KnowledgeResource } from "./data";

// Retries on a transient error (a flaky mobile connection dropping a request
// mid-flight is the common case) instead of silently resolving with `[]` --
// the caller has no way to tell "genuinely zero resources" apart from "the
// request failed," and previously it always rendered the former, showing an
// empty "no resources yet" state on what was really just a network hiccup.
export async function fetchDynamicKnowledgeResources(): Promise<KnowledgeResource[]> {
  if (!supabase) return [];
  let data: any[] | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await supabase.from("knowledge_resources").select("*").order("created_at", { ascending: false });
    if (!res.error) {
      data = res.data;
      break;
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  return (data ?? []).map((r: any) => ({
    id: r.id,
    title: r.title,
    category: r.category as KnowledgeCategory,
    description: r.description,
    fileUrl: r.file_url || undefined,
    linkUrl: r.link_url || undefined,
    source: r.source || undefined,
    featured: !!r.featured,
    coverImageUrl: r.cover_image_url || undefined,
    fundingAmount: r.funding_amount || undefined,
    targetParticipants: r.target_participants || undefined,
    deadlineDate: r.deadline_date || null,
  }));
}
