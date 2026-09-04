"use client";

import { useEffect, useState } from "react";
import { DARK } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../AuthProvider";
import { initialsOf, paletteFor } from "../../../lib/visualIdentity";

interface MemberRow {
  id: string;
  full_name: string;
  email: string;
  is_mentor: boolean;
  is_admin: boolean;
  created_at: string;
  photo_url: string;
  preferred_name: string;
  role_title: string;
  org_affiliation: string;
  bio: string;
  location: string;
  areas_of_interest: string[];
  skills: string[];
  looking_for: string[];
  can_offer: string[];
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function tagRow(label: string, items: string[]) {
  if (!items.length) return null;
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6E685F", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((it) => (
          <span key={it} style={{ fontSize: 12, fontWeight: 500, color: "#5A544B", background: "#F5F4F0", borderRadius: 999, padding: "4px 10px" }}>{it}</span>
        ))}
      </div>
    </div>
  );
}

export default function MembersTab({ searchQuery = "" }: { searchQuery?: string }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [viewing, setViewing] = useState<MemberRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id,full_name,email,is_mentor,is_admin,created_at,photo_url,preferred_name,role_title,org_affiliation,bio,location,areas_of_interest,skills,looking_for,can_offer")
      .order("created_at", { ascending: false });
    const list = (data as MemberRow[]) ?? [];
    setRows(list);
    setViewing((prev) => (prev ? list.find((r) => r.id === prev.id) ?? null : null));
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  const q = searchQuery.toLowerCase();
  const filtered = rows.filter(
    (r) => !q || r.full_name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.org_affiliation?.toLowerCase().includes(q)
  );

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const recentCount = rows.filter((r) => Date.now() - new Date(r.created_at).getTime() < weekMs).length;
  const mentorCount = rows.filter((r) => r.is_mentor).length;
  const adminCount = rows.filter((r) => r.is_admin).length;

  async function toggleFlag(row: MemberRow, field: "is_mentor" | "is_admin") {
    if (!supabase) return;
    const next = !row[field];
    if (field === "is_admin") {
      if (row.id === user?.id && !next) {
        window.alert("You can't remove your own admin access.");
        return;
      }
      const verb = next ? "Grant" : "Remove";
      if (!window.confirm(`${verb} admin access ${next ? "to" : "from"} ${row.full_name || row.email}? Admins can manage every part of this site.`)) return;
    }
    setBusy(true);
    setError("");
    const { error: err } = await supabase.from("profiles").update({ [field]: next }).eq("id", row.id);
    setBusy(false);
    if (err) return setError(err.message);
    load();
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1.5px solid rgba(64,50,34,0.12)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 6 }}>Total members</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: DARK }}>{rows.length}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1.5px solid rgba(64,50,34,0.12)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 6 }}>New this week</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: DARK }}>{recentCount}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1.5px solid rgba(64,50,34,0.12)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 6 }}>Mentors</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: DARK }}>{mentorCount}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1.5px solid rgba(64,50,34,0.12)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 6 }}>Admins</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: DARK }}>{adminCount}</div>
        </div>
      </div>

      <div style={{ fontSize: 12.5, color: "#6E685F" }}>
        Showing <strong style={{ color: DARK }}>{filtered.length}</strong> of {rows.length}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)", overflow: "hidden" }}>
        {filtered.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.map((r) => {
              const p = paletteFor(r.full_name || r.email || "?");
              return (
                <button
                  key={r.id}
                  onClick={() => setViewing(r)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: "1px solid rgba(64,50,34,0.05)", background: "none", border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}
                >
                  {r.photo_url ? (
                    <img src={r.photo_url} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>
                      {initialsOf(r.full_name || r.email || "?")}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{r.full_name || "(no name set)"}</span>
                      {r.is_admin && <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#9E2A52", background: "rgba(158,42,82,0.12)", padding: "2px 8px", borderRadius: 999 }}>Admin</span>}
                      {r.is_mentor && <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#3A5FA0", background: "rgba(58,95,160,0.12)", padding: "2px 8px", borderRadius: 999 }}>Mentor</span>}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#6E685F", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.email}{r.org_affiliation ? ` · ${r.org_affiliation}` : ""}</div>
                  </div>
                  <span style={{ fontSize: 12, color: "#6E685F", flexShrink: 0 }}>{timeAgo(r.created_at)}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "#6E685F", fontSize: 13 }}>
            {loaded ? (searchQuery ? "No members match your search." : "No registered members yet.") : "Loading…"}
          </div>
        )}
      </div>

      {viewing && (
        <div onClick={() => setViewing(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,15,17,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 26, width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 16, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {viewing.photo_url ? (
                  <img src={viewing.photo_url} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: paletteFor(viewing.full_name || viewing.email || "?").color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 600, flexShrink: 0 }}>
                    {initialsOf(viewing.full_name || viewing.email || "?")}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: DARK }}>{viewing.full_name || "(no name set)"}</div>
                  {viewing.role_title && <div style={{ fontSize: 12.5, color: "#6E685F" }}>{viewing.role_title}{viewing.org_affiliation ? ` · ${viewing.org_affiliation}` : ""}</div>}
                </div>
              </div>
              <button onClick={() => setViewing(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#6E685F", lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <div><span style={{ color: "#6E685F" }}>Email:</span> <a href={`mailto:${viewing.email}`} style={{ color: "#F26522", fontWeight: 600 }}>{viewing.email}</a></div>
              {viewing.location && <div><span style={{ color: "#6E685F" }}>Location:</span> <strong>{viewing.location}</strong></div>}
              <div><span style={{ color: "#6E685F" }}>Joined:</span> <strong>{new Date(viewing.created_at).toLocaleString()}</strong></div>
              {viewing.bio && <p style={{ margin: 0, lineHeight: 1.6, color: "#44444C", borderTop: "1px solid rgba(64,50,34,0.08)", paddingTop: 10 }}>{viewing.bio}</p>}
            </div>

            {tagRow("Areas of interest", viewing.areas_of_interest || [])}
            {tagRow("Skills", viewing.skills || [])}
            {tagRow("Looking for", viewing.looking_for || [])}
            {tagRow("Can offer", viewing.can_offer || [])}

            {error && <p style={{ color: "#E23A2E", fontSize: 12.5, margin: 0 }}>{error}</p>}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid rgba(64,50,34,0.08)", paddingTop: 14 }}>
              <button
                onClick={() => toggleFlag(viewing, "is_mentor")}
                disabled={busy}
                style={{ fontSize: 12.5, fontWeight: 600, color: viewing.is_mentor ? "#3A5FA0" : "#5A544B", background: viewing.is_mentor ? "rgba(58,95,160,0.1)" : "#F5F4F0", border: "none", borderRadius: 999, padding: "8px 16px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}
              >
                {viewing.is_mentor ? "Remove mentor status" : "Mark as mentor"}
              </button>
              <button
                onClick={() => toggleFlag(viewing, "is_admin")}
                disabled={busy}
                style={{ fontSize: 12.5, fontWeight: 600, color: viewing.is_admin ? "#9E2A52" : "#5A544B", background: viewing.is_admin ? "rgba(158,42,82,0.1)" : "#F5F4F0", border: "none", borderRadius: 999, padding: "8px 16px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}
              >
                {viewing.is_admin ? "Remove admin access" : "Grant admin access"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
