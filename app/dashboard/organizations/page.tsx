import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import OrganizationManager from "./OrganizationManager";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Organizations — Incubator Baguio",
  description: "Publish your organization to the Incubator Baguio ecosystem directory.",
  robots: { index: false, follow: false },
};

export default function OrganizationsDashboardPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/organizations/">
        <OrganizationManager />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
