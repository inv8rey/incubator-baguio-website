"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, rowItemStyle, DARK, ORANGE } from "../styles";
import { SECTOR_FILTERS } from "../../admin/data";

const ROLE_OPTIONS = ["Any", "Technical", "Business/Marketing", "Design"] as const;
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

function ConnectButton({ target, onSent }: { target: CofounderProfile; onSent: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user) return null;
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
        <button onClick={() => setOpen(false)} style={{ fontSize: 12, fontWeight: 600, color: "#6B6B73", background: "none", border: "none", cursor: "pointer" }}>
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
  const [directory, setDirectory] = useState<CofounderProfile[]>([]);
  const [sent, setSent] = useState<SentConnection[]>([]);
  const [received, setReceived] = useState<ReceivedConnection[]>([]);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function loadAll() {
    if (!supabase || !user) return;
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
      setForm((f) => ({ ...f, name: profile?.full_name || "", contact_email: profile?.email || "" }));
    }

    const { data: dirRows } = await supabase
      .from("cofounder_profiles")
      .select("*")
      .eq("is_active", true)
      .neq("owner_id", user.id)
      .order("created_at", { ascending: false });
    setDirectory((dirRows as CofounderProfile[]) ?? []);

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
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Co-Founder Finder</h2>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6B6B73" }}>Browse founders looking to team up, or list yourself so others can find you.</p>

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
              background: view === t.id ? DARK : "#F4F2EC",
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
              <p style={{ margin: 0, fontSize: 13.5, color: "#9A958B" }}>No one matches those filters yet. Check back soon, or create your own listing so others can find you.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
              {filteredDirectory.map((d) => (
                <div key={d.id} style={{ ...cardStyle, padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{d.name}</div>
                      {d.sector && <div style={{ fontSize: 12, color: "#9A958B" }}>{d.sector}</div>}
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: ORANGE, background: "rgba(242,101,34,0.10)", padding: "4px 9px", borderRadius: 9999, flexShrink: 0 }}>
                      {d.commitment}
                    </span>
                  </div>
                  {d.building && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "#44444C" }}>{d.building}</p>}
                  <div style={{ fontSize: 12, color: "#6B6B73" }}>
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

      {view === "profile" && (
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: DARK }}>{myProfile ? "Your listing" : "Create your listing"}</h3>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "#9A958B" }}>Shown to other members browsing the Co-Founder Finder.</p>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Your name</label>
              <input style={inputStyle} required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label style={labelStyle}>What are you building?</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.building} onChange={(e) => update("building", e.target.value)} placeholder="A short pitch of your idea or startup." maxLength={300} />
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
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#44444C", cursor: "pointer" }}>
                <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} />
                Visible in the directory
              </label>
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

      {view === "requests" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {myProfile && (
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: DARK }}>Requests received</h3>
              <p style={{ margin: "0 0 18px", fontSize: 13, color: "#9A958B" }}>People who want to team up with you.</p>
              {received.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13.5, color: "#9A958B" }}>No requests yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {received.map((r) => (
                    <div key={r.id} style={{ ...rowItemStyle, flexDirection: "column", alignItems: "stretch", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{r.profiles?.full_name || "Unknown"}</div>
                          <div style={{ fontSize: 12.5, color: "#9A958B" }}>{r.profiles?.email}</div>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      {r.message && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#44444C" }}>{r.message}</p>}
                      {r.status === "pending" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => respond(r.id, "accepted")} style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", background: "#1A6B3C", border: "none", borderRadius: 9999, padding: "8px 16px", cursor: "pointer" }}>
                            Accept
                          </button>
                          <button onClick={() => respond(r.id, "declined")} style={{ fontSize: 12.5, fontWeight: 600, color: "#44444C", background: "#F4F2EC", border: "none", borderRadius: 9999, padding: "8px 16px", cursor: "pointer" }}>
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
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: DARK }}>Requests you've sent</h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "#9A958B" }}>Founders you've reached out to from the directory.</p>
            {sent.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13.5, color: "#9A958B" }}>You haven't reached out to anyone yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sent.map((s) => (
                  <div key={s.id} style={rowItemStyle}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{s.cofounder_profiles?.name || "Founder"}</div>
                      {s.message && <div style={{ fontSize: 12.5, color: "#9A958B" }}>{s.message}</div>}
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
