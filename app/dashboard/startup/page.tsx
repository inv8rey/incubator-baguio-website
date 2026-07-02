import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import StartupManager from "./StartupManager";
import { navHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "My Startups — Incubator Baguio",
  description: "Create and manage your startup profile.",
};

export default function StartupDashboardPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navHtml() }} />
      <div style={{ background: "#FAFAF7", padding: "48px 40px 64px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <DashboardShell active="/dashboard/startup/">
            <StartupManager />
          </DashboardShell>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
