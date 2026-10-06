"use client";

import { useState } from "react";
import { mapSkills, type Applicant } from "./data";
import { CARD, Chip, HAIR, TEXT, MUTED, Modal, inputStyle, labelStyle, primaryBtn, ghostBtn } from "./ui";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Sends a message through the site (see /api/pinasiklab/contact). The
// applicant's email is never sent to the browser, so it can't be scraped.
function ContactModal({ a, onClose }: { a: Applicant; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const first = a.full_name.trim().split(/\s+/)[0];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${BP}/api/pinasiklab/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, name, email, message, hp }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) setSent(true);
      else setError(data.error || "We couldn't send your message. Please try again.");
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    }
    setBusy(false);
  }

  return (
    <Modal title={sent ? "Message sent" : `Contact ${first}`} onClose={onClose} width={480}>
      {sent ? (
        <div>
          <p style={{ margin: "0 0 18px", fontSize: 14.5, lineHeight: 1.6, color: "var(--tf-body)" }}>
            We emailed your message to {first}. If they&rsquo;re interested, they&rsquo;ll reply to {email}.
          </p>
          <button type="button" onClick={onClose} style={primaryBtn}>Done</button>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: MUTED }}>
            We&rsquo;ll email this to {first} for you. Their email address stays private, and they can reply to you directly.
          </p>
          <div>
            <label htmlFor="ct-name" style={labelStyle}>Your name</label>
            <input id="ct-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required style={inputStyle} />
          </div>
          <div>
            <label htmlFor="ct-email" style={labelStyle}>Your email</label>
            <input id="ct-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} required style={inputStyle} />
          </div>
          <div>
            <label htmlFor="ct-msg" style={labelStyle}>Message</label>
            <textarea id="ct-msg" value={message} onChange={(e) => setMessage(e.target.value)} minLength={10} maxLength={1000} rows={5} required placeholder={`Hi ${first}, I'd like to team up for PinaSIKLab because…`} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
          </div>
          <input type="text" name="website_url_confirm" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />
          {error && <div role="alert" style={{ fontSize: 13.5, color: "var(--tf-red)" }}>{error}</div>}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="submit" disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.7 : 1 }}>{busy ? "Sending…" : "Send message"}</button>
            <button type="button" onClick={onClose} style={ghostBtn}>Cancel</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// Read-only card for someone who applied and opted in but hasn't made a Team
// Finder account yet. Once they log in with the same email and create their
// profile (or a team of the same name), the real card replaces this one.
export default function ApplicantCard({ a, loginHref, sample }: { a: Applicant; loginHref: string; sample?: boolean }) {
  const team = a.participation === "team";
  const skills = mapSkills(a.skills);
  const [contacting, setContacting] = useState(false);
  return (
    <article style={{ background: CARD, border: `1px dashed var(--tf-hair2)`, borderRadius: 20, padding: 22, display: "flex", flexDirection: "column", gap: 13 }}>
      {sample && (
        <span style={{ alignSelf: "flex-start", background: "rgba(var(--tf-accent-rgb),0.14)", color: "var(--tf-orange-text)", border: "1px solid rgba(var(--tf-accent-rgb),0.35)", borderRadius: 9999, padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em" }}>SAMPLE</span>
      )}
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

      {!team && (
        <div>
          <button type="button" onClick={() => !sample && setContacting(true)} disabled={sample} style={{ ...ghostBtn, padding: "8px 16px", fontSize: 13, opacity: sample ? 0.55 : 1, cursor: sample ? "default" : "pointer" }}>
            Contact
          </button>
        </div>
      )}

      <div style={{ marginTop: "auto", paddingTop: 4, fontSize: 12.5, lineHeight: 1.5, color: MUTED }}>
        {sample ? "This is a sample card showing how a listing will look. The people and team here are made up." : team ? "Team leader: log in with your application email and start this team to take requests." : "Applied but not on the Team Finder yet."}{" "}
        {!sample && <a href={loginHref} style={{ color: "var(--tf-orange-text)", fontWeight: 600, borderBottom: `1px solid ${HAIR}` }}>Is this you? Log in</a>}
      </div>
      {contacting && <ContactModal a={a} onClose={() => setContacting(false)} />}
    </article>
  );
}
