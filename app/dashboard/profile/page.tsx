import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import ProfileView from "./ProfileView";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "My Profile — Incubator Baguio",
  description: "How your profile appears to mentors, founders, and organizations in the ecosystem.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/settings/">
        <ProfileView />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
