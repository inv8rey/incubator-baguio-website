"use client";

import { paletteFor, initialsOf } from "../../lib/visualIdentity";
import type { ChatCard } from "./types";

const TYPE_LABEL: Record<ChatCard["type"], string> = {
  challenge: "Challenge",
  mentor: "Mentor",
  startup: "Startup",
  resource: "Resource",
};

export default function ResultCards({ cards }: { cards: ChatCard[] }) {
  if (!cards.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
      {cards.map((c) => {
        const { color, bg } = paletteFor(c.title || c.id);
        const isExternal = c.type === "resource" && /^https?:\/\//.test(c.href);
        return (
          <a
            key={`${c.type}-${c.id}`}
            href={c.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            style={{
              display: "flex",
              gap: 10,
              textDecoration: "none",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: bg,
                color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initialsOf(c.title || "?")}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#F26522" }}>
                  {TYPE_LABEL[c.type]}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 2 }}>{c.title}</div>
              {c.subtitle && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{c.subtitle}</div>}
              {c.reason && <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.4 }}>{c.reason}</div>}
            </div>
          </a>
        );
      })}
    </div>
  );
}
