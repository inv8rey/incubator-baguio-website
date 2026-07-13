"use client";

import { useEffect, useState } from "react";
import { DARK, ORANGE } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { uploadKnowledgeResourceFile } from "../../../lib/uploadFile";
import { KNOWLEDGE_CATEGORIES, type KnowledgeCategory } from "../../knowledge/data";

const modalInputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.14)", fontSize: 13.5, color: DARK, outline: "none", fontFamily: "inherit" };
const modalLabelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 5, display: "block" };

interface ResourceRow {
  id: string;
  title: string;
  category: KnowledgeCategory;
  description: string;
  file_url: string;
  link_url: string;
  source: string;
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
  const [fileUploading, setFileUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || (!fileUrl && !linkUrl.trim())) return;
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
            <div style={{ fontSize: 20, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>{isEdit ? "Edit resource" : "Add resource"}</div>
            <div style={{ fontSize: 12.5, color: "#9A958B", marginTop: 3 }}>Goes live on the Knowledge Hub immediately.</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F5F4F0", cursor: "pointer", fontSize: 18, color: "#6B6B73", flexShrink: 0 }}>&times;</button>
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
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this resource about?" style={{ ...modalInputStyle, resize: "vertical", minHeight: 70 }} />
          </div>
          <div>
            <label style={modalLabelStyle}>Source / attribution (optional)</label>
            <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. DTI Region CAR" style={modalInputStyle} />
          </div>
          <div>
            <label style={modalLabelStyle}>File</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "#285E7A", border: "1.5px solid rgba(40,94,122,0.3)", borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}>
                {fileUploading ? "Uploading…" : fileUrl ? "Replace file" : "Upload file"}
                <input type="file" onChange={handleFileChange} disabled={fileUploading} style={{ display: "none" }} />
              </label>
              {fileUrl && (
                <>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: "#9A958B" }}>View current file</a>
                  <button type="button" onClick={() => setFileUrl("")} style={{ fontSize: 12.5, fontWeight: 600, color: "#9A958B", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                </>
              )}
            </div>
          </div>
          <div>
            <label style={modalLabelStyle}>Or an external link{fileUrl ? " (optional)" : " *"}</label>
            <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" style={modalInputStyle} />
          </div>

          {error && <p style={{ color: "#E23A2E", fontSize: 12.5, margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", background: "#fff", fontSize: 13.5, fontWeight: 500, cursor: "pointer", color: "#44444C" }}>Cancel</button>
            <button type="submit" disabled={status === "loading" || fileUploading} style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: ORANGE, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", opacity: status === "loading" ? 0.7 : 1 }}>
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
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(20,20,25,0.09)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          <button
            onClick={() => setTab("All")}
            style={{ fontSize: 12.5, fontWeight: tab === "All" ? 600 : 500, padding: "6px 14px", borderRadius: 999, border: "none", color: tab === "All" ? "#fff" : "#6B6B73", background: tab === "All" ? "#0E0E10" : "#F5F4F0", cursor: "pointer" }}
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
                style={{ fontSize: 12.5, fontWeight: active ? 600 : 500, padding: "6px 14px", borderRadius: 999, border: "none", color: active ? "#fff" : "#6B6B73", background: active ? "#0E0E10" : "#F5F4F0", cursor: "pointer" }}
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
          <div key={r.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)", padding: 18, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: DARK }}>{r.title}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.02em", color: "#6B6B73", background: "#F5F4F0", padding: "3px 9px", borderRadius: 999 }}>{r.category}</span>
              </div>
              {r.description && <div style={{ fontSize: 12.5, color: "#6B6B73", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</div>}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {(r.file_url || r.link_url) && (
                <a href={r.file_url || r.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "#9A958B", background: "none", border: "1.5px solid rgba(20,20,25,0.12)", borderRadius: 999, padding: "7px 14px", cursor: "pointer", textDecoration: "none" }}>View</a>
              )}
              <button onClick={() => setEditing(r)} style={{ fontSize: 12, fontWeight: 600, color: "#44444C", background: "none", border: "1.5px solid rgba(20,20,25,0.14)", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>Edit</button>
              <button onClick={() => remove(r.id)} style={{ fontSize: 12, fontWeight: 600, color: "#E23A2E", background: "none", border: "1.5px solid rgba(226,58,46,0.3)", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        ))}

        {loaded && filtered.length === 0 && (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "#9A958B", fontSize: 13, background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)" }}>
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
