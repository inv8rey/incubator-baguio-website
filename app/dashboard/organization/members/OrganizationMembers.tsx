"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRequiredOrg, OrgRequiredNotice } from "../OrgRequired";
import { cardStyle, DARK, ORANGE } from "../../styles";

interface MemberRow {
  id: string;
  role: string;
  created_at: string;
  full_name: string;
  email: string;
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function Roster({ orgId }: { orgId: string }) {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase!
        .from("organization_members")
        .select("id,role,created_at,profiles(full_name,email)")
        .eq("organization_id", orgId)
        .eq("status", "active")
        .order("created_at", { ascending: true });
      setMembers(
        (data ?? []).map((m: any) => ({
          id: m.id,
          role: m.role,
          created_at: m.created_at,
          full_name: m.profiles?.full_name || "Unnamed",
          email: m.profiles?.email || "",
        }))
      );
      setLoaded(true);
    })();
  }, [orgId]);

  return (
    <div style={cardStyle}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>Members</h2>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#5A544B" }}>
        Everyone with access to manage this organization&rsquo;s profile. Adding a second person is handled by Incubator Baguio &mdash; contact us to request one.
      </p>
      {!loaded ? (
        <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>Loading…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {members.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.1)", borderRadius: 12, padding: "12px 16px" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${ORANGE},#FF9A6C)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>
                {initialsOf(m.full_name)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>{m.full_name}</div>
                <div style={{ fontSize: 12, color: "#6E685F" }}>{m.email}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: m.role === "owner" ? ORANGE : "#5A544B", background: m.role === "owner" ? "rgba(242,101,34,0.1)" : "#fff", border: m.role === "owner" ? "none" : "1px solid rgba(64,50,34,0.13)", padding: "4px 11px", borderRadius: 999, textTransform: "capitalize", flexShrink: 0 }}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationMembers() {
  const { selectedOrg, loaded } = useRequiredOrg();
  if (!loaded) return <div style={{ padding: "40px 0", textAlign: "center", color: "#6E685F", fontSize: 14 }}>Loading&hellip;</div>;
  if (!selectedOrg) return <OrgRequiredNotice />;
  return <Roster orgId={selectedOrg.id} />;
}
