import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import StartupManager from "./StartupManager";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "My Startups — Incubator Baguio",
  description: "Create and manage your startup profile.",
  robots: { index: false, follow: false },
};

export default function StartupDashboardPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/startup/">
        <StartupManager />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
