import type { Metadata } from "next";
import DashboardShell from "../../DashboardShell";
import OrganizationStartups from "./OrganizationStartups";
import { navBarHtml, footerHtml } from "../../chrome";

export const metadata: Metadata = {
  title: "Organization Startups — Incubator Baguio",
  robots: { index: false, follow: false },
};

export default function OrganizationStartupsPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/organization/startups/">
        <OrganizationStartups />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
