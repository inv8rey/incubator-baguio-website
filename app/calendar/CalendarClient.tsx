"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { supabase } from "../../lib/supabaseClient";
import { checkFormGuard, honeypotProps } from "../../lib/formGuard";
import { uploadEventSubmissionPoster } from "../../lib/uploadLogo";
import TimeRangePicker from "./TimeRangePicker";
import {
  CATEGORY_COLORS,
  DARK,
  EVENTS,
  EVENT_FORMATS,
  MENTOR_EXPERTISE_COLORS,
  MENTOR_FORMATS,
  MENTOR_SLOTS,
  ORANGE,
  ORGANIZER_TYPES,
  TODAY,
  type CityEvent,
  type EventCategory,
  type EventFormat,
  type MentorSlot,
  type OrganizerType,
} from "./data";

const HAIRLINE = "rgba(64,50,34,0.10)";
const CARD_W = 268;
const CARD_GAP = 18;
const CARD_STEP = CARD_W + CARD_GAP;
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CATEGORIES = Object.keys(CATEGORY_COLORS) as EventCategory[];
const MENTOR_EXPERTISE_LIST = Object.keys(MENTOR_EXPERTISE_COLORS) as (keyof typeof MENTOR_EXPERTISE_COLORS)[];
const VIEWS = ["Month", "Week", "Agenda"] as const;
type View = (typeof VIEWS)[number];
type CalMode = "events" | "mentoring";

function isoOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function eventsOnDay(date: Date, list: CityEvent[]) {
  const iso = isoOf(date);
  return list.filter((e) => (e.endDate ? iso >= e.date && iso <= e.endDate : e.date === iso));
}

function mapEventRow(r: any): CityEvent {
  return {
    id: r.id,
    date: r.event_date,
    endDate: r.end_date || undefined,
    title: r.title,
    category: (r.category as EventCategory) || "Other",
    time: r.event_time,
    venue: r.venue,
    org: r.org,
    orgType: (r.org_type as OrganizerType) || "Community Partners",
    format: (r.format as EventFormat) || "In-Person",
    // "Register" was the old default and is stored on existing rows, so it's
    // remapped rather than just changing the fallback. A genuinely custom
    // label the admin typed (RSVP, Join online, ...) still comes through.
    cta: !r.cta || r.cta === "Register" ? "View Event" : r.cta,
    registrationLink: r.registration_link || undefined,
    posterUrl: r.poster_url || undefined,
  };
}

function slotsOnDay(date: Date) {
  const iso = isoOf(date);
  return MENTOR_SLOTS.filter((s) => s.date === iso);
}

function startOfWeek(d: Date) {
  const out = new Date(d);
  out.setDate(out.getDate() - out.getDay());
  return out;
}

