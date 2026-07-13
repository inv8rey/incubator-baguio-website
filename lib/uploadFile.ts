import { supabase } from "./supabaseClient";

const MAX_BYTES = 15 * 1024 * 1024; // 15MB

/**
 * Uploads a document to a public storage bucket and returns its public URL.
 * Throws with a user-facing message on validation/upload failure.
 */
async function uploadDocument(file: File, bucket: string): Promise<string> {
  if (!supabase) throw new Error("The backend isn't configured yet.");
  if (file.size > MAX_BYTES) throw new Error("File must be under 15MB.");

  const ext = file.name.split(".").pop() || "pdf";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function uploadKnowledgeResourceFile(file: File): Promise<string> {
  return uploadDocument(file, "knowledge-files");
}
