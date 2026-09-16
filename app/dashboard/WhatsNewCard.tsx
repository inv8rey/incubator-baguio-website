"use client";

import { useEffect, useState } from "react";
import { cardStyle, DARK } from "./styles";
import { ACTIVITY_KIND_STYLE, fetchActivity, timeAgo, type ActivityItem } from "./notificationFeed";

/**
 * An always-on "recent activity" digest for the Dashboard Overview,
 * deliberately separate from the header bell's unread count. The bell marks
 * things "seen" the moment you open it, which is right for a dropdown you
 * had to deliberately click open -- but this card sits in the default view
 * of the page most people land on first, so auto-marking it "seen" on
 * mount would zero out the bell's badge before anyone actually read
 * anything. This just always shows the latest handful of items, full stop,
 * no read state to get out of sync.
 */
export default function WhatsNewCard() {
  const [items, setItems] = useState<ActivityItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchActivity(undefined, 5).then((all) => {
      if (!cancelled) setItems(all.slice(0, 5));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 15, fontWeight: 600, color: DARK, marginBottom: 14 }}>What&rsquo;s new</div>
      {items === null ? (
        <div style={{ fontSize: 12.5, color: "#6E685F" }}>Loading&hellip;</div>
      ) : items.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "#6E685F" }}>Nothing new across the platform just yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((it) => {
            const s = ACTIVITY_KIND_STYLE[it.kind];
            return (
              <a key={it.key} href={it.href} style={{ display: "flex", flexDirection: "column", gap: 3, textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: s.color, background: s.bg, padding: "2px 7px", borderRadius: 999, flexShrink: 0 }}>{it.kind}</span>
                  <span style={{ fontSize: 10.5, color: "#8A8378", marginLeft: "auto", flexShrink: 0 }}>{timeAgo(it.createdAt)}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: DARK, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
