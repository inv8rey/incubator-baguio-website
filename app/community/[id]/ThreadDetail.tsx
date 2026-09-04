"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../AuthProvider";
import { checkAccountRateLimit } from "../../../lib/formGuard";
import { initialsOf, paletteFor } from "../../../lib/visualIdentity";
import {
  deleteReply,
  deleteThread,
  fetchReplies,
  fetchThreadById,
  postReply,
  reportContent,
  type ForumReply,
  type ForumThread,
} from "../dynamicData";

const DARK = "#1A1714";
const ORANGE = "#F26522";
const BODY = "#44444C";
const MUTED = "#8B8479";

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontSize: 14.5,
  color: DARK,
  background: "#F6F2EA",
  border: "1px solid rgba(64,50,34,0.14)",
  borderRadius: 10,
  padding: "12px 14px",
  outline: "none",
  fontFamily: "inherit",
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Avatar({ name, photoUrl, size = 40 }: { name: string; photoUrl?: string; size?: number }) {
  if (photoUrl) {
    return <img src={photoUrl} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  }
  const p = paletteFor(name);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.36, fontWeight: 600, flexShrink: 0 }}>
      {initialsOf(name)}
    </div>
  );
}

interface ReportTarget {
  type: "thread" | "reply";
  id: string;
  preview: string;
}

