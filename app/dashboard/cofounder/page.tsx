import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import CofounderFinder from "./CofounderFinder";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Co-Founder Finder — Incubator Baguio",
  description: "Browse founders looking to team up, or list yourself so others can find you.",
  robots: { index: false, follow: false },
};

export default function CofounderDashboardPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/cofounder/">
        <CofounderFinder />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
