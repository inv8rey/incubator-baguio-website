"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";
import { uploadOrgLogo, uploadOrgCoverImage } from "../../../lib/uploadLogo";
import { slugify } from "../../../lib/slug";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, DARK, ORANGE } from "../styles";
import { ORG_TYPES_WITH_ACADEME, ORG_SECTORS, ORG_EXPERTISE_SUGGESTIONS, ORG_CAN_OFFER_SUGGESTIONS, ORG_LOOKING_FOR_SUGGESTIONS, PHILIPPINE_REGIONS } from "../../../lib/organizationOptions";
import TagChips from "../TagChips";

const LocationPicker = dynamic(() => import("../../LocationPicker"), { ssr: false });

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface Organization {
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
  latitude: number | null;
  longitude: number | null;
  city: string;
  province: string;
  region: string;
  country: string;
  sectors: string[];
  expertise: string[];
  can_offer: string[];
  looking_for: string[];
  approval_status: "pending" | "approved" | "rejected" | "suspended";
  is_public: boolean;
  pending_name: string | null;
  contact_public: boolean;
  updated_at: string;
}

const EMPTY_CREATE = { name: "", org_type: ORG_TYPES_WITH_ACADEME[0] as string, type: "", short_description: "", website: "", logo_url: "", cover_url: "" };

function emptyEditForm(o: Organization) {
  return {
    logo_url: o.logo_url,
    cover_url: o.cover_url,
    type: o.type,
    short_description: o.short_description,
    description: o.description,
    website: o.website,
    contact_email: o.contact_email,
    phone: o.phone,
    facebook_url: o.facebook_url,
    social_url: o.social_url,
    address: o.address,
    latitude: o.latitude ?? null,
    longitude: o.longitude ?? null,
    city: o.city,
    province: o.province,
    region: o.region,
    country: o.country || "Philippines",
    sectors: o.sectors ?? [],
    expertise: o.expertise ?? [],
    can_offer: o.can_offer ?? [],
    looking_for: o.looking_for ?? [],
    contact_public: o.contact_public,
    nameChangeInput: "",
  };
}
type EditForm = ReturnType<typeof emptyEditForm>;

function mapRow(r: any): Organization {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    org_type: r.org_type,
    type: r.type || "",
    short_description: r.short_description || "",
    description: r.description || "",
    logo_url: r.logo_url || "",
    cover_url: r.cover_url || "",
    website: r.website || "",
    contact_email: r.contact_email || "",
    phone: r.phone || "",
    facebook_url: r.facebook_url || "",
    social_url: r.social_url || "",
    address: r.address || "",
    latitude: r.latitude ?? null,
    longitude: r.longitude ?? null,
    city: r.city || "",
    province: r.province || "",
    region: r.region || "",
    country: r.country || "Philippines",
    sectors: r.sectors ?? [],
    expertise: r.expertise ?? [],
    can_offer: r.can_offer ?? [],
    looking_for: r.looking_for ?? [],
    approval_status: r.approval_status || "approved",
    is_public: r.is_public !== false,
    pending_name: r.pending_name || null,
    contact_public: !!r.contact_public,
    updated_at: r.updated_at,
  };
}

function completeness(o: Organization) {
  const checks = [
    { label: "Basic Information", done: !!(o.name && o.short_description) },
    { label: "Contact Information", done: !!(o.contact_email || o.phone || o.website) },
    { label: "Location", done: !!(o.address || o.city) },
    { label: "Areas of Focus", done: o.sectors.length > 0 },
    { label: "What We Do", done: !!(o.description.trim() || o.expertise.length > 0) },
  ];
  const pct = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);
  return { checks, pct };
}

const STATUS_BANNER: Record<Organization["approval_status"], { bg: string; color: string; text: (o: Organization) => string }> = {
  pending: { bg: "rgba(245,166,35,0.12)", color: "#D88A0A", text: () => "Pending Incubator Baguio review. Your profile isn't public yet, but you can keep filling it in." },
  approved: { bg: "rgba(26,107,60,0.10)", color: "#1A6B3C", text: (o) => (o.is_public ? "Approved and public in the Ecosystem directory." : "Approved, but currently hidden from the public directory by Incubator Baguio.") },
  rejected: { bg: "rgba(226,58,46,0.10)", color: "#E23A2E", text: () => "This organization wasn't approved. Contact Incubator Baguio if you believe this is a mistake." },
  suspended: { bg: "rgba(226,58,46,0.10)", color: "#E23A2E", text: () => "This organization has been suspended and is not visible publicly." },
};

