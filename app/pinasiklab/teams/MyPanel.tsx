"use client";

import type { ReactNode } from "react";
import { MAX_MEMBERS, type Contact, type MyProfile, type Person, type Req, type Status, type Team } from "./data";
import { CARD, Chip, TEXT, HAIR, ICONS, Icon, MUTED, ORANGE, ghostBtn, primaryBtn } from "./ui";

interface Props {
  status: Status;
  me: MyProfile | null;
  myTeam: Team | null;
  isLeader: boolean;
  members: Person[];
  contacts: Contact[];
  teams: Team[];
  people: Person[];
  incomingInvites: Req[];
  outgoingRequests: Req[];
  teamRequests: Req[];
  teamInvites: Req[];
  busy: boolean;
  loginHref: string;
  signupHref: string;
  onCreateProfile: () => void;
  onEditProfile: () => void;
  onCreateTeam: () => void;
  onFindTeam: () => void;
  onEditTeam: () => void;
  onToggleLock: () => void;
  onRespond: (id: string, accept: boolean) => void;
  onCancel: (id: string) => void;
  onLeave: () => void;
  onRemove: (p: Person) => void;
}

const card = { background: CARD, border: `1px solid ${HAIR}`, borderRadius: 20, padding: "24px 26px" } as const;
const heading = { margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.025em", color: TEXT, lineHeight: 1.2 } as const;
const sub = { margin: "6px 0 0", fontSize: 14.5, lineHeight: 1.55, color: "var(--tf-body)" } as const;
const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: 6 } as const;
const sectionLabel = { fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--tf-label)", margin: "22px 0 10px" } as const;

function Row({ title, chips, message, actions }: { title: string; chips?: string[]; message?: string; actions: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", padding: "12px 0", borderTop: `1px solid ${HAIR}` }}>
      <div style={{ minWidth: 0, flex: "1 1 260px" }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: TEXT }}>{title}</div>
        {chips && chips.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
            {chips.map((c) => (
              <Chip key={c} small>{c}</Chip>
            ))}
          </div>
        )}
        {message && <div style={{ fontSize: 13, color: "var(--tf-body)", lineHeight: 1.5, marginTop: 6, fontStyle: "italic" }}>&ldquo;{message}&rdquo;</div>}
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>{actions}</div>
    </div>
  );
}

