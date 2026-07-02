import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import ConnectionsManager from "./ConnectionsManager";
import { navHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Mentor Connections — Incubator Baguio",
  description: "Manage mentor connection requests you've sent and received.",
  robots: { index: false, follow: false },
};

export default function ConnectionsDashboardPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navHtml() }} />
      <div style={{ background: "#FAFAF7", padding: "48px 40px 64px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <DashboardShell active="/dashboard/connections/">
            <ConnectionsManager />
          </DashboardShell>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
