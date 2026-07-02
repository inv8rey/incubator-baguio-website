import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import OrganizationManager from "./OrganizationManager";
import { navHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Organizations — Incubator Baguio",
  description: "Publish your organization to the Incubator Baguio ecosystem directory.",
};

export default function OrganizationsDashboardPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navHtml() }} />
      <div style={{ background: "#FAFAF7", padding: "48px 40px 64px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <DashboardShell active="/dashboard/organizations/">
            <OrganizationManager />
          </DashboardShell>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
