"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, rowItemStyle, DARK, ORANGE } from "../styles";
import { SECTOR_FILTERS } from "../../admin/data";
import { ROLE_OPTIONS } from "./data";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
const COMMITMENT_OPTIONS = ["Full-time", "Part-time", "Advisor"] as const;

interface CofounderProfile {
  id: string;
  name: string;
  building: string;
  role_needed: string;
  sector: string;
  commitment: string;
  looking_for: string;
  contact_email: string;
  is_active: boolean;
  created_at: string;
}

// What the Browse tab actually needs to render a card, for anyone viewing
// it -- logged in or not. Deliberately narrower than CofounderProfile: no
// contact_email (reaching a listed person goes through ConnectButton's
// mediated request, same as the site's public Ecosystem directory does for
// Mentors, never a raw address in a fetch response an anonymous visitor's
// browser can see), and no owner_id (the "not my own listing" exclusion
// happens in the query's `.neq()` for a logged-in viewer, so the client
// never needs that id at all).
interface DirectoryEntry {
  id: string;
  name: string;
  building: string;
  role_needed: string;
  sector: string;
  commitment: string;
  looking_for: string;
}

interface SentConnection {
  id: string;
  message: string;
  status: string;
  created_at: string;
  cofounder_profiles: { name: string } | null;
}

