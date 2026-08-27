"use client";

import { useState } from "react";
import { inputStyle, ORANGE, DARK } from "./styles";

// Small reusable "pick from suggestions, or type your own" tag control.
// Shared by the organization profile editor and the personal profile editor
// (Areas of Interest / Skills / Looking For / Can Offer) -- both are
// free-form text[] columns, so anything not in the suggestion list is still
// allowed via the text input.
export default function TagChips({
  value,
  onChange,
  suggestions,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions: readonly string[];
}) {
  const [draft, setDraft] = useState("");

  function toggle(tag: string) {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);
  }
  function addCustom() {
    const t = draft.trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    setDraft("");
  }

  const custom = value.filter((v) => !suggestions.includes(v));

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {suggestions.map((s) => {
          const active = value.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 999,
                border: active ? `1.5px solid ${ORANGE}` : "1.5px solid rgba(64,50,34,0.14)",
                color: active ? ORANGE : "#5A544B",
                background: active ? "rgba(242,101,34,0.08)" : "#fff",
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          );
        })}
        {custom.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => toggle(c)}
            style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 999, border: `1.5px solid ${ORANGE}`, color: ORANGE, background: "rgba(242,101,34,0.08)", cursor: "pointer" }}
          >
            {c} &times;
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Add your own…"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button type="button" onClick={addCustom} style={{ fontSize: 12.5, fontWeight: 600, color: DARK, background: "#F6F2EA", border: "1.5px solid rgba(64,50,34,0.14)", borderRadius: 10, padding: "0 16px", cursor: "pointer" }}>
          Add
        </button>
      </div>
    </div>
  );
}
