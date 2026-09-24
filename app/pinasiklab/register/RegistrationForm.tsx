"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { checkFormGuard, honeypotProps } from "../../../lib/formGuard";
import { REGISTRATION_CLOSES_AT, REGISTRATION_DEADLINE } from "../config";
import { ThemeSwitch, useSiklabTheme } from "../theme";
import { CARD, HAIR, ICONS, Icon, MUTED, ORANGE, TEXT, ghostBtn, inputStyle, labelStyle, primaryBtn } from "../teams/ui";
import {
  AVAILABILITY,
  CATEGORIES,
  CONTINUE_AFTER,
  FOCUS_AREAS,
  HEARD_FROM,
  MUNICIPALITIES,
  SKILL_OPTIONS,
  SOLUTION_TYPES,
  STEP_SUBTITLES,
  STEP_TITLES,
} from "./options";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DRAFT_KEY = "ib_siklab_reg_draft_v1";
const CONTACT_EMAIL = "incubatorbaguio63@gmail.com";
const LAST = STEP_TITLES.length - 1;

interface Values {
  full_name: string; email: string; phone: string; age: string;
  category: string; category_other: string; organization: string; municipality: string;
  expertise: string; skills: string[]; skills_other: string;
  participation: "" | "individual" | "team";
  team_name: string; is_team_leader: "" | "yes" | "no"; team_leader_contact: string; team_size: string; team_members: string;
  contribution: string; teammate_preference: string;
  focus_areas: string[]; solution_types: string[];
  motivation: string; available: string; continue_after: string; heard_from: string; notes: string;
  consent_privacy: boolean; declaration: boolean; show_in_finder: boolean;
}

const EMPTY: Values = {
  full_name: "", email: "", phone: "", age: "", category: "", category_other: "", organization: "", municipality: "",
  expertise: "", skills: [], skills_other: "", participation: "",
  team_name: "", is_team_leader: "", team_leader_contact: "", team_size: "", team_members: "",
  contribution: "", teammate_preference: "",
  focus_areas: [], solution_types: [],
  motivation: "", available: "", continue_after: "", heard_from: "", notes: "",
  consent_privacy: false, declaration: false, show_in_finder: true,
};

type Errors = Partial<Record<keyof Values, string>>;

function validate(step: number, v: Values): Errors {
  const e: Errors = {};
  const need = (k: keyof Values, msg: string) => {
    const val = v[k];
    if (typeof val === "string" ? !val.trim() : Array.isArray(val) ? val.length === 0 : !val) e[k] = msg;
  };
  if (step === 0) {
    if (v.full_name.trim().length < 2) e.full_name = "Please enter your full name.";
    if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address.";
    const age = Number(v.age);
    if (!v.age.trim()) e.age = "Please enter your age.";
    else if (!Number.isInteger(age) || age < 18 || age > 30) e.age = "PinaSIKLab Baguio is open to young people aged 18 to 30.";
    need("category", "Pick the option that fits you best.");
    if (v.category === "Other") need("category_other", "Tell us a bit more.");
    need("organization", "Enter your school, organization, or company (or \"None\").");
    need("municipality", "Pick your current municipality or city.");
  }
  if (step === 1) {
    need("expertise", "Tell us your field, course, or area of expertise.");
    need("skills", "Pick at least one skill or area.");
    if (v.skills.includes("Other")) need("skills_other", "Tell us the other skill.");
  }
  if (step === 2) {
    need("participation", "Choose how you'd like to participate.");
    if (v.participation === "team") {
      need("team_name", "Give your team a name.");
      need("is_team_leader", "Tell us if you're the team leader.");
      if (v.is_team_leader === "no") need("team_leader_contact", "Who is your team leader? Add their name and email.");
      need("team_size", "How many members does your team have now?");
      need("team_members", "List your current team members.");
    }
    if (v.participation === "individual") need("contribution", "Tell us what you'd like to contribute to a team.");
  }
  if (step === 4) {
    need("motivation", "Tell us why you want to take part.");
    need("available", "Let us know your availability.");
    need("continue_after", "Let us know if you'd keep building.");
  }
  if (step === 5) {
    need("consent_privacy", "You need to agree to the data privacy statement to apply.");
    need("declaration", "You need to confirm the declaration to apply.");
  }
  return e;
}

