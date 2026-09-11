"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";
import { cardStyle, inputStyle, primaryButtonStyle, rowItemStyle, DARK, ORANGE } from "../styles";
import { PROFILE_AREAS_OF_INTEREST, PROFILE_SKILLS } from "../../../lib/profileOptions";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Exactly the shape discoverable_members() returns (see
// supabase/migrations/2026-09-11-member-directory.sql) -- no email. That
// function is the only read path for another member's profile short of an
// existing org/admin/pending-request relationship, and it was written to
// exclude email structurally, not by convention here.
interface DiscoverableMember {
  id: string;
  full_name: string;
  preferred_name: string | null;
  photo_url: string | null;
  role_title: string | null;
  org_affiliation: string | null;
  bio: string | null;
  location: string | null;
  areas_of_interest: string[] | null;
  skills: string[] | null;
  looking_for: string[] | null;
  can_offer: string[] | null;
}

interface SentConnection {
  id: string;
  message: string;
  status: string;
  created_at: string;
  target_id: string;
}

interface ReceivedConnection {
  id: string;
  message: string;
  status: string;
  created_at: string;
  requester: { full_name: string; preferred_name: string | null; email: string } | null;
}

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  pending: { color: "#D88A0A", bg: "rgba(245,166,35,0.16)" },
  accepted: { color: "#1A6B3C", bg: "rgba(26,107,60,0.12)" },
  declined: { color: "#E23A2E", bg: "rgba(226,58,46,0.12)" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, textTransform: "capitalize", color: c.color, background: c.bg, padding: "4px 10px", borderRadius: 9999 }}>
      {status}
    </span>
  );
}

function displayName(m: { full_name: string; preferred_name?: string | null }) {
  return m.preferred_name?.trim() || m.full_name?.trim() || "Member";
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";
}

