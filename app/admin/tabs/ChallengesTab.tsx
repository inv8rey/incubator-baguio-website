"use client";

import { useEffect, useMemo, useState } from "react";
import { DARK, ORANGE } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { acronymOf, paletteFor } from "../../../lib/visualIdentity";
import { CHALLENGE_CATEGORIES, CHALLENGE_ORG_TYPES, type ChallengeCategory, type ChallengeOrgType } from "../../challenges/data";

const modalInputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.14)", fontSize: 13.5, color: DARK, outline: "none", fontFamily: "inherit" };
const modalLabelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 5, display: "block" };

interface ChallengeRow {
  id: string;
  title: string;
  category: ChallengeCategory;
  summary: string;
  problem: string;
  scope: string;
  support: string;
  org_name: string;
  org_full: string;
  org_type: ChallengeOrgType;
  org_color: string;
  org_initials: string;
  contact_email: string;
  scope_region: string;
  status: "Open" | "Closed";
  deadline_date: string | null;
  shortlist_date: string | null;
  pitch_date: string | null;
  pilot_date: string | null;
  created_at: string;
}

function ChallengeFormModal({ challenge, onClose, onSaved }: { challenge: ChallengeRow | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!challenge;
  const [title, setTitle] = useState(challenge?.title ?? "");
  const [category, setCategory] = useState<ChallengeCategory>(challenge?.category ?? CHALLENGE_CATEGORIES[0].id);
  const [summary, setSummary] = useState(challenge?.summary ?? "");
  const [problem, setProblem] = useState(challenge?.problem ?? "");
  const [scope, setScope] = useState(challenge?.scope ?? "");
  const [support, setSupport] = useState(challenge?.support ?? "");
  const [orgName, setOrgName] = useState(challenge?.org_name ?? "");
  const [orgFull, setOrgFull] = useState(challenge?.org_full ?? "");
  const [orgType, setOrgType] = useState<ChallengeOrgType>(challenge?.org_type ?? CHALLENGE_ORG_TYPES[0]);
  const [contactEmail, setContactEmail] = useState(challenge?.contact_email ?? "");
  const [scopeRegion, setScopeRegion] = useState(challenge?.scope_region ?? "Baguio City");
  const [status, setStatus] = useState<"Open" | "Closed">(challenge?.status ?? "Open");
  const [deadlineDate, setDeadlineDate] = useState(challenge?.deadline_date ?? "");
  const [shortlistDate, setShortlistDate] = useState(challenge?.shortlist_date ?? "");
  const [pitchDate, setPitchDate] = useState(challenge?.pitch_date ?? "");
  const [pilotDate, setPilotDate] = useState(challenge?.pilot_date ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !orgName.trim()) return;
    if (!supabase) {
      setError("Challenges aren't configured yet.");
      return;
    }
    setError("");
    setSaving(true);
    const p = paletteFor(orgName.trim());
    const payload = {
      title: title.trim(),
      category,
      summary: summary.trim(),
      problem: problem.trim(),
      scope: scope.trim(),
      support: support.trim(),
      org_name: orgName.trim(),
      org_full: orgFull.trim() || orgName.trim(),
      org_type: orgType,
      org_color: p.color,
      org_initials: acronymOf(orgName.trim()),
      contact_email: contactEmail.trim(),
      scope_region: scopeRegion.trim() || "Baguio City",
      status,
      deadline_date: deadlineDate || null,
      shortlist_date: shortlistDate || null,
      pitch_date: pitchDate || null,
      pilot_date: pilotDate || null,
    };
    const { error: err } = isEdit
      ? await supabase.from("challenges").update(payload).eq("id", challenge!.id)
      : await supabase.from("challenges").insert(payload);
    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    onSaved();
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 600, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: 18, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>{isEdit ? "Edit challenge" : "Add challenge"}</div>
            <div style={{ fontSize: 12.5, color: "#9A958B", marginTop: 3 }}>Goes live on the Challenges page immediately.</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F5F4F0", cursor: "pointer", fontSize: 18, color: "#6B6B73", flexShrink: 0 }}>&times;</button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={modalLabelStyle}>Challenge title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cut post-harvest loss for highland vegetable farmers" style={modalInputStyle} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={modalLabelStyle}>Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ChallengeCategory)} style={{ ...modalInputStyle, appearance: "none" }}>
                {CHALLENGE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.id}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={modalLabelStyle}>Status *</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as "Open" | "Closed")} style={{ ...modalInputStyle, appearance: "none" }}>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label style={modalLabelStyle}>Summary</label>
            <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One-line summary shown on challenge cards" style={modalInputStyle} />
          </div>
          <div>
            <label style={modalLabelStyle}>The problem (one paragraph per line)</label>
            <textarea value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Describe the problem..." style={{ ...modalInputStyle, resize: "vertical", minHeight: 80 }} />
          </div>
          <div>
            <label style={modalLabelStyle}>Scope of the challenge (one bullet per line)</label>
            <textarea value={scope} onChange={(e) => setScope(e.target.value)} placeholder="What the solution must do..." style={{ ...modalInputStyle, resize: "vertical", minHeight: 70 }} />
          </div>
          <div>
            <label style={modalLabelStyle}>What solvers get (one bullet per line)</label>
            <textarea value={support} onChange={(e) => setSupport(e.target.value)} placeholder="Funding, mentorship, pilot access..." style={{ ...modalInputStyle, resize: "vertical", minHeight: 70 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={modalLabelStyle}>Organizer (short name) *</label>
              <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Dept of Agriculture, CAR" style={modalInputStyle} required />
            </div>
            <div>
              <label style={modalLabelStyle}>Organizer type *</label>
              <select value={orgType} onChange={(e) => setOrgType(e.target.value as ChallengeOrgType)} style={{ ...modalInputStyle, appearance: "none" }}>
                {CHALLENGE_ORG_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={modalLabelStyle}>Organizer full name</label>
            <input value={orgFull} onChange={(e) => setOrgFull(e.target.value)} placeholder="e.g. Department of Agriculture — Cordillera Administrative Region" style={modalInputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={modalLabelStyle}>Contact email</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="challenges@example.gov.ph" style={modalInputStyle} />
            </div>
            <div>
              <label style={modalLabelStyle}>Scope region</label>
              <input value={scopeRegion} onChange={(e) => setScopeRegion(e.target.value)} placeholder="e.g. Baguio City" style={modalInputStyle} />
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(20,20,25,0.08)", paddingTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 10 }}>Timeline</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={modalLabelStyle}>Applications close</label>
                <input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} style={modalInputStyle} />
              </div>
              <div>
                <label style={modalLabelStyle}>Shortlist announced</label>
                <input type="date" value={shortlistDate} onChange={(e) => setShortlistDate(e.target.value)} style={modalInputStyle} />
              </div>
              <div>
                <label style={modalLabelStyle}>Pitch & selection</label>
                <input type="date" value={pitchDate} onChange={(e) => setPitchDate(e.target.value)} style={modalInputStyle} />
              </div>
              <div>
                <label style={modalLabelStyle}>Pilot kickoff</label>
                <input type="date" value={pilotDate} onChange={(e) => setPilotDate(e.target.value)} style={modalInputStyle} />
              </div>
            </div>
          </div>

          {error && <p style={{ color: "#E23A2E", fontSize: 12.5, margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", background: "#fff", fontSize: 13.5, fontWeight: 500, cursor: "pointer", color: "#44444C" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: ORANGE, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add challenge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ChallengesTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ChallengeRow | null>(null);
  const [viewing, setViewing] = useState<ChallengeRow | null>(null);

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const [{ data }, { data: apps }] = await Promise.all([
      supabase.from("challenges").select("*").order("created_at", { ascending: false }),
      supabase.from("challenge_applications").select("challenge_id"),
    ]);
    setChallenges((data as ChallengeRow[]) ?? []);
    const counts: Record<string, number> = {};
    (apps ?? []).forEach((a: { challenge_id: string }) => {
      counts[a.challenge_id] = (counts[a.challenge_id] ?? 0) + 1;
    });
    setApplicationCounts(counts);
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  const q = searchQuery.toLowerCase();
  const filtered = challenges.filter((c) => !q || c.title.toLowerCase().includes(q) || c.org_name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));

  const stats = useMemo(() => {
    const totalApplications = Object.values(applicationCounts).reduce((sum, n) => sum + n, 0);
    return {
      open: challenges.filter((c) => c.status === "Open").length,
      categoriesCovered: new Set(challenges.map((c) => c.category)).size,
      totalApplications,
      avgApplications: challenges.length ? (totalApplications / challenges.length).toFixed(1) : "0",
    };
  }, [challenges, applicationCounts]);

  async function remove(id: string) {
    if (!supabase) return;
    if (!window.confirm("Delete this challenge permanently? This can't be undone.")) return;
    const { error } = await supabase.from("challenges").delete().eq("id", id);
    if (error) return window.alert(error.message);
    setViewing(null);
    load();
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="ib-admin-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Open Challenges", value: String(stats.open) },
          { label: "Categories Covered", value: String(stats.categoriesCovered) },
          { label: "Total Applications", value: String(stats.totalApplications) },
          { label: "Avg. Applications", value: stats.avgApplications },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1.5px solid rgba(20,20,25,0.09)", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9A958B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: DARK }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => setAdding(true)} style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 999, padding: "9px 18px", cursor: "pointer" }}>+ Add challenge</button>
      </div>

      <div className="ib-admin-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {filtered.map((c) => {
          const cat = CHALLENGE_CATEGORIES.find((cc) => cc.id === c.category);
          return (
            <div key={c.id} style={{ background: "#fff", border: "1.5px solid rgba(20,20,25,0.09)", borderRadius: 18, padding: 24, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.02em", color: cat?.color, background: cat?.bg, padding: "5px 12px", borderRadius: 999 }}>
                  {cat?.emoji} {c.category}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: c.status === "Open" ? "#1A6B3C" : "#9A958B", background: c.status === "Open" ? "rgba(26,107,60,0.12)" : "rgba(154,149,139,0.14)", padding: "4px 10px", borderRadius: 999 }}>{c.status}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: DARK, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>{c.title}</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73", marginBottom: 18, flex: 1 }}>{c.summary}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(20,20,25,0.08)" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: c.org_color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {c.org_initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.org_name}</div>
                  <div style={{ fontSize: 11, color: "#9A958B", marginTop: 1 }}>{applicationCounts[c.id] ?? 0} applications</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button onClick={() => setViewing(c)} style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "#285E7A", background: "none", border: "1.5px solid rgba(40,94,122,0.3)", borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}>View</button>
                <button onClick={() => setEditing(c)} style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "#44444C", background: "none", border: "1.5px solid rgba(20,20,25,0.14)", borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}>Edit</button>
              </div>
            </div>
          );
        })}

        <div
          onClick={() => setAdding(true)}
          style={{
            background: "#F5F4F0",
            border: "1.5px dashed rgba(20,20,25,0.16)",
            borderRadius: 18,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            minHeight: 200,
            cursor: "pointer",
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 999, background: "#EDEAE5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Add a new challenge</div>
          <p style={{ fontSize: 13.5, color: "#9A958B", lineHeight: 1.4, maxWidth: 200 }}>Curated challenges shown on the public Challenges page.</p>
        </div>

        {loaded && filtered.length === 0 && challenges.length > 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "28px 20px", textAlign: "center", color: "#9A958B", fontSize: 13, background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)" }}>
            No challenges match your search.
          </div>
        )}
      </div>

      {viewing && (
        <div onClick={() => setViewing(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 520, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: 18, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                {(() => {
                  const cat = CHALLENGE_CATEGORIES.find((cc) => cc.id === viewing.category);
                  return (
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.02em", color: cat?.color, background: cat?.bg, padding: "4px 10px", borderRadius: 999 }}>
                      {cat?.emoji} {viewing.category}
                    </span>
                  );
                })()}
              </div>
              <button onClick={() => setViewing(null)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F5F4F0", cursor: "pointer", fontSize: 18, color: "#6B6B73", flexShrink: 0 }}>&times;</button>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: DARK, letterSpacing: "-0.025em", lineHeight: 1.2, margin: 0 }}>{viewing.title}</h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#6B6B73", margin: 0 }}>{viewing.summary}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "#F5F4F0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#9A958B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Applications</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: DARK }}>{applicationCounts[viewing.id] ?? 0}</div>
              </div>
              <div style={{ background: "#F5F4F0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#9A958B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Applications close</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: DARK }}>{viewing.deadline_date || "—"}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4, borderTop: "1px solid rgba(20,20,25,0.08)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: viewing.org_color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {viewing.org_initials}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{viewing.org_name}</div>
                <div style={{ fontSize: 12, color: "#9A958B", marginTop: 2 }}>{viewing.org_type}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => { setEditing(viewing); setViewing(null); }} style={{ fontSize: 13, fontWeight: 600, color: "#44444C", background: "none", border: "1.5px solid rgba(20,20,25,0.14)", borderRadius: 999, padding: "9px 18px", cursor: "pointer" }}>Edit</button>
              <button onClick={() => remove(viewing.id)} style={{ fontSize: 13, fontWeight: 600, color: "#E23A2E", background: "none", border: "1.5px solid rgba(226,58,46,0.3)", borderRadius: 999, padding: "9px 18px", cursor: "pointer", marginLeft: "auto" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {adding && (
        <ChallengeFormModal
          challenge={null}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            load();
          }}
        />
      )}

      {editing && (
        <ChallengeFormModal
          challenge={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
