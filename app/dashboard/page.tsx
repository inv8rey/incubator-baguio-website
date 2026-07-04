import type { Metadata } from "next";
import DashboardShell from "./DashboardShell";
import DashboardOverview from "./DashboardOverview";
import { navBarHtml, footerHtml } from "./chrome";

export const metadata: Metadata = {
  title: "Dashboard — Incubator Baguio",
  description: "Manage your startup profile, challenges, mentor connections, and organization listings.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/">
        <DashboardOverview />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
