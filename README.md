# World Shift Technologies — Landing App

Next.js marketing site at worldshifttech.com. Personalized front door: visitors answer 4 questions, Claude generates a custom page based on Drew's case study library.

## Copy Rules

- No em-dashes anywhere in user-facing copy (no `—`, `&mdash;`, or `&#8212;`). Use a comma, period, or restructure the sentence.
- No reassurance language. Do not use "free", "no pitch", "no pressure", or any phrase that tries to convince a hesitant visitor. Assume the visitor is already interested.
- Lead with outcomes, not technology.
- No corporate jargon. Tone: direct, warm, founder-led.

## Dev

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Build Status

- [x] Next.js scaffold deployed to Vercel
- [x] GitHub repo connected
- [x] ANTHROPIC_API_KEY set in Vercel env
- [x] NEXT_PUBLIC_SUPABASE_URL set in Vercel env
- [x] SUPABASE_SERVICE_ROLE_KEY set in Vercel env
- [x] Brand fonts (Playfair Display, DM Sans) and CSS variables configured
- [x] `/meet` — 4-question conversational flow, cookie write, redirect
  - Q1: How did you find this site? (click to advance)
  - Q2: Briefly describe what you do (text input)
  - Q3: What are you curious about? (multi-select)
  - Q4: Anything else you'd like to see? (optional freeform, skip or submit)
  - Stores `{ source, description, interests, freeform, turnstileToken }` in `wst_visitor` cookie (30d)
- [x] Personalization system complete
  - `/lib/case-studies.ts` — reads all markdown files from `/content/case-studies/`
  - `/lib/supabase.ts` — Supabase client (service role)
  - `/content/case-studies/` — 6 case study markdown files
  - `/app/api/personalize/route.ts` — 2-step Claude API route: classify visitor → generate page → cache in Supabase
  - `/app/for-you/page.tsx` — loading state, POSTs to personalize, redirects to dynamic route
  - `/app/for-you/[industry]/[solution]/page.tsx` — personalized page pulled from Supabase
- [x] Bot protection — two layers on `/meet` + `/api/personalize`
  - Layer 1: Honeypot field (`name="website"`, visually hidden). Bots that fill it are silently redirected to `/for-you` without a cookie write.
  - Layer 2: Cloudflare Turnstile on step 4. Script loads with `strategy="afterInteractive"`. Widget is rendered explicitly via `turnstile.render()` inside a `useEffect([step, scriptLoaded])` — covers both orderings (script loads first, or user reaches step 4 first). Token stored in `wst_visitor` cookie, verified server-side in `/api/personalize` before any Claude or Supabase calls. Missing or invalid token returns 403.
- [x] `/fractional` — static landing page for ClickUp consultant directory traffic
  - Audience: ClickUp-aware visitors from fractionalbusinesscompanion.com redirect
  - Sections: Hero, Credential Strip (3 certifications), What This Actually Means (two-column), Agent-First Difference (3 cards), Who This Is For, CTA
  - All CTAs link directly to Calendly. No form, no personalization flow.
  - Server component (static, no `"use client"`). Follows home page Tailwind + inline font-family pattern exactly.
- [x] Supabase Auth foundation
  - `@supabase/auth-helpers-nextjs` installed
  - `/lib/supabase.ts` exports `getSupabase()` (service role, server) and `getSupabaseBrowser()` (anon key, browser)
  - `/lib/auth.ts` — `getSession()`, `getUser()`, `signIn()`, `signUp()`, `signOut()` helpers
- [x] Login/Signup modal on home page
  - Nav: "Log In" (ghost) + "Get Started" (teal) trigger the modal; "Book a Call" is secondary
  - Two-tab modal: Log In / Sign Up with confirm-password field on signup
  - Error states: wrong credentials, email already exists, password mismatch
  - On success: redirect to `/projects`
  - Auto-opens when home page loads with `?login=true` query param
- [x] `/projects` — authenticated dashboard shell
  - Server-side session check via `createServerComponentClient`; unauthenticated visitors redirected to `/?login=true`
  - Nav: WST white logo + user email + Sign Out button
  - Empty state: "Your Projects" headline + "Start a New Project" button wired to `/projects/new`
