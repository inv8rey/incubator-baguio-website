"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

const ORANGE = "#F26522";
const DARK = "#1A1714";

// How long a bare "Loading..." is allowed to sit with no explanation before
// it's treated as stalled rather than just slow. Ordinary session resolution
// reads from localStorage and finishes in well under a second; the only way
// this gate is still up at 7s is a hung request (a stuck token refresh is a
// known supabase-js failure mode) or a dead network -- cases where the
// visitor is otherwise staring at a spinner that will never resolve on its
// own, with no sign anything is wrong.
const STALL_MS = 7000;

export default function RequireAuth({
  bp,
  children,
}: {
  bp: string;
  children: React.ReactNode;
}) {
  const { configured, user, loading } = useAuth();
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    if (!loading) {
      setStalled(false);
      return;
    }
    const t = setTimeout(() => setStalled(true), STALL_MS);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading) {
    if (stalled) {
      return (
        <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: "56px 40px", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 19, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>This is taking longer than expected</h2>
          <p style={{ margin: "0 auto 22px", fontSize: 14, lineHeight: 1.6, color: "#5A544B", maxWidth: 380 }}>
            Your connection or session check may be stuck. Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: DARK, border: "none", padding: "12px 22px", borderRadius: 9999, cursor: "pointer" }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return <div style={{ padding: "80px 40px", textAlign: "center", color: "#6E685F", fontSize: 14 }}>Loading&hellip;</div>;
  }

  if (!user) {
    const redirect = typeof window !== "undefined" ? window.location.pathname : "/";
    return (
      <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 20, padding: "56px 40px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 9999, background: "rgba(242,101,34,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={2}><rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>Sign in required</h2>
        <p style={{ margin: "0 auto 26px", fontSize: 14.5, lineHeight: 1.6, color: "#5A544B", maxWidth: 380 }}>
          {configured
            ? "Log in or create a free account to continue."
            : "The backend isn't configured yet — set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY to enable accounts."}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={`${bp}/login/?redirect=${encodeURIComponent(redirect)}`} style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: DARK, padding: "12px 22px", borderRadius: 9999 }}>
            Log in
          </a>
          <a href={`${bp}/signup/?redirect=${encodeURIComponent(redirect)}`} style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: ORANGE, padding: "12px 22px", borderRadius: 9999 }}>
            Sign up
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
