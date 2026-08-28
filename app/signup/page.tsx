import type { Metadata } from "next";
import { Suspense } from "react";
import SignupForm from "./SignupForm";
import AuthShell from "../AuthShell";

export const metadata: Metadata = {
  title: "Sign Up — Incubator Baguio",
  description: "Create an Incubator Baguio account to build an innovation profile, post or apply to challenges, and connect with mentors.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function SignupPage() {
  return (
    <AuthShell eyebrow="Join the ecosystem">
      <Suspense fallback={null}>
        <SignupForm bp={BP} />
      </Suspense>
    </AuthShell>
  );
}
