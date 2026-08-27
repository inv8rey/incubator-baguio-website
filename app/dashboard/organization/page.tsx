import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import OrganizationOverview from "./OrganizationOverview";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Organization Dashboard — Incubator Baguio",
  robots: { index: false, follow: false },
};

export default function OrganizationDashboardPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/organization/">
        <OrganizationOverview />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
