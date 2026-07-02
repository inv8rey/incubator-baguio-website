"use client";

import { useEffect, useState } from "react";
import { DARK, ORANGE } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { initialsOf, paletteFor } from "../../../lib/visualIdentity";
import { uploadMentorPhoto } from "../../../lib/uploadLogo";
import { MENTOR_EXPERTISE_COLORS, type MentorExpertise } from "../../calendar/data";

const EXPERTISE_LIST = Object.keys(MENTOR_EXPERTISE_COLORS) as MentorExpertise[];

const ORG_TYPES = ["TBIs", "Corporate", "Government", "Community", "Coworking Spaces", "Makerspaces & Labs"] as const;
type OrgType = (typeof ORG_TYPES)[number];
const CATEGORIES = ["Mentors", ...ORG_TYPES] as const;
type Category = (typeof CATEGORIES)[number];

const NAME_MAX = 60;
const BIO_MAX = 280;
const TAG_MAX = 40;

interface MentorRow {
  id: string;
  name: string;
  expertise: string;
  bio: string;
  tag: string;
  photoUrl: string;
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
  initials: string;
  color: string;
}

const EMPTY_MENTOR = { name: "", expertise: EXPERTISE_LIST[0] as string, bio: "", tag: "", photoUrl: "" };
const EMPTY_ORG = { name: "", description: "", website: "", contact_email: "" };

