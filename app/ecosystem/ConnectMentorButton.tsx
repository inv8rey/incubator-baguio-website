"use client";

import { useState } from "react";
import { useAuth } from "../AuthProvider";
import { supabase } from "../../lib/supabaseClient";

const ORANGE = "#F26522";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const iconBtnStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 9999,
  background: "#fff",
  color: "#141417",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
  flexShrink: 0,
};

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );
}

export default function ConnectMentorButton({ mentorId, mentorName, variant = "pill" }: { mentorId: string; mentorName: string; variant?: "pill" | "icon" }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return variant === "icon" ? (
      <a href={`${BP}/login/?redirect=${encodeURIComponent(`${BP}/ecosystem/`)}`} style={{ ...iconBtnStyle, textDecoration: "none" }} aria-label={`Log in to connect with ${mentorName}`} title="Log in to connect">
        <ArrowIcon />
      </a>
    ) : (
      <a
        href={`${BP}/login/?redirect=${encodeURIComponent(`${BP}/ecosystem/`)}`}
        style={{ fontSize: 12, fontWeight: 600, color: ORANGE, textDecoration: "none", border: `1.5px solid ${ORANGE}`, padding: "7px 14px", borderRadius: 9999, display: "inline-block" }}
      >
        Connect
      </a>
    );
  }

  if (sent) {
    return variant === "icon" ? (
      <div style={{ ...iconBtnStyle, cursor: "default", color: "#1A6B3C" }} aria-label="Request sent" title="Request sent">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
      </div>
    ) : (
      <span style={{ fontSize: 12, fontWeight: 600, color: "#1A6B3C" }}>Request sent</span>
    );
  }

  if (!open) {
    return variant === "icon" ? (
      <button onClick={() => setOpen(true)} style={iconBtnStyle} aria-label={`Connect with ${mentorName}`} title="Connect">
        <ArrowIcon />
      </button>
    ) : (
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

  const composer = (
    <div onClick={(e) => e.stopPropagation()}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={`Say hello to ${mentorName}…`}
        style={{ width: "100%", fontSize: 12.5, color: "#141417", background: "#fff", border: "1.5px solid rgba(20,20,25,0.14)", borderRadius: 10, padding: "8px 10px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", minHeight: 60, resize: "vertical" }}
      />
      {error && <p style={{ color: "#E23A2E", fontSize: 11, margin: "4px 0 0" }}>{error}</p>}
      <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: variant === "icon" ? "flex-start" : "center" }}>
        <button onClick={send} disabled={busy} style={{ fontSize: 11.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "6px 12px", cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
          {busy ? "Sending…" : "Send request"}
        </button>
        <button onClick={() => setOpen(false)} style={{ fontSize: 11.5, fontWeight: 600, color: "#6B6B73", background: "none", border: "none", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );

  if (variant === "icon") {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "absolute", right: 14, bottom: 14, width: 220, background: "#fff", borderRadius: 14, padding: 12, boxShadow: "0 12px 32px rgba(0,0,0,0.35)", zIndex: 5 }}
      >
        {composer}
      </div>
    );
  }

  return <div style={{ textAlign: "left" }}>{composer}</div>;
}
