"use client";

import { useAuth } from "./AuthProvider";

const ORANGE = "#F26522";
const DARK = "#141417";

export default function RequireAuth({
  bp,
  children,
}: {
  bp: string;
  children: React.ReactNode;
}) {
  const { configured, user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "80px 40px", textAlign: "center", color: "#9A958B", fontSize: 14 }}>Loading&hellip;</div>;
  }

  if (!user) {
    const redirect = typeof window !== "undefined" ? window.location.pathname : "/";
    return (
      <div style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "56px 40px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 9999, background: "rgba(242,101,34,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={2}><rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Sign in required</h2>
        <p style={{ margin: "0 auto 26px", fontSize: 14.5, lineHeight: 1.6, color: "#6B6B73", maxWidth: 380 }}>
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
