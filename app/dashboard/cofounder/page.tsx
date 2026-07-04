import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import CofounderFinder from "./CofounderFinder";
import { navHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Co-Founder Finder — Incubator Baguio",
  description: "Browse founders looking to team up, or list yourself so others can find you.",
  robots: { index: false, follow: false },
};

export default function CofounderDashboardPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navHtml() }} />
      <div style={{ background: "#FAFAF7", padding: "48px 40px 64px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <DashboardShell active="/dashboard/cofounder/">
            <CofounderFinder />
          </DashboardShell>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
