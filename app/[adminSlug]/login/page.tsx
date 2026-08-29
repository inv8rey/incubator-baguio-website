import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AdminLoginForm from "../../admin/login/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Log In — Incubator Baguio",
  robots: { index: false, follow: false },
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default async function AdminSlugLoginPage({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  const secret = process.env.ADMIN_ROUTE_SLUG;
  if (!secret || adminSlug !== secret) return notFound();

  return (
    <main style={{ minHeight: "100vh", background: "#100D0B", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 28, justifyContent: "center" }}>
          <img src={`${BP}/assets/city-of-baguio-seal.png`} alt="City of Baguio" style={{ height: 46, width: "auto" }} />
          <img src={`${BP}/assets/cpdso-logo.png`} alt="CPDSO" style={{ height: 46, width: "auto" }} />
          <img src={`${BP}/assets/ib-icon.png`} alt="Incubator Baguio" style={{ height: 32, width: "auto" }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Incubator Baguio Admin</div>
        </div>
        <Suspense fallback={null}>
          <AdminLoginForm adminBase={`${BP}/${secret}`} />
        </Suspense>
      </div>
    </main>
  );
}