const other = (choice: string, text: string) => (choice === "Other" ? `Other: ${text.trim()}` : choice);

function Field({ label, hint, error, required, htmlFor, children }: { label: string; hint?: string; error?: string; required?: boolean; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div data-invalid={error ? "1" : undefined} style={{ display: "flex", flexDirection: "column" }}>
      {htmlFor ? (
        <label htmlFor={htmlFor} style={labelStyle}>{label}{required && <span style={{ color: ORANGE }}> *</span>}</label>
      ) : (
        <div style={labelStyle}>{label}{required && <span style={{ color: ORANGE }}> *</span>}</div>
      )}
      {hint && <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5, marginTop: -2, marginBottom: 8 }}>{hint}</div>}
      {children}
      {error && <div role="alert" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tf-red)", marginTop: 7 }}>{error}</div>}
    </div>
  );
}

function OptionTile({ on, type, name, label, onChange }: { on: boolean; type: "radio" | "checkbox"; name: string; label: string; onChange: () => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${on ? ORANGE : "var(--tf-hair2)"}`, background: on ? "rgba(var(--tf-accent-rgb),0.09)" : "transparent", cursor: "pointer", fontSize: 14, lineHeight: 1.35, color: TEXT }}>
      <input type={type} name={name} checked={on} onChange={onChange} style={{ accentColor: ORANGE, flexShrink: 0, width: 16, height: 16 }} />
      {label}
    </label>
  );
}

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 } as const;

export default function RegistrationForm() {
  const { theme, toggle } = useSiklabTheme();
  const [v, setV] = useState<Values>(EMPTY);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
  const closed = ready && Date.now() >= new Date(REGISTRATION_CLOSES_AT).getTime();

  // Restore an unfinished application so a refresh or a dropped connection
  // doesn't cost someone a long form. Consents are never restored.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { v?: Partial<Values>; step?: number };
        if (d.v) setV({ ...EMPTY, ...d.v, consent_privacy: false, declaration: false });
        if (typeof d.step === "number" && d.step >= 0 && d.step < LAST) setStep(d.step);
      }
    } catch {
      // Unreadable draft: start fresh.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || done) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: { ...v, consent_privacy: false, declaration: false }, step }));
    } catch {
      // Storage blocked: the form still works, it just won't be remembered.
    }
  }, [v, step, ready, done]);

  function set<K extends keyof Values>(k: K, val: Values[K]) {
    setV((p) => ({ ...p, [k]: val }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  }
  const toggleIn = (k: "skills" | "solution_types" | "focus_areas", item: string) => set(k, v[k].includes(item) ? v[k].filter((x) => x !== item) : [...v[k], item]);

  function goTo(n: number) {
    setStep(n);
    setSubmitError("");
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  function next() {
    const e = validate(step, v);
    setErrors(e);
    if (Object.keys(e).length) {
      setTimeout(() => document.querySelector("[data-invalid='1']")?.scrollIntoView({ behavior: "smooth", block: "center" }), 30);
      return;
    }
    goTo(step + 1);
  }

  async function submit() {
    const e = validate(LAST, v);
    setErrors(e);
    if (Object.keys(e).length) return;
    // Re-check every earlier step so a jump-back edit can't slip an invalid answer through.
    for (let i = 0; i < LAST; i++) {
      if (Object.keys(validate(i, v)).length) {
        setErrors(validate(i, v));
        goTo(i);
        return;
      }
    }
    if (!supabase) {
      setSubmitError("Applications aren't open yet. Please try again soon.");
      return;
    }
    setBusy(true);
    setSubmitError("");
    const guard = await checkFormGuard(honeypot, "siklab-register");
    if (!guard.ok) {
      setBusy(false);
      if (guard.error) setSubmitError(guard.error);
      else setDone(true);
      return;
    }
    const team = v.participation === "team";
    const { error } = await supabase.from("siklab_registrations").insert({
      full_name: v.full_name.trim(),
      email: v.email.trim().toLowerCase(),
      phone: v.phone.trim(),
      age: Number(v.age),
      category: other(v.category, v.category_other),
      organization: v.organization.trim(),
      municipality: v.municipality,
      expertise: v.expertise.trim(),
      skills: v.skills.map((s) => other(s, v.skills_other)),
      participation: v.participation,
      team_name: team ? v.team_name.trim() : "",
      is_team_leader: team ? v.is_team_leader === "yes" : null,
      team_leader_contact: team && v.is_team_leader === "no" ? v.team_leader_contact.trim() : "",
      team_size: team ? Number(v.team_size) : null,
      team_members: team ? v.team_members.trim() : "",
      contribution: team ? "" : v.contribution.trim(),
      teammate_preference: team ? "" : v.teammate_preference.trim(),
      problem: v.focus_areas.join(", "),
      solution_types: v.solution_types,
      motivation: v.motivation.trim(),
      available_full_duration: v.available,
      continue_after: v.continue_after,
      heard_from: v.heard_from,
      notes: v.notes.trim(),
      consent_privacy: v.consent_privacy,
      declaration: v.declaration,
      show_in_finder: v.show_in_finder,
    });
    setBusy(false);
    if (error) {
      if (error.code === "23505") setSubmitError(`This email has already been used to apply. Need to change something? Email us at ${CONTACT_EMAIL}.`);
      else if (error.code === "42501") setSubmitError(`Applications have closed (deadline: ${REGISTRATION_DEADLINE}).`);
      else if (error.code === "42P01" || error.code === "PGRST205") setSubmitError("Applications aren't open yet. Please try again soon.");
      else setSubmitError("We couldn't send your application. Please check your answers and try again.");
      return;
    }
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Nothing to clean up.
    }
    setDone(true);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  const err = (k: keyof Values) => errors[k];
  const text = (k: keyof Values, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input id={`f-${k}`} value={v[k] as string} onChange={(e) => set(k, e.target.value as never)} aria-invalid={!!err(k)} style={{ ...inputStyle, borderColor: err(k) ? "var(--tf-red)" : undefined }} {...extra} />
  );
  const area = (k: keyof Values, placeholder: string, rows = 4, max = 2000) => (
    <textarea id={`f-${k}`} value={v[k] as string} onChange={(e) => set(k, e.target.value as never)} placeholder={placeholder} rows={rows} maxLength={max} aria-invalid={!!err(k)} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5, borderColor: err(k) ? "var(--tf-red)" : undefined }} />
  );
  const radios = (k: "category" | "municipality" | "available" | "continue_after" | "heard_from", options: string[]) => (
    <div style={grid} role="radiogroup">
      {options.map((o) => (
        <OptionTile key={o} type="radio" name={k} label={o} on={v[k] === o} onChange={() => set(k, o)} />
      ))}
    </div>
  );

  const summary: [number, string, [string, string][]][] = [
    [0, "About you", [["Name", v.full_name], ["Email", v.email], ["Age", v.age], ["Best describes you", other(v.category, v.category_other)], ["School / organization", v.organization], ["Municipality", v.municipality]]],
    [1, "Background", [["Field / expertise", v.expertise], ["Skills", v.skills.map((s) => other(s, v.skills_other)).join(", ")]]],
    [2, "How you'll join", v.participation === "team"
      ? [["Participation", "Existing team"], ["Team name", v.team_name], ["Team size", v.team_size], ["Team leader", v.is_team_leader === "yes" ? "You" : v.team_leader_contact]]
      : [["Participation", "Individual"], ["What you'd contribute", v.contribution]]],
    [4, "Commitment", [["Availability", v.available], ["Keep building after", v.continue_after]]],
  ];

  const card: React.CSSProperties = { background: CARD, border: `1px solid ${HAIR}`, borderRadius: 22, padding: "30px 32px" };

  if (closed && !done) {
    return (
      <div className="ib-siklab-tf ib-siklab-reg" data-theme={theme} style={{ background: "var(--tf-page)" }}>
        <div className="ib-siklab-regwrap" style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ ...card, textAlign: "center", padding: "48px 32px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", color: TEXT }}>Applications are closed</h2>
            <p style={{ margin: "0 auto", maxWidth: 520, fontSize: 15.5, lineHeight: 1.65, color: "var(--tf-body)" }}>
              The application deadline was {REGISTRATION_DEADLINE}. Questions? Email <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: ORANGE, fontWeight: 600 }}>{CONTACT_EMAIL}</a>.
            </p>
            <div style={{ marginTop: 26 }}><a href={`${BP}/pinasiklab/`} style={primaryBtn}>Back to PinaSIKLab</a></div>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="ib-siklab-tf ib-siklab-reg" data-theme={theme} style={{ background: "var(--tf-page)" }}>
        <div ref={topRef} className="ib-siklab-regwrap" style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ ...card, textAlign: "center", padding: "48px 32px" }}>
            <div style={{ width: 60, height: 60, borderRadius: 9999, background: "var(--tf-green-bg)", color: "var(--tf-green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Icon d={ICONS.check} size={28} />
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", color: TEXT }}>Application received</h2>
            <p style={{ margin: "0 auto", maxWidth: 520, fontSize: 15.5, lineHeight: 1.65, color: "var(--tf-body)" }}>
              Thank you{v.full_name ? `, ${v.full_name.trim().split(/\s+/)[0]}` : ""}. The team will review applications and contact you at <strong style={{ color: TEXT }}>{v.email}</strong>. Submitting does not guarantee selection.
            </p>
            {v.participation === "individual" && (
              <p style={{ margin: "18px auto 0", maxWidth: 520, fontSize: 14.5, lineHeight: 1.6, color: "var(--tf-body)" }}>
                Applying as an individual? Browse the Team Finder to meet other participants and start forming a team while you wait.
              </p>
            )}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
              {v.participation === "individual" && <a href={`${BP}/pinasiklab/teams/`} style={primaryBtn}>Open the Team Finder</a>}
              <a href={`${BP}/pinasiklab/`} style={v.participation === "individual" ? ghostBtn : primaryBtn}>Back to PinaSIKLab</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ib-siklab-tf ib-siklab-reg" data-theme={theme} style={{ background: "var(--tf-page)" }}>
      <div ref={topRef} className="ib-siklab-regwrap" style={{ maxWidth: 820, margin: "0 auto", scrollMarginTop: 90 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE }}>Step {step + 1} of {STEP_TITLES.length}</div>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>Your progress is saved on this device.</div>
          </div>
          <ThemeSwitch theme={theme} onToggle={toggle} />
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 22 }} role="list" aria-label="Progress">
          {STEP_TITLES.map((t, i) => (
            <button key={t} type="button" role="listitem" title={t} disabled={i > step} onClick={() => i < step && goTo(i)} aria-current={i === step ? "step" : undefined}
              style={{ flex: 1, height: 6, borderRadius: 9999, border: "none", padding: 0, background: i <= step ? ORANGE : "var(--tf-track)", opacity: i < step ? 0.6 : 1, cursor: i < step ? "pointer" : "default" }} />
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (step === LAST) submit(); else next(); }} noValidate style={card}>
          <input {...honeypotProps} value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em", color: TEXT }}>{STEP_TITLES[step]}</h2>
          <p style={{ margin: "6px 0 26px", fontSize: 14.5, lineHeight: 1.55, color: "var(--tf-body)" }}>{STEP_SUBTITLES[step]}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {step === 0 && (
              <>
                <Field label="Full name" required htmlFor="f-full_name" error={err("full_name")}>{text("full_name", { autoComplete: "name", placeholder: "First name and last name" })}</Field>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
                  <Field label="Email address" required htmlFor="f-email" error={err("email")}>{text("email", { type: "email", autoComplete: "email", placeholder: "you@example.com" })}</Field>
                  <Field label="Mobile number" htmlFor="f-phone">{text("phone", { type: "tel", autoComplete: "tel", placeholder: "09XX XXX XXXX" })}</Field>
                </div>
                <Field label="Age" required htmlFor="f-age" error={err("age")} hint="Open to ages 18 to 30.">{text("age", { type: "number", inputMode: "numeric", min: 18, max: 30, placeholder: "e.g. 22", style: { ...inputStyle, maxWidth: 140, borderColor: err("age") ? "var(--tf-red)" : undefined } })}</Field>
                <Field label="Which best describes you?" required error={err("category") || err("category_other")}>
                  {radios("category", CATEGORIES)}
                  {v.category === "Other" && <div style={{ marginTop: 10 }}>{text("category_other", { placeholder: "Please specify", maxLength: 120 })}</div>}
                </Field>
                <Field label="School / university / organization / company" required htmlFor="f-organization" error={err("organization")}>{text("organization", { maxLength: 200, placeholder: "Where you study or work" })}</Field>
                <Field label="Current municipality / city" required error={err("municipality")} hint="Applicants must live, study, or work in the BLISTT area.">{radios("municipality", MUNICIPALITIES)}</Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="What is your field, course, profession, or area of expertise?" required htmlFor="f-expertise" error={err("expertise")} hint="For example: Computer Science, Entrepreneurship, Environmental Science, Graphic Design, Community Development.">{text("expertise", { maxLength: 300 })}</Field>
                <Field label="Which skills or areas can you contribute to a team?" required error={err("skills") || err("skills_other")} hint="Pick all that apply.">
                  <div style={grid}>
                    {SKILL_OPTIONS.map((s) => (
                      <OptionTile key={s} type="checkbox" name="skills" label={s} on={v.skills.includes(s)} onChange={() => toggleIn("skills", s)} />
                    ))}
                  </div>
                  {v.skills.includes("Other") && <div style={{ marginTop: 10 }}>{text("skills_other", { placeholder: "Please specify", maxLength: 120 })}</div>}
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Field label="How would you like to participate?" required error={err("participation")}>
                  <div style={grid} role="radiogroup">
                    <OptionTile type="radio" name="participation" label="I'm applying as an individual" on={v.participation === "individual"} onChange={() => set("participation", "individual")} />
                    <OptionTile type="radio" name="participation" label="I'm applying with an existing team" on={v.participation === "team"} onChange={() => set("participation", "team")} />
                  </div>
                </Field>

                {v.participation === "individual" && (
                  <>
                    <div style={{ background: "var(--tf-card2)", border: `1px solid ${HAIR}`, borderRadius: 14, padding: "14px 16px", fontSize: 14, lineHeight: 1.55, color: "var(--tf-body)" }}>
                      Individual applicants are matched with other participants based on their skills and interests. Once you apply, you can also browse the <a href={`${BP}/pinasiklab/teams/`} style={{ color: ORANGE, fontWeight: 600 }}>Team Finder</a> to meet possible teammates.
                    </div>
                    <Field label="What would you like to contribute to a team?" required htmlFor="f-contribution" error={err("contribution")}>{area("contribution", "The skills, experience, or perspective you'd bring…", 4, 1500)}</Field>
                    <Field label="What kind of teammates would complement you?" htmlFor="f-teammate_preference" hint="Optional. Helps us match you.">{area("teammate_preference", "e.g. someone who can build the prototype while I handle research and pitching", 3, 1000)}</Field>
                  </>
                )}

                {v.participation === "team" && (
                  <>
                    <Field label="Team name" required htmlFor="f-team_name" error={err("team_name")}>{text("team_name", { maxLength: 80 })}</Field>
                    <Field label="Are you the team leader / contact person?" required error={err("is_team_leader")}>
                      <div style={grid} role="radiogroup">
                        <OptionTile type="radio" name="leader" label="Yes" on={v.is_team_leader === "yes"} onChange={() => set("is_team_leader", "yes")} />
                        <OptionTile type="radio" name="leader" label="No" on={v.is_team_leader === "no"} onChange={() => set("is_team_leader", "no")} />
                      </div>
                    </Field>
                    {v.is_team_leader === "no" && (
                      <Field label="Who is your team leader?" required htmlFor="f-team_leader_contact" error={err("team_leader_contact")} hint="Name and email, so we know who to contact for the team.">{text("team_leader_contact", { maxLength: 300 })}</Field>
                    )}
                    <Field label="How many members are currently in your team?" required error={err("team_size")} hint="Including you. Teams can have up to 5 members.">
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }} role="radiogroup">
                        {["2", "3", "4", "5"].map((n) => (
                          <OptionTile key={n} type="radio" name="team_size" label={n} on={v.team_size === n} onChange={() => set("team_size", n)} />
                        ))}
                      </div>
                    </Field>
                    <Field label="List your current team members" required htmlFor="f-team_members" error={err("team_members")} hint="One per line: name and email.">{area("team_members", "Ana Reyes, ana@example.com", 5, 1500)}</Field>
                  </>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <Field label="What local problem or challenge are you interested in solving?" hint="Pick all that apply.">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {FOCUS_AREAS.map(([name, desc]) => {
                      const on = v.focus_areas.includes(name);
                      return (
                        <label key={name} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${on ? ORANGE : "var(--tf-hair2)"}`, background: on ? "rgba(var(--tf-accent-rgb),0.09)" : "transparent", cursor: "pointer", color: TEXT }}>
                          <input type="checkbox" name="focus" checked={on} onChange={() => toggleIn("focus_areas", name)} style={{ accentColor: ORANGE, flexShrink: 0, width: 16, height: 16, marginTop: 2 }} />
                          <span><span style={{ display: "block", fontSize: 14.5, fontWeight: 600 }}>{name}</span><span style={{ display: "block", fontSize: 13, lineHeight: 1.5, color: MUTED, marginTop: 2 }}>{desc}</span></span>
                        </label>
                      );
                    })}
                  </div>
                </Field>
                <Field label="What type of solution are you interested in developing?" hint="Pick all that apply.">
                  <div style={grid}>
                    {SOLUTION_TYPES.map((s) => (
                      <OptionTile key={s} type="checkbox" name="solution" label={s} on={v.solution_types.includes(s)} onChange={() => toggleIn("solution_types", s)} />
                    ))}
                  </div>
                </Field>
              </>
            )}

            {step === 4 && (
              <>
                <Field label="Why do you want to participate in PinaSIKLab Baguio 2026?" required htmlFor="f-motivation" error={err("motivation")}>{area("motivation", "What draws you to this, and what do you hope to get out of it?", 5)}</Field>
                <Field label="Are you available for the full two days, October 30–31, 2026?" required error={err("available")}>
                  {radios("available", AVAILABILITY)}
                  {v.available.startsWith("No") && <div style={{ fontSize: 13, color: "var(--tf-orange-text)", marginTop: 10, lineHeight: 1.5 }}>The sprint runs the full two days, so applicants who can't attend may not be considered.</div>}
                </Field>
                <Field label="If selected, would you keep developing your solution after the Baguio sprint?" required error={err("continue_after")}>{radios("continue_after", CONTINUE_AFTER)}</Field>
                <Field label="How did you hear about PinaSIKLab?" hint="Optional.">{radios("heard_from", HEARD_FROM)}</Field>
                <Field label="Anything we should know?" htmlFor="f-notes" hint="Optional. Accessibility needs, dietary restrictions, or anything else.">{area("notes", "", 3, 1000)}</Field>
              </>
            )}

            {step === 5 && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {summary.map(([i, title, rows]) => (
                    <div key={title} style={{ background: "var(--tf-card2)", border: `1px solid ${HAIR}`, borderRadius: 14, padding: "16px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--tf-label)" }}>{title}</div>
                        <button type="button" onClick={() => goTo(i)} style={{ background: "none", border: "none", color: ORANGE, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Edit</button>
                      </div>
                      {rows.filter(([, val]) => val).map(([label, val]) => (
                        <div key={label} style={{ display: "flex", gap: 14, fontSize: 14, lineHeight: 1.5, padding: "3px 0" }}>
                          <span style={{ width: 150, flexShrink: 0, color: MUTED }}>{label}</span>
                          <span style={{ color: TEXT, wordBreak: "break-word" }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <Field label="Data privacy" required error={err("consent_privacy")}>
                  <label style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, lineHeight: 1.55, color: "var(--tf-body2)", cursor: "pointer" }}>
                    <input type="checkbox" checked={v.consent_privacy} onChange={(e) => set("consent_privacy", e.target.checked)} style={{ accentColor: ORANGE, marginTop: 3, width: 16, height: 16, flexShrink: 0 }} />
                    <span>I consent to the collection and processing of my personal information for the screening, communication, documentation, and implementation of PinaSIKLab Baguio 2026, in accordance with applicable data privacy requirements.</span>
                  </label>
                </Field>
                <Field label="Team Finder" hint="Optional. You can change this later by emailing us.">
                  <label style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, lineHeight: 1.55, color: "var(--tf-body2)", cursor: "pointer" }}>
                    <input type="checkbox" checked={v.show_in_finder} onChange={(e) => set("show_in_finder", e.target.checked)} style={{ accentColor: ORANGE, marginTop: 3, width: 16, height: 16, flexShrink: 0 }} />
                    <span>Once my application is approved, show me on the Team Finder so other participants can find me{v.participation === "team" ? " and my team" : " and invite me to a team"}. Only my name, skills{v.participation === "team" ? ", team name and member names" : " and what I'd contribute"} are shown. My email and phone are never shown.</span>
                  </label>
                </Field>
                <Field label="Application declaration" required error={err("declaration")}>
                  <label style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, lineHeight: 1.55, color: "var(--tf-body2)", cursor: "pointer" }}>
                    <input type="checkbox" checked={v.declaration} onChange={(e) => set("declaration", e.target.checked)} style={{ accentColor: ORANGE, marginTop: 3, width: 16, height: 16, flexShrink: 0 }} />
                    <span>I confirm that the information in this application is true and complete to the best of my knowledge. I understand that submitting does not guarantee selection and that applications are reviewed against the program&rsquo;s eligibility and selection criteria.</span>
                  </label>
                </Field>
              </>
            )}
          </div>

          {Object.keys(errors).length > 0 && (
            <div role="alert" style={{ marginTop: 20, fontSize: 13.5, fontWeight: 600, color: "var(--tf-red)" }}>Please fix the highlighted fields to continue.</div>
          )}
          {submitError && <div role="alert" style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: "var(--tf-red-bg)", color: "var(--tf-red)", fontSize: 13.5, fontWeight: 600, lineHeight: 1.5 }}>{submitError}</div>}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 28, paddingTop: 22, borderTop: `1px solid ${HAIR}`, flexWrap: "wrap" }}>
            {step > 0 ? <button type="button" onClick={() => goTo(step - 1)} style={ghostBtn}>Back</button> : <span style={{ fontSize: 12.5, color: MUTED }}>Deadline: {REGISTRATION_DEADLINE || "to be announced"}</span>}
            <button type="submit" disabled={busy} style={{ ...primaryBtn, padding: "13px 28px", opacity: busy ? 0.7 : 1 }}>
              {step === LAST ? (busy ? "Submitting…" : "Submit application") : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
