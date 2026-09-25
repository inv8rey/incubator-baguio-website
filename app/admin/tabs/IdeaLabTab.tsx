"use client";

import { useEffect, useMemo, useState } from "react";
import { DARK } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { PRIORITY_AREAS, CHALLENGE_CATEGORY, type PriorityAreaSlug } from "../../../lib/idea-lab/agenda";

// Rough cost estimate. Update these to match the model you set in CLAUDE_MODEL.
const PRICE_PER_M_INPUT = 1;
const PRICE_PER_M_OUTPUT = 5;

interface Usage { created_at: string; kind: string; input_tokens: number; output_tokens: number }
interface Session { priority_area: string; program: string | null; project_type: string; created_at: string }
interface IdeaRef { id: string; title: string; problem: string; deliverable: string; parent_idea_id: string | null; session_id: string }
interface Shared {
  id: string;
  shared_at: string;
  show_name: boolean;
  display_name: string | null;
  school: string | null;
  contact_email: string | null;
  status: "pending" | "approved" | "rejected";
  moderator_note: string | null;
  sent_to_challenge_id: string | null;
  ideas: (IdeaRef & { idea_sessions: { priority_area: string; project_type: string; program: string | null } | null }) | null;
}
interface Claim { id: string; created_at: string; contact_email: string | null; message: string | null; shared_ideas: { ideas: { title: string } | null } | null }

const card = { background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)", padding: "16px 18px" } as const;
const pill = (on: boolean) => ({ fontSize: 12.5, fontWeight: 600, padding: "7px 16px", borderRadius: 999, border: "none", cursor: "pointer", color: on ? "#fff" : "#5A544B", background: on ? "#131110" : "transparent" }) as const;
const smallBtn = { fontSize: 12.5, fontWeight: 600, padding: "6px 13px", borderRadius: 999, border: "1.5px solid rgba(64,50,34,0.16)", background: "#fff", cursor: "pointer", color: DARK } as const;

function Bars({ data, label }: { data: { day: string; value: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 90 }}>
        {data.map((d) => (
          <div key={d.day} title={`${d.day}: ${d.value.toLocaleString()}`} style={{ flex: 1, background: "#F26522", opacity: d.value ? 1 : 0.15, borderRadius: 3, height: `${Math.max(3, (d.value / max) * 100)}%` }} />
        ))}
      </div>
    </div>
  );
}

