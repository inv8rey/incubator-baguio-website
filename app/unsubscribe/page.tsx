import type { Metadata } from "next";
import UnsubscribeStatus from "./UnsubscribeStatus";
import AuthShell from "../AuthShell";

export const metadata: Metadata = {
  title: "Unsubscribe — Incubator Baguio",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <AuthShell eyebrow="Newsletter">
      <UnsubscribeStatus />
    </AuthShell>
  );
}
