"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { CATEGORY_COLORS, type EventCategory } from "./calendar/data";

const DARK = "#1A1714";
const BODY = "#5A544B";
const FAINT = "#8B8479";
const HAIR = "rgba(64,50,34,0.11)";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface HomeEvent {
  id: string;
  date: string;
  endDate?: string;
  title: string;
  category: EventCategory;
  time: string;
  venue: string;
  org: string;
  format: string;
  cta: string;
  registrationLink?: string;
}

/**
 * Parsed by hand rather than through `new Date(iso)` — that treats a bare
 * yyyy-mm-dd as UTC midnight, which can render as the previous day depending on
 * the viewer's offset.
 */
function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m: m - 1, d };
}

function todayIso() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function mapRow(r: any): HomeEvent {
  return {
    id: r.id,
    date: r.event_date,
    endDate: r.end_date || undefined,
    title: r.title,
    category: (r.category as EventCategory) || "Other",
    time: r.event_time || "",
    venue: r.venue || "",
    org: r.org || "",
    format: r.format || "In-Person",
    // Matches the remap in app/calendar/CalendarClient.tsx: "Register" was the
    // old stored default, custom labels pass through untouched.
    cta: !r.cta || r.cta === "Register" ? "View Event" : r.cta,
    registrationLink: r.registration_link || undefined,
  };
}

function DateTile({ iso, endIso }: { iso: string; endIso?: string }) {
  const start = parseIso(iso);
  const end = endIso ? parseIso(endIso) : null;
  const spansDays = end && (end.d !== start.d || end.m !== start.m);
  return (
    <div
      style={{
        width: 76,
        flexShrink: 0,
        borderRadius: 14,
        background: "#F6F2EA",
        border: `1px solid ${HAIR}`,
        padding: "12px 8px 11px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#D9531E" }}>{MONTHS[start.m]}</div>
      <div style={{ fontSize: 27, fontWeight: 500, letterSpacing: "-0.03em", color: DARK, lineHeight: 1.1, marginTop: 2 }}>
        {String(start.d).padStart(2, "0")}
      </div>
      {spansDays && (
        <div style={{ fontSize: 10.5, fontWeight: 500, color: FAINT, marginTop: 2 }}>
          &ndash; {MONTHS[end!.m]} {String(end!.d).padStart(2, "0")}
        </div>
      )}
    </div>
  );
}

export default function HomeEvents({ bp }: { bp: string }) {
  const [events, setEvents] = useState<HomeEvent[] | null>(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setEvents([]);
      return;
    }
    const { data } = await supabase
      .from("event_submissions")
      .select("*")
      .eq("status", "approved")
      .gte("event_date", todayIso())
      .order("event_date", { ascending: true })
      .limit(4);
    setEvents((data ?? []).map(mapRow));
  }, []);

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel("public-home-events")
      .on("postgres_changes", { event: "*", schema: "public", table: "event_submissions" }, load)
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, [load]);

  return (
    <div style={{ background: "#FCFAF6", padding: "92px 40px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 28, marginBottom: 44, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 580 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
              <span style={{ width: 22, height: 1, background: "rgba(242,101,34,0.5)" }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#F26522" }}>Events</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 40, fontWeight: 500, letterSpacing: "-0.032em", color: DARK, lineHeight: 1.14 }}>
              What&rsquo;s happening next in the ecosystem
            </h2>
          </div>
          <a
            href={`${bp}/calendar/`}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600, color: DARK, textDecoration: "none", paddingBottom: 4, borderBottom: "1.5px solid rgba(242,101,34,0.45)" }}
          >
            View full calendar
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F26522" strokeWidth={2.2}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </div>

        {!events ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ height: 104, borderRadius: 18, background: "#fff", border: `1px solid ${HAIR}` }} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div
            style={{
              borderRadius: 20,
              border: `1px dashed rgba(64,50,34,0.2)`,
              background: "#fff",
              padding: "56px 32px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 15,
                background: "#F6F2EA",
                border: `1px solid ${HAIR}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D9531E" strokeWidth={1.7} strokeLinecap="round">
                <rect x="3" y="5" width="18" height="16" rx="3" />
                <path d="M8 3v4M16 3v4M3 11h18" />
              </svg>
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 600, letterSpacing: "-0.015em", color: DARK }}>No upcoming events just yet</h3>
            <p style={{ margin: "0 auto 22px", fontSize: 14.5, lineHeight: 1.6, color: BODY, maxWidth: 400 }}>
              The calendar updates the moment a partner event is approved. Hosting something? Put it in front of the whole ecosystem.
            </p>
            <a
              href={`${bp}/calendar/?submit=1`}
              className="ib-cta-orange"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F26522", color: "#fff", fontWeight: 600, fontSize: 14.5, padding: "13px 26px", borderRadius: 9999, textDecoration: "none" }}
            >
              Submit an event
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {events.map((e) => {
              const cat = CATEGORY_COLORS[e.category] ?? CATEGORY_COLORS.Other;
              const meta = [e.time, e.venue, e.format].filter(Boolean);
              return (
                <div
                  key={e.id}
                  className="ib-card-hover ib-event-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto minmax(0,1fr) auto",
                    gap: 22,
                    alignItems: "center",
                    background: "#fff",
                    border: `1px solid ${HAIR}`,
                    borderRadius: 18,
                    padding: "18px 22px",
                    boxShadow: "var(--ib-shadow-sm)",
                  }}
                >
                  <DateTile iso={e.date} endIso={e.endDate} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: cat.color, background: cat.bg, padding: "5px 10px", borderRadius: 9999 }}>
                        {e.category}
                      </span>
                      {e.org && <span style={{ fontSize: 12.5, color: FAINT, minWidth: 0 }}>{e.org}</span>}
                    </div>
                    <h3 style={{ margin: "0 0 7px", fontSize: 19, fontWeight: 600, letterSpacing: "-0.018em", color: DARK, lineHeight: 1.28 }}>{e.title}</h3>
                    {meta.length > 0 && (
                      <div style={{ fontSize: 13.5, color: BODY, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {meta.map((m, i) => (
                          // nowrap so "In-Person" and times break as whole units
                          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                            {i > 0 && <span style={{ width: 3, height: 3, borderRadius: 9999, background: "rgba(64,50,34,0.28)" }} />}
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <a
                    href={e.registrationLink || `${bp}/calendar/`}
                    {...(e.registrationLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    style={{
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      background: DARK,
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 13.5,
                      padding: "11px 20px",
                      borderRadius: 9999,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {e.cta}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
