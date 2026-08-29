import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../admin/admin.css";
import AdminApp from "../admin/AdminApp";
import RequireAdmin from "../RequireAdmin";

export const metadata: Metadata = {
  title: "Admin Dashboard — Incubator Baguio",
  description: "Internal operations dashboard for the Incubator Baguio ecosystem: startups, founders, and innovation challenges.",
  robots: { index: false, follow: false },
};

// The admin panel lives at an unguessable path, not "/admin" — set once in
// ADMIN_ROUTE_SLUG (server-only env var, never sent to the browser). Any
// other single-segment path falls through to here from Next's routing and
// gets the plain 404, indistinguishable from a genuinely nonexistent page.
export default async function AdminSlugPage({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  const secret = process.env.ADMIN_ROUTE_SLUG;
  if (!secret || adminSlug !== secret) return notFound();

  return (
    <RequireAdmin adminBase={`/${secret}`}>
      <AdminApp />
    </RequireAdmin>
  );
}