- [x] RLS policies on `projects` table — users can only read/insert/update/delete their own rows; guest insert policy allows `INSERT` where `guest = true AND user_id IS NULL` (run migration in Supabase SQL editor)
- [x] `/projects/new` — full-screen project wizard (open to guests and authenticated users)
  - Server component reads session; passes `isGuest={!session}` to `ProjectWizard` — no redirect for unauthenticated visitors
  - Chapter progress indicator: 3 steps ("The Problem / The Vision / The Build"), active teal, completed dimmed, upcoming muted
  - 6 questions across 3 chapters with correct input types:
    - Q1 (Problem): free text, required, 10+ chars to advance — "If you could change one thing in your business…" — stored as `q3`
    - Q2 (Vision): free text, required, 10+ chars to advance — "With that problem solved, what does your day-to-day or operations look like now?" — stored as `q6`
    - Q3 (Vision): single-select, 4 options, click to advance — "Who else needs to use this?" — stored as `q8`
    - Q4 (Build): multi-select, 9 options including "Other" with text reveal (at least 1 required) — "Do you have existing tools this needs to connect to?" — stored as `q10` + `q10_other`
    - Q5 (Build): single-select, 3 options, click to advance — "How technical are you?" — stored as `q11`
    - Q6 (Build): free text, optional — "Anything else I should know?" — stored as `q12`; "See Your Scope" triggers reveal state
  - Answers object retains all legacy fields for `/api/generate-scope` backward compatibility: `{ q1, custom_build_description, q2, q3, q4, value_signals, q6, q7, q8, q9, q10, q10_other, q11, q12 }`. Fields not collected by the new wizard (`q1`, `custom_build_description`, `q2`, `q4`, `value_signals`, `q7`, `q9`) are sent as empty string / empty array.
  - Reveal state: 3s animated teal progress bar, then real scope card (skeleton pulse while API is still in-flight after bar completes)
  - On reveal: inserts `draft` project row to Supabase (`user_id: null, guest: true` for guests; normal for auth'd users), fires POST to `/api/generate-scope` in parallel with the bar
  - Scope card: title (Playfair), teal divider, The Problem / Without It / With It / Investment Estimate sections, green/yellow/orange Energy Footprint badge
  - Investment Estimate: 3-tier display (MVP / Polished / Perfected) with price ranges and descriptions; `value_rationale` in gray italic below; falls back to flat range for older projects without `pricing` field
  - Green section below badge: `green_score_reason` (gray caption), teal-bordered Vercel renewable energy info box, carbon offset intent checkbox (fire-and-forget PATCH to `projects.green_offset_intent`)
  - Auth'd users: Submit button sets `status = "submitted"` in Supabase; loading/error state; confirmation screen with "You're in the queue." and "Back to Your Projects" pill; Slack notification fires on submit
  - Guest users: Submit button replaced with two CTAs: teal filled "Create an Account to Save Your Scope" (opens AuthModal in signup mode) and teal outlined "Book a Call Instead" `<a>` to Calendly; "No account needed — just pick a time." caption below
  - Guest signup success: fires PATCH to `/api/attach-guest-project` with `{ projectId, userId }`; on success (or failure), shows inline confirmation: checkmark, "Your scope is saved.", verify email note, secondary "Book a Call" link; no Slack notification
  - Scope generation error state: plain message if Claude API call fails
- [x] `/api/generate-scope` — Claude-powered scope generation
  - Accepts POST `{ projectId, answers }` with all 12 wizard answers including `value_signals`
  - Reads `/content/pricing-intelligence.md` at request time and injects it into the Claude prompt as `## PRICING INTELLIGENCE`
  - Calls Claude (`claude-sonnet-4-20250514`) with all answers labeled; returns structured JSON
  - JSON shape: `title`, `the_problem`, `without_it`, `with_it`, `green_score`, `green_score_reason`, `green_offset_estimate`, `pricing` (3-tier object)
  - `pricing` shape: `{ mvp: { low, high, description }, polished: { low, high, description }, perfected: { low, high, description }, value_rationale }`
  - MVP floor: $1,500. Polished: 1.5–1.75× MVP. Perfected: 2–2.5× MVP. `value_rationale` is outcomes-focused client-facing copy.
  - `price_low` / `price_high` also set from `pricing.mvp` for backwards compatibility
  - `green_score` rubric: Light = static/no-AI, Moderate = occasional AI or few integrations, Heavy = frequent AI + complex integrations
  - Updates `projects` row: sets `scope`, `title`, `status = "scoped"`, `updated_at`
  - Returns scope JSON to client; parse failures return 500
- [x] `/content/pricing-intelligence.md` — pricing context injected into scope generation
  - Builder rate ($250/hr), MVP floor ($1,500), Polished/Perfected multipliers
  - Value signal multipliers keyed to Q5 answer options
  - Industry baselines for 8 sectors: Professional Services, E-commerce, Creative Studios, Nonprofits, Healthcare, Operations/Logistics, SaaS, Solo Operators
- [x] `/projects` — authenticated dashboard with real project list
  - Fetches all projects for current user from Supabase ordered by `created_at desc`
  - Project cards: title (or "Untitled Project"), status badge, green_score badge, relative date
  - Each card is a full-width `<Link>` to `/projects/[id]`; clicking anywhere on the card navigates to the detail page
  - Status badges: draft (gray outlined), scoped (teal outlined), submitted (solid teal, dark text)
  - Green score badge (inline, same height as status badge): Light (green), Moderate (yellow), Heavy (orange); omitted for old projects without scope
  - Delete affordance: `×` button per card triggers inline confirm row ("Delete this project? [Delete] [Cancel]"); no modal; delete and cancel buttons use `e.preventDefault()` to suppress card navigation; "View Demo →" anchor uses `e.stopPropagation()`
  - Confirming deletes the row from Supabase; card removed from local state on success; inline red error on failure
  - `ProjectList.tsx` — client component managing local list state, confirm/delete/error per card
  - Empty state preserved; shown when list is empty on load or after all cards deleted
  - "Start a New Project" button in header row always visible
- [x] `/projects/[id]` — client-facing project detail page (protected server component)
  - Auth check via anon client; redirects to `/?login=true` if no session
  - Fetches project via service role with explicit `user_id` filter; redirects to `/projects` if not found or not owned by current user
  - Displays: "← Your Projects" back link, project title (Playfair Display), status badge (same badge map as `/projects` cards), "Started [Month Day, Year]" date
  - If status is `live` and `demo_url` exists: teal "View Your Demo →" button, opens in new tab
  - Full scope card with teal-labeled sections: The Problem / Without It / With It / Investment Estimate (3-tier MVP / Polished / Perfected display with `value_rationale`; graceful fallback to flat price range for older projects) / Energy Footprint badge and `green_score_reason` caption
  - If scope is null or missing `the_problem` (draft/unscoped): muted centered "Your project scope is being prepared." message in place of scope card
  - Self-contained single file, no new shared components
- [x] Slack notification on project submit
  - `ProjectWizard.tsx` fires POST to `/api/notify-slack` after successful `status = "submitted"` update — fire and forget, fails silently; not fired for guest submissions
  - `/api/notify-slack/route.ts` — POSTs to `SLACK_WEBHOOK_URL` env var with project title, user email, and link to `/admin`
- [x] `/api/attach-guest-project` — PATCH endpoint for guest account creation flow
  - Accepts `{ projectId, userId }`; uses service role client
  - Updates row where `id = projectId AND guest = true AND user_id IS NULL`; sets `user_id = userId, guest = false`
  - Returns 200 on success, 400 if row not found or already claimed, 500 on error
  - No auth check — the row conditions (`guest = true`, `user_id IS NULL`) prevent overwriting existing projects
- [x] `/admin` — Drew-only project queue (protected, server-side JWT gate)
  - `page.tsx` — server component: session check (`drew@worldshifttech.com` only, otherwise redirect to `/`), fetches all projects via service role (includes `guest` field), batches user email lookups via `supabase.auth.admin.getUserById` (null user_ids filtered out; guest rows show "Guest")
  - `AdminDashboard.tsx` — client component: active project table + collapsible Incomplete section
  - Active projects: all rows where `guest !== true`; interactive table with status badges, relative dates, "View" toggle, inline detail panel, status controls, Claude Code Prompt section
  - Incomplete section: collapsed by default; label shows count ("Incomplete (N)"); rows where `guest = true`; each row shows title, "No account created" subtext, "incomplete" badge, date, View toggle
  - Incomplete detail panel: full scope doc + raw answers; status controls hidden (no transition possible until account exists)
  - Inline detail panel: left column (scope doc), right column (raw answers, skipping blanks)
  - Investment Estimate in detail panel: 3-tier display with fallback to flat range
  - Status controls: one-step transitions (submitted → reviewed → building → approved → live)
  - Claude Code Prompt section (approved/live only): skeleton → generated prompt, Copy button, Regenerate, demo URL
  - Project README block (below prompt, same condition): "PROJECT README" teal label, scrollable monospace block, "Copy README" button (flips to "Copied ✓" for 2s); muted fallback text if null
  - Regenerate Prompt updates both `claude_code_prompt` and `project_readme` in local state when response returns
  - "← Back to Review" button (approved only)
  - Project count summary: counts active projects only
- [x] `/api/admin-update-status` — admin-only PATCH endpoint
  - Verifies Bearer token from Authorization header via `supabase.auth.getUser(token)`
  - Rejects with 403 if token missing, invalid, or not `drew@worldshifttech.com`
  - Updates `projects` row: `status`, `updated_at`
  - On `approved`: generates demo URL (`https://demo-[id].vercel.app`), fires two Claude (Sonnet) calls: (1) full Claude Code build prompt, (2) project README; saves both to DB, returns all three in response
  - README generation wrapped in try/catch — fails silently, never blocks prompt generation
  - `project_readme` column added to `projects` table (run `-- MIGRATION: project_readme` in Supabase SQL editor)
- [x] `/content/claude-code-prompt-template.md` — Drew's canonical Claude Code prompt template (structure, rules, stack defaults, examples)
  - Read by `/api/admin-update-status` when generating prompts for approved projects
  - Injected as the system prompt for the Claude call; falls back to hardcoded prompt if file can't be read
  - Fully replaced in Session 23 with the authoritative version (removed hyperlinked .md filenames, no other structural changes)
- [x] `/api/notify-client` — Resend email to project owner when status → `live`
  - From: `drew@worldshifttech.com`; subject: "Your project demo is live"
  - HTML email (navy/teal brand) with first name greeting, project title, teal "View Your Demo →" button linking to `demo_url`
  - Safe for local dev: no-ops silently when `RESEND_API_KEY` is not set
- [x] `/projects` — "View Demo →" teal link on live projects with demo_url
- [x] `/audit` — 5-phase AI waste estimate wizard (Session 33)
- [x] `/api/generate-audit` — Claude-powered audit report generation; reads `content/tool-registry.json`; persists to `audit_estimates` (Session 33)
- [x] `/api/attach-guest-audit` — links guest audit row to authenticated user after signup (Session 33)
- [x] `content/tool-registry.json` — ~80 tool knowledge base with waste patterns, leaner alternatives, energy transparency (Session 33)
- [x] Homepage nav "Get an Audit" link added (Session 33)
- [x] Slack notification on audit completion (Session 34)
- [x] Audits tab in admin dashboard (Session 34)
- [x] `/your-team-and-ai` — static editorial page (Session 35): 6 sections, brand voice, POPin handoff, bottom CTA to /audit
- [x] `/impact` — static public page listing the four AI accountability orgs WST donates to (Session 37): AI Now Institute, DAIR, SELC, Public Citizen; no auth, no data fetching
- [ ] Run `audit_estimates` migration in Supabase SQL editor (Session 33)
- [ ] Visual polish pass on the generated page (`/for-you/[industry]/[solution]`)
- [ ] `/api/ingest-case-study` — Zapier webhook to auto-commit new case studies

## Vercel Environment Variables

All set in Vercel dashboard under Settings > Environment Variables:

| Variable | Status |
|---|---|
| `ANTHROPIC_API_KEY` | Set |
| `NEXT_PUBLIC_SUPABASE_URL` | Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Set (public anon key, used by browser auth client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Set (service role, not anon key) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Set (Cloudflare Turnstile site key) |
| `TURNSTILE_SECRET_KEY` | Set (Cloudflare Turnstile secret key) |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL for project submit notifications |
| `RESEND_API_KEY` | Resend API key for client email on project go-live |
| `ANTHROPIC_ADMIN_KEY` | Anthropic Admin API key for usage reporting. Generate at console.anthropic.com under Settings > Admin API Keys. Requires admin role. |

## Supabase Setup

Run `/supabase/schema.sql` in the Supabase SQL editor to create all tables:

```sql
-- generated_pages: caches personalized pages keyed by visitor segment
CREATE TABLE generated_pages ( ... );

-- projects: user-owned projects (Session 1 migration)
CREATE TABLE projects ( ... );

-- RLS: users can only read/insert/update/delete their own projects rows
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own projects" ON projects FOR SELECT ...
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT ...
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE ...
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE ...

-- Session 7 migration (run in Supabase SQL editor):
ALTER TABLE projects ADD COLUMN IF NOT EXISTS green_offset_intent boolean DEFAULT false;

-- Session 8 migration (run in Supabase SQL editor):
ALTER TABLE projects ADD COLUMN IF NOT EXISTS claude_code_prompt text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS demo_url text; -- if not already present

-- Session 23 migration (run in Supabase SQL editor):
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_readme text;
```

See `/supabase/schema.sql` for the full definitions.

## Recent Changes (Session 38 — May 11, 2026)

**Impact tab added to admin dashboard**

`/app/admin/AdminDashboard.tsx`:
- Added `ImpactTab` import. Extended `activeTab` type to include `"impact"`. Added "Impact" to the tabs array. Renders `<ImpactTab />` when active.

`/app/admin/ImpactTab.tsx` (new file):
- Client component. On mount, fetches all rows from `/api/admin-usage-snapshots` (GET) and sums them for cumulative totals.
- Section A: "Sync from Anthropic" button, loading spinner in flight, inline red error on failure. "Last synced: [date]" or "Never synced" below.
- Section B: Two cards (desktop columns, stacked mobile). Left card (API Usage): input tokens, cache read tokens, output tokens, energy (Wh), water (ml); gray footer "Source: Anthropic Admin API". Right card (Claude.ai Chats): static estimates (50 sessions, 116 Wh, 17 ml); gray footer explaining subscription usage is not API-accessible, estimated from session count x 0.31 Wh (Epoch AI 2025).
- Combined Totals bar: total energy (measured + estimated), total water (measured + estimated), shower comparison (water_ml / 33 = seconds).
- Empty state: "No data yet. Click Sync to pull from Anthropic."

`/app/api/admin-usage-snapshots/route.ts` (new file):
- GET only. Admin email auth gate (same pattern as existing admin routes). Returns all rows from `wst_usage_snapshots` ordered by `snapshot_date DESC`.

`/app/api/admin-sync-usage/route.ts` (new file):
- POST only. Admin email auth gate.
- Returns 400 if `ANTHROPIC_ADMIN_KEY` is not set.
- Calls Anthropic Admin API: messages usage (30-day window, 1d buckets) and claude_code usage. Returns 502 on API failure.
- Sums all token counts across buckets and model_breakdown records.
- Computes `total_energy_wh` and `total_water_ml` using per-token Wh rates. Inserts one row to `wst_usage_snapshots`.
- Energy formula: (input*200 + cache_read*20 + cache_creation*25 + output*990 [for both api and claude_code]) / 1_000_000. Water: (energy_wh / 1000) * 0.15 * 1000.

**Supabase migration — run in SQL editor before testing:**
```sql
CREATE TABLE IF NOT EXISTS wst_usage_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  api_input_tokens bigint DEFAULT 0,
  api_cache_read_tokens bigint DEFAULT 0,
  api_cache_creation_tokens bigint DEFAULT 0,
  api_output_tokens bigint DEFAULT 0,
  claude_code_input_tokens bigint DEFAULT 0,
  claude_code_cache_read_tokens bigint DEFAULT 0,
  claude_code_output_tokens bigint DEFAULT 0,
  claude_code_sessions integer DEFAULT 0,
  total_energy_wh numeric DEFAULT 0,
  total_water_ml numeric DEFAULT 0,
  source text DEFAULT 'api',
  notes text,
  created_at timestamptz DEFAULT now()
);
```

---

## Recent Changes (Session 37 — May 11, 2026)

**New page: /impact + nav link**

`/app/impact/page.tsx` (new file):
- Static server component. No `"use client"`, no data fetching, no auth required. Publicly accessible.
- Dark background (`#080C14`), Playfair Display headlines, DM Sans body, teal and offwhite brand tokens. Matches site layout.
- Teal small-caps section label ("WHERE THE MONEY GOES"), large Playfair headline, two-paragraph intro at reduced opacity, teal divider.
- Four org cards (navy `#00205C` background, `2px solid #4B858E` top border): AI Now Institute, Distributed AI Research Institute (DAIR), Southern Environmental Law Center, Public Citizen Energy Program.
- Each card: org name (Playfair), meta line (location, status, founded year), teal tag pill, body paragraph, "WHAT THEY'VE DONE" label (small caps gray), wins paragraph. Copy verbatim as specified.

`/app/page.tsx` — nav only:
- Added "Impact" link (`href="/impact"`) after "Your Team & AI", before `AuthModal`. Identical teal ghost-pill style.

No API routes, Supabase schema, or other files modified.

**Follow-up: Learn more links added to /impact org cards**

Each of the four org cards now has a teal text "Learn more" link at the bottom opening the org's about page in a new tab. Links: AI Now Institute, DAIR, SELC, Public Citizen Energy Program.

---

## Recent Changes (Session 36 — May 8, 2026)

**Content rewrite of /your-team-and-ai + SEO metadata export**

`/app/your-team-and-ai/page.tsx`:
- Added `export const metadata` with new page title (`Your Team & AI — World Shift Technologies`) and new meta description per brand brief.
- Section 1 eyebrow unchanged. h2 updated: "Two mistakes, stacked." to "These are the two mistakes." Body paragraph rewritten around the "save money / make it easy" framing and team resistance dynamic.
- Section 2 opening paragraph rewritten to lead with the vision angle ("Vision doesn't come from a system. It comes from people."). New connector sentence added: "Here are the four things AI doesn't replace." Relationships paragraph ending updated to "human interaction." Critical thinking paragraph updated with new example about a long-time partner and explicit statement that "AI doesn't build that."
- Section 3 h2 updated: "More AI is not the answer." to "More AI isn't the answer." Body rewritten: environmental framing replaced with a precise/general-purpose AI contrast. New final paragraph on what the work requires.
- Section 4 eyebrow updated: "HOW TO ACTUALLY DO IT" to "HOW TO TAKE THE RIGHT STEPS." h2 updated: "Six steps. No acronyms." to "Take full accountability for your operations and processes." Intermediate "Practical steps..." paragraph removed. All six bold items rewritten: new content on operations inventory, role documentation, role redefinition, institutional knowledge, cutting waste, and measuring outcomes.
- Section 5 eyebrow updated: "WHEN THE QUESTION IS BIGGER THAN ONE TEAM" to "WHEN YOU'RE OPERATING AT ENTERPRISE SCALE." h2 updated: "If you're past 50 people." to "If you're enterprise." Body rewritten to open with "operating at enterprise scale" framing.
- Zero em-dashes in user-facing copy. Em-dash in the page title metadata and in code comments only.
- No layout, styling, component, or structural changes.

**SEO pass (Task 2) applied.** Updated titles and descriptions across three files:
- `app/layout.tsx` — default title and description (homepage + all pages without their own metadata export)
- `app/audit/page.tsx` — description updated; title kept
- `app/fractional/page.tsx` — metadata export added (was inheriting stale default)

---

## Recent Changes (Session 35 — May 8, 2026)

**New page: /your-team-and-ai + nav additions**

`/app/your-team-and-ai/page.tsx` (new file):
- Static server component. No client interactivity, no `"use client"`.
- 6 sections: Hero (eyebrow + H1 + subhead, no CTA), The Framing Most Companies Get Wrong, What Your Team Has That AI Doesn't, Less AI Used Precisely, How to Actually Do It, and a closing section with bottom CTA linking to `/audit`.
- Section 5 includes a POPin handoff: `<a href="https://www.popinrescue.com">POPin</a>` opens in a new tab.
- All body text on dark background uses `--color-offwhite` (`#F4F2EE`). Eyebrows are teal small caps. Headlines use Playfair Display via inline `style={{ fontFamily: 'var(--font-playfair)' }}`.
- No em-dashes anywhere. No reassurance language.
- Footer: centered single line, copyright only, no email link.

`/app/page.tsx` — nav only:
- Added "Your Team & AI" ghost-style link (matching Book a Call style) between "Book a Call" and the AuthModal block.

`/app/projects/page.tsx` — nav only:
- Added "Your Team & AI" ghost-style link before the user email + Sign Out cluster. Hidden on mobile (`hidden sm:inline-flex`).

No API routes, Supabase schema, wizard, or admin changes in this session.

---

## Recent Changes (Session 34b — May 8, 2026)

**Nav cleanup and dashboard action buttons**

`/app/page.tsx` — removed "Get an Audit" pill link from the homepage nav. Nav now shows only Book a Call + Log In / Get Started.

`/app/projects/page.tsx` — added "Get an Audit" (teal outlined) and "Start a New Project" (teal filled) as a button pair in the dashboard header, replacing the single "Start a New Project" button. Both links are wrapped in a flex container to keep them inline.

---

## Recent Changes (Session 34 — May 8, 2026)

**Slack notification on audit completion + Admin Audits tab**

`/app/api/notify-slack/route.ts` — extended to handle `type: "audit"`:
- New condition for `type: "audit"` formats: `🔍 New Audit: *[business_name]* — [business_type], [team_size]`, stack list, spend/waste score, and waste estimate range.
- Accepts: `business_name`, `business_type`, `team_size`, `monthly_spend_range`, `tools` (flat deduplicated array), `waste_score`, `estimated_monthly_waste_low`, `estimated_monthly_waste_high`.
- Existing `submission` and `resubmission` handling unchanged.

`/app/audit/AuditWizard.tsx` — fires Slack notification after audit report is confirmed:
- After `/api/generate-audit` returns successfully and report is set in state, fires fire-and-forget POST to `/api/notify-slack` with `type: "audit"`.
- Builds flat deduplicated `tools` array from `mergedTools` (all tools across all departments).
- Uses `data.waste_score`, `data.estimated_monthly_waste_low`, `data.estimated_monthly_waste_high` from the report.
- Does not await; fails silently; does not block the reveal state.

`/app/admin/AdminDashboard.tsx` — added Audits tab:
- New types: `AuditFinding`, `AuditReportData`, `AuditEstimate` (exported).
- New constants: `WASTE_SCORE_STYLES` (low/medium/high/critical badge styles), `IMPACT_TEXT` (finding impact colors).
- New state: `activeTab` (`'projects' | 'audits'`), `openAuditId` (detail panel toggle for audits).
- New prop: `auditEstimates: AuditEstimate[]`.
- Tab buttons (Projects / Audits) added below page title; active tab shows teal underline border.
- Audits tab renders a table: business name, business type + team size, waste score badge, estimated waste range, monthly spend, relative date, View toggle.
- Inline detail panel (two-column): left has audit summary (name, score badge, headline, waste estimate card, summary, findings sorted high-to-low, quick wins, environmental note + redirect estimate); right has stack details (departments, tools by department, AI usage flags, monthly spend).
- "Report not yet generated." muted centered fallback when `report` is null.
- "No audits yet." empty state matches existing projects empty state style.
- All existing Projects tab content, Incomplete section, status controls, prompt generation, and README block unchanged.

`/app/admin/page.tsx` — fetches audit estimates:
- After existing projects fetch, adds service role fetch from `audit_estimates` ordered by `created_at desc`.
- Maps result to `AuditEstimate[]`; passes as `auditEstimates` prop to `AdminDashboard`.
- Falls back to empty array if fetch fails or returns null.

---

## Recent Changes (Session 33 — May 7, 2026)

**AI waste estimate wizard at `/audit`**

`/app/audit/page.tsx` — server component, renders `AuditWizard`.

`/app/audit/AuditWizard.tsx` — 5-phase client wizard:
- Phase 1: business name, business type (pill select), team size (pill select, auto-advances)
- Phase 2: department checkbox grid (Operations, Sales, Marketing, Customer Support, Finance, HR, Product/Dev, Creative, Legal, Executive)
- Phase 3: per-department tool checkbox grid + free-text "other tools" field; loops through each selected dept
- Phase 4: AI usage toggles (deduplicated tool list) + monthly spend range pills
- Phase 5: 3s animated teal progress bar + cycling loading lines; reveals report card when both bar and API resolve
- Report card: waste score badge (low/medium/high/critical), waste estimate card (monthly $ range + hours), findings sorted high to low impact (max 6), quick wins list, environmental note with redirect estimate, CTA (Save My Report / Book a Call)
- Guest insert to `audit_estimates` (non-fatal if Supabase not configured); `auditId` threaded through to auth modal

`/app/audit/AuthModal.tsx` — signup/signin modal scoped to audit save:
- Props: `auditId`, `onSuccess`, `onClose`
- Mode toggle signup/signin; handles email confirmation state
- On session: calls `/api/attach-guest-audit` then fires `onSuccess`

`/app/api/generate-audit/route.ts` — POST handler:
- Reads `content/tool-registry.json` at request time; matches tools case-insensitively
- Builds per-tool context string (AI features, energy transparency, waste patterns, alternatives)
- Calls `claude-sonnet-4-6` with system prompt: "respond only with valid JSON, no preamble"
- Strips markdown fences before `JSON.parse`
- Updates `audit_estimates` row via service role (non-fatal if env vars missing)
- Returns parsed report JSON

`/app/api/attach-guest-audit/route.ts` — POST `{ auditId, userId }`:
- Service role UPDATE where `id = auditId AND guest = true AND user_id IS NULL`
- Returns 400 if row not found or already claimed

`/content/tool-registry.json` — ~80 tool entries:
- Shape: `{ id, name, vendor, category, department[], uses_ai, ai_features, pricing_model, typical_monthly_cost_usd, energy_transparency, environmental_notes, waste_patterns[], leaner_alternatives[] }`
- Covers: project management, automation, AI tools, CRM/sales, communication, Google Workspace, Microsoft, meeting intelligence, email marketing, social media, HR/payroll, finance/accounting, storage, dev/hosting, customer support, legal

**Supabase migration — run in SQL editor:**
```sql
-- Session 33 — audit_estimates table (see supabase/schema.sql for full definition)
CREATE TABLE IF NOT EXISTS audit_estimates ( ... );
ALTER TABLE audit_estimates ENABLE ROW LEVEL SECURITY;
-- + 3 RLS policies (see schema.sql)
```

**Homepage nav:** "Get an Audit" pill link added before "Book a Call" in `/app/page.tsx`.

---

## Recent Changes (Session 32 — May 7, 2026)

**Admin dashboard, Supabase schema, and homepage brand refresh**

`/app/admin/AdminDashboard.tsx` — client component (full project queue):
- Active projects: status badge, relative date, inline detail panel (scope doc + raw answers), status transitions (submitted → reviewed → approved → building → live), Claude Code prompt + README block (approved/live), demo URL editable input, Regenerate Prompt, Back to Review
- Incomplete section: collapsible, guest-only rows, scope + answers but no status controls
- `AdminProject` type with `claude_code_prompt`, `project_readme`, `demo_url`, `guest`, `scope` (3-tier pricing), `answers`

`/app/admin/page.tsx` — server component: JWT gate (drew@worldshifttech.com), service role fetch, email batch lookup, renders `AdminDashboard`.

`/supabase/schema.sql` — full schema file committed:
- `generated_pages`, `projects` (with all column migrations through project_readme), RLS policies
- Session 33 `audit_estimates` table and policies appended

---

## Recent Changes (Session 31 — May 4, 2026)

**Homepage copy refresh and wizard collapse to 6 questions / 3 chapters**

Copy-only and structural-only change. No API routes, Supabase schema, auth logic, styling, or layout components were modified.

`/app/page.tsx`:
- Hero headline: "Custom tools and AI, built precisely for your business." → "Finally — software that fits." (teal span on "software that fits.")
- Hero sub-headline: replaced with "Custom integrations, internal apps, and AI agents built to do exactly what your business needs. You own what I build."
- CTA button: "See What I'd Build For You" → "Let's Scope Out Your Solution"
- Sub-CTA: replaced with "Get an estimated scope of work in under 5 minutes."
- New "You've been here before." section inserted between hero and WHAT I BUILD strip; matches the existing `mt-20 pt-12 border-t border-white/[0.08]` pattern, no eyebrow, single body paragraph.
- Green by Design heading: "Precise tools cause less harm." → "Built Lean. Built Green."; body replaced with the lean-code / smaller-footprint copy. Eyebrow "GREEN BY DESIGN" unchanged.
- Three service card bodies were already correct from a prior session and were not modified.

`/app/projects/new/ProjectWizard.tsx`:
- Chapter array collapsed from 4 chapters / 12 questions to 3 chapters / 6 questions: `{ The Problem [1] }`, `{ The Vision [2, 3] }`, `{ The Build [4, 5, 6] }`.
- New questions render with new internal step numbers 1–6 but write to existing legacy field names so `/api/generate-scope` payload stays backward-compatible: Q1→`q3`, Q2→`q6`, Q3→`q8`, Q4→`q10` + `q10_other`, Q5→`q11`, Q6→`q12`.
- Q1 and Q2 are free-text required, 10+ chars to advance. Q3 and Q5 are single-select with click-to-advance. Q4 is multi-select (9 options including "Other" with text reveal). Q6 is optional free text and triggers "See Your Scope".
- Q4 options replaced specific tool names with category labels: CRM, email/marketing automation, project management, database/spreadsheet, communication tools, e-commerce/payments, accounting/finance, "No existing tools / starting fresh", Other.
- `CUSTOM_BUILD_OPTION` constant removed (no longer used). Removed-field values stay at `INIT` defaults (`""` or `[]`) so the legacy answers object shape is preserved end-to-end.
- `nextEnabled`, `next()` reveal trigger (q===6), Next button label switch (q===6 → "See Your Scope"), and chapter progress all updated to 1–6. Footer nav is now always visible (the Q1 auto-advance special-case was removed).
- All other logic preserved unchanged: Supabase insert (`projectId`, `user_id`, `guest`, full answers payload, `status: "draft"`), `/api/generate-scope` call, scope card reveal animation, submit flow, guest CTA + AuthModal flow, `/api/attach-guest-project` PATCH, Slack notification, progress bar.

`/WST_BRAND_COPY.md` (new file):
- Locked copy reference for hero, "You've been here before." section, three service cards, and Green by Design.
- Note that "nothing more" should be used sparingly — once per page maximum.

---

## Recent Changes (Session 30 — April 28, 2026)

**Fix demo URL not persisting in admin panel**

Root cause: `handleSaveDemoUrl` was calling `getSupabaseBrowser()` (anon key), which RLS blocks for admin writes on other users' project rows.

`/app/api/admin-update-demo-url/route.ts` (new file):
- PATCH endpoint; verifies Bearer token via anon client, rejects if not `drew@worldshifttech.com`
- Updates `projects.demo_url` and `updated_at` via `getSupabase()` (service role, bypasses RLS)
- Returns 400 on missing `projectId`, 403 on auth failure, 500 on Supabase error with message

`/app/admin/AdminDashboard.tsx`:
- `demoUrlSaveErrors: Record<string, string>` state added
- `handleSaveDemoUrl` rewritten: gets session token from browser client, then calls `fetch("/api/admin-update-demo-url")` with Bearer auth — same pattern as `handleStatusUpdate`
- `console.log('[DEMO URL SAVE]', projectId, url)` fires before the fetch
- `console.log('[DEMO URL SAVE ERROR]', msg)` fires on non-ok response or catch
- On failure: sets `demoUrlSaveErrors[projectId]`; local state and "Saved ✓" flash only update on success
- Inline red error message rendered below the Save button when `demoUrlSaveErrors[projectId]` is set

---

## Recent Changes (Session 29 — April 28, 2026)

**Demo URL shown on client-facing pages with "coming soon" fallback**

`/app/projects/[id]/ProjectDetailClient.tsx`:
- `demo_url: string | null` added to `ProjectProps` type and destructured
- Below the scope card (and Edit & Resubmit button), a `status === "live"` block renders: teal "View Your Demo →" button when `demo_url` is set, muted "Demo coming soon" text when `demo_url` is null

`/app/projects/[id]/page.tsx`:
- `demo_url={project.demo_url ?? null}` passed to `<ProjectDetailClient>`
- Existing server-rendered "live demo" section updated: was `live && demo_url` only; now shows "Demo coming soon" muted text when `live && !demo_url`

`/app/projects/ProjectList.tsx`:
- Desktop and mobile "View Demo →" link blocks both updated from `live && demo_url` guard to a ternary: link when `demo_url` is set, muted "Demo coming soon" span when null

---

## Recent Changes (Session 28 — April 28, 2026)

**Editable demo URL in admin panel (`/app/admin/AdminDashboard.tsx`)**

The read-only demo URL link in the Claude Code Prompt section has been replaced with an inline editable input.

- Input is always visible for `approved` and `live` projects (same condition as the prompt block), pre-filled with the current `demo_url` or empty with placeholder `https://your-vercel-url.vercel.app`
- Inline "Save" button PATCHes the new URL directly to the `projects` table via the Supabase browser client; updates local state immediately on success
- Button text cycles: "Save" → "Saving..." → "Saved ✓" (2s flash) → back to "Save"
- Three new state variables: `demoUrlDrafts` (per-project draft text), `savingDemoUrlIds`, `savedDemoUrlIds`
- New handler: `handleSaveDemoUrl(projectId, url)` — updates DB, local state, and confirmation flash; fails silently (no blocking error state)
- No other panel sections, status controls, or logic changed

---

## Recent Changes (Session 27 — April 28, 2026)

**Session permission lines added to prompt template (`/content/claude-code-prompt-template.md`)**

Opening lines updated in both the Prompt Structure section and the Example section at the bottom. Every generated Claude Code build prompt now begins with:

```
Yes, and don't ask again
Yes, allow all edits this session
```

This pre-answers Claude Code's permission prompts so sessions can run without interruption. No other content in the template was changed.

---

## Recent Changes (Session 26 — April 28, 2026)

**Richer Questions to Resolve in README generation (`/api/admin-update-status/route.ts`)**

`/app/api/admin-update-status/route.ts`:
- README generation user message updated: the `## Questions to Resolve` section instruction now explicitly directs Claude to derive questions from the scope, stack, integrations, and raw answers — covering credentials, existing tools, accounts, data sources, compliance requirements, and anything implied but unspecified. Always includes the three standard URLs (GitHub, Supabase, Vercel) plus 5–10 project-specific questions. Previously it listed only the three URLs and said "add any additional questions that cannot be answered from the scope alone," which produced thin output.
- No other logic, conditions, or strings changed.

---

## Recent Changes (Session 25 — April 28, 2026)

**Tighten build prompt and README generation in `/api/admin-update-status/route.ts`**

Two fixes to prevent Claude from defaulting to Next.js and OpenAI when generating prompts and READMEs for approved projects.

`/app/api/admin-update-status/route.ts`:
- Build prompt user message replaced with an explicit stack-enforcement version: React + Vite + Supabase + Vercel + Anthropic Claude API is the default; Next.js only if SSR or SEO is explicitly required; AI model is always Anthropic (Sonnet for user-facing, Haiku for utility), never OpenAI; companion docs (SETUP.md, schema.sql, CONTEXT.md, README.md, .env.local.example) explicitly required as numbered steps; no skeletons or TODOs allowed.
- README generation system prompt was previously hardcoded and ignored `claude-code-prompt-template.md` entirely. It now reads the same `template` variable already loaded for the build prompt and injects it as the system prompt, with the same stack-enforcement rules (React + Vite default, Anthropic Claude, no invented env vars or file paths).
- README generation user message simplified to match: instructs Claude to follow the template's README.md section exactly and apply the same stack and AI model defaults.
- No other logic, conditions, error handling, or DB writes changed.

---

## Recent Changes (Session 24 — April 28, 2026)

**Supabase session refresh proxy**

`/proxy.ts` (new file, replaces the failed middleware.ts attempt):
- Next.js 16 deprecated `middleware.ts` in favour of `proxy.ts`; exports a `proxy` function (Next.js checks `proxy` before `middleware`)
- Uses `createServerClient` from `@supabase/auth-helpers-nextjs` with `cookies: { getAll, setAll }` — `createMiddlewareClient` does not exist in this package version
- Intercepts every request (excluding `_next/static`, `_next/image`, `favicon.ico`) and calls `supabase.auth.getSession()`, which silently refreshes the JWT if it's about to expire and writes the updated cookie back in the response
- Without this, Next.js never refreshes the token server-side and the session dies during inactivity

`/lib/supabase.ts`:
- Added comment confirming `persistSession` defaults to true in `createBrowserClient` — no manual config needed
- `getSupabase()` (service role) unchanged

---

## Recent Changes (Session 23 — April 28, 2026)

**Project README generation alongside build prompt**

`/supabase/schema.sql`:
- Added `-- MIGRATION: project_readme` + `ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_readme text;` — run in Supabase SQL editor

`/content/claude-code-prompt-template.md`:
- Full replacement with the authoritative version. Hyperlinked .md filenames (e.g. `[SETUP.md](...)`) replaced with plain filenames. No structural changes.

`/app/api/admin-update-status/route.ts`:
- On `approved`: now fires a second Claude Sonnet call immediately after the build prompt call to generate a project README
- README system prompt instructs Claude to produce a 10-section orientation doc + "Questions to Resolve" section
- README call wrapped in try/catch — logs `[README GENERATION FAILED]`, sets `project_readme = null`, never blocks prompt generation
- Supabase update now saves both `claude_code_prompt` and `project_readme` in one call
- API response now includes `project_readme` alongside `claude_code_prompt` and `demo_url`

`/app/admin/page.tsx`:
- Select query extended to include `project_readme`
- `adminProjects` map extended to pass `project_readme` to `AdminDashboard`

`/app/admin/AdminDashboard.tsx`:
- `AdminProject` type: added `project_readme: string | null`
- Added `copiedReadmeId` state and `handleCopyReadme` handler (2s flip to "Copied ✓")
- `handleStatusUpdate` and `handleRegeneratePrompt`: both now update `project_readme` in local state from API response
- Detail panel: added "PROJECT README" block directly below the Claude Code Prompt section
  - Same teal small-caps label style as "CLAUDE CODE BUILD PROMPT"
  - Shows same loading skeleton as prompt while `isPromptLoading` is true
  - Scrollable monospace pre block (max 400px), same styling as prompt block
  - "Copy README" button; muted fallback text when `project_readme` is null or empty
  - Shown under same `approved || live` condition as the prompt block

---

## Recent Changes (Session 22 — April 28, 2026)

**Home page hero headline simplified (`/app/page.tsx`)**

Copy-only change. No layout, styling, colors, or structure modified beyond what the copy change required.

- Hero headline: removed second line and teal span; now reads as a single sentence: "Custom tools and AI, built precisely for your business."
- Subheadline, all three "What I Build" card titles and descriptions, and the "Green by Design" body paragraph were already correct from Session 21 and were not modified.

---

## Recent Changes (Session 21 — April 28, 2026)

**Home page copy updates (`/app/page.tsx`)**

Copy-only changes. No layout, styling, colors, or structure modified.

- Hero headline: "Built for your business, not for thousands of others." → "Custom tools and AI, built precisely for your business — not adapted from software designed for everyone else."
- Hero subheadline: "Custom tools, built on lean and green solutions." → "Custom tools and AI solutions built specifically for your business — get a precise tool within days, built lean on renewable infrastructure."
- "What I Build" card 1: title "Connections" → "Integrations"; description updated to explain integration value (manual handoffs, re-entry, workflow fragility).
- "What I Build" card 2: title unchanged ("Custom Apps"); description updated to emphasize ownership vs. renting off-the-shelf tools.
- "What I Build" card 3: title unchanged ("Precision Tools"); description updated to emphasize single-focus, lean, fast delivery.
- "Green by Design" body paragraph: replaced with copy explaining why mass-market software wastes resources and how custom-built tools cost less to run over time.

---

## Recent Changes (Session 20 — April 27, 2026)

**Project card mobile layout fix (`/app/projects/ProjectList.tsx`)**

Layout-only change. No colors, copy, or non-layout styles modified.

The normal card state (non-confirm) was restructured to use a responsive two-path layout:

- **Mobile (default):** outer div is `flex flex-col gap-2`. Title is full-width with no truncation (`sm:truncate` instead of always-truncate). Below the title, a mobile-only `flex flex-col gap-2 sm:hidden` section renders in this order: status badge (`self-start` so it stays pill-shaped), green score badge (if present, same), date, "View Demo →" link (if present, `min-h-[44px] flex items-center` for tap target), delete × button (`w-11 h-11`, already 44px).
- **Desktop (`sm:`):** outer div becomes `sm:flex-row sm:items-center sm:justify-between sm:gap-4`. The mobile stacked section is hidden (`sm:hidden`). A desktop-only `hidden sm:flex` right column renders delete × + status badge + green badge in the original order. "View Demo →" link and date are `hidden sm:inline-block` / `hidden sm:block` inside the title column, same as before.

The confirm/delete row was not changed.

---

## Recent Changes (Session 19 — April 27, 2026)

**Copy, pricing floors, and value-first pricing logic**

`/app/page.tsx`:
- Hero caption: "Takes 60 seconds." → "Takes about 2 minutes."
- Hero subheadline: "Custom tools that do exactly what you need, nothing more, nothing wasted." → "Custom tools, built on lean and green solutions."
- Layout, styling, and all other content unchanged.

`/content/pricing-intelligence.md`:
- Updated tier floors: MVP $2,000–$3,000, Polished $3,250–$6,000, Perfected $6,500–$10,500.
- Reframed the "How to Use" section so value-based reasoning is the primary driver. Claude is now instructed to start from the value the client signaled and price from that first, then verify against the floor — not the other way around.
- Updated the Builder Rate section to reflect the new floors.
- Updated all 8 industry baselines: MVP ranges now reflect the new floor; ranges that were below $2,000 have been raised. Each baseline now notes that value signals typically land well above the floor.
- Value Signal Multipliers reframed from additive-to-floor language to value-first language.

`/app/api/generate-scope/route.ts`:
- MVP floor in the example JSON schema raised from $1,500 to $2,000.
- Claude pricing instruction replaced with an explicit 3-step value-first process: (1) derive value from Q5 and Q6/Q9, (2) price from that value, (3) verify against the floor and raise only if needed. High-value projects (e.g., $50K/year saved) must price significantly above the floor even at MVP. No other logic, schema, or tier names changed.

---

## Recent Changes (Session 18 — April 27, 2026)

**Mobile readability and layout audit — 390px (iPhone 14 baseline)**

Layout-only changes. No copy, logic, colors, or non-layout styles were modified.

`/app/projects/page.tsx`:
- Header row (`"Your Projects"` + `"Start a New Project"` button): `flex justify-between` → `flex flex-wrap justify-between gap-y-3` so they stack on mobile instead of overflowing at ~378px combined width

`/app/projects/ProjectList.tsx`:
- Delete `×` button: `w-7 h-7` (28px) → `w-11 h-11` (44px) to meet minimum tap-target size
- Delete confirm-row "Delete" button: `py-1.5` → `py-2.5` (was ~26px height, now ~40px)
- Delete confirm-row "Cancel" button: `py-1.5` → `py-2.5` (same fix)

`/app/projects/new/ProjectWizard.tsx`:
- Chapter progress indicator: `gap-4` → `gap-2 sm:gap-4` so the four step labels don't truncate aggressively at 390px (each item had only ~73px)
- Footer nav "Back" button: `py-2` (37px) → `py-3` (45px) to meet tap-target minimum

`/app/projects/[id]/ProjectDetailClient.tsx`:
- Edit form actions row: `flex items-center gap-4` → `flex flex-wrap items-center gap-4` so "Regenerate Scope" + "Cancel" stack when the card's 278px inner content can't fit both (~302px combined)
- "Edit & Resubmit" button: `py-2.5` (41px) → `py-3` (45px) to meet tap-target minimum

`/app/admin/AdminDashboard.tsx`:
- Active project row date span: `flex-shrink-0` → `hidden sm:block flex-shrink-0` — frees ~61px for the title column on mobile (title was truncating to ~105px)
- Incomplete project row date span: same fix

`/app/components/AuthModal.tsx`:
- Close button: was 20×20px SVG with no padding → `w-11 h-11 flex items-center justify-center rounded-lg` (44px tap target) with hover background
- Tab buttons ("Log In" / "Sign Up"): `pb-3` only (~33px) → `pt-3 pb-3` (~45px) to meet tap-target minimum; active underline (`border-b-2 -mb-px`) unaffected

Not changed: `/app/for-you/[industry]/[solution]/page.tsx` — no issues found at 390px (nav logo 180px + button 104px = 284px fits in 326px content area; use-case grid correctly collapses to single column via `auto-fit minmax(260px,1fr)`).

---

## Recent Changes (Session 17 — April 27, 2026)

**Readability color pass — home page and all app pages**

Color-only changes. No layout, structure, copy, or logic was modified.

`/app/page.tsx`:
- "WHAT I BUILD" section label: gray → teal (`#4B858E`)
- Hero subheadline: gray → offwhite (`#F4F2EE`)
- "Takes 60 seconds." caption: gray → offwhite
- All three proof-strip card descriptions (Connections, Custom Apps, Precision Tools): gray → offwhite
- "GREEN BY DESIGN" body paragraph: gray → offwhite

`/app/projects/ProjectList.tsx`:
- "No projects yet" empty-state message: gray → offwhite

`/app/for-you/[industry]/[solution]/page.tsx`:
- "Save this page..." CTA caption: `--color-gray` → `--color-offwhite`

`/app/projects/[id]/ProjectDetailClient.tsx`:
- Tier descriptions (MVP / Polished / Perfected) in scope card: gray → offwhite
- `value_rationale` italic line: gray → offwhite
- `green_score_reason` caption: gray → offwhite
- "Your project scope is being prepared." empty state: gray → offwhite

`/app/admin/AdminDashboard.tsx`:
- "No projects yet." empty state: gray → offwhite
- Tier descriptions and `value_rationale` in both active and incomplete detail panels: gray → offwhite
- `price_rationale` fallback line: gray → offwhite
- "No scope generated yet." in both panels: gray → offwhite
- "No account created" subtext in incomplete rows: gray → offwhite

`/app/projects/new/ProjectWizard.tsx`:
- Question subtitles: gray → offwhite
- Tier descriptions and `value_rationale` in ThreeTierPricing: gray → offwhite
- "This will only take a moment." loading copy: gray → offwhite
- "Drew will review your scope..." confirmation copy: gray → offwhite
- `green_score_reason` caption in scope card: gray → offwhite
- `price_rationale` fallback line: gray → offwhite
- "Check your email to verify..." guest confirmation copy: gray → offwhite
- "No account needed — just pick a time." guest CTA caption: gray → offwhite

Intentionally kept gray: footer copyright, nav email/date meta, relative dates in table rows, "or" modal divider, form field labels, disabled/cancel button text, back-link navigation controls, chapter progress indicators, "Status:" label prefix, "Book a Call" nav link.

---

## Recent Changes (Session 16 — April 27, 2026)

**Move guest project attach to server-side OAuth callback**

`/app/auth/callback/route.ts`:
- After `exchangeCodeForSession`, reads `guestProjectId` from the incoming request cookies
- If present and a session user exists: uses service role client (`getSupabase()`) to UPDATE `projects` row (set `user_id`, `guest = false`), then UPDATE `status = 'submitted'`; fires fire-and-forget POST to `https://worldshifttech.com/api/notify-slack`; clears the cookie on the redirect response; logs `[GUEST PROJECT ATTACHED IN CALLBACK]` / `[GUEST PROJECT ATTACH FAILED IN CALLBACK]`
- If no `guestProjectId` cookie, skips all of the above and redirects normally

`/app/components/AuthModal.tsx` — `handleGoogleSignIn`:
- Changed from `window.localStorage.setItem('guestProjectId', ...)` to `document.cookie = \`guestProjectId=${guestProjectId};path=/;max-age=3600;SameSite=Lax\`` so the value is available server-side in the callback

`/app/projects/GuestProjectAttacher.tsx`:
- Removed all attach logic, polling, and localStorage references
- Now only: checks for `guestProjectId` cookie on mount; if found, clears it and calls `router.refresh()`; logs `[GUEST ATTACH HANDLED SERVER SIDE]`
- Acts as a defensive client-side cleanup in case the cookie wasn't cleared by the callback

---

## Recent Changes (Session 15 — April 27, 2026)

**Replace fixed delay with polling in GuestProjectAttacher.tsx**

`/app/projects/GuestProjectAttacher.tsx`:
- Replaced the fixed 800ms delay before `router.refresh()` with a polling loop: queries `projects` every 400ms (up to 10 attempts, 4s max) until the row is visible to the current user with `status = "submitted"`, then refreshes; falls through to refresh anyway if it never appears

---

## Recent Changes (Session 14 — April 27, 2026)

**Auto-submit project after guest account creation**

`/app/projects/GuestProjectAttacher.tsx` (Google OAuth path):
- After a successful `/api/attach-guest-project` call: PATCHes `status = "submitted"` via `getSupabaseBrowser()`, logs `[GUEST PROJECT SUBMITTED]`, fires fire-and-forget POST to `/api/notify-slack` with `type: "submission"`, then waits 800ms before `router.refresh()`

`/app/projects/new/ProjectWizard.tsx` (email/password signup path):
- `onSignupSuccess` handler: after a successful attach, PATCHes `status = "submitted"` via `getSupabaseBrowser()`, fires fire-and-forget POST to `/api/notify-slack` with `type: "submission"`; both steps only run if the attach call returns ok; Slack call is not awaited; `setGuestAttached(true)` still fires regardless

---

## Recent Changes (Session 13 — April 27, 2026)

**Fix guest project attach timing on /projects page**

`/app/projects/GuestProjectAttacher.tsx`:
- After a successful attach, added an 800ms delay before `router.refresh()` so the session has time to fully persist before the server component re-renders and fetches the project list
- `AuthListener.tsx` was not modified — that file does not exist in this project

---

## Recent Changes (Session 12 — April 27, 2026)

**Supabase OAuth callback route**

`/app/auth/callback/route.ts` — new route handler:
- Reads `code` from the query string (set by Supabase after Google OAuth consent)
- Exchanges it for a session via `supabase.auth.exchangeCodeForSession(code)`
- Redirects to `https://worldshifttech.com/projects`

`/app/components/AuthModal.tsx`:
- `redirectTo` in `signInWithOAuth` updated from `https://worldshifttech.com/projects` to `https://worldshifttech.com/auth/callback`

**Manual step (Supabase Dashboard):**
- Authentication → URL Configuration → Redirect URLs: add `https://worldshifttech.com/auth/callback`

---

## Recent Changes (Session 11 — April 27, 2026)

**Google OAuth in AuthModal + guest project attach via OAuth redirect**

`/app/components/AuthModal.tsx`:
- New optional prop: `guestProjectId?: string`
- Added `getSupabaseBrowser` import
- Google OAuth button added above email/password fields in both Login and Sign Up tabs: white background, inline Google "G" SVG, "Continue with Google" label
- "or" divider between Google button and email/password form
- `handleGoogleSignIn`: if `window.localStorage.getItem('guestProjectId')` is not set and `guestProjectId` prop is provided, writes it to localStorage before firing OAuth; then calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'https://worldshifttech.com/projects' } })`

`/app/projects/new/ProjectWizard.tsx`:
- `guestProjectId={projectId}` prop passed to AuthModal when opened from the guest reveal state ("Create an Account to Save Your Scope" button)

`/app/projects/GuestProjectAttacher.tsx` — new client component:
- Mounts on `/projects` page; runs a `useEffect` on mount
- Reads `localStorage.guestProjectId`; if present, calls `getSupabaseBrowser().auth.getUser()`
- If user found: POSTs to `/api/attach-guest-project` with `{ projectId, userId }`; logs `[GUEST PROJECT ATTACHED]` on success / `[GUEST PROJECT ATTACH FAILED]` on failure; calls `router.refresh()` on success
- If no user: clears localStorage anyway
- Always clears localStorage in `finally` block; fails silently (no UI error)

`/app/projects/page.tsx`:
- Imports and renders `<GuestProjectAttacher />` above `<ProjectList>`; runs after server-side auth is confirmed (unauthenticated visitors are already redirected before the component tree renders)

---

## Recent Changes (Session 10 — April 27, 2026)

**Status flow corrected (admin)**

Correct order: `draft → scoped → submitted → reviewed → approved → building → live`

`/admin/AdminDashboard.tsx`:
- `STATUS_TRANSITIONS` updated: `submitted → reviewed → approved → building → live` (was wrong: `reviewed → building → approved`)
- Transition button labels: "Mark Reviewed" / "Approve" / "Mark Building" / "Mark Live"
- `resubmitted` status added to transitions: treated as re-entering at reviewed ("Mark Reviewed")
- Optimistic rollback on `approved` failure now rolls back to `reviewed` (was `building`)
- No change to Claude Code prompt generation — still fires at `approved`; "← Back to Review" still shown at `approved`

**`resubmitted` status badge**

- `AdminDashboard.tsx` — `resubmitted` added to `STATUS_BADGE` (purple/violet)
- `ProjectList.tsx` — `resubmitted` added to `STATUS_STYLES` (purple/violet, label "Resubmitted")
- `/projects/[id]/page.tsx` — `resubmitted` added to `STATUS_STYLES`

**Inline edit and resubmit on `/projects/[id]`**

`/app/projects/[id]/ProjectDetailClient.tsx` — new client component:
- Renders the scope card and (when status is not `building` or `live`) an "Edit & Resubmit" button below it
- Clicking "Edit & Resubmit" replaces the scope card with an inline edit form showing all 12 wizard questions pre-populated from `project.answers`
  - Q1: radio buttons (7 options) + conditional textarea for custom build description
  - Q2: radio buttons (4 options)
  - Q3, Q6, Q9, Q12: textareas
  - Q4, Q5 (value_signals): checkboxes (5 and 7 options)
  - Q7, Q8, Q11: radio buttons (3, 4, 3 options)
  - Q10: checkboxes (8 options) + conditional "Other" text input
- "Regenerate Scope" (teal filled) triggers the regeneration flow
- "Cancel" restores scope card view, discards edits

**Regenerate scope flow** (wired in `ProjectDetailClient.tsx`):
1. Shows pulsing skeleton (same style as AdminDashboard skeleton)
2. PATCHes updated `answers` jsonb to Supabase via browser client
3. POSTs to `/api/generate-scope` with updated answers and existing project id
4. PATCHes `status = "resubmitted"` to Supabase
5. Fires POST to `/api/notify-slack` with `type: "resubmission"` (fire and forget)
6. Replaces skeleton with updated scope card
7. Shows "Scope updated and resubmitted." confirmation in teal above the scope card
8. On failure: logs to console, shows inline error message

`/app/projects/[id]/page.tsx`:
- Select query extended to include `answers`
- Scope card section replaced with `<ProjectDetailClient ...>`; nav/title/date/demo link remain server-rendered

**`/api/notify-slack` — resubmission message type**

- New optional `type` field: if `"resubmission"`, formats as `🔄 Resubmission: *[title]* — [email] — https://worldshifttech.com/admin`
- Default (absent or other) uses existing submission format unchanged

