"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthProvider";
import { supabase } from "../../lib/supabaseClient";
import { DARK } from "./styles";
import { ACTIVITY_KIND_STYLE, fetchActivity, timeAgo, type ActivityItem } from "./notificationFeed";

export default function NotificationBell() {
  const { user, profile, refreshProfile } = useAuth();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    // notifications_seen_at always has a value (defaults to now() at
    // signup/migration -- see 2026-09-16-dashboard-notifications.sql), so
    // there's no "never seen anything" case to special-case here.
    const since = profile?.notifications_seen_at;
    if (!since) return;
    fetchActivity(since, 20).then((all) => {
      if (cancelled) return;
      setItems(all);
      setUnread(all.length);
    });
    return () => {
      cancelled = true;
    };
  }, [user, profile?.notifications_seen_at]);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      // Persisted server-side (not localStorage) so "caught up" survives a
      // different browser or device instead of resetting to "nothing seen
      // yet" -- see the migration comment for why that mattered.
      if (supabase && user) {
        await supabase.from("profiles").update({ notifications_seen_at: new Date().toISOString() }).eq("id", user.id);
        refreshProfile();
      }
    }
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
            <div style={{ padding: "28px 18px", textAlign: "center", fontSize: 12.5, color: "#6E685F" }}>You&rsquo;re all caught up.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {items.map((it) => {
                const s = ACTIVITY_KIND_STYLE[it.kind];
                return (
                  <a
                    key={it.key}
                    href={it.href}
                    style={{ display: "flex", flexDirection: "column", gap: 4, padding: "12px 18px", borderBottom: "1px solid rgba(64,50,34,0.06)", textDecoration: "none" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: s.color, background: s.bg, padding: "2px 8px", borderRadius: 999, flexShrink: 0 }}>{it.kind}</span>
                      <span style={{ fontSize: 11, color: "#6E685F", marginLeft: "auto", flexShrink: 0 }}>{timeAgo(it.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: DARK, lineHeight: 1.35 }}>{it.title}</div>
                    <div style={{ fontSize: 11.5, color: "#6E685F" }}>{it.tag}</div>
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
