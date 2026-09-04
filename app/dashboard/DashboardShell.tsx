"use client";

import { useState } from "react";
import { useAuth } from "../AuthProvider";
import RequireAuth from "../RequireAuth";
import DashboardSidebar from "./DashboardSidebar";
import NotificationBell from "./NotificationBell";
import { BASE_PATH } from "./chrome";
import "./dashboard.css";

export default function DashboardShell({ active, children }: { active: string; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Signed out (or still resolving the session): fall back to a plain,
  // centered card — the sidebar layout below only makes sense once we
  // actually have a logged-in member to show it to.
  if (loading || !user) {
    return (
      <div style={{ background: "#F6F2EA", padding: "48px 40px 64px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <RequireAuth bp={BASE_PATH}>{null}</RequireAuth>
        </div>
      </div>
    );
  }

  return (
    <div className="ib-userdash-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "calc(100vh - 65px)" }}>
      <DashboardSidebar active={active} />

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90 }}
        />
      )}
      <div className={`ib-userdash-mobile-sidebar ${menuOpen ? "ib-userdash-mobile-open" : ""}`}>
        <DashboardSidebar active={active} onNavigate={() => setMenuOpen(false)} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, background: "#F6F2EA" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px 0 16px" }}>
          <button
            className="ib-userdash-burger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            style={{ display: "none", width: 36, height: 36, borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.12)", background: "#fff", flexDirection: "column", justifyContent: "center", gap: 4, cursor: "pointer" }}
          >
            <span style={{ width: 16, height: 2, background: "#1A1714", margin: "0 auto", borderRadius: 2 }} />
            <span style={{ width: 16, height: 2, background: "#1A1714", margin: "0 auto", borderRadius: 2 }} />
            <span style={{ width: 16, height: 2, background: "#1A1714", margin: "0 auto", borderRadius: 2 }} />
          </button>
          <div style={{ marginLeft: "auto" }}>
            <NotificationBell />
          </div>
        </div>
        <div className="ib-userdash-content" style={{ padding: "16px 40px 64px", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
