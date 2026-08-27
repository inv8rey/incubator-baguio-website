import type { Metadata } from "next";
import DashboardShell from "../../DashboardShell";
import OrganizationResources from "./OrganizationResources";
import { navBarHtml, footerHtml } from "../../chrome";

export const metadata: Metadata = {
  title: "Organization Resources — Incubator Baguio",
  robots: { index: false, follow: false },
};

export default function OrganizationResourcesPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/organization/resources/">
        <OrganizationResources />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
