"use client";

import { useMemo, useState } from "react";
import { CATEGORY_COLORS, DARK, EVENTS, EVENT_FORMATS, ORANGE, ORGANIZER_TYPES, TODAY, type CityEvent, type EventCategory } from "./data";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CATEGORIES = Object.keys(CATEGORY_COLORS) as EventCategory[];
const VIEWS = ["Month", "Week", "Agenda"] as const;
type View = (typeof VIEWS)[number];

function isoOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function eventsOnDay(date: Date) {
  const iso = isoOf(date);
  return EVENTS.filter((e) => (e.endDate ? iso >= e.date && iso <= e.endDate : e.date === iso));
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
  border: "1.5px solid rgba(20,20,25,0.12)",
  borderRadius: 9999,
  padding: "10px 30px 10px 16px",
  cursor: "pointer",
  outline: "none",
};

function Select({ value, onChange, options, allLabel }: { value: string | null; onChange: (v: string | null) => void; options: string[]; allLabel: string }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        style={selectStyle}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2.4} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

function EventChip({ e, compact }: { e: CityEvent; compact?: boolean }) {
  const cc = CATEGORY_COLORS[e.category];
  return (
    <div className="ib-events-chip" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: compact ? 10 : 10.5, fontWeight: 600, color: cc.color, background: cc.bg, borderRadius: 5, padding: "3px 6px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
      <span style={{ width: 5, height: 5, borderRadius: 9999, background: cc.color, flexShrink: 0 }} />
      <span className="ib-events-chip-text" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{e.category} {e.time}</span>
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

function EventRow({ e }: { e: CityEvent }) {
  const cc = CATEGORY_COLORS[e.category];
  const [hovered, setHovered] = useState(false);
  const [, m, d] = e.date.split("-").map(Number);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ borderBottom: "1px solid rgba(20,20,25,0.06)", overflow: "hidden", borderRadius: hovered ? 12 : 0, margin: hovered ? "6px 0" : "0", transition: "margin 0.18s ease, border-radius 0.18s ease" }}
    >
      {/* Cover image — reveals on hover */}
      <div style={{
        height: hovered ? 88 : 0,
        overflow: "hidden",
        transition: "height 0.22s ease",
        background: `linear-gradient(135deg, ${cc.color}18 0%, ${cc.color}38 60%, ${cc.color}22 100%)`,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <svg width={52} height={52} viewBox="0 0 24 24" fill="none" stroke={cc.color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
          <path d={CATEGORY_COVER_PATTERNS[e.category]} />
        </svg>
        <span style={{ position: "absolute", top: 10, left: 12, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: cc.color, background: cc.bg, padding: "2px 8px", borderRadius: 9999 }}>{e.category}</span>
        <span style={{ position: "absolute", top: 10, right: 12, fontSize: 10.5, color: "#9A958B" }}>{MONTH_NAMES[m - 1].slice(0, 3)} {String(d).padStart(2, "0")}</span>
        <div style={{ position: "absolute", bottom: 10, left: 12, right: 12, fontSize: 13, fontWeight: 700, color: DARK, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
      </div>

      <div style={{ padding: "13px 0 13px" }}>
        {!hovered && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: cc.color, background: cc.bg, padding: "2px 7px", borderRadius: 9999, flexShrink: 0 }}>{e.category}</span>
            <span style={{ fontSize: 11, color: "#9A958B" }}>{e.time}</span>
            <span style={{ fontSize: 11, color: "#C9C5BB", marginLeft: "auto", flexShrink: 0 }}>{MONTH_NAMES[m - 1].slice(0, 3)} {String(d).padStart(2, "0")}</span>
          </div>
        )}
        {hovered && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#9A958B" }}>{e.time}</span>
          </div>
        )}
        <div style={{ fontSize: 14, fontWeight: 600, color: DARK, lineHeight: 1.3, marginBottom: 5 }}>{e.title}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 11.5, color: "#9A958B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{e.venue}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <a href="#" style={{ background: DARK, color: "#fff", fontWeight: 600, fontSize: 11.5, padding: "7px 13px", borderRadius: 9999, textDecoration: "none", whiteSpace: "nowrap" }}>{e.cta}</a>
            <button aria-label="Save event" style={{ width: 27, height: 27, borderRadius: 8, border: "1.5px solid rgba(20,20,25,0.1)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2}><path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventsCalendar() {
  const [cursor, setCursor] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [organizerType, setOrganizerType] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [view, setView] = useState<View>("Month");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const todayIso = isoOf(TODAY);

  const q = query.trim().toLowerCase();
  const matchesFilters = (e: CityEvent) => {
    if (category && e.category !== category) return false;
    if (organizerType && e.orgType !== organizerType) return false;
    if (format && e.format !== format) return false;
    if (q && ![e.title, e.org, e.venue, e.category].some((f) => f.toLowerCase().includes(q))) return false;
    return true;
  };

  const filteredEvents = useMemo(() => EVENTS.filter(matchesFilters), [category, organizerType, format, q]);

  const monthCells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(year, month, d));
    return out;
  }, [year, month]);

  const weekCells = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [cursor]);

  const cells = view === "Week" ? weekCells : monthCells;

  function eventsOnDayFiltered(date: Date) {
    return eventsOnDay(date).filter(matchesFilters);
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
    const upcoming = filteredEvents
      .filter((e) => (e.endDate ? e.endDate >= todayIso : e.date >= todayIso))
      .sort((a, b) => a.date.localeCompare(b.date));
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

  const daySelection: CityEvent[] | null = selectedIso
    ? filteredEvents.filter((e) => (e.endDate ? selectedIso >= e.date && selectedIso <= e.endDate : e.date === selectedIso))
    : null;

  const [showLater, setShowLater] = useState(false);
  const hasActiveFilters = !!(q || category || organizerType || format);

  return (
    <div style={{ background: "#FAFAF7", padding: "24px 32px 56px" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        {/* FILTER BAR */}
        <div className="ib-events-filterbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
          <div className="ib-events-filters" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
            <div style={{ position: "relative", minWidth: 220 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx={11} cy={11} r={7} />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIso(null); }}
                placeholder="Search events, topics, or organizers..."
                style={{ width: "100%", boxSizing: "border-box", fontSize: 13, color: DARK, background: "#fff", border: "1.5px solid rgba(20,20,25,0.12)", borderRadius: 9999, padding: "10px 14px 10px 36px", outline: "none" }}
              />
            </div>
            <Select value={category} onChange={(v) => { setCategory(v); setSelectedIso(null); }} options={CATEGORIES} allLabel="All Categories" />
            <Select value={organizerType} onChange={(v) => { setOrganizerType(v); setSelectedIso(null); }} options={ORGANIZER_TYPES} allLabel="All Organizers" />
            <Select value={format} onChange={(v) => { setFormat(v); setSelectedIso(null); }} options={EVENT_FORMATS} allLabel="All Formats" />
          </div>
          <div className="ib-events-viewtoggle" style={{ display: "flex", background: "#F4F2EC", borderRadius: 9999, padding: 3, gap: 2, flexShrink: 0 }}>
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  padding: "8px 16px",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                  color: view === v ? "#fff" : "#6B6B73",
                  background: view === v ? ORANGE : "transparent",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2.2fr 0.85fr", gap: 20, alignItems: "start" }} className="ib-events-grid">
          {/* CALENDAR / AGENDA */}
          {view !== "Agenda" ? (
            <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "24px 24px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontSize: 19, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>
                  {view === "Week" ? `Week of ${formatLong(isoOf(weekCells[0]))}` : `${MONTH_NAMES[month]} ${year}`}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => step(-1)} aria-label="Previous" style={{ width: 32, height: 32, borderRadius: 9999, border: "1.5px solid rgba(20,20,25,0.12)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#44444C" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <button onClick={() => { setCursor(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)); setSelectedIso(null); }} style={{ fontSize: 12, fontWeight: 600, color: "#6B6B73", border: "1.5px solid rgba(20,20,25,0.12)", background: "#fff", borderRadius: 9999, padding: "0 14px", cursor: "pointer" }}>
                    Today
                  </button>
                  <button onClick={() => step(1)} aria-label="Next" style={{ width: 32, height: 32, borderRadius: 9999, border: "1.5px solid rgba(20,20,25,0.12)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#44444C" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
                {WEEKDAYS.map((w) => (
                  <div key={w} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 600, color: "#9A958B", padding: "4px 0" }}>{w}</div>
                ))}
              </div>

              <div className="ib-events-monthgrid" style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
                {cells.map((date, i) => {
                  if (!date) return <div key={i} style={{ minHeight: view === "Week" ? 150 : 92, borderRadius: 12, border: "1.5px solid rgba(20,20,25,0.04)", background: "#FAFAF7" }} />;
                  const iso = isoOf(date);
                  const dayEvents = eventsOnDayFiltered(date);
                  const isToday = iso === todayIso;
                  const isSelected = iso === selectedIso;
                  const visible = dayEvents.slice(0, view === "Week" ? 6 : 2);
                  const extra = dayEvents.length - visible.length;
                  return (
                    <button
                      key={i}
                      className="ib-events-daycell"
                      onClick={() => dayEvents.length > 0 && setSelectedIso(isSelected ? null : iso)}
                      disabled={dayEvents.length === 0}
                      style={{
                        minHeight: view === "Week" ? 150 : 92,
                        borderRadius: 12,
                        border: isSelected ? `1.5px solid ${ORANGE}` : "1.5px solid rgba(20,20,25,0.07)",
                        background: isSelected ? "rgba(242,101,34,0.06)" : "#fff",
                        cursor: dayEvents.length > 0 ? "pointer" : "default",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        gap: 4,
                        padding: "7px 6px",
                        textAlign: "left",
                      }}
                    >
                      {isToday ? (
                        <>
                          <span style={{ width: 22, height: 22, borderRadius: 9999, background: ORANGE, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{date.getDate()}</span>
                          {dayEvents.length > 0 && (
                            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: ORANGE }}>{dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: 12, fontWeight: 500, color: dayEvents.length > 0 ? DARK : "#C9C5BB", padding: "1px 2px" }}>{date.getDate()}</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {visible.map((e) => <EventChip key={e.id} e={e} compact={view !== "Week"} />)}
                            {extra > 0 && <span style={{ fontSize: 10, fontWeight: 600, color: "#9A958B", padding: "1px 4px" }}>+{extra} more</span>}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(20,20,25,0.07)" }}>
                {CATEGORIES.map((cat) => (
                  <div key={cat} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 9999, background: CATEGORY_COLORS[cat].color, display: "inline-block" }} />
                    <span style={{ fontSize: 11, color: "#6B6B73" }}>{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "24px 28px" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: DARK, marginBottom: 14 }}>All upcoming events</div>
              {filteredEvents.filter((e) => (e.endDate ? e.endDate >= todayIso : e.date >= todayIso)).sort((a, b) => a.date.localeCompare(b.date)).map((e) => <EventRow key={e.id} e={e} />)}
              {filteredEvents.length === 0 && <p style={{ fontSize: 13.5, color: "#9A958B", padding: "12px 0" }}>No events match your filters.</p>}
            </div>
          )}

          {/* SIDEBAR */}
          <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "22px 24px" }}>
            {daySelection ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.04em" }}>{formatLong(selectedIso!)}</div>
                  <button onClick={() => setSelectedIso(null)} style={{ fontSize: 12, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer" }}>Clear ✕</button>
                </div>
                {daySelection.length === 0 && <p style={{ fontSize: 13, color: "#9A958B" }}>No events on this date.</p>}
                {daySelection.map((e) => <EventRow key={e.id} e={e} />)}
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.04em" }}>{hasActiveFilters ? "Filtered events" : "Upcoming events"}</div>
                  {!hasActiveFilters && <button onClick={() => setView("Agenda")} style={{ fontSize: 12, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer" }}>View all</button>}
                </div>

                {grouped.today.length === 0 && grouped.thisWeek.length === 0 && grouped.thisMonth.length === 0 && grouped.later.length === 0 && (
                  <p style={{ fontSize: 13, color: "#9A958B", padding: "12px 0" }}>No events match your filters.</p>
                )}

                {grouped.today.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B", marginBottom: 6 }}>Today &middot; {formatLong(todayIso).split(",")[0]}</div>
                    {grouped.today.map((e) => <EventRow key={e.id} e={e} />)}
                  </div>
                )}
                {grouped.thisWeek.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B", marginBottom: 6 }}>This week</div>
                    {grouped.thisWeek.map((e) => <EventRow key={e.id} e={e} />)}
                  </div>
                )}
                {grouped.thisMonth.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B", marginBottom: 6 }}>This month</div>
                    {grouped.thisMonth.map((e) => <EventRow key={e.id} e={e} />)}
                  </div>
                )}
                {grouped.later.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    {!showLater ? (
                      <button onClick={() => setShowLater(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#6B6B73", background: "#FAFAF7", border: "none", borderRadius: 10, padding: "10px 0", cursor: "pointer" }}>
                        More events coming up <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#6B6B73" strokeWidth={2.4}><path d="m6 9 6 6 6-6" /></svg>
                      </button>
                    ) : (
                      <>
                        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B", marginBottom: 6 }}>Later</div>
                        {grouped.later.map((e) => <EventRow key={e.id} e={e} />)}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
