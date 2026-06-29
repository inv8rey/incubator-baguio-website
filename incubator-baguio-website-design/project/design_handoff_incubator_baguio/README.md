# Handoff: Incubator Baguio Website

## Overview
Incubator Baguio is the City of Baguio's technology business incubator and innovation platform, established under Ordinance No. 063, Series of 2023 by the CPDSO (City Planning, Development and Sustainability Office). This handoff covers the full public-facing website: homepage, about page, innovation challenges listing, challenge detail page, and supporting frames.

## About the Design Files
The files in this bundle are **design references created in HTML** — high-fidelity prototypes showing the intended look, layout, copy, and interactions. They are **not production code to copy directly**. Your task is to **recreate these designs in your target codebase** (e.g. Next.js + Tailwind, React + CSS Modules, etc.) using its established patterns and libraries. If no framework is chosen yet, Next.js with Tailwind CSS is recommended given the multi-page routing and component reuse needs.

## Fidelity
**High-fidelity.** These are pixel-accurate mockups with final colors, typography, spacing, copy, and interactions. Recreate UI pixel-precisely using your codebase's design system and component library.

---

## Design Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| Primary Orange | `#F26522` | CTAs, eyebrows, accents, active nav |
| Dark BG | `#0B0B0D` | Hero sections, nav, footer |
| Nav BG | `#0E0E10` | Top navigation bar |
| Off-white BG | `#FAFAF7` | Alternating sections |
| Pure White | `#FFFFFF` | Cards, content sections |
| Body Text | `#141417` | Headings, primary text |
| Muted Text | `#6B6B73` | Body paragraphs, descriptions |
| Subtle Text | `#9A958B` | Meta labels, timestamps |
| Medium Text | `#44444C` | Secondary body copy |
| Government Blue | `#285E7A` | Government category tag |
| Industry Orange | `#F26522` | Industry category tag |
| Academia Purple | `#9E2A52` | Academia category tag |
| Agriculture Green | `#1A6B3C` | Agriculture sector tag |
| Open Status | `#3F9E4D` | Open challenge / active status |
| Danger Red | `#E23A2E` | Urgent deadline indicator |
| Warning Amber | `#F5A623` | Medium-urgency deadline |
| Border Default | `rgba(20,20,25,0.10)` | Card borders |
| Border Light | `rgba(20,20,25,0.06)` | Section dividers |

### Typography
- **Font:** General Sans (from Fontshare CDN)
  ```
  https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap
  ```
- **Weights used:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

| Role | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Hero headline | 64–72px | 700 | -0.035em | 1.0 |
| Section headline | 40–52px | 700 | -0.03em | 1.06–1.08 |
| Card headline | 20–24px | 700 | -0.02em | 1.15 |
| Eyebrow (micro) | 12px | 600 | 0.18em UPPERCASE | — |
| Body copy | 16px | 400 | normal | 1.65 |
| Body secondary | 14–15px | 400 | normal | 1.55 |
| Nav links | 14px | 500 | normal | — |
| Tags / badges | 11.5–12px | 700 | 0.1em UPPERCASE | — |

### Spacing
- Section vertical padding: `72–80px`
- Max content width: `1060–1080px` centered with `margin: 0 auto`
- Card padding: `26–30px`
- Grid gap (3-col): `18–20px`
- Grid gap (2-col): `18–20px`

### Border Radius
| Use | Value |
|---|---|
| Cards | `18–20px` |
| Buttons (pill) | `9999px` |
| Icon badges | `11–12px` |
| Tags | `9999px` |
| Image placeholders | `18px` |

### Shadows
- Card hover: `0 12px 30px rgba(20,20,25,0.08)`
- Cards default: border only (`1px solid rgba(20,20,25,0.10)`)

### Animations
- Homepage marquee ticker: `ibmarquee` keyframe, `translateX(0 → -50%)`, `20s linear infinite`
- Hero float: `ibfloat` keyframe, `translateY(0 → -10px → 0)`, `6s ease-in-out infinite`

