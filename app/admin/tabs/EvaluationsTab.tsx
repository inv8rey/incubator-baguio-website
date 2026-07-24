"use client";

import { useEffect, useMemo, useState } from "react";
import { DARK, ORANGE } from "../data";
import { supabase } from "../../../lib/supabaseClient";

interface FeedbackRow {
  id: string;
  visitor_type: string;
  visitor_type_other: string;
  visit_purpose: string;
  visit_purpose_other: string;
  startup_name: string;
  respondent_role: string;
  organization_contact: string;
  startup_sector: string;
  startup_stage: string;
  ratings: Record<string, string>;
  liked_most: string;
  takeaway: string;
  improvements: string;
  would_recommend: string;
  wants_updates: boolean;
  email: string;
  created_at: string;
}

const RATING_LABELS = [
  "The staff was welcoming and professional.",
  "The consultation addressed my questions or needs.",
  "The information and advice provided were helpful.",
  "Overall, I am satisfied with my experience.",
];

function clean(value?: string | null) {
  return value?.trim() || "—";
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function averageRating(row: FeedbackRow) {
  const values = Object.values(row.ratings ?? {})
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function scoreLabel(value: number | null) {
  return value == null ? "—" : value.toFixed(1);
}

function resolvedVisitorType(row: FeedbackRow) {
  return row.visitor_type === "Other" ? clean(row.visitor_type_other) : clean(row.visitor_type);
}

function resolvedVisitPurpose(row: FeedbackRow) {
  return row.visit_purpose === "Other" ? clean(row.visit_purpose_other) : clean(row.visit_purpose);
}

function StatBox({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)", padding: "16px 18px" }}>
      <div style={{ fontSize: 11, color: "#9A958B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ color: DARK, fontSize: 26, fontWeight: 800, marginTop: 8, lineHeight: 1 }}>{value}</div>
      {note && <div style={{ color: "#6B6B73", fontSize: 12.5, marginTop: 7 }}>{note}</div>}
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "#9A958B", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
      <div style={{ color: DARK, fontSize: 13.5, fontWeight: 600, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{value}</div>
    </div>
  );
}

export default function EvaluationsTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [visitorType, setVisitorType] = useState("All");
  const [viewing, setViewing] = useState<FeedbackRow | null>(null);

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }

    const { data, error: err } = await supabase
      .from("consultation_feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
      setLoaded(true);
      return;
    }

    setRows((data as FeedbackRow[]) ?? []);
    setError("");
    setLoaded(true);
  }

  useEffect(() => {
    load();

    if (!supabase) return;
    const channel = supabase
      .channel("admin-evaluations-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "consultation_feedback" }, load)
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  const visitorTypes = useMemo(() => {
    const values = Array.from(new Set(rows.map(resolvedVisitorType).filter((v) => v !== "—")));
    return ["All", ...values.sort()];
  }, [rows]);

  const q = searchQuery.toLowerCase();
  const filtered = rows.filter((row) => {
    const haystack = [
      resolvedVisitorType(row),
      resolvedVisitPurpose(row),
      row.startup_name,
      row.respondent_role,
      row.organization_contact,
      row.startup_sector,
      row.startup_stage,
      row.liked_most,
      row.takeaway,
      row.improvements,
      row.email,
    ]
      .join(" ")
      .toLowerCase();
    return (visitorType === "All" || resolvedVisitorType(row) === visitorType) && (!q || haystack.includes(q));
  });

  const ratingValues = rows
    .map(averageRating)
    .filter((value): value is number => value != null);
  const average = ratingValues.length
    ? ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length
    : null;
  const recommendYes = rows.filter((row) => row.would_recommend === "Yes").length;
  const wantsUpdates = rows.filter((row) => row.wants_updates).length;

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="ib-admin-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
        <StatBox label="Responses" value={String(rows.length)} note={loaded ? "From consultation visitors" : "Loading"} />
        <StatBox label="Average Rating" value={scoreLabel(average)} note="Across all rating statements" />
        <StatBox label="Would Recommend" value={String(recommendYes)} note={`${rows.length ? Math.round((recommendYes / rows.length) * 100) : 0}% answered yes`} />
        <StatBox label="Wants Updates" value={String(wantsUpdates)} note="Opted in to future programs" />
      </div>

      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(20,20,25,0.09)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: DARK, flexShrink: 0 }}>Visitor type</div>
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          {visitorTypes.map((type) => {
            const active = visitorType === type;
            const count = type === "All" ? rows.length : rows.filter((row) => resolvedVisitorType(row) === type).length;
            return (
              <button
                key={type}
                onClick={() => setVisitorType(type)}
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
                {type}
                <span style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(226,58,46,0.24)", padding: 18 }}>
          <div style={{ color: "#E23A2E", fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>Could not load consultation feedback</div>
          <div style={{ color: "#6B6B73", fontSize: 13, lineHeight: 1.6 }}>
            {error.includes("consultation_feedback")
              ? "The database table is not available yet. Run the consultation_feedback SQL in Supabase, then reload this tab."
              : error}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((row) => {
          const avg = averageRating(row);
          return (
            <div key={row.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)", padding: 18, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 16, alignItems: "start" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: ORANGE, background: "rgba(242,101,34,0.12)", padding: "3px 9px", borderRadius: 999 }}>{resolvedVisitorType(row)}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#285E7A", background: "rgba(40,94,122,0.10)", padding: "3px 9px", borderRadius: 999 }}>{resolvedVisitPurpose(row)}</span>
                  <span style={{ fontSize: 12, color: "#9A958B" }}>{displayDate(row.created_at)}</span>
                </div>
                <div style={{ color: DARK, fontSize: 15, fontWeight: 800, lineHeight: 1.35 }}>
                  {row.startup_name || row.respondent_role || row.organization_contact ? clean(row.startup_name || row.respondent_role || row.organization_contact) : "Anonymous visitor"}
                </div>
                <div style={{ color: "#6B6B73", fontSize: 12.5, marginTop: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.takeaway || row.liked_most || row.improvements || "No written response provided."}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: DARK, fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{scoreLabel(avg)}</div>
                  <div style={{ color: "#9A958B", fontSize: 10.5, marginTop: 3 }}>avg rating</div>
                </div>
                <button onClick={() => setViewing(row)} style={{ fontSize: 12, fontWeight: 700, color: "#285E7A", background: "none", border: "1.5px solid rgba(40,94,122,0.3)", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>View</button>
              </div>
            </div>
          );
        })}

        {loaded && !error && filtered.length === 0 && (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "#9A958B", fontSize: 13, background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)" }}>
            No consultation feedback yet.
          </div>
        )}
      </div>

      {viewing && (
        <div onClick={() => setViewing(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,15,17,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 26, width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", gap: 18, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: ORANGE, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Consultation Feedback</div>
                <div style={{ color: DARK, fontSize: 19, fontWeight: 800, lineHeight: 1.25 }}>{clean(viewing.startup_name || resolvedVisitorType(viewing))}</div>
                <div style={{ color: "#6B6B73", fontSize: 12.5, marginTop: 5 }}>{displayDate(viewing.created_at)}</div>
              </div>
              <button onClick={() => setViewing(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: "#9A958B", lineHeight: 1, flexShrink: 0 }}>x</button>
            </div>

            <div className="ib-admin-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
              <DetailLine label="Visitor type" value={resolvedVisitorType(viewing)} />
              <DetailLine label="Purpose" value={resolvedVisitPurpose(viewing)} />
              <DetailLine label="Average rating" value={scoreLabel(averageRating(viewing))} />
              <DetailLine label="Organization" value={clean(viewing.startup_name)} />
              <DetailLine label="Role" value={clean(viewing.respondent_role)} />
              <DetailLine label="Contact" value={clean(viewing.organization_contact || viewing.email)} />
              <DetailLine label="Sector" value={clean(viewing.startup_sector)} />
              <DetailLine label="Stage" value={clean(viewing.startup_stage)} />
              <DetailLine label="Wants updates" value={viewing.wants_updates ? "Yes" : "No"} />
            </div>

            <div style={{ borderTop: "1px solid rgba(20,20,25,0.08)", paddingTop: 16, display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
              <DetailLine label="What they liked most" value={clean(viewing.liked_most)} />
              <DetailLine label="Biggest takeaway" value={clean(viewing.takeaway)} />
              <DetailLine label="Improvement suggestion" value={clean(viewing.improvements)} />
              <DetailLine label="Would recommend" value={clean(viewing.would_recommend)} />
            </div>

            <div style={{ borderTop: "1px solid rgba(20,20,25,0.08)", paddingTop: 16 }}>
              <div style={{ color: "#9A958B", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Ratings</div>
              <div style={{ display: "grid", gap: 8 }}>
                {RATING_LABELS.map((label) => (
                  <div key={label} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 34px", gap: 12, alignItems: "center", fontSize: 13 }}>
                    <span style={{ color: "#6B6B73", lineHeight: 1.45 }}>{label}</span>
                    <strong style={{ color: DARK, textAlign: "right" }}>{viewing.ratings?.[label] ?? "—"}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
