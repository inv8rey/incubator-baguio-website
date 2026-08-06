"use client";

import { useEffect, useState } from "react";
import { DARK, ORANGE, SECTOR_FILTERS } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { initialsOf, paletteFor } from "../../../lib/visualIdentity";
import { uploadMentorPhoto, uploadOrgLogo, uploadOrgCoverImage, uploadPartnerLogo } from "../../../lib/uploadLogo";
import { triggerSheetSync, type SyncableTable } from "../../../lib/syncSheetClient";
import { MENTOR_SPECIALIZATIONS } from "../../ecosystem/data";

// Only these 3 organization categories mirror to a Google Sheet today (the
// other org_type values -- TBIs, Companies, Government, Community -- and
// Ecosystem Partners were never asked for).
const ORG_SHEET_TABLE: Partial<Record<OrgType, SyncableTable>> = {
  "Service Providers": "service-providers",
  "Coworking Spaces": "coworking-spaces",
  "Makerspaces & Labs": "makerspaces-labs",
};

const ORG_TYPES = ["TBIs", "Companies", "Service Providers", "Government", "Community", "Coworking Spaces", "Makerspaces & Labs"] as const;
type OrgType = (typeof ORG_TYPES)[number];
const CATEGORIES = ["Mentors", ...ORG_TYPES, "Ecosystem Partners", "Funded Projects"] as const;
type Category = (typeof CATEGORIES)[number];
const PROJECT_STATUSES = ["Ongoing", "Completed", "Upcoming"] as const;

const NAME_MAX = 60;
const BIO_MAX = 280;
const POSITION_MAX = 60;
const COMPANY_MAX = 60;
const MAX_SPECIALIZATIONS = 3;

// Category label, singularized for "Add ___" / "Edit ___" copy. Plain
// s-stripping mishandles "Companies", so special-case it.
function singularCategory(category: string): string {
  if (category === "Companies") return "Company";
  return category.replace(/s$/, "");
}

interface MentorRow {
  id: string;
  name: string;
  position: string;
  company: string;
  bio: string;
  specializations: string[];
  photoUrl: string;
  sector: string;
  socialLink: string;
  initials: string;
  color: string;
}

interface OrgRow {
  id: string;
  name: string;
  org_type: OrgType;
  description: string;
  website: string;
  contact_email: string;
  logoUrl: string;
  coverUrl: string;
  type: string;
  initials: string;
  color: string;
}

interface PartnerRow {
  id: string;
  name: string;
  logoUrl: string;
}

interface FundedProjectRow {
  id: string;
  title: string;
  fundingAgency: string;
  leadInstitution: string;
  duration: string;
  status: string;
}

const TYPE_MAX = 40;
const EMPTY_MENTOR = { name: "", position: "", company: "", bio: "", specializations: [] as string[], photoUrl: "", sector: SECTOR_FILTERS[0].label, socialLink: "" };
const EMPTY_ORG = { name: "", description: "", website: "", contact_email: "", logoUrl: "", coverUrl: "", type: "" };
const EMPTY_PARTNER = { name: "", logoUrl: "" };
const EMPTY_FUNDED_PROJECT = { title: "", fundingAgency: "", leadInstitution: "", duration: "", status: PROJECT_STATUSES[0] as string };

