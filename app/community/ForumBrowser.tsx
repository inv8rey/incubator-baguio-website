"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthProvider";
import { checkAccountRateLimit } from "../../lib/formGuard";
import { initialsOf, paletteFor } from "../../lib/visualIdentity";
import { fetchThreads, postThread, type ForumThread } from "./dynamicData";

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

export default function ForumBrowser({ bp }: { bp: string }) {
  const { user, profile } = useAuth();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function load() {
      fetchThreads().then((t) => {
        setThreads(t);
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
      .channel("public-forum-threads")
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_threads" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_replies" }, load)
      .subscribe();
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      supabase?.removeChannel(channel);
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    if (!title.trim() || !body.trim()) {
      setError("Add a title and a bit of detail.");
      return;
    }
    setBusy(true);
    setError("");
    const guard = await checkAccountRateLimit(user.id, "forum-thread", 10);
    if (!guard.ok) {
      setBusy(false);
      setError(guard.error || "Please try again later.");
      return;
    }
    try {
      const created = await postThread(profile, title, body);
      if (created) {
        window.location.href = `${bp}/community/${created.id}/`;
        return;
      }
      setBusy(false);
    } catch (err: any) {
      setBusy(false);
      setError(err?.message || "Couldn't post — please try again.");
    }
  }

  return (
    <div style={{ background: "#F6F2EA", padding: "48px 40px 64px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          {user && profile ? (
            composing ? (
              <form onSubmit={submit} style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What do you want to talk about?" maxLength={140} style={inputStyle} autoFocus />
                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add some detail..." rows={4} maxLength={4000} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
                {error && <p style={{ margin: 0, fontSize: 12.5, color: "#E23A2E" }}>{error}</p>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" disabled={busy} style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 999, padding: "10px 20px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}>
                    {busy ? "Posting…" : "Post discussion"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setComposing(false);
                      setError("");
                    }}
                    style={{ fontSize: 13.5, fontWeight: 600, color: MUTED, background: "none", border: "1.5px solid rgba(64,50,34,0.14)", borderRadius: 999, padding: "10px 20px", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setComposing(true)}
                style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 999, padding: "12px 22px", cursor: "pointer" }}
              >
                Start a discussion
              </button>
            )
          ) : (
            <a
              href={`${bp}/login/?redirect=${encodeURIComponent(`${bp}/community/`)}`}
              style={{ display: "inline-block", fontSize: 14, fontWeight: 600, color: "#fff", background: DARK, borderRadius: 999, padding: "12px 22px", textDecoration: "none" }}
            >
              Log in to start a discussion
            </a>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {threads.map((t) => (
            <a
              key={t.id}
              href={`${bp}/community/${t.id}/`}
              className="ib-card-hover"
              style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 16, padding: 22, textDecoration: "none" }}
            >
              <Avatar name={t.authorName} photoUrl={t.authorPhotoUrl} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 16.5, fontWeight: 600, color: DARK, lineHeight: 1.35 }}>{t.title}</h3>
                <p className="ib-line-clamp-3" style={{ margin: "0 0 10px", fontSize: 13.5, lineHeight: 1.55, color: BODY }}>{t.body}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: MUTED }}>
                  <span style={{ fontWeight: 600, color: "#5A544B" }}>{t.authorName}</span>
                  <span>&middot;</span>
                  <span>{timeAgo(t.createdAt)}</span>
                  <span>&middot;</span>
                  <span>{t.replyCount} repl{t.replyCount === 1 ? "y" : "ies"}</span>
                </div>
              </div>
            </a>
          ))}

          {loaded && threads.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: MUTED, fontSize: 14, background: "#fff", borderRadius: 18, border: "1px dashed rgba(64,50,34,0.14)" }}>
              No discussions yet — be the first to start one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
