import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import ConnectionsManager from "./ConnectionsManager";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Mentor Connections — Incubator Baguio",
  description: "Manage mentor connection requests you've sent and received.",
  robots: { index: false, follow: false },
};

export default function ConnectionsDashboardPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/connections/">
        <ConnectionsManager />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
