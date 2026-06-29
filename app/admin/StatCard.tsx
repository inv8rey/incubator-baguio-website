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
        border: "1.5px solid rgba(20,20,25,0.09)",
      }}
    >
      <div style={{ fontSize: 11, color: "#9A958B", fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: compact ? 24 : 28, fontWeight: 700, color: DARK, letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </div>
      {(delta || note) && (
        <div style={{ fontSize: 11, fontWeight: delta ? 600 : 400, color: delta ? "#22C55E" : "#9A958B", marginTop: 5 }}>
          {delta || note}
        </div>
      )}
    </div>
  );
}
