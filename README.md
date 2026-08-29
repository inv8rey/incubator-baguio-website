# Incubator Baguio

The public website and internal operations dashboard for **Incubator Baguio** — the Baguio City Research and Innovation Alliance, operationalized under Ordinance No. 063, s. 2023, City Government of Baguio.

Live: https://incubator-baguio.vercel.app

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router, React 19), deployed on [Vercel](https://vercel.com) |
| Database / Auth / Storage | [Supabase](https://supabase.com) (Postgres + Row Level Security, email/password auth, file storage) |
| Styling | Inline styles + a small set of shared CSS classes in `app/globals.css` — no CSS framework |
| AI chat assistant | Cloudflare Workers AI, with a small RAG layer over admin-uploaded documents |
| Maps | MapLibre GL (location picker only; no public map view yet) |
| Analytics | PostHog |
| Transactional email | Resend (event-approval notifications) |
| Language | TypeScript throughout |

There is no ORM — every database call goes through `@supabase/supabase-js` directly, and every table's access rules live in Postgres Row Level Security (RLS) policies, not in application code.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in the values, see below
npm run dev                        # http://localhost:3002
```

The dev server runs on **port 3002**, not 3000 (`package.json`'s `dev`/`start` scripts pin it).

> **Known gotcha:** don't delete `.next` while the dev server is running (e.g. running `npm run build` in a second terminal). It corrupts the running server's cache and every route starts 500ing. If that happens: stop the dev server, `rm -rf .next`, then restart it.

### Database setup

1. Create a Supabase project.
2. Open the SQL editor and run the entirety of [`supabase/schema.sql`](supabase/schema.sql). It is idempotent (`create table if not exists`, `drop policy if exists` before every `create policy`, etc.) — safe to re-run any time, including against a database that already has data.
3. Apply anything in [`supabase/migrations/`](supabase/migrations/) that isn't already folded into `schema.sql` (check the dated comment at the top of each file against the date `schema.sql` was last updated). New work generally lands as a dated migration file first, then gets folded into `schema.sql` as the canonical full picture of the database.

### Environment variables

See [`.env.local.example`](.env.local.example) for the full list with explanations of where each value comes from. Everything except the Supabase URL/anon key is optional for local development — missing integrations degrade gracefully (e.g. the AI chat assistant shows "not configured yet" instead of crashing).

A few worth calling out:

- **`ADMIN_ROUTE_SLUG`** — the admin panel does not live at `/admin`. It lives at whatever path this variable names (e.g. `/ib-a1b2c3d4e5f6/`), and `/admin` itself is a plain 404. This is a server-only value, never sent to the browser, and there is no link to it anywhere on the public site — bookmark it. **Leaving it unset makes the admin panel completely unreachable everywhere**, including local dev, so it must be set in every environment. Generate one with `echo "ib-$(openssl rand -hex 6)"`.
- **`SUPABASE_SERVICE_ROLE_KEY`** — bypasses every RLS policy. Only used server-side, by the daily AI-insights cron job (which has no user session of its own to authenticate with). Treat it as root access to the database: never expose it to the client, never commit it, rotate it if it's ever pasted anywhere outside a secrets manager.
- **`CRON_SECRET`** — Vercel Cron sends this as a bearer token when it hits the scheduled insights job (`vercel.json`). The route refuses the request outright if this is unset, rather than comparing against the literal string `"undefined"`.

## Architecture notes

**Route structure.** Standard Next.js App Router — `app/<route>/page.tsx`. Public marketing pages are mostly server components rendering a big HTML string via `dangerouslySetInnerHTML` (see `app/chrome.ts` for the shared nav/footer, injected the same way on every page) with an interactive island mounted as a client component where needed (e.g. `app/calendar/CalendarClient.tsx`). Dashboard and admin pages are plain client-rendered React.

**Auth gating.**
- Public dashboard routes (`/dashboard/*`) are gated by `RequireAuth` — any signed-in user.
- The admin panel (`app/[adminSlug]/`) is a dynamic route that checks the requested slug against `ADMIN_ROUTE_SLUG` server-side, then gates on `RequireAdmin` (checks `profiles.is_admin`). A wrong slug and a genuinely nonexistent page are indistinguishable — both 404.
- Admin-only API routes (`app/api/admin/*`) independently re-verify the caller's session and `is_admin` flag via `lib/requireAdmin.ts` — the client-side gate above is not trusted as the only checkpoint.

**Security model.** Every table has RLS enabled; almost nothing is gated by application code alone. A handful of shared Postgres helper functions do the heavy lifting so policies don't recurse into themselves or duplicate logic — notably `is_org_member()`, `is_site_admin()`, `shares_organization_with()`, and `has_pending_request_from()` (all defined in `schema.sql`, all `security definer`). If you add a new RLS policy that needs to check something about the *current row's own table* (e.g. a policy on `profiles` that checks `profiles.is_admin`), route it through a `security definer` function instead of an inline subquery on the same table — an inline self-referencing subquery causes Postgres to recurse into the same policy and fail with `42P17 infinite recursion detected`. This has actually happened in this codebase once; see the `2026-08-28b-fix-profiles-recursion.sql` migration for the incident and the fix.

**Shared components worth knowing about before adding a new page:**
- `app/chrome.ts` / `app/dashboard/chrome.ts` — nav bar + footer HTML, shared across ~30 pages.
- `app/EventsCarousel.tsx` — the image-free event card carousel used on both the homepage and `/calendar`. Every card's artwork is generated from its category (a tinted gradient + an outline glyph), not a photo — there is no poster-upload requirement for an event to look finished.
- `app/galleryShared.tsx` — photo shape, date parsing, and the lightbox, shared by the homepage gallery strip and the full `/gallery` page.
- `lib/formGuard.ts` — honeypot + per-IP throttle for the public unauthenticated forms (contact, event submission, ecosystem signup, newsletter, consultation feedback), backed by the same rate-limit table the chat assistant uses.
- `lib/uploadLogo.ts` / `lib/uploadFile.ts` — thin wrappers around Supabase Storage uploads (2MB image cap / 15MB document cap respectively), used by every admin/dashboard form that accepts a file.

**The AI chat assistant** (`app/api/chat/`, `lib/chatContext.ts`, `lib/chatCompletion.ts`) runs on Cloudflare Workers AI's free tier, which has a real daily budget (`CHAT_DAILY_BUDGET`, default 60 answers/day across every visitor). `lib/chatRateLimit.ts` enforces three tiers — per-IP burst, per-IP hourly, and the shared daily budget — via an atomic Postgres RPC (`bump_chat_usage`) so a burst of concurrent requests can't undercount. The admin can also privately upload reference documents (`app/admin/tabs/ChatbotKnowledgeTab.tsx`) that get chunked and embedded for the assistant to search — that table (`chatbot_documents`) has no public read policy at all, only a `security definer` search RPC, so it can never be listed or browsed directly by a visitor.

## Deployment

Hosted on Vercel, deploying automatically from the `main` branch. One scheduled job (`vercel.json`): the daily AI-insights cron at 23:30 UTC (07:30 Asia/Manila).

```bash
vercel env ls production      # check what's set
vercel env add <NAME> production   # add/update one (prompts for the value)
vercel --prod                 # manual deploy, if needed outside the git push flow
```

`next.config.js` sets `trailingSlash: true` site-wide — always write internal links with a trailing slash (`/calendar/`, not `/calendar`) to avoid an extra redirect hop.

## Repo layout

```
app/                    Next.js App Router — one folder per route
  admin/                 Admin panel components (mounted at the secret ADMIN_ROUTE_SLUG path)
  dashboard/              Signed-in member dashboard (individual + organization views)
  api/                    Route handlers (chat, AI insights, admin actions)
  [adminSlug]/            The actual admin route entry point
lib/                    Shared server/client utilities (Supabase client, uploads, email, rate limiting…)
supabase/
  schema.sql              Full database schema — the source of truth, safe to re-run
  migrations/              Dated incremental changes not yet folded into schema.sql
public/assets/           Static images, logos, PDFs
```

## Contributing / working conventions

- No test suite exists yet — verification is `npx tsc --noEmit`, a full `npm run build`, and manual/browser checks.
- Prefer editing existing files and reusing existing patterns (e.g. `EventsCarousel`, `galleryShared`, `formGuard`) over introducing a new abstraction for something that already has one.
- Schema changes go into a new dated file under `supabase/migrations/` first, then get folded into `supabase/schema.sql` once applied, so `schema.sql` always stays the single full picture of the database.