---

## Screens / Views

---

### 1. Homepage (`/`)

**Purpose:** Landing page introducing Incubator Baguio, its programs, challenges, startups, and events.

**Layout:** Full-width, single-column stacked sections. Max content width 1060px centered.

#### Nav
- Dark (`#0E0E10`) sticky bar, full width, 64px tall
- Left: logo icon (`assets/ib-icon.png`, 32px tall) + wordmark "Incubator Baguio" (16px, 600, white)
- Right: nav links (About · Programs · Challenges · Knowledge Hub · Ecosystem · News & Events), then CTA button "Post a Challenge" (orange pill) + "Apply" (white outline pill)
- Active page: underlined with `#F26522`, 2px, `padding-bottom: 3px`

#### Hero Section
- Background: `#0B0B0D`, padding `96px 40px 120px`
- Radial gradient glows: orange top-left, blue bottom-right
- Eyebrow pill: "Baguio City Research & Innovation Alliance" — border `rgba(255,255,255,0.16)`, bg `rgba(255,255,255,0.04)`, orange dot
- H1: "Where Baguio's ideas become real ventures." — 72px, 700, white, max-width 780px
- Sub-copy: 18px, `rgba(255,255,255,0.66)`, max-width 560px
- CTA row: "Apply to the incubator" (orange pill, 16px, 600) + "Explore programs →" (text link, white/60)
- Stat strip: 3 stats (Startups Incubated, Partner Institutions, Years of Programs) separated by hairlines
- Floating card: white card bottom-right with startup name + "Incubator Baguio Cohort" badge

#### Marquee ticker
- Dark band, 44px, auto-scrolling logos/partner names, speed 20s linear infinite

#### Programs Section
- BG `#FAFAF7`, padding 80px
- Eyebrow: "PROGRAMS" in orange
- H2: "From idea to funded venture"
- 3 numbered editorial rows (01 Validate, 02 Build, 03 Scale) — each `display:grid`, left number + colored border, right title + description + "Learn more →"

#### Innovation Challenges
- BG `#fff`, padding 80px
- Eyebrow: "INNOVATION CHALLENGES" in orange
- H2: "Problem Statements from Government, Industry, and Academia"
- 3 category cards: Government (`#285E7A`), Industry (`#F26522`), Academia (`#9E2A52`) — each with colored `border-top: 3px`
- Below: 3 Open Challenge cards (see Challenge card spec below)
- CTA: "View all challenges" — orange pill button

**Challenge card (homepage):**
- White card, 18px radius, border `rgba(20,20,25,0.12)`
- Top row: sector tag pill (colored) + days-left badge (red dot for urgent, amber for medium)
- H3: 23px, 700, `#141417`
- Description: 15px, `#6B6B73`
- Footer: org logo badge (colored square) + org name + "View →" link right-aligned
- Footer separated by `border-top: 1px solid rgba(20,20,25,0.1)`

#### Featured Startups
- BG `#FAFAF7`, padding 80px
- Eyebrow: "STARTUP DIRECTORY"
- H2: "Startups in the Incubator Baguio Network"
- 3 startup cards with cover image placeholder (148px, hatched pattern) + logo badge + name + sector + description
- CTA: "View all startups" — dark pill button

#### Upcoming Events
- BG `#fff`, padding 80px
- Eyebrow: "EVENTS"
- H2: "Workshops, Forums, and Community Activities"
- Table-style rows: date column (month abbrev + day number) + event name + venue + "RSVP" dark pill
- Rows separated by `border-top: 1px solid rgba(20,20,25,0.12)`

#### Footer (shared across all pages)
- BG `#0B0B0D`, padding `56px 40px 36px`
- 4-col grid: Brand + tagline | Explore links | Apply links | Contact
- Bottom row: copyright + policy links, `rgba(255,255,255,0.4)`

---

### 2. About Page (`/about`)

**Purpose:** Institutional background, role, quadruple helix model, legal foundation, and ecosystem partners.

