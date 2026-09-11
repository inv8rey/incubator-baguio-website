"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabaseClient";
import { checkFormGuard, honeypotProps } from "../../lib/formGuard";

const ORANGE = "#F26522";
const DARK = "#1A1714";

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 14,
  color: DARK,
  background: "#F6F2EA",
  border: "1.5px solid rgba(64,50,34,0.14)",
  borderRadius: 10,
  padding: "11px 13px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 600,
  color: "#44444C",
  marginBottom: 6,
};

/**
 * "Collaborate" on a registered solver's card. Deliberately doesn't show or
 * ask for the team's contact info -- challenge_applications' contact_name /
 * contact_email / phone are admin-only (see public_challenge_solvers() in
 * supabase/migrations/2026-09-11b-public-challenge-solvers.sql), so a team
 * can't be emailed directly from this page.
 *
 * Instead this calls request_challenge_collaboration() (see
 * supabase/migrations/2026-09-11c-challenge-collaboration-requests.sql),
 * which drops the message into the team's own dashboard inbox
 * (app/dashboard/challenges/CollaborationRequests.tsx) -- the requester's own
 * name/email is shown there since they're the one who chose to share it, but
 * the team's contact info still never appears on this public page. Applying
 * to a challenge already requires login, so every registered team is a real
 * account with somewhere to receive this.
 */
export default function CollaborateButton({ applicationId, teamName }: { applicationId: string; teamName: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  // Gates the createPortal(..., document.body) call below until after this
  // component has actually mounted client-side. Doesn't change behavior in
  // the steady state (it flips true on the very first effect flush, before
  // `open` can ever be true from a real click), but it's the standard
  // guard for portaling to a document-level node and avoids a "Target
  // container is not a DOM element" error React can throw if a portal is
  // attempted before the client has fully taken over from SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock the page's own scroll while this fixed-position modal is open --
  // same one-liner Interactive.tsx uses for the mobile nav drawer. Without
  // it, the underlying page stays scrollable behind a `position: fixed`
  // overlay, which is the classic trigger for iOS Safari's "page yanks
  // sideways when you focus an input inside a fixed modal" bug: it tries to
  // scroll the focused field into view against the wrong (still-scrollable)
  // document instead of treating the modal as its own layer.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function close() {
    setOpen(false);
    // Reset after the close animation would run, if there were one -- next
    // open should start clean rather than show a stale success state.
    setTimeout(() => {
      setSent(false);
      setError("");
      setName("");
      setEmail("");
      setMessage("");
    }, 200);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message.trim()) {
      setError("Fill in your name, a valid email, and a short message.");
      return;
    }
    setError("");
    if (!supabase) {
      setError("The backend isn't configured yet. Ask the site admin to set up Supabase.");
      return;
    }
    setBusy(true);

    const guard = await checkFormGuard(honeypot, "challenge-collaborate");
    if (!guard.ok) {
      setBusy(false);
      // Tripped honeypot: show the normal success state so a bot learns
      // nothing, same as the main contact form.
      if (guard.error) setError(guard.error);
      else setSent(true);
      return;
    }

    const { error: err } = await supabase.rpc("request_challenge_collaboration", {
      p_application_id: applicationId,
      p_requester_name: name.trim(),
      p_requester_email: email.trim(),
      p_message: message.trim(),
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          fontSize: 13.5,
          fontWeight: 600,
          color: "#fff",
          background: "#1A1714",
          padding: "11px 16px",
          borderRadius: 9999,
          border: "none",
          cursor: "pointer",
          font: "inherit",
          width: "100%",
        }}
      >
        Collaborate
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>

      {/* Portaled straight to document.body -- this card lives inside a
          section the site's scroll-reveal system tags with `.ib-reveal`
          (see app/Interactive.tsx / app/globals.css), which sets
          `will-change: transform` on that ancestor *permanently*, even
          after the reveal animation finishes. Per spec, any non-"none"
          transform OR a `will-change: transform` on an ancestor makes it
          the containing block for `position: fixed` descendants -- so
          without the portal, this modal isn't actually fixed to the
          viewport at all, it's fixed relative to that (possibly
          off-screen, possibly mid-animation) ancestor instead, which is
          what caused it to render far off-position rather than centered. */}
      {open &&
        mounted &&
        createPortal(
          <div
            onClick={close}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 200,
              overscrollBehavior: "contain",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#fff",
                borderRadius: 20,
                padding: "30px 32px",
                width: "calc(100% - 48px)",
                maxWidth: 460,
                boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxHeight: "88dvh",
                overflowY: "auto",
              }}
            >
              {sent ? (
                <>
                  <div style={{ width: 48, height: 48, borderRadius: 9999, background: "rgba(26,107,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.6}>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: DARK, marginBottom: 6 }}>Message sent</div>
                    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#5A544B" }}>
                      <strong>{teamName}</strong> will see this in their dashboard and can reply by email.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    style={{ alignSelf: "flex-start", padding: "10px 22px", borderRadius: 9999, border: "none", background: ORANGE, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>Connect with {teamName}</div>
                      <p style={{ margin: "4px 0 0", fontSize: 12.5, lineHeight: 1.5, color: "#6E685F" }}>
                        Sent straight to their dashboard &mdash; their contact details aren&rsquo;t published directly, but they&rsquo;ll see your name, email, and message.
                      </p>
                    </div>
                    <button type="button" onClick={close} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "#F5F4F0", cursor: "pointer", fontSize: 17, color: "#5A544B", flexShrink: 0 }}>
                      &times;
                    </button>
                  </div>

                  <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                    <input {...honeypotProps} value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                    <div>
                      <label style={labelStyle}>Your name *</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                      <label style={labelStyle}>Your email *</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                      <label style={labelStyle}>Message *</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Tell ${teamName} why you'd like to collaborate on this challenge...`}
                        rows={4}
                        style={{ ...inputStyle, resize: "vertical" as const, lineHeight: 1.5 }}
                        required
                      />
                    </div>
                    {error && <p style={{ margin: 0, fontSize: 12.5, color: "#E23A2E" }}>{error}</p>}
                    <button
                      type="submit"
                      disabled={busy}
                      style={{
                        marginTop: 2,
                        padding: "12px 20px",
                        borderRadius: 9999,
                        border: "none",
                        background: busy ? "rgba(242,101,34,0.6)" : ORANGE,
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: busy ? "default" : "pointer",
                      }}
                    >
                      {busy ? "Sending…" : "Send message"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
