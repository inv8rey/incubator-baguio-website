"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthProvider";
import { checkAccountRateLimit } from "../../lib/formGuard";
import { initialsOf, paletteFor } from "../../lib/visualIdentity";
import { displayNameOf, fetchThreads, postThread, type ForumThread } from "./dynamicData";

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
  borderRadius: 12,
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

function ChatIcon({ color }: { color: string }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function ForumBrowser({ bp }: { bp: string }) {
  const { user, profile } = useAuth();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [query, setQuery] = useState("");
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => `${t.title} ${t.body} ${t.authorName}`.toLowerCase().includes(q));
  }, [threads, query]);

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

  const firstName = profile ? displayNameOf(profile).split(" ")[0] : "";

  return (
    <div style={{ background: "#F6F2EA", padding: "48px 40px 64px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* COMPOSER — a social-feed "what's on your mind" box, not a plain button */}
        {user && profile ? (
          <div style={{ background: "#fff", borderRadius: 20, padding: composing ? 22 : 10, boxShadow: "var(--ib-shadow-sm)", border: "1px solid rgba(64,50,34,0.08)" }}>
            {composing ? (
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Avatar name={displayNameOf(profile)} photoUrl={profile.photo_url} size={38} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What do you want to talk about?" maxLength={140} style={{ ...inputStyle, fontWeight: 600 }} autoFocus />
                    <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add some detail..." rows={4} maxLength={4000} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
                  </div>
                </div>
                {error && <p style={{ margin: 0, fontSize: 12.5, color: "#E23A2E" }}>{error}</p>}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
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
                  <button type="submit" disabled={busy} style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 999, padding: "10px 22px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}>
                    {busy ? "Posting…" : "Post"}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setComposing(true)}
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "none", border: "none", cursor: "pointer", padding: "6px 8px", textAlign: "left" }}
              >
                <Avatar name={displayNameOf(profile)} photoUrl={profile.photo_url} size={38} />
                <span style={{ flex: 1, fontSize: 14, color: MUTED, background: "#F6F2EA", borderRadius: 999, padding: "11px 18px" }}>
                  What&rsquo;s on your mind, {firstName}?
                </span>
              </button>
            )}
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 20, padding: 22, boxShadow: "var(--ib-shadow-sm)", border: "1px solid rgba(64,50,34,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, color: BODY }}>Have something to ask or share?</span>
            <a
              href={`${bp}/login/?redirect=${encodeURIComponent(`${bp}/community/`)}`}
              style={{ display: "inline-block", fontSize: 13.5, fontWeight: 600, color: "#fff", background: DARK, borderRadius: 999, padding: "10px 20px", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Log in to post
            </a>
          </div>
        )}

        {/* SEARCH */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B8479" strokeWidth={2} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search discussions..."
              style={{ width: "100%", boxSizing: "border-box", fontSize: 13.5, color: DARK, background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 999, padding: "11px 16px 11px 40px", outline: "none" }}
            />
          </div>
          <span style={{ fontSize: 12.5, color: MUTED, whiteSpace: "nowrap" }}>
            {filtered.length} discussion{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* FEED */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((t) => {
            const isNew = Date.now() - new Date(t.createdAt).getTime() < 3600_000;
            return (
              <a
                key={t.id}
                href={`${bp}/community/${t.id}/`}
                className="ib-card-hover"
                style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#fff", borderRadius: 20, padding: 22, textDecoration: "none", boxShadow: "var(--ib-shadow-sm)", border: "1px solid rgba(64,50,34,0.07)" }}
              >
                <Avatar name={t.authorName} photoUrl={t.authorPhotoUrl} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#5A544B" }}>{t.authorName}</span>
                    <span style={{ fontSize: 11.5, color: MUTED }}>{timeAgo(t.createdAt)}</span>
                    {isNew && (
                      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: ORANGE, background: "rgba(242,101,34,0.12)", padding: "2px 8px", borderRadius: 999 }}>New</span>
                    )}
                  </div>
                  <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 600, color: DARK, lineHeight: 1.35 }}>{t.title}</h3>
                  <p className="ib-line-clamp-3" style={{ margin: "0 0 12px", fontSize: 13.5, lineHeight: 1.55, color: BODY }}>{t.body}</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: MUTED, background: "#F6F2EA", borderRadius: 999, padding: "5px 12px" }}>
                    <ChatIcon color="#8B8479" />
                    {t.replyCount} repl{t.replyCount === 1 ? "y" : "ies"}
                  </div>
                </div>
              </a>
            );
          })}

          {loaded && filtered.length === 0 && threads.length > 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: MUTED, fontSize: 14, background: "#fff", borderRadius: 20, border: "1px dashed rgba(64,50,34,0.14)" }}>
              No discussions match &ldquo;{query}&rdquo;.
            </div>
          )}

          {loaded && threads.length === 0 && (
            <div style={{ padding: "48px 20px", textAlign: "center", color: MUTED, fontSize: 14, background: "#fff", borderRadius: 20, border: "1px dashed rgba(64,50,34,0.14)" }}>
              No discussions yet — be the first to start one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
