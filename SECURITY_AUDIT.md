# Security Audit — Incubator Baguio Website

**Date:** 1 October 2026
**Scope:** https://incubatorbaguio.online and this repository (Next.js 15 App Router, Supabase, Vercel)
**Method:** code review against the OWASP Top 10, plus non-destructive tests: anonymous read-only queries with the public Supabase key, crafted URLs against a local dev server, unit tests, a production build, and a link/mobile sweep. No data was deleted, no real accounts were changed, and no load or DoS testing was done.

> This audit lowers risk. It does not make the site "completely secure". Some items below need the database migrations to be run before they take effect, and several areas need a manual review (see the last sections).

---

## Summary

| Severity | Found | Fixed in code | Waiting on a migration or deploy |
|---|---|---|---|
| Critical | 1 | 1 | deploy |
| High | 3 | 3 | 2 need migrations |
| Medium | 6 | 6 | 3 need migrations |
| Low | 5 | 5 | 2 need migrations |
| **Total** | **15** | **15** | |

"Fixed in code" means the code or SQL was changed and checked with tests, a type check, and a build. Nothing reaches production until it is pushed, and the SQL changes do nothing until the migrations are run.

### Run order (important)

1. `supabase/migrations/2026-10-03-storage-upload-limits.sql`
2. `supabase/migrations/2026-10-04a-security-hardening.sql`
3. Deploy the code (push to `main`)
4. `supabase/migrations/2026-10-04b-lock-public-tables.sql`. Run this only after step 3 is live. If it runs earlier, the Ecosystem directory, the organization pages, and the community challenges will show empty.

---

## Issues Found

### 1. Stored XSS on organization and challenge pages — **Critical**
- **Where found:** `app/organizations/[slug]/page.tsx`, `app/challenges/[id]/page.tsx`, `app/challenges/[id]/apply/page.tsx`. These pages build HTML strings and render them with `dangerouslySetInnerHTML`.
- **Why it matters:** Any signed-in user can create an organization, and it publishes immediately. Its name, description, and links were put into the page without escaping, so a `<script>` or a `javascript:` link would run for every visitor. The login session is stored in `localStorage`, so a script like that could steal the visitor's session, including an admin's.
- **What was changed:** Added `lib/html.ts` with `escapeHtml`, `escapeFields`, and `safeUrl`, which allows only http(s) links. All database text on these pages is now escaped before it is inserted, and link fields are checked with `safeUrl`.
- **Status:** Fixed in code and verified with unit tests (`scripts/security.test.ts`). Not yet deployed.

### 2. Open redirect and `javascript:` XSS after login — **High**
- **Where found:** `app/login/LoginForm.tsx`, `app/signup/SignupForm.tsx`, `app/admin/login/AdminLoginForm.tsx` (`?redirect=` parameter)
- **Why it matters:** `?redirect=https://evil.example` sent people to a phishing site right after they logged in. `?redirect=javascript:…` ran script on the site with the user's fresh session.
- **What was changed:** Added `lib/safeRedirect.ts`, which accepts only same-site paths. It rejects `//host`, `/\host`, control characters, absolute URLs, and `javascript:`/`data:`. All three forms use it.
- **Status:** Fixed in code. Verified with unit tests covering 13 bad inputs, and checked locally: `/login/?redirect=javascript:alert(1)` falls back to the dashboard. Not yet deployed.

### 3. Organizations' private contact details publicly readable — **High**
- **Where found:** RLS policies on `public.organizations`. The policy "org members read their organizations" was actually `using (true)`.
- **Why it matters:** Anyone with the public key could read `contact_email` and `phone` for every organization, even when the owner chose "contact not public". At the time of testing this exposed 26 email addresses and 1 phone number.
- **What was changed:** Added a `public_organizations` view that blanks the contact fields unless `contact_public` is set and leaves out internal fields. Every public page, the sitemap, the chatbot context, the newsletter suggestions, and the stats now read the view. Owners, members, and admins keep full access through a new policy. Part B removes public access to the table itself.
- **Status:** Fixed in code and SQL. Requires migration 10-04a, then the deploy, then migration 10-04b.

### 4. Event moderation bypass — **High**
- **Where found:** RLS insert policy on `event_submissions` (`with check (true)`)
- **Why it matters:** A direct API call could submit an event already marked `approved`. It would then appear on the public calendar without review, which opens the door to spam, phishing links, and fake events under the Incubator Baguio name.
- **What was changed:** Inserts must now be `status = 'pending'`, and `owner_id` must be empty or the caller's own ID.
- **Status:** Fixed in SQL. Requires migration 10-04a.

