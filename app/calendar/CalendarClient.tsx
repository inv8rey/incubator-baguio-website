"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
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
    cta: r.cta || "Register",
    registrationLink: r.registration_link || undefined,
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
  border: "1.5px solid rgba(20,20,25,0.12)",
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
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2.4} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

interface ChipData { key: string; label: string; time: string; color: string; bg: string }

function DayChip({ data, compact }: { data: ChipData; compact?: boolean }) {
  return (
    <div className="ib-events-chip" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: compact ? 10 : 10.5, fontWeight: 600, color: data.color, background: data.bg, borderRadius: 5, padding: "3px 6px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
      <span style={{ width: 5, height: 5, borderRadius: 9999, background: data.color, flexShrink: 0 }} />
      <span className="ib-events-chip-text" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{data.label} {data.time}</span>
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
            <a href={e.registrationLink || "#"} target={e.registrationLink ? "_blank" : undefined} rel={e.registrationLink ? "noopener noreferrer" : undefined} onClick={(ev) => { if (!e.registrationLink) ev.preventDefault(); }} style={{ background: DARK, color: "#fff", fontWeight: 600, fontSize: 11.5, padding: "7px 13px", borderRadius: 9999, textDecoration: "none", whiteSpace: "nowrap" }}>{e.cta}</a>
            <button aria-label="Save event" style={{ width: 27, height: 27, borderRadius: 8, border: "1.5px solid rgba(20,20,25,0.1)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2}><path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MentorRow({ s, booked, onBook }: { s: MentorSlot; booked: boolean; onBook: (s: MentorSlot) => void }) {
  const cc = MENTOR_EXPERTISE_COLORS[s.expertise];
  const [, m, d] = s.date.split("-").map(Number);
  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(20,20,25,0.06)", display: "flex", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 9999, background: s.color, color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: cc.color, background: cc.bg, padding: "2px 7px", borderRadius: 9999, flexShrink: 0 }}>{s.expertise}</span>
          <span style={{ fontSize: 11, color: "#9A958B" }}>{s.time} &middot; {s.duration}</span>
          <span style={{ fontSize: 11, color: "#C9C5BB", marginLeft: "auto", flexShrink: 0 }}>{MONTH_NAMES[m - 1].slice(0, 3)} {String(d).padStart(2, "0")}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: DARK, lineHeight: 1.3, marginBottom: 5 }}>{s.mentorName}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 11.5, color: "#9A958B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{s.venue}</span>
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

const modalInputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.14)", fontSize: 13.5, color: DARK, outline: "none", fontFamily: "inherit" };
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
          <div style={{ fontSize: 20, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Book a mentoring session</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F5F4F0", cursor: "pointer", fontSize: 18, color: "#6B6B73" }}>&times;</button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {preselected ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.08)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ width: 38, height: 38, borderRadius: 9999, background: preselected.color, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{preselected.initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: DARK }}>{preselected.mentorName}</div>
                <div style={{ fontSize: 12, color: "#9A958B" }}>{preselected.expertise} &middot; {formatLong(preselected.date)}, {preselected.time}</div>
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
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@startup.ph" style={modalInputStyle} required />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", background: "#fff", fontSize: 13.5, fontWeight: 500, cursor: "pointer", color: "#44444C" }}>Cancel</button>
            <button type="submit" disabled={!slot} style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: slot ? ORANGE : "#DEDAD2", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: slot ? "pointer" : "default" }}>Confirm booking</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const EVENT_CATEGORIES = Object.keys(CATEGORY_COLORS) as EventCategory[];

function SubmitEventModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EventCategory>("Workshop");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [org, setOrg] = useState("");
  const [orgType, setOrgType] = useState<OrganizerType>(ORGANIZER_TYPES[0]);
  const [format, setFormat] = useState<EventFormat>("In-Person");
  const [description, setDescription] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

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
      title: title.trim(),
      category,
      event_date: eventDate,
      event_time: eventTime.trim(),
      venue: venue.trim(),
      org: org.trim(),
      org_type: orgType,
      format,
      description: description.trim(),
      registration_link: registrationLink.trim(),
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
          <div style={{ fontSize: 19, fontWeight: 700, color: DARK, marginBottom: 8 }}>Event submitted</div>
          <p style={{ margin: "0 0 22px", fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73" }}>Thanks — your event is pending admin review and will appear on the calendar once approved.</p>
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
            <div style={{ fontSize: 20, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Submit an event</div>
            <div style={{ fontSize: 12.5, color: "#9A958B", marginTop: 3 }}>Reviewed by an admin before it goes live on the calendar.</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F5F4F0", cursor: "pointer", fontSize: 18, color: "#6B6B73", flexShrink: 0 }}>&times;</button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={modalLabelStyle}>Event title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Founder Fundamentals Workshop" style={modalInputStyle} required />
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
              <label style={modalLabelStyle}>Time</label>
              <input value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="e.g. 2:00 PM" style={modalInputStyle} />
            </div>
          </div>
          <div>
            <label style={modalLabelStyle}>Venue</label>
            <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Incubator Baguio Hub, or Online" style={modalInputStyle} />
          </div>
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
          <div style={{ borderTop: "1px solid rgba(20,20,25,0.08)", paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", background: "#fff", fontSize: 13.5, fontWeight: 500, cursor: "pointer", color: "#44444C" }}>Cancel</button>
            <button type="submit" disabled={status === "loading"} style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: ORANGE, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", opacity: status === "loading" ? 0.7 : 1 }}>
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
          <div style={{ fontSize: 20, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Subscribe to updates</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F5F4F0", cursor: "pointer", fontSize: 18, color: "#6B6B73", flexShrink: 0 }}>&times;</button>
        </div>
        {status === "done" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(26,107,60,0.08)", border: "1px solid rgba(26,107,60,0.2)", borderRadius: 12, padding: "14px 16px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1A6B3C" }}>You&rsquo;re subscribed to new events.</span>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73" }}>Get notified by email whenever a new event is added to the calendar.</p>
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
    supabase
      .from("event_submissions")
      .select("*")
      .eq("status", "approved")
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
  const itemsLabel = mode === "events" ? "events" : "sessions";
  const availableForModal = MENTOR_SLOTS.filter((s) => !bookedIds.has(s.id));

  return (
    <div style={{ background: "#FAFAF7", padding: "24px 32px 56px" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        {/* MODE TOGGLE + ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "#F4F2EC", borderRadius: 9999, padding: 3, gap: 2 }}>
            <button
              onClick={() => switchMode("events")}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 9999, border: "none", cursor: "pointer", color: mode === "events" ? "#fff" : "#6B6B73", background: mode === "events" ? DARK : "transparent" }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><rect x={3} y={4} width={18} height={17} rx={2} /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
              Events
            </button>
            <button
              onClick={() => switchMode("mentoring")}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 9999, border: "none", cursor: "pointer", color: mode === "mentoring" ? "#fff" : "#6B6B73", background: mode === "mentoring" ? ORANGE : "transparent" }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></svg>
              Mentoring
            </button>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {mode === "events" ? (
              <>
                <button onClick={() => setSubmitEventOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: ORANGE, background: "none", textDecoration: "none", border: "1.5px solid rgba(242,101,34,0.4)", padding: "11px 18px", borderRadius: 9999, cursor: "pointer" }}>+ Submit Event</button>
                <button onClick={() => setSubscribeOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: DARK, background: "none", textDecoration: "none", border: "1.5px solid rgba(20,20,25,0.14)", padding: "11px 18px", borderRadius: 9999, cursor: "pointer" }}>
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
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx={11} cy={11} r={7} />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIso(null); }}
                placeholder={mode === "events" ? "Search events, topics, or organizers..." : "Search mentors or expertise..."}
                style={{ width: "100%", boxSizing: "border-box", fontSize: 13, color: DARK, background: "#fff", border: "1.5px solid rgba(20,20,25,0.12)", borderRadius: 9999, padding: "10px 14px 10px 36px", outline: "none" }}
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
          </div>
          <div className="ib-events-viewtoggle" style={{ display: "flex", background: "#F4F2EC", borderRadius: 9999, padding: 3, gap: 2, flexShrink: 0 }}>
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{ fontSize: 12.5, fontWeight: 600, padding: "8px 16px", borderRadius: 9999, border: "none", cursor: "pointer", color: view === v ? "#fff" : "#6B6B73", background: view === v ? ORANGE : "transparent" }}
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
                  const dayItems = mode === "events" ? eventsOnDayFiltered(date) : slotsOnDayFiltered(date);
                  const dayChips: ChipData[] = mode === "events"
                    ? (dayItems as CityEvent[]).map((e) => ({ key: e.id, label: e.category, time: e.time, color: CATEGORY_COLORS[e.category].color, bg: CATEGORY_COLORS[e.category].bg }))
                    : (dayItems as MentorSlot[]).map((s) => ({ key: s.id, label: s.mentorName, time: s.time, color: MENTOR_EXPERTISE_COLORS[s.expertise].color, bg: MENTOR_EXPERTISE_COLORS[s.expertise].bg }));
                  const isToday = iso === todayIso;
                  const isSelected = iso === selectedIso;
                  const visible = dayChips.slice(0, view === "Week" ? 6 : 2);
                  const extra = dayChips.length - visible.length;
                  return (
                    <button
                      key={i}
                      className="ib-events-daycell"
                      onClick={() => dayItems.length > 0 && setSelectedIso(isSelected ? null : iso)}
                      disabled={dayItems.length === 0}
                      style={{
                        minHeight: view === "Week" ? 150 : 92,
                        borderRadius: 12,
                        border: isSelected ? `1.5px solid ${ORANGE}` : "1.5px solid rgba(20,20,25,0.07)",
                        background: isSelected ? "rgba(242,101,34,0.06)" : "#fff",
                        cursor: dayItems.length > 0 ? "pointer" : "default",
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
                          {dayItems.length > 0 && (
                            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: ORANGE }}>{dayItems.length} {dayItems.length === 1 ? itemsLabel.slice(0, -1) : itemsLabel}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: 12, fontWeight: 500, color: dayItems.length > 0 ? DARK : "#C9C5BB", padding: "1px 2px" }}>{date.getDate()}</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {visible.map((c) => <DayChip key={c.key} data={c} compact={view !== "Week"} />)}
                            {extra > 0 && <span style={{ fontSize: 10, fontWeight: 600, color: "#9A958B", padding: "1px 4px" }}>+{extra} more</span>}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(20,20,25,0.07)" }}>
                {mode === "events"
                  ? CATEGORIES.map((cat) => (
                      <div key={cat} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 9999, background: CATEGORY_COLORS[cat].color, display: "inline-block" }} />
                        <span style={{ fontSize: 11, color: "#6B6B73" }}>{cat}</span>
                      </div>
                    ))
                  : MENTOR_EXPERTISE_LIST.map((exp) => (
                      <div key={exp} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 9999, background: MENTOR_EXPERTISE_COLORS[exp].color, display: "inline-block" }} />
                        <span style={{ fontSize: 11, color: "#6B6B73" }}>{exp}</span>
                      </div>
                    ))}
              </div>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "24px 28px" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: DARK, marginBottom: 14 }}>All upcoming {itemsLabel}</div>
              {mode === "events" ? (
                <>
                  {filteredEvents.filter((e) => (e.endDate ? e.endDate >= todayIso : e.date >= todayIso)).sort((a, b) => a.date.localeCompare(b.date)).map((e) => <EventRow key={e.id} e={e} />)}
                  {filteredEvents.length === 0 && <p style={{ fontSize: 13.5, color: "#9A958B", padding: "12px 0" }}>No events match your filters.</p>}
                </>
              ) : (
                <>
                  {filteredSlots.filter((s) => s.date >= todayIso).sort((a, b) => a.date.localeCompare(b.date)).map((s) => <MentorRow key={s.id} s={s} booked={bookedIds.has(s.id)} onBook={openBooking} />)}
                  {filteredSlots.length === 0 && <p style={{ fontSize: 13.5, color: "#9A958B", padding: "12px 0" }}>No mentoring sessions match your filters.</p>}
                </>
              )}
            </div>
          )}

          {/* SIDEBAR */}
          <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "22px 24px" }}>
            {mode === "events" ? (
              daySelection ? (
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
              )
            ) : daySlotSelection ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.04em" }}>{formatLong(selectedIso!)}</div>
                  <button onClick={() => setSelectedIso(null)} style={{ fontSize: 12, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer" }}>Clear ✕</button>
                </div>
                {daySlotSelection.length === 0 && <p style={{ fontSize: 13, color: "#9A958B" }}>No mentoring sessions on this date.</p>}
                {daySlotSelection.map((s) => <MentorRow key={s.id} s={s} booked={bookedIds.has(s.id)} onBook={openBooking} />)}
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.04em" }}>{hasActiveFilters ? "Filtered sessions" : "Upcoming sessions"}</div>
                  {!hasActiveFilters && <button onClick={() => setView("Agenda")} style={{ fontSize: 12, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer" }}>View all</button>}
                </div>

                {groupedSlots.today.length === 0 && groupedSlots.thisWeek.length === 0 && groupedSlots.thisMonth.length === 0 && groupedSlots.later.length === 0 && (
                  <p style={{ fontSize: 13, color: "#9A958B", padding: "12px 0" }}>No mentoring sessions match your filters.</p>
                )}

                {groupedSlots.today.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B", marginBottom: 6 }}>Today &middot; {formatLong(todayIso).split(",")[0]}</div>
                    {groupedSlots.today.map((s) => <MentorRow key={s.id} s={s} booked={bookedIds.has(s.id)} onBook={openBooking} />)}
                  </div>
                )}
                {groupedSlots.thisWeek.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B", marginBottom: 6 }}>This week</div>
                    {groupedSlots.thisWeek.map((s) => <MentorRow key={s.id} s={s} booked={bookedIds.has(s.id)} onBook={openBooking} />)}
                  </div>
                )}
                {groupedSlots.thisMonth.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B", marginBottom: 6 }}>This month</div>
                    {groupedSlots.thisMonth.map((s) => <MentorRow key={s.id} s={s} booked={bookedIds.has(s.id)} onBook={openBooking} />)}
                  </div>
                )}
                {groupedSlots.later.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    {!showLater ? (
                      <button onClick={() => setShowLater(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#6B6B73", background: "#FAFAF7", border: "none", borderRadius: 10, padding: "10px 0", cursor: "pointer" }}>
                        More sessions coming up <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#6B6B73" strokeWidth={2.4}><path d="m6 9 6 6 6-6" /></svg>
                      </button>
                    ) : (
                      <>
                        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B", marginBottom: 6 }}>Later</div>
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
