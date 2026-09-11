"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PATHWAYS, PATH_ORDER, score, visibleQuestions, type PathKey, type Result } from "./data";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
const ORANGE = "#F26522";
const INK = "#1A1714";
const MUTED = "#5A544B";
const LINE = "rgba(64,50,34,0.13)";

// Answers survive a reload or an accidental back-navigation. Deliberately
// localStorage and nothing else -- the PRD requires no account, and none of
// this ever leaves the browser.
const STORAGE_KEY = "ib-pathfinder-v1";

interface Saved {
  answers: Record<string, string>;
  finished: boolean;
}

function load(): Saved | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Saved;
    if (!parsed || typeof parsed.answers !== "object" || parsed.answers === null) return null;
    return { answers: parsed.answers, finished: !!parsed.finished };
  } catch {
    return null;
  }
}

function save(state: Saved) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private browsing, quota, etc -- the tool still works, it just won't resume */
  }
}

export default function PathFinder() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  /** Null until the localStorage read runs, so SSR and first paint agree. */
  const [hydrated, setHydrated] = useState(false);
  const [resumable, setResumable] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  /** Skip the focus/scroll on the very first render; only move on navigation. */
  const movedRef = useRef(false);

  useEffect(() => {
    const saved = load();
    if (saved && Object.keys(saved.answers).length > 0) {
      setAnswers(saved.answers);
      if (saved.finished) {
        setFinished(true);
        setStarted(true);
      } else {
        setResumable(true);
      }
    }
    setHydrated(true);
  }, []);

  const questions = useMemo(() => visibleQuestions(answers), [answers]);
  const total = questions.length;
  const current = questions[Math.min(step, total - 1)];
  const answeredCount = questions.filter((q) => answers[q.id]).length;

  const persist = useCallback((next: Record<string, string>, isFinished: boolean) => {
    save({ answers: next, finished: isFinished });
  }, []);

  // Move focus to the new question so keyboard and screen-reader users follow
  // the flow; scroll the card into view because on mobile the option list is
  // taller than the viewport and the question would otherwise sit off-screen.
  useEffect(() => {
    if (!movedRef.current) {
      movedRef.current = true;
      return;
    }
    headingRef.current?.focus();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [step, finished]);

  const choose = useCallback(
    (questionId: string, optionId: string) => {
      const next = { ...answers, [questionId]: optionId };
      setAnswers(next);

      // Recompute against the *new* answers -- this choice may have just
      // hidden or revealed a later question.
      const nextQuestions = visibleQuestions(next);
      const atEnd = step >= nextQuestions.length - 1;
      persist(next, atEnd);
      if (atEnd) setFinished(true);
      else setStep(step + 1);
    },
    [answers, step, persist]
  );

  const back = useCallback(() => {
    if (finished) {
      setFinished(false);
      setStep(Math.max(0, questions.length - 1));
      persist(answers, false);
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  }, [finished, questions.length, answers, persist]);

  const restart = useCallback(() => {
    setAnswers({});
    setStep(0);
    setFinished(false);
    setResumable(false);
    setStarted(true);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // 1-9 pick an option, Backspace goes back. Real keyboard users can also
  // just Tab to the buttons -- these are a shortcut, not the only route.
  useEffect(() => {
    if (finished || !started || !current) return;
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        back();
        return;
      }
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || !current) return;
      const opt = current.options[n - 1];
      if (opt) {
        e.preventDefault();
        choose(current.id, opt.id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, started, current, choose, back]);

  const result = useMemo<Result | null>(() => (finished ? score(answers) : null), [finished, answers]);

  if (!hydrated) {
    // Matches the intro card's footprint so the page doesn't jump once the
    // localStorage read settles.
    return <div style={{ minHeight: 420 }} />;
  }

  if (finished && result) return <ResultScreen result={result} onRestart={restart} onBack={back} />;

  if (!started) return <Intro resumable={resumable} onStart={() => setStarted(true)} onRestart={restart} />;

  return (
    <div ref={topRef} style={{ scrollMarginTop: 96 }}>
      <Progress step={step} total={total} answered={answeredCount} />

      <div
        style={{
          background: "#fff",
          border: `1px solid ${LINE}`,
          borderRadius: 20,
          padding: "34px 34px 30px",
          boxShadow: "0 18px 40px -30px rgba(26,23,20,0.35)",
        }}
        className="ib-pf-card"
      >
        <h2
          ref={headingRef}
          tabIndex={-1}
          style={{
            margin: "0 0 6px",
            fontSize: 25,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: INK,
            lineHeight: 1.25,
            outline: "none",
          }}
          className="ib-pf-question"
        >
          {current.text}
        </h2>
        {current.help ? (
          <p style={{ margin: "0 0 20px", fontSize: 14, color: MUTED, lineHeight: 1.5 }}>{current.help}</p>
        ) : (
          <div style={{ height: 20 }} />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {current.options.map((o, i) => {
            const selected = answers[current.id] === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => choose(current.id, o.id)}
                className="ib-pf-option"
                aria-pressed={selected}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  width: "100%",
                  textAlign: "left",
                  background: selected ? "rgba(242,101,34,0.08)" : "#FBFAF6",
                  border: `1.5px solid ${selected ? ORANGE : LINE}`,
                  borderRadius: 14,
                  padding: "15px 18px",
                  minHeight: 56,
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: 15,
                  lineHeight: 1.45,
                  color: INK,
                }}
              >
                <span
                  aria-hidden="true"
                  className="ib-pf-key"
                  style={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    border: `1px solid ${selected ? ORANGE : LINE}`,
                    background: selected ? ORANGE : "#fff",
                    color: selected ? "#fff" : "#8A8378",
                    fontSize: 12.5,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </span>
                <span>{o.label}</span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            marginTop: 22,
            paddingTop: 18,
            borderTop: `1px solid ${LINE}`,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "none",
              border: "none",
              padding: "10px 4px",
              minHeight: 44,
              font: "inherit",
              fontSize: 14,
              fontWeight: 600,
              color: step === 0 ? "#B4AEA4" : MUTED,
              cursor: step === 0 ? "default" : "pointer",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Back
          </button>
          <span className="ib-pf-hint" style={{ fontSize: 12.5, color: "#8A8378" }}>
            Tip: press <kbd style={kbdStyle}>1</kbd>&ndash;<kbd style={kbdStyle}>9</kbd> to answer
          </span>
        </div>
      </div>

      <p style={{ margin: "18px 0 0", fontSize: 13, color: "#8A8378", textAlign: "center" }}>
        No account needed. Your answers stay on this device.
      </p>
    </div>
  );
}

const kbdStyle: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${LINE}`,
  borderRadius: 5,
  padding: "1px 5px",
  fontSize: 11.5,
  fontFamily: "inherit",
  color: MUTED,
};

function Progress({ step, total, answered }: { step: number; total: number; answered: number }) {
  const pct = Math.round((answered / total) * 100);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 9 }}>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", color: MUTED }}>
          Question {step + 1} of {total}
        </span>
        <span style={{ fontSize: 12.5, color: "#8A8378" }}>About a minute left</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Question ${step + 1} of ${total}`}
        style={{ height: 6, borderRadius: 9999, background: "rgba(64,50,34,0.1)", overflow: "hidden" }}
      >
        <div className="ib-pf-bar" style={{ height: "100%", width: `${Math.max(pct, 3)}%`, background: ORANGE, borderRadius: 9999 }} />
      </div>
    </div>
  );
}

function Intro({ resumable, onStart, onRestart }: { resumable: boolean; onStart: () => void; onRestart: () => void }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${LINE}`,
        borderRadius: 20,
        padding: "38px 38px 34px",
        boxShadow: "0 18px 40px -30px rgba(26,23,20,0.35)",
      }}
      className="ib-pf-card"
    >
      <h2 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: INK, lineHeight: 1.2 }} className="ib-pf-question">
        Answer a few questions. Find your path.
      </h2>
      <p style={{ margin: "0 0 24px", fontSize: 15.5, lineHeight: 1.6, color: MUTED }}>
        Up to ten plain questions about what you&rsquo;re working on &mdash; no jargon, no account, about a minute. We&rsquo;ll point you to
        the path that fits and what you can do next on Incubator Baguio.
      </p>

      <div className="ib-pf-paths" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 26 }}>
        {PATH_ORDER.map((k) => {
          const p = PATHWAYS[k];
          return (
            <div key={k} style={{ background: "#FBFAF6", border: `1px solid ${LINE}`, borderRadius: 14, padding: "16px 16px 15px" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9999,
                  background: `${p.color}1F`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 11,
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: p.icon }} />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: INK, marginBottom: 5 }}>{p.name}</div>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: MUTED }}>{p.blurb}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onStart}
          className="ib-cta-orange"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            background: ORANGE,
            color: "#fff",
            border: "none",
            font: "inherit",
            fontWeight: 600,
            fontSize: 15,
            padding: "14px 28px",
            minHeight: 48,
            borderRadius: 9999,
            cursor: "pointer",
          }}
        >
          {resumable ? "Continue where you left off" : "Find Your Path"}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        {resumable ? (
          <button
            type="button"
            onClick={onRestart}
            style={{ background: "none", border: "none", font: "inherit", fontSize: 14, fontWeight: 600, color: MUTED, cursor: "pointer", padding: "12px 4px", minHeight: 44 }}
          >
            Start over
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ResultScreen({ result, onRestart, onBack }: { result: Result; onRestart: () => void; onBack: () => void }) {
  const p = PATHWAYS[result.primary];
  const alt = result.alternative ? PATHWAYS[result.alternative] : null;

  return (
    <div>
      {result.unclear ? (
        <div
          style={{
            background: "#FFF8F1",
            border: "1px solid rgba(242,101,34,0.3)",
            borderRadius: 14,
            padding: "15px 18px",
            marginBottom: 18,
            fontSize: 14,
            lineHeight: 1.55,
            color: "#7A4A22",
          }}
        >
          A lot of your answers were &ldquo;not sure&rdquo; &mdash; which is completely fine this early. Here&rsquo;s the closest fit, but you
          may get more out of{" "}
          <a href={`${BP}/contact`} style={{ color: ORANGE, fontWeight: 600 }}>
            talking to our team
          </a>
          .
        </div>
      ) : null}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: INK,
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "38px 38px 34px",
        }}
        className="ib-pf-card"
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 340,
            height: 340,
            borderRadius: 9999,
            background: `radial-gradient(circle, ${p.color}38, transparent 65%)`,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: p.color, marginBottom: 14 }}>
            Your recommended path
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 9999,
                border: `1.5px solid ${p.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: p.icon }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 34, fontWeight: 600, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.1 }} className="ib-pf-result-title">
                {p.name}
              </h2>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{p.tagline}</div>
            </div>
          </div>
          <p style={{ margin: "0 0 22px", fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.78)", maxWidth: 620 }}>{p.summary}</p>

          {result.reasons.length > 0 ? (
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", marginBottom: 10 }}>Why this path?</div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                {result.reasons.map((r, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.5, color: "rgba(255,255,255,0.66)" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }} aria-hidden="true">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                    <span>
                      <span style={{ color: "rgba(255,255,255,0.42)" }}>{r.question}: </span>
                      {r.answer}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {alt ? (
            <p style={{ margin: "18px 0 0", fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,0.6)" }}>
              Your answers also point toward <strong style={{ color: "#fff", fontWeight: 600 }}>{alt.name}</strong>. {alt.blurb} Plenty of
              projects sit across both &mdash; you can explore either.
            </p>
          ) : null}
        </div>
      </div>

      <h3 style={{ margin: "34px 0 4px", fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: INK }}>You may want to</h3>
      <p style={{ margin: "0 0 18px", fontSize: 14.5, color: MUTED }}>Four things you can do right now on Incubator Baguio.</p>

      <div className="ib-pf-actions" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {p.actions.map((a) => (
          <a
            key={a.title}
            href={a.href}
            className="ib-pf-action"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              textDecoration: "none",
              background: "#fff",
              border: `1px solid ${LINE}`,
              borderRadius: 16,
              padding: "20px 22px",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: INK, marginBottom: 5 }}>{a.title}</div>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: MUTED }}>{a.desc}</p>
            </div>
            <div
              aria-hidden="true"
              style={{
                flexShrink: 0,
                width: 30,
                height: 30,
                borderRadius: 9999,
                border: `1.5px solid ${p.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 2,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      {alt ? <AlternativeBlock pathKey={alt.key} /> : null}

      <div
        style={{
          marginTop: 30,
          background: "#FBFAF6",
          border: `1px dashed ${LINE}`,
          borderRadius: 16,
          padding: "24px 26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 240, flex: 1 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: INK, marginBottom: 5 }}>Want us to keep track of this?</div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: MUTED }}>
            Create a free account to save your profile, join programs, and connect with mentors and partners.
          </p>
        </div>
        <a
          href={`${BP}/signup/`}
          className="ib-cta-orange"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: ORANGE,
            color: "#fff",
            fontWeight: 600,
            fontSize: 14.5,
            padding: "13px 24px",
            minHeight: 46,
            borderRadius: 9999,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Create a free account
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 24, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onBack}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "none", border: "none", font: "inherit", fontSize: 14, fontWeight: 600, color: MUTED, cursor: "pointer", padding: "10px 4px", minHeight: 44 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          Change my last answer
        </button>
        <button
          type="button"
          onClick={onRestart}
          style={{ background: "none", border: "none", font: "inherit", fontSize: 14, fontWeight: 600, color: MUTED, cursor: "pointer", padding: "10px 4px", minHeight: 44 }}
        >
          Start over
        </button>
        <span style={{ fontSize: 13, color: "#8A8378" }}>
          This is a guide, not a formal classification &mdash; you&rsquo;re welcome on any path.
        </span>
      </div>
    </div>
  );
}

function AlternativeBlock({ pathKey }: { pathKey: PathKey }) {
  const p = PATHWAYS[pathKey];
  return (
    <div id={`ib-pf-alt-${pathKey}`} style={{ marginTop: 30 }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: INK }}>
        You may also explore: {p.name}
      </h3>
      <p style={{ margin: "0 0 14px", fontSize: 14, color: MUTED }}>{p.blurb}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {p.actions.map((a) => (
          <a
            key={a.title}
            href={a.href}
            className="ib-pf-chip"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              border: `1px solid ${LINE}`,
              borderRadius: 9999,
              padding: "11px 18px",
              minHeight: 44,
              fontSize: 13.5,
              fontWeight: 600,
              color: INK,
              textDecoration: "none",
            }}
          >
            {a.title}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