---

## Recent Changes (Session 9 — April 27, 2026)

**Home page footer email removed (`/app/page.tsx`)**
- `drew@worldshifttech.com` mailto link removed from the footer
- Copyright line remains; footer layout simplified to centered single line

---

## Recent Changes (Session 8 — April 27, 2026)

**Home page CTA updated (`/app/page.tsx`)**
- "See What I'd Build For You" button `href` changed from `/meet` to `/projects/new`
- `/meet` and the old personalization flow remain untouched

---

## Recent Changes (Session 7 — April 27, 2026)

**Guest wizard flow — unauthenticated users can now complete the full wizard**

`/projects/new/page.tsx` — auth redirect removed; passes `isGuest={!session}` to `ProjectWizard`

`ProjectWizard.tsx`:
- Accepts `isGuest: boolean` prop
- Guest insert: `user_id: null, guest: true` (requires RLS guest insert policy — run migration in Supabase SQL editor)
- Scope generation and scope card display unchanged for guests
- Scope card bottom: guest users see "Your scope is ready..." copy + two CTAs (Create Account teal filled, Book a Call teal outlined + "No account needed" caption) instead of Submit button
- No Slack notification for guests
- `onSignupSuccess` handler fires PATCH to `/api/attach-guest-project`, then shows inline confirmation (checkmark, "Your scope is saved.", verify email note, secondary Book a Call link)

