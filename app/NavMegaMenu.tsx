"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NAV_PILLARS } from "./programs/EcosystemModel";
import { KNOWLEDGE_CATEGORIES } from "./knowledge/data";
import type { EcosystemCategory } from "./ecosystem/data";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
// Generous close delay + zero visual gap between trigger and panel (see the
// panel's `top` below) — a shorter delay let the panel disappear mid-hover
// while moving the mouse down into it, so items could open but not actually
// be clicked.
const CLOSE_DELAY = 300;

// Deliberately curated shortlists, not the full category lists — typed
// against each section's real category union so a future rename there is
// a compile error here rather than a silently dead link.
const ECOSYSTEM_QUICK_LINKS: EcosystemCategory[] = ["Startups", "Mentors", "Makerspaces & Labs", "Funded Projects"];

interface MenuItem {
  title: string;
  href: string;
  theme?: string;
  featured?: boolean;
}

interface MenuConfig {
  key: string;
  match: (href: string) => boolean;
  items: MenuItem[];
}

// Content is sourced from each section's own data rather than duplicated
// here, so this menu can't drift out of sync the way app/about/page.tsx's
// old hardcoded copy of the Programs pillars once did.
const MENUS: MenuConfig[] = [
  {
    key: "programs",
    match: (href) => href.endsWith("/programs") || href.endsWith("/programs/"),
    items: [
      ...NAV_PILLARS,
      { title: "PinaSIKLab Baguio 2026", href: `${BP}/pinasiklab/`, theme: "Youth innovation sprint · Oct 30–31, 2026", featured: true },
    ],
  },
  {
    key: "challenges",
    match: (href) => href.endsWith("/challenges") || href.endsWith("/challenges/"),
    items: [
      { title: "Browse Challenges", href: `${BP}/challenges` },
      { title: "Post a Challenge", href: `${BP}/challenges/post` },
    ],
  },
  {
    key: "knowledge",
    match: (href) => href.endsWith("/knowledge") || href.endsWith("/knowledge/"),
    items: KNOWLEDGE_CATEGORIES.map((c) => ({ title: c.id, href: `${BP}/knowledge?category=${encodeURIComponent(c.id)}`, theme: c.description })),
  },
  {
    key: "ecosystem",
    match: (href) => href.endsWith("/ecosystem") || href.endsWith("/ecosystem/"),
    items: ECOSYSTEM_QUICK_LINKS.map((c) => ({ title: c, href: `${BP}/ecosystem?tab=${encodeURIComponent(c)}` })),
  },
];

/**
 * Hover mega-menu for the public nav's Programs/Challenges/Knowledge
 * Hub/Ecosystem links. The nav itself is a raw HTML string (app/chrome.ts),
 * and app/Interactive.tsx builds the mobile drawer by cloneNode()-ing that
 * markup wholesale — so, like AuthNav.tsx and HeaderSearch.tsx before it,
 * this component never inserts anything into the nav's own DOM. It only
 * attaches listeners to the existing `.ib-navlink` anchors and renders its
 * panel through a portal into document.body, positioned from the hovered
 * trigger's bounding rect. cloneNode() never copies JS listeners regardless,
 * so the mobile drawer stays exactly as it was.
 */
export default function NavMegaMenu() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenKey(null), CLOSE_DELAY);
  }

  useEffect(() => {
    const cleanups: (() => void)[] = [];

    document.querySelectorAll<HTMLAnchorElement>("a.ib-navlink").forEach((el) => {
      const menu = MENUS.find((m) => m.match(el.getAttribute("href") || ""));
      if (!menu) return;

      el.setAttribute("aria-haspopup", "true");
      el.setAttribute("aria-expanded", "false");

      const onOpen = () => {
        cancelClose();
        setRect(el.getBoundingClientRect());
        setOpenKey(menu.key);
        el.setAttribute("aria-expanded", "true");
      };
      const onLeave = () => {
        scheduleClose();
        el.setAttribute("aria-expanded", "false");
      };

      el.addEventListener("mouseenter", onOpen);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("focus", onOpen);
      el.addEventListener("blur", onLeave);
      cleanups.push(() => {
        el.removeEventListener("mouseenter", onOpen);
        el.removeEventListener("mouseleave", onLeave);
        el.removeEventListener("focus", onOpen);
        el.removeEventListener("blur", onLeave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  useEffect(() => {
    if (!openKey) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenKey(null);
    }
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenKey(null);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [openKey]);

  if (!openKey || !rect) return null;
  const menu = MENUS.find((m) => m.key === openKey);
  if (!menu) return null;

  const panelWidth = 300;
  const left = Math.max(12, Math.min(rect.left, window.innerWidth - panelWidth - 12));

  return createPortal(
    <div
      ref={panelRef}
      className="ib-megamenu-panel"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      style={{
        position: "fixed",
        // No gap to the trigger's bottom edge (was +8) — that dead zone is
        // exactly where the "can't click, panel already closed" bug came
        // from: the cursor spends time in a strip neither element owns, and
        // once it's outside both, only the close timer stands between it
        // and the panel vanishing. Butting them together plus paddingTop
        // below keeps the same visual gap without an actual pointer gap.
        top: rect.bottom,
        left,
        width: panelWidth,
        background: "#1C1917",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        padding: 10,
        paddingTop: 18,
        marginTop: -8,
        zIndex: 55,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {menu.items.map((item) => (
          <a
            key={item.href + item.title}
            href={item.href}
            className="ib-megamenu-item"
            style={item.featured ? { marginTop: 6, borderTop: "1px solid rgba(255,255,255,0.1)", borderTopLeftRadius: 0, borderTopRightRadius: 0 } : undefined}
          >
            <span className="ib-megamenu-item-title" style={item.featured ? { color: "#F26522" } : undefined}>{item.title}</span>
            {item.theme && <span className="ib-megamenu-item-theme">{item.theme}</span>}
          </a>
        ))}
      </div>
    </div>,
    document.body
  );
}
