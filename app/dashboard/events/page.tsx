import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import MyEvents from "./MyEvents";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "My Events — Incubator Baguio",
  robots: { index: false, follow: false },
};

export default function MyEventsPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/events/">
        <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 600, color: "#1A1714", letterSpacing: "-0.02em" }}>Events</h2>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#5A544B" }}>Events you&rsquo;ve saved or submitted.</p>
        <MyEvents />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
