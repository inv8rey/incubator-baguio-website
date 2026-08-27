import type { Metadata } from "next";
import DashboardShell from "../../DashboardShell";
import OrganizationMentors from "./OrganizationMentors";
import { navBarHtml, footerHtml } from "../../chrome";

export const metadata: Metadata = {
  title: "Organization Mentors — Incubator Baguio",
  robots: { index: false, follow: false },
};

export default function OrganizationMentorsPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/organization/mentors/">
        <OrganizationMentors />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
