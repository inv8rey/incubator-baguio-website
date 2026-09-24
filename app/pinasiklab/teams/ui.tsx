"use client";

import type { CSSProperties, ReactNode } from "react";

// Brand accent from the PinaSIKLab poster: blue on the light theme, yellow on
// the dark theme (see the .ib-siklab-tf tokens in globals.css).
export const ORANGE = "var(--tf-accent)";
export const TEXT = "var(--tf-text)";
export const MUTED = "var(--tf-muted)";
export const CARD = "var(--tf-card)";
export const HAIR = "var(--tf-hair)";

export const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1.5px solid var(--tf-hair2)",
  fontSize: 14,
  color: TEXT,
  outline: "none",
  fontFamily: "inherit",
  background: "var(--tf-input)",
};
export const labelStyle: CSSProperties = { fontSize: 12.5, fontWeight: 600, color: "var(--tf-soft)", marginBottom: 6, display: "block" };

export const primaryBtn: CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: ORANGE, color: "var(--tf-on-accent)", border: "none",
  borderRadius: 9999, padding: "11px 20px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap",
};
export const ghostBtn: CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--tf-ghost)", color: TEXT, border: `1.5px solid ${HAIR}`,
  borderRadius: 9999, padding: "10px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap",
};
export const disabledBtn: CSSProperties = { ...ghostBtn, color: "var(--tf-dim)", background: "var(--tf-btnbg)", cursor: "default", border: "1.5px solid transparent" };

export function Chip({ children, tone = "neutral", small }: { children: ReactNode; tone?: "neutral" | "orange" | "green"; small?: boolean }) {
  const tones = {
    neutral: { bg: "var(--tf-fill)", color: "var(--tf-soft)", border: "transparent" },
    orange: { bg: "rgba(var(--tf-accent-rgb),0.08)", color: "var(--tf-orange-text)", border: "rgba(var(--tf-accent-rgb),0.28)" },
    green: { bg: "var(--tf-green-bg)", color: "var(--tf-green)", border: "var(--tf-green-line)" },
  }[tone];
  return (
    <span style={{ display: "inline-block", background: tones.bg, color: tones.color, border: `1px solid ${tones.border}`, borderRadius: 9999, padding: small ? "3px 9px" : "5px 12px", fontSize: small ? 11.5 : 12.5, fontWeight: 600, lineHeight: 1.3 }}>
      {children}
    </span>
  );
}

export function Modal({ title, onClose, children, width = 540 }: { title: string; onClose: () => void; children: ReactNode; width?: number }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: CARD, border: `1px solid ${HAIR}`, borderRadius: 20, padding: "28px 30px", width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: TEXT }}>{title}</div>
          <button onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "var(--tf-btnbg)", cursor: "pointer", fontSize: 18, color: "var(--tf-body)" }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Icon({ d, size = 15, color = "currentColor" }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} style={{ flexShrink: 0 }} />
  );
}

export const ICONS = {
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>',
  plus: '<path d="M12 5v14M5 12h14"></path>',
  check: '<path d="M20 6 9 17l-5-5"></path>',
  search: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>',
  sun: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
};
