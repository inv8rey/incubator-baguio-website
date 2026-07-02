import type { Metadata } from "next";
import DashboardShell from "./DashboardShell";
import DashboardOverview from "./DashboardOverview";
import { navHtml, footerHtml } from "./chrome";

export const metadata: Metadata = {
  title: "Dashboard — Incubator Baguio",
  description: "Manage your startup profile, challenges, mentor connections, and organization listings.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navHtml() }} />
      <div style={{ background: "#FAFAF7", padding: "48px 40px 64px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <DashboardShell active="/dashboard/">
            <DashboardOverview />
          </DashboardShell>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
