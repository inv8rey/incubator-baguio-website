import type { Metadata } from "next";
import SiklabAdmin from "./SiklabAdmin";

export const metadata: Metadata = {
  title: "PinaSIKLab Organizers — Incubator Baguio",
  robots: { index: false, follow: false },
};

// Separate from the Incubator Baguio admin panel: its own login screen and its
// own access list (siklab_admins). Unlinked and noindex, like the site admin.
export default function SiklabAdminPage() {
  return <div data-ib-admin-root><SiklabAdmin /></div>;
}
