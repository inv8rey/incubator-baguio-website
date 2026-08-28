import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";
import AuthShell from "../AuthShell";

export const metadata: Metadata = {
  title: "Set New Password — Incubator Baguio",
  robots: { index: false, follow: false },
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function ResetPasswordPage() {
  return (
    <AuthShell eyebrow="Your account">
      <ResetPasswordForm bp={BP} />
    </AuthShell>
  );
}
