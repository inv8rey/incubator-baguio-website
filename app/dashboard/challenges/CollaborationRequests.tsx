"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";
import { cardStyle, DARK, ORANGE } from "../styles";

interface RequestRow {
  id: string;
  application_id: string;
  team_name: string;
  challenge_title: string;
  requester_name: string;
  requester_email: string;
  message: string;
  status: "new" | "read";
  created_at: string;
}

/**
 * A team's inbox for "Collaborate" clicks from the public challenge page
 * (app/challenges/CollaborateButton.tsx). Reads through
 * my_collaboration_requests(), a SECURITY DEFINER function scoped to the
 * caller's own applications -- see
 * supabase/migrations/2026-09-11c-challenge-collaboration-requests.sql.
 * The requester's name/email are shown directly here (unlike anywhere a
 * team's own contact info appears) because the requester chose to share it
 * for exactly this purpose.
 */
export default function CollaborationRequests() {
  const { user } = useAuth();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [viewing, setViewing] = useState<RequestRow | null>(null);

  async function load() {
    if (!supabase || !user) {
      setLoaded(true);
      return;
    }
    const { data } = await supabase.rpc("my_collaboration_requests");
    setRows((data as RequestRow[]) ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function open(row: RequestRow) {
    setViewing(row);
    if (row.status === "new" && supabase) {
      await supabase.rpc("mark_collaboration_request_read", { p_id: row.id });
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status: "read" } : r)));
    }
  }

  // Nothing to show for a user with no challenge applications at all -- the
  // "Challenges you've applied to" section (once one exists) is the natural
  // place to explain why; this card just stays out of the way rather than
  // showing an empty box on every visit.
  if (loaded && rows.length === 0) return null;

  const newCount = rows.filter((r) => r.status === "new").length;

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: DARK }}>Collaboration requests</h2>
        {newCount > 0 && (
          <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: ORANGE, borderRadius: 999, padding: "2px 8px" }}>{newCount} new</span>
        )}
      </div>
      <p style={{ margin: "0 0 18px", fontSize: 13, color: "#5A544B" }}>People who want to collaborate with a team you registered for a challenge.</p>

      {!loaded ? (
        <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>Loading…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => open(r)}
              style={{
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                background: "#F6F2EA",
                border: "1px solid rgba(64,50,34,0.1)",
                borderRadius: 10,
                padding: "12px 16px",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {r.status === "new" && <span style={{ width: 7, height: 7, borderRadius: 9999, background: ORANGE, flexShrink: 0 }} />}
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.requester_name}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "#6E685F", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.team_name}
                  {r.challenge_title ? ` · ${r.challenge_title}` : ""}
                </div>
              </div>
              <span style={{ fontSize: 11.5, color: "#6E685F", flexShrink: 0 }}>
                {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </button>
          ))}
        </div>
      )}

      {viewing && (
        <div
          onClick={() => setViewing(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,15,17,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 18, padding: 26, width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 14, maxHeight: "88vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 4 }}>
                  {viewing.team_name}
                  {viewing.challenge_title ? ` · ${viewing.challenge_title}` : ""}
                </div>
                <div style={{ fontSize: 16.5, fontWeight: 600, color: DARK }}>{viewing.requester_name}</div>
              </div>
              <button onClick={() => setViewing(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#6E685F", lineHeight: 1, flexShrink: 0 }}>
                ×
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <div>
                <span style={{ color: "#6E685F" }}>Email:</span>{" "}
                <a href={`mailto:${viewing.requester_email}`} style={{ color: ORANGE, fontWeight: 600 }}>
                  {viewing.requester_email}
                </a>
              </div>
              <div>
                <span style={{ color: "#6E685F" }}>Received:</span> <strong>{new Date(viewing.created_at).toLocaleString()}</strong>
              </div>
              <div style={{ borderTop: "1px solid rgba(64,50,34,0.11)", paddingTop: 10, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{viewing.message}</div>
            </div>
            <a
              href={`mailto:${viewing.requester_email}`}
              style={{ alignSelf: "flex-start", fontSize: 13, fontWeight: 600, color: "#fff", background: "#1A6B3C", border: "none", borderRadius: 999, padding: "9px 18px", textDecoration: "none" }}
            >
              Reply by email
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
