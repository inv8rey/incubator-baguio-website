import { SITE_URL } from "../app/seo";
import type { SuggestionItem } from "./newsletterSuggestions";

const ORANGE = "#F26522";
const DARK = "#1A1714";
const REPLY_TO = "incubatorbaguio63@gmail.com";

export interface NewsletterSection {
  sectionName: string;
  items: SuggestionItem[];
}

export interface NewsletterIssueForRender {
  issueNumber: number | null;
  subject: string;
  leadStoryHtml: string;
  sections: NewsletterSection[];
}

function escapeHtml(s: string): string {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function itemRow(item: SuggestionItem): string {
  return `
  <tr>
    <td style="padding: 0 0 16px;">
      <a href="${item.href}" style="font-size: 15px; font-weight: 600; color: ${DARK}; text-decoration: none;">${escapeHtml(item.title)}</a>
      ${item.blurb ? `<p style="margin: 4px 0 0; font-size: 13.5px; line-height: 1.55; color: #5A544B;">${escapeHtml(item.blurb)}</p>` : ""}
    </td>
  </tr>`;
}

function sectionBlock(section: NewsletterSection): string {
  // Sections with nothing in them are omitted entirely rather than shown
  // empty or padded -- see the plan's editorial rule (Part A, section 6).
  if (section.items.length === 0) return "";
  return `
  <tr>
    <td style="padding: 28px 0 4px;">
      <p style="margin: 0 0 14px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${ORANGE};">${escapeHtml(section.sectionName)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${section.items.map(itemRow).join("")}
      </table>
    </td>
  </tr>`;
}

/**
 * Hand-rolled HTML template literal, matching lib/sendEventApprovalEmail.ts's
 * existing convention (inline styles, table-based layout for email-client
 * compatibility) rather than introducing @react-email/components -- see the
 * plan (Part B7) for why: this is one template with a handful of repeating
 * item blocks, not enough complexity to justify a new render pipeline in a
 * codebase that has zero React-email tooling today.
 *
 * `unsubscribeUrl` is per-recipient (carries their own unsubscribe_token --
 * see unsubscribe_newsletter() in
 * supabase/migrations/2026-09-19-newsletter-issues.sql) so the caller must
 * render this once per recipient, not once per issue.
 */
export function renderNewsletterHtml(issue: NewsletterIssueForRender, unsubscribeUrl: string): string {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: ${DARK}; background: #fff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 24px 0;">
    <tr>
      <td>
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${ORANGE};">Incubator Baguio</p>
        <h1 style="margin: 0 0 4px; font-size: 24px; font-weight: 600; letter-spacing: -0.02em;">The Baguio Innovation Brief</h1>
        <p style="margin: 0 0 24px; font-size: 12.5px; color: #6E685F;">${issue.issueNumber ? `Issue ${issue.issueNumber} &middot; ` : ""}${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        <div style="height: 1px; background: rgba(64,50,34,0.12);"></div>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 0 0; font-size: 15px; line-height: 1.65;">
        ${issue.leadStoryHtml || "<p>&nbsp;</p>"}
      </td>
    </tr>
    ${issue.sections.map(sectionBlock).join("")}
    <tr>
      <td style="padding: 32px 0 24px;">
        <div style="height: 1px; background: rgba(64,50,34,0.12); margin-bottom: 20px;"></div>
        <p style="margin: 0 0 8px; font-size: 12.5px; color: #6E685F;">Questions or something to share for next issue? Reply to this email or reach us at ${REPLY_TO}.</p>
        <p style="margin: 0; font-size: 11.5px; color: #8A8378;">
          You're receiving this because you signed up for the Incubator Baguio newsletter.
          <a href="${unsubscribeUrl}" style="color: #8A8378;">Unsubscribe</a>
        </p>
      </td>
    </tr>
  </table>
</div>`;
}

export function unsubscribeUrlFor(token: string): string {
  return `${SITE_URL}/unsubscribe/?token=${token}`;
}
