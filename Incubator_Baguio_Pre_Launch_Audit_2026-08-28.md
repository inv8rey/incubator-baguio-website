# Incubator Baguio — Pre-Launch Audit

**Date:** 28 August 2026 · **Commit:** `9659c3c`
**Scope:** 44 pages · 7 API routes · 28 tables · 20 lib modules · ~1,900 lines of schema
**Method:** Full source review, plus live probes against production Supabase using the public anon key.
**Not covered:** Load/penetration testing, authenticated end-to-end click-through (no test credentials this session).

---

## Verdict: not ready to launch publicly

Two critical issues are live in production right now. Both are database *policy* changes, not rewrites —
fixable in well under an hour. The application code itself is in good shape.

| Severity | Count |
|---|---|
| Critical | 2 |
| High | 4 |
| Medium & low | 9 |
| Verified solid | 9 |

---

## CRITICAL

### SEC-01 — Every member's name and email is publicly downloadable ✅ verified live
`profiles` uses `for select using (true)`. I queried production with only the anon key (already public in
your JS bundle) and got back real member names and addresses, including a live `@slu.edu.ph` account.
Anyone can scrape your entire membership list in one request.

- **Risk:** Contradicts your own Privacy Policy ("you decide which information you provide for your public
  profile"). Account emails were never submitted for publication. RA 10173 exposure on a
  government-affiliated platform.
- **Fix:** Restrict reads to own-profile + admins. Where a public name is genuinely needed, expose a view
  with the name only — never the email.

### SEC-02 — Any signed-up user can take over any organization
The `organization_members` insert policy checks that you're adding *yourself*, but never *which
organization*. Org IDs are publicly readable, so anyone can make a free account, insert an active
membership row for any org, and inherit its permissions.

- **Risk:** The `protect_organization_admin_fields` trigger blocks name/approval tampering (good), but only
  fires on UPDATE — so an attacker can still **delete the org outright**, rewrite its details, and post
  challenges/events/resources in its name. Also unlocks everything gated by `is_org_member()`.
- **Fix:** Membership must be granted, not self-claimed. Restrict inserts to existing owners/admins of that
  specific org plus site admins, and add a DELETE guard on `organizations`.

---

## HIGH

### SEC-03 — Any logged-in user can overwrite or delete anyone's files
All 7 storage buckets grant update/delete to `authenticated` with only a `bucket_id` check — no ownership
test. One free account can wipe every logo and Knowledge Hub document on the site.
**Fix:** Scope update/delete to the uploading user (`owner` on storage objects) or admins.

### SEC-04 — Chat spending limit can be switched off by anyone ✅ verified live
`chat_rate_limits` uses `for all using (true) with check (true)` — anon read/write/**delete**. I read live
counter rows from production. Anyone can delete them to reset limits and drain the Workers AI daily budget.
The limiter's *design* is good; only the table's permissions undermine it.
**Fix:** Drop the blanket policy; route all access through the existing `bump_chat_usage` security-definer function.

### SEC-05 — Approved events will publish organiser phone numbers and emails
`for select using (status = 'approved')` grants **all columns**, including `email`, `phone`, `contact_name`.
Currently blank on existing rows, so nothing is exposed *yet* — but the first real submission you approve
will publish that person's contact details.
**Fix:** Serve the public calendar from a view with display columns only.

### DEP-01 — Five known dependency vulnerabilities
4 high (`sharp` / libvips CVEs) + 1 moderate (`postcss`).
**Fix:** `npm audit fix`, then rebuild to confirm.

---

## MEDIUM

- **GAP-01 — Account deletion requests go nowhere.** Rows are written to `account_deletion_requests`; no
  admin screen ever reads them. Compliance gap given RA 10173 is cited in your footer.
- **GAP-02 — Newsletter signups are write-only.** Two forms collect subscribers; no admin view, no export.
- **GAP-06 — Challenge solutions can be submitted but never reviewed.** `challenge_applications` receives
  real submissions and the dashboard counts them, but there's no screen to read/shortlist/respond. The Open
  Innovation loop is half-built.
- **RISK-01 — Five public forms with zero spam protection.** Contact, events, ecosystem signup, newsletter,
  consultation feedback — no captcha, honeypot, or rate limit. **Fix:** honeypot + per-IP limit reusing the
  existing rate-limit table.
- **GAP-04 — Event approval emails silently never send.** `RESEND_API_KEY` unset in production; code
  degrades gracefully so approvals *look* successful.
- **SEO-01 — Sitemap advertises the wrong domain.** `NEXT_PUBLIC_SITE_URL` unset, so `app/seo.ts` falls back
  to `https://incubator-baguio.vercel.app`. Also, `/terms` and `/privacy` are missing from the sitemap entirely.
- **SEC-06 — Anyone can write to the admin AI Insights panel.** `ai_insights` allows anon inserts and the
  dashboard renders the newest row — arbitrary text injectable into a trusted-looking internal analysis.
- **SEC-07 — Cron endpoint unguarded on Preview.** Compares against `` `Bearer ${process.env.CRON_SECRET}` ``;
  unset in Preview, so `Bearer undefined` passes. **Fix:** reject outright when the secret is missing.
- **PERF-01 — 1.8 MB image on all four auth pages.** `baguio-cathedral-sunset.png` loads on signup, login,
  forgot-password, reset-password. Site-wide: 82 raw `<img>` tags, zero `next/image`.

---

## LOW

- **GAP-03** — "IP Policy" is unlinked plain text in the footer; no page exists.
- **GAP-05** — Saved items can be saved from 4 surfaces but viewed nowhere.
- **CLEAN-01** — `EcosystemMap.tsx` is dead code after the map-view stub.
- **A11Y-01** — No skip-to-content link. (All images do have alt text.)

---

## What's already solid — verified, not assumed

- All 7 API routes properly gated via `requireAdmin` (real session + `is_admin` check).
- No server secrets reach the browser (Cloudflare, Sheets, PostHog, Resend all server-only).
- No XSS surface — all 39 `dangerouslySetInnerHTML` uses render static strings or JSON-LD.
- **Database schema fully deployed** — checked newest columns and the new RPC against production; all live.
- Schema and code agree exactly: all 28 tables in code exist; every schema table is used. No orphans.
- RLS enabled on every table. Problems above are over-broad policies, never an unprotected table.
- The `protect_organization_admin_fields` trigger works and limits SEC-02's blast radius.
- Chat cost controls thoughtfully designed: 3 tiers, atomic increments, shared daily budget, distinct messages.
- Clean `tsc --noEmit` and clean production build.

---

## Roadmap — what we could build next

| Feature | Closes | Size |
|---|---|---|
| Solution review workflow (read/shortlist/reply to challenge submissions) | GAP-06 | Medium |
| Saved items page | GAP-05 | Small |
| Newsletter + deletion request admin queues | GAP-01, GAP-02 | Small |
| Organization member invites (replaces the insecure self-join) | pairs w/ SEC-02 | Medium |
| Real ecosystem map (coordinates already collected) | — | Medium |
| Email notifications + weekly digest | needs GAP-04 | Medium |
| Site-wide search | — | Medium |
| Richer public organization pages | — | Small |

---

## Recommended order

1. **Lock down the two critical policies** (SEC-01, SEC-02) as one SQL migration. This is the whole
   difference between "leaking data" and "safe to launch."
2. **Close the high-severity permissions** (SEC-03, SEC-04, SEC-05) + `npm audit fix` for DEP-01.
3. **Set the three missing env vars** — `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CRON_SECRET` (Preview).
4. **Add spam protection to the public forms** (RISK-01) — before announcing, not after.
5. **Compress the cathedral image and fix the sitemap** (PERF-01, SEO-02) — cheapest visible wins.
6. **Then launch**, and build the roadmap from a secure base. None of it should come before steps 1–2.
