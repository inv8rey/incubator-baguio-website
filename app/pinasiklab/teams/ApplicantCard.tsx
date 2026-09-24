"use client";

import { mapSkills, type Applicant } from "./data";
import { CARD, Chip, HAIR, TEXT, MUTED } from "./ui";

// Read-only card for someone who applied and opted in but hasn't made a Team
// Finder account yet. Once they log in with the same email and create their
// profile (or a team of the same name), the real card replaces this one.
export default function ApplicantCard({ a, loginHref }: { a: Applicant; loginHref: string }) {
  const team = a.participation === "team";
  const skills = mapSkills(a.skills);
  return (
    <article style={{ background: CARD, border: `1px dashed var(--tf-hair2)`, borderRadius: 20, padding: 22, display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 42, height: 42, borderRadius: 9999, background: "var(--tf-fill)", color: "var(--tf-body)", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {(team ? a.team_name : a.full_name).trim().charAt(0).toUpperCase()}
        </span>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em", color: TEXT, lineHeight: 1.2, wordBreak: "break-word" }}>{team ? a.team_name : a.full_name}</h3>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--tf-orange-text)" }}>{team ? `Applied as a team${a.team_size ? ` of ${a.team_size}` : ""}` : "Applied · looking for a team"}</span>
        </div>
      </div>

      {team && a.member_names.length > 0 && (
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--tf-body2)" }}>{a.member_names.join(" · ")}</div>
      )}
      {skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {skills.map((s) => <Chip key={s} small>{s}</Chip>)}
        </div>
      )}
      {!team && a.bio && <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--tf-body)" }}>{a.bio}</p>}

      <div style={{ marginTop: "auto", paddingTop: 4, fontSize: 12.5, lineHeight: 1.5, color: MUTED }}>
        {team ? "Team leader: log in with your application email and start this team to take requests." : "Applied but not on the Team Finder yet."}{" "}
        <a href={loginHref} style={{ color: "var(--tf-orange-text)", fontWeight: 600, borderBottom: `1px solid ${HAIR}` }}>Is this you? Log in</a>
      </div>
    </article>
  );
}
