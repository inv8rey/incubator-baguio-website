"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import { supabase } from "../../lib/supabaseClient";
import { uploadKnowledgeResourceFile } from "../../lib/uploadFile";
import { uploadKnowledgeResourceCover } from "../../lib/uploadLogo";
import { KNOWLEDGE_CATEGORIES, type KnowledgeCategory } from "../knowledge/data";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, DARK, ORANGE } from "./styles";

const FUNDING_CATEGORY: KnowledgeCategory = "Funding & Opportunities";

interface SubmissionRow {
  id: string;
  title: string;
  category: KnowledgeCategory;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

const STATUS_BADGE: Record<SubmissionRow["status"], { label: string; color: string; bg: string }> = {
  pending: { label: "Pending review", color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
  approved: { label: "Live on Knowledge Hub", color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" },
  rejected: { label: "Not approved", color: "#E23A2E", bg: "rgba(226,58,46,0.10)" },
};

// Shared by /dashboard/resources (personal, organization_id null) and the
// org-scoped Opportunities/Resources pages (organization_id set,
// allowedCategories narrowed) -- one submission pathway, reused rather than
// duplicated. Every submission lands as 'pending' in knowledge_resources and
// only appears on the public Knowledge Hub once an admin approves it, same
// review model as event submissions already use.
export default function ResourceSubmissionForm({
  organizationId,
  allowedCategories,
  heading = "Submit a resource",
  intro = "Reviewed by Incubator Baguio before it appears on the public Knowledge Hub.",
}: {
  organizationId: string | null;
  allowedCategories?: KnowledgeCategory[];
  heading?: string;
  intro?: string;
}) {
  const { user } = useAuth();
  const categories = allowedCategories ?? KNOWLEDGE_CATEGORIES.map((c) => c.id);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<KnowledgeCategory>(categories[0]);
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [source, setSource] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [fundingAmount, setFundingAmount] = useState("");
  const [targetParticipants, setTargetParticipants] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [fileUploading, setFileUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const isFunding = category === FUNDING_CATEGORY;

  async function load() {
    if (!supabase || !user) {
      setLoaded(true);
      return;
    }
    let q = supabase.from("knowledge_resources").select("id,title,category,status,created_at").eq("owner_id", user.id).order("created_at", { ascending: false });
    q = organizationId ? q.eq("organization_id", organizationId) : q.is("organization_id", null);
    const { data } = await q;
    setSubmissions((data as SubmissionRow[]) ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, organizationId]);

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
    if (!supabase || !user) return;
    if (!title.trim()) return setError("Add a title.");
    if (!fileUrl && !linkUrl.trim()) return setError("Add a file or an external link.");
    setError("");
    setBusy(true);
    const { error: err } = await supabase.from("knowledge_resources").insert({
      title: title.trim(),
      category,
      description: description.trim(),
      file_url: fileUrl,
      link_url: linkUrl.trim(),
      source: source.trim(),
      cover_image_url: isFunding ? coverImageUrl : "",
      funding_amount: isFunding ? fundingAmount.trim() : "",
      target_participants: isFunding ? targetParticipants.trim() : "",
      deadline_date: isFunding ? deadlineDate || null : null,
      owner_id: user.id,
      organization_id: organizationId,
      status: "pending",
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setTitle("");
    setDescription("");
    setLinkUrl("");
    setFileUrl("");
    setSource("");
    setCoverImageUrl("");
    setFundingAmount("");
    setTargetParticipants("");
    setDeadlineDate("");
    load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>{heading}</h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#5A544B" }}>{intro}</p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lean Canvas Template" />
          </div>
          {categories.length > 1 && (
            <div>
              <label style={labelStyle}>Category</label>
              <select style={{ ...inputStyle, appearance: "auto" }} value={category} onChange={(e) => setCategory(e.target.value as KnowledgeCategory)}>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={isFunding ? "What's being funded, and who is it for?" : "What is this resource about?"} />
          </div>
          <div>
            <label style={labelStyle}>Source / attribution (optional)</label>
            <input style={inputStyle} value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. DTI Region CAR" />
          </div>

          {isFunding && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.11)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: DARK }}>Funding details</div>
              <div>
                <label style={labelStyle}>Cover image (optional)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {coverImageUrl ? (
                    <img src={coverImageUrl} alt="" style={{ width: 84, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 84, height: 52, borderRadius: 8, background: "#fff", border: "1px dashed rgba(64,50,34,0.2)", flexShrink: 0 }} />
                  )}
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE, cursor: "pointer" }}>
                    {coverUploading ? "Uploading…" : "Upload image"}
                    <input type="file" accept="image/*" onChange={handleCoverChange} disabled={coverUploading} style={{ display: "none" }} />
                  </label>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Funding amount (optional)</label>
                <input style={inputStyle} value={fundingAmount} onChange={(e) => setFundingAmount(e.target.value)} placeholder="e.g. Up to ₱500,000" />
              </div>
              <div>
                <label style={labelStyle}>Who can apply (optional)</label>
                <input style={inputStyle} value={targetParticipants} onChange={(e) => setTargetParticipants(e.target.value)} placeholder="e.g. Early-stage tech startups" />
              </div>
              <div>
                <label style={labelStyle}>Application deadline (optional)</label>
                <input type="date" style={inputStyle} value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} />
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>File</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE, cursor: "pointer" }}>
                {fileUploading ? "Uploading…" : fileUrl ? "Replace file" : "Upload file"}
                <input type="file" onChange={handleFileChange} disabled={fileUploading} style={{ display: "none" }} />
              </label>
              {fileUrl && <span style={{ fontSize: 12, color: "#6E685F" }}>File attached</span>}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Or an external link{fileUrl ? " (optional)" : ""}</label>
            <input type="url" style={inputStyle} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" />
          </div>

          {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}

          <div>
            <button type="submit" disabled={busy || fileUploading || coverUploading} style={{ ...primaryButtonStyle, opacity: busy ? 0.7 : 1 }}>
              {busy ? "Submitting…" : "Submit for review"}
            </button>
          </div>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: DARK }}>Your submissions</h2>
        {!loaded ? (
          <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>Loading…</p>
        ) : submissions.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>Nothing submitted yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {submissions.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.1)", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  <div style={{ fontSize: 11.5, color: "#6E685F", marginTop: 1 }}>{s.category}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_BADGE[s.status].color, background: STATUS_BADGE[s.status].bg, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>{STATUS_BADGE[s.status].label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