export default function PartnersTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [category, setCategory] = useState<Category>("Mentors");
  const [mentors, setMentors] = useState<MentorRow[]>([]);
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [fundedProjects, setFundedProjects] = useState<FundedProjectRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mentorForm, setMentorForm] = useState(EMPTY_MENTOR);
  const [orgForm, setOrgForm] = useState(EMPTY_ORG);
  const [partnerForm, setPartnerForm] = useState(EMPTY_PARTNER);
  const [fundedProjectForm, setFundedProjectForm] = useState(EMPTY_FUNDED_PROJECT);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const [{ data: mentorData }, { data: orgData }, { data: partnerData }, { data: projectData }] = await Promise.all([
      supabase.from("mentors").select("*").order("created_at", { ascending: false }),
      supabase.from("organizations").select("*").order("created_at", { ascending: false }),
      supabase.from("ecosystem_partners").select("*").order("created_at", { ascending: false }),
      supabase.from("funded_projects").select("*").order("created_at", { ascending: false }),
    ]);
    setMentors(
      (mentorData ?? []).map((m: any) => {
        const p = paletteFor(m.name);
        return { id: m.id, name: m.name, position: m.position, company: m.company, bio: m.bio, specializations: m.specializations ?? [], photoUrl: m.photo_url, sector: m.sector || "", socialLink: m.social_link || "", initials: initialsOf(m.name), color: p.color };
      })
    );
    setOrgs(
      (orgData ?? []).map((o: any) => {
        const p = paletteFor(o.name);
        return { id: o.id, name: o.name, org_type: o.org_type, description: o.description, website: o.website, contact_email: o.contact_email, logoUrl: o.logo_url, coverUrl: o.cover_url, type: o.type, initials: initialsOf(o.name), color: p.color };
      })
    );
    setPartners((partnerData ?? []).map((p: any) => ({ id: p.id, name: p.name, logoUrl: p.logo_url })));
    setFundedProjects(
      (projectData ?? []).map((f: any) => ({ id: f.id, title: f.title, fundingAgency: f.funding_agency || "", leadInstitution: f.lead_institution || "", duration: f.duration || "", status: f.status || "Ongoing" }))
    );
    setLoaded(true);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel("admin-partners-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "mentors" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "organizations" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "ecosystem_partners" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "funded_projects" }, load)
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, []);

  const q = searchQuery.toLowerCase();
  const isMentors = category === "Mentors";
  const isPartners = category === "Ecosystem Partners";
  const isFundedProjects = category === "Funded Projects";
  const isOrg = !isMentors && !isPartners && !isFundedProjects;
  const filteredMentors = mentors.filter((m) => !q || m.name.toLowerCase().includes(q) || m.position.toLowerCase().includes(q) || m.company.toLowerCase().includes(q));
  const filteredOrgs = orgs.filter((o) => o.org_type === category && (!q || o.name.toLowerCase().includes(q) || o.description.toLowerCase().includes(q)));
  const filteredPartners = partners.filter((p) => !q || p.name.toLowerCase().includes(q));
  const filteredFundedProjects = fundedProjects.filter((f) => !q || f.title.toLowerCase().includes(q) || f.fundingAgency.toLowerCase().includes(q) || f.leadInstitution.toLowerCase().includes(q));

  function openAddModal() {
    setEditingId(null);
    setMentorForm(EMPTY_MENTOR);
    setOrgForm(EMPTY_ORG);
    setPartnerForm(EMPTY_PARTNER);
    setFundedProjectForm(EMPTY_FUNDED_PROJECT);
    setError("");
    setModalOpen(true);
  }

  function openEditMentor(m: MentorRow) {
    setEditingId(m.id);
    setMentorForm({ name: m.name, position: m.position, company: m.company, bio: m.bio, specializations: m.specializations, photoUrl: m.photoUrl, sector: m.sector || SECTOR_FILTERS[0].label, socialLink: m.socialLink || "" });
    setError("");
    setModalOpen(true);
  }

  function toggleSpecialization(s: string) {
    setMentorForm((f) => {
      if (f.specializations.includes(s)) return { ...f, specializations: f.specializations.filter((x) => x !== s) };
      if (f.specializations.length >= MAX_SPECIALIZATIONS) return f;
      return { ...f, specializations: [...f.specializations, s] };
    });
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadMentorPhoto(file);
      setMentorForm((f) => ({ ...f, photoUrl: url }));
    } catch (err: any) {
      setError(err.message || "Photo upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function openEditOrg(o: OrgRow) {
    setEditingId(o.id);
    setOrgForm({ name: o.name, description: o.description, website: o.website, contact_email: o.contact_email, logoUrl: o.logoUrl, coverUrl: o.coverUrl || "", type: o.type });
    setError("");
    setModalOpen(true);
  }

  async function handleOrgLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadOrgLogo(file);
      setOrgForm((f) => ({ ...f, logoUrl: url }));
    } catch (err: any) {
      setError(err.message || "Logo upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleOrgCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadOrgCoverImage(file);
      setOrgForm((f) => ({ ...f, coverUrl: url }));
    } catch (err: any) {
      setError(err.message || "Cover image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function openEditPartner(p: PartnerRow) {
    setEditingId(p.id);
    setPartnerForm({ name: p.name, logoUrl: p.logoUrl });
    setError("");
    setModalOpen(true);
  }

  async function handlePartnerLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadPartnerLogo(file);
      setPartnerForm((f) => ({ ...f, logoUrl: url }));
    } catch (err: any) {
      setError(err.message || "Logo upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function openEditFundedProject(f: FundedProjectRow) {
    setEditingId(f.id);
    setFundedProjectForm({ title: f.title, fundingAgency: f.fundingAgency, leadInstitution: f.leadInstitution, duration: f.duration, status: f.status });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
  }

  async function deleteMentor(id: string) {
    if (!supabase) return;
    if (!window.confirm("Delete this mentor? This can't be undone.")) return;
    const { error: err } = await supabase.from("mentors").delete().eq("id", id);
    if (err) return window.alert(err.message);
    load();
    triggerSheetSync("mentors");
  }

  async function deleteOrg(org: OrgRow) {
    if (!supabase) return;
    if (!window.confirm("Delete this entry? This can't be undone.")) return;
    const { error: err } = await supabase.from("organizations").delete().eq("id", org.id);
    if (err) return window.alert(err.message);
    load();
    const sheetTable = ORG_SHEET_TABLE[org.org_type];
    if (sheetTable) triggerSheetSync(sheetTable);
  }

  async function deletePartner(id: string) {
    if (!supabase) return;
    if (!window.confirm("Delete this partner logo? This can't be undone.")) return;
    const { error: err } = await supabase.from("ecosystem_partners").delete().eq("id", id);
    if (err) return window.alert(err.message);
    load();
  }

  async function deleteFundedProject(id: string) {
    if (!supabase) return;
    if (!window.confirm("Delete this project? This can't be undone.")) return;
    const { error: err } = await supabase.from("funded_projects").delete().eq("id", id);
    if (err) return window.alert(err.message);
    load();
    triggerSheetSync("funded-projects");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError("");

    if (isMentors) {
      if (!mentorForm.name.trim()) return setError("Add a name.");
      const isIndustryExpert = mentorForm.specializations.includes("Industry Experts");
      const payload = { name: mentorForm.name.trim(), position: mentorForm.position.trim(), company: mentorForm.company.trim(), bio: mentorForm.bio.trim(), specializations: mentorForm.specializations, photo_url: mentorForm.photoUrl, sector: isIndustryExpert ? mentorForm.sector : "", social_link: mentorForm.socialLink.trim() };
      const { error: err } = editingId
        ? await supabase.from("mentors").update(payload).eq("id", editingId)
        : await supabase.from("mentors").insert(payload);
      if (err) return setError(err.message);
      triggerSheetSync("mentors");
    } else if (isPartners) {
      if (!partnerForm.name.trim()) return setError("Add a name.");
      const payload = { name: partnerForm.name.trim(), logo_url: partnerForm.logoUrl };
      const { error: err } = editingId
        ? await supabase.from("ecosystem_partners").update(payload).eq("id", editingId)
        : await supabase.from("ecosystem_partners").insert(payload);
      if (err) return setError(err.message);
    } else if (isFundedProjects) {
      if (!fundedProjectForm.title.trim()) return setError("Add a project title.");
      const payload = { title: fundedProjectForm.title.trim(), funding_agency: fundedProjectForm.fundingAgency.trim(), lead_institution: fundedProjectForm.leadInstitution.trim(), duration: fundedProjectForm.duration.trim(), status: fundedProjectForm.status };
      const { error: err } = editingId
        ? await supabase.from("funded_projects").update(payload).eq("id", editingId)
        : await supabase.from("funded_projects").insert(payload);
      if (err) return setError(err.message);
      triggerSheetSync("funded-projects");
    } else {
      if (!orgForm.name.trim()) return setError("Add a name.");
      const payload = { name: orgForm.name.trim(), org_type: category, description: orgForm.description.trim(), website: orgForm.website.trim(), contact_email: orgForm.contact_email.trim(), logo_url: orgForm.logoUrl, cover_url: orgForm.coverUrl, type: orgForm.type.trim() };
      const { error: err } = editingId
        ? await supabase.from("organizations").update(payload).eq("id", editingId)
        : await supabase.from("organizations").insert(payload);
      if (err) return setError(err.message);
      const sheetTable = ORG_SHEET_TABLE[category as OrgType];
      if (sheetTable) triggerSheetSync(sheetTable);
    }
    closeModal();
    load();
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(64,50,34,0.12)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => {
            const active = category === c;
            const count = c === "Mentors" ? mentors.length : c === "Ecosystem Partners" ? partners.length : c === "Funded Projects" ? fundedProjects.length : orgs.filter((o) => o.org_type === c).length;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  fontSize: 12.5,
                  fontWeight: active ? 600 : 500,
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "none",
                  color: active ? "#fff" : "#5A544B",
                  background: active ? "#131110" : "#F5F4F0",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {c}
                <span style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={openAddModal}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600, border: "none", color: "#fff", background: ORANGE, cursor: "pointer" }}
        >
          + Add {isMentors ? "Mentor" : isPartners ? "Partner logo" : isFundedProjects ? "Project" : singularCategory(category)}
        </button>
      </div>

      <div className="ib-admin-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
        {isMentors &&
          filteredMentors.map((m) => (
            <div key={m.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)", padding: 18, display: "flex", gap: 12 }}>
              {m.photoUrl ? (
                <img src={m.photoUrl} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 10, background: m.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{m.initials}</div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{m.name}</div>
                <div style={{ fontSize: 11.5, color: "#8B8479", margin: "3px 0 8px" }}>{m.position}{m.company ? ` · ${m.company}` : ""}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => openEditMentor(m)} style={{ fontSize: 11.5, fontWeight: 600, color: "#285E7A", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Edit</button>
                  <button onClick={() => deleteMentor(m.id)} style={{ fontSize: 11.5, fontWeight: 600, color: "#E23A2E", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Delete</button>
                </div>
              </div>
            </div>
          ))}

        {isPartners &&
          filteredPartners.map((p) => (
            <div key={p.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)", padding: 18, display: "flex", gap: 12, alignItems: "center" }}>
              {p.logoUrl ? (
                <img src={p.logoUrl} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "contain", background: "#F5F4F0", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F5F4F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B8479", fontSize: 9.5, textAlign: "center", flexShrink: 0 }}>No logo</div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button onClick={() => openEditPartner(p)} style={{ fontSize: 11.5, fontWeight: 600, color: "#285E7A", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Edit</button>
                  <button onClick={() => deletePartner(p.id)} style={{ fontSize: 11.5, fontWeight: 600, color: "#E23A2E", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Delete</button>
                </div>
              </div>
            </div>
          ))}

        {isOrg &&
          filteredOrgs.map((o) => (
            <div key={o.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)", padding: 18, display: "flex", gap: 12 }}>
              {o.logoUrl ? (
                <img src={o.logoUrl} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 10, background: o.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{o.initials}</div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{o.name}</div>
                <div style={{ fontSize: 11.5, color: "#8B8479", margin: "3px 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.description || "No description yet"}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => openEditOrg(o)} style={{ fontSize: 11.5, fontWeight: 600, color: "#285E7A", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Edit</button>
                  <button onClick={() => deleteOrg(o)} style={{ fontSize: 11.5, fontWeight: 600, color: "#E23A2E", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Delete</button>
                </div>
              </div>
            </div>
          ))}

        {isFundedProjects &&
          filteredFundedProjects.map((f) => (
            <div key={f.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)", padding: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{f.title}</div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "#285E7A", background: "rgba(40,94,122,0.10)", padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>{f.status}</span>
              </div>
              <div style={{ fontSize: 11.5, color: "#8B8479", lineHeight: 1.5, marginBottom: 8 }}>
                {f.fundingAgency && <div>Funding agency: {f.fundingAgency}</div>}
                {f.leadInstitution && <div>Lead institution: {f.leadInstitution}</div>}
                {f.duration && <div>Duration: {f.duration}</div>}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => openEditFundedProject(f)} style={{ fontSize: 11.5, fontWeight: 600, color: "#285E7A", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Edit</button>
                <button onClick={() => deleteFundedProject(f.id)} style={{ fontSize: 11.5, fontWeight: 600, color: "#E23A2E", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Delete</button>
              </div>
            </div>
          ))}

        {loaded && ((isMentors && filteredMentors.length === 0) || (isPartners && filteredPartners.length === 0) || (isFundedProjects && filteredFundedProjects.length === 0) || (isOrg && filteredOrgs.length === 0)) && (
          <div style={{ gridColumn: "1 / -1", padding: "28px 20px", textAlign: "center", color: "#8B8479", fontSize: 13, background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)" }}>
            No {category.toLowerCase()} yet.
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          onClick={closeModal}
          style={{ position: "fixed", inset: 0, background: "rgba(15,15,17,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            style={{ background: "#fff", borderRadius: 18, padding: 26, width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 16, maxHeight: "90vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 16.5, fontWeight: 600, color: DARK }}>
                {editingId ? "Edit" : "Add"} {isMentors ? "mentor" : isPartners ? "partner logo" : isFundedProjects ? "funded project" : singularCategory(category).toLowerCase()}
              </div>
              <button type="button" onClick={closeModal} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#8B8479", lineHeight: 1 }}>×</button>
            </div>

            {isMentors ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {mentorForm.photoUrl ? (
                    <img src={mentorForm.photoUrl} alt="" style={{ width: 52, height: 52, borderRadius: 9999, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 52, height: 52, borderRadius: 9999, background: "#F5F4F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B8479", fontSize: 10.5, textAlign: "center" }}>
                      No photo
                    </div>
                  )}
                  <div>
                    <label style={{ display: "inline-block", fontSize: 12.5, fontWeight: 600, color: "#285E7A", cursor: "pointer" }}>
                      {uploading ? "Uploading…" : "Upload photo"}
                      <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} style={{ display: "none" }} />
                    </label>
                    <div style={{ fontSize: 11, color: "#8B8479", marginTop: 2 }}>Shown as the card background on the Ecosystem directory.</div>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Full name</label>
                  <input
                    value={mentorForm.name}
                    onChange={(e) => setMentorForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Maria Aquino"
                    required
                    maxLength={NAME_MAX}
                    style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Position</label>
                    <input
                      value={mentorForm.position}
                      onChange={(e) => setMentorForm((f) => ({ ...f, position: e.target.value }))}
                      placeholder="e.g. CTO & Mentor"
                      maxLength={POSITION_MAX}
                      style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Company</label>
                    <input
                      value={mentorForm.company}
                      onChange={(e) => setMentorForm((f) => ({ ...f, company: e.target.value }))}
                      placeholder="e.g. Independent"
                      maxLength={COMPANY_MAX}
                      style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>
                    <span>Specialization</span>
                    <span style={{ color: "#8B8479", fontWeight: 500 }}>{mentorForm.specializations.length}/{MAX_SPECIALIZATIONS}</span>
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {MENTOR_SPECIALIZATIONS.map((s) => {
                      const active = mentorForm.specializations.includes(s);
                      const disabled = !active && mentorForm.specializations.length >= MAX_SPECIALIZATIONS;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSpecialization(s)}
                          disabled={disabled}
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            padding: "6px 12px",
                            borderRadius: 999,
                            border: active ? "1.5px solid #F26522" : "1.5px solid rgba(64,50,34,0.14)",
                            color: active ? "#F26522" : disabled ? "#C9C5BB" : "#5A544B",
                            background: active ? "rgba(242,101,34,0.08)" : "#fff",
                            cursor: disabled ? "default" : "pointer",
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {mentorForm.specializations.includes("Industry Experts") && (
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Sector</label>
                    <select
                      value={mentorForm.sector}
                      onChange={(e) => setMentorForm((f) => ({ ...f, sector: e.target.value }))}
                      style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box", appearance: "auto" }}
                    >
                      {SECTOR_FILTERS.map((s) => (
                        <option key={s.label} value={s.label}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>
                    <span>Bio</span>
                    <span style={{ color: "#8B8479", fontWeight: 500 }}>{mentorForm.bio.length}/{BIO_MAX}</span>
                  </label>
                  <textarea
                    value={mentorForm.bio}
                    onChange={(e) => setMentorForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Background and how they can help founders."
                    maxLength={BIO_MAX}
                    style={{ width: "100%", fontSize: 13.5, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box", minHeight: 74, resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Facebook / LinkedIn / Website (optional)</label>
                  <input
                    value={mentorForm.socialLink}
                    onChange={(e) => setMentorForm((f) => ({ ...f, socialLink: e.target.value }))}
                    placeholder="https://"
                    style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </>
            ) : isPartners ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {partnerForm.logoUrl ? (
                    <img src={partnerForm.logoUrl} alt="" style={{ width: 68, height: 52, borderRadius: 12, objectFit: "contain", background: "#F5F4F0" }} />
                  ) : (
                    <div style={{ width: 68, height: 52, borderRadius: 12, background: "#F5F4F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B8479", fontSize: 10.5, textAlign: "center" }}>
                      No logo
                    </div>
                  )}
                  <div>
                    <label style={{ display: "inline-block", fontSize: 12.5, fontWeight: 600, color: "#285E7A", cursor: "pointer" }}>
                      {uploading ? "Uploading…" : "Upload logo"}
                      <input type="file" accept="image/*" onChange={handlePartnerLogoChange} disabled={uploading} style={{ display: "none" }} />
                    </label>
                    <div style={{ fontSize: 11, color: "#8B8479", marginTop: 2 }}>Shown in the homepage&rsquo;s scrolling ecosystem partners strip. A transparent PNG/SVG-style logo works best.</div>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Partner name</label>
                  <input
                    value={partnerForm.name}
                    onChange={(e) => setPartnerForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Saint Louis University"
                    required
                    maxLength={NAME_MAX}
                    style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box" }}
                  />
                  <div style={{ fontSize: 11, color: "#8B8479", marginTop: 4 }}>Used as alt text and shown only if no logo is uploaded.</div>
                </div>
              </>
            ) : isFundedProjects ? (
              <>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Project title</label>
                  <input
                    value={fundedProjectForm.title}
                    onChange={(e) => setFundedProjectForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Smart Agriculture for the Cordillera"
                    required
                    maxLength={NAME_MAX * 2}
                    style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Funding agency</label>
                  <input
                    value={fundedProjectForm.fundingAgency}
                    onChange={(e) => setFundedProjectForm((f) => ({ ...f, fundingAgency: e.target.value }))}
                    placeholder="e.g. DOST-PCAARRD"
                    style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Lead institution</label>
                  <input
                    value={fundedProjectForm.leadInstitution}
                    onChange={(e) => setFundedProjectForm((f) => ({ ...f, leadInstitution: e.target.value }))}
                    placeholder="e.g. Benguet State University"
                    style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Duration</label>
                    <input
                      value={fundedProjectForm.duration}
                      onChange={(e) => setFundedProjectForm((f) => ({ ...f, duration: e.target.value }))}
                      placeholder="e.g. 2024–2026"
                      style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Status</label>
                    <select
                      value={fundedProjectForm.status}
                      onChange={(e) => setFundedProjectForm((f) => ({ ...f, status: e.target.value }))}
                      style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box", appearance: "auto" }}
                    >
                      {PROJECT_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {orgForm.logoUrl ? (
                    <img src={orgForm.logoUrl} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: "#F5F4F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B8479", fontSize: 10.5, textAlign: "center" }}>
                      No logo
                    </div>
                  )}
                  <div>
                    <label style={{ display: "inline-block", fontSize: 12.5, fontWeight: 600, color: "#285E7A", cursor: "pointer" }}>
                      {uploading ? "Uploading…" : "Upload logo"}
                      <input type="file" accept="image/*" onChange={handleOrgLogoChange} disabled={uploading} style={{ display: "none" }} />
                    </label>
                    <div style={{ fontSize: 11, color: "#8B8479", marginTop: 2 }}>Shown on the Ecosystem directory card.</div>
                  </div>
                </div>
                {(category === "Coworking Spaces" || category === "Makerspaces & Labs") && (
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {orgForm.coverUrl ? (
                      <img src={orgForm.coverUrl} alt="" style={{ width: 84, height: 52, borderRadius: 10, objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 84, height: 52, borderRadius: 10, background: "#F5F4F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B8479", fontSize: 10.5, textAlign: "center" }}>
                        No cover
                      </div>
                    )}
                    <div>
                      <label style={{ display: "inline-block", fontSize: 12.5, fontWeight: 600, color: "#285E7A", cursor: "pointer" }}>
                        {uploading ? "Uploading…" : "Upload cover image"}
                        <input type="file" accept="image/*" onChange={handleOrgCoverChange} disabled={uploading} style={{ display: "none" }} />
                      </label>
                      <div style={{ fontSize: 11, color: "#8B8479", marginTop: 2 }}>Banner photo shown at the top of the card.</div>
                    </div>
                  </div>
                )}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Name</label>
                  <input
                    value={orgForm.name}
                    onChange={(e) => setOrgForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder={`e.g. ${category === "TBIs" ? "SLU iDEYA" : category === "Government" ? "City Environment Office" : "Organization name"}`}
                    required
                    maxLength={NAME_MAX}
                    style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                {(() => {
                  const isPhotoCard = category === "Coworking Spaces" || category === "Makerspaces & Labs";
                  return (
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>
                        {isPhotoCard ? "Type" : "Badge / abbreviation"}
                      </label>
                      <input
                        value={orgForm.type}
                        onChange={(e) => setOrgForm((f) => ({ ...f, type: e.target.value }))}
                        placeholder={
                          category === "Coworking Spaces" ? "e.g. Coworking space" :
                          category === "Makerspaces & Labs" ? "e.g. Digital fabrication lab" :
                          "e.g. DICT-CAR"
                        }
                        maxLength={TYPE_MAX}
                        style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box" }}
                      />
                      <div style={{ fontSize: 11, color: "#8B8479", marginTop: 4 }}>
                        {isPhotoCard
                          ? <>Short label shown on the card, e.g. &ldquo;Coworking space.&rdquo;</>
                          : <>Short badge shown on the card, e.g. &ldquo;DICT-CAR.&rdquo; Leave blank to auto-generate one from the name.</>}
                      </div>
                    </div>
                  );
                })()}
                <div>
                  <label style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>
                    <span>Description</span>
                    <span style={{ color: "#8B8479", fontWeight: 500 }}>{orgForm.description.length}/{BIO_MAX}</span>
                  </label>
                  <textarea
                    value={orgForm.description}
                    onChange={(e) => setOrgForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What do they do, and how do they support the ecosystem?"
                    maxLength={BIO_MAX}
                    style={{ width: "100%", fontSize: 13.5, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box", minHeight: 74, resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Website (optional)</label>
                    <input
                      type="url"
                      value={orgForm.website}
                      onChange={(e) => setOrgForm((f) => ({ ...f, website: e.target.value }))}
                      placeholder="https://"
                      style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Contact email (optional)</label>
                    <input
                      type="email"
                      value={orgForm.contact_email}
                      onChange={(e) => setOrgForm((f) => ({ ...f, contact_email: e.target.value }))}
                      placeholder="you@example.com"
                      style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </>
            )}

            {error && <p style={{ color: "#E23A2E", fontSize: 12.5, margin: 0 }}>{error}</p>}

            <button
              type="submit"
              disabled={uploading}
              style={{ marginTop: 4, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 999, padding: "11px 22px", cursor: "pointer", opacity: uploading ? 0.7 : 1 }}
            >
              {editingId ? "Save changes" : "Add"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
