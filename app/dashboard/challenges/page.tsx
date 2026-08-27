import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import MyChallenges from "./MyChallenges";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "My Challenges — Incubator Baguio",
  robots: { index: false, follow: false },
};

export default function MyChallengesPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/challenges/">
        <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 600, color: "#1A1714", letterSpacing: "-0.02em" }}>Challenges</h2>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#5A544B" }}>Challenges you&rsquo;ve saved or posted.</p>
        <MyChallenges />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