function top(counts: Map<string, number>, n = 5) {
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

export default function IdeaLabTab() {
  const [mode, setMode] = useState<"moderation" | "claims" | "costs">("moderation");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [shared, setShared] = useState<Shared[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [usage, setUsage] = useState<Usage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notes, setNotes] = useState(0);
  const [refines, setRefines] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    if (!supabase) return;
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const [s, c, u, ss, n, r] = await Promise.all([
      supabase.from("shared_ideas").select("*, ideas(id, title, problem, deliverable, parent_idea_id, session_id, idea_sessions(priority_area, project_type, program))").order("shared_at", { ascending: false }).limit(300),
      supabase.from("idea_claims").select("*, shared_ideas(ideas(title))").order("created_at", { ascending: false }).limit(200),
      supabase.from("idea_usage").select("created_at, kind, input_tokens, output_tokens").gte("created_at", since).limit(5000),
      supabase.from("idea_sessions").select("priority_area, program, project_type, created_at").gte("created_at", since).limit(5000),
      supabase.from("concept_notes").select("id", { count: "exact", head: true }),
      supabase.from("ideas").select("id", { count: "exact", head: true }).not("parent_idea_id", "is", null),
    ]);
    const firstError = [s, c, u, ss].find((x) => x.error)?.error;
    setError(firstError ? `${firstError.message} (has the 2026-10-02 Idea Lab migration been run?)` : "");
    setShared((s.data as unknown as Shared[]) ?? []);
    setClaims((c.data as unknown as Claim[]) ?? []);
    setUsage((u.data as Usage[]) ?? []);
    setSessions((ss.data as Session[]) ?? []);
    setNotes(n.count ?? 0);
    setRefines(r.count ?? 0);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: Shared["status"], moderator_note?: string) {
    if (!supabase) return;
    const patch: Record<string, unknown> = { status };
    if (moderator_note !== undefined) patch.moderator_note = moderator_note;
    const { error: e } = await supabase.from("shared_ideas").update(patch).eq("id", id);
    if (e) return window.alert(e.message);
    setShared((rows) => rows.map((r) => (r.id === id ? { ...r, ...(patch as Partial<Shared>) } : r)));
  }

  // Maps a shared idea onto the existing challenges table without changing its
  // schema. It is created as Closed so it is not presented as an open call; staff
  // finish the details (organization, dates) in the Challenges tab, then open it.
  async function sendToChallenges(row: Shared) {
    if (!supabase || !row.ideas) return;
    const area = row.ideas.idea_sessions?.priority_area as PriorityAreaSlug | undefined;
    if (!window.confirm(`Create a draft challenge from "${row.ideas.title}"?\n\nIt is added as Closed so it is not shown as an open call. Finish the details in the Challenges tab, then open it.`)) return;
    const { data, error: e } = await supabase
      .from("challenges")
      .insert({
        title: row.ideas.title,
        category: area ? CHALLENGE_CATEGORY[area] : "Environmental Action",
        summary: row.ideas.problem.slice(0, 240),
        problem: row.ideas.problem,
        scope: row.ideas.deliverable,
        org_name: "Idea Lab",
        org_full: "Student idea from the R&I Idea Lab",
        org_type: "Academe",
        contact_email: row.contact_email ?? "",
        status: "Closed",
      })
      .select("id")
      .single();
    if (e || !data) return window.alert(e?.message ?? "Could not create the challenge.");
    await supabase.from("shared_ideas").update({ sent_to_challenge_id: data.id }).eq("id", row.id);
    setShared((rows) => rows.map((r) => (r.id === row.id ? { ...r, sent_to_challenge_id: data.id } : r)));
    setMessage("Draft challenge created. Find it in the Challenges tab (status Closed).");
  }

  const days = useMemo(() => {
    const out: string[] = [];
    for (let i = 13; i >= 0; i--) out.push(new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10));
    return out;
  }, []);
  const tokensByDay = days.map((day) => ({ day, value: usage.filter((u) => u.created_at.startsWith(day)).reduce((s, u) => s + u.input_tokens + u.output_tokens, 0) }));
  const gensByDay = days.map((day) => ({ day, value: usage.filter((u) => u.created_at.startsWith(day) && u.kind === "generate").length }));
  const costByDay = days.map((day) => {
    const rows = usage.filter((u) => u.created_at.startsWith(day));
    return { day, value: (rows.reduce((s, u) => s + u.input_tokens, 0) * PRICE_PER_M_INPUT + rows.reduce((s, u) => s + u.output_tokens, 0) * PRICE_PER_M_OUTPUT) / 1_000_000 };
  });
  const totalCost = costByDay.reduce((s, d) => s + d.value, 0);
  const topPrograms = top(sessions.reduce((m, s) => m.set(s.program || "Unknown", (m.get(s.program || "Unknown") ?? 0) + 1), new Map<string, number>()));
  const topAreas = top(sessions.reduce((m, s) => m.set(s.priority_area, (m.get(s.priority_area) ?? 0) + 1), new Map<string, number>()), 6);
  const areaName = (slug: string) => PRIORITY_AREAS.find((a) => a.slug === slug)?.name ?? slug;

  const list = shared.filter((s) => s.status === filter);

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 6, background: "#F5F4F0", borderRadius: 999, padding: 4, width: "fit-content" }}>
        {(["moderation", "claims", "costs"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} style={pill(mode === m)}>
            {m === "moderation" ? `Shared ideas (${shared.filter((s) => s.status === "pending").length} pending)` : m === "claims" ? `Claims (${claims.length})` : "Usage and cost"}
          </button>
        ))}
      </div>

      {error && <div style={{ ...card, borderColor: "rgba(179,38,30,0.4)", color: "#8C1D18", fontSize: 13.5 }}>{error}</div>}
      {message && <div style={{ ...card, color: "#1A6B3C", fontSize: 13.5 }}>{message}</div>}

      {mode === "moderation" && (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            {(["pending", "approved", "rejected"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ ...smallBtn, textTransform: "capitalize", background: filter === f ? "#131110" : "#fff", color: filter === f ? "#fff" : DARK }}>{f} ({shared.filter((s) => s.status === f).length})</button>
            ))}
          </div>
          {list.length === 0 && <div style={{ ...card, color: "#6E685F", fontSize: 14 }}>Nothing here.</div>}
          {list.map((r) => (
            <div key={r.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: DARK }}>{r.ideas?.title ?? "(idea removed)"}</div>
                  <div style={{ fontSize: 12.5, color: "#6E685F", marginTop: 3 }}>
                    {r.ideas?.idea_sessions ? `${r.ideas.idea_sessions.project_type} · ${areaName(r.ideas.idea_sessions.priority_area)}${r.ideas.idea_sessions.program ? ` · ${r.ideas.idea_sessions.program}` : ""}` : ""}
                    {" · "}{new Date(r.shared_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: "#6E685F", textAlign: "right" }}>
                  {r.show_name && r.display_name ? `${r.display_name}${r.school ? `, ${r.school}` : ""}` : "Anonymous"}
                  <br />{r.contact_email ?? "no email"}
                </div>
              </div>
              {r.ideas && <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.55, color: "#3A352E" }}>{r.ideas.problem}</p>}
              {r.moderator_note && <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 600, color: "#B84A12" }}>{r.moderator_note}</div>}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {r.status !== "approved" && <button style={{ ...smallBtn, background: "#1A6B3C", color: "#fff", border: "none" }} onClick={() => setStatus(r.id, "approved")}>Approve</button>}
                {r.status !== "rejected" && <button style={smallBtn} onClick={() => { const n = window.prompt("Reason (optional, private):") ?? undefined; setStatus(r.id, "rejected", n); }}>Reject</button>}
                {r.status === "approved" && (r.sent_to_challenge_id ? <span style={{ fontSize: 12.5, color: "#1A6B3C", alignSelf: "center" }}>Sent to challenges</span> : <button style={smallBtn} onClick={() => sendToChallenges(r)}>Send to challenge repository</button>)}
              </div>
            </div>
          ))}
        </>
      )}

      {mode === "claims" && (
        <>
          {claims.length === 0 && <div style={{ ...card, color: "#6E685F", fontSize: 14 }}>No claims yet.</div>}
          {claims.map((c) => (
            <div key={c.id} style={card}>
              <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{c.shared_ideas?.ideas?.title ?? "(idea removed)"}</div>
              <div style={{ fontSize: 13, color: "#6E685F", marginTop: 3 }}>{c.contact_email ? <a href={`mailto:${c.contact_email}`} style={{ color: "#F26522" }}>{c.contact_email}</a> : "no email"} · {new Date(c.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</div>
              {c.message && <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55 }}>{c.message}</p>}
            </div>
          ))}
        </>
      )}

      {mode === "costs" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
            {([
              ["Sessions (30 days)", sessions.length.toLocaleString()],
              ["Generations (30 days)", usage.filter((u) => u.kind === "generate").length.toLocaleString()],
              ["Refines (all time)", refines.toLocaleString()],
              ["Concept notes (all time)", notes.toLocaleString()],
              ["Shared / claimed", `${shared.length} / ${claims.length}`],
              ["Est. cost (14 days)", `$${totalCost.toFixed(2)}`],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l} style={card}><div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 6 }}>{l}</div><div style={{ fontSize: 24, fontWeight: 700, color: DARK }}>{v}</div></div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            <div style={card}><Bars data={costByDay.map((d) => ({ day: d.day, value: d.value }))} label="Estimated cost per day (USD)" /></div>
            <div style={card}><Bars data={gensByDay} label="Generations per day" /></div>
            <div style={card}><Bars data={tokensByDay} label="Tokens per day" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            <div style={card}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 8 }}>Top programs</div>
              {topPrograms.length === 0 && <div style={{ fontSize: 13.5, color: "#6E685F" }}>No data yet.</div>}
              {topPrograms.map(([n, c]) => <div key={n} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "3px 0" }}><span>{n}</span><strong>{c}</strong></div>)}
            </div>
            <div style={card}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 8 }}>Top priority areas</div>
              {topAreas.length === 0 && <div style={{ fontSize: 13.5, color: "#6E685F" }}>No data yet.</div>}
              {topAreas.map(([n, c]) => <div key={n} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "3px 0" }}><span>{areaName(n)}</span><strong>{c}</strong></div>)}
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#6E685F" }}>Cost is an estimate from token counts at ${PRICE_PER_M_INPUT} in and ${PRICE_PER_M_OUTPUT} out per million tokens. Edit the constants at the top of IdeaLabTab.tsx to match your model.</div>
        </>
      )}
    </div>
  );
}