**Sections (in order):**

#### Hero
- Same dark nav
- BG `#0B0B0D`, eyebrow "About Incubator Baguio", H1 "Baguio's Innovation **Alliance**" (Alliance in `#F26522`)
- Sub: "Incubator Baguio brings together government, academia, industry, entrepreneurs, researchers, and community partners…"

#### Our Role
- BG `#FAFAF7`, 2-col grid (text left, image placeholder right)
- Left: eyebrow "Our Role" + orange accent bar (42×3px) + H2 + blockquote-style paragraph (left border 3px `#F26522`)
- Right: image placeholder (aspect-ratio 16/11, hatched pattern, radius 20px)
- Below: Featured card — "Technology Business Incubator" full-width with icon + description + orange arrow circle button
- Below: 3-col grid — Innovation Platform, Research and Commercialization, Ecosystem Development — each with colored icon circle, H3, description, "Learn more →" in orange

#### Quadruple Helix (dark)
- BG `#141417` (dark), padding 80px
- Eyebrow "The Quadruple Helix Model" in `#FFB489` (warm peach)
- H2 "A Collaborative Approach to Innovation" — white
- 4 pillars in 2×2 grid: Government, Academia, Industry, Community — each with colored dot accent, white heading, muted description

#### Our Foundation
- BG `#fff`, 2-col grid (text left, visual right)
- Left: eyebrow "Our Foundation", H2 "Institutionalized Through City Ordinance"
- Copy references Ordinance No. 063, Series of 2023, CPDSO, City Government of Baguio
- 3 pill-style info chips: "City Government of Baguio", "CPDSO", "Ordinance No. 063"
- Right: stat cards (founding year, partner institutions, active programs)

#### Ecosystem Partners
- BG `#FAFAF7`, 3-col grid of partner badges
- Each: white card, logo initials colored square + institution name
- Partners: SLU, UB, UP Baguio, UC, BSU, DOST, DTI, CHED, DICT

---

### 3. Innovation Challenges (`/challenges`)

**Purpose:** Browse all open challenge problem statements from government, industry, and academia.

**Sections:**
- Dark hero with eyebrow "INNOVATION CHALLENGES", H1, sub-copy
- Stat strip: Active Challenges, Sectors Covered, Registered Solvers (no reward stat)
- Filter bar: sector tabs + deadline filter (no reward filter)
- 6-card grid of challenge cards (same spec as homepage challenge cards)
- "How to participate" 3-step flow: Browse → Register → Get selected (no reward language)
- "Post a Challenge" CTA section for organizations

---

### 4. Challenge Detail (`/challenges/[id]`)

**Purpose:** Full detail view of a single challenge, with submission CTA and solver community.

**Layout:** Dark hero + white content area (2-col: body left, sidebar right) + solver grid + footer

#### Dark Hero
- BG `#0B0B0D` with radial glow (sector color)
- Breadcrumb: Home / Innovation Challenges / [Challenge title]
- Sector tag pill + days-left badge (colored dot)
- H1: 52px, 700, white, max-width 800px
- Poster row: org logo badge + org name + role ("Government · Challenge poster")

#### Body (left column, ~65% width)
- "About this challenge" — 2 paragraphs, 16px
- "What we're looking for" — light gray card with 4 checkmark bullet points (green check circles)
- "Evaluation criteria" — 2×2 grid: Feasibility, Impact, Scalability, Team
- CTA card (dark `#141417`): "Ready to solve this?" + "Submit a solution →" orange pill

#### Sidebar (right column, 340px, sticky)
- Challenge details card: Status (green "Open") · Deadline · Sector · Scope · Submissions count
- Posted by card: org logo + name + description
- Support offered card: 3 bullet points with orange dots

#### Registered Solvers Section
- BG `#FAFAF7`, padding 64px
- Eyebrow "Registered solvers", H2 "Teams currently working on this" + count right-aligned
- 3-col grid of solver cards, each showing:
  - Team logo (colored initial square, 44px, radius 11px)
  - Team name + member count
  - Status badge (green "Active" or amber "In review")
  - Short description of their approach
  - School, Track, Registration date in small meta rows
