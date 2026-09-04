"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRequiredOrg, OrgRequiredNotice } from "../OrgRequired";
import { cardStyle, primaryButtonStyle, DARK, ORANGE } from "../../styles";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface ChallengeRow {
  id: string;
  title: string;
  sector: string;
  deadline: string;
  created_at: string;
}

function List({ orgId }: { orgId: string }) {
  const [rows, setRows] = useState<ChallengeRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase!
        .from("challenge_submissions")
        .select("id,title,sector,deadline,created_at")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });
      setRows((data as ChallengeRow[]) ?? []);
      setLoaded(true);
    })();
  }, [orgId]);

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: DARK }}>Challenges</h2>
        <a href={`${BP}/challenges/post/`} style={{ ...primaryButtonStyle, textDecoration: "none", padding: "9px 18px", fontSize: 13 }}>+ Post a challenge</a>
      </div>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#5A544B" }}>Challenges posted with this organization selected under &ldquo;Post as&rdquo;. Goes live immediately under Community-posted challenges.</p>
      {!loaded ? (
        <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>Loading…</p>
      ) : rows.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>No challenges posted yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((r) => (
            <a key={r.id} href={`${BP}/challenges/community/?id=${r.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.1)", borderRadius: 10, padding: "12px 16px", textDecoration: "none" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                <div style={{ fontSize: 11.5, color: "#6E685F", marginTop: 1 }}>{r.sector}</div>
              </div>
              {r.deadline && <span style={{ fontSize: 11.5, color: ORANGE, fontWeight: 600, flexShrink: 0 }}>Due {r.deadline}</span>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationChallenges() {
  const { selectedOrg, loaded } = useRequiredOrg();
  if (!loaded) return <div style={{ padding: "40px 0", textAlign: "center", color: "#6E685F", fontSize: 14 }}>Loading&hellip;</div>;
  if (!selectedOrg) return <OrgRequiredNotice />;
  return <List orgId={selectedOrg.id} />;
}
