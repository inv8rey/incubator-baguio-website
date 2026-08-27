import type { Metadata } from "next";
import DashboardShell from "../../DashboardShell";
import OrganizationEvents from "./OrganizationEvents";
import { navBarHtml, footerHtml } from "../../chrome";

export const metadata: Metadata = {
  title: "Organization Events — Incubator Baguio",
  robots: { index: false, follow: false },
};

export default function OrganizationEventsPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/organization/events/">
        <OrganizationEvents />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
