import type { Metadata } from "next";
import "./admin.css";
import AdminApp from "./AdminApp";
import RequireAdmin from "../RequireAdmin";

export const metadata: Metadata = {
  title: "Admin Dashboard — Incubator Baguio",
  description: "Internal operations dashboard for the Incubator Baguio ecosystem: startups, founders, and innovation challenges.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <RequireAdmin>
      <AdminApp />
    </RequireAdmin>
  );
}
