"use client";

import { useEffect, useState } from "react";
import { CARD, HAIR, ICONS, Icon, ORANGE, TEXT } from "./teams/ui";

export type Theme = "dark" | "light";

// Shared by the Team Finder and the registration form, so picking a theme on
// one carries to the other.
const THEME_KEY = "ib_teamfinder_theme";

export function useSiklabTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      if (localStorage.getItem(THEME_KEY) === "light") setTheme("light");
    } catch {
      // Storage blocked: stay on the default (dark) for this visit.
    }
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Not persisted; the switch still works for this visit.
    }
  }

  return { theme, toggle };
}

export function ThemeSwitch({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Dark mode"
      onClick={onToggle}
      style={{ display: "inline-flex", alignItems: "center", gap: 10, background: CARD, border: `1px solid ${HAIR}`, borderRadius: 9999, padding: "6px 8px 6px 14px", cursor: "pointer", color: TEXT, fontSize: 12.5, fontWeight: 600 }}
    >
      {theme === "dark" ? "Dark" : "Light"}
      <span style={{ position: "relative", width: 44, height: 24, borderRadius: 9999, background: theme === "dark" ? ORANGE : "var(--tf-track)", transition: "background 0.2s ease" }}>
        <span style={{ position: "absolute", top: 2, left: theme === "dark" ? 22 : 2, width: 20, height: 20, borderRadius: 9999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#1A1714", transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
          <Icon d={theme === "dark" ? ICONS.moon : ICONS.sun} size={12} />
        </span>
      </span>
    </button>
  );
}