function formatLong(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

const selectStyle: React.CSSProperties = {
  appearance: "none",
  fontSize: 13,
  fontWeight: 600,
  color: "#44444C",
  background: "#fff",
  border: "1.5px solid rgba(64,50,34,0.14)",
  borderRadius: 9999,
  padding: "10px 30px 10px 16px",
  cursor: "pointer",
  outline: "none",
};

function Select({ value, onChange, options, allLabel }: { value: string | null; onChange: (v: string | null) => void; options: string[]; allLabel: string }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} style={selectStyle}>
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#8B8479" strokeWidth={2.4} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

interface DayCell { date: Date; inMonth: boolean }
interface ChipData { key: string; label: string; time: string; color: string; bg: string }

function DayChip({ data, compact }: { data: ChipData; compact?: boolean }) {
  return (
    <div className="ib-events-chip" style={{ display: "flex", alignItems: "stretch", gap: 5, minWidth: 0, background: data.bg, borderRadius: 6, padding: "3px 6px 3px 5px", overflow: "hidden" }}>
      <span className="ib-events-chip-bar" style={{ width: 3, minHeight: 14, flexShrink: 0, borderRadius: 9999, background: data.color }} />
      {/* Month cells are only ~130px wide, so a single nowrap line truncates
          after a word or two ("Desig…"). Two clamped lines make the title
          actually readable, and the time is left to the wider Week view and
          the day panel rather than eating the chip. */}
      <span
        className="ib-events-chip-text"
        style={{
          minWidth: 0,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
          fontSize: compact ? 10.5 : 11,
          fontWeight: 500,
          lineHeight: 1.35,
          color: data.color,
        }}
      >
        {!compact && data.time ? <span style={{ opacity: 0.7, marginRight: 5 }}>{data.time}</span> : null}
        {data.label}
      </span>
    </div>
  );
}

const CATEGORY_COVER_PATTERNS: Record<EventCategory, string> = {
  Workshop: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  Webinar: "M15 10l4.553-2.277A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  "Demo Day": "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  Conference: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7 0a3 3 0 0 0 0-6M23 21v-2a4 4 0 0 0-3-3.87",
  Networking: "M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  Competition: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  Government: "M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85M9 21v-4a3 3 0 0 1 6 0v4",
  Other: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

function shortDate(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${String(d).padStart(2, "0")}`;
}

/** "Aug 14", or "Aug 14–16" / "Aug 30 – Sep 02" for a multi-day run. */
function dateRangeLabel(start: string, end?: string) {
  if (!end || end === start) return shortDate(start);
  const [, sm] = start.split("-").map(Number);
  const [, em, ed] = end.split("-").map(Number);
  return sm === em ? `${shortDate(start)}–${String(ed).padStart(2, "0")}` : `${shortDate(start)} – ${shortDate(end)}`;
}

// ---------------------------------------------------------------------------
// Upcoming-events carousel shown above the calendar. Deliberately image-free:
// every card's artwork is generated from the event's own category (colour +
// the same outline glyph the agenda rows use), so a newly submitted event
// looks finished without anyone having to upload a poster.
// ---------------------------------------------------------------------------

// How many cards are FULLY visible in a strip of the given width. The last
// card on a row needs no gap after it, so the available width is measured
// with one extra gap added back.
function cardsPerPage(width: number) {
  return Math.max(1, Math.floor((width + CARD_GAP) / CARD_STEP));
}

function weekdayOf(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

function MetaLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, color: "#5A544B", lineHeight: 1.45 }}>
      <span style={{ display: "flex", flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function UpcomingEventsCarousel({ events, onOpenAll }: { events: CityEvent[]; onOpenAll: () => void }) {
  const scroller = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  // Page count is derived from measured widths rather than a fixed card count,
  // so it stays right when the viewport changes the number of visible cards.
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
    const per = cardsPerPage(el.clientWidth);
    el.scrollBy({ left: dir * per * CARD_STEP, behavior: "smooth" });
  }

  if (events.length === 0) return null;

  return (
    <div className="ib-cal-hero" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 28, alignItems: "center", marginBottom: 30 }}>
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>
          Upcoming ecosystem events
        </div>
        <h1 style={{ margin: "0 0 12px", fontSize: 31, fontWeight: 600, letterSpacing: "-0.028em", color: DARK, lineHeight: 1.14 }}>
          What&rsquo;s happening in our ecosystem
        </h1>
        <p style={{ margin: "0 0 22px", fontSize: 14.5, lineHeight: 1.6, color: "#5A544B" }}>
          Join workshops, networking sessions, and mentoring opportunities.
        </p>
        <button
          onClick={onOpenAll}
          style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 14, fontWeight: 600, color: "#fff", background: DARK, border: "none", padding: "13px 24px", borderRadius: 9999, cursor: "pointer" }}
        >
          View all events
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>

      <div style={{ position: "relative", minWidth: 0 }}>
        <div
          ref={scroller}
          className="ib-cal-scroller"
          style={{ display: "flex", gap: 18, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4 }}
        >
          {events.map((e) => {
            const cc = CATEGORY_COLORS[e.category];
            return (
              <article
                key={e.id}
                className="ib-cal-card"
                style={{
                  position: "relative",
                  flex: "0 0 auto",
                  width: CARD_W,
                  minHeight: 286,
                  borderRadius: 20,
                  border: `1px solid ${cc.color}26`,
                  overflow: "hidden",
                  scrollSnapAlign: "start",
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                  background: `linear-gradient(158deg, ${cc.color}1F 0%, ${cc.color}0A 46%, #FFFFFF 100%)`,
                }}
              >
                {/* Generated artwork — the category glyph, oversized and faint,
                    bled off the bottom-right corner in place of a photo. */}
                <svg
                  aria-hidden="true"
                  width={190}
                  height={190}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={cc.color}
                  strokeWidth={0.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ position: "absolute", right: -34, bottom: -34, opacity: 0.16, pointerEvents: "none" }}
                >
                  <path d={CATEGORY_COVER_PATTERNS[e.category]} />
                </svg>

                <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: cc.color, background: "rgba(255,255,255,0.75)", padding: "5px 11px", borderRadius: 9999 }}>
                    {e.category}
                  </span>
                  {e.registrationLink ? (
                    <a
                      href={e.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${e.title}`}
                      style={{ width: 34, height: 34, borderRadius: 9999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, textDecoration: "none", boxShadow: "0 1px 3px rgba(17,17,20,0.10)" }}
                    >
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>
                    </a>
                  ) : null}
                </div>

                <h3 style={{ position: "relative", margin: "0 0 18px", fontSize: 21, fontWeight: 600, letterSpacing: "-0.02em", color: DARK, lineHeight: 1.22 }}>
                  {e.title}
                </h3>

                <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 9, marginTop: "auto" }}>
                  <MetaLine icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#8B8479" strokeWidth={2} strokeLinecap="round"><rect x={3} y={4} width={18} height={17} rx={2} /><path d="M3 9h18M8 2v4M16 2v4" /></svg>}>
                    {dateRangeLabel(e.date, e.endDate)}, {e.date.slice(0, 4)} &middot; {weekdayOf(e.date)}
                  </MetaLine>
                  {e.time && (
                    <MetaLine icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#8B8479" strokeWidth={2} strokeLinecap="round"><circle cx={12} cy={12} r={9} /><path d="M12 7v5l3 2" /></svg>}>
                      {e.time}
                    </MetaLine>
                  )}
                  {e.venue && (
                    <MetaLine icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#8B8479" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx={12} cy={10} r={3} /></svg>}>
                      {e.venue}
                    </MetaLine>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {pages > 1 && (
          <>
            <button
              onClick={() => nudge(-1)}
              aria-label="Previous events"
              className="ib-cal-arrow"
              style={{ left: -21 }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button
              onClick={() => nudge(1)}
              aria-label="More events"
              className="ib-cal-arrow"
              style={{ right: -21 }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
            <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 16 }}>
              {Array.from({ length: pages }, (_, i) => (
                <span
                  key={i}
                  style={{ width: i === page ? 18 : 6, height: 6, borderRadius: 9999, background: i === page ? ORANGE : "rgba(64,50,34,0.18)", transition: "width .2s ease, background .2s ease" }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EventRow({ e }: { e: CityEvent }) {
  const cc = CATEGORY_COLORS[e.category];
  const [hovered, setHovered] = useState(false);
  // An empty event_time used to render an empty span, leaving a dead gap in
  // the meta row; multi-day events showed only their start date.
  const timeLabel = e.time?.trim() || "Time TBA";
  const dateLabel = dateRangeLabel(e.date, e.endDate);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // No margin change on hover: animating it nudged every row below this
      // one, so a mouse drifting down the list made the whole panel twitch.
      style={{ borderBottom: `1px solid ${HAIRLINE}`, overflow: "hidden", borderRadius: hovered ? 12 : 0, transition: "border-radius 0.18s ease" }}
    >
      <div style={{
        height: hovered ? 88 : 0,
        overflow: "hidden",
        transition: "height 0.22s ease",
        background: e.posterUrl ? undefined : `linear-gradient(135deg, ${cc.color}18 0%, ${cc.color}38 60%, ${cc.color}22 100%)`,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {e.posterUrl ? (
          <img src={e.posterUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <svg width={52} height={52} viewBox="0 0 24 24" fill="none" stroke={cc.color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
            <path d={CATEGORY_COVER_PATTERNS[e.category]} />
          </svg>
        )}
        <span style={{ position: "absolute", top: 10, left: 12, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: cc.color, background: cc.bg, padding: "2px 8px", borderRadius: 9999 }}>{e.category}</span>
        <span style={{ position: "absolute", top: 10, right: 12, fontSize: 10.5, fontWeight: 600, color: "#fff", background: "rgba(16,13,11,0.55)", padding: "2px 8px", borderRadius: 9999 }}>{dateLabel}</span>
      </div>

      <div style={{ padding: "13px 0 13px" }}>
        {!hovered && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: cc.color, background: cc.bg, padding: "2px 7px", borderRadius: 9999, flexShrink: 0 }}>{e.category}</span>
            <span style={{ fontSize: 11, color: "#8B8479" }}>{timeLabel}</span>
            <span style={{ fontSize: 11, color: "#C9C5BB", marginLeft: "auto", flexShrink: 0 }}>{dateLabel}</span>
          </div>
        )}
        {hovered && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#8B8479" }}>{timeLabel}</span>
          </div>
        )}
        <div style={{ fontSize: 14, fontWeight: 600, color: DARK, lineHeight: 1.3, marginBottom: 3 }}>{e.title}</div>
        {e.org?.trim() && (
          <div style={{ fontSize: 11.5, color: "#B8A78C", fontWeight: 500, marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Hosted by {e.org}</div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 11.5, color: "#8B8479", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{e.venue}</span>
          {/* No bookmark button here: it had no handler wired up, so it looked
              actionable and did nothing. Better absent than fake. */}
          {e.registrationLink ? (
            <a
              href={e.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, background: DARK, color: "#fff", fontWeight: 600, fontSize: 11.5, padding: "7px 13px", borderRadius: 9999, textDecoration: "none", whiteSpace: "nowrap" }}
            >
              {e.cta}
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>
          ) : (
            <span style={{ flexShrink: 0, fontSize: 11.5, color: "#8B8479", whiteSpace: "nowrap" }}>Details to follow</span>
          )}
        </div>
      </div>
    </div>
  );
}

function MentorRow({ s, booked, onBook }: { s: MentorSlot; booked: boolean; onBook: (s: MentorSlot) => void }) {
  const cc = MENTOR_EXPERTISE_COLORS[s.expertise];
  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(64,50,34,0.09)", display: "flex", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 9999, background: s.color, color: "#fff", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: cc.color, background: cc.bg, padding: "2px 7px", borderRadius: 9999, flexShrink: 0 }}>{s.expertise}</span>
          <span style={{ fontSize: 11, color: "#8B8479" }}>{s.time} &middot; {s.duration}</span>
          <span style={{ fontSize: 11, color: "#C9C5BB", marginLeft: "auto", flexShrink: 0 }}>{shortDate(s.date)}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: DARK, lineHeight: 1.3, marginBottom: 5 }}>{s.mentorName}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 11.5, color: "#8B8479", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{s.venue}</span>
          {booked ? (
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#1A6B3C", background: "rgba(26,107,60,0.10)", padding: "7px 13px", borderRadius: 9999, whiteSpace: "nowrap" }}>Booked &#10003;</span>
          ) : (
            <button onClick={() => onBook(s)} style={{ background: DARK, color: "#fff", fontWeight: 600, fontSize: 11.5, padding: "7px 13px", borderRadius: 9999, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Book</button>
          )}
        </div>
      </div>
    </div>
  );
}

const modalInputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", fontSize: 13.5, color: DARK, outline: "none", fontFamily: "inherit" };
const modalLabelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 5, display: "block" };

function BookingModal({ availableSlots, preselected, onClose, onConfirm }: { availableSlots: MentorSlot[]; preselected: MentorSlot | null; onClose: () => void; onConfirm: (slot: MentorSlot, topic: string, name: string, email: string) => void }) {
  const [selectedId, setSelectedId] = useState(preselected?.id ?? availableSlots[0]?.id ?? "");
  const [topic, setTopic] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const slot = preselected ?? availableSlots.find((s) => s.id === selectedId) ?? null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot || !topic.trim() || !name.trim() || !email.trim()) return;
    onConfirm(slot, topic.trim(), name.trim(), email.trim());
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>Book a mentoring session</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F5F4F0", cursor: "pointer", fontSize: 18, color: "#5A544B" }}>&times;</button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {preselected ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.11)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ width: 38, height: 38, borderRadius: 9999, background: preselected.color, color: "#fff", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{preselected.initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>{preselected.mentorName}</div>
                <div style={{ fontSize: 12, color: "#8B8479" }}>{preselected.expertise} &middot; {formatLong(preselected.date)}, {preselected.time}</div>
              </div>
            </div>
          ) : (
            <div>
              <label style={modalLabelStyle}>Mentor & time slot *</label>
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={{ ...modalInputStyle, appearance: "none" }} required>
                {availableSlots.length === 0 && <option value="">No slots available</option>}
                {availableSlots.map((s) => (
                  <option key={s.id} value={s.id}>{s.mentorName} — {s.expertise} — {formatLong(s.date)}, {s.time}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={modalLabelStyle}>What would you like to discuss? *</label>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Feedback on our seed round pitch deck" style={{ ...modalInputStyle, resize: "vertical", minHeight: 80 }} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={modalLabelStyle}>Your name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Dela Cruz" style={modalInputStyle} required />
            </div>
            <div>
              <label style={modalLabelStyle}>Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@innovator.ph" style={modalInputStyle} required />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", background: "#fff", fontSize: 13.5, fontWeight: 500, cursor: "pointer", color: "#44444C" }}>Cancel</button>
            <button type="submit" disabled={!slot} style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: slot ? ORANGE : "#DEDAD2", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: slot ? "pointer" : "default" }}>Confirm booking</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const EVENT_CATEGORIES = Object.keys(CATEGORY_COLORS) as EventCategory[];

interface MyOrgOption {
  id: string;
  name: string;
}

function SubmitEventModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [myOrgs, setMyOrgs] = useState<MyOrgOption[]>([]);
  const [postAsOrgId, setPostAsOrgId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EventCategory>("Workshop");
  const [eventDate, setEventDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [org, setOrg] = useState("");
  const [orgType, setOrgType] = useState<OrganizerType>(ORGANIZER_TYPES[0]);
  const [format, setFormat] = useState<EventFormat>("In-Person");
  const [description, setDescription] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [posterUploading, setPosterUploading] = useState(false);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase || !user) return;
    supabase
      .from("organizations")
      .select("id,name")
      .eq("owner_id", user.id)
      .then(({ data }) => setMyOrgs((data as MyOrgOption[]) ?? []));
  }, [user]);

  function selectPostAsOrg(id: string) {
    setPostAsOrgId(id);
    const found = myOrgs.find((o) => o.id === id);
    if (found) setOrg(found.name);
  }

  async function handlePosterChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPosterUploading(true);
    setError("");
    try {
      setPosterUrl(await uploadEventSubmissionPoster(file));
    } catch (err: any) {
      setError(err.message || "Cover photo upload failed.");
    }
    setPosterUploading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !eventDate || !org.trim() || !contactName.trim() || !email.trim()) return;
    if (!supabase) {
      setError("Event submissions aren't configured yet.");
      return;
    }
    setError("");
    setStatus("loading");
    const { error: err } = await supabase.from("event_submissions").insert({
      owner_id: user?.id ?? null,
      organization_id: postAsOrgId || null,
      title: title.trim(),
      category,
      event_date: eventDate,
      // end_date is `text not null default ''`, so a blank one has to be an
      // empty string rather than null.
      end_date: endDate || "",
      event_time: eventTime.trim(),
      venue: venue.trim(),
      org: org.trim(),
      org_type: orgType,
      format,
      description: description.trim(),
      registration_link: registrationLink.trim(),
      poster_url: posterUrl,
      contact_name: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    if (err) {
      setError(err.message);
      setStatus("error");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 440, textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
          <div style={{ width: 52, height: 52, borderRadius: 9999, background: "rgba(26,107,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <div style={{ fontSize: 19, fontWeight: 600, color: DARK, marginBottom: 8 }}>Event submitted</div>
          <p style={{ margin: "0 0 22px", fontSize: 13.5, lineHeight: 1.55, color: "#5A544B" }}>Thanks — your event is pending admin review and will appear on the calendar once approved.</p>
          <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: 9, border: "none", background: ORANGE, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 560, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: 18, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>Submit an event</div>
            <div style={{ fontSize: 12.5, color: "#8B8479", marginTop: 3 }}>Reviewed by an admin before it goes live on the calendar.</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F5F4F0", cursor: "pointer", fontSize: 18, color: "#5A544B", flexShrink: 0 }}>&times;</button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={modalLabelStyle}>Event title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Founder Fundamentals Workshop" style={modalInputStyle} required />
          </div>
          <div>
            <label style={modalLabelStyle}>Cover photo (optional)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {posterUrl ? (
                <img src={posterUrl} alt="" style={{ width: 68, height: 68, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(64,50,34,0.13)" }} />
              ) : (
                <div style={{ width: 68, height: 68, borderRadius: 10, background: "#F5F4F0", flexShrink: 0 }} />
              )}
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "#285E7A", border: "1.5px solid rgba(40,94,122,0.3)", borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}>
                {posterUploading ? "Uploading…" : posterUrl ? "Replace photo" : "Upload photo"}
                <input type="file" accept="image/*" onChange={handlePosterChange} disabled={posterUploading} style={{ display: "none" }} />
              </label>
              {posterUrl && (
                <button type="button" onClick={() => setPosterUrl("")} style={{ fontSize: 12.5, fontWeight: 600, color: "#8B8479", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
              )}
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#8B8479" }}>Shown as the event&rsquo;s cover on the calendar. Landscape works best.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={modalLabelStyle}>Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as EventCategory)} style={{ ...modalInputStyle, appearance: "none" }}>
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={modalLabelStyle}>Format *</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as EventFormat)} style={{ ...modalInputStyle, appearance: "none" }}>
                {EVENT_FORMATS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={modalLabelStyle}>Date *</label>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} style={modalInputStyle} required />
            </div>
            <div>
              <label style={modalLabelStyle}>End date (optional)</label>
              <input type="date" value={endDate} min={eventDate || undefined} onChange={(e) => setEndDate(e.target.value)} style={modalInputStyle} />
            </div>
          </div>
          <div>
            <label style={modalLabelStyle}>Time</label>
            <TimeRangePicker value={eventTime} onChange={setEventTime} />
          </div>
          <div>
            <label style={modalLabelStyle}>Venue</label>
            <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Incubator Baguio Hub, or Online" style={modalInputStyle} />
          </div>
          {myOrgs.length > 0 && (
            <div>
              <label style={modalLabelStyle}>Post as (optional)</label>
              <select value={postAsOrgId} onChange={(e) => selectPostAsOrg(e.target.value)} style={{ ...modalInputStyle, appearance: "auto" }}>
                <option value="">Myself / a different organizer</option>
                {myOrgs.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={modalLabelStyle}>Organizer *</label>
              <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="e.g. Incubator Baguio" style={modalInputStyle} required />
            </div>
            <div>
              <label style={modalLabelStyle}>Organizer type *</label>
              <select value={orgType} onChange={(e) => setOrgType(e.target.value as OrganizerType)} style={{ ...modalInputStyle, appearance: "none" }}>
                {ORGANIZER_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={modalLabelStyle}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this event about?" style={{ ...modalInputStyle, resize: "vertical", minHeight: 70 }} />
          </div>
          <div>
            <label style={modalLabelStyle}>Registration link</label>
            <input type="url" value={registrationLink} onChange={(e) => setRegistrationLink(e.target.value)} placeholder="https://forms.gle/…" style={modalInputStyle} />
          </div>
          <div style={{ borderTop: "1px solid rgba(64,50,34,0.11)", paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={modalLabelStyle}>Your name *</label>
              <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Juan Dela Cruz" style={modalInputStyle} required />
            </div>
            <div>
              <label style={modalLabelStyle}>Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={modalInputStyle} required />
            </div>
          </div>
          <div>
            <label style={modalLabelStyle}>Phone (optional)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09XX XXX XXXX" style={modalInputStyle} />
          </div>

          {error && <p style={{ color: "#E23A2E", fontSize: 12.5, margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", background: "#fff", fontSize: 13.5, fontWeight: 500, cursor: "pointer", color: "#44444C" }}>Cancel</button>
            <button type="submit" disabled={status === "loading" || posterUploading} style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: ORANGE, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", opacity: status === "loading" ? 0.7 : 1 }}>
              {status === "loading" ? "Submitting…" : "Submit for review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubscribeModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!supabase) {
      setError("Sign-ups aren't configured yet.");
      return;
    }
    setError("");
    setStatus("loading");
    const { error: err } = await supabase.from("newsletter_subscribers").insert({ email: email.trim(), source: "calendar" });
    if (err) {
      if (err.code === "23505") {
        setStatus("done");
        return;
      }
      setError(err.message);
      setStatus("error");
      return;
    }
    setStatus("done");
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>Subscribe to updates</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F5F4F0", cursor: "pointer", fontSize: 18, color: "#5A544B", flexShrink: 0 }}>&times;</button>
        </div>
        {status === "done" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(26,107,60,0.08)", border: "1px solid rgba(26,107,60,0.2)", borderRadius: 12, padding: "14px 16px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1A6B3C" }}>You&rsquo;re subscribed to new events.</span>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#5A544B" }}>Get notified by email whenever a new event is added to the calendar.</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={modalInputStyle} required />
            {error && <p style={{ color: "#E23A2E", fontSize: 12.5, margin: 0 }}>{error}</p>}
            <button type="submit" disabled={status === "loading"} style={{ padding: "11px 22px", borderRadius: 9, border: "none", background: ORANGE, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", opacity: status === "loading" ? 0.7 : 1 }}>
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CalendarClient() {
  const [mode, setMode] = useState<CalMode>("events");
  const [cursor, setCursor] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [organizerType, setOrganizerType] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [view, setView] = useState<View>("Month");
  const [showLater, setShowLater] = useState(false);

  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set());
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPreselect, setBookingPreselect] = useState<MentorSlot | null>(null);

  const [approvedEvents, setApprovedEvents] = useState<CityEvent[]>([]);
  const [submitEventOpen, setSubmitEventOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("submit") === "1") setSubmitEventOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!supabase) return;
    // public_events, not event_submissions: the view exposes display columns
    // only, keeping the organiser's email/phone off the public calendar.
    supabase
      .from("public_events")
      .select("*")
      .then(({ data }) => setApprovedEvents((data ?? []).map(mapEventRow)));
  }, []);

  const allEvents = useMemo(() => [...EVENTS, ...approvedEvents], [approvedEvents]);

  function switchMode(m: CalMode) {
    setMode(m);
    setCategory(null);
    setOrganizerType(null);
    setFormat(null);
    setQuery("");
    setSelectedIso(null);
    setShowLater(false);
  }

  function openBooking(slot: MentorSlot | null) {
    setBookingPreselect(slot);
    setBookingOpen(true);
  }

  function confirmBooking(slot: MentorSlot) {
    setBookedIds((prev) => new Set(prev).add(slot.id));
    setBookingOpen(false);
    setBookingPreselect(null);
  }

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const todayIso = isoOf(TODAY);
  const q = query.trim().toLowerCase();

  const matchesEventFilters = (e: CityEvent) => {
    if (category && e.category !== category) return false;
    if (organizerType && e.orgType !== organizerType) return false;
    if (format && e.format !== format) return false;
    if (q && ![e.title, e.org, e.venue, e.category].some((f) => f.toLowerCase().includes(q))) return false;
    return true;
  };

  const matchesMentorFilters = (s: MentorSlot) => {
    if (category && s.expertise !== category) return false;
    if (organizerType && s.mentorName !== organizerType) return false;
    if (format && s.format !== format) return false;
    if (q && ![s.mentorName, s.expertise, s.venue].some((f) => f.toLowerCase().includes(q))) return false;
    return true;
  };

  const filteredEvents = useMemo(() => allEvents.filter(matchesEventFilters), [allEvents, category, organizerType, format, q]);
  const filteredSlots = useMemo(() => MENTOR_SLOTS.filter(matchesMentorFilters), [category, organizerType, format, q]);

  // Leading/trailing cells carry the real adjacent-month dates rather than
  // nulls, and the grid is padded to whole weeks -- an unbroken 7-column
  // block reads as a calendar, where blank placeholder tiles read as
  // something that failed to load.
  const monthCells = useMemo(() => {
    const startOffset = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: DayCell[] = [];
    for (let i = startOffset; i > 0; i--) out.push({ date: new Date(year, month, 1 - i), inMonth: false });
    for (let d = 1; d <= daysInMonth; d++) out.push({ date: new Date(year, month, d), inMonth: true });
    let trailing = 1;
    while (out.length % 7 !== 0) out.push({ date: new Date(year, month, daysInMonth + trailing++), inMonth: false });
    return out;
  }, [year, month]);

  const weekCells = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return { date: d, inMonth: true };
    });
  }, [cursor]);

  const cells = view === "Week" ? weekCells : monthCells;

  // Which legend swatches are worth showing: only what's actually on the
  // grid right now, recomputed as the period or filters change.
  const visibleCategories = useMemo(() => {
    const seen = new Set<string>();
    for (const { date } of cells) {
      if (mode === "events") {
        for (const e of eventsOnDay(date, allEvents).filter(matchesEventFilters)) seen.add(e.category);
      } else {
        for (const s of slotsOnDay(date).filter(matchesMentorFilters)) seen.add(s.expertise);
      }
    }
    return seen;
  }, [cells, mode, allEvents, category, organizerType, format, q]);

  function eventsOnDayFiltered(date: Date) {
    return eventsOnDay(date, allEvents).filter(matchesEventFilters);
  }
  function slotsOnDayFiltered(date: Date) {
    return slotsOnDay(date).filter(matchesMentorFilters);
  }

  function step(dir: 1 | -1) {
    if (view === "Week") {
      const d = new Date(cursor);
      d.setDate(d.getDate() + dir * 7);
      setCursor(d);
    } else {
      setCursor(new Date(year, month + dir, 1));
    }
  }

  // Grouped agenda: Today / This week / This month / Later
  const grouped = useMemo(() => {
    const upcoming = filteredEvents.filter((e) => (e.endDate ? e.endDate >= todayIso : e.date >= todayIso)).sort((a, b) => a.date.localeCompare(b.date));
    const weekEnd = isoOf(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 7));
    const monthEnd = isoOf(new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0));
    const today: CityEvent[] = [];
    const thisWeek: CityEvent[] = [];
    const thisMonth: CityEvent[] = [];
    const later: CityEvent[] = [];
    upcoming.forEach((e) => {
      if (e.date === todayIso) today.push(e);
      else if (e.date <= weekEnd) thisWeek.push(e);
      else if (e.date <= monthEnd) thisMonth.push(e);
      else later.push(e);
    });
    return { today, thisWeek, thisMonth, later };
  }, [filteredEvents, todayIso]);

  const groupedSlots = useMemo(() => {
    const upcoming = filteredSlots.filter((s) => s.date >= todayIso).sort((a, b) => a.date.localeCompare(b.date));
    const weekEnd = isoOf(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 7));
    const monthEnd = isoOf(new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0));
    const today: MentorSlot[] = [];
    const thisWeek: MentorSlot[] = [];
    const thisMonth: MentorSlot[] = [];
    const later: MentorSlot[] = [];
    upcoming.forEach((s) => {
      if (s.date === todayIso) today.push(s);
      else if (s.date <= weekEnd) thisWeek.push(s);
      else if (s.date <= monthEnd) thisMonth.push(s);
      else later.push(s);
    });
    return { today, thisWeek, thisMonth, later };
  }, [filteredSlots, todayIso]);

  const daySelection: CityEvent[] | null = selectedIso ? filteredEvents.filter((e) => (e.endDate ? selectedIso >= e.date && selectedIso <= e.endDate : e.date === selectedIso)) : null;
  const daySlotSelection: MentorSlot[] | null = selectedIso ? filteredSlots.filter((s) => s.date === selectedIso) : null;

  const hasActiveFilters = !!(q || category || organizerType || format);

  // "Nothing matches your filters" is only true when filters are on. With no
  // filters it means nothing is published, and for mentoring that's always the
  // case right now -- MENTOR_SLOTS is empty, so the mode has no data at all.
  const emptyMessage = (kind: "events" | "sessions") => {
    if (kind === "sessions" && MENTOR_SLOTS.length === 0) return "Mentoring sessions aren’t published yet — check back soon.";
    if (hasActiveFilters) return `No ${kind} match your filters.`;
    return `No upcoming ${kind} scheduled yet.`;
  };

  function clearFilters() {
    setQuery("");
    setCategory(null);
    setOrganizerType(null);
    setFormat(null);
    setSelectedIso(null);
  }
  // Carousel list is intentionally unfiltered: it's a standing "what's on"
  // strip above the calendar, not a second view of the filtered results.
  const upcomingForCarousel = useMemo(
    () =>
      allEvents
        .filter((e) => (e.endDate ? e.endDate >= todayIso : e.date >= todayIso))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 12),
    [allEvents, todayIso]
  );

  const itemsLabel = mode === "events" ? "events" : "sessions";
  const availableForModal = MENTOR_SLOTS.filter((s) => !bookedIds.has(s.id));

  return (
    <div style={{ background: "#F6F2EA", padding: "40px 32px 56px" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        {/* UPCOMING EVENTS CAROUSEL */}
        {mode === "events" && (
          <UpcomingEventsCarousel
            events={upcomingForCarousel}
            onOpenAll={() => {
              clearFilters();
              setView("Agenda");
            }}
          />
        )}

        {/* MODE TOGGLE + ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
          {/* White, not the page's own #F6F2EA -- as a segmented control it has
              to read as a container, and matching the page made it invisible. */}
          <div style={{ display: "flex", background: "#fff", border: `1px solid ${HAIRLINE}`, borderRadius: 9999, padding: 3, gap: 2 }}>
            <button
              onClick={() => switchMode("events")}
              aria-pressed={mode === "events"}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 9999, border: "none", cursor: "pointer", color: mode === "events" ? "#fff" : "#5A544B", background: mode === "events" ? DARK : "transparent" }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><rect x={3} y={4} width={18} height={17} rx={2} /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
              Events
            </button>
            <button
              onClick={() => switchMode("mentoring")}
              aria-pressed={mode === "mentoring"}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 9999, border: "none", cursor: "pointer", color: mode === "mentoring" ? "#fff" : "#5A544B", background: mode === "mentoring" ? ORANGE : "transparent" }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></svg>
              Mentoring
            </button>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {mode === "events" ? (
              <>
                <button onClick={() => setSubmitEventOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: ORANGE, background: "none", textDecoration: "none", border: "1.5px solid rgba(242,101,34,0.4)", padding: "11px 18px", borderRadius: 9999, cursor: "pointer" }}>+ Submit Event</button>
                <button onClick={() => setSubscribeOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: DARK, background: "none", textDecoration: "none", border: "1.5px solid rgba(64,50,34,0.14)", padding: "11px 18px", borderRadius: 9999, cursor: "pointer" }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth={2}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                  Subscribe
                </button>
              </>
            ) : (
              <button onClick={() => openBooking(null)} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", padding: "11px 20px", borderRadius: 9999, cursor: "pointer" }}>
                + Book a Session
              </button>
            )}
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="ib-events-filterbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
          <div className="ib-events-filters" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
            <div style={{ position: "relative", minWidth: 220 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#8B8479" strokeWidth={2} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx={11} cy={11} r={7} />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIso(null); }}
                placeholder={mode === "events" ? "Search events, topics, or organizers..." : "Search mentors or expertise..."}
                style={{ width: "100%", boxSizing: "border-box", fontSize: 13, color: DARK, background: "#fff", border: "1.5px solid rgba(64,50,34,0.14)", borderRadius: 9999, padding: "10px 14px 10px 36px", outline: "none" }}
              />
            </div>
            {mode === "events" && (
              <>
                <Select
                  value={category}
                  onChange={(v) => { setCategory(v); setSelectedIso(null); }}
                  options={CATEGORIES}
                  allLabel="All Categories"
                />
                <Select
                  value={organizerType}
                  onChange={(v) => { setOrganizerType(v); setSelectedIso(null); }}
                  options={ORGANIZER_TYPES}
                  allLabel="All Organizers"
                />
              </>
            )}
            <Select
              value={format}
              onChange={(v) => { setFormat(v); setSelectedIso(null); }}
              options={mode === "events" ? EVENT_FORMATS : MENTOR_FORMATS}
              allLabel="All Formats"
            />
            {/* hasActiveFilters was being computed to caption the sidebar but
                never gave the reader a way back out -- clearing meant resetting
                every dropdown by hand. */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: ORANGE, background: "rgba(242,101,34,0.07)", border: `1.5px solid rgba(242,101,34,0.28)`, borderRadius: 9999, padding: "9px 15px", cursor: "pointer" }}
              >
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                Clear filters
              </button>
            )}
          </div>
          <div className="ib-events-viewtoggle" style={{ display: "flex", background: "#fff", border: `1px solid ${HAIRLINE}`, borderRadius: 9999, padding: 3, gap: 2, flexShrink: 0 }}>
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-pressed={view === v}
                style={{ fontSize: 12.5, fontWeight: 600, padding: "8px 16px", borderRadius: 9999, border: "none", cursor: "pointer", color: view === v ? "#fff" : "#5A544B", background: view === v ? ORANGE : "transparent" }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2.2fr 0.85fr", gap: 20, alignItems: "start" }} className="ib-events-grid">
          {/* CALENDAR / AGENDA */}
          {view !== "Agenda" ? (
            <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: "24px 24px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontSize: 19, fontWeight: 600, color: DARK, letterSpacing: "-0.01em" }}>
                  {view === "Week" ? `Week of ${formatLong(isoOf(weekCells[0].date))}` : `${MONTH_NAMES[month]} ${year}`}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => step(-1)} aria-label="Previous" style={{ width: 32, height: 32, borderRadius: 9999, border: "1.5px solid rgba(64,50,34,0.14)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#44444C" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <button onClick={() => { setCursor(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)); setSelectedIso(null); }} style={{ fontSize: 12, fontWeight: 600, color: "#5A544B", border: "1.5px solid rgba(64,50,34,0.14)", background: "#fff", borderRadius: 9999, padding: "0 14px", cursor: "pointer" }}>
                    Today
                  </button>
                  <button onClick={() => step(1)} aria-label="Next" style={{ width: 32, height: 32, borderRadius: 9999, border: "1.5px solid rgba(64,50,34,0.14)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#44444C" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                </div>
              </div>

              {/* One clipped, hairline-ruled block for the weekday header and the
                  days, rather than 37 detached rounded tiles -- a continuous
                  grid is what reads as a calendar. Columns are minmax(0,1fr)
                  because a bare 1fr floors each track at its content width, so
                  one long event title would stretch its column and squeeze the
                  rest into slivers. */}
              <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", background: "#FBF9F5", borderBottom: `1px solid ${HAIRLINE}` }}>
                  {WEEKDAYS.map((w, i) => (
                    <div key={w} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#8B8479", padding: "10px 0", borderRight: i < 6 ? `1px solid ${HAIRLINE}` : "none" }}>
                      {w}
                    </div>
                  ))}
                </div>

                <div className="ib-events-monthgrid" style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))" }}>
                  {cells.map(({ date, inMonth }, i) => {
                    const iso = isoOf(date);
                    const dayItems = mode === "events" ? eventsOnDayFiltered(date) : slotsOnDayFiltered(date);
                    const dayChips: ChipData[] = mode === "events"
                      ? (dayItems as CityEvent[]).map((e) => ({ key: e.id, label: e.title, time: e.time, color: CATEGORY_COLORS[e.category].color, bg: CATEGORY_COLORS[e.category].bg }))
                      : (dayItems as MentorSlot[]).map((s) => ({ key: s.id, label: s.mentorName, time: s.time, color: MENTOR_EXPERTISE_COLORS[s.expertise].color, bg: MENTOR_EXPERTISE_COLORS[s.expertise].bg }));
                    const isToday = iso === todayIso;
                    const isSelected = iso === selectedIso;
                    const visible = dayChips.slice(0, view === "Week" ? 6 : 2);
                    const extra = dayChips.length - visible.length;
                    const interactive = dayItems.length > 0;
                    const lastRow = i >= cells.length - 7;
                    return (
                      <button
                        key={i}
                        className={`ib-events-daycell${interactive ? " ib-events-daycell-live" : ""}`}
                        onClick={() => interactive && setSelectedIso(isSelected ? null : iso)}
                        disabled={!interactive}
                        aria-pressed={interactive ? isSelected : undefined}
                        aria-label={`${formatLong(iso)}${interactive ? `, ${dayItems.length} ${dayItems.length === 1 ? itemsLabel.slice(0, -1) : itemsLabel}` : ""}`}
                        style={{
                          minHeight: view === "Week" ? 168 : 118,
                          minWidth: 0,
                          border: "none",
                          borderRight: i % 7 < 6 ? `1px solid ${HAIRLINE}` : "none",
                          borderBottom: lastRow ? "none" : `1px solid ${HAIRLINE}`,
                          // Inset ring for the selection so it can't shift the
                          // grid's hairlines the way a real border would.
                          boxShadow: isSelected ? `inset 0 0 0 2px ${ORANGE}` : "none",
                          background: isSelected ? "rgba(242,101,34,0.05)" : inMonth ? "#fff" : "#FCFAF6",
                          cursor: interactive ? "pointer" : "default",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                          gap: 5,
                          padding: "8px 7px",
                          textAlign: "left",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", minHeight: 21 }}>
                          <span
                            style={
                              isToday
                                ? { width: 21, height: 21, borderRadius: 9999, background: ORANGE, color: "#fff", fontSize: 11.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }
                                : { fontSize: 12.5, fontWeight: 500, color: !inMonth ? "#CFCAC0" : interactive ? DARK : "#9C958A", padding: "0 2px" }
                            }
                          >
                            {date.getDate()}
                          </span>
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                          {visible.map((c) => <DayChip key={c.key} data={c} compact={view !== "Week"} />)}
                          {extra > 0 && <span style={{ fontSize: 10, fontWeight: 500, color: "#8B8479", padding: "1px 6px" }}>+{extra} more</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Only the categories actually on screen -- a fixed list of all
                  eight is noise the reader has to filter out themselves. */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${HAIRLINE}` }}>
                {mode === "events"
                  ? CATEGORIES.filter((cat) => visibleCategories.has(cat)).map((cat) => (
                      <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 9999, background: CATEGORY_COLORS[cat].color, display: "inline-block" }} />
                        <span style={{ fontSize: 11.5, color: "#5A544B" }}>{cat}</span>
                      </div>
                    ))
                  : MENTOR_EXPERTISE_LIST.filter((exp) => visibleCategories.has(exp)).map((exp) => (
                      <div key={exp} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 9999, background: MENTOR_EXPERTISE_COLORS[exp].color, display: "inline-block" }} />
                        <span style={{ fontSize: 11.5, color: "#5A544B" }}>{exp}</span>
                      </div>
                    ))}
                {visibleCategories.size === 0 && (
                  <span style={{ fontSize: 11.5, color: "#8B8479" }}>Nothing scheduled in this {view === "Week" ? "week" : "month"} yet.</span>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: "24px 28px" }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: DARK, marginBottom: 14 }}>All upcoming {itemsLabel}</div>
              {mode === "events" ? (
                <>
                  {filteredEvents.filter((e) => (e.endDate ? e.endDate >= todayIso : e.date >= todayIso)).sort((a, b) => a.date.localeCompare(b.date)).map((e) => <EventRow key={e.id} e={e} />)}
                  {filteredEvents.length === 0 && <p style={{ fontSize: 13.5, color: "#8B8479", padding: "12px 0" }}>{emptyMessage("events")}</p>}
                </>
              ) : (
                <>
                  {filteredSlots.filter((s) => s.date >= todayIso).sort((a, b) => a.date.localeCompare(b.date)).map((s) => <MentorRow key={s.id} s={s} booked={bookedIds.has(s.id)} onBook={openBooking} />)}
                  {filteredSlots.length === 0 && <p style={{ fontSize: 13.5, color: "#8B8479", padding: "12px 0" }}>{emptyMessage("sessions")}</p>}
                </>
              )}
            </div>
          )}

          {/* SIDEBAR */}
          <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: "22px 24px" }}>
            {mode === "events" ? (
              daySelection ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: DARK, textTransform: "uppercase", letterSpacing: "0.04em" }}>{formatLong(selectedIso!)}</div>
                    <button onClick={() => setSelectedIso(null)} style={{ fontSize: 12, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer" }}>Clear ✕</button>
                  </div>
                  {daySelection.length === 0 && <p style={{ fontSize: 13, color: "#8B8479" }}>No events on this date.</p>}
                  {daySelection.map((e) => <EventRow key={e.id} e={e} />)}
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: DARK, textTransform: "uppercase", letterSpacing: "0.04em" }}>{hasActiveFilters ? "Filtered events" : "Upcoming events"}</div>
                    {!hasActiveFilters && <button onClick={() => setView("Agenda")} style={{ fontSize: 12, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer" }}>View all</button>}
                  </div>

                  {grouped.today.length === 0 && grouped.thisWeek.length === 0 && grouped.thisMonth.length === 0 && grouped.later.length === 0 && (
                    <p style={{ fontSize: 13, color: "#8B8479", padding: "12px 0" }}>{emptyMessage("events")}</p>
                  )}

                  {grouped.today.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B8479", marginBottom: 6 }}>Today &middot; {formatLong(todayIso).split(",")[0]}</div>
                      {grouped.today.map((e) => <EventRow key={e.id} e={e} />)}
                    </div>
                  )}
                  {grouped.thisWeek.length > 0 && (
                    <div style={{ marginTop: 18 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B8479", marginBottom: 6 }}>This week</div>
                      {grouped.thisWeek.map((e) => <EventRow key={e.id} e={e} />)}
                    </div>
                  )}
                  {grouped.thisMonth.length > 0 && (
                    <div style={{ marginTop: 18 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B8479", marginBottom: 6 }}>This month</div>
                      {grouped.thisMonth.map((e) => <EventRow key={e.id} e={e} />)}
                    </div>
                  )}
                  {grouped.later.length > 0 && (
                    <div style={{ marginTop: 18 }}>
                      {!showLater ? (
                        <button onClick={() => setShowLater(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#5A544B", background: "#F6F2EA", border: "none", borderRadius: 10, padding: "10px 0", cursor: "pointer" }}>
                          More events coming up <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#5A544B" strokeWidth={2.4}><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                      ) : (
                        <>
                          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B8479", marginBottom: 6 }}>Later</div>
                          {grouped.later.map((e) => <EventRow key={e.id} e={e} />)}
                        </>
                      )}
                    </div>
                  )}
                </>
              )
            ) : daySlotSelection ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: DARK, textTransform: "uppercase", letterSpacing: "0.04em" }}>{formatLong(selectedIso!)}</div>
                  <button onClick={() => setSelectedIso(null)} style={{ fontSize: 12, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer" }}>Clear ✕</button>
                </div>
                {daySlotSelection.length === 0 && <p style={{ fontSize: 13, color: "#8B8479" }}>No mentoring sessions on this date.</p>}
                {daySlotSelection.map((s) => <MentorRow key={s.id} s={s} booked={bookedIds.has(s.id)} onBook={openBooking} />)}
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: DARK, textTransform: "uppercase", letterSpacing: "0.04em" }}>{hasActiveFilters ? "Filtered sessions" : "Upcoming sessions"}</div>
                  {!hasActiveFilters && <button onClick={() => setView("Agenda")} style={{ fontSize: 12, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer" }}>View all</button>}
                </div>

                {groupedSlots.today.length === 0 && groupedSlots.thisWeek.length === 0 && groupedSlots.thisMonth.length === 0 && groupedSlots.later.length === 0 && (
                  <p style={{ fontSize: 13, color: "#8B8479", padding: "12px 0" }}>{emptyMessage("sessions")}</p>
                )}

                {groupedSlots.today.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B8479", marginBottom: 6 }}>Today &middot; {formatLong(todayIso).split(",")[0]}</div>
                    {groupedSlots.today.map((s) => <MentorRow key={s.id} s={s} booked={bookedIds.has(s.id)} onBook={openBooking} />)}
                  </div>
                )}
                {groupedSlots.thisWeek.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B8479", marginBottom: 6 }}>This week</div>
                    {groupedSlots.thisWeek.map((s) => <MentorRow key={s.id} s={s} booked={bookedIds.has(s.id)} onBook={openBooking} />)}
                  </div>
                )}
                {groupedSlots.thisMonth.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B8479", marginBottom: 6 }}>This month</div>
                    {groupedSlots.thisMonth.map((s) => <MentorRow key={s.id} s={s} booked={bookedIds.has(s.id)} onBook={openBooking} />)}
                  </div>
                )}
                {groupedSlots.later.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    {!showLater ? (
                      <button onClick={() => setShowLater(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#5A544B", background: "#F6F2EA", border: "none", borderRadius: 10, padding: "10px 0", cursor: "pointer" }}>
                        More sessions coming up <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#5A544B" strokeWidth={2.4}><path d="m6 9 6 6 6-6" /></svg>
                      </button>
                    ) : (
                      <>
                        <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B8479", marginBottom: 6 }}>Later</div>
                        {groupedSlots.later.map((s) => <MentorRow key={s.id} s={s} booked={bookedIds.has(s.id)} onBook={openBooking} />)}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {bookingOpen && (
        <BookingModal
          availableSlots={bookingPreselect ? [bookingPreselect] : availableForModal}
          preselected={bookingPreselect}
          onClose={() => { setBookingOpen(false); setBookingPreselect(null); }}
          onConfirm={confirmBooking}
        />
      )}
      {submitEventOpen && <SubmitEventModal onClose={() => setSubmitEventOpen(false)} />}
      {subscribeOpen && <SubscribeModal onClose={() => setSubscribeOpen(false)} />}
    </div>
  );
}