type ViewState = "list" | "create" | "view" | "edit";

export default function OrganizationManager() {
  const { user } = useAuth();
  // "Add a Lab" / "Add a Coworking Space" quick actions on the org dashboard
  // deep-link here with ?newOrgType=<org type> so registering one is a single
  // click instead of an extra "+ Register another organization" step.
  const searchParams = useSearchParams();
  const newOrgType = searchParams.get("newOrgType");
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<ViewState>("create");

  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [duplicateWarning, setDuplicateWarning] = useState("");
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const org = orgs.find((o) => o.id === selectedOrgId) ?? null;

  // `initial` only runs on first load (or when the signed-in user changes) --
  // it's what decides the starting screen. Reloading after an edit/create
  // must NOT re-run this, or it would yank the user back to the list/create
  // screen instead of showing the org they just touched.
  function applyNewOrgTypeOverride(): boolean {
    if (!newOrgType || !ORG_TYPES_WITH_ACADEME.includes(newOrgType as any)) return false;
    setCreateForm((f) => ({ ...f, org_type: newOrgType }));
    setSelectedOrgId(null);
    setMode("create");
    return true;
  }

  async function load(opts?: { initial?: boolean }) {
    if (!supabase || !user) {
      setOrgs([]);
      setLoaded(true);
      if (opts?.initial && !applyNewOrgTypeOverride()) {
        setSelectedOrgId(null);
        setMode("create");
      }
      return;
    }
    const [{ data: memberships }, { data: ownedDirect }] = await Promise.all([
      supabase.from("organization_members").select("organization_id").eq("user_id", user.id).eq("status", "active"),
      supabase.from("organizations").select("id").eq("owner_id", user.id),
    ]);
    const ids = Array.from(new Set([...(memberships ?? []).map((m: any) => m.organization_id), ...(ownedDirect ?? []).map((o: any) => o.id)]));
    if (ids.length === 0) {
      setOrgs([]);
      setLoaded(true);
      if (opts?.initial && !applyNewOrgTypeOverride()) {
        setSelectedOrgId(null);
        setMode("create");
      }
      return;
    }
    const { data } = await supabase.from("organizations").select("*").in("id", ids).order("created_at", { ascending: true });
    const mapped = (data ?? []).map(mapRow);
    setOrgs(mapped);
    setLoaded(true);
    if (opts?.initial && !applyNewOrgTypeOverride()) {
      if (mapped.length === 1) {
        setSelectedOrgId(mapped[0].id);
        setMode("view");
      } else {
        setSelectedOrgId(null);
        setMode("list");
      }
    }
  }

  useEffect(() => {
    load({ initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function openOrg(id: string) {
    setSelectedOrgId(id);
    setMode("view");
    setSaved(false);
  }

  function openCreateAnother() {
    setCreateForm(EMPTY_CREATE);
    setDuplicateWarning("");
    setError("");
    setMode("create");
  }

  function cancelCreate() {
    setCreateForm(EMPTY_CREATE);
    setDuplicateWarning("");
    setError("");
    if (orgs.length === 1) {
      setSelectedOrgId(orgs[0].id);
      setMode("view");
    } else if (orgs.length > 1) {
      setMode("list");
    }
    // orgs.length === 0: nothing to cancel back to, stay on the create form.
  }

  async function checkDuplicate(name: string) {
    if (!supabase || !name.trim()) return;
    const { data } = await supabase.from("organizations").select("name").ilike("name", `%${name.trim()}%`).limit(1);
    setDuplicateWarning(data && data.length > 0 ? `An organization with a similar name already exists: "${data[0].name}". You can still submit — Incubator Baguio will review it.` : "");
  }

  async function handleCreateLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadOrgLogo(file);
      setCreateForm((f) => ({ ...f, logo_url: url }));
    } catch (err: any) {
      setError(err.message || "Logo upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleCreateCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError("");
    try {
      const url = await uploadOrgCoverImage(file);
      setCreateForm((f) => ({ ...f, cover_url: url }));
    } catch (err: any) {
      setError(err.message || "Cover image upload failed.");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !user) return;
    if (!createForm.name.trim()) return setError("Add an organization name.");
    setError("");
    setBusy(true);

    const { data: dupCheck } = await supabase.from("organizations").select("id").ilike("name", `%${createForm.name.trim()}%`).limit(1);
    const flaggedDuplicate = !!(dupCheck && dupCheck.length > 0);
    const slug = `${slugify(createForm.name.trim())}-${Math.random().toString(36).slice(2, 8)}`;

    const { data: inserted, error: err } = await supabase
      .from("organizations")
      .insert({
        name: createForm.name.trim(),
        org_type: createForm.org_type,
        type: createForm.type.trim(),
        short_description: createForm.short_description.trim(),
        website: createForm.website.trim(),
        logo_url: createForm.logo_url,
        cover_url: createForm.cover_url,
        slug,
        owner_id: user.id,
        contact_email: user.email || "",
        approval_status: "pending",
        is_public: false,
        flagged_duplicate: flaggedDuplicate,
      })
      .select("*")
      .single();

    if (err || !inserted) {
      setBusy(false);
      setError(err?.message || "Couldn't create the organization.");
      return;
    }

    const { error: memberErr } = await supabase.from("organization_members").insert({ organization_id: inserted.id, user_id: user.id, role: "owner", status: "active" });
    setBusy(false);
    if (memberErr) {
      // The org row exists either way; this just means the membership link
      // didn't get created and would need a manual admin fix.
      setError(`Organization created, but couldn't link your account: ${memberErr.message}`);
    }
    const newOrg = mapRow(inserted);
    setOrgs((prev) => [...prev, newOrg]);
    setSelectedOrgId(newOrg.id);
    setMode("view");
    setCreateForm(EMPTY_CREATE);
  }

  function openEdit() {
    if (!org) return;
    setEditForm(emptyEditForm(org));
    setError("");
    setSaved(false);
    setMode("edit");
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editForm) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadOrgLogo(file);
      setEditForm((f) => (f ? { ...f, logo_url: url } : f));
    } catch (err: any) {
      setError(err.message || "Logo upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editForm) return;
    setUploadingCover(true);
    setError("");
    try {
      const url = await uploadOrgCoverImage(file);
      setEditForm((f) => (f ? { ...f, cover_url: url } : f));
    } catch (err: any) {
      setError(err.message || "Cover image upload failed.");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !org || !editForm) return;
    setError("");
    setBusy(true);

    const payload: Record<string, unknown> = {
      type: editForm.type.trim(),
      short_description: editForm.short_description.trim(),
      description: editForm.description.trim(),
      website: editForm.website.trim(),
      contact_email: editForm.contact_email.trim(),
      phone: editForm.phone.trim(),
      facebook_url: editForm.facebook_url.trim(),
      social_url: editForm.social_url.trim(),
      address: editForm.address.trim(),
      latitude: editForm.latitude,
      longitude: editForm.longitude,
      city: editForm.city.trim(),
      province: editForm.province.trim(),
      region: editForm.region.trim(),
      country: editForm.country.trim() || "Philippines",
      sectors: editForm.sectors,
      expertise: editForm.expertise,
      can_offer: editForm.can_offer,
      looking_for: editForm.looking_for,
      contact_public: editForm.contact_public,
      logo_url: editForm.logo_url,
      cover_url: editForm.cover_url,
    };

    // A requested name change is stored separately and only takes effect
    // once Incubator Baguio approves it (PRD §9, §19) -- it never touches
    // `name` directly, and the DB trigger would silently revert `name`
    // anyway if a non-admin tried.
    if (editForm.nameChangeInput.trim() && editForm.nameChangeInput.trim() !== org.name) {
      payload.pending_name = editForm.nameChangeInput.trim();
      payload.name_change_requested_at = new Date().toISOString();
    }

    const { error: err } = await supabase.from("organizations").update(payload).eq("id", org.id);
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    await load();
    setMode("view");
    setSaved(true);
  }

  if (!loaded) {
    return <div style={{ padding: "40px 0", textAlign: "center", color: "#8B8479", fontSize: 14 }}>Loading&hellip;</div>;
  }

  // ---- Registration form: first organization, or "+ Register another" ----
  if (mode === "create") {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: DARK }}>Register your organization</h2>
          {orgs.length > 0 && (
            <button type="button" onClick={cancelCreate} style={{ fontSize: 13, fontWeight: 600, color: "#5A544B", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
          )}
        </div>
        <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "#5A544B" }}>
          Reviewed by Incubator Baguio before it appears in the Ecosystem directory. Once approved, you can keep it up to date yourself &mdash; no need to ask staff to edit it for you.
        </p>
        <form onSubmit={submitCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Logo (optional)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {createForm.logo_url ? (
                <img src={createForm.logo_url} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover" }} />
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: 12, background: "#F6F2EA", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B8479", fontSize: 10.5, textAlign: "center" }}>No logo</div>
              )}
              <div>
                <label style={{ display: "inline-block", fontSize: 13, fontWeight: 600, color: ORANGE, cursor: "pointer" }}>
                  {uploading ? "Uploading…" : "Upload logo"}
                  <input type="file" accept="image/*" onChange={handleCreateLogoChange} disabled={uploading} style={{ display: "none" }} />
                </label>
                <div style={{ fontSize: 11.5, color: "#8B8479", marginTop: 2 }}>PNG or JPG, up to 2MB</div>
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Organization name</label>
            <input
              style={inputStyle}
              required
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              onBlur={(e) => checkDuplicate(e.target.value)}
              placeholder="e.g. Saint Louis University"
            />
            {duplicateWarning && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#D88A0A" }}>{duplicateWarning}</p>}
          </div>

          <div>
            <label style={labelStyle}>Organization type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ORG_TYPES_WITH_ACADEME.map((t) => {
                const active = createForm.org_type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCreateForm((f) => ({ ...f, org_type: t }))}
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      padding: "7px 14px",
                      borderRadius: 9999,
                      border: active ? `1.5px solid ${ORANGE}` : "1.5px solid rgba(64,50,34,0.14)",
                      color: active ? ORANGE : "#5A544B",
                      background: active ? "rgba(242,101,34,0.08)" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {createForm.org_type !== "TBIs" && (
            <div>
              <label style={labelStyle}>Type (short label shown on your card)</label>
              <input
                style={inputStyle}
                value={createForm.type}
                onChange={(e) => setCreateForm((f) => ({ ...f, type: e.target.value }))}
                placeholder={
                  createForm.org_type === "Coworking Spaces" ? "e.g. Coworking space" :
                  createForm.org_type === "Makerspaces & Labs" ? "e.g. Digital fabrication lab" :
                  createForm.org_type === "Academe" ? "e.g. University" :
                  "e.g. Government office"
                }
              />
            </div>
          )}

          {(createForm.org_type === "Coworking Spaces" || createForm.org_type === "Makerspaces & Labs") && (
            <div>
              <label style={labelStyle}>Cover photo (optional)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {createForm.cover_url ? (
                  <img src={createForm.cover_url} alt="" style={{ width: 84, height: 52, borderRadius: 10, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 84, height: 52, borderRadius: 10, background: "#F6F2EA", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B8479", fontSize: 10, textAlign: "center" }}>No cover</div>
                )}
                <div>
                  <label style={{ display: "inline-block", fontSize: 13, fontWeight: 600, color: ORANGE, cursor: "pointer" }}>
                    {uploadingCover ? "Uploading…" : "Upload cover photo"}
                    <input type="file" accept="image/*" onChange={handleCreateCoverChange} disabled={uploadingCover} style={{ display: "none" }} />
                  </label>
                  <div style={{ fontSize: 11.5, color: "#8B8479", marginTop: 2 }}>Shown as the banner on your Ecosystem directory card.</div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              value={createForm.short_description}
              onChange={(e) => setCreateForm((f) => ({ ...f, short_description: e.target.value }))}
              placeholder="What does this organization do?"
            />
          </div>

          <div>
            <label style={labelStyle}>Website (optional)</label>
            <input style={inputStyle} value={createForm.website} onChange={(e) => setCreateForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://" />
          </div>

          {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
          <div>
            <button type="submit" disabled={busy || uploading || uploadingCover} style={{ ...primaryButtonStyle, opacity: busy ? 0.7 : 1 }}>
              {busy ? "Submitting…" : "Submit for review"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---- Multiple organizations: pick which one to manage ----
  if (mode === "list" || !org) {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: DARK }}>Your Organizations</h2>
          <button onClick={openCreateAnother} style={{ ...primaryButtonStyle, padding: "10px 20px" }}>+ Register another organization</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orgs.map((o) => {
            const b = STATUS_BANNER[o.approval_status];
            const chipLabel = o.approval_status === "pending" ? "Pending review" : o.approval_status === "approved" ? (o.is_public ? "Live" : "Hidden") : o.approval_status === "rejected" ? "Rejected" : "Suspended";
            return (
              <button
                key={o.id}
                onClick={() => openOrg(o.id)}
                style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.11)", borderRadius: 14, padding: "14px 18px", cursor: "pointer" }}
              >
                {o.logo_url ? (
                  <img src={o.logo_url} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "#fff", border: "1px solid rgba(64,50,34,0.11)", flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: DARK }}>{o.name}</div>
                  <div style={{ fontSize: 12.5, color: "#8B8479", marginTop: 2 }}>{o.org_type}{o.type ? ` · ${o.type}` : ""}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: b.color, background: b.bg, padding: "5px 11px", borderRadius: 9999, flexShrink: 0, whiteSpace: "nowrap" }}>{chipLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const banner = STATUS_BANNER[org.approval_status];
  const { checks, pct } = completeness(org);

  // ---- Edit Profile ----
  if (mode === "edit" && editForm) {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: DARK }}>Edit Profile</h2>
          <button type="button" onClick={() => setMode("view")} style={{ fontSize: 13, fontWeight: 600, color: "#5A544B", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
        </div>
        <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "#5A544B" }}>Changes save immediately, except your organization&rsquo;s official name.</p>

        <form onSubmit={submitEdit} style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {/* Basic Information */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8B8479", marginBottom: 12 }}>Basic Information</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {editForm.logo_url ? (
                  <img src={editForm.logo_url} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: "#F6F2EA", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B8479", fontSize: 10.5, textAlign: "center" }}>No logo</div>
                )}
                <div>
                  <label style={{ display: "inline-block", fontSize: 13, fontWeight: 600, color: ORANGE, cursor: "pointer" }}>
                    {uploading ? "Uploading…" : "Upload logo"}
                    <input type="file" accept="image/*" onChange={handleLogoChange} disabled={uploading} style={{ display: "none" }} />
                  </label>
                  <div style={{ fontSize: 11.5, color: "#8B8479", marginTop: 2 }}>PNG or JPG, up to 2MB</div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Organization name</label>
                <input style={{ ...inputStyle, color: "#8B8479" }} value={org.name} disabled />
                {org.pending_name ? (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "#D88A0A" }}>Requested change to &ldquo;{org.pending_name}&rdquo; is pending Incubator Baguio approval.</p>
                ) : (
                  <div style={{ marginTop: 8 }}>
                    <input
                      style={inputStyle}
                      value={editForm.nameChangeInput}
                      onChange={(e) => setEditForm((f) => (f ? { ...f, nameChangeInput: e.target.value } : f))}
                      placeholder="Request a different official name"
                    />
                    <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#8B8479" }}>This change requires approval from Incubator Baguio.</p>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Organization type</label>
                <input style={{ ...inputStyle, color: "#8B8479" }} value={org.org_type} disabled />
                <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#8B8479" }}>Contact Incubator Baguio to change your organization type.</p>
              </div>

              <div>
                <label style={labelStyle}>Type (short label shown on your card)</label>
                <input style={inputStyle} value={editForm.type} onChange={(e) => setEditForm((f) => (f ? { ...f, type: e.target.value } : f))} placeholder="e.g. University / Higher Education" />
              </div>

              <div>
                <label style={labelStyle}>Short description</label>
                <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={editForm.short_description} onChange={(e) => setEditForm((f) => (f ? { ...f, short_description: e.target.value } : f))} placeholder="One or two sentences." />
              </div>

              <div>
                <label style={labelStyle}>About</label>
                <textarea style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} value={editForm.description} onChange={(e) => setEditForm((f) => (f ? { ...f, description: e.target.value } : f))} placeholder="Tell the ecosystem more about your organization." />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8B8479", marginBottom: 12 }}>Contact Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Official email</label>
                <input style={inputStyle} type="email" value={editForm.contact_email} onChange={(e) => setEditForm((f) => (f ? { ...f, contact_email: e.target.value } : f))} placeholder="you@example.com" />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} value={editForm.phone} onChange={(e) => setEditForm((f) => (f ? { ...f, phone: e.target.value } : f))} placeholder="09XX XXX XXXX" />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input style={inputStyle} value={editForm.website} onChange={(e) => setEditForm((f) => (f ? { ...f, website: e.target.value } : f))} placeholder="https://" />
              </div>
              <div>
                <label style={labelStyle}>Facebook</label>
                <input style={inputStyle} value={editForm.facebook_url} onChange={(e) => setEditForm((f) => (f ? { ...f, facebook_url: e.target.value } : f))} placeholder="https://facebook.com/…" />
              </div>
              <div>
                <label style={labelStyle}>Other social link</label>
                <input style={inputStyle} value={editForm.social_url} onChange={(e) => setEditForm((f) => (f ? { ...f, social_url: e.target.value } : f))} placeholder="https://" />
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, color: "#44444C", cursor: "pointer" }}>
              <input type="checkbox" checked={editForm.contact_public} onChange={(e) => setEditForm((f) => (f ? { ...f, contact_public: e.target.checked } : f))} />
              Show this contact information on the public profile
            </label>
            <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#8B8479" }}>Off by default. Your representative&rsquo;s personal details are never shown either way.</p>
          </div>

          {/* Location */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8B8479", marginBottom: 12 }}>Location</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} value={editForm.address} onChange={(e) => setEditForm((f) => (f ? { ...f, address: e.target.value } : f))} placeholder="Street, barangay" />
              </div>
              <div>
                <label style={labelStyle}>Pin your exact location</label>
                <p style={{ margin: "0 0 8px", fontSize: 12.5, color: "#8B8479" }}>
                  Search for your address or drag the marker. This is what places you on the ecosystem map.
                </p>
                <LocationPicker
                  value={
                    editForm.latitude != null && editForm.longitude != null
                      ? { lat: editForm.latitude, lng: editForm.longitude, address: editForm.address }
                      : null
                  }
                  onChange={(v) =>
                    setEditForm((f) =>
                      f ? { ...f, latitude: v?.lat ?? null, longitude: v?.lng ?? null, address: v?.address || f.address } : f
                    )
                  }
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} value={editForm.city} onChange={(e) => setEditForm((f) => (f ? { ...f, city: e.target.value } : f))} placeholder="Baguio City" />
                </div>
                <div>
                  <label style={labelStyle}>Province</label>
                  <input style={inputStyle} value={editForm.province} onChange={(e) => setEditForm((f) => (f ? { ...f, province: e.target.value } : f))} placeholder="Benguet" />
                </div>
                <div>
                  <label style={labelStyle}>Region</label>
                  <select style={{ ...inputStyle, appearance: "auto" }} value={editForm.region} onChange={(e) => setEditForm((f) => (f ? { ...f, region: e.target.value } : f))}>
                    <option value="">Select a region</option>
                    {PHILIPPINE_REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input style={inputStyle} value={editForm.country} onChange={(e) => setEditForm((f) => (f ? { ...f, country: e.target.value } : f))} />
                </div>
              </div>
            </div>
          </div>

          {/* Ecosystem Information */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8B8479", marginBottom: 12 }}>Ecosystem Information</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Sectors / Areas of Focus</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ORG_SECTORS.map((s) => {
                    const active = editForm.sectors.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setEditForm((f) => (f ? { ...f, sectors: active ? f.sectors.filter((x) => x !== s) : [...f.sectors, s] } : f))}
                        style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 999, border: active ? `1.5px solid ${ORANGE}` : "1.5px solid rgba(64,50,34,0.14)", color: active ? ORANGE : "#5A544B", background: active ? "rgba(242,101,34,0.08)" : "#fff", cursor: "pointer" }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Areas of Expertise</label>
                <TagChips value={editForm.expertise} onChange={(next) => setEditForm((f) => (f ? { ...f, expertise: next } : f))} suggestions={ORG_EXPERTISE_SUGGESTIONS} />
              </div>
            </div>
          </div>

          {/* Collaboration */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8B8479", marginBottom: 12 }}>Collaboration</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>We Can Offer</label>
                <TagChips value={editForm.can_offer} onChange={(next) => setEditForm((f) => (f ? { ...f, can_offer: next } : f))} suggestions={ORG_CAN_OFFER_SUGGESTIONS} />
              </div>
              <div>
                <label style={labelStyle}>We Are Looking For</label>
                <TagChips value={editForm.looking_for} onChange={(next) => setEditForm((f) => (f ? { ...f, looking_for: next } : f))} suggestions={ORG_LOOKING_FOR_SUGGESTIONS} />
              </div>
            </div>
          </div>

          {(org.org_type === "Coworking Spaces" || org.org_type === "Makerspaces & Labs") && (
            <div>
              <label style={labelStyle}>Cover photo</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {editForm.cover_url ? (
                  <img src={editForm.cover_url} alt="" style={{ width: 84, height: 52, borderRadius: 10, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 84, height: 52, borderRadius: 10, background: "#F6F2EA", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B8479", fontSize: 10, textAlign: "center" }}>No cover</div>
                )}
                <label style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE, cursor: "pointer" }}>
                  {uploadingCover ? "Uploading…" : "Upload cover photo"}
                  <input type="file" accept="image/*" onChange={handleCoverChange} disabled={uploadingCover} style={{ display: "none" }} />
                </label>
              </div>
            </div>
          )}

          {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" disabled={busy || uploading || uploadingCover} style={{ ...primaryButtonStyle, opacity: busy ? 0.7 : 1 }}>
              {busy ? "Saving…" : "Save Changes"}
            </button>
            <button type="button" onClick={() => setMode("view")} style={{ fontSize: 14, fontWeight: 600, color: "#5A544B", background: "none", border: "1.5px solid rgba(64,50,34,0.14)", borderRadius: 9999, padding: "12px 24px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---- My Organization (view) ----
  return (
    <div style={cardStyle}>
      {orgs.length > 1 && (
        <button
          type="button"
          onClick={() => { setSelectedOrgId(null); setMode("list"); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#5A544B", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 16 }}
        >
          &larr; Back to your organizations
        </button>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {org.logo_url ? (
            <img src={org.logo_url} alt="" style={{ width: 56, height: 56, borderRadius: 14, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#F6F2EA", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B8479", fontSize: 11, textAlign: "center" }}>No logo</div>
          )}
          <div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 600, color: DARK }}>{org.name}</h2>
            <div style={{ fontSize: 13, color: "#8B8479", marginTop: 2 }}>{org.org_type}{org.type ? ` · ${org.type}` : ""}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {org.is_public && (
            <a href={`${BP}/organizations/${org.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13.5, fontWeight: 600, color: DARK, textDecoration: "none", border: "1.5px solid rgba(64,50,34,0.14)", borderRadius: 9999, padding: "10px 18px" }}>
              View Public Profile
            </a>
          )}
          <button onClick={openEdit} style={{ ...primaryButtonStyle, padding: "10px 20px" }}>Edit Profile</button>
        </div>
      </div>

      {saved && <p style={{ margin: "0 0 14px", fontSize: 13, color: "#1A6B3C", fontWeight: 600 }}>Profile updated successfully.</p>}

      <div style={{ background: banner.bg, color: banner.color, fontSize: 13, fontWeight: 600, borderRadius: 12, padding: "12px 16px", marginBottom: 22 }}>
        {banner.text(org)}
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>Complete your profile</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: ORANGE }}>{pct}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "#F6F2EA", overflow: "hidden", marginBottom: 14 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: ORANGE, borderRadius: 999, transition: "width .3s ease" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {checks.map((c, i) => (
            <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: c.done ? DARK : "#8B8479" }}>
              <span style={{ width: 18, height: 18, borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: c.done ? "rgba(26,107,60,0.12)" : "#F6F2EA", color: c.done ? "#1A6B3C" : "#C4BEB4", fontSize: 11, flexShrink: 0 }}>
                {c.done ? "✓" : "○"}
              </span>
              <span style={{ fontWeight: 600 }}>Step {i + 1}</span> &mdash; {c.label}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={openCreateAnother}
        style={{ marginTop: 22, fontSize: 13, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        + Register another organization
      </button>
    </div>
  );
}