`AuthModal.tsx`:
- New optional props: `onSignupSuccess?: (userId: string) => void`, `openSignupOnMount?: boolean`, `hideTriggers?: boolean`
- When `onSignupSuccess` provided and signup succeeds: calls it with `userId` and returns (skips router.push to /projects)
- `openSignupOnMount`: auto-opens in signup tab on mount
- `hideTriggers`: hides nav buttons (Log In / Get Started) — used when modal is embedded inside ProjectWizard
- All existing home page usage unchanged (no props = same behavior)

`/api/attach-guest-project/route.ts` — new PATCH endpoint (service role, no auth check, row-level conditions as protection)

**Supabase migration (run in SQL editor):**
```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS guest boolean DEFAULT false;
CREATE POLICY "Guest project insert allowed" ON projects FOR INSERT WITH CHECK (guest = true AND user_id IS NULL);
```

**Admin — Incomplete section (`/admin/AdminDashboard.tsx`, `/admin/page.tsx`)**
- `AdminProject` type: `user_id` is now `string | null`, new `guest: boolean` field
- `admin/page.tsx`: adds `guest` to select query; null user_ids filtered from email batch lookup; guest rows get `userEmail: "Guest"`
- Active project list: excludes guest rows
- Collapsible Incomplete section after the active list: collapsed by default, count in label, shows title / "No account created" / incomplete badge / date / View toggle; detail panel has full scope + answers but no status controls

