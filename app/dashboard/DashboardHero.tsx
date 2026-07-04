"use client";

import { useAuth } from "../AuthProvider";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function DashboardHero() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.trim().split(" ")[0];

  return (
    <div style={{ position: "relative", background: "#0B0B0D", padding: "36px 40px 40px", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: -140, left: "50%", transform: "translateX(-50%)", width: 480, height: 480, borderRadius: 9999, background: "radial-gradient(circle,rgba(242,101,34,0.22) 0%,transparent 60%)", pointerEvents: "none" }} />
      <svg style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", opacity: 0.12 }} width="700" height="400" viewBox="0 0 120 104" fill="none" preserveAspectRatio="none">
        <polyline points="6,40 60,8 114,40" stroke="#F5A623" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="6,62 60,30 114,62" stroke="#E23A2E" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="6,84 60,52 114,84" stroke="#9E2A52" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="6,106 60,74 114,106" stroke="#285E7A" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ position: "relative", maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>
          <a href={`${BP}/`} style={{ color: "inherit", textDecoration: "none" }}>Home</a> <span style={{ margin: "0 6px" }}>/</span> <span style={{ color: "rgba(255,255,255,0.8)" }}>Dashboard</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>
          Welcome back{firstName ? `, ${firstName}` : ""}! <span aria-hidden>👋</span>
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "rgba(255,255,255,0.6)", maxWidth: 520 }}>
          Manage your profile, discover opportunities, connect with mentors, and grow with the Baguio innovation ecosystem.
        </p>
      </div>
    </div>
  );
}
