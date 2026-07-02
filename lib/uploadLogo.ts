import { supabase } from "./supabaseClient";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB

/**
 * Uploads an image to the public `startup-logos` bucket and returns its
 * public URL. Throws with a user-facing message on validation/upload failure.
 */
export async function uploadStartupLogo(file: File): Promise<string> {
  if (!supabase) throw new Error("The backend isn't configured yet.");
  if (!file.type.startsWith("image/")) throw new Error("Logo must be an image file.");
  if (file.size > MAX_BYTES) throw new Error("Logo must be under 2MB.");

  const ext = file.name.split(".").pop() || "png";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("startup-logos").upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("startup-logos").getPublicUrl(path);
  return data.publicUrl;
}
