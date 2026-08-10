"use client";

import { useEffect, useState } from "react";
import { DARK, ORANGE } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { uploadKnowledgeResourceFile } from "../../../lib/uploadFile";
import { uploadKnowledgeResourceCover } from "../../../lib/uploadLogo";
import { KNOWLEDGE_CATEGORIES, fundingDeadlineInfo, type KnowledgeCategory } from "../../knowledge/data";

const FUNDING_CATEGORY: KnowledgeCategory = "Funding & Opportunities";

const modalInputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", fontSize: 13.5, color: DARK, outline: "none", fontFamily: "inherit" };
const modalLabelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 5, display: "block" };

interface ResourceRow {
  id: string;
  title: string;
  category: KnowledgeCategory;
  description: string;
  file_url: string;
  link_url: string;
  source: string;
  featured: boolean;
  cover_image_url: string;
  funding_amount: string;
  target_participants: string;
  deadline_date: string | null;
  created_at: string;
}

function ResourceFormModal({ resource, onClose, onSaved }: { resource: ResourceRow | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!resource;
  const [title, setTitle] = useState(resource?.title ?? "");
  const [category, setCategory] = useState<KnowledgeCategory>(resource?.category ?? KNOWLEDGE_CATEGORIES[0].id);
  const [description, setDescription] = useState(resource?.description ?? "");
  const [linkUrl, setLinkUrl] = useState(resource?.link_url ?? "");
  const [fileUrl, setFileUrl] = useState(resource?.file_url ?? "");
  const [source, setSource] = useState(resource?.source ?? "");
  const [featured, setFeatured] = useState(resource?.featured ?? false);
  const [coverImageUrl, setCoverImageUrl] = useState(resource?.cover_image_url ?? "");
  const [fundingAmount, setFundingAmount] = useState(resource?.funding_amount ?? "");
  const [targetParticipants, setTargetParticipants] = useState(resource?.target_participants ?? "");
  const [deadlineDate, setDeadlineDate] = useState(resource?.deadline_date ?? "");
  const [fileUploading, setFileUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const isFunding = category === FUNDING_CATEGORY;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileUploading(true);
    setError("");
    try {
      setFileUrl(await uploadKnowledgeResourceFile(file));
    } catch (err: any) {
      setError(err.message || "File upload failed.");
    }
    setFileUploading(false);
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverUploading(true);
    setError("");
    try {
      setCoverImageUrl(await uploadKnowledgeResourceCover(file));
    } catch (err: any) {
      setError(err.message || "Cover image upload failed.");
    }
    setCoverUploading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Add a title.");
      return;
    }
    if (!fileUrl && !linkUrl.trim()) {
      setError("Add a file or an external link.");
      return;
    }
    if (!supabase) {
      setError("Knowledge Hub isn't configured yet.");
      return;
    }
    setError("");
    setStatus("loading");
    const payload = {
      title: title.trim(),
      category,
      description: description.trim(),
      file_url: fileUrl,
      link_url: linkUrl.trim(),
      source: source.trim(),
      featured,
      // Cleared when the category is switched away from Funding &
      // Opportunities, so a leftover cover/amount/audience can't linger on a
      // resource re-filed under a different category.
      cover_image_url: isFunding ? coverImageUrl : "",
      funding_amount: isFunding ? fundingAmount.trim() : "",
      target_participants: isFunding ? targetParticipants.trim() : "",
      deadline_date: isFunding ? deadlineDate || null : null,
    };
    const { error: err } = isEdit
      ? await supabase.from("knowledge_resources").update(payload).eq("id", resource!.id)
      : await supabase.from("knowledge_resources").insert(payload);
    if (err) {
      setError(err.message);
      setStatus("error");
      return;
    }
    onSaved();
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 520, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: 18, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>{isEdit ? "Edit resource" : "Add resource"}</div>
            <div style={{ fontSize: 12.5, color: "#8B8479", marginTop: 3 }}>Goes live on the Knowledge Hub immediately.</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F5F4F0", cursor: "pointer", fontSize: 18, color: "#5A544B", flexShrink: 0 }}>&times;</button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={modalLabelStyle}>Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lean Canvas Template" style={modalInputStyle} required />
          </div>
          <div>
            <label style={modalLabelStyle}>Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as KnowledgeCategory)} style={{ ...modalInputStyle, appearance: "none" }}>
              {KNOWLEDGE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={modalLabelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isFunding ? "What's being funded, and why should a founder care? e.g. \"Matching grants for MSMEs upgrading their production tech.\"" : "What is this resource about?"}
              style={{ ...modalInputStyle, resize: "vertical", minHeight: 70 }}
            />
          </div>
          <div>
            <label style={modalLabelStyle}>Source / attribution (optional)</label>
            <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. DTI Region CAR" style={modalInputStyle} />
          </div>

          {isFunding && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.11)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: DARK }}>Funding details</div>
              <div>
                <label style={modalLabelStyle}>Cover image (optional)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {coverImageUrl ? (
                    <img src={coverImageUrl} alt="" style={{ width: 84, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 84, height: 52, borderRadius: 8, background: "#fff", border: "1px dashed rgba(64,50,34,0.2)", flexShrink: 0 }} />
                  )}
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: "#285E7A", border: "1.5px solid rgba(40,94,122,0.3)", borderRadius: 999, padding: "8px 14px", cursor: "pointer", background: "#fff" }}>
                    {coverUploading ? "Uploading…" : coverImageUrl ? "Replace image" : "Upload image"}
                    <input type="file" accept="image/*" onChange={handleCoverChange} disabled={coverUploading} style={{ display: "none" }} />
                  </label>
                  {coverImageUrl && (
                    <button type="button" onClick={() => setCoverImageUrl("")} style={{ fontSize: 12.5, fontWeight: 600, color: "#8B8479", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "#8B8479", marginTop: 6 }}>Shown as a banner on the card. Landscape works best.</div>
              </div>
              <div>
                <label style={modalLabelStyle}>Funding amount (optional)</label>
                <input value={fundingAmount} onChange={(e) => setFundingAmount(e.target.value)} placeholder="e.g. Up to ₱500,000 per project" style={modalInputStyle} />
              </div>
              <div>
                <label style={modalLabelStyle}>Who can apply (optional)</label>
                <input value={targetParticipants} onChange={(e) => setTargetParticipants(e.target.value)} placeholder="e.g. Early-stage tech startups registered in Baguio" style={modalInputStyle} />
              </div>
              <div>
                <label style={modalLabelStyle}>Application deadline (optional)</label>
                <input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} style={modalInputStyle} />
                <div style={{ fontSize: 11, color: "#8B8479", marginTop: 6 }}>Once this date passes, the card automatically grays out on the Knowledge Hub. Leave blank for an ongoing or rolling call.</div>
              </div>
            </div>
          )}

          <div>
            <label style={modalLabelStyle}>File</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "#285E7A", border: "1.5px solid rgba(40,94,122,0.3)", borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}>
                {fileUploading ? "Uploading…" : fileUrl ? "Replace file" : "Upload file"}
                <input type="file" onChange={handleFileChange} disabled={fileUploading} style={{ display: "none" }} />
              </label>
              {fileUrl && (
                <>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: "#8B8479" }}>View current file</a>
                  <button type="button" onClick={() => setFileUrl("")} style={{ fontSize: 12.5, fontWeight: 600, color: "#8B8479", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                </>
              )}
            </div>
          </div>
          <div>
            <label style={modalLabelStyle}>Or an external link{fileUrl ? " (optional)" : " *"}</label>
            <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" style={modalInputStyle} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>Feature this resource</span>
          </label>
          <div style={{ fontSize: 11.5, color: "#8B8479", marginTop: -8 }}>Featured resources are pinned to the top of the Knowledge Hub, above the rest.</div>

          {error && <p style={{ color: "#E23A2E", fontSize: 12.5, margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", background: "#fff", fontSize: 13.5, fontWeight: 500, cursor: "pointer", color: "#44444C" }}>Cancel</button>
            <button type="submit" disabled={status === "loading" || fileUploading || coverUploading} style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: ORANGE, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", opacity: status === "loading" ? 0.7 : 1 }}>
              {status === "loading" ? "Saving…" : isEdit ? "Save changes" : "Add resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function KnowledgeTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [tab, setTab] = useState<KnowledgeCategory | "All">("All");
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ResourceRow | null>(null);

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const { data } = await supabase.from("knowledge_resources").select("*").order("created_at", { ascending: false });
    setResources((data as ResourceRow[]) ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel("admin-knowledge-resources-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "knowledge_resources" }, load)
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, []);

  const q = searchQuery.toLowerCase();
  const filtered = resources.filter((r) => (tab === "All" || r.category === tab) && (!q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)));

  async function remove(id: string) {
    if (!supabase) return;
    if (!window.confirm("Delete this resource permanently? This can't be undone.")) return;
    const { error } = await supabase.from("knowledge_resources").delete().eq("id", id);
    if (error) return window.alert(error.message);
    load();
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(64,50,34,0.12)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          <button
            onClick={() => setTab("All")}
            style={{ fontSize: 12.5, fontWeight: tab === "All" ? 600 : 500, padding: "6px 14px", borderRadius: 999, border: "none", color: tab === "All" ? "#fff" : "#5A544B", background: tab === "All" ? "#131110" : "#F5F4F0", cursor: "pointer" }}
          >
            All
            <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 6 }}>{resources.length}</span>
          </button>
          {KNOWLEDGE_CATEGORIES.map((c) => {
            const active = tab === c.id;
            const count = resources.filter((r) => r.category === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setTab(c.id)}
                style={{ fontSize: 12.5, fontWeight: active ? 600 : 500, padding: "6px 14px", borderRadius: 999, border: "none", color: active ? "#fff" : "#5A544B", background: active ? "#131110" : "#F5F4F0", cursor: "pointer" }}
              >
                {c.id}
                <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 6 }}>{count}</span>
              </button>
            );
          })}
        </div>
        <button onClick={() => setAdding(true)} style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 999, padding: "8px 16px", cursor: "pointer", flexShrink: 0 }}>+ Add resource</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((r) => (
          <div key={r.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)", padding: 18, display: "flex", gap: 16, alignItems: "flex-start" }}>
            {r.category === FUNDING_CATEGORY && r.cover_image_url ? (
              <img src={r.cover_image_url} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
            ) : null}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: DARK }}>{r.title}</span>
                {r.featured && (
                  <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color: ORANGE, background: "rgba(242,101,34,0.12)", padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>★ Featured</span>
                )}
                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color: "#5A544B", background: "#F5F4F0", padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>{r.category}</span>
                {r.category === FUNDING_CATEGORY && (() => {
                  const info = fundingDeadlineInfo(r.deadline_date);
                  return info ? (
                    <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color: info.color, background: `${info.color}1A`, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>{info.label}</span>
                  ) : null;
                })()}
              </div>
              {r.description && <div style={{ fontSize: 12.5, color: "#5A544B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</div>}
              {r.category === FUNDING_CATEGORY && (r.funding_amount || r.target_participants) && (
                <div style={{ fontSize: 11.5, color: "#1A6B3C", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {[r.funding_amount, r.target_participants].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {(r.file_url || r.link_url) && (
                <a href={r.file_url || r.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "#8B8479", background: "none", border: "1.5px solid rgba(64,50,34,0.14)", borderRadius: 999, padding: "7px 14px", cursor: "pointer", textDecoration: "none" }}>View</a>
              )}
              <button onClick={() => setEditing(r)} style={{ fontSize: 12, fontWeight: 600, color: "#44444C", background: "none", border: "1.5px solid rgba(64,50,34,0.14)", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>Edit</button>
              <button onClick={() => remove(r.id)} style={{ fontSize: 12, fontWeight: 600, color: "#E23A2E", background: "none", border: "1.5px solid rgba(226,58,46,0.3)", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        ))}

        {loaded && filtered.length === 0 && (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "#8B8479", fontSize: 13, background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)" }}>
            No resources yet.
          </div>
        )}
      </div>

      {adding && (
        <ResourceFormModal
          resource={null}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            load();
          }}
        />
      )}

      {editing && (
        <ResourceFormModal
          resource={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