---

## Recent Changes (Session 6 — April 27, 2026)

**`/projects/[id]` — project detail page (new file: `/app/projects/[id]/page.tsx`)**
- Protected server component: auth check via anon client, project fetch via service role with `user_id` filter
- Displays title, status badge, created date, full scope card (3-tier pricing or flat fallback), Energy Footprint badge + reason, teal "View Your Demo →" button for live projects with a `demo_url`
- Draft/unscoped projects show a muted placeholder in place of the scope card
- No new shared files created

**Project cards linked to detail page (`/projects/ProjectList.tsx`)**
- Outer card `<div>` replaced with `<Link href="/projects/[id]">` — entire card is now a tap target
- Delete button (× and confirm-row) uses `e.preventDefault()` to suppress navigation; "View Demo →" anchor uses `e.stopPropagation()`
- Card layout, badge styles, and delete flow unchanged

---

## Recent Changes (Session 5 — April 27, 2026)

**"I already know what I want to build." option added to Q1 (`/projects/new/ProjectWizard.tsx`)**
- Q1 now has 7 options. Options 1–6 retain click-to-auto-advance behavior.
- Option 7 ("I already know what I want to build.") highlights as selected on click and reveals an inline textarea below the card grid immediately on selection.
- Textarea placeholder: "Describe it in one to two sentences." Footer nav (Back / Next) appears when this option is selected. Next button requires 10+ characters before enabling.
- Value stored as `custom_build_description: string` in `Answers`, `INIT`, Supabase insert, and `/api/generate-scope` fetch body.
- Selecting any of the other 6 cards after option 7 hides the textarea and clears `custom_build_description`.
- No other questions, chapters, or wizard behaviors changed.

