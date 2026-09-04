"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRequiredOrg, OrgRequiredNotice } from "../OrgRequired";
import { cardStyle, primaryButtonStyle, DARK } from "../../styles";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface EventRow {
  id: string;
  title: string;
  event_date: string;
  venue: string;
  status: "pending" | "approved" | "rejected";
}

const STATUS_BADGE: Record<EventRow["status"], { label: string; color: string; bg: string }> = {
  pending: { label: "Pending review", color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
  approved: { label: "Live on calendar", color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" },
  rejected: { label: "Not approved", color: "#E23A2E", bg: "rgba(226,58,46,0.10)" },
};

function List({ orgId }: { orgId: string }) {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase!
        .from("event_submissions")
        .select("id,title,event_date,venue,status")
        .eq("organization_id", orgId)
        .order("event_date", { ascending: true });
      setRows((data as EventRow[]) ?? []);
      setLoaded(true);
    })();
  }, [orgId]);

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: DARK }}>Events</h2>
        <a href={`${BP}/calendar/?submit=1`} style={{ ...primaryButtonStyle, textDecoration: "none", padding: "9px 18px", fontSize: 13 }}>+ Submit an event</a>
      </div>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#5A544B" }}>Events submitted with this organization selected under &ldquo;Post as&rdquo;. Reviewed by Incubator Baguio before appearing on the calendar.</p>
      {!loaded ? (
        <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>Loading…</p>
      ) : rows.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>No events submitted yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.1)", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                <div style={{ fontSize: 11.5, color: "#6E685F", marginTop: 1 }}>{r.event_date}{r.venue ? ` · ${r.venue}` : ""}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_BADGE[r.status].color, background: STATUS_BADGE[r.status].bg, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>{STATUS_BADGE[r.status].label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationEvents() {
  const { selectedOrg, loaded } = useRequiredOrg();
  if (!loaded) return <div style={{ padding: "40px 0", textAlign: "center", color: "#6E685F", fontSize: 14 }}>Loading&hellip;</div>;
  if (!selectedOrg) return <OrgRequiredNotice />;
  return <List orgId={selectedOrg.id} />;
}
