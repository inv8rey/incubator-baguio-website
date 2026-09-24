"use client";

import { MAX_MEMBERS, type Person, type Req, type Team, type Viewer } from "./data";
import { CARD, Chip, TEXT, HAIR, ICONS, Icon, MUTED, ORANGE, disabledBtn, ghostBtn, primaryBtn } from "./ui";

interface Props {
  team: Team;
  members: Person[];
  viewer: Viewer;
  /** The open request or invite between the viewer and this team, if any. */
  pending?: Req;
  onRequest: (team: Team) => void;
  onCancel: (reqId: string) => void;
  onNeedProfile: () => void;
}

export default function TeamCard({ team, members, viewer, pending, onRequest, onCancel, onNeedProfile }: Props) {
  const full = members.length >= MAX_MEMBERS;
  const open = !team.locked && !full;
  const isMine = viewer.myTeamId === team.id;
  const leader = members.find((m) => m.id === team.leader_id);
  const ordered = [...members].sort((a, b) => (a.id === team.leader_id ? -1 : b.id === team.leader_id ? 1 : 0));

  let action: React.ReactNode = null;
  if (isMine) {
    action = <span style={{ ...disabledBtn, color: ORANGE, background: "rgba(var(--tf-accent-rgb),0.08)" }}>Your team</span>;
  } else if (!open) {
    action = (
      <span style={disabledBtn}>
        <Icon d={ICONS.lock} size={13} /> {full ? "Team full" : "Locked in"}
      </span>
    );
  } else if (viewer.status === "guest") {
    action = <a href={viewer.loginHref} style={ghostBtn}>Log in to request</a>;
  } else if (viewer.status === "noProfile") {
    action = <button onClick={onNeedProfile} style={ghostBtn}>Create profile to join</button>;
  } else if (viewer.status === "member") {
    action = <span style={disabledBtn}>You&rsquo;re on a team</span>;
  } else if (pending) {
    action =
      pending.kind === "request" ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...disabledBtn, color: "var(--tf-green)", background: "var(--tf-green-bg)" }}>Request sent</span>
          <button onClick={() => onCancel(pending.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: MUTED, textDecoration: "underline" }}>Cancel</button>
        </div>
      ) : (
        <span style={{ ...disabledBtn, color: ORANGE, background: "rgba(var(--tf-accent-rgb),0.08)" }}>Invited you &mdash; see below</span>
      );
  } else {
    action = <button onClick={() => onRequest(team)} style={primaryBtn}>Request to join</button>;
  }

  return (
    <article
      style={{
        background: CARD,
        border: `1px solid ${isMine ? "rgba(var(--tf-accent-rgb),0.5)" : HAIR}`,
        boxShadow: isMine ? "0 0 0 3px rgba(var(--tf-accent-rgb),0.08)" : "none",
        borderRadius: 20,
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        opacity: open || isMine ? 1 : 0.92,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", color: TEXT, lineHeight: 1.2, wordBreak: "break-word" }}>{team.name}</h3>
        {open ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--tf-green)", background: "var(--tf-green-bg)", padding: "4px 10px", borderRadius: 9999, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: 9999, background: "var(--tf-green)" }} /> Open
          </span>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--tf-muted)", background: "var(--tf-fill)", padding: "4px 10px", borderRadius: 9999, flexShrink: 0 }}>
            <Icon d={ICONS.lock} size={11} /> {full ? "Full" : "Locked"}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: 5 }} aria-hidden="true">
          {Array.from({ length: MAX_MEMBERS }, (_, i) => (
            <span key={i} style={{ width: 11, height: 11, borderRadius: 9999, background: i < members.length ? ORANGE : "var(--tf-track)" }} />
          ))}
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTED }}>
          {members.length} / {MAX_MEMBERS} members
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {ordered.map((m) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ width: 28, height: 28, borderRadius: 9999, background: "var(--tf-fill)", color: "var(--tf-body)", fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {m.full_name.trim().charAt(0).toUpperCase()}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{m.full_name}</span>
            {leader && m.id === leader.id && (
              <span title="Team leader" style={{ color: ORANGE, display: "inline-flex" }}>
                <Icon d={ICONS.star} size={12} />
              </span>
            )}
            <span style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {m.skills.slice(0, 2).map((s) => (
                <Chip key={s} small>{s}</Chip>
              ))}
            </span>
          </div>
        ))}
      </div>

      {open && (
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--tf-label)", marginBottom: 8 }}>Looking for</div>
          {team.looking_for.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {team.looking_for.map((s) => (
                <Chip key={s} tone="orange" small>{s}</Chip>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: 13, color: MUTED }}>Open to anyone with a good fit.</span>
          )}
        </div>
      )}

      {team.note && <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--tf-body)", fontStyle: "italic" }}>&ldquo;{team.note}&rdquo;</p>}

      <div style={{ marginTop: "auto", paddingTop: 4 }}>{action}</div>
    </article>
  );
}