### 5. Challenge submitters' contact details publicly readable — **Medium**
- **Where found:** The policy "challenge submissions are publicly readable" on `challenge_submissions`
- **Why it matters:** The name, email, and phone of anyone who posted a community challenge could be read by anyone. No rows were visible at the time of testing, so the exposure is potential rather than active.
- **What was changed:** Added a `public_challenge_submissions` view with no contact columns, and the public pages now read it. Part B removes the public table policy.
- **Status:** Fixed in code and SQL. Requires migration 10-04a, then the deploy, then migration 10-04b.

### 6. Idea Lab: access to other users' ideas (IDOR) — **Medium**
- **Where found:** `app/api/idea-lab/session/[id]`, `generate`, `refine`, `note`, `share`
- **Why it matters:** Knowing an idea or session ID was enough to read, refine, annotate, or share another user's ideas.
- **What was changed:** Added `getOwnedIdea()` in `lib/idea-lab/store.ts`. Every route now checks that the idea belongs to the signed-in account. `session/[id]` also requires login.
- **Status:** Fixed in code and verified with the type check and the Idea Lab tests. Not yet deployed.

### 7. SSRF bypass in the link preview — **Medium**
- **Where found:** `app/api/link-preview/route.ts`
- **Why it matters:** The internal-address check ran only on the first URL. A public URL that redirects to `169.254.169.254` or `localhost` could make the server fetch internal resources.
- **What was changed:** Redirects are now followed manually (at most 4), and every hop is re-checked against the shared blocklist in `lib/ssrfGuard.ts`. That blocklist covers private, link-local, CGNAT, and IPv6 local ranges, `.local`, and `.internal`. The preview image URL must be http(s).
- **Status:** Fixed in code. Verified with unit tests covering 17 blocked and 5 allowed hosts. Not yet deployed.

### 8. Unrestricted file uploads — **Medium**
- **Where found:** Supabase Storage buckets and `lib/uploadLogo.ts`
- **Why it matters:** Any file type or size could be uploaded to the public buckets. An SVG or HTML file can carry script, and very large files waste storage.
- **What was changed:** The buckets now have MIME and size limits: image buckets accept PNG, JPG, WebP, or GIF up to 5 MB, posters and the gallery up to 10 MB, knowledge files up to 25 MB, and chatbot documents (PDF) up to 20 MB. SVGs are also blocked in the browser with a clear message.
- **Status:** Fixed in code and SQL. Requires migration 10-03.

### 9. Self-granted admin on profile creation — **Medium**
- **Where found:** The `protect_profile_privileges` trigger, which ran only BEFORE UPDATE
- **Why it matters:** A user whose profile row was missing could insert it with `is_admin = true`.
- **What was changed:** The trigger now also runs on INSERT and forces `is_admin` and `is_mentor` to false for non-admins.
- **Status:** Fixed in SQL. Requires migration 10-04a.

### 10. Challenge applicants could set their own review result — **Medium**
- **Where found:** The `challenge_applications` policy "applicants manage their own applications" (FOR ALL)
- **Why it matters:** An applicant could mark their own application `accepted` and write their own review note.
- **What was changed:** A new trigger, `protect_challenge_application_review`, makes the review fields (and the applicant and challenge IDs) admin-only.
- **Status:** Fixed in SQL. Requires migration 10-04a.

### 11. Unescaped values in emails and the newsletter — **Low**
- **Where found:** `lib/sendEventApprovalEmail.ts`, `lib/newsletterTemplate.ts`
- **Why it matters:** Event titles, venues, and links were inserted into email HTML without escaping, which allows HTML injection into emails sent from the site's address.
- **What was changed:** All of these values are now escaped.
- **Status:** Fixed in code and checked by a wiring test. Not yet deployed.

### 12. Raw database errors shown to users — **Low**
- **Where found:** About 20 forms and dashboards that showed `error.message`
- **Why it matters:** These messages revealed table, policy, and constraint names, which helps an attacker map the database.
- **What was changed:** Added `lib/friendlyError.ts` and `storageErrorMessage()`. Users now see a plain message, and the details go to the console. Auth messages and our own intentional messages still pass through. 41 call sites were updated.
- **Status:** Fixed in code and verified with unit tests. Not yet deployed.

### 13. Duplicate-organization flag computed in the browser — **Low**
- **Where found:** `OrganizationManager.tsx`, which sent `flagged_duplicate` from the client
- **Why it matters:** A direct API call could send `false` and slip a look-alike organization past admin review.
- **What was changed:** A new trigger, `protect_organization_insert`, computes the flag in the database and clears admin-only fields on insert.
- **Status:** Fixed in SQL. Requires migration 10-04a.

