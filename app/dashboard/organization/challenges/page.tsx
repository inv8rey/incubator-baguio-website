import type { Metadata } from "next";
import DashboardShell from "../../DashboardShell";
import OrganizationChallenges from "./OrganizationChallenges";
import { navBarHtml, footerHtml } from "../../chrome";

export const metadata: Metadata = {
  title: "Organization Challenges — Incubator Baguio",
  robots: { index: false, follow: false },
};

export default function OrganizationChallengesPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/organization/challenges/">
        <OrganizationChallenges />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
