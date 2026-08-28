import type { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Search — Incubator Baguio",
  description:
    "Search across every startup, mentor, organization, innovation challenge, Knowledge Hub resource, and event in the Baguio innovation ecosystem.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TOP_HTML = `
${navBarHtml("/search")}

<!-- HERO -->
<div style="position:relative;background:#100D0B;padding:56px 40px 52px;overflow:hidden;text-align:center;">
  <div style="position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:540px;height:540px;background:radial-gradient(circle,rgba(242,101,34,0.24),transparent 65%);"></div>
  <div style="position:relative;max-width:720px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:20px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.8);">Search</span></div>
    <h1 style="margin:0;font-size:44px;font-weight:500;letter-spacing:-0.03em;color:#fff;line-height:1.1;">Search the ecosystem</h1>
    <p style="margin:16px auto 0;font-size:16.5px;line-height:1.6;color:rgba(255,255,255,0.62);max-width:560px;">One place to look across every startup, mentor, organization, challenge, resource, and event in Baguio.</p>
  </div>
</div>
`;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <div id="main">
        <Suspense fallback={null}>
          <SearchClient initialQuery={q ?? ""} />
        </Suspense>
      </div>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
