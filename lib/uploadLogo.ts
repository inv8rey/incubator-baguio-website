import { supabase } from "./supabaseClient";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB

/**
 * Uploads an image to a public storage bucket and returns its public URL.
 * Throws with a user-facing message on validation/upload failure.
 */
async function uploadImage(file: File, bucket: string): Promise<string> {
  if (!supabase) throw new Error("The backend isn't configured yet.");
  if (!file.type.startsWith("image/")) throw new Error("Image must be a photo file.");
  if (file.size > MAX_BYTES) throw new Error("Image must be under 2MB.");

  const ext = file.name.split(".").pop() || "png";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function uploadStartupLogo(file: File): Promise<string> {
  return uploadImage(file, "startup-logos");
}

export function uploadMentorPhoto(file: File): Promise<string> {
  return uploadImage(file, "mentor-photos");
}

export function uploadOrgLogo(file: File): Promise<string> {
  return uploadImage(file, "org-logos");
}

export function uploadPartnerLogo(file: File): Promise<string> {
  return uploadImage(file, "partner-logos");
}

export function uploadOrgCoverImage(file: File): Promise<string> {
  return uploadImage(file, "org-covers");
}

export function uploadEcosystemSignupLogo(file: File): Promise<string> {
  return uploadImage(file, "ecosystem-signup-logos");
}