function ConnectButton({ target, onSent }: { target: DiscoverableMember; onSent: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user) {
    return (
      <a
        href={`${BP}/login/?redirect=${encodeURIComponent(`${BP}/dashboard/members/`)}`}
        style={{ fontSize: 12, fontWeight: 600, color: ORANGE, textDecoration: "none", border: `1.5px solid ${ORANGE}`, padding: "7px 14px", borderRadius: 9999, display: "inline-block" }}
      >
        Connect
      </a>
    );
  }
  if (sent) return <span style={{ fontSize: 12, fontWeight: 600, color: "#1A6B3C" }}>Request sent</span>;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "8px 16px", cursor: "pointer" }}>
        Connect
      </button>
    );
  }

  async function send() {
    if (!supabase || !user) return;
    setBusy(true);
    const { error } = await supabase.from("member_connections").insert({ target_id: target.id, requester_id: user.id, message });
    setBusy(false);
    if (!error) {
      setSent(true);
      onSent();
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={`Say hello to ${displayName(target)}…`}
        style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={send} disabled={busy} style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 9999, padding: "8px 16px", cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
          {busy ? "Sending…" : "Send request"}
        </button>
        <button onClick={() => setOpen(false)} style={{ fontSize: 12, fontWeight: 600, color: "#5A544B", background: "none", border: "none", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function MembersDirectory() {
  const { user } = useAuth();
  const [view, setView] = useState<"browse" | "requests">("browse");
  const [directory, setDirectory] = useState<DiscoverableMember[]>([]);
  const [sent, setSent] = useState<SentConnection[]>([]);
  const [received, setReceived] = useState<ReceivedConnection[]>([]);
  const [query, setQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [interestFilter, setInterestFilter] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function loadAll() {
    if (!supabase || !user) {
      setDirectory([]);
      setSent([]);
      setReceived([]);
      setLoaded(true);
      return;
    }
    // The RPC (not a table select) is what structurally excludes email --
    // see discoverable_members() in the migration. Every other member on
    // this list is someone who opted into "Make my profile discoverable".
    const { data: dirRows } = await supabase.rpc("discoverable_members");
    setDirectory((dirRows as DiscoverableMember[]) ?? []);

    const { data: sentRows } = await supabase
      .from("member_connections")
      .select("id, message, status, created_at, target_id")
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false });
    setSent((sentRows as SentConnection[]) ?? []);

    // The requester's name+email is readable here specifically because they
    // sent *me* (auth.uid() = target_id) a request -- has_pending_request_from()
    // grants that, same rule mentor/cofounder connections already use.
    const { data: receivedRows } = await supabase
      .from("member_connections")
      .select("id, message, status, created_at, requester:profiles!member_connections_requester_id_fkey(full_name, preferred_name, email)")
      .eq("target_id", user.id)
      .order("created_at", { ascending: false });
    setReceived((receivedRows as unknown as ReceivedConnection[]) ?? []);

    setLoaded(true);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function respond(id: string, status: "accepted" | "declined") {
    if (!supabase) return;
    await supabase.from("member_connections").update({ status }).eq("id", id);
    loadAll();
  }

  if (!user) {
    return (
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>Members</h2>
        <p style={{ margin: 0, fontSize: 13.5, color: "#6E685F" }}>Log in to browse other members who&rsquo;ve opted to be discoverable.</p>
      </div>
    );
  }

  if (!loaded) return null;

  const filtered = directory.filter((m) => {
    if (skillFilter && !(m.skills ?? []).includes(skillFilter)) return false;
    if (interestFilter && !(m.areas_of_interest ?? []).includes(interestFilter)) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    const haystacks = [displayName(m), m.role_title ?? "", m.org_affiliation ?? "", m.bio ?? "", ...(m.skills ?? [])];
    return haystacks.some((h) => h.toLowerCase().includes(q));
  });

  // Someone I've requested only ever appears here because I found them via
  // Browse first, so their name is already sitting in `directory` -- no
  // extra profile read needed (and none would be granted anyway; see the
  // migration's notes on why the requester side of this can't embed
  // profiles the way the received side does).
  const nameById = new Map(directory.map((m) => [m.id, displayName(m)]));
  const pendingReceived = received.filter((r) => r.status === "pending").length;

  return (
    <div>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>Members</h2>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "#5A544B" }}>
        Discover other members who&rsquo;ve opted to be found. Want to appear here too?{" "}
        <a href={`${BP}/dashboard/settings/`} style={{ color: ORANGE, fontWeight: 600, textDecoration: "none" }}>
          Turn on discoverability
        </a>
        .
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { id: "browse" as const, label: "Browse" },
          { id: "requests" as const, label: `Requests${pendingReceived > 0 ? ` (${pendingReceived})` : ""}` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: view === t.id ? "#fff" : "#44444C",
              background: view === t.id ? DARK : "#F6F2EA",
              border: "none",
              padding: "9px 16px",
              borderRadius: 9999,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {view === "browse" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            <input
              style={{ ...inputStyle, width: "auto", flex: "1 1 220px" }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, role, or bio"
            />
            <select style={{ ...inputStyle, width: "auto" }} value={skillFilter ?? ""} onChange={(e) => setSkillFilter(e.target.value || null)}>
              <option value="">All skills</option>
              {PROFILE_SKILLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select style={{ ...inputStyle, width: "auto" }} value={interestFilter ?? ""} onChange={(e) => setInterestFilter(e.target.value || null)}>
              <option value="">All interests</option>
              {PROFILE_AREAS_OF_INTEREST.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div style={cardStyle}>
              <p style={{ margin: 0, fontSize: 13.5, color: "#6E685F" }}>
                {directory.length === 0
                  ? "No one's turned on discoverability yet. Be the first — turn it on in Account Settings."
                  : "No one matches those filters yet."}
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
              {filtered.map((m) => {
                const name = displayName(m);
                return (
                  <div key={m.id} style={{ ...cardStyle, padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {m.photo_url ? (
                        <img src={m.photo_url} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(242,101,34,0.12)", color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                          {initialsOf(name)}
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                        {(m.role_title || m.org_affiliation) && (
                          <div style={{ fontSize: 12, color: "#6E685F", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {[m.role_title, m.org_affiliation].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </div>
                    </div>
                    {m.bio && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "#44444C" }}>{m.bio}</p>}
                    {(m.skills ?? []).length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {(m.skills ?? []).slice(0, 4).map((s) => (
                          <span key={s} style={{ fontSize: 11, fontWeight: 600, color: ORANGE, background: "rgba(242,101,34,0.1)", padding: "3px 9px", borderRadius: 9999 }}>{s}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: 4 }}>
                      <ConnectButton target={m} onSent={loadAll} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === "requests" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>Requests received</h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "#6E685F" }}>People who want to connect with you.</p>
            {received.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13.5, color: "#6E685F" }}>No requests yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {received.map((r) => (
                  <div key={r.id} style={{ ...rowItemStyle, flexDirection: "column", alignItems: "stretch", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{r.requester ? displayName(r.requester) : "Unknown"}</div>
                        <div style={{ fontSize: 12.5, color: "#6E685F" }}>{r.requester?.email}</div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    {r.message && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#44444C" }}>{r.message}</p>}
                    {r.status === "pending" && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => respond(r.id, "accepted")} style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", background: "#1A6B3C", border: "none", borderRadius: 9999, padding: "8px 16px", cursor: "pointer" }}>
                          Accept
                        </button>
                        <button onClick={() => respond(r.id, "declined")} style={{ fontSize: 12.5, fontWeight: 600, color: "#44444C", background: "#F6F2EA", border: "none", borderRadius: 9999, padding: "8px 16px", cursor: "pointer" }}>
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>Requests you&rsquo;ve sent</h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "#6E685F" }}>Members you&rsquo;ve reached out to from Browse.</p>
            {sent.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13.5, color: "#6E685F" }}>You haven&rsquo;t reached out to anyone yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sent.map((s) => (
                  <div key={s.id} style={rowItemStyle}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{nameById.get(s.target_id) || "Member"}</div>
                      {s.message && <div style={{ fontSize: 12.5, color: "#6E685F" }}>{s.message}</div>}
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
