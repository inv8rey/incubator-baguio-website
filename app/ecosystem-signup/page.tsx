import type { Metadata } from "next";
import EcosystemSignupForm from "./EcosystemSignupForm";
import VisitTracker from "./VisitTracker";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Join the Ecosystem — Incubator Baguio",
  description: "Submit your startup, mentor profile, or organization for the Incubator Baguio Ecosystem directory.",
  robots: { index: false, follow: false },
};

export default function EcosystemSignupPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#FAFAF7" }}>
      <VisitTracker />
      <div style={{ background: "#0B0B0D", padding: "20px 40px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 11 }}>
          <img src={`${BP}/assets/ib-icon.png`} alt="Incubator Baguio" style={{ height: 30, width: "auto" }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Incubator Baguio</div>
        </div>
      </div>
      <div style={{ padding: "56px 24px 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#F26522", marginBottom: 12 }}>Join the ecosystem</div>
            <h1 style={{ margin: "0 0 10px", fontSize: 32, fontWeight: 700, letterSpacing: "-0.025em", color: "#141417" }}>Tell us about you</h1>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#6B6B73", maxWidth: 560 }}>
              Submit your startup, mentor profile, or organization to be featured in the Incubator Baguio Ecosystem directory. Every submission is reviewed before it goes live.
            </p>
          </div>
          <EcosystemSignupForm />
        </div>
      </div>
    </main>
  );
}
