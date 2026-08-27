import { supabase } from "../../lib/supabaseClient";

export type SavedItemType = "challenge" | "opportunity" | "event";

export interface SavedItemRow {
  id: string;
  item_type: SavedItemType;
  ref_id: string;
  title: string;
  subtitle: string;
  href: string;
  created_at: string;
}

// Denormalized snapshot at save time (title/subtitle/href), not a join back
// to the source table -- see the saved_items schema comment. Returns the new
// saved state so callers can update local UI optimistically.
export async function toggleSavedItem(
  userId: string,
  type: SavedItemType,
  refId: string,
  title: string,
  subtitle: string,
  href: string
): Promise<boolean> {
  if (!supabase) return false;
  const { data: existing } = await supabase
    .from("saved_items")
    .select("id")
    .eq("user_id", userId)
    .eq("item_type", type)
    .eq("ref_id", refId)
    .maybeSingle();
  if (existing) {
    await supabase.from("saved_items").delete().eq("id", existing.id);
    return false;
  }
  await supabase.from("saved_items").insert({ user_id: userId, item_type: type, ref_id: refId, title, subtitle, href });
  return true;
}

export async function fetchSavedItems(userId: string, type?: SavedItemType): Promise<SavedItemRow[]> {
  if (!supabase) return [];
  let q = supabase.from("saved_items").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (type) q = q.eq("item_type", type);
  const { data } = await q;
  return (data as SavedItemRow[]) ?? [];
}
