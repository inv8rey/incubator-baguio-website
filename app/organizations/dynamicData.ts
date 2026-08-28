import { supabase } from "../../lib/supabaseClient";

export interface OrganizationProfile {
  id: string;
  slug: string;
  name: string;
  org_type: string;
  type: string;
  short_description: string;
  description: string;
  logo_url: string;
  cover_url: string;
  website: string;
  contact_email: string;
  phone: string;
  facebook_url: string;
  social_url: string;
  address: string;
  city: string;
  province: string;
  region: string;
  country: string;
  sectors: string[];
  expertise: string[];
  can_offer: string[];
  looking_for: string[];
  approval_status: string;
  contact_public: boolean;
  latitude: number | null;
  longitude: number | null;
}

// Public profile at /organizations/[slug] (PRD §11) -- only ever returns an
// organization that's both approved AND currently public. An org that's
// pending, rejected, suspended, or hidden by an admin must 404 here exactly
// like it's absent from the Ecosystem directory.
export async function fetchOrganizationBySlug(slug: string): Promise<OrganizationProfile | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("approval_status", "approved")
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    org_type: data.org_type,
    type: data.type || "",
    short_description: data.short_description || "",
    description: data.description || "",
    logo_url: data.logo_url || "",
    cover_url: data.cover_url || "",
    website: data.website || "",
    contact_email: data.contact_email || "",
    phone: data.phone || "",
    facebook_url: data.facebook_url || "",
    social_url: data.social_url || "",
    address: data.address || "",
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    city: data.city || "",
    province: data.province || "",
    region: data.region || "",
    country: data.country || "Philippines",
    sectors: data.sectors ?? [],
    expertise: data.expertise ?? [],
    can_offer: data.can_offer ?? [],
    looking_for: data.looking_for ?? [],
    approval_status: data.approval_status || "approved",
    contact_public: !!data.contact_public,
  };
}
