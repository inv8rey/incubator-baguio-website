"use client";

import { useState } from "react";
import { SKILLS } from "./data";
import { TEXT, MUTED, ORANGE, Modal, ghostBtn, inputStyle, labelStyle, primaryBtn } from "./ui";

function SkillPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  function toggle(s: string) {
    onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s]);
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {SKILLS.map((s) => {
        const on = value.includes(s);
        return (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            aria-pressed={on}
            style={{ padding: "7px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${on ? ORANGE : "var(--tf-hair2)"}`, background: on ? "rgba(var(--tf-accent-rgb),0.14)" : "transparent", color: on ? "var(--tf-orange-text)" : "var(--tf-soft)" }}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

function Footer({ onClose, busy, label }: { onClose: () => void; busy: boolean; label: string }) {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
      <button type="button" onClick={onClose} style={ghostBtn}>Cancel</button>
      <button type="submit" disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.7 : 1 }}>{busy ? "Saving…" : label}</button>
    </div>
  );
}

export interface ProfileValues {
  full_name: string;
  skills: string[];
  bio: string;
  interest: string;
  contact: string;
  consent: boolean;
}

export function ProfileModal({
  initial,
  defaultName,
  editing,
  busy,
  onClose,
  onSave,
}: {
  initial?: Partial<ProfileValues>;
  defaultName: string;
  editing: boolean;
  busy: boolean;
  onClose: () => void;
  onSave: (v: ProfileValues) => Promise<boolean>;
}) {
  const [v, setV] = useState<ProfileValues>({
    full_name: initial?.full_name ?? defaultName,
    skills: initial?.skills ?? [],
    bio: initial?.bio ?? "",
    interest: initial?.interest ?? "",
    contact: initial?.contact ?? "",
    consent: editing,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (await onSave(v)) onClose();
  }

  return (
    <Modal title={editing ? "Edit your profile" : "Create your Team Finder profile"} onClose={onClose}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>Full name *</label>
          <input value={v.full_name} onChange={(e) => setV({ ...v, full_name: e.target.value })} style={inputStyle} required />
        </div>
        <div>
          <label style={labelStyle}>What can you bring to a team? * <span style={{ fontWeight: 500, color: MUTED }}>(pick all that apply)</span></label>
          <SkillPicker value={v.skills} onChange={(skills) => setV({ ...v, skills })} />
        </div>
        <div>
          <label style={labelStyle}>What would you like to work on?</label>
          <input value={v.interest} onChange={(e) => setV({ ...v, interest: e.target.value })} maxLength={200} placeholder="e.g. flood monitoring, tourism, waste, mobility" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Short bio</label>
          <textarea value={v.bio} onChange={(e) => setV({ ...v, bio: e.target.value })} maxLength={400} placeholder="A sentence or two about you: school or work, past projects…" style={{ ...inputStyle, minHeight: 78, resize: "vertical" }} />
        </div>
        <div>
          <label style={labelStyle}>How can teammates reach you? *</label>
          <input value={v.contact} onChange={(e) => setV({ ...v, contact: e.target.value })} placeholder="Email, Messenger link, or phone" style={inputStyle} required />
          <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>Never shown publicly. Only people on your team can see it, once you&rsquo;re matched.</div>
        </div>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, lineHeight: 1.5, color: "var(--tf-body2)", cursor: "pointer" }}>
          <input type="checkbox" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })} style={{ marginTop: 3, accentColor: ORANGE }} />
          <span>I agree to show my full name, skills, and short bio on the public PinaSIKLab Team Finder so teams can find me.</span>
        </label>
        <Footer onClose={onClose} busy={busy} label={editing ? "Save changes" : "Create profile"} />
      </form>
    </Modal>
  );
}

export interface TeamValues {
  name: string;
  looking_for: string[];
  note: string;
}

export function TeamModal({
  mode,
  initial,
  busy,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  initial?: TeamValues;
  busy: boolean;
  onClose: () => void;
  onSave: (v: TeamValues) => Promise<boolean>;
}) {
  const [v, setV] = useState<TeamValues>(initial ?? { name: "", looking_for: [], note: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (await onSave(v)) onClose();
  }

  return (
    <Modal title={mode === "create" ? "Start a team" : "Edit your team"} onClose={onClose}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {mode === "create" && (
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--tf-body)" }}>
            You&rsquo;ll be the team leader. You can invite people from the &ldquo;Find a member&rdquo; tab and approve requests from people who want to join.
          </p>
        )}
        <div>
          <label style={labelStyle}>Team name *</label>
          <input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} maxLength={50} style={inputStyle} required />
        </div>
        <div>
          <label style={labelStyle}>Who are you looking for? <span style={{ fontWeight: 500, color: MUTED }}>(optional)</span></label>
          <SkillPicker value={v.looking_for} onChange={(looking_for) => setV({ ...v, looking_for })} />
        </div>
        <div>
          <label style={labelStyle}>Note to would-be teammates</label>
          <textarea value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} maxLength={300} placeholder="What problem do you want to tackle? What kind of person would fit?" style={{ ...inputStyle, minHeight: 78, resize: "vertical" }} />
        </div>
        <Footer onClose={onClose} busy={busy} label={mode === "create" ? "Create team" : "Save changes"} />
      </form>
    </Modal>
  );
}

export function MessageModal({
  title,
  subtitle,
  placeholder,
  submitLabel,
  busy,
  onClose,
  onSend,
}: {
  title: string;
  subtitle: string;
  placeholder: string;
  submitLabel: string;
  busy: boolean;
  onClose: () => void;
  onSend: (message: string) => Promise<boolean>;
}) {
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (await onSend(message.trim())) onClose();
  }

  return (
    <Modal title={title} onClose={onClose} width={480}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--tf-body)" }}>{subtitle}</p>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={300} placeholder={placeholder} style={{ ...inputStyle, minHeight: 96, resize: "vertical" }} />
        <div style={{ fontSize: 12, marginTop: -6, color: TEXT, opacity: 0.55 }}>{message.length} / 300</div>
        <Footer onClose={onClose} busy={busy} label={submitLabel} />
      </form>
    </Modal>
  );
}