export default function MyPanel(p: Props) {
  if (p.status === "guest") {
    return (
      <div style={{ ...card, background: "var(--tf-hero-card)", border: "1px solid var(--tf-hero-line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 360px" }}>
          <div style={eyebrow}>Join the matching</div>
          <h2 style={{ ...heading, color: "#fff" }}>Looking for a team, or a teammate?</h2>
          <p style={{ ...sub, color: "rgba(255,255,255,0.66)" }}>Log in and create a short profile. You can browse everything below without an account, but you need one to request, invite, or start a team.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href={p.loginHref} style={primaryBtn}>Log in</a>
          <a href={p.signupHref} style={{ ...ghostBtn, background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)" }}>Create an account</a>
        </div>
      </div>
    );
  }

  if (p.status === "noProfile") {
    return (
      <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", borderColor: "rgba(var(--tf-accent-rgb),0.4)" }}>
        <div style={{ flex: "1 1 360px" }}>
          <div style={eyebrow}>Step 1</div>
          <h2 style={heading}>Create your Team Finder profile</h2>
          <p style={sub}>Tell teams what you bring. It takes a minute, and then you can find a team, or start one and find members.</p>
        </div>
        <button onClick={p.onCreateProfile} style={primaryBtn}>Create profile</button>
      </div>
    );
  }

  const firstName = (p.me?.full_name ?? "").trim().split(/\s+/)[0] || "there";
  const nameOf = (id: string) => p.people.find((x) => x.id === id);
  const teamOf = (id: string) => p.teams.find((t) => t.id === id);

  if (p.status === "solo") {
    return (
      <div style={card}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div>
            <div style={eyebrow}>Your status</div>
            <h2 style={heading}>Hi {firstName}, you&rsquo;re looking for a team.</h2>
            <p style={sub}>Pick how you want to get matched.</p>
          </div>
          <button onClick={p.onEditProfile} style={ghostBtn}>Edit profile</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginTop: 20 }}>
          <div style={{ border: `1px solid ${HAIR}`, borderRadius: 16, padding: 20, background: "var(--tf-card2)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Find a team</div>
            <p style={{ margin: "6px 0 14px", fontSize: 13.5, lineHeight: 1.5, color: "var(--tf-body)" }}>Browse open teams, see who they&rsquo;re looking for, and send a join request.</p>
            <button onClick={p.onFindTeam} style={primaryBtn}>Browse teams</button>
          </div>
          <div style={{ border: `1px solid ${HAIR}`, borderRadius: 16, padding: 20, background: "var(--tf-card2)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Find a member</div>
            <p style={{ margin: "6px 0 14px", fontSize: 13.5, lineHeight: 1.5, color: "var(--tf-body)" }}>Start your own team, then invite other people who registered on their own.</p>
            <button onClick={p.onCreateTeam} style={ghostBtn}>
              <Icon d={ICONS.plus} size={14} /> Start a team
            </button>
          </div>
        </div>

        {p.incomingInvites.length > 0 && (
          <>
            <div style={sectionLabel}>Invites for you</div>
            {p.incomingInvites.map((r) => (
              <Row
                key={r.id}
                title={`${teamOf(r.team_id)?.name ?? "A team"} invited you`}
                message={r.message}
                actions={
                  <>
                    <button disabled={p.busy} onClick={() => p.onRespond(r.id, true)} style={primaryBtn}>Accept</button>
                    <button disabled={p.busy} onClick={() => p.onRespond(r.id, false)} style={ghostBtn}>Decline</button>
                  </>
                }
              />
            ))}
          </>
        )}

        {p.outgoingRequests.length > 0 && (
          <>
            <div style={sectionLabel}>Requests you sent</div>
            {p.outgoingRequests.map((r) => (
              <Row
                key={r.id}
                title={`Waiting on ${teamOf(r.team_id)?.name ?? "a team"}`}
                message={r.message}
                actions={<button disabled={p.busy} onClick={() => p.onCancel(r.id)} style={ghostBtn}>Cancel request</button>}
              />
            ))}
          </>
        )}
      </div>
    );
  }

  // member or leader
  const team = p.myTeam;
  if (!team) return null;
  const full = p.members.length >= MAX_MEMBERS;
  const contactOf = (id: string) => p.contacts.find((c) => c.participant_id === id)?.contact;

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <div style={eyebrow}>{p.isLeader ? "Your team · you're the leader" : "Your team"}</div>
          <h2 style={heading}>{team.name}</h2>
          <p style={sub}>
            {team.locked || full
              ? `Locked in with ${p.members.length} of ${MAX_MEMBERS}. Nobody can request to join.`
              : `${p.members.length} of ${MAX_MEMBERS} members. Open for requests${p.isLeader ? "; lock in when you're complete" : ""}.`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {p.isLeader && <button onClick={p.onEditTeam} style={ghostBtn}>Edit team</button>}
          {p.isLeader && (
            <button onClick={p.onToggleLock} disabled={p.busy || (full && team.locked)} style={{ ...(team.locked ? ghostBtn : primaryBtn), opacity: full && team.locked ? 0.6 : 1 }}>
              <Icon d={ICONS.lock} size={14} /> {team.locked ? "Unlock team" : "Lock in team"}
            </button>
          )}
          <button onClick={p.onEditProfile} style={ghostBtn}>Edit profile</button>
        </div>
      </div>

      <div style={sectionLabel}>Your teammates &middot; contact details are only visible to your team</div>
      {p.members.map((m) => (
        <Row
          key={m.id}
          title={`${m.full_name}${m.id === team.leader_id ? "  (leader)" : ""}${m.id === p.me?.id ? "  (you)" : ""}`}
          chips={m.skills}
          message={undefined}
          actions={
            <>
              <span style={{ fontSize: 13, color: MUTED, alignSelf: "center" }}>{contactOf(m.id) ?? ""}</span>
              {p.isLeader && m.id !== p.me?.id && (
                <button disabled={p.busy} onClick={() => p.onRemove(m)} style={{ ...ghostBtn, padding: "7px 14px", fontSize: 12.5 }}>Remove</button>
              )}
            </>
          }
        />
      ))}

      {p.isLeader && p.teamRequests.length > 0 && (
        <>
          <div style={sectionLabel}>People asking to join</div>
          {p.teamRequests.map((r) => {
            const person = nameOf(r.participant_id);
            return (
              <Row
                key={r.id}
                title={person?.full_name ?? "Someone"}
                chips={person?.skills}
                message={r.message}
                actions={
                  <>
                    <button disabled={p.busy} onClick={() => p.onRespond(r.id, true)} style={primaryBtn}>Accept</button>
                    <button disabled={p.busy} onClick={() => p.onRespond(r.id, false)} style={ghostBtn}>Decline</button>
                  </>
                }
              />
            );
          })}
        </>
      )}

      {p.isLeader && p.teamInvites.length > 0 && (
        <>
          <div style={sectionLabel}>Invites you sent</div>
          {p.teamInvites.map((r) => (
            <Row
              key={r.id}
              title={`Waiting on ${nameOf(r.participant_id)?.full_name ?? "someone"}`}
              message={r.message}
              actions={<button disabled={p.busy} onClick={() => p.onCancel(r.id)} style={ghostBtn}>Cancel invite</button>}
            />
          ))}
        </>
      )}

      <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${HAIR}` }}>
        <button onClick={p.onLeave} disabled={p.busy} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--tf-red)", textDecoration: "underline" }}>
          Leave this team
        </button>
      </div>
    </div>
  );
}
