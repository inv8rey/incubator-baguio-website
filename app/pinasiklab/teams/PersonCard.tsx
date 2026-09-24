"use client";

import type { Person, Req, Viewer } from "./data";
import { CARD, Chip, TEXT, HAIR, MUTED, ORANGE, disabledBtn, primaryBtn } from "./ui";

interface Props {
  person: Person;
  viewer: Viewer;
  teamName?: string;
  pending?: Req;
  onInvite: (person: Person) => void;
  onCancel: (reqId: string) => void;
}

export default function PersonCard({ person, viewer, teamName, pending, onInvite, onCancel }: Props) {
  const isMe = viewer.myId === person.id;

  let action: React.ReactNode = null;
  if (isMe) {
    action = <span style={{ ...disabledBtn, color: ORANGE, background: "rgba(242,101,34,0.08)" }}>This is you</span>;
  } else if (viewer.isLeader && viewer.myTeamOpen) {
    action = pending ? (
      pending.kind === "invite" ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...disabledBtn, color: "var(--tf-green)", background: "var(--tf-green-bg)" }}>Invite sent</span>
          <button onClick={() => onCancel(pending.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: MUTED, textDecoration: "underline" }}>Cancel</button>
        </div>
      ) : (
        <span style={{ ...disabledBtn, color: ORANGE, background: "rgba(242,101,34,0.08)" }}>Asked to join &mdash; see your team</span>
      )
    ) : (
      <button onClick={() => onInvite(person)} style={primaryBtn}>Invite to {teamName ?? "your team"}</button>
    );
  } else if (viewer.isLeader) {
    action = <span style={disabledBtn}>Your team is closed</span>;
  }

  return (
    <article style={{ background: CARD, border: `1px solid ${isMe ? "rgba(242,101,34,0.5)" : HAIR}`, borderRadius: 20, padding: 22, display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 42, height: 42, borderRadius: 9999, background: "var(--tf-fill)", color: "var(--tf-body)", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {person.full_name.trim().charAt(0).toUpperCase()}
        </span>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em", color: TEXT, lineHeight: 1.2, wordBreak: "break-word" }}>{person.full_name}</h3>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--tf-green)" }}>Looking for a team</span>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {person.skills.map((s) => (
          <Chip key={s} small>{s}</Chip>
        ))}
      </div>

      {person.interest && (
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--tf-label)", marginBottom: 4 }}>Wants to work on</div>
          <div style={{ fontSize: 13.5, color: "var(--tf-body2)", lineHeight: 1.5 }}>{person.interest}</div>
        </div>
      )}
      {person.bio && <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--tf-body)" }}>{person.bio}</p>}

      {action && <div style={{ marginTop: "auto", paddingTop: 4 }}>{action}</div>}
    </article>
  );
}
