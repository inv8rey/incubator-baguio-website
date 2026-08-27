import type { Metadata } from "next";
import { Suspense } from "react";
import CommunityChallengeDetail from "./CommunityChallengeDetail";
import { navBarHtml, footerHtml } from "../../chrome";

export const metadata: Metadata = {
  title: "Community Challenge — Incubator Baguio",
  description: "A challenge posted by a member of the Incubator Baguio ecosystem.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const NAV_HTML = `
${navBarHtml("/challenges")}
`;

const FOOTER_HTML = `
${footerHtml()}
`;

export default function CommunityChallengePage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: NAV_HTML }} />
      <Suspense fallback={<div style={{ background: "#F6F2EA", padding: "64px 40px" }} />}>
        <CommunityChallengeDetail bp={BP} />
      </Suspense>
      <div dangerouslySetInnerHTML={{ __html: FOOTER_HTML }} />
    </main>
  );
}
