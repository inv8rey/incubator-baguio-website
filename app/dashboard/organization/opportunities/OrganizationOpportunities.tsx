"use client";

import { useRequiredOrg, OrgRequiredNotice } from "../OrgRequired";
import ResourceSubmissionForm from "../../ResourceSubmissionForm";

export default function OrganizationOpportunities() {
  const { selectedOrg, loaded } = useRequiredOrg();
  if (!loaded) return <div style={{ padding: "40px 0", textAlign: "center", color: "#6E685F", fontSize: 14 }}>Loading&hellip;</div>;
  if (!selectedOrg) return <OrgRequiredNotice />;
  return (
    <ResourceSubmissionForm
      organizationId={selectedOrg.id}
      allowedCategories={["Funding & Opportunities"]}
      heading="Post an opportunity"
      intro={`Reviewed by Incubator Baguio before it appears in the Knowledge Hub's Funding & Opportunities section, credited to ${selectedOrg.name}.`}
    />
  );
}
