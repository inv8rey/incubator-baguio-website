"use client";

import { useAuth } from "./AuthProvider";

const ORANGE = "#F26522";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { configured, user, profile, loading, refreshProfile } = useAuth();

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
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={`${BP}/admin/login/?redirect=${encodeURIComponent(`${BP}/admin/`)}`}
              style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: ORANGE, padding: "12px 24px", borderRadius: 9999 }}
            >
              {user ? "Log in with a different account" : "Log in"}
            </a>
            {user && (
              <button
                onClick={() => refreshProfile()}
                style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: "none", border: "1px solid rgba(255,255,255,0.2)", padding: "12px 24px", borderRadius: 9999, cursor: "pointer" }}
              >
                Re-check access
              </button>
            )}
          </div>

          {user && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "left" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
                Debug info (send this to support)
              </div>
              <pre style={{ margin: 0, fontSize: 11.5, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
{JSON.stringify(
  { userId: user.id, userEmail: user.email, profile: profile ?? "null (no profiles row found for this user id)" },
  null,
  2
)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
