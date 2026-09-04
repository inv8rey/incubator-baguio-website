"use client";

import { useEffect, useMemo, useState } from "react";
import { DARK, ORANGE } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { initialsOf, paletteFor } from "../../../lib/visualIdentity";

const STATUSES = ["new", "shortlisted", "accepted", "rejected"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABELS: Record<Status, string> = {
  new: "New",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Not selected",
};

const STATUS_COLORS: Record<Status, { color: string; bg: string }> = {
  new: { color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
  shortlisted: { color: "#285E7A", bg: "rgba(40,94,122,0.12)" },
  accepted: { color: "#1A6B3C", bg: "rgba(26,107,60,0.12)" },
  rejected: { color: "#6E685F", bg: "rgba(64,50,34,0.08)" },
};

interface ApplicationRow {
  id: string;
  challenge_id: string;
  applicant_id: string;
  team_name: string;
  contact_name: string;
  email: string;
  phone: string;
  team_size: string;
  affiliation: string;
  role: string;
  course: string;
  approach: string;
  why_you: string;
  status: Status;
  review_note: string;
  reviewed_at: string | null;
  created_at: string;
}

function displayName(a: ApplicationRow) {
  return a.team_name || a.contact_name || "Untitled submission";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: DARK, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{value || "—"}</div>
    </div>
  );
}

export default function ChallengeApplicationsTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status | "all">("new");
  const [challengeFilter, setChallengeFilter] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState<ApplicationRow | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const [apps, challenges] = await Promise.all([
      supabase.from("challenge_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("challenges").select("id,title"),
    ]);
    if (apps.error) {
      setError(
        apps.error.message.includes("status")
          ? "This tab needs the challenge-application review migration. Run supabase/migrations/2026-08-28c-challenge-application-review.sql, then reload."
          : apps.error.message
      );
      setLoaded(true);
      return;
    }
    setError("");
    setRows((apps.data as ApplicationRow[]) ?? []);
    setTitles(Object.fromEntries(((challenges.data as { id: string; title: string }[]) ?? []).map((c) => [c.id, c.title])));
    setLoaded(true);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel("admin-challenge-applications")
      .on("postgres_changes", { event: "*", schema: "public", table: "challenge_applications" }, load)
      .subscribe();
    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  const q = searchQuery.toLowerCase();
  const filtered = rows.filter(
    (r) =>
      (status === "all" || r.status === status) &&
      (!challengeFilter || r.challenge_id === challengeFilter) &&
      (!q ||
        displayName(r).toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.approach.toLowerCase().includes(q) ||
        (titles[r.challenge_id] ?? "").toLowerCase().includes(q))
  );

  // Only challenges that actually have submissions — a dropdown of every
  // challenge ever posted would be mostly dead options.
  const challengesWithSubmissions = useMemo(() => {
    const ids = Array.from(new Set(rows.map((r) => r.challenge_id)));
    return ids
      .map((id) => ({ id, title: titles[id] ?? "Unknown challenge", count: rows.filter((r) => r.challenge_id === id).length }))
      .sort((a, b) => b.count - a.count);
  }, [rows, titles]);

  async function setStatusFor(row: ApplicationRow, next: Status) {
    if (!supabase) return;
    setBusy(true);
    const { error: err } = await supabase
      .from("challenge_applications")
      .update({ status: next, reviewed_at: new Date().toISOString() })
      .eq("id", row.id);
    setBusy(false);
    if (err) return window.alert(err.message);
    setViewing((v) => (v && v.id === row.id ? { ...v, status: next } : v));
    load();
  }

  async function saveNote(row: ApplicationRow) {
    if (!supabase) return;
    setBusy(true);
    const { error: err } = await supabase.from("challenge_applications").update({ review_note: note }).eq("id", row.id);
    setBusy(false);
    if (err) return window.alert(err.message);
    setViewing((v) => (v && v.id === row.id ? { ...v, review_note: note } : v));
    load();
  }

  async function remove(id: string) {
    if (!supabase) return;
    if (!window.confirm("Delete this submission permanently? This can't be undone.")) return;
    const { error: err } = await supabase.from("challenge_applications").delete().eq("id", id);
    if (err) return window.alert(err.message);
    setViewing(null);
    load();
  }

  function open(row: ApplicationRow) {
    setViewing(row);
    setNote(row.review_note || "");
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      {error && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(226,58,46,0.24)", padding: 18 }}>
          <div style={{ color: "#E23A2E", fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>Could not load submissions</div>
          <div style={{ color: "#5A544B", fontSize: 13, lineHeight: 1.6 }}>{error}</div>
        </div>
      )}

      {/* Status filter */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(64,50,34,0.12)", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {(["all", ...STATUSES] as const).map((s) => {
          const active = status === s;
          const count = s === "all" ? rows.length : rows.filter((r) => r.status === s).length;
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
                color: active ? "#fff" : "#5A544B",
                background: active ? "#131110" : "#F5F4F0",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {s === "all" ? "All" : STATUS_LABELS[s]}
              <span style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>
            </button>
          );
        })}

        {challengesWithSubmissions.length > 1 && (
          <select
            value={challengeFilter ?? ""}
            onChange={(e) => setChallengeFilter(e.target.value || null)}
            style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 500, color: DARK, background: "#F5F4F0", border: "none", borderRadius: 999, padding: "7px 14px", cursor: "pointer", maxWidth: 280 }}
          >
            <option value="">All challenges</option>
            {challengesWithSubmissions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.count})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((r) => {
          const sc = STATUS_COLORS[r.status] ?? STATUS_COLORS.new;
          const name = displayName(r);
          const p = paletteFor(name);
          return (
            <button
              key={r.id}
              onClick={() => open(r)}
              style={{ textAlign: "left", background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)", padding: 18, cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: p.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                {initialsOf(name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: sc.color, background: sc.bg, padding: "3px 9px", borderRadius: 999 }}>{STATUS_LABELS[r.status]}</span>
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: DARK }}>{name}</span>
                  <span style={{ fontSize: 11.5, color: "#6E685F", marginLeft: "auto" }}>{formatDate(r.created_at)}</span>
                </div>
                <div style={{ fontSize: 12.5, color: ORANGE, fontWeight: 600, marginBottom: 4 }}>
                  {titles[r.challenge_id] ?? "Unknown challenge"}
                </div>
                <div style={{ fontSize: 12.5, color: "#5A544B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.approach || r.why_you || "No approach described."}
                </div>
              </div>
            </button>
          );
        })}

        {loaded && !error && filtered.length === 0 && (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "#6E685F", fontSize: 13, background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)" }}>
            {rows.length === 0
              ? "No solutions submitted yet. They'll appear here as teams apply to challenges."
              : `No ${status === "all" ? "" : STATUS_LABELS[status as Status].toLowerCase() + " "}submissions match these filters.`}
          </div>
        )}
      </div>

      {/* Detail */}
      {viewing && (
        <div onClick={() => setViewing(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,15,17,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 26, width: "100%", maxWidth: 620, display: "flex", flexDirection: "column", gap: 18, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: ORANGE, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                  {titles[viewing.challenge_id] ?? "Unknown challenge"}
                </div>
                <div style={{ fontSize: 19, fontWeight: 600, color: DARK, lineHeight: 1.25 }}>{displayName(viewing)}</div>
                <div style={{ fontSize: 12.5, color: "#6E685F", marginTop: 5 }}>Submitted {formatDate(viewing.created_at)}</div>
              </div>
              <button onClick={() => setViewing(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: "#6E685F", lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>

            <div className="ib-admin-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 14 }}>
              <Field label="Contact" value={viewing.contact_name} />
              <Field label="Team size" value={viewing.team_size} />
              <Field label="Role" value={viewing.role} />
              <Field label="Affiliation" value={viewing.affiliation} />
              <Field label="Course / Program" value={viewing.course} />
              <Field label="Phone" value={viewing.phone} />
            </div>

            <div style={{ borderTop: "1px solid rgba(64,50,34,0.11)", paddingTop: 16, display: "grid", gap: 14 }}>
              <Field label="Proposed approach" value={viewing.approach} />
              <Field label="Why this team" value={viewing.why_you} />
            </div>

            <div style={{ borderTop: "1px solid rgba(64,50,34,0.11)", paddingTop: 16 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 8 }}>
                Internal review note
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => note !== viewing.review_note && saveNote(viewing)}
                placeholder="Only visible to admins — why this team stood out, what to ask next."
                style={{ width: "100%", fontSize: 13.5, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", outline: "none", boxSizing: "border-box", minHeight: 66, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ borderTop: "1px solid rgba(64,50,34,0.11)", paddingTop: 16, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {STATUSES.filter((s) => s !== viewing.status).map((s) => {
                const sc = STATUS_COLORS[s];
                return (
                  <button
                    key={s}
                    disabled={busy}
                    onClick={() => setStatusFor(viewing, s)}
                    style={{ fontSize: 12.5, fontWeight: 600, color: sc.color, background: sc.bg, border: "none", borderRadius: 999, padding: "9px 16px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}
                  >
                    Mark {STATUS_LABELS[s].toLowerCase()}
                  </button>
                );
              })}
              <a
                href={`mailto:${viewing.email}?subject=${encodeURIComponent(`Your submission to ${titles[viewing.challenge_id] ?? "our challenge"}`)}`}
                style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", background: "#1A6B3C", borderRadius: 999, padding: "9px 16px", textDecoration: "none" }}
              >
                Reply by email
              </a>
              <button
                onClick={() => remove(viewing.id)}
                style={{ fontSize: 12.5, fontWeight: 600, color: "#6E685F", background: "none", border: "1.5px solid rgba(64,50,34,0.14)", borderRadius: 999, padding: "9px 16px", cursor: "pointer", marginLeft: "auto" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
