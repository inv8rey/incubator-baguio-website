import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import MentorManager from "./MentorManager";
import { navHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Mentor Hub — Incubator Baguio",
  description: "Register as a mentor and manage your mentor profile.",
  robots: { index: false, follow: false },
};

export default function MentorDashboardPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navHtml() }} />
      <div style={{ background: "#FAFAF7", padding: "48px 40px 64px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <DashboardShell active="/dashboard/mentor/">
            <MentorManager />
          </DashboardShell>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
