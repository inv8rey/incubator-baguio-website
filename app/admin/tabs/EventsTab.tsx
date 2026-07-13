"use client";

import { useEffect, useState } from "react";
import { DARK, ORANGE } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { CATEGORY_COLORS, EVENT_FORMATS, ORGANIZER_TYPES, type EventCategory, type EventFormat, type OrganizerType } from "../../calendar/data";

const EVENT_CATEGORIES = Object.keys(CATEGORY_COLORS) as EventCategory[];

const modalInputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.14)", fontSize: 13.5, color: DARK, outline: "none", fontFamily: "inherit" };
const modalLabelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 5, display: "block" };

const STATUSES = ["pending", "approved", "rejected"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABELS: Record<Status, string> = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
const STATUS_COLORS: Record<Status, { color: string; bg: string }> = {
  pending: { color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
  approved: { color: "#1A6B3C", bg: "rgba(26,107,60,0.12)" },
  rejected: { color: "#E23A2E", bg: "rgba(226,58,46,0.12)" },
};

interface EventRow {
  id: string;
  title: string;
  category: string;
  event_date: string;
  end_date: string;
  event_time: string;
  venue: string;
  org: string;
  org_type: string;
  format: string;
  description: string;
  cta: string;
  registration_link: string;
  contact_name: string;
  email: string;
  phone: string;
  status: Status;
  created_at: string;
}

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function AddEventModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EventCategory>("Workshop");
  const [eventDate, setEventDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [org, setOrg] = useState("Incubator Baguio");
  const [orgType, setOrgType] = useState<OrganizerType>(ORGANIZER_TYPES[0]);
  const [format, setFormat] = useState<EventFormat>("In-Person");
  const [description, setDescription] = useState("");
  const [cta, setCta] = useState("Register");
  const [registrationLink, setRegistrationLink] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !eventDate || !org.trim()) return;
    if (!supabase) {
      setError("Events aren't configured yet.");
      return;
    }
    setError("");
    setStatus("loading");
    const { error: err } = await supabase.from("event_submissions").insert({
      title: title.trim(),
      category,
      event_date: eventDate,
      end_date: endDate || null,
      event_time: eventTime.trim(),
      venue: venue.trim(),
      org: org.trim(),
      org_type: orgType,
      format,
      description: description.trim(),
      cta: cta.trim() || "Register",
      registration_link: registrationLink.trim(),
      status: "approved",
    });
    if (err) {
      setError(err.message);
      setStatus("error");
      return;
    }
    onAdded();
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 560, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: 18, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Add event</div>
            <div style={{ fontSize: 12.5, color: "#9A958B", marginTop: 3 }}>Goes live on the calendar immediately.</div>
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
              <label style={modalLabelStyle}>End date (optional)</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={modalInputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={modalLabelStyle}>Time</label>
              <input value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="e.g. 2:00 PM" style={modalInputStyle} />
            </div>
            <div>
              <label style={modalLabelStyle}>Venue</label>
              <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Incubator Baguio Hub, or Online" style={modalInputStyle} />
            </div>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={modalLabelStyle}>Button label</label>
              <input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="e.g. Register, RSVP, Join online" style={modalInputStyle} />
            </div>
            <div>
              <label style={modalLabelStyle}>Registration link</label>
              <input type="url" value={registrationLink} onChange={(e) => setRegistrationLink(e.target.value)} placeholder="https://forms.gle/…" style={modalInputStyle} />
            </div>
          </div>

          {error && <p style={{ color: "#E23A2E", fontSize: 12.5, margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", background: "#fff", fontSize: 13.5, fontWeight: 500, cursor: "pointer", color: "#44444C" }}>Cancel</button>
            <button type="submit" disabled={status === "loading"} style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: ORANGE, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", opacity: status === "loading" ? 0.7 : 1 }}>
              {status === "loading" ? "Adding…" : "Add event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventsTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [status, setStatus] = useState<Status>("pending");
  const [loaded, setLoaded] = useState(false);
  const [viewing, setViewing] = useState<EventRow | null>(null);
  const [adding, setAdding] = useState(false);

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const { data } = await supabase.from("event_submissions").select("*").order("created_at", { ascending: false });
    setEvents((data as EventRow[]) ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  const q = searchQuery.toLowerCase();
  const filtered = events.filter((e) => e.status === status && (!q || e.title.toLowerCase().includes(q) || e.org.toLowerCase().includes(q)));

  async function setEventStatus(id: string, next: Status) {
    if (!supabase) return;
    const { error } = await supabase.from("event_submissions").update({ status: next }).eq("id", id);
    if (error) return window.alert(error.message);
    setViewing(null);
    load();
  }

  async function remove(id: string) {
    if (!supabase) return;
    if (!window.confirm("Delete this submission permanently? This can't be undone.")) return;
    const { error } = await supabase.from("event_submissions").delete().eq("id", id);
    if (error) return window.alert(error.message);
    setViewing(null);
    load();
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(20,20,25,0.09)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          {STATUSES.map((s) => {
            const active = status === s;
            const count = events.filter((e) => e.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  fontSize: 12.5,
                  fontWeight: active ? 600 : 500,
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "none",
                  color: active ? "#fff" : "#6B6B73",
                  background: active ? "#0E0E10" : "#F5F4F0",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {STATUS_LABELS[s]}
                <span style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>
              </button>
            );
          })}
        </div>
        <button onClick={() => setAdding(true)} style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 999, padding: "8px 16px", cursor: "pointer", flexShrink: 0 }}>+ Add event</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((e) => {
          const sc = STATUS_COLORS[e.status];
          return (
            <div key={e.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)", padding: 18, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: DARK }}>{e.title}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: sc.color, background: sc.bg, padding: "3px 9px", borderRadius: 999 }}>{STATUS_LABELS[e.status]}</span>
                </div>
                <div style={{ fontSize: 12, color: "#9A958B", marginBottom: 8 }}>
                  {formatDate(e.event_date)}{e.event_time ? ` · ${e.event_time}` : ""} · {e.venue || "TBD"} · {e.org} ({e.org_type})
                </div>
                <div style={{ fontSize: 12.5, color: "#6B6B73", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Submitted by {e.contact_name} &middot; {e.email}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => setViewing(e)} style={{ fontSize: 12, fontWeight: 600, color: "#285E7A", background: "none", border: "1.5px solid rgba(40,94,122,0.3)", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>View</button>
                {e.status !== "approved" && (
                  <button onClick={() => setEventStatus(e.id, "approved")} style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: "#1A6B3C", border: "none", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>Approve</button>
                )}
                {e.status !== "rejected" && (
                  <button onClick={() => setEventStatus(e.id, "rejected")} style={{ fontSize: 12, fontWeight: 600, color: "#E23A2E", background: "none", border: "1.5px solid rgba(226,58,46,0.3)", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>Reject</button>
                )}
              </div>
            </div>
          );
        })}

        {loaded && filtered.length === 0 && (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "#9A958B", fontSize: 13, background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)" }}>
            No {STATUS_LABELS[status].toLowerCase()} submissions.
          </div>
        )}
      </div>

      {viewing && (
        <div onClick={() => setViewing(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,15,17,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 26, width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 14, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: DARK }}>{viewing.title}</div>
              <button onClick={() => setViewing(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#9A958B", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <div><span style={{ color: "#9A958B" }}>Category:</span> <strong>{viewing.category}</strong></div>
              <div><span style={{ color: "#9A958B" }}>When:</span> <strong>{formatDate(viewing.event_date)}{viewing.end_date ? ` – ${formatDate(viewing.end_date)}` : ""}{viewing.event_time ? `, ${viewing.event_time}` : ""}</strong></div>
              <div><span style={{ color: "#9A958B" }}>Venue:</span> <strong>{viewing.venue || "—"}</strong> ({viewing.format})</div>
              <div><span style={{ color: "#9A958B" }}>Organizer:</span> <strong>{viewing.org}</strong> ({viewing.org_type})</div>
              {viewing.description && (
                <div>
                  <span style={{ color: "#9A958B" }}>Description:</span>
                  <p style={{ margin: "4px 0 0", lineHeight: 1.55 }}>{viewing.description}</p>
                </div>
              )}
              {viewing.registration_link && (
                <div><span style={{ color: "#9A958B" }}>Registration link:</span> <a href={viewing.registration_link} target="_blank" rel="noopener noreferrer" style={{ color: "#285E7A", fontWeight: 600 }}>{viewing.registration_link}</a></div>
              )}
              <div style={{ borderTop: "1px solid rgba(20,20,25,0.08)", paddingTop: 10 }}>
                <div><span style={{ color: "#9A958B" }}>Contact:</span> <strong>{viewing.contact_name}</strong></div>
                <div><span style={{ color: "#9A958B" }}>Email:</span> <strong>{viewing.email}</strong></div>
                {viewing.phone && <div><span style={{ color: "#9A958B" }}>Phone:</span> <strong>{viewing.phone}</strong></div>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              {viewing.status !== "approved" && (
                <button onClick={() => setEventStatus(viewing.id, "approved")} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "#1A6B3C", border: "none", borderRadius: 999, padding: "9px 18px", cursor: "pointer" }}>Approve</button>
              )}
              {viewing.status !== "rejected" && (
                <button onClick={() => setEventStatus(viewing.id, "rejected")} style={{ fontSize: 13, fontWeight: 600, color: "#E23A2E", background: "none", border: "1.5px solid rgba(226,58,46,0.3)", borderRadius: 999, padding: "9px 18px", cursor: "pointer" }}>Reject</button>
              )}
              <button onClick={() => remove(viewing.id)} style={{ fontSize: 13, fontWeight: 600, color: "#9A958B", background: "none", border: "1.5px solid rgba(20,20,25,0.12)", borderRadius: 999, padding: "9px 18px", cursor: "pointer", marginLeft: "auto" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {adding && (
        <AddEventModal
          onClose={() => setAdding(false)}
          onAdded={() => {
            setAdding(false);
            setStatus("approved");
            load();
          }}
        />
      )}
    </div>
  );
}