---

## Recent Changes (Session 4 — April 27, 2026)

**Q5 value signals question added to wizard (`/projects/new/ProjectWizard.tsx`)**
- New Q5 inserted after Q4 in Chapter 2 ("The Pain"): "If this tool worked perfectly, what would it mean for your business?"
- Multi-select, 7 options, minimum 1 required to advance
- Stored as `value_signals: string[]` in the Supabase answers column and passed to `/api/generate-scope`
- Old Q5–Q11 renumbered Q6–Q12 throughout (types, INIT, CHAPTERS, QuestionView, nextEnabled, footer nav, Supabase insert, fetch body)
- Total wizard questions: 11 → 12

**3-tier pricing in scope generation (`/api/generate-scope/route.ts`)**
- Reads `/content/pricing-intelligence.md` at request time and injects it into the Claude prompt
- Claude now generates a `pricing` object with MVP / Polished / Perfected tiers (low, high, description per tier) plus `value_rationale`
- `price_low` / `price_high` still populated from `pricing.mvp` for backwards compatibility with existing downstream code

**Pricing intelligence content file (`/content/pricing-intelligence.md`)**
- New file: builder rate, MVP floor, value signal multipliers keyed to Q5 options, industry baselines for 8 sectors

**3-tier pricing display in wizard scope card (`/projects/new/ProjectWizard.tsx`)**
- Investment Estimate section replaced with MVP / Polished / Perfected rows showing tier name, price range, and description
- `value_rationale` rendered in gray italic below the three tiers
- Graceful fallback to flat `price_low`–`price_high` range for older projects without `pricing` field

