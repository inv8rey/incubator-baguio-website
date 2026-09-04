import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ThreadDetail from "./ThreadDetail";
import { fetchThreadById } from "../dynamicData";
import { navBarHtml, footerHtml } from "../../chrome";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const t = await fetchThreadById(id);
  if (!t) return { title: "Discussion not found — Incubator Baguio" };
  return {
    title: `${t.title} — Incubator Baguio Community`,
    description: t.body.slice(0, 160),
  };
}

// Everything user-submitted (title, body, author name) is rendered as real
// JSX inside <ThreadDetail>, not interpolated into an HTML template string
// like the rest of this site's dangerouslySetInnerHTML "chrome" pattern
// does for admin-authored content (challenges, events). This is the first
// fully open, unmoderated-before-publish content on the site -- a title
// like `</span><script>...` must not get a chance to execute, so the
// server-rendered breadcrumb below deliberately stays static and never
// includes the thread's own title.
export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await fetchThreadById(id);
  if (!t) return notFound();

  const TOP_HTML = `
${navBarHtml("/community")}
<div style="background:#131110;padding:28px 40px;">
  <div style="max-width:820px;margin:0 auto;font-size:12.5px;color:rgba(255,255,255,0.45);">
    <a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a>
    <span style="margin:0 8px;">&rsaquo;</span>
    <a href="${BP}/community" style="color:inherit;text-decoration:none;">Community</a>
    <span style="margin:0 8px;">&rsaquo;</span>
    <span style="color:#F26522;">Discussion</span>
  </div>
</div>
`;

  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <ThreadDetail threadId={id} bp={BP} />
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
