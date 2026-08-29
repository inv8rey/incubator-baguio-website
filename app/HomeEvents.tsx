"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { type EventCategory } from "./calendar/data";
import EventsCarousel, { type CarouselEvent } from "./EventsCarousel";

const DARK = "#1A1714";
const BODY = "#5A544B";
const HAIR = "rgba(64,50,34,0.11)";

interface HomeEvent {
  id: string;
  date: string;
  endDate?: string;
  title: string;
  category: EventCategory;
  time: string;
  venue: string;
  registrationLink?: string;
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
    registrationLink: r.registration_link || undefined,
  };
}

export default function HomeEvents({ bp }: { bp: string }) {
  const [events, setEvents] = useState<HomeEvent[] | null>(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setEvents([]);
      return;
    }
    // public_events, not event_submissions: the view exposes display columns
    // only, keeping the organiser's email/phone off the public site.
    const { data } = await supabase
      .from("public_events")
      .select("*")
      .gte("event_date", todayIso())
      .order("event_date", { ascending: true })
      .limit(8);
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

  const carouselEvents: CarouselEvent[] = (events ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    category: e.category,
    date: e.date,
    endDate: e.endDate,
    time: e.time,
    venue: e.venue,
    href: e.registrationLink || `${bp}/calendar/`,
    external: !!e.registrationLink,
  }));

  return (
    <div style={{ background: "#FCFAF6", padding: "92px 40px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {!events ? (
          <div style={{ display: "flex", gap: 18 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ flex: 1, height: 300, borderRadius: 18, background: "#fff", border: `1px solid ${HAIR}` }} />
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
          <EventsCarousel
            events={carouselEvents}
            background="transparent"
            heading={
              <h2 style={{ margin: "0 0 12px", fontSize: 34, fontWeight: 600, letterSpacing: "-0.03em", color: DARK, lineHeight: 1.14 }}>
                What&rsquo;s happening in our ecosystem
              </h2>
            }
            intro="Join workshops, pitch events, mentoring sessions, and networking opportunities. Together, we build ideas into impact."
            ctaLabel="View all events"
            ctaHref={`${bp}/calendar/`}
          />
        )}
      </div>
    </div>
  );
}