### 14. Public forms could preset system fields — **Low**
- **Where found:** Insert policies on `ecosystem_signups`, `contact_messages`, and `newsletter_subscribers`
- **Why it matters:** Status and bookkeeping columns (welcome and Beehiiv sync timestamps) could be preset, which could skip moderation or the welcome email.
- **What was changed:** Each insert is now limited to the state the real form produces.
- **Status:** Fixed in SQL. Requires migration 10-04a.

### 15. Vulnerable dependencies (fixable without breaking changes) — **Low**
- **Where found:** `fflate` and `dompurify`, a dependency of posthog-js
- **Why it matters:** Known advisories, including a DOMPurify DOM-XSS edge case.
- **What was changed:** Ran `npm audit fix` without `--force`.
- **Status:** Fixed, and the build passes.

---

## Remaining Issues

| Issue | Severity | Notes / recommendation |
|---|---|---|
| Spam on public forms | Medium | The `formGuard` throttle runs in the browser, so a script that calls the Supabase API directly can get around it. Add Cloudflare Turnstile, or move public form submissions behind server routes. Avoid strict per-IP limits, because campus networks share IPs. |
| `/api/link-preview` has no rate limit | Low | It is SSRF-guarded but can be called in a loop. Add a per-IP limit or a cache. |
| Newsletter helper RPCs callable by anonymous users | Low | These are the claim, confirm, and release functions for the Beehiiv sync and the welcome email. They cause bookkeeping churn at worst. Restrict them to `service_role`. |
| `maplibre-gl` advisory (critical) | Low in practice | The bug is in `DOM.sanitize()`, which popups use. The site uses MapLibre only in `LocationPicker.tsx` and has no popups. The fix requires upgrading to v6 (breaking), so plan and test that upgrade. |
| `postcss` advisory via `next` (high) | Low in practice | PostCSS runs at build time on our own CSS only. The fix requires Next 16 (breaking), so plan that upgrade. |
| Account enumeration | Low | Signup and reset messages can reveal whether an email is registered. This is common Supabase behaviour. Consider generic wording. |
| Mentors and startups self-publish | By design | They appear without admin approval. Confirm this is still wanted. |
| Lint | n/a | `next lint` has no ESLint config in the repo, so it would start an interactive setup. Lint was not run. |
| Accessibility: multiple `<h1>` tags | Low | `/login/` has 2 and `/signup/` has 3. This is not a security issue and was left unchanged. |
| Test row in PinaSIKLab registrations | n/a | Delete "ZZ Backend Test (delete me)" from `/pinasiklab/admin/`. |

---

## Final Status

**Tested**
- `npx tsc --noEmit`: passes
- `npm test`: 20/20 pass (security plus Idea Lab)
- `npm run build`: passes
- `npm audit`: 3 advisories remain, all needing breaking upgrades (see above)
- Anonymous read test with the public key: private tables return 0 rows, while the organization contact leak (#3) was confirmed
- Production security headers present: HSTS, `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`, nosniff, Referrer-Policy, Permissions-Policy
- Secrets: none in git history, and no server keys in the browser bundle
- Cron endpoint: fails closed when its secret is missing
- CORS: no permissive headers are set. CSRF: not applicable, because the API uses Bearer tokens rather than cookies.
- Local crawl of 134 URLs: no broken internal links
- Mobile at 375px on Home, About, Programs, Challenges, Ecosystem, Knowledge, Calendar, Community, Search, Login, Signup, PinaSIKLab, and Idea Lab: no horizontal overflow and no images missing alt text
- PinaSIKLab registration insert retested after the policy fix: 201 Created

**Fixed:** issues 1–15 above. The code and SQL are written and checked. Deploy and the migrations are still needed.

**Still needs attention:** the Remaining Issues table above.

**Requires manual review**
- Signed-in flows could not be tested end to end without creating accounts on the production Supabase. These are registration, login, user and organization dashboards, profile editing, challenge submission and editing, and admin functions. After deploying and running the migrations, walk through each one with a test account.
- After migration 10-04b, confirm that organization owners and members still see and edit their own organization, and that admins still see full contact details.
- Supabase Auth settings in the dashboard: minimum password length, email confirmation required, and leaked-password protection.
- Supabase Storage: confirm the new bucket limits appear on each bucket after migration 10-03.
- Rotate any key that was ever shared outside Vercel or Supabase (for example in chat or email), as good practice.
