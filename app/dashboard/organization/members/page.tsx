import type { Metadata } from "next";
import DashboardShell from "../../DashboardShell";
import OrganizationMembers from "./OrganizationMembers";
import { navBarHtml, footerHtml } from "../../chrome";

export const metadata: Metadata = {
  title: "Organization Members — Incubator Baguio",
  robots: { index: false, follow: false },
};

export default function OrganizationMembersPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/organization/members/">
        <OrganizationMembers />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