interface ReceivedConnection {
  id: string;
  message: string;
  status: string;
  created_at: string;
  profiles: { full_name: string; email: string } | null;
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

const EMPTY_FORM = { name: "", building: "", role_needed: "Any", sector: "", commitment: "Full-time", looking_for: "", contact_email: "", is_active: true };

function ConnectButton({ target, onSent }: { target: DirectoryEntry; onSent: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  // The Browse tab is now visible without an account, so this can no
  // longer just disappear for an anonymous visitor the way it used to --
  // that left no way to act on a listing at all. Sends them to log in and
  // back, same pattern as every other Connect button on the site.
  if (!user) {
    return (
      <a
        href={`${BP}/login/?redirect=${encodeURIComponent(`${BP}/dashboard/cofounder/`)}`}
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
    const { error } = await supabase.from("cofounder_connections").insert({ cofounder_profile_id: target.id, requester_id: user.id, message });
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
        placeholder={`Say hello to ${target.name}…`}
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

export default function CofounderFinder() {
  const { user, profile } = useAuth();
  const [view, setView] = useState<"browse" | "profile" | "requests">("browse");
  const [myProfile, setMyProfile] = useState<CofounderProfile | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [directory, setDirectory] = useState<DirectoryEntry[]>([]);
  const [sent, setSent] = useState<SentConnection[]>([]);
  const [received, setReceived] = useState<ReceivedConnection[]>([]);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Runs for every visitor, logged in or not -- this is the Browse tab's
  // actual public data. Excludes the viewer's own listing when there is a
  // viewer; there's nothing to exclude for an anonymous one.
  async function loadDirectory() {
    if (!supabase) return;
    let q = supabase
      .from("cofounder_profiles")
      .select("id,name,building,role_needed,sector,commitment,looking_for")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (user) q = q.neq("owner_id", user.id);
    const { data } = await q;
    setDirectory((data as DirectoryEntry[]) ?? []);
  }

  // Everything that only makes sense for a signed-in member: their own
  // listing (with contact_email, which only its owner ever needs to see or
  // edit) and both directions of connection requests. No-ops to an empty
  // state when there's no session, rather than returning early and leaving
  // stale data from a previous logged-in visit on screen.
  async function loadMine() {
    if (!supabase || !user) {
      setMyProfile(null);
      setSent([]);
      setReceived([]);
      return;
    }
    const { data: mine } = await supabase.from("cofounder_profiles").select("*").eq("owner_id", user.id).maybeSingle();
    if (mine) {
      setMyProfile(mine as CofounderProfile);
      setForm({
        name: mine.name,
        building: mine.building,
        role_needed: mine.role_needed,
        sector: mine.sector,
        commitment: mine.commitment,
        looking_for: mine.looking_for,
        contact_email: mine.contact_email,
        is_active: mine.is_active,
      });
    } else {
      setMyProfile(null);
      setForm((f) => ({ ...f, name: profile?.full_name || "", contact_email: profile?.email || "" }));
    }

    const { data: sentRows } = await supabase
      .from("cofounder_connections")
      .select("id, message, status, created_at, cofounder_profiles(name)")
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false });
    setSent((sentRows as unknown as SentConnection[]) ?? []);

    if (mine) {
      const { data: receivedRows } = await supabase
        .from("cofounder_connections")
        .select("id, message, status, created_at, profiles(full_name, email)")
        .eq("cofounder_profile_id", mine.id)
        .order("created_at", { ascending: false });
      setReceived((receivedRows as unknown as ReceivedConnection[]) ?? []);
    } else {
      setReceived([]);
    }
  }

  async function loadAll() {
    await Promise.all([loadDirectory(), loadMine()]);
    setLoaded(true);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !user) return;
    setError("");
    setBusy(true);
    const { data, error: err } = await supabase
      .from("cofounder_profiles")
      .upsert({ ...form, owner_id: user.id }, { onConflict: "owner_id" })
      .select()
      .single();
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMyProfile(data as CofounderProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    loadAll();
  }

  async function respond(id: string, status: "accepted" | "declined") {
    if (!supabase) return;
    await supabase.from("cofounder_connections").update({ status }).eq("id", id);
    loadAll();
  }

  if (!loaded) return null;

  const filteredDirectory = directory.filter((d) => (!roleFilter || d.role_needed === roleFilter) && (!sectorFilter || d.sector === sectorFilter));
  const pendingReceived = received.filter((r) => r.status === "pending").length;

  return (
    <div>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>Co-Founder Finder</h2>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "#5A544B" }}>Browse founders looking to team up, or list yourself so others can find you.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { id: "browse" as const, label: "Browse" },
          { id: "profile" as const, label: myProfile ? "My listing" : "Create a listing" },
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
            <select style={{ ...inputStyle, width: "auto" }} value={roleFilter ?? ""} onChange={(e) => setRoleFilter(e.target.value || null)}>
              <option value="">All roles needed</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select style={{ ...inputStyle, width: "auto" }} value={sectorFilter ?? ""} onChange={(e) => setSectorFilter(e.target.value || null)}>
              <option value="">All sectors</option>
              {SECTOR_FILTERS.map((s) => (
                <option key={s.label} value={s.label}>{s.label}</option>
              ))}
            </select>
          </div>

          {filteredDirectory.length === 0 ? (
            <div style={cardStyle}>
              <p style={{ margin: 0, fontSize: 13.5, color: "#6E685F" }}>No one matches those filters yet. Check back soon, or create your own listing so others can find you.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
              {filteredDirectory.map((d) => (
                <div key={d.id} style={{ ...cardStyle, padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: DARK }}>{d.name}</div>
                      {d.sector && <div style={{ fontSize: 12, color: "#6E685F" }}>{d.sector}</div>}
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: ORANGE, background: "rgba(242,101,34,0.10)", padding: "4px 9px", borderRadius: 9999, flexShrink: 0 }}>
                      {d.commitment}
                    </span>
                  </div>
                  {d.building && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "#44444C" }}>{d.building}</p>}
                  <div style={{ fontSize: 12, color: "#5A544B" }}>
                    Looking for a <strong style={{ color: DARK }}>{d.role_needed}</strong> co-founder
                    {d.looking_for && <span> — {d.looking_for}</span>}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <ConnectButton target={d} onSent={loadAll} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "profile" && !user && (
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, color: DARK }}>Create your listing</h3>
          <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.6, color: "#6E685F" }}>
            Log in or create a free account to list yourself in the Co-Founder Finder and start receiving requests.
          </p>
          <a
            href={`${BP}/login/?redirect=${encodeURIComponent(`${BP}/dashboard/cofounder/`)}`}
            style={{ ...primaryButtonStyle, textDecoration: "none", display: "inline-block" }}
          >
            Log in
          </a>
        </div>
      )}

      {view === "profile" && user && (
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>{myProfile ? "Your listing" : "Create your listing"}</h3>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6E685F" }}>Shown to anyone browsing the Co-Founder Finder.</p>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Your name</label>
              <input style={inputStyle} required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label style={labelStyle}>What are you building?</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.building} onChange={(e) => update("building", e.target.value)} placeholder="A short pitch of your idea or innovation." maxLength={300} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Role needed</label>
                <select style={inputStyle} value={form.role_needed} onChange={(e) => update("role_needed", e.target.value)}>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Commitment</label>
                <select style={inputStyle} value={form.commitment} onChange={(e) => update("commitment", e.target.value)}>
                  {COMMITMENT_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Sector</label>
              <select style={inputStyle} value={form.sector} onChange={(e) => update("sector", e.target.value)}>
                <option value="">Select a sector</option>
                {SECTOR_FILTERS.map((s) => (
                  <option key={s.label} value={s.label}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>What kind of co-founder are you looking for?</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.looking_for} onChange={(e) => update("looking_for", e.target.value)} placeholder="Skills, experience, or qualities you need." maxLength={300} />
            </div>
            <div>
              <label style={labelStyle}>Contact email</label>
              <input style={inputStyle} type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} placeholder="you@example.com" />
            </div>
            {myProfile && (
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#44444C", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} />
                  Public listing
                </label>
                {/* The Browse tab this feeds is visible to anyone who opens
                    /dashboard/cofounder/, logged in or not -- worth being
                    explicit about, since "visible in the directory" used to
                    mean "other members only." */}
                <p style={{ margin: "6px 0 0 26px", fontSize: 12, color: "#6E685F" }}>
                  Anyone who opens the Co-Founder Finder can see this listing and send you a connect request — no account required to browse. Your contact email is never shown publicly.
                </p>
              </div>
            )}
            {error && <p style={{ color: "#E23A2E", fontSize: 13, margin: 0 }}>{error}</p>}
            {saved && <p style={{ color: "#1A6B3C", fontSize: 13, margin: 0 }}>Saved.</p>}
            <div>
              <button type="submit" disabled={busy} style={{ ...primaryButtonStyle, opacity: busy ? 0.7 : 1 }}>
                {busy ? "Saving…" : myProfile ? "Save changes" : "Publish listing"}
              </button>
            </div>
          </form>
        </div>
      )}

      {view === "requests" && !user && (
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, color: DARK }}>Requests</h3>
          <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.6, color: "#6E685F" }}>
            Log in to see requests you've sent or received.
          </p>
          <a
            href={`${BP}/login/?redirect=${encodeURIComponent(`${BP}/dashboard/cofounder/`)}`}
            style={{ ...primaryButtonStyle, textDecoration: "none", display: "inline-block" }}
          >
            Log in
          </a>
        </div>
      )}

      {view === "requests" && user && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {myProfile && (
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>Requests received</h3>
              <p style={{ margin: "0 0 18px", fontSize: 13, color: "#6E685F" }}>People who want to team up with you.</p>
              {received.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13.5, color: "#6E685F" }}>No requests yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {received.map((r) => (
                    <div key={r.id} style={{ ...rowItemStyle, flexDirection: "column", alignItems: "stretch", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{r.profiles?.full_name || "Unknown"}</div>
                          <div style={{ fontSize: 12.5, color: "#6E685F" }}>{r.profiles?.email}</div>
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
          )}

          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>Requests you've sent</h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "#6E685F" }}>Founders you've reached out to from the directory.</p>
            {sent.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13.5, color: "#6E685F" }}>You haven't reached out to anyone yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sent.map((s) => (
                  <div key={s.id} style={rowItemStyle}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{s.cofounder_profiles?.name || "Founder"}</div>
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
