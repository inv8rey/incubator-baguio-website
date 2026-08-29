"use client";

import { useEffect, useRef, useState } from "react";

const FORM_URL = "https://forms.gle/zQrVsjn1iBrT1Vdj9";
const SEEN_KEY = "ib-feedback-seen";

function SparkleIcon({ size = 16, color = "#F26522" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2c.5 4.2 2.3 6 6.5 6.5-4.2.5-6 2.3-6.5 6.5-.5-4.2-2.3-6-6.5-6.5C9.7 8 11.5 6.2 12 2Z" />
      <path d="M19.5 15c.25 2 1.15 2.9 3 3-1.85.1-2.75 1-3 3-.25-2-1.15-2.9-3-3 1.85-.1 2.75-1 3-3Z" />
    </svg>
  );
}

function StarIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#F26522" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 2 2.9 6.5 7.1.6-5.4 4.7 1.6 6.9L12 17.3 5.8 20.7l1.6-6.9L2 9.1l7.1-.6L12 2Z" />
    </svg>
  );
}

// Small "we're in beta" nudge that sits on the chat bubble's corner and opens
// a popover pointing at the public feedback form — separate from the chat
// assistant itself, so feedback about the site doesn't get mixed into chat
// history or routed through the AI.
export default function FeedbackBadge({ hidden }: { hidden: boolean }) {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const starRef = useRef<HTMLButtonElement | null>(null);

  // First-visit nudge: open once on its own, same "seen" pattern the chat
  // bubble's pulse ring uses, so a returning visitor isn't interrupted again.
  useEffect(() => {
    let seen = true;
    try {
      seen = !!localStorage.getItem(SEEN_KEY);
    } catch {
      // localStorage unavailable — treat as already seen rather than nag every load.
    }
    if (!seen) {
      const t = setTimeout(() => {
        setOpen(true);
        setEverOpened(true);
      }, 1600);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (popupRef.current?.contains(target) || starRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  function toggle() {
    setOpen((v) => !v);
    setEverOpened(true);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
  }

  if (hidden) return null;

  return (
    <>
      <button
        ref={starRef}
        type="button"
        onClick={toggle}
        aria-label="Beta feedback"
        aria-expanded={open}
        className="ib-feedback-star"
        style={{
          position: "fixed",
          bottom: 122,
          right: 60,
          zIndex: 96,
          width: 30,
          height: 30,
          borderRadius: 9999,
          background: "#fff",
          border: "1.5px solid rgba(242,101,34,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px -2px rgba(17,17,20,0.22)",
        }}
      >
        <StarIcon />
        {!everOpened && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: -1.5,
              borderRadius: 9999,
              border: "1.5px solid rgba(242,101,34,0.55)",
              animation: "ib-feedback-ping 2.2s cubic-bezier(0,0,.2,1) infinite",
            }}
          />
        )}
      </button>

      {open && (
        <div
          ref={popupRef}
          role="dialog"
          aria-label="Beta feedback"
          className="ib-feedback-popup"
          style={{
            position: "fixed",
            bottom: 156,
            right: 16,
            zIndex: 97,
            width: 272,
            background: "#131110",
            borderRadius: 18,
            padding: "20px 20px 18px",
            boxShadow: "0 20px 44px -14px rgba(0,0,0,0.55)",
          }}
        >
          {/* Speech-bubble tail, pointing down at the star badge */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: -7,
              right: 38,
              width: 14,
              height: 14,
              background: "#131110",
              transform: "rotate(45deg)",
              borderRadius: 3,
            }}
          />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "rgba(242,101,34,0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <SparkleIcon size={17} />
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                border: "none",
                background: "none",
                color: "rgba(255,255,255,0.45)",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                padding: 2,
                marginTop: -2,
              }}
            >
              &times;
            </button>
          </div>

          <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
            Help us improve Incubator Baguio
          </h3>
          <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.62)" }}>
            You&rsquo;re exploring the beta. Tell us what you think!
          </p>
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: "#F26522", textDecoration: "none" }}
          >
            Share feedback
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#F26522" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </div>
      )}
    </>
  );
}
