"use client";

import { useEffect, useState } from "react";
import { DARK } from "../data";
import { supabase } from "../../../lib/supabaseClient";

const STATUSES = ["pending", "approved", "rejected"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABELS: Record<Status, string> = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
const STATUS_COLORS: Record<Status, { color: string; bg: string }> = {
  pending: { color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
  approved: { color: "#1A6B3C", bg: "rgba(26,107,60,0.12)" },
  rejected: { color: "#E23A2E", bg: "rgba(226,58,46,0.12)" },
};

type EntityType = "startup" | "mentor" | "organization";
const ENTITY_LABELS: Record<EntityType, string> = { startup: "Startup", mentor: "Mentor", organization: "Organization" };
const ENTITY_COLORS: Record<EntityType, { color: string; bg: string }> = {
  startup: { color: "#F26522", bg: "rgba(242,101,34,0.12)" },
  mentor: { color: "#3A5FA0", bg: "rgba(58,95,160,0.12)" },
  organization: { color: "#9E2A52", bg: "rgba(158,42,82,0.12)" },
};

interface SignupRow {
  id: string;
  entity_type: EntityType;
  contact_name: string;
  email: string;
  phone: string;
  payload: Record<string, unknown>;
  status: Status;
  created_at: string;
}

function humanize(key: string) {
  const words = key.replace(/_/g, " ").split(" ");
  return words.map((w) => (w.toUpperCase() === "TBI" ? "TBI" : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");
}

function displayValue(v: unknown): string {
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

function payloadName(p: Record<string, unknown>): string {
  return typeof p.name === "string" && p.name ? p.name : "Untitled";
}

function payloadLogo(p: Record<string, unknown>): string {
  return typeof p.logo_url === "string" ? p.logo_url : "";
}

export default function EcosystemSignupsTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [signups, setSignups] = useState<SignupRow[]>([]);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("pending");
  const [loaded, setLoaded] = useState(false);
  const [viewing, setViewing] = useState<SignupRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const [{ data }, { count }] = await Promise.all([
      supabase.from("ecosystem_signups").select("*").order("created_at", { ascending: false }),
      supabase.from("ecosystem_signup_visits").select("*", { count: "exact", head: true }),
    ]);
    setSignups((data as SignupRow[]) ?? []);
    setVisitCount(count ?? 0);
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  const q = searchQuery.toLowerCase();
  const filtered = signups.filter((s) => s.status === status && (!q || payloadName(s.payload).toLowerCase().includes(q) || s.contact_name.toLowerCase().includes(q)));

  async function reject(id: string) {
    if (!supabase) return;
    const { error: err } = await supabase.from("ecosystem_signups").update({ status: "rejected" }).eq("id", id);
    if (err) return window.alert(err.message);
    setViewing(null);
    load();
  }

  async function approve(row: SignupRow) {
    if (!supabase) return;
    setBusy(true);
    setError("");
    const p = row.payload;
    let insertError: string | null = null;

    if (row.entity_type === "startup") {
      const { error: err } = await supabase.from("startups").insert({
        name: p.name,
        sector: p.sector,
        tbi_affiliation: p.tbi_affiliation,
        description: p.description,
        website: p.website,
        logo_url: p.logo_url || "",
        founders: p.founders || [],
        contact_email: row.email,
        owner_id: null,
      });
      insertError = err?.message ?? null;
    } else if (row.entity_type === "mentor") {
      const { error: err } = await supabase.from("mentors").insert({
        name: p.name,
        position: p.position,
        company: p.company,
        bio: p.bio,
        specializations: p.specializations,
        photo_url: p.logo_url || "",
        sector: p.sector || "",
        social_link: p.social_link || "",
        owner_id: null,
      });
      insertError = err?.message ?? null;
    } else {
      const { error: err } = await supabase.from("organizations").insert({
        name: p.name,
        org_type: p.org_type,
        type: p.type,
        description: p.description,
        website: p.website,
        logo_url: p.logo_url || "",
        cover_url: p.cover_url || "",
        contact_email: row.email,
        owner_id: null,
      });
      insertError = err?.message ?? null;
    }

    if (insertError) {
      setBusy(false);
      setError(insertError);
      return;
    }

    const { error: statusErr } = await supabase.from("ecosystem_signups").update({ status: "approved" }).eq("id", row.id);
    setBusy(false);
    if (statusErr) return window.alert(statusErr.message);
    setViewing(null);
    load();
  }

  async function remove(id: string) {
    if (!supabase) return;
    if (!window.confirm("Delete this submission permanently? This can't be undone.")) return;
    const { error: err } = await supabase.from("ecosystem_signups").delete().eq("id", id);
    if (err) return window.alert(err.message);
    setViewing(null);
    load();
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(20,20,25,0.09)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#6B6B73", flexShrink: 0 }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" /><circle cx={12} cy={12} r={3} /></svg>
          <span>
            <strong style={{ color: DARK, fontWeight: 700 }}>{visitCount ?? "—"}</strong> page visits
            {visitCount ? <span style={{ color: "#9A958B" }}> &middot; {signups.length} submitted ({Math.round((signups.length / visitCount) * 100)}%)</span> : null}
          </span>
        </div>
        <div style={{ width: 1, alignSelf: "stretch", background: "rgba(20,20,25,0.08)" }} />
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          {STATUSES.map((s) => {
            const active = status === s;
            const count = signups.filter((sg) => sg.status === s).length;
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
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((s) => {
          const sc = STATUS_COLORS[s.status];
          const ec = ENTITY_COLORS[s.entity_type];
          return (
            <div key={s.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)", padding: 18, display: "flex", gap: 16, alignItems: "flex-start" }}>
              {payloadLogo(s.payload) ? (
                <img src={payloadLogo(s.payload)} alt="" style={{ width: 40, height: 40, borderRadius: s.entity_type === "mentor" ? 9999 : 9, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: s.entity_type === "mentor" ? 9999 : 9, background: "#F5F4F0", flexShrink: 0 }} />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: ec.color, background: ec.bg, padding: "3px 9px", borderRadius: 999 }}>{ENTITY_LABELS[s.entity_type]}</span>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: DARK }}>{payloadName(s.payload)}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: sc.color, background: sc.bg, padding: "3px 9px", borderRadius: 999 }}>{STATUS_LABELS[s.status]}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "#6B6B73", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Submitted by {s.contact_name} &middot; {s.email}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => setViewing(s)} style={{ fontSize: 12, fontWeight: 600, color: "#285E7A", background: "none", border: "1.5px solid rgba(40,94,122,0.3)", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>View</button>
                {s.status !== "approved" && (
                  <button onClick={() => approve(s)} disabled={busy} style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: "#1A6B3C", border: "none", borderRadius: 999, padding: "7px 14px", cursor: "pointer", opacity: busy ? 0.7 : 1 }}>Approve</button>
                )}
                {s.status !== "rejected" && (
                  <button onClick={() => reject(s.id)} style={{ fontSize: 12, fontWeight: 600, color: "#E23A2E", background: "none", border: "1.5px solid rgba(226,58,46,0.3)", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>Reject</button>
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
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {payloadLogo(viewing.payload) ? (
                  <img src={payloadLogo(viewing.payload)} alt="" style={{ width: 48, height: 48, borderRadius: viewing.entity_type === "mentor" ? 9999 : 10, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: viewing.entity_type === "mentor" ? 9999 : 10, background: "#F5F4F0", flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: ENTITY_COLORS[viewing.entity_type].color, marginBottom: 4 }}>{ENTITY_LABELS[viewing.entity_type]}</div>
                  <div style={{ fontSize: 16.5, fontWeight: 700, color: DARK }}>{payloadName(viewing.payload)}</div>
                </div>
              </div>
              <button onClick={() => setViewing(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#9A958B", lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              {Object.entries(viewing.payload)
                .filter(([k]) => k !== "name" && k !== "logo_url")
                .map(([k, v]) => (
                  <div key={k}><span style={{ color: "#9A958B" }}>{humanize(k)}:</span> <strong>{displayValue(v)}</strong></div>
                ))}
              <div style={{ borderTop: "1px solid rgba(20,20,25,0.08)", paddingTop: 10 }}>
                <div><span style={{ color: "#9A958B" }}>Contact:</span> <strong>{viewing.contact_name}</strong></div>
                <div><span style={{ color: "#9A958B" }}>Email:</span> <strong>{viewing.email}</strong></div>
                {viewing.phone && <div><span style={{ color: "#9A958B" }}>Phone:</span> <strong>{viewing.phone}</strong></div>}
              </div>
            </div>
            {error && <p style={{ color: "#E23A2E", fontSize: 12.5, margin: 0 }}>{error}</p>}
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              {viewing.status !== "approved" && (
                <button onClick={() => approve(viewing)} disabled={busy} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "#1A6B3C", border: "none", borderRadius: 999, padding: "9px 18px", cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
                  {busy ? "Approving…" : "Approve"}
                </button>
              )}
              {viewing.status !== "rejected" && (
                <button onClick={() => reject(viewing.id)} style={{ fontSize: 13, fontWeight: 600, color: "#E23A2E", background: "none", border: "1.5px solid rgba(226,58,46,0.3)", borderRadius: 999, padding: "9px 18px", cursor: "pointer" }}>Reject</button>
              )}
              <button onClick={() => remove(viewing.id)} style={{ fontSize: 13, fontWeight: 600, color: "#9A958B", background: "none", border: "1.5px solid rgba(20,20,25,0.12)", borderRadius: 999, padding: "9px 18px", cursor: "pointer", marginLeft: "auto" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
