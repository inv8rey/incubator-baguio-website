"use client";

import { DARK } from "./data";

export function StatCard({
  label,
  value,
  delta,
  note,
  compact = false,
}: {
  label: string;
  value: string;
  delta?: string | null;
  note?: string | null;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: compact ? 14 : 16,
        padding: compact ? "16px 18px" : "20px 22px",
        border: "1.5px solid rgba(64,50,34,0.12)",
      }}
    >
      <div style={{ fontSize: 11, color: "#6E685F", fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: compact ? 24 : 28, fontWeight: 600, color: DARK, letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </div>
      {(delta || note) && (
        <div style={{ fontSize: 11, fontWeight: delta ? 600 : 400, color: delta ? "#22C55E" : "#6E685F", marginTop: 5 }}>
          {delta || note}
        </div>
      )}
    </div>
  );
}
