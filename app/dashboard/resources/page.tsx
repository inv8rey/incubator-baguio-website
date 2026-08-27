import type { Metadata } from "next";
import DashboardShell from "../DashboardShell";
import ResourceSubmissionForm from "../ResourceSubmissionForm";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "My Resources — Incubator Baguio",
  description: "Submit resources to the Knowledge Hub.",
  robots: { index: false, follow: false },
};

export default function MyResourcesPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <DashboardShell active="/dashboard/resources/">
        <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 600, color: "#1A1714", letterSpacing: "-0.02em" }}>My Resources</h2>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#5A544B" }}>Share guides, research, or reports with the ecosystem through the Knowledge Hub.</p>
        <ResourceSubmissionForm organizationId={null} />
      </DashboardShell>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
