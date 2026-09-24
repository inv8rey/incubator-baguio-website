"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
const BLUE = "#2B63AE";
const YELLOW = "#F2C240";
const MAROON = "#8E2340";
const GREEN = "#5E9E45";

const SECTIONS: [string, string][] = [
  ["about", "About"],
  ["who", "Who can apply"],
  ["program", "Program"],
  ["build", "What to build"],
  ["prizes", "Prizes"],
  ["details", "Details"],
  ["faq", "FAQ"],
];

function useHost(id: string) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.getElementById(id)), [id]);
  return host;
}

function Countdown({ closesAt }: { closesAt: number }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return null;
  const left = closesAt - now;
  if (left <= 0) {
    return <div style={{ display: "inline-block", padding: "10px 20px", borderRadius: 9999, background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 14, fontWeight: 600 }}>Applications are now closed</div>;
  }
  const s = Math.floor(left / 1000);
  const cells: [number, string][] = [[Math.floor(s / 86400), "days"], [Math.floor((s % 86400) / 3600), "hours"], [Math.floor((s % 3600) / 60), "min"], [s % 60, "sec"]];
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: YELLOW, marginBottom: 10 }}>Applications close in</div>
      <div style={{ display: "inline-flex", gap: 10 }}>
        {cells.map(([n, l]) => (
          <div key={l} style={{ minWidth: 64, padding: "10px 8px", borderRadius: 14, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>{String(n).padStart(2, "0")}</div>
            <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const AREAS = ["Baguio City", "La Trinidad", "Itogon", "Sablan", "Tuba", "Tublay", "Somewhere else"];

function EligibilityChecker() {
  const [age, setAge] = useState("");
  const [area, setArea] = useState("");
  const n = Number(age);
  const ready = age.trim() !== "" && area !== "";
  const ageOk = Number.isInteger(n) && n >= 18 && n <= 30;
  const areaOk = area !== "" && area !== "Somewhere else";
  const eligible = ready && ageOk && areaOk;
  const field: React.CSSProperties = { padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(64,50,34,0.18)", fontSize: 14.5, background: "#fff", color: "#1A1714", fontFamily: "inherit", outline: "none" };
  return (
    <div style={{ background: "linear-gradient(135deg,#EEF3FA,#fff)", border: `1.5px solid ${BLUE}33`, borderRadius: 20, padding: "26px 30px", marginBottom: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: "1 1 260px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: BLUE, marginBottom: 6 }}>Quick check</div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "#1A1714" }}>Am I eligible?</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <input aria-label="Your age" type="number" inputMode="numeric" min={0} max={99} placeholder="Your age" value={age} onChange={(e) => setAge(e.target.value)} style={{ ...field, width: 120 }} />
            <select aria-label="Where you live, study, or work" value={area} onChange={(e) => setArea(e.target.value)} style={{ ...field, flex: "1 1 180px" }}>
              <option value="">Where are you based?</option>
              {AREAS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div aria-live="polite" style={{ flex: "1 1 280px", minHeight: 84, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {!ready && <div style={{ fontSize: 14.5, color: "#5A544B", lineHeight: 1.6 }}>Enter your age and where you live, study, or work to see if you can apply.</div>}
          {ready && eligible && (
            <div>
              <div style={{ fontSize: 17, fontWeight: 600, color: GREEN, marginBottom: 10 }}>You&rsquo;re eligible. Apply now.</div>
              <a href={`${BP}/pinasiklab/register/`} className="ib-siklab-cta" style={{ display: "inline-flex", alignItems: "center", background: BLUE, color: "#fff", fontWeight: 600, fontSize: 14, padding: "11px 22px", borderRadius: 9999, textDecoration: "none" }}>Start your application</a>
            </div>
          )}
          {ready && !eligible && (
            <div style={{ fontSize: 14.5, color: MAROON, lineHeight: 1.6, fontWeight: 500 }}>
              {!ageOk && "PinaSIKLab Baguio is open to ages 18 to 30. "}
              {!areaOk && "Applicants must live, study, or work in Baguio City or the BLISTT area. "}
              <span style={{ color: "#5A544B", fontWeight: 400 }}>Questions? Email us and we&rsquo;ll help.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SiklabInteractive({ closesAt }: { closesAt: string }) {
  const countdownHost = useHost("ib-sk-countdown");
  const eligibilityHost = useHost("ib-sk-eligibility");
  const [active, setActive] = useState("");
  const [show, setShow] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Scroll-spy for the section bar, and reveal it once the hero is behind us.
  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 620);
      let cur = "";
      for (const [id] of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 220) cur = id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the active pill visible in the (horizontally scrolling) mobile bar.
  useEffect(() => {
    navRef.current?.querySelector<HTMLElement>("[data-on='1']")?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [active]);

  // Count the prize figure up when it scrolls into view.
  useEffect(() => {
    const el = document.querySelector<HTMLElement>("[data-countup]");
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = Number(el.dataset.countup);
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1400);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      {countdownHost && createPortal(<Countdown closesAt={new Date(closesAt).getTime()} />, countdownHost)}
      {eligibilityHost && createPortal(<EligibilityChecker />, eligibilityHost)}
      <div
        ref={navRef}
        role="navigation"
        aria-label="Page sections"
        style={{
          position: "fixed", top: 74, left: "50%", zIndex: 40, maxWidth: "calc(100vw - 24px)", overflowX: "auto", display: "flex", gap: 4, padding: 5,
          borderRadius: 9999, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", boxShadow: "0 12px 30px -12px rgba(20,40,80,0.35)", border: "1px solid rgba(43,99,174,0.18)",
          transform: `translate(-50%, ${show ? 0 : -140}%)`, opacity: show ? 1 : 0, pointerEvents: show ? "auto" : "none", transition: "transform .3s ease, opacity .3s ease", scrollbarWidth: "none",
        }}
      >
        {SECTIONS.map(([id, label]) => (
          <button key={id} data-on={active === id ? "1" : undefined} onClick={() => go(id)} style={{ border: "none", cursor: "pointer", whiteSpace: "nowrap", padding: "8px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: active === id ? BLUE : "transparent", color: active === id ? "#fff" : "#3A352E", transition: "background .2s, color .2s" }}>
            {label}
          </button>
        ))}
        <a href={`${BP}/pinasiklab/register/`} style={{ whiteSpace: "nowrap", padding: "8px 16px", borderRadius: 9999, fontSize: 13, fontWeight: 700, background: YELLOW, color: "#1A1714", textDecoration: "none" }}>Apply</a>
      </div>
    </>
  );
}
