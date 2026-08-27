import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import AccountSettings from "./AccountSettings";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Account Settings — Incubator Baguio",
  robots: { index: false, follow: false },
};

export default function AccountSettingsPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/settings/">
        <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 600, color: "#1A1714", letterSpacing: "-0.02em" }}>Account Settings</h2>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#5A544B" }}>Manage your profile, login, and account.</p>
        <AccountSettings />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
