"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { slugify } from "../../lib/slug";
import { DARK } from "./styles";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
const LAST_SEEN_KEY = "ib-dashboard-last-seen";

type Kind = "Challenge" | "Resource" | "Event";

const KIND_STYLE: Record<Kind, { color: string; bg: string }> = {
  Challenge: { color: "#D9531E", bg: "rgba(217,83,30,0.12)" },
  Resource: { color: "#285E7A", bg: "rgba(40,94,122,0.12)" },
  Event: { color: "#6B5BD6", bg: "rgba(107,91,214,0.12)" },
};

interface NotificationItem {
  key: string;
  kind: Kind;
  title: string;
  tag: string;
  href: string;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function readLastSeen(): string {
  try {
    const stored = localStorage.getItem(LAST_SEEN_KEY);
    if (stored) return stored;
  } catch {
    // localStorage unavailable — fall through to "seen everything up to now"
    // below, same as a genuine first visit.
  }
  // First-ever visit (or storage blocked): nothing has been "seen" yet, but
  // showing every challenge/resource/event ever posted as a wall of
  // notifications would be a bad first impression. Baseline to now instead —
  // only content posted *after* this visit will ever show up as new.
  const now = new Date().toISOString();
  try {
    localStorage.setItem(LAST_SEEN_KEY, now);
  } catch {}
  return now;
}

function markSeen() {
  try {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
  } catch {}
}

export default function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    async function load() {
      const lastSeen = readLastSeen();
      const [{ data: challengeRows }, { data: resourceRows }, { data: eventRows }] = await Promise.all([
        supabase!.from("challenges").select("id,title,category,created_at").gte("created_at", lastSeen).order("created_at", { ascending: false }).limit(20),
        supabase!.from("knowledge_resources").select("id,title,category,created_at").gte("created_at", lastSeen).order("created_at", { ascending: false }).limit(20),
        supabase!.from("public_events").select("id,title,category,created_at").gte("created_at", lastSeen).order("created_at", { ascending: false }).limit(20),
      ]);
      if (cancelled) return;

      const challengeItems: NotificationItem[] = (challengeRows ?? []).map((c: any) => ({
        key: `challenge-${c.id}`,
        kind: "Challenge",
        title: c.title,
        tag: c.category || "Challenge",
        href: `${BP}/challenges/${slugify(c.title || c.id)}/`,
        createdAt: c.created_at,
      }));
      const resourceItems: NotificationItem[] = (resourceRows ?? []).map((r: any) => ({
        key: `resource-${r.id}`,
        kind: "Resource",
        title: r.title,
        tag: r.category || "Knowledge Hub",
        href: `${BP}/knowledge/`,
        createdAt: r.created_at,
      }));
      const eventItems: NotificationItem[] = (eventRows ?? []).map((e: any) => ({
        key: `event-${e.id}`,
        kind: "Event",
        title: e.title,
        tag: e.category || "Event",
        href: `${BP}/calendar/`,
        createdAt: e.created_at,
      }));

      const all = [...challengeItems, ...resourceItems, ...eventItems].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setItems(all);
      setUnread(all.length);
    }

    load();
  }, []);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  function toggle() {
    setOpen((v) => {
      const next = !v;
      if (next) {
        markSeen();
        setUnread(0);
      }
      return next;
    });
  }

  if (!supabase) return null;

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        aria-expanded={open}
        style={{
          position: "relative",
          width: 38,
          height: 38,
          borderRadius: 9999,
          background: "#fff",
          border: "1.5px solid rgba(64,50,34,0.13)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              minWidth: 17,
              height: 17,
              borderRadius: 9999,
              background: "#F26522",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              border: "1.5px solid #fff",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{
            position: "absolute",
            top: 46,
            right: 0,
            width: 340,
            maxHeight: 420,
            overflowY: "auto",
            background: "#fff",
            border: "1px solid rgba(64,50,34,0.13)",
            borderRadius: 16,
            boxShadow: "0 20px 44px -14px rgba(0,0,0,0.22)",
            zIndex: 50,
          }}
        >
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(64,50,34,0.08)", fontSize: 13.5, fontWeight: 600, color: DARK }}>
            What&rsquo;s new
          </div>
          {items.length === 0 ? (
            <div style={{ padding: "28px 18px", textAlign: "center", fontSize: 12.5, color: "#8B8479" }}>You&rsquo;re all caught up.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {items.map((it) => {
                const s = KIND_STYLE[it.kind];
                return (
                  <a
                    key={it.key}
                    href={it.href}
                    style={{ display: "flex", flexDirection: "column", gap: 4, padding: "12px 18px", borderBottom: "1px solid rgba(64,50,34,0.06)", textDecoration: "none" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: s.color, background: s.bg, padding: "2px 8px", borderRadius: 999, flexShrink: 0 }}>{it.kind}</span>
                      <span style={{ fontSize: 11, color: "#8B8479", marginLeft: "auto", flexShrink: 0 }}>{timeAgo(it.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: DARK, lineHeight: 1.35 }}>{it.title}</div>
                    <div style={{ fontSize: 11.5, color: "#8B8479" }}>{it.tag}</div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
