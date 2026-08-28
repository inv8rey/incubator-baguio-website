import type { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";
import AuthShell from "../AuthShell";

export const metadata: Metadata = {
  title: "Reset Password — Incubator Baguio",
  description: "Reset the password for your Incubator Baguio account.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function ForgotPasswordPage() {
  return (
    <AuthShell eyebrow="Your account">
      <ForgotPasswordForm bp={BP} />
    </AuthShell>
  );
}
