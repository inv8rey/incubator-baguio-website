"use client";

import { useEffect, useMemo, useState } from "react";

// event_time is a free-text column, and typing into it by hand produced a mix
// of "8AM-5PM", "8:00 AM", "2pm" across rows. These helpers keep one written
// form -- "2:00 PM" or "2:00 PM – 5:00 PM" -- while still reading back the
// older hand-typed values so editing an existing event doesn't lose its time.

const EN_DASH = "–";

/** "14:00" -> "2:00 PM". Returns "" for anything that isn't 24h HH:MM. */
export function to12h(hhmm: string): string {
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return "";
  let h = Number(m[1]);
  const minutes = m[2];
  if (h > 23 || Number(minutes) > 59) return "";
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${minutes} ${suffix}`;
}

/** "8AM" / "2:30 pm" / "14:00" -> "14:00", for seeding <input type="time">. */
export function to24h(token: string): string {
  const m = token.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(?:([AaPp])\.?[Mm]?\.?)?$/);
  if (!m) return "";
  let h = Number(m[1]);
  const minutes = m[2] ?? "00";
  const meridiem = m[3]?.toLowerCase();
  if (Number(minutes) > 59) return "";
  if (meridiem === "p" && h < 12) h += 12;
  if (meridiem === "a" && h === 12) h = 0;
  if (h > 23) return "";
  return `${String(h).padStart(2, "0")}:${minutes}`;
}

export function composeTimeRange(start: string, end: string): string {
  const s = to12h(start);
  if (!s) return "";
  const e = to12h(end);
  return e ? `${s} ${EN_DASH} ${e}` : s;
}

/** Best-effort read of whatever is already stored, however it was written. */
export function parseTimeRange(value: string): { start: string; end: string } {
  const raw = value.trim();
  if (!raw) return { start: "", end: "" };
  const parts = raw
    .split(/\s*(?:[–—-]|\bto\b|\buntil\b)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);
  return { start: to24h(parts[0] ?? ""), end: to24h(parts[1] ?? "") };
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 9,
  border: "1.5px solid rgba(64,50,34,0.14)",
  fontSize: 13.5,
  color: "#1a1714",
  outline: "none",
  fontFamily: "inherit",
  background: "#fff",
};

/**
 * Start/end time pair. Emits the composed display string to the parent, and
 * only once the user actually picks something -- an existing value written in
 * some other format is left exactly as it was until then, so opening an event
 * to edit its venue can't silently wipe its time.
 */
export default function TimeRangePicker({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const initial = useMemo(() => parseTimeRange(value), [value]);
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) onChange(composeTimeRange(start, end));
  }, [start, end, touched, onChange]);

  const unreadable = !!value.trim() && !initial.start;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8 }}>
        <input
          type="time"
          aria-label="Start time"
          value={start}
          onChange={(e) => { setStart(e.target.value); setTouched(true); }}
          style={fieldStyle}
        />
        <span style={{ fontSize: 12.5, color: "#8B8479" }}>to</span>
        <input
          type="time"
          aria-label="End time"
          value={end}
          onChange={(e) => { setEnd(e.target.value); setTouched(true); }}
          disabled={!start}
          style={{ ...fieldStyle, opacity: start ? 1 : 0.55 }}
        />
      </div>
      {unreadable ? (
        <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#8B8479" }}>
          Currently saved as &ldquo;{value.trim()}&rdquo;. Pick a start time to replace it.
        </p>
      ) : (
        <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#8B8479" }}>
          {start ? `Shows as “${composeTimeRange(start, end)}”` : "Leave blank if the time isn’t set yet."}
        </p>
      )}
    </div>
  );
}
