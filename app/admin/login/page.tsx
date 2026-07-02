import type { Metadata } from "next";
import { Suspense } from "react";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Log In — Incubator Baguio",
  robots: { index: false, follow: false },
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function AdminLoginPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0B0B0D", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 28, justifyContent: "center" }}>
          <img src={`${BP}/assets/ib-icon.png`} alt="Incubator Baguio" style={{ height: 32, width: "auto" }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Incubator Baguio Admin</div>
        </div>
        <Suspense fallback={null}>
          <AdminLoginForm bp={BP} />
        </Suspense>
      </div>
    </main>
  );
}
