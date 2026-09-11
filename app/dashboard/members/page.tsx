import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import MembersDirectory from "./MembersDirectory";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Members — Incubator Baguio",
  description: "Discover other members of the Incubator Baguio ecosystem who've opted to be found.",
  robots: { index: false, follow: false },
};

export default function MembersDashboardPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      {/* No allowPublic here, unlike /dashboard/cofounder/ -- browsing this
          directory is deliberately members-only (confirmed with the user),
          since it surfaces every opted-in member's profile, not just people
          who filled out a narrow "looking for a co-founder" form. */}
      <DashboardShell active="/dashboard/members/">
        <MembersDirectory />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
