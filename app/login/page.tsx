import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";
import AuthShell from "../AuthShell";

export const metadata: Metadata = {
  title: "Log In — Incubator Baguio",
  description: "Log in to your Incubator Baguio account.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function LoginPage() {
  return (
    <AuthShell eyebrow="Your account">
      <Suspense fallback={null}>
        <LoginForm bp={BP} />
      </Suspense>
    </AuthShell>
  );
}