export default function PartnersTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [category, setCategory] = useState<Category>("Mentors");
  const [mentors, setMentors] = useState<MentorRow[]>([]);
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mentorForm, setMentorForm] = useState(EMPTY_MENTOR);
  const [orgForm, setOrgForm] = useState(EMPTY_ORG);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const [{ data: mentorData }, { data: orgData }] = await Promise.all([
      supabase.from("mentors").select("*").order("created_at", { ascending: false }),
      supabase.from("organizations").select("*").order("created_at", { ascending: false }),
    ]);
    setMentors(
      (mentorData ?? []).map((m: any) => {
        const p = paletteFor(m.name);
        return { id: m.id, name: m.name, expertise: m.expertise, bio: m.bio, tag: m.tag, photoUrl: m.photo_url, initials: initialsOf(m.name), color: p.color };
      })
    );
    setOrgs(
      (orgData ?? []).map((o: any) => {
        const p = paletteFor(o.name);
        return { id: o.id, name: o.name, org_type: o.org_type, description: o.description, website: o.website, contact_email: o.contact_email, initials: initialsOf(o.name), color: p.color };
      })
    );
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  const q = searchQuery.toLowerCase();
  const isMentors = category === "Mentors";
  const filteredMentors = mentors.filter((m) => !q || m.name.toLowerCase().includes(q) || m.expertise.toLowerCase().includes(q));
  const filteredOrgs = orgs.filter((o) => o.org_type === category && (!q || o.name.toLowerCase().includes(q) || o.description.toLowerCase().includes(q)));

  function openAddModal() {
    setEditingId(null);
    setMentorForm(EMPTY_MENTOR);
    setOrgForm(EMPTY_ORG);
    setError("");
    setModalOpen(true);
  }

  function openEditMentor(m: MentorRow) {
    setEditingId(m.id);
    setMentorForm({ name: m.name, expertise: m.expertise, bio: m.bio, tag: m.tag, photoUrl: m.photoUrl });
    setError("");
    setModalOpen(true);
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
    setOrgForm({ name: o.name, description: o.description, website: o.website, contact_email: o.contact_email });
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
  }

  async function deleteOrg(id: string) {
    if (!supabase) return;
    if (!window.confirm("Delete this entry? This can't be undone.")) return;
    const { error: err } = await supabase.from("organizations").delete().eq("id", id);
    if (err) return window.alert(err.message);
    load();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError("");

    if (isMentors) {
      if (!mentorForm.name.trim()) return;
      const payload = { name: mentorForm.name.trim(), expertise: mentorForm.expertise, bio: mentorForm.bio.trim(), tag: mentorForm.tag.trim(), photo_url: mentorForm.photoUrl };
      const { error: err } = editingId
        ? await supabase.from("mentors").update(payload).eq("id", editingId)
        : await supabase.from("mentors").insert(payload);
      if (err) return setError(err.message);
    } else {
      if (!orgForm.name.trim()) return;
      const payload = { name: orgForm.name.trim(), org_type: category, description: orgForm.description.trim(), website: orgForm.website.trim(), contact_email: orgForm.contact_email.trim() };
      const { error: err } = editingId
        ? await supabase.from("organizations").update(payload).eq("id", editingId)
        : await supabase.from("organizations").insert(payload);
      if (err) return setError(err.message);
    }
    closeModal();
    load();
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(20,20,25,0.09)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => {
            const active = category === c;
            const count = c === "Mentors" ? mentors.length : orgs.filter((o) => o.org_type === c).length;
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
                  color: active ? "#fff" : "#6B6B73",
                  background: active ? "#0E0E10" : "#F5F4F0",
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
          + Add {isMentors ? "Mentor" : category.replace(/s$/, "")}
        </button>
      </div>

      <div className="ib-admin-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {isMentors &&
          filteredMentors.map((m) => (
            <div key={m.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)", padding: 18, display: "flex", gap: 12 }}>
              {m.photoUrl ? (
                <img src={m.photoUrl} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 10, background: m.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{m.initials}</div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{m.name}</div>
                <div style={{ fontSize: 11.5, color: "#9A958B", margin: "3px 0 8px" }}>{m.expertise}{m.tag ? ` · ${m.tag}` : ""}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => openEditMentor(m)} style={{ fontSize: 11.5, fontWeight: 600, color: "#285E7A", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Edit</button>
                  <button onClick={() => deleteMentor(m.id)} style={{ fontSize: 11.5, fontWeight: 600, color: "#E23A2E", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Delete</button>
                </div>
              </div>
            </div>
          ))}

        {!isMentors &&
          filteredOrgs.map((o) => (
            <div key={o.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)", padding: 18, display: "flex", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: o.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{o.initials}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{o.name}</div>
                <div style={{ fontSize: 11.5, color: "#9A958B", margin: "3px 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.description || "No description yet"}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => openEditOrg(o)} style={{ fontSize: 11.5, fontWeight: 600, color: "#285E7A", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Edit</button>
                  <button onClick={() => deleteOrg(o.id)} style={{ fontSize: 11.5, fontWeight: 600, color: "#E23A2E", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Delete</button>
                </div>
              </div>
            </div>
          ))}

        {loaded && ((isMentors && filteredMentors.length === 0) || (!isMentors && filteredOrgs.length === 0)) && (
          <div style={{ gridColumn: "1 / -1", padding: "28px 20px", textAlign: "center", color: "#9A958B", fontSize: 13, background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)" }}>
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
              <div style={{ fontSize: 16.5, fontWeight: 700, color: DARK }}>
                {editingId ? "Edit" : "Add"} {isMentors ? "mentor" : category.replace(/s$/, "").toLowerCase()}
              </div>
              <button type="button" onClick={closeModal} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#9A958B", lineHeight: 1 }}>×</button>
            </div>

            {isMentors ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {mentorForm.photoUrl ? (
                    <img src={mentorForm.photoUrl} alt="" style={{ width: 52, height: 52, borderRadius: 9999, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 52, height: 52, borderRadius: 9999, background: "#F5F4F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A958B", fontSize: 10.5, textAlign: "center" }}>
                      No photo
                    </div>
                  )}
                  <div>
                    <label style={{ display: "inline-block", fontSize: 12.5, fontWeight: 600, color: "#285E7A", cursor: "pointer" }}>
                      {uploading ? "Uploading…" : "Upload photo"}
                      <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} style={{ display: "none" }} />
                    </label>
                    <div style={{ fontSize: 11, color: "#9A958B", marginTop: 2 }}>Shown as the card background on the Ecosystem directory.</div>
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
                    style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Expertise</label>
                    <select
                      value={mentorForm.expertise}
                      onChange={(e) => setMentorForm((f) => ({ ...f, expertise: e.target.value }))}
                      style={{ width: "100%", fontSize: 13.5, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
                    >
                      {EXPERTISE_LIST.map((x) => (
                        <option key={x} value={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Tag</label>
                    <input
                      value={mentorForm.tag}
                      onChange={(e) => setMentorForm((f) => ({ ...f, tag: e.target.value }))}
                      placeholder="e.g. Founder, 2 exits"
                      maxLength={TAG_MAX}
                      style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>
                    <span>Bio</span>
                    <span style={{ color: "#9A958B", fontWeight: 500 }}>{mentorForm.bio.length}/{BIO_MAX}</span>
                  </label>
                  <textarea
                    value={mentorForm.bio}
                    onChange={(e) => setMentorForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Background and how they can help founders."
                    maxLength={BIO_MAX}
                    style={{ width: "100%", fontSize: 13.5, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box", minHeight: 74, resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Name</label>
                  <input
                    value={orgForm.name}
                    onChange={(e) => setOrgForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder={`e.g. ${category === "TBIs" ? "SLU iDEYA" : category === "Government" ? "City Environment Office" : "Organization name"}`}
                    required
                    maxLength={NAME_MAX}
                    style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>
                    <span>Description</span>
                    <span style={{ color: "#9A958B", fontWeight: 500 }}>{orgForm.description.length}/{BIO_MAX}</span>
                  </label>
                  <textarea
                    value={orgForm.description}
                    onChange={(e) => setOrgForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What do they do, and how do they support the ecosystem?"
                    maxLength={BIO_MAX}
                    style={{ width: "100%", fontSize: 13.5, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box", minHeight: 74, resize: "vertical", fontFamily: "inherit" }}
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
                      style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Contact email (optional)</label>
                    <input
                      type="email"
                      value={orgForm.contact_email}
                      onChange={(e) => setOrgForm((f) => ({ ...f, contact_email: e.target.value }))}
                      placeholder="you@example.com"
                      style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
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