**3-tier pricing display in admin panel (`/admin/AdminDashboard.tsx`)**
- Same 3-tier layout in the inline detail panel scope doc
- `ScopeData` type extended with optional `pricing` field
- `Q_LABELS` updated to new answer keys (`value_signals`, Q6–Q12, `q10_other`)
- Graceful fallback to flat range for older projects

**Not changed:** chapter labels, chapter count, all other question text, wizard behavior, reveal animation, submission flow, Slack notification, Supabase schema, admin status controls, Claude Code prompt generation.

---

## Recent Changes (Session 3 — April 26, 2026)

**Home page copy update (`/app/page.tsx`)**
- Strip label updated from "DOCUMENTED RESULTS FROM REAL IMPLEMENTATIONS" to "WHAT I BUILD"
- Card 1: "Connections" / "Between the tools you already use, so your business finally talks to itself."
- Card 2: "Custom Apps" / "Built from scratch around your idea, your workflow, your team."
- Card 3: "Precision Tools" / "Small, focused, and built to handle exactly what you've been doing manually."

**Not changed:** card layout, styling, component structure, all other sections.

---

## Recent Changes (Session 2 — April 26, 2026)

**Home page copy update (`/app/page.tsx`)**
- Hero eyebrow label updated from "DREW GRIFFITHS / WORLD SHIFT TECHNOLOGIES" to "BUILT LEAN. BUILT GREEN."
- Lean/green section heading updated to: "Precise tools cause less harm."
- Lean/green section body copy updated with approved text (fewer API calls, leaner models, renewable infrastructure framing)
- Eyebrow label in lean/green section unchanged: "GREEN BY DESIGN"