- 6th card: dashed border, "7 more teams registered" + "Join as a solver →" CTA

---

## Interactions & Behavior

| Interaction | Behavior |
|---|---|
| Nav links | Highlight active page with orange underline |
| Challenge cards | Hover → `box-shadow: 0 12px 30px rgba(20,20,25,0.08)` |
| Startup cards | Hover → same card shadow |
| Event rows | Hover → `background: #FAFAF7` |
| "View all challenges" | Routes to `/challenges` |
| "View all startups" | Routes to `/startups` |
| "View challenge →" | Routes to `/challenges/[id]` |
| "Submit a solution" | Routes to submission form |
| "RSVP" buttons | Routes to event registration |
| Marquee ticker | `animation: ibmarquee 20s linear infinite`, `translateX(0 → -50%)` |
| Hero float element | `animation: ibfloat 6s ease-in-out infinite`, `translateY(0 → -10px → 0)` |

---

## State Management

- **Challenge listing page:** filter state (sector, deadline) — local component state
- **Challenge detail:** challenge ID from URL params → fetch challenge data
- **Solver list:** paginated, first 5 shown, "view more" toggle
- **Events:** sorted by date ascending

---

## Assets

| Asset | Location | Usage |
|---|---|---|
| Logo icon | `assets/ib-icon.png` | Nav, footer |
| Startup cover images | Placeholder (hatched pattern) | Startup cards — replace with real images |
| Org logo badges | Colored initials squares | Challenge posters — replace with real logos |

---

## Pages Summary

| Page | Route | Frame in DC |
|---|---|---|
| Homepage | `/` | `HOME` frame |
| Innovation Challenges | `/challenges` | `INNOVATION_CHALLENGES` frame |
| Challenge Detail | `/challenges/[id]` | `CHALLENGE_DETAIL` frame |
| About | `/about` | `ABOUT` frame |
| Knowledge Hub | `/knowledge` | Not yet designed |
| Ecosystem | `/ecosystem` | Not yet designed |
| News & Events | `/events` | Not yet designed |
| Programs | `/programs` | Not yet designed |
| Program Detail | `/programs/[id]` | `PROGRAM_DETAIL` frame |
| Apply | `/apply` | `APPLY` frame |

---

## Files in This Bundle

| File | Description |
|---|---|
| `Incubator Baguio.dc.html` | Full design canvas — all frames in one file. Open in browser. Scroll horizontally to navigate frames. |
| `assets/ib-icon.png` | Incubator Baguio logo icon |

---

## Recommended Tech Stack (if greenfield)

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Fonts:** General Sans via Fontshare (`https://api.fontshare.com`)
- **Icons:** Lucide React (matches icon style in designs)
- **Animations:** Tailwind `animate-*` + custom keyframes in `tailwind.config`
- **Routing:** Next.js file-based routing (`app/challenges/[id]/page.tsx`)

---

## Notes for Developer

1. The design uses **General Sans** exclusively — load it before any content renders to avoid FOUT.
2. All section max-widths are `1060–1080px` centered — use a shared `<Container>` wrapper component.
3. The nav is **shared across all pages** — extract as a layout component immediately.
4. Challenge cards are reused on the homepage and the listing page — build as a shared `<ChallengeCard>` component.
5. The color system is intentional: Government = blue (`#285E7A`), Industry = orange (`#F26522`), Academia = purple/maroon (`#9E2A52`), Agriculture = green (`#1A6B3C`). Map these to a `SECTOR_COLORS` constant.
6. **No reward amounts anywhere** — the platform does not display monetary rewards; this was a deliberate product decision.
7. Cover image areas on startup cards are placeholders — implement with `<Image>` (Next.js) with `object-fit: cover`.
8. The footer is identical across all pages — extract as a shared layout component.
