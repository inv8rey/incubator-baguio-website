"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";
import { cardStyle, rowItemStyle, DARK } from "../styles";

interface SentConnection {
  id: string;
  message: string;
  status: string;
  created_at: string;
  mentors: { name: string } | null;
}

interface ReceivedConnection {
  id: string;
  message: string;
  status: string;
  created_at: string;
  profiles: { full_name: string; email: string } | null;
}

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  pending: { color: "#D88A0A", bg: "rgba(245,166,35,0.16)" },
  accepted: { color: "#1A6B3C", bg: "rgba(26,107,60,0.12)" },
  declined: { color: "#E23A2E", bg: "rgba(226,58,46,0.12)" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, textTransform: "capitalize", color: c.color, background: c.bg, padding: "4px 10px", borderRadius: 9999 }}>
      {status}
    </span>
  );
}

export default function ConnectionsManager() {
  const { user } = useAuth();
  const [sent, setSent] = useState<SentConnection[]>([]);
  const [received, setReceived] = useState<ReceivedConnection[]>([]);
  const [isMentor, setIsMentor] = useState(false);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    if (!supabase || !user) return;
    const { data: sentData } = await supabase
      .from("mentor_connections")
      .select("id, message, status, created_at, mentors(name)")
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false });
    setSent((sentData as unknown as SentConnection[]) ?? []);

    const { data: mentorRow } = await supabase.from("mentors").select("id").eq("owner_id", user.id).maybeSingle();
    if (mentorRow) {
      setIsMentor(true);
      setMentorId(mentorRow.id);
      const { data: receivedData } = await supabase
        .from("mentor_connections")
        .select("id, message, status, created_at, profiles(full_name, email)")
        .eq("mentor_id", mentorRow.id)
        .order("created_at", { ascending: false });
      setReceived((receivedData as unknown as ReceivedConnection[]) ?? []);
    }
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, [user]);

  async function respond(id: string, status: "accepted" | "declined") {
    if (!supabase) return;
    await supabase.from("mentor_connections").update({ status }).eq("id", id);
    load();
  }

  if (!loaded) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {isMentor && (
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: DARK }}>Requests received</h2>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: "#9A958B" }}>Founders who want to connect with you as a mentor.</p>
          {received.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13.5, color: "#9A958B" }}>No requests yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {received.map((r) => (
                <div key={r.id} style={{ ...rowItemStyle, flexDirection: "column", alignItems: "stretch", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{r.profiles?.full_name || "Unknown"}</div>
                      <div style={{ fontSize: 12.5, color: "#9A958B" }}>{r.profiles?.email}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.message && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#44444C" }}>{r.message}</p>}
                  {r.status === "pending" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => respond(r.id, "accepted")} style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", background: "#1A6B3C", border: "none", borderRadius: 9999, padding: "8px 16px", cursor: "pointer" }}>
                        Accept
                      </button>
                      <button onClick={() => respond(r.id, "declined")} style={{ fontSize: 12.5, fontWeight: 600, color: "#44444C", background: "#F4F2EC", border: "none", borderRadius: 9999, padding: "8px 16px", cursor: "pointer" }}>
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: DARK }}>Requests you've sent</h2>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: "#9A958B" }}>Mentors you've asked to connect with from the Ecosystem directory.</p>
        {sent.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13.5, color: "#9A958B" }}>You haven't reached out to any mentors yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sent.map((s) => (
              <div key={s.id} style={rowItemStyle}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{s.mentors?.name || "Mentor"}</div>
                  {s.message && <div style={{ fontSize: 12.5, color: "#9A958B" }}>{s.message}</div>}
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
