"use client";

import RequireAuth from "../RequireAuth";
import DashboardTabs from "./DashboardTabs";
import { BASE_PATH } from "./chrome";

export default function DashboardShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <RequireAuth bp={BASE_PATH}>
      <DashboardTabs active={active} />
      {children}
    </RequireAuth>
  );
}
