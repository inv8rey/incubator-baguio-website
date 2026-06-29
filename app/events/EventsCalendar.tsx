"use client";

import { useMemo, useState } from "react";
import { CATEGORY_COLORS, DARK, EVENTS, ORANGE, TODAY, type CityEvent } from "./data";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isoOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function eventsOnDay(date: Date) {
  const iso = isoOf(date);
  return EVENTS.filter((e) => {
    if (!e.endDate) return e.date === iso;
    return iso >= e.date && iso <= e.endDate;
  });
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}, ${y}`;
}

export default function EventsCalendar() {
  const [cursor, setCursor] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: { date: Date | null }[] = [];
    for (let i = 0; i < startOffset; i++) out.push({ date: null });
    for (let d = 1; d <= daysInMonth; d++) out.push({ date: new Date(year, month, d) });
    return out;
  }, [year, month]);

  const agenda: CityEvent[] = selectedIso
    ? EVENTS.filter((e) => (e.endDate ? selectedIso >= e.date && selectedIso <= e.endDate : e.date === selectedIso))
    : EVENTS.filter((e) => (e.endDate ? e.endDate >= isoOf(TODAY) : e.date >= isoOf(TODAY))).sort((a, b) => a.date.localeCompare(b.date));

  const todayIso = isoOf(TODAY);

  return (
    <div style={{ background: "#FAFAF7", padding: "56px 40px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.05fr", gap: 28, alignItems: "start" }} className="ib-events-grid">
        {/* CALENDAR */}
        <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "28px 28px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>
              {MONTH_NAMES[month]} {year}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setCursor(new Date(year, month - 1, 1))}
                aria-label="Previous month"
                style={{ width: 34, height: 34, borderRadius: 9999, border: "1.5px solid rgba(20,20,25,0.12)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#44444C" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button
                onClick={() => { setCursor(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)); setSelectedIso(null); }}
                style={{ fontSize: 12.5, fontWeight: 600, color: "#6B6B73", border: "1.5px solid rgba(20,20,25,0.12)", background: "#fff", borderRadius: 9999, padding: "0 14px", cursor: "pointer" }}
              >
                Today
              </button>
              <button
                onClick={() => setCursor(new Date(year, month + 1, 1))}
                aria-label="Next month"
                style={{ width: 34, height: 34, borderRadius: 9999, border: "1.5px solid rgba(20,20,25,0.12)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#44444C" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
            {WEEKDAYS.map((w) => (
              <div key={w} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#9A958B", padding: "4px 0" }}>{w}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {cells.map((c, i) => {
              if (!c.date) return <div key={i} />;
              const iso = isoOf(c.date);
              const dayEvents = eventsOnDay(c.date);
              const isToday = iso === todayIso;
              const isSelected = iso === selectedIso;
              return (
                <button
                  key={i}
                  onClick={() => dayEvents.length > 0 && setSelectedIso(isSelected ? null : iso)}
                  disabled={dayEvents.length === 0}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 11,
                    border: isSelected ? `1.5px solid ${ORANGE}` : isToday ? "1.5px solid rgba(20,20,25,0.16)" : "1.5px solid transparent",
                    background: isSelected ? "rgba(242,101,34,0.10)" : isToday ? "rgba(20,20,25,0.04)" : "transparent",
                    cursor: dayEvents.length > 0 ? "pointer" : "default",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                    padding: 0,
                  }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: isToday || isSelected ? 700 : 500, color: dayEvents.length > 0 ? DARK : "#9A958B" }}>{c.date.getDate()}</span>
                  {dayEvents.length > 0 && (
                    <div style={{ display: "flex", gap: 2 }}>
                      {dayEvents.slice(0, 3).map((e) => (
                        <span key={e.id} style={{ width: 5, height: 5, borderRadius: 9999, background: CATEGORY_COLORS[e.category].color, display: "inline-block" }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(20,20,25,0.07)" }}>
            {(Object.keys(CATEGORY_COLORS) as (keyof typeof CATEGORY_COLORS)[]).map((cat) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: 9999, background: CATEGORY_COLORS[cat].color, display: "inline-block" }} />
                <span style={{ fontSize: 11.5, color: "#6B6B73" }}>{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AGENDA */}
        <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "28px 28px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: DARK }}>
              {selectedIso ? formatDate(selectedIso) : "Upcoming events"}
            </div>
            {selectedIso && (
              <button onClick={() => setSelectedIso(null)} style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer" }}>
                Show all ✕
              </button>
            )}
          </div>

          {agenda.length === 0 && (
            <p style={{ fontSize: 13.5, color: "#9A958B", padding: "12px 0" }}>No events on this date yet.</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {agenda.map((e) => {
              const cc = CATEGORY_COLORS[e.category];
              const [, m, d] = e.date.split("-").map(Number);
              return (
                <div key={e.id} className="ib-events-card" style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.08)", borderRadius: 14, padding: "16px 18px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center" }}>
                  <div style={{ textAlign: "center", width: 48 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: cc.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{String(d).padStart(2, "0")}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: "#6B6B73", marginTop: 3 }}>{MONTH_NAMES[m - 1].slice(0, 3).toUpperCase()}</div>
                  </div>
                  <div style={{ borderLeft: "1px solid rgba(20,20,25,0.1)", paddingLeft: 16, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: cc.color, background: cc.bg, padding: "3px 8px", borderRadius: 9999 }}>{e.category}</span>
                      <span style={{ fontSize: 11.5, color: "#9A958B" }}>{e.time} · {e.venue}</span>
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{e.title}</div>
                    <div style={{ fontSize: 11.5, color: "#9A958B", marginTop: 3 }}>{e.org}</div>
                  </div>
                  <a href="#" style={{ background: DARK, color: "#fff", fontWeight: 600, fontSize: 12, padding: "9px 16px", borderRadius: 9999, textDecoration: "none", whiteSpace: "nowrap" }}>{e.cta}</a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
