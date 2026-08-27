import type { Metadata } from "next";
import DashboardShell from "../../DashboardShell";
import OrganizationOpportunities from "./OrganizationOpportunities";
import { navBarHtml, footerHtml } from "../../chrome";

export const metadata: Metadata = {
  title: "Organization Opportunities — Incubator Baguio",
  robots: { index: false, follow: false },
};

export default function OrganizationOpportunitiesPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/organization/opportunities/">
        <OrganizationOpportunities />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
