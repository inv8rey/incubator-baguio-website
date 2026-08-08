"use client";

const PROMPTS = [
  "What funding programmes can I apply for?",
  "Find mentors for my idea",
  "What challenges match my startup?",
  "Find potential collaborators",
];

export default function QuickActions({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 16px 14px" }}>
      {PROMPTS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPick(p)}
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 9999,
            padding: "7px 13px",
            cursor: "pointer",
          }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
