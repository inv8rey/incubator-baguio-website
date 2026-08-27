"use client";

import { useOrgContext } from "../orgContext";
import { cardStyle, DARK, ORANGE } from "../styles";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function useRequiredOrg() {
  const { orgs, selectedOrgId, loaded } = useOrgContext();
  const selectedOrg = orgs.find((o) => o.id === selectedOrgId) ?? null;
  return { orgs, selectedOrgId, selectedOrg, loaded };
}

// Shown on every /dashboard/organization/* page when the sidebar's "Viewing
// as" switcher isn't set to an organization -- these pages have nothing to
// scope themselves to otherwise.
export function OrgRequiredNotice() {
  return (
    <div style={cardStyle}>
      <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, color: DARK }}>Select an organization</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "#5A544B" }}>
        Use the &ldquo;Viewing as&rdquo; switcher in the sidebar to choose which organization to manage.
      </p>
      <a href={`${BP}/dashboard/organizations/`} style={{ fontSize: 13.5, fontWeight: 600, color: ORANGE, textDecoration: "none" }}>Go to My Organization →</a>
    </div>
  );
}
