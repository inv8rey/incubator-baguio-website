"use client";

import { useAuth } from "./AuthProvider";

const ORANGE = "#F26522";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { configured, user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0B0B0D", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
        Loading&hellip;
      </div>
    );
  }

  if (!user || !profile?.is_admin) {
    return (
      <div style={{ minHeight: "100vh", background: "#0B0B0D", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#141417", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "48px 40px", textAlign: "center", maxWidth: 420 }}>
          <div style={{ width: 52, height: 52, borderRadius: 9999, background: "rgba(242,101,34,0.14)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={2}><rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>
          </div>
          <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: "#fff" }}>Admin access required</h2>
          <p style={{ margin: "0 auto 26px", fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>
            {!configured
              ? "The backend isn't configured yet."
              : !user
              ? "Log in with an account that has admin access."
              : "Your account doesn't have admin access yet."}
          </p>
          <a
            href={`${BP}/admin/login/?redirect=${encodeURIComponent(`${BP}/admin/`)}`}
            style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: ORANGE, padding: "12px 24px", borderRadius: 9999 }}
          >
            {user ? "Log in with a different account" : "Log in"}
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
