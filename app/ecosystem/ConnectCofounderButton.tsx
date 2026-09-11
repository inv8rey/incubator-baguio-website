"use client";

import { useState } from "react";
import { useAuth } from "../AuthProvider";
import { supabase } from "../../lib/supabaseClient";

const ORANGE = "#F26522";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Mirrors ConnectMentorButton.tsx exactly -- same anonymous-vs-logged-in
// split, same inline composer -- just pointed at cofounder_connections
// instead of mentor_connections. Kept as its own file rather than a shared
// generic component: the two tables' columns already differ
// (cofounder_profile_id vs mentor_id) and the site has no existing
// convention for parameterizing that, so a second small file matches how
// OrgListCard/OrgPhotoCard etc. are already one component per shape rather
// than one overloaded one.
export default function ConnectCofounderButton({ cofounderId, cofounderName }: { cofounderId: string; cofounderName: string }) {
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
    const { error: err } = await supabase.from("cofounder_connections").insert({ cofounder_profile_id: cofounderId, requester_id: user.id, message });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ width: "100%" }}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={`Say hello to ${cofounderName}…`}
        style={{ width: "100%", fontSize: 12.5, color: "#1A1714", background: "#fff", border: "1.5px solid rgba(64,50,34,0.14)", borderRadius: 10, padding: "8px 10px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", minHeight: 60, resize: "vertical" }}
      />
      {error && <p style={{ color: "#E23A2E", fontSize: 11, margin: "4px 0 0" }}>{error}</p>}
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <button onClick={send} disabled={busy} style={{ fontSize: 11.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "6px 12px", cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
          {busy ? "Sending…" : "Send request"}
        </button>
        <button onClick={() => setOpen(false)} style={{ fontSize: 11.5, fontWeight: 600, color: "#5A544B", background: "none", border: "none", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
