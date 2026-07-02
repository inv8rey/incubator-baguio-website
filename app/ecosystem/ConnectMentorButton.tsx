"use client";

import { useState } from "react";
import { useAuth } from "../AuthProvider";
import { supabase } from "../../lib/supabaseClient";

const ORANGE = "#F26522";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function ConnectMentorButton({ mentorId, mentorName }: { mentorId: string; mentorName: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <a
        href={`${BP}/login/?redirect=${encodeURIComponent(`${BP}/ecosystem/`)}`}
        style={{ fontSize: 12, fontWeight: 600, color: ORANGE, textDecoration: "none", border: `1.5px solid ${ORANGE}`, padding: "7px 14px", borderRadius: 9999, display: "inline-block" }}
      >
        Connect
      </a>
    );
  }

  if (sent) {
    return <span style={{ fontSize: 12, fontWeight: 600, color: "#1A6B3C" }}>Request sent</span>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ fontSize: 12, fontWeight: 600, color: ORANGE, background: "none", border: `1.5px solid ${ORANGE}`, padding: "7px 14px", borderRadius: 9999, cursor: "pointer" }}
      >
        Connect
      </button>
    );
  }

  async function send() {
    if (!supabase || !user) return;
    setBusy(true);
    setError("");
    const { error: err } = await supabase.from("mentor_connections").insert({ mentor_id: mentorId, requester_id: user.id, message });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  return (
    <div style={{ textAlign: "left" }} onClick={(e) => e.stopPropagation()}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={`Say hello to ${mentorName}…`}
        style={{ width: "100%", fontSize: 12.5, color: "#141417", background: "#fff", border: "1.5px solid rgba(20,20,25,0.14)", borderRadius: 10, padding: "8px 10px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", minHeight: 60, resize: "vertical" }}
      />
      {error && <p style={{ color: "#E23A2E", fontSize: 11, margin: "4px 0 0" }}>{error}</p>}
      <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "center" }}>
        <button onClick={send} disabled={busy} style={{ fontSize: 11.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "6px 12px", cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
          {busy ? "Sending…" : "Send request"}
        </button>
        <button onClick={() => setOpen(false)} style={{ fontSize: 11.5, fontWeight: 600, color: "#6B6B73", background: "none", border: "none", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
