"use client";

import { useEffect, useState } from "react";
import { DARK, ORANGE } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { uploadChatbotDocumentFile } from "../../../lib/uploadFile";

interface DocumentRow {
  id: string;
  title: string;
  original_filename: string;
  status: "pending" | "processing" | "ready" | "error";
  error_message: string;
  chunk_count: number;
  created_at: string;
}

const STATUS_STYLE: Record<DocumentRow["status"], { label: string; bg: string; fg: string }> = {
  pending: { label: "Pending", bg: "#F5F4F0", fg: "#5A544B" },
  processing: { label: "Processing…", bg: "rgba(242,101,34,0.12)", fg: ORANGE },
  ready: { label: "Ready", bg: "rgba(35,158,88,0.12)", fg: "#239E58" },
  error: { label: "Error", bg: "rgba(226,58,46,0.12)", fg: "#E23A2E" },
};

async function authedFetch(path: string, body: unknown): Promise<Response | null> {
  if (!supabase) return null;
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return null;
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

function triggerProcessing(documentId: string) {
  return authedFetch("/api/admin/chatbot-documents/process", { documentId });
}

export default function ChatbotKnowledgeTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const { data } = await supabase
      .from("chatbot_documents")
      .select("id,title,original_filename,status,error_message,chunk_count,created_at")
      .order("created_at", { ascending: false });
    setDocs((data as DocumentRow[]) ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel("admin-chatbot-documents-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "chatbot_documents" }, load)
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, []);

  const q = searchQuery.toLowerCase();
  const filtered = docs.filter((d) => !q || d.title.toLowerCase().includes(q) || d.original_filename.toLowerCase().includes(q));

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !supabase) return;
    setError("");
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const path = await uploadChatbotDocumentFile(file);
      const { data: row, error: insertErr } = await supabase
        .from("chatbot_documents")
        .insert({
          title: file.name.replace(/\.pdf$/i, ""),
          original_filename: file.name,
          storage_path: path,
          uploaded_by: userData.user?.id ?? null,
          status: "pending",
        })
        .select()
        .single();
      if (insertErr) throw new Error(insertErr.message);

      load();
      const res = await triggerProcessing(row.id);
      if (!res || !res.ok) {
        const data = await res?.json().catch(() => null);
        throw new Error(data?.error || "Couldn't start processing — try Retry below.");
      }
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      load();
    }
  }

  async function retry(id: string) {
    setError("");
    const res = await triggerProcessing(id);
    if (!res || !res.ok) {
      const data = await res?.json().catch(() => null);
      setError(data?.error || "Retry failed.");
    }
    load();
  }

  async function remove(doc: DocumentRow) {
    if (!supabase) return;
    if (!window.confirm(`Delete "${doc.title}" permanently? This can't be undone.`)) return;
    const { data: full } = await supabase.from("chatbot_documents").select("storage_path").eq("id", doc.id).single();
    if (full?.storage_path) {
      await supabase.storage.from("chatbot-documents").remove([full.storage_path]);
    }
    const { error: err } = await supabase.from("chatbot_documents").delete().eq("id", doc.id);
    if (err) return window.alert(err.message);
    load();
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(64,50,34,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12.5, color: "#8B8479", maxWidth: 460 }}>
          Private documents the chat assistant can search — never shown on the public site. PDF only, 15MB max.
        </div>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", background: uploading ? "#C9C6BE" : ORANGE, border: "none", borderRadius: 999, padding: "8px 16px", cursor: uploading ? "default" : "pointer", flexShrink: 0 }}>
          {uploading ? "Uploading…" : "+ Upload document"}
          <input type="file" accept="application/pdf" onChange={handleFileChange} disabled={uploading} style={{ display: "none" }} />
        </label>
      </div>

      {error && (
        <div style={{ fontSize: 12.5, color: "#E23A2E", background: "rgba(226,58,46,0.08)", border: "1.5px solid rgba(226,58,46,0.2)", borderRadius: 10, padding: "10px 14px" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((d) => {
          const s = STATUS_STYLE[d.status];
          return (
            <div key={d.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)", padding: 18, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: DARK }}>{d.title}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color: s.fg, background: s.bg, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {s.label}
                    {d.status === "ready" && d.chunk_count ? ` · ${d.chunk_count} chunks` : ""}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "#5A544B" }}>{d.original_filename}</div>
                {d.status === "error" && d.error_message && (
                  <div style={{ fontSize: 12, color: "#E23A2E", marginTop: 6 }}>{d.error_message}</div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {d.status === "error" && (
                  <button onClick={() => retry(d.id)} style={{ fontSize: 12, fontWeight: 600, color: "#44444C", background: "none", border: "1.5px solid rgba(64,50,34,0.14)", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>
                    Retry
                  </button>
                )}
                <button onClick={() => remove(d)} style={{ fontSize: 12, fontWeight: 600, color: "#E23A2E", background: "none", border: "1.5px solid rgba(226,58,46,0.3)", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {loaded && filtered.length === 0 && (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "#8B8479", fontSize: 13, background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)" }}>
            No documents yet.
          </div>
        )}
      </div>
    </div>
  );
}