export default function ThreadDetail({ threadId, bp }: { threadId: string; bp: string }) {
  const { user, profile } = useAuth();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    function load() {
      Promise.all([fetchThreadById(threadId), fetchReplies(threadId)]).then(([t, r]) => {
        setThread(t);
        setReplies(r);
        setLoaded(true);
      });
    }
    load();
    function onVisible() {
      if (document.visibilityState === "visible") load();
    }
    document.addEventListener("visibilitychange", onVisible);
    if (!supabase) return () => document.removeEventListener("visibilitychange", onVisible);
    const channel = supabase
      .channel(`forum-thread-${threadId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_replies", filter: `thread_id=eq.${threadId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_threads", filter: `id=eq.${threadId}` }, load)
      .subscribe();
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      supabase?.removeChannel(channel);
    };
  }, [threadId]);

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    if (!replyBody.trim()) return;
    setBusy(true);
    setError("");
    const guard = await checkAccountRateLimit(user.id, "forum-reply", 20);
    if (!guard.ok) {
      setBusy(false);
      setError(guard.error || "Please try again later.");
      return;
    }
    try {
      await postReply(profile, threadId, replyBody);
      setReplyBody("");
      const r = await fetchReplies(threadId);
      setReplies(r);
    } catch (err: any) {
      setError(err?.message || "Couldn't post your reply — please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !reportTarget) return;
    setBusy(true);
    setError("");
    try {
      await reportContent(user.id, reportTarget.type, reportTarget.id, threadId, reportTarget.preview, reportReason);
      setReportSent(true);
    } catch (err: any) {
      setError(err?.message || "Couldn't send the report — please try again.");
    } finally {
      setBusy(false);
    }
  }

  function closeReport() {
    setReportTarget(null);
    setReportReason("");
    setReportSent(false);
    setError("");
  }

  async function removeThread() {
    if (!window.confirm("Delete this discussion and all its replies? This can't be undone.")) return;
    await deleteThread(threadId);
    window.location.href = `${bp}/community/`;
  }

  async function removeReply(id: string) {
    if (!window.confirm("Delete this reply? This can't be undone.")) return;
    await deleteReply(id);
    setReplies((prev) => prev.filter((r) => r.id !== id));
  }

  if (loaded && !thread) {
    return (
      <div style={{ background: "#F6F2EA", padding: "48px 40px 64px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center", color: MUTED, fontSize: 14 }}>
          This discussion doesn&rsquo;t exist or was removed.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F6F2EA", padding: "40px 40px 64px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        {thread && (
          <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.07)", boxShadow: "var(--ib-shadow-sm)", borderRadius: 20, padding: 26 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
              <Avatar name={thread.authorName} photoUrl={thread.authorPhotoUrl} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 600, color: DARK, letterSpacing: "-0.01em" }}>{thread.title}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: MUTED }}>
                  <span style={{ fontWeight: 600, color: "#5A544B" }}>{thread.authorName}</span>
                  <span>&middot;</span>
                  <span>{timeAgo(thread.createdAt)}</span>
                </div>
              </div>
              {user?.id === thread.authorId && (
                <button onClick={removeThread} style={{ fontSize: 12, fontWeight: 600, color: "#8B8479", background: "none", border: "1.5px solid rgba(64,50,34,0.14)", borderRadius: 999, padding: "6px 12px", cursor: "pointer", flexShrink: 0 }}>
                  Delete
                </button>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: BODY, whiteSpace: "pre-wrap" }}>{thread.body}</p>
            {user && user.id !== thread.authorId && (
              <button
                onClick={() => setReportTarget({ type: "thread", id: thread.id, preview: `${thread.title}\n\n${thread.body}` })}
                style={{ marginTop: 16, fontSize: 12, fontWeight: 500, color: MUTED, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Report
              </button>
            )}
          </div>
        )}

        <div style={{ fontSize: 13, fontWeight: 600, color: DARK, marginTop: 8 }}>
          {replies.length} repl{replies.length === 1 ? "y" : "ies"}
        </div>

        {replies.map((r) => (
          <div key={r.id} style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.07)", boxShadow: "var(--ib-shadow-sm)", borderRadius: 18, padding: 20 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Avatar name={r.authorName} photoUrl={r.authorPhotoUrl} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: MUTED, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: "#5A544B" }}>{r.authorName}</span>
                  <span>&middot;</span>
                  <span>{timeAgo(r.createdAt)}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: BODY, whiteSpace: "pre-wrap" }}>{r.body}</p>
                <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
                  {user?.id === r.authorId ? (
                    <button onClick={() => removeReply(r.id)} style={{ fontSize: 11.5, fontWeight: 500, color: MUTED, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      Delete
                    </button>
                  ) : (
                    user && (
                      <button
                        onClick={() => setReportTarget({ type: "reply", id: r.id, preview: r.body })}
                        style={{ fontSize: 11.5, fontWeight: 500, color: MUTED, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        Report
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {user && profile ? (
          <form onSubmit={submitReply} style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.07)", boxShadow: "var(--ib-shadow-sm)", borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Add a reply..." rows={3} maxLength={4000} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
            {error && <p style={{ margin: 0, fontSize: 12.5, color: "#E23A2E" }}>{error}</p>}
            <button
              type="submit"
              disabled={busy || !replyBody.trim()}
              style={{ alignSelf: "flex-start", fontSize: 13.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 999, padding: "10px 20px", cursor: busy ? "default" : "pointer", opacity: busy || !replyBody.trim() ? 0.6 : 1 }}
            >
              {busy ? "Posting…" : "Reply"}
            </button>
          </form>
        ) : (
          <a
            href={`${bp}/login/?redirect=${encodeURIComponent(`${bp}/community/${threadId}/`)}`}
            style={{ display: "inline-block", fontSize: 13.5, fontWeight: 600, color: "#fff", background: DARK, borderRadius: 999, padding: "10px 20px", textDecoration: "none", alignSelf: "flex-start" }}
          >
            Log in to reply
          </a>
        )}
      </div>

      {reportTarget && (
        <div onClick={closeReport} style={{ position: "fixed", inset: 0, background: "rgba(15,15,17,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 26, width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 600, color: DARK }}>Report this {reportTarget.type}</h3>
              <button onClick={closeReport} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: MUTED, lineHeight: 1 }}>×</button>
            </div>
            {reportSent ? (
              <p style={{ margin: 0, fontSize: 13.5, color: "#1A6B3C" }}>Thanks — our team will take a look.</p>
            ) : (
              <form onSubmit={submitReport} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ margin: 0, fontSize: 12.5, color: MUTED }}>Let us know what&rsquo;s wrong with this post. Reports are reviewed by the Incubator Baguio team.</p>
                <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="What's the issue? (optional)" rows={3} maxLength={500} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
                {error && <p style={{ margin: 0, fontSize: 12.5, color: "#E23A2E" }}>{error}</p>}
                <button type="submit" disabled={busy} style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", background: "#E23A2E", border: "none", borderRadius: 999, padding: "10px 20px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, alignSelf: "flex-start" }}>
                  {busy ? "Sending…" : "Send report"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