**Not changed:** layout, styling, spacing, proof strip, CTA, headshot, nav, footer.

---

## Recent Changes (Session 1 — April 26, 2026)

**Home page copy update (`/app/page.tsx`)**
- Hero headline updated to: "Built for your business, not for thousands of others."
- Hero subheadline updated to: "Custom tools that do exactly what you need, nothing more, nothing wasted." (em-dash replaced with comma per copy rules)
- Retired: old headline ("The Tools Your Business Has Been Missing.") and old subheadline ("Your team runs the business. I build the automations and AI agents that handle the rest...")
- Added lean/green section between proof strip and footer: "Built lean. Built green." with approved body copy; styled with teal label, Playfair h2, navy background, consistent padding

**Not changed:** proof strip stats, CTA button text/color/layout, headshot, nav, footer, font sizes, component structure.

---

## Next Tasks

- Run `wst_usage_snapshots` migration in Supabase SQL editor (Session 38)
- Add `ANTHROPIC_ADMIN_KEY` to Vercel env vars before testing the Sync button (Session 38)
- Build public `/impact` page using `wst_usage_snapshots` data alongside `redirect_donations` totals (Session 38)
- Merge branch to main and deploy to production at worldshifttech.com
- Add "attach guest audit" logic to Google OAuth callback (parallel to guest project attach in `/auth/callback/route.ts`)
- Add audit estimates to the authenticated client dashboard at `/projects` so logged-in users can view their saved audits
- Build out Client Profile management UI in admin (add, edit, view clients)
- Build out AI Tools Registry management UI in admin (add, edit, verify tools)
- Seed more tools into `content/tool-registry.json`
- Add Slack notification when a guest attaches an audit after account creation
- Research and select verified environmental program partners for The Redirect
- Visual polish pass on `/for-you/[industry]/[solution]`

## Architecture

```
/app
  /page.tsx                          — Home (personal intro, Drew photo, CTA → /meet)
  /fractional/page.tsx               — ClickUp consultant directory landing page (static)
  /your-team-and-ai/page.tsx         — Static editorial page: team vs AI positioning, 6 sections, POPin handoff
  /impact/page.tsx                   — Static public page listing the four AI accountability orgs WST donates to. No auth, no data fetching.
  /meet/page.tsx                     — Question flow (4 Qs, stores wst_visitor cookie)
  /for-you/page.tsx                  — Loading state → POSTs to /api/personalize → redirects
  /for-you/[industry]/[solution]/    — Personalized result (pulled from Supabase)
  /projects/page.tsx                 — Authenticated dashboard (server: auth + data fetch)
  /projects/GuestProjectAttacher.tsx — Client component: attaches guest project after OAuth redirect
  /projects/ProjectList.tsx          — Client component: project cards with inline delete
  /projects/[id]/page.tsx            — Project detail page (protected server component)
  /projects/[id]/ProjectDetailClient.tsx — Client component: scope card, inline edit form, regenerate flow
  /projects/new/page.tsx             — Auth guard, renders ProjectWizard
  /projects/new/ProjectWizard.tsx    — Client component: 6-question wizard + reveal state
  /auth
    /callback/route.ts               — OAuth callback: exchange code for session, redirect to /projects
  /components
    /AuthModal.tsx                   — Login/Signup modal + nav trigger buttons (client)
    /SignOutButton.tsx               — Sign out button (client)
  /admin
    /page.tsx                        — Server component: JWT gate (drew@worldshifttech.com), data fetch (projects + audit_estimates)
    /AdminDashboard.tsx              — Client component: Projects tab (project table, detail panel, status controls) + Audits tab (audit estimates table, stack breakdown)
  /api
    /personalize/route.ts            — Classify → cache check → generate → save → return
    /generate-scope/route.ts         — Claude scope generation for wizard; updates projects row
    /notify-slack/route.ts           — Posts Slack notification on project submit, resubmit, or audit completion (type: "submission" | "resubmission" | "audit")
    /admin-update-status/route.ts    — PATCH: verifies admin session, updates status; on approved: generates demo URL + Claude Code prompt
    /notify-client/route.ts          — POST: sends Resend email to project owner when status → live
    /attach-guest-project/route.ts   — PATCH: attaches a guest project row to a newly created user account
    /ingest-case-study/route.ts      — Zapier webhook for content pipeline
    /admin-usage-snapshots/route.ts  — GET: returns all wst_usage_snapshots rows (admin auth)
    /admin-sync-usage/route.ts       — POST: pulls token data from Anthropic Admin API, inserts snapshot (admin auth)
/content
  /case-studies/                     — 6 markdown files
/lib
  /case-studies.ts                   — Reads and concatenates case study files
  /supabase.ts                       — getSupabase() (service role) + getSupabaseBrowser() (anon)
  /auth.ts                           — getSession, getUser, signIn, signUp, signOut helpers
/supabase
  /schema.sql                        — Source of truth for DB schema
```
