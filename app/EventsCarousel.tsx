"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_COLORS, type EventCategory } from "./calendar/data";

// Shared by the homepage and the calendar so the two never drift apart.
// Deliberately image-free: every card's artwork is generated from its own
// category (tinted gradient + the category glyph), so an event looks
// finished the moment it's submitted, with no poster upload required.

const DARK = "#1A1714";
const ORANGE = "#F26522";
const FAINT = "#6E685F";

export const CARD_W = 268;
export const CARD_GAP = 18;
const CARD_STEP = CARD_W + CARD_GAP;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** The glyph that stands in for a photo, one per category. */
export const CATEGORY_GLYPHS: Record<EventCategory, string> = {
  Workshop: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  Webinar: "M15 10l4.553-2.277A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  "Demo Day": "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  Conference: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7 0a3 3 0 0 0 0-6M23 21v-2a4 4 0 0 0-3-3.87",
  Networking: "M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  Competition: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  Government: "M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85M9 21v-4a3 3 0 0 1 6 0v4",
  Other: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

export interface CarouselEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // ISO yyyy-mm-dd
  endDate?: string;
  time?: string;
  venue?: string;
  href: string;
  external?: boolean;
}

// Dates are split by hand rather than passed to `new Date(iso)`, which reads a
// bare yyyy-mm-dd as UTC midnight and can render as the previous local day.
function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m: m - 1, d };
}

function dateLabel(iso: string, endIso?: string) {
  const s = parts(iso);
  const base = `${MONTHS[s.m]} ${String(s.d).padStart(2, "0")}, ${s.y}`;
  if (!endIso || endIso === iso) return base;
  const e = parts(endIso);
  return s.m === e.m ? `${MONTHS[s.m]} ${String(s.d).padStart(2, "0")}–${String(e.d).padStart(2, "0")}, ${s.y}` : `${base} – ${MONTHS[e.m]} ${String(e.d).padStart(2, "0")}`;
}

function weekdayOf(iso: string) {
  const p = parts(iso);
  return WEEKDAYS[new Date(p.y, p.m, p.d).getDay()];
}

/** Cards fully visible in a strip this wide. The last one needs no trailing gap. */
function cardsPerPage(width: number) {
  return Math.max(1, Math.floor((width + CARD_GAP) / CARD_STEP));
}

function MetaLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12.5, color: "#5A544B", lineHeight: 1.45 }}>
      <span style={{ display: "flex", flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

export function EventCard({ e }: { e: CarouselEvent }) {
  const cc = CATEGORY_COLORS[e.category] ?? CATEGORY_COLORS.Other;
  const glyph = CATEGORY_GLYPHS[e.category] ?? CATEGORY_GLYPHS.Other;

  return (
    <article
      className="ib-cal-card"
      style={{
        flex: "0 0 auto",
        width: CARD_W,
        borderRadius: 18,
        border: `1px solid ${cc.color}24`,
        overflow: "hidden",
        scrollSnapAlign: "start",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
      }}
    >
      {/* Artwork block — generated from the category, never a photo. */}
      <div
        style={{
          position: "relative",
          padding: "18px 20px 24px",
          minHeight: 168,
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(158deg, ${cc.color}26 0%, ${cc.color}0D 52%, #FFFFFF 100%)`,
        }}
      >
        <svg
          aria-hidden="true"
          width={150}
          height={150}
          viewBox="0 0 24 24"
          fill="none"
          stroke={cc.color}
          strokeWidth={0.9}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "absolute", right: -26, bottom: -30, opacity: 0.18, pointerEvents: "none" }}
        >
          <path d={glyph} />
        </svg>

        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: cc.color, background: "rgba(255,255,255,0.8)", padding: "5px 10px", borderRadius: 9999 }}>
            {e.category}
          </span>
          <span
            aria-hidden="true"
            style={{ width: 36, height: 36, borderRadius: 9999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 4px rgba(17,17,20,0.10)" }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={cc.color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d={glyph} />
            </svg>
          </span>
        </div>

        <h3 style={{ position: "relative", margin: 0, fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: DARK, lineHeight: 1.24 }}>
          {e.title}
        </h3>
      </div>

      <div style={{ borderTop: `1px solid ${cc.color}1F`, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        <MetaLine icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={FAINT} strokeWidth={2} strokeLinecap="round"><rect x={3} y={4} width={18} height={17} rx={2} /><path d="M3 9h18M8 2v4M16 2v4" /></svg>}>
          {dateLabel(e.date, e.endDate)} &middot; {weekdayOf(e.date)}
        </MetaLine>
        {e.time && (
          <MetaLine icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={FAINT} strokeWidth={2} strokeLinecap="round"><circle cx={12} cy={12} r={9} /><path d="M12 7v5l3 2" /></svg>}>
            {e.time}
          </MetaLine>
        )}
        {e.venue && (
          <MetaLine icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={FAINT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx={12} cy={10} r={3} /></svg>}>
            {e.venue}
          </MetaLine>
        )}
      </div>

      <a
        href={e.href}
        {...(e.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "13px 20px",
          fontSize: 13,
          fontWeight: 600,
          color: cc.color,
          background: `${cc.color}0F`,
          borderTop: `1px solid ${cc.color}1F`,
          textDecoration: "none",
        }}
      >
        Learn more
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={cc.color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </a>
    </article>
  );
}

export default function EventsCarousel({
  events,
  heading,
  intro,
  ctaLabel,
  ctaHref,
  onCta,
  background = "#FCFAF6",
}: {
  events: CarouselEvent[];
  heading: React.ReactNode;
  intro: string;
  ctaLabel: string;
  ctaHref?: string;
  onCta?: () => void;
  background?: string;
}) {
  const scroller = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  function measure() {
    const el = scroller.current;
    if (!el) return;
    const per = cardsPerPage(el.clientWidth);
    setPages(Math.max(1, Math.ceil(events.length / per)));
    setPage(Math.round(el.scrollLeft / (per * CARD_STEP)));
  }

  useEffect(() => {
    measure();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length]);

  function nudge(dir: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * cardsPerPage(el.clientWidth) * CARD_STEP, behavior: "smooth" });
  }

  if (events.length === 0) return null;

  const atStart = page <= 0;
  const atEnd = page >= pages - 1;

  return (
    <div style={{ background }}>
      <div className="ib-evcar" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 34, alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(242,101,34,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={1.9} strokeLinecap="round"><rect x={3} y={4} width={18} height={17} rx={2} /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: ORANGE }}>
              Upcoming ecosystem events
            </span>
          </div>

          {heading}

          <p style={{ margin: "0 0 24px", fontSize: 14.5, lineHeight: 1.6, color: "#5A544B" }}>{intro}</p>

          {onCta ? (
            <button
              onClick={onCta}
              style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 14, fontWeight: 600, color: "#fff", background: DARK, border: "none", padding: "13px 24px", borderRadius: 9999, cursor: "pointer" }}
            >
              {ctaLabel}
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          ) : (
            <a
              href={ctaHref}
              style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 14, fontWeight: 600, color: "#fff", background: DARK, padding: "13px 24px", borderRadius: 9999, textDecoration: "none" }}
            >
              {ctaLabel}
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          )}
        </div>

        <div style={{ minWidth: 0 }}>
          {pages > 1 && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 16 }}>
              <button onClick={() => nudge(-1)} aria-label="Previous events" disabled={atStart} className="ib-evcar-arrow">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button onClick={() => nudge(1)} aria-label="More events" disabled={atEnd} className="ib-evcar-arrow">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          )}

          <div ref={scroller} className="ib-cal-scroller" style={{ display: "flex", gap: CARD_GAP, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4, alignItems: "stretch" }}>
            {events.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>

          {pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 18 }}>
              {Array.from({ length: pages }, (_, i) => (
                <span key={i} style={{ width: i === page ? 18 : 6, height: 6, borderRadius: 9999, background: i === page ? ORANGE : "rgba(64,50,34,0.18)", transition: "width .2s ease, background .2s ease" }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
