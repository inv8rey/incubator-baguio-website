"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const ORANGE = "#F26522";
const STATUSES = ["new", "shortlisted", "accepted", "waitlisted", "declined"] as const;
type Status = (typeof STATUSES)[number];
const STATUS_COLOR: Record<Status, string> = { new: "#8A8378", shortlisted: "#2F6FDE", accepted: "#1A8F4C", waitlisted: "#C27A0E", declined: "#D2453B" };

interface Row {
  id: string; created_at: string; full_name: string; email: string; phone: string; age: number; category: string; organization: string; municipality: string;
  expertise: string; skills: string[]; participation: "individual" | "team"; team_name: string; is_team_leader: boolean | null; team_leader_contact: string;
  team_size: number | null; team_members: string; contribution: string; teammate_preference: string; problem: string; solution_types: string[];
  motivation: string; available_full_duration: string; continue_after: string; heard_from: string; notes: string; status: Status; admin_note: string; show_in_finder: boolean;
}

interface LiveTeam { id: string; name: string; leader_id: string; locked: boolean; looking_for: string[]; created_at: string }
interface LivePerson { id: string; full_name: string; team_id: string | null }
const MAX_TEAMS = 30, MAX_MEMBERS = 5;

const bg = "#100D0B", panel = "#1A1714", line = "rgba(255,255,255,0.1)", dim = "rgba(255,255,255,0.55)";
const input: React.CSSProperties = { background: "#0F0D0B", border: `1px solid ${line}`, borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };
const btn: React.CSSProperties = { background: ORANGE, color: "#fff", border: "none", borderRadius: 9999, padding: "10px 20px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" };
const ghost: React.CSSProperties = { background: "none", color: "#fff", border: `1px solid ${line}`, borderRadius: 9999, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" };

function csvCell(v: unknown) {
  const s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export default function SiklabAdmin() {
  const [phase, setPhase] = useState<"loading" | "signin" | "denied" | "ready">("loading");
  const [rows, setRows] = useState<Row[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [q, setQ] = useState("");
  const [fPart, setFPart] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fTown, setFTown] = useState("");
  const [open, setOpen] = useState<Row | null>(null);
  const [note, setNote] = useState("");
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState<"applications" | "teams">("applications");
  const [liveTeams, setLiveTeams] = useState<LiveTeam[]>([]);
  const [livePeople, setLivePeople] = useState<LivePerson[]>([]);

  const load = useCallback(async () => {
    if (!supabase) { setPhase("signin"); return; }
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) { setPhase("signin"); return; }
    const { data: ok } = await supabase.rpc("siklab_is_admin");
    if (!ok) { setPhase("denied"); return; }
    const { data, error } = await supabase.from("siklab_registrations").select("*").order("created_at", { ascending: false });
    if (error) { setLoadError(error.message); setPhase("ready"); return; }
    setRows((data ?? []) as Row[]);
    // Team Finder tables exist only after that migration; the tab just shows the applications side without them.
    const [t, p] = await Promise.all([supabase.from("siklab_teams").select("id,name,leader_id,locked,looking_for,created_at").order("created_at"), supabase.from("siklab_participants_public").select("id,full_name,team_id")]);
    setLiveTeams(t.error ? [] : ((t.data ?? []) as LiveTeam[]));
    setLivePeople(p.error ? [] : ((p.data ?? []) as LivePerson[]));
    setLoadError("");
    setPhase("ready");
  }, []);

  useEffect(() => { load(); }, [load]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setAuthError("Wrong email or password."); return; }
    setPassword("");
    setPhase("loading");
    load();
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setRows([]);
    setPhase("signin");
  }

  async function save(id: string, patch: Partial<Pick<Row, "status" | "admin_note">>) {
    if (!supabase) return;
    const { error } = await supabase.from("siklab_registrations").update(patch).eq("id", id);
    if (error) { alert("Couldn't save: " + error.message); return; }
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    setOpen((o) => (o && o.id === id ? { ...o, ...patch } : o));
  }

  async function remove(id: string) {
    if (!supabase || !confirm("Permanently delete this application? This can't be undone.")) return;
    const { error } = await supabase.from("siklab_registrations").delete().eq("id", id);
    if (error) { alert("Couldn't delete: " + error.message); return; }
    setRows((r) => r.filter((x) => x.id !== id));
    setOpen(null);
  }

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((r) =>
      (!fPart || r.participation === fPart) && (!fStatus || r.status === fStatus) && (!fTown || r.municipality === fTown) &&
      (!t || [r.full_name, r.email, r.organization, r.team_name, r.expertise, r.skills.join(" ")].join(" ").toLowerCase().includes(t))
    );
  }, [rows, q, fPart, fStatus, fTown]);

  // A team is finalized once it's locked in or full. Teams that applied as a
  // complete team and were approved count too, unless they already have a live
  // Team Finder team of the same name (so nobody is counted twice).
  const teamBoard = useMemo(() => {
    const members = (id: string) => livePeople.filter((x) => x.team_id === id);
    const live = liveTeams.map((t) => {
      const m = members(t.id);
      return { key: t.id, name: t.name, size: m.length, leader: m.find((x) => x.id === t.leader_id)?.full_name ?? "", source: "Team Finder" as const, finalized: t.locked || m.length >= MAX_MEMBERS, names: m.map((x) => x.full_name) };
    });
    const liveNames = new Set(liveTeams.map((t) => t.name.toLowerCase()));
    const applied = rows
      .filter((r) => r.participation === "team" && r.status === "accepted" && !liveNames.has(r.team_name.toLowerCase()))
      .map((r) => ({ key: r.id, name: r.team_name, size: r.team_size ?? 0, leader: r.is_team_leader ? r.full_name : r.team_leader_contact, source: "Applied as a team" as const, finalized: true, names: [] as string[] }));
    const all = [...live, ...applied];
    return { all, finalized: all.filter((x) => x.finalized).length, live: live.length };
  }, [liveTeams, livePeople, rows]);

  function exportCsv() {
    const cols: (keyof Row)[] = ["created_at", "status", "full_name", "email", "phone", "age", "category", "organization", "municipality", "expertise", "skills", "participation", "team_name", "is_team_leader", "team_leader_contact", "team_size", "team_members", "contribution", "teammate_preference", "problem", "solution_types", "motivation", "available_full_duration", "continue_after", "heard_from", "notes", "admin_note"];
    const body = [cols.join(","), ...shown.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + body], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `pinasiklab-applications-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const shell = (children: React.ReactNode) => (
    <div style={{ minHeight: "100vh", background: bg, color: "#fff", fontFamily: "inherit" }}>{children}</div>
  );

  if (phase === "loading") return shell(<div style={{ padding: 60, textAlign: "center", color: dim }}>Loading…</div>);

  if (phase === "signin" || phase === "denied") {
    return shell(
      <div style={{ display: "flex", justifyContent: "center", padding: "90px 20px" }}>
        <form onSubmit={signIn} style={{ width: "100%", maxWidth: 400, background: panel, border: `1px solid ${line}`, borderRadius: 20, padding: "36px 32px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE }}>PinaSIKLab Baguio 2026</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Organizer sign in</h1>
          {phase === "denied" && <div style={{ fontSize: 13.5, color: "#FF8A80", lineHeight: 1.5 }}>This account isn&rsquo;t on the PinaSIKLab organizer list. Ask an organizer to add you, or sign in with a different account.</div>}
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={input} autoComplete="email" />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} autoComplete="current-password" />
          {authError && <div style={{ fontSize: 13, color: "#FF8A80" }}>{authError}</div>}
          <button type="submit" style={btn}>Sign in</button>
          {phase === "denied" && <button type="button" onClick={signOut} style={ghost}>Sign out</button>}
        </form>
      </div>
    );
  }

  const count = (f: (r: Row) => boolean) => rows.filter(f).length;
  const stats: [string, number][] = [["Applications", rows.length], ["Individuals", count((r) => r.participation === "individual")], ["Teams", count((r) => r.participation === "team")], ["Finalized teams", teamBoard.finalized], ["Approved", count((r) => r.status === "accepted")]];

  return shell(
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 20px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE }}>PinaSIKLab Baguio 2026</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>Applications</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={load} style={ghost}>Refresh</button>
          <button onClick={exportCsv} style={btn}>Export CSV ({shown.length})</button>
          <button onClick={signOut} style={ghost}>Sign out</button>
        </div>
      </div>

      {loadError && <div style={{ background: "rgba(210,69,59,0.15)", border: "1px solid rgba(210,69,59,0.4)", padding: 14, borderRadius: 12, marginBottom: 18, fontSize: 14 }}>Couldn&rsquo;t load applications: {loadError}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 22 }}>
        {stats.map(([l, n]) => (
          <div key={l} style={{ background: panel, border: `1px solid ${line}`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 26, fontWeight: 600 }}>{n}</div>
            <div style={{ fontSize: 12.5, color: dim, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {(["applications", "teams"] as const).map((t) => (
          <button key={t} onClick={() => setView(t)} style={{ ...ghost, background: view === t ? ORANGE : "none", borderColor: view === t ? ORANGE : line, textTransform: "capitalize" }}>{t === "teams" ? `Teams (${teamBoard.finalized}/${MAX_TEAMS} finalized)` : "Applications"}</button>
        ))}
      </div>

      {view === "teams" && (
        <div>
          <div style={{ background: panel, border: `1px solid ${line}`, borderRadius: 16, padding: "22px 24px", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.03em" }}>{teamBoard.finalized}<span style={{ color: dim }}> / {MAX_TEAMS}</span></span>
              <span style={{ fontSize: 14, color: dim }}>teams finalized</span>
            </div>
            <div style={{ height: 8, borderRadius: 9999, background: "rgba(255,255,255,0.1)", marginTop: 14, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (teamBoard.finalized / MAX_TEAMS) * 100)}%`, height: "100%", background: ORANGE }} />
            </div>
            <div style={{ fontSize: 12.5, color: dim, marginTop: 10, lineHeight: 1.5 }}>Finalized = locked in or full (5 members) on the Team Finder, plus approved teams that applied as a complete team. {teamBoard.all.length - teamBoard.finalized} more still forming.</div>
          </div>
          <div style={{ background: panel, border: `1px solid ${line}`, borderRadius: 16, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 640 }}>
              <thead><tr style={{ textAlign: "left", color: dim, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{["Team", "Members", "Leader", "Source", "Status"].map((h) => <th key={h} style={{ padding: "14px 16px", fontWeight: 600 }}>{h}</th>)}</tr></thead>
              <tbody>
                {[...teamBoard.all].sort((a, b) => Number(b.finalized) - Number(a.finalized)).map((t) => (
                  <tr key={t.key} style={{ borderTop: `1px solid ${line}` }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>{t.name}</td>
                    <td style={{ padding: "12px 16px" }} title={t.names.join(", ")}>{t.size} / {MAX_MEMBERS}</td>
                    <td style={{ padding: "12px 16px" }}>{t.leader}</td>
                    <td style={{ padding: "12px 16px", color: dim }}>{t.source}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ color: t.finalized ? "#1A8F4C" : "#C27A0E", fontWeight: 600 }}>● {t.finalized ? "Finalized" : "Forming"}</span></td>
                  </tr>
                ))}
                {teamBoard.all.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: dim }}>No teams yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "applications" && <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <input placeholder="Search name, email, school, team, skills…" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...input, flex: "1 1 260px" }} />
        <select value={fPart} onChange={(e) => setFPart(e.target.value)} style={input}><option value="">All types</option><option value="individual">Individual</option><option value="team">Team</option></select>
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={input}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{s === "accepted" ? "approved" : s}</option>)}</select>
        <select value={fTown} onChange={(e) => setFTown(e.target.value)} style={input}><option value="">All municipalities</option>{["Baguio City", "La Trinidad", "Itogon", "Sablan", "Tuba", "Tublay"].map((s) => <option key={s}>{s}</option>)}</select>
      </div>

      <div style={{ background: panel, border: `1px solid ${line}`, borderRadius: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 760 }}>
          <thead>
            <tr style={{ textAlign: "left", color: dim, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {["Applicant", "Type", "School / org", "Municipality", "Applied", "Status"].map((h) => <th key={h} style={{ padding: "14px 16px", fontWeight: 600 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} onClick={() => { setOpen(r); setNote(r.admin_note); }} style={{ borderTop: `1px solid ${line}`, cursor: "pointer" }}>
                <td style={{ padding: "12px 16px" }}><div style={{ fontWeight: 600 }}>{r.full_name}</div><div style={{ color: dim, fontSize: 12.5 }}>{r.email}</div></td>
                <td style={{ padding: "12px 16px" }}>{r.participation === "team" ? `Team: ${r.team_name}` : "Individual"}</td>
                <td style={{ padding: "12px 16px" }}>{r.organization}</td>
                <td style={{ padding: "12px 16px" }}>{r.municipality}</td>
                <td style={{ padding: "12px 16px", color: dim }}>{new Date(r.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</td>
                <td style={{ padding: "12px 16px" }}><span style={{ color: STATUS_COLOR[r.status], fontWeight: 600, textTransform: "capitalize" }}>● {r.status === "accepted" ? "approved" : r.status}</span></td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: dim }}>{rows.length ? "No applications match these filters." : "No applications yet."}</td></tr>}
          </tbody>
        </table>
      </div>

      </>}

      {open && (
        <div onClick={() => setOpen(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 100, display: "flex", justifyContent: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(560px, 100%)", height: "100%", overflowY: "auto", background: panel, borderLeft: `1px solid ${line}`, padding: "28px 26px 40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{open.full_name}</h2>
                <div style={{ color: dim, fontSize: 13.5, marginTop: 4 }}>{open.email}{open.phone ? ` · ${open.phone}` : ""}</div>
              </div>
              <button onClick={() => setOpen(null)} style={ghost}>Close</button>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "20px 0" }}>
              {STATUSES.map((s) => (
                <button key={s} onClick={() => save(open.id, { status: s })} style={{ ...ghost, textTransform: "capitalize", borderColor: open.status === s ? STATUS_COLOR[s] : line, background: open.status === s ? STATUS_COLOR[s] : "none" }}>{s === "accepted" ? "approved" : s}</button>
              ))}
            </div>
            <div style={{ fontSize: 12.5, color: dim, margin: "-8px 0 14px", lineHeight: 1.5 }}>{open.show_in_finder ? (open.status === "accepted" ? "Approved: this applicant is now listed on the Team Finder." : "Opted in to the Team Finder. They'll be listed once you approve them.") : "Did not opt in to the Team Finder."}</div>

            {([
              ["Age", String(open.age)], ["Describes them", open.category], ["School / organization", open.organization], ["Municipality", open.municipality],
              ["Expertise", open.expertise], ["Skills", open.skills.join(", ")],
              ["Participation", open.participation === "team" ? `Team "${open.team_name}" (${open.team_size} members)` : "Individual"],
              ["Team leader", open.participation === "team" ? (open.is_team_leader ? "This applicant" : open.team_leader_contact) : ""],
              ["Team members", open.team_members], ["Would contribute", open.contribution], ["Wants in teammates", open.teammate_preference],
              ["Problem areas", open.problem], ["Solution types", open.solution_types.join(", ")],
              ["Why participate", open.motivation], ["Available both days", open.available_full_duration], ["Keep building after", open.continue_after],
              ["Heard about it from", open.heard_from], ["Notes", open.notes],
            ] as [string, string][]).filter(([, v]) => v).map(([l, v]) => (
              <div key={l} style={{ padding: "10px 0", borderTop: `1px solid ${line}` }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: dim }}>{l}</div>
                <div style={{ fontSize: 14.5, lineHeight: 1.55, marginTop: 3, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{v}</div>
              </div>
            ))}

            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: dim, marginBottom: 6 }}>Organizer note (private)</div>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} maxLength={2000} style={{ ...input, width: "100%", resize: "vertical" }} />
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button onClick={() => save(open.id, { admin_note: note })} style={btn} disabled={note === open.admin_note}>Save note</button>
                <button onClick={() => remove(open.id)} style={{ ...ghost, color: "#FF8A80", marginLeft: "auto" }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
