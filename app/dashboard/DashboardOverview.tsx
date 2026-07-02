"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import { supabase } from "../../lib/supabaseClient";
import { cardStyle, DARK, ORANGE } from "./styles";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface Counts {
  startups: number;
  isMentor: boolean;
  organizations: number;
  challengesPosted: number;
  applicationsSent: number;
  connectionsSent: number;
  connectionsReceived: number;
}

const CARDS: { key: keyof Counts | "isMentor"; title: string; desc: string; href: string; color: string; bg: string }[] = [
  { key: "startups", title: "Startup profiles", desc: "Create and manage your startup listing.", href: "/dashboard/startup/", color: "#F26522", bg: "rgba(242,101,34,0.12)" },
  { key: "isMentor", title: "Mentor Hub", desc: "Register or update your mentor profile.", href: "/dashboard/mentor/", color: "#3A7BD5", bg: "rgba(58,123,213,0.12)" },
  { key: "organizations", title: "Organizations", desc: "Publish your organization to the ecosystem directory.", href: "/dashboard/organizations/", color: "#0F9B8E", bg: "rgba(15,155,142,0.12)" },
  { key: "challengesPosted", title: "Posted challenges", desc: "Post a real-world problem to the marketplace.", href: "/challenges/post/", color: "#7C5CD6", bg: "rgba(124,92,214,0.12)" },
  { key: "applicationsSent", title: "Applications", desc: "Track challenges you've applied to.", href: "/challenges/", color: "#D88A0A", bg: "rgba(245,166,35,0.16)" },
  { key: "connectionsSent", title: "Mentor connections", desc: "Requests you've sent and received.", href: "/dashboard/connections/", color: "#E23A2E", bg: "rgba(226,58,46,0.12)" },
];

export default function DashboardOverview() {
  const { user, profile } = useAuth();
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    if (!supabase || !user) return;
    (async () => {
      const { data: mentorRow } = await supabase!.from("mentors").select("id").eq("owner_id", user.id).maybeSingle();

      const [startups, orgs, challenges, applications, sent, received] = await Promise.all([
        supabase!.from("startups").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
        supabase!.from("organizations").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
        supabase!.from("challenge_submissions").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
        supabase!.from("challenge_applications").select("id", { count: "exact", head: true }).eq("applicant_id", user.id),
        supabase!.from("mentor_connections").select("id", { count: "exact", head: true }).eq("requester_id", user.id),
        mentorRow
          ? supabase!.from("mentor_connections").select("id", { count: "exact", head: true }).eq("mentor_id", mentorRow.id)
          : Promise.resolve({ count: 0 }),
      ]);
      setCounts({
        startups: startups.count ?? 0,
        isMentor: !!mentorRow,
        organizations: orgs.count ?? 0,
        challengesPosted: challenges.count ?? 0,
        applicationsSent: applications.count ?? 0,
        connectionsSent: sent.count ?? 0,
        connectionsReceived: received.count ?? 0,
      });
    })();
  }, [user]);

  return (
    <div>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>
        Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
      </h2>
      <p style={{ margin: "0 0 28px", fontSize: 14, color: "#6B6B73" }}>Here's what you can do as a logged-in member of Incubator Baguio.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {CARDS.map((c) => {
          const value =
            c.key === "isMentor"
              ? counts
                ? counts.isMentor
                  ? "Active"
                  : "Not registered"
                : "…"
              : counts
              ? String(counts[c.key as keyof Counts])
              : "…";
          return (
            <a key={c.href} href={`${BP}${c.href}`} style={{ ...cardStyle, padding: 24, textDecoration: "none", display: "block" }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 15, fontWeight: 700, color: c.color }}>
                {value}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: DARK, marginBottom: 4 }}>{c.title}</div>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "#9A958B" }}>{c.desc}</p>
            </a>
          );
        })}
      </div>

      {counts && counts.connectionsReceived > 0 && (
        <div style={{ marginTop: 24, background: "rgba(226,58,46,0.06)", border: "1px solid rgba(226,58,46,0.2)", borderRadius: 14, padding: "16px 20px", fontSize: 13.5, color: DARK }}>
          You have <strong>{counts.connectionsReceived}</strong> mentor connection request{counts.connectionsReceived === 1 ? "" : "s"} waiting.{" "}
          <a href={`${BP}/dashboard/connections/`} style={{ color: ORANGE, fontWeight: 600, textDecoration: "none" }}>Review now →</a>
        </div>
      )}
    </div>
  );
}
