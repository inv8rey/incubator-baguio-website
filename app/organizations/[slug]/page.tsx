import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchOrganizationBySlug } from "../dynamicData";
import { navBarHtml, footerHtml } from "../../chrome";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const o = await fetchOrganizationBySlug(slug);
  if (!o) return { title: "Organization not found — Incubator Baguio" };
  return {
    title: `${o.name} — Incubator Baguio Ecosystem`,
    description: o.short_description || o.description || undefined,
  };
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function chipRow(label: string, items: string[], color: string, bg: string): string {
  if (!items.length) return "";
  return `
      <div style="margin-bottom:22px;">
        <div style="font-size:11.5px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8B8479;margin-bottom:10px;">${label}</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${items.map((i) => `<span style="font-size:12.5px;font-weight:600;color:${color};background:${bg};padding:6px 13px;border-radius:9999px;">${i}</span>`).join("")}
        </div>
      </div>`;
}

export default async function OrganizationProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const o = await fetchOrganizationBySlug(slug);
  if (!o) return notFound();

  const location = [o.city, o.province].filter(Boolean).join(", ") || o.region || "";
  const isVerified = o.approval_status === "approved";

  const HTML = `
${navBarHtml("/ecosystem")}

<!-- HERO -->
<div style="position:relative;background:#100D0B;padding:48px 40px 56px;overflow:hidden;">
  <div style="position:absolute;bottom:-160px;right:-100px;width:480px;height:480px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.26) 0%,transparent 60%);pointer-events:none;"></div>
  <div style="position:relative;max-width:880px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:22px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <a href="${BP}/ecosystem" style="color:inherit;text-decoration:none;">Ecosystem</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.8);">${o.name}</span></div>
    <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;">
      ${o.logo_url
        ? `<img src="${o.logo_url}" alt="${o.name} logo" style="width:76px;height:76px;border-radius:16px;object-fit:contain;background:#fff;padding:8px;box-sizing:border-box;flex-shrink:0;">`
        : `<div style="width:76px;height:76px;border-radius:16px;background:rgba(242,101,34,0.16);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:600;color:#F26522;flex-shrink:0;">${initialsOf(o.name)}</div>`}
      <div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
          <span style="font-size:10.5px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#F26522;background:rgba(242,101,34,0.14);padding:5px 12px;border-radius:9999px;">${o.org_type}${o.type ? ` &middot; ${o.type}` : ""}</span>
          ${isVerified ? `<span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:#7EE08A;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7EE08A" stroke-width="2.6"><path d="M20 6 9 17l-5-5"></path></svg>Verified Organization</span>` : ""}
        </div>
        <h1 style="margin:0;font-size:34px;line-height:1.15;font-weight:500;letter-spacing:-0.02em;color:#fff;">${o.name}</h1>
        ${location ? `<p style="margin:8px 0 0;font-size:14.5px;color:rgba(255,255,255,0.6);">${location}</p>` : ""}
      </div>
    </div>
    ${o.short_description ? `<p style="margin:22px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.7);max-width:640px;">${o.short_description}</p>` : ""}
  </div>
</div>

<!-- BODY -->
<div style="background:#F6F2EA;padding:56px 40px 64px;">
  <div style="max-width:880px;margin:0 auto;display:grid;grid-template-columns:1.6fr 1fr;gap:32px;align-items:start;">
    <div style="display:flex;flex-direction:column;gap:28px;">
      ${o.description ? `
      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:18px;padding:28px 30px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#F26522;margin-bottom:14px;">About</div>
        <p style="margin:0;font-size:15px;line-height:1.65;color:#44444C;white-space:pre-line;">${o.description}</p>
      </div>` : ""}

      ${(o.sectors.length || o.expertise.length) ? `
      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:18px;padding:28px 30px;">
        ${chipRow("Areas of Focus", o.sectors, "#285E7A", "rgba(40,94,122,0.10)")}
        ${chipRow("Expertise", o.expertise, "#9E2A52", "rgba(158,42,82,0.10)")}
      </div>` : ""}

      ${(o.can_offer.length || o.looking_for.length) ? `
      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:18px;padding:28px 30px;">
        ${chipRow("We Can Offer", o.can_offer, "#1A6B3C", "rgba(26,107,60,0.10)")}
        ${chipRow("Looking For", o.looking_for, "#F26522", "rgba(242,101,34,0.10)")}
      </div>` : ""}
    </div>

    <div style="display:flex;flex-direction:column;gap:20px;">
      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:18px;padding:24px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#F26522;margin-bottom:16px;">Connect</div>
        <div style="display:flex;flex-direction:column;gap:12px;font-size:13.5px;">
          ${o.website ? `<a href="${o.website}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:9px;color:#1A1714;text-decoration:none;font-weight:600;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8B8479" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"></path></svg>Website</a>` : ""}
          ${o.facebook_url ? `<a href="${o.facebook_url}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:9px;color:#1A1714;text-decoration:none;font-weight:600;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8B8479" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>Facebook</a>` : ""}
          ${o.social_url ? `<a href="${o.social_url}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:9px;color:#1A1714;text-decoration:none;font-weight:600;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8B8479" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>More</a>` : ""}
          ${o.contact_public && o.contact_email ? `<a href="mailto:${o.contact_email}" style="display:flex;align-items:center;gap:9px;color:#1A1714;text-decoration:none;font-weight:600;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8B8479" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-10 6L2 7"></path></svg>${o.contact_email}</a>` : ""}
          ${o.contact_public && o.phone ? `<div style="display:flex;align-items:center;gap:9px;color:#1A1714;font-weight:600;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8B8479" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>${o.phone}</div>` : ""}
          ${!o.website && !o.facebook_url && !o.social_url && !(o.contact_public && (o.contact_email || o.phone)) ? `<p style="margin:0;color:#8B8479;">No public links yet.</p>` : ""}
        </div>
      </div>

      <a href="${BP}/ecosystem" style="display:flex;align-items:center;justify-content:center;gap:8px;font-size:13.5px;font-weight:600;color:#1A1714;text-decoration:none;border:1.5px solid rgba(64,50,34,0.14);padding:13px 16px;border-radius:9999px;background:#fff;">
        &larr; Back to the Ecosystem directory
      </a>
    </div>
  </div>
</div>

${footerHtml()}
`;

  return <main dangerouslySetInnerHTML={{ __html: HTML }} />;
}
