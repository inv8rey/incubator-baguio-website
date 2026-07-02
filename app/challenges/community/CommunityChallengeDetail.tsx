"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import RequireAuth from "../../RequireAuth";
import ApplyForm from "../[id]/apply/ApplyForm";

const DARK = "#141417";
const ORANGE = "#F26522";

interface Submission {
  id: string;
  title: string;
  org_name: string;
  org_type: string;
  sector: string;
  problem: string;
  scope: string;
  support: string;
  deadline: string;
  contact_name: string;
  email: string;
}

export default function CommunityChallengeDetail({ bp }: { bp: string }) {
  const params = useSearchParams();
  const id = params.get("id");
  const [item, setItem] = useState<Submission | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!supabase || !id) {
      setNotFound(true);
      return;
    }
    supabase
      .from("challenge_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true);
        else setItem(data as Submission);
      });
  }, [id]);

  if (notFound) {
    return (
      <div style={{ background: "#FAFAF7", padding: "64px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 14.5, color: "#6B6B73" }}>Challenge not found.</p>
        <a href={`${bp}/challenges/`} style={{ fontSize: 14, fontWeight: 600, color: ORANGE, textDecoration: "none" }}>Back to challenges</a>
      </div>
    );
  }

  if (!item) {
    return <div style={{ background: "#FAFAF7", padding: "64px 40px", textAlign: "center", color: "#9A958B", fontSize: 14 }}>Loading&hellip;</div>;
  }

  return (
    <>
      <div style={{ position: "relative", background: "#0B0B0D", padding: "44px 40px 48px", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", bottom: -140, left: "50%", transform: "translateX(-50%)", width: 480, height: 480, borderRadius: 9999, background: "radial-gradient(circle,rgba(242,101,34,0.28) 0%,transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto" }}>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", marginBottom: 18 }}>
            <a href={`${bp}/`} style={{ color: "inherit", textDecoration: "none" }}>Home</a> <span style={{ margin: "0 6px" }}>/</span>{" "}
            <a href={`${bp}/challenges/`} style={{ color: "inherit", textDecoration: "none" }}>Challenges</a> <span style={{ margin: "0 6px" }}>/</span>{" "}
            <span style={{ color: "rgba(255,255,255,0.8)" }}>{item.title}</span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 15px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.04)", marginBottom: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: ORANGE }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>Community-posted challenge</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 36, lineHeight: 1.15, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff" }}>{item.title}</h1>
          <p style={{ margin: "14px auto 0", fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.6)", maxWidth: 520 }}>
            Posted by {item.org_name} ({item.org_type}) {item.deadline ? `· Due ${item.deadline}` : ""}
          </p>
        </div>
      </div>

      <div style={{ background: "#FAFAF7", padding: "48px 40px 64px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "32px 36px" }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, background: "rgba(242,101,34,0.12)", padding: "5px 11px", borderRadius: 9999 }}>
              {item.sector || "General"}
            </span>
            <h2 style={{ margin: "18px 0 8px", fontSize: 16, fontWeight: 700, color: DARK }}>The problem</h2>
            <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.6, color: "#44444C" }}>{item.problem}</p>
            <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: DARK }}>What to build</h2>
            <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.6, color: "#44444C" }}>{item.scope}</p>
            {item.support && (
              <>
                <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: DARK }}>Support offered</h2>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#44444C" }}>{item.support}</p>
              </>
            )}
          </div>

          <RequireAuth bp={bp}>
            <ApplyForm challenge={{ id: item.id, title: item.title, orgName: item.org_name, nextDate: item.deadline }} bp={bp} />
          </RequireAuth>
        </div>
      </div>
    </>
  );
}
