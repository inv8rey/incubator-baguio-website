import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import MentorManager from "./MentorManager";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Mentor Hub — Incubator Baguio",
  description: "Register as a mentor and manage your mentor profile.",
  robots: { index: false, follow: false },
};

export default function MentorDashboardPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/mentor/">
        <MentorManager />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
