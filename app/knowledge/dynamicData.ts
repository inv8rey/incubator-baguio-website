import { supabase } from "../../lib/supabaseClient";
import type { KnowledgeCategory, KnowledgeResource } from "./data";

export async function fetchDynamicKnowledgeResources(): Promise<KnowledgeResource[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("knowledge_resources").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((r: any) => ({
    id: r.id,
    title: r.title,
    category: r.category as KnowledgeCategory,
    description: r.description,
    fileUrl: r.file_url || undefined,
    linkUrl: r.link_url || undefined,
    source: r.source || undefined,
  }));
}
