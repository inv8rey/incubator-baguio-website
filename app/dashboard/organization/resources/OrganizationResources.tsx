"use client";

import { useRequiredOrg, OrgRequiredNotice } from "../OrgRequired";
import ResourceSubmissionForm from "../../ResourceSubmissionForm";

export default function OrganizationResources() {
  const { selectedOrg, loaded } = useRequiredOrg();
  if (!loaded) return <div style={{ padding: "40px 0", textAlign: "center", color: "#8B8479", fontSize: 14 }}>Loading&hellip;</div>;
  if (!selectedOrg) return <OrgRequiredNotice />;
  return (
    <ResourceSubmissionForm
      organizationId={selectedOrg.id}
      allowedCategories={["Startup Resources", "Research & Innovation", "Policies & Reports"]}
      heading="Submit a resource"
      intro={`Reviewed by Incubator Baguio before it appears on the Knowledge Hub, credited to ${selectedOrg.name}.`}
    />
  );
}
