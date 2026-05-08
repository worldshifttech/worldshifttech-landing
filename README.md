# World Shift Technologies — Landing App

Next.js marketing site at worldshifttech.com. AI audit platform with a planetary impact component. Visitors land on the homepage and can run a free AI waste estimate at `/audit`.

## Dev

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Required in `.env.local` (dev) and Vercel dashboard (prod):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=               # Already set in Vercel
```

---

## Build Status

- [x] Next.js scaffold deployed to Vercel
- [x] GitHub repo connected
- [x] ANTHROPIC_API_KEY set in Vercel env
- [x] Brand fonts (Playfair Display, DM Sans) and CSS variables configured
- [x] `/` — Homepage with new WST brand positioning and "Get an Audit" nav link (Session 32 / 33)
- [x] `/meet` — two-question conversational flow, cookie write, redirect
- [x] `/for-you` — skeleton placeholder (reads `wst_visitor` cookie)
- [x] `/admin` — admin dashboard with Projects and Clients tabs (Session 32)
- [x] `/audit` — 5-phase AI audit wizard + Claude report generation (Session 33)
- [x] `/api/generate-audit` — Claude-powered audit report route (Session 33)
- [x] `/api/attach-guest-audit` — links guest audit to user after signup (Session 33)
- [ ] `/api/personalize` — Claude API personalization route for /for-you
- [ ] `/for-you` — wire real Claude response into the page
- [ ] Case study markdown files in `/content/case-studies/`
- [ ] `/api/ingest-case-study` — Zapier webhook for content pipeline

---

## Recent Changes

### Session 33
- Built `/audit` — 5-phase AI audit wizard (business info, departments, tool selection, AI usage, report)
- Built `/api/generate-audit` — reads `content/tool-registry.json`, calls `claude-sonnet-4-6`, returns structured waste estimate report JSON, persists to `audit_estimates` via service role
- Built `/api/attach-guest-audit` — POST `{ auditId, userId }` links guest audit row to authenticated user
- Created `app/audit/AuthModal.tsx` — signup + signin modal, attaches audit on success
- Created `content/tool-registry.json` — knowledge base with ~80 tools: waste patterns, leaner alternatives, energy transparency, AI features, typical cost
- Added `audit_estimates` migration to `supabase/schema.sql`
- Added "Get an Audit" nav link to homepage
- Installed `@supabase/supabase-js` and `@anthropic-ai/sdk`
- Created `lib/supabase.ts` — browser client + service role client

### Session 32
- Rebuilt homepage (`/`) with new positioning: AI audit platform with planetary redirect
- Added `/admin` route with `AdminDashboard.tsx`, Projects and Clients tabs
- Created `supabase/schema.sql` with `clients`, `ai_tools_registry`, `client_tool_usage` migrations

---

## Next Tasks

- Run `audit_estimates` migration in Supabase SQL editor
- Add Supabase env vars to Vercel dashboard (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Add audit estimates tab to admin dashboard so Drew can review submitted audits
- Add "attach guest audit" logic to Google OAuth callback (parallel to guest project attach)
- Build out the full paid audit view inside the authenticated client dashboard
- Seed more tools into `content/tool-registry.json` (Drew reviews and expands manually)
- Add Slack notification when a guest completes an audit
- Calibrate Claude waste estimate pricing against real SMB tool costs
- Build out Client Profile management UI in admin (add, edit, view clients)
- Build out AI Tools Registry management UI in admin (add, edit, verify tools)
- Build client tool usage intake form (manual entry to start)
- Research and select verified environmental program partners for The Redirect
- Wire `/api/personalize` Claude API route + connect to `/for-you`

---

## Architecture

```
/app
  /page.tsx              — Home (new brand positioning, audit + book a call nav)
  /meet/page.tsx         — Question flow (2 Qs, stores wst_visitor cookie)
  /for-you/page.tsx      — Personalized result (Claude-generated, skeleton)
  /audit
    /page.tsx            — Audit entry point (server component)
    /AuditWizard.tsx     — 5-phase wizard + report reveal (client component)
    /AuthModal.tsx       — Signup / signin modal for saving report
  /admin
    /page.tsx            — Admin entry point
    /AdminDashboard.tsx  — Projects + Clients tabs
  /api
    /generate-audit/route.ts      — Claude audit report generation
    /attach-guest-audit/route.ts  — Link guest audit to authenticated user
    /personalize/route.ts         — Claude personalization for /for-you (TODO)
    /ingest-case-study/route.ts   — Zapier webhook (TODO)
/content
  /tool-registry.json    — Static knowledge base (~80 tools with waste patterns)
  /case-studies/         — Markdown files (TODO)
/lib
  /supabase.ts           — Browser client + service role client
  /case-studies.ts       — Parse case study files (TODO)
  /claude.ts             — Claude API wrapper (TODO)
/supabase
  /schema.sql            — All table definitions; run migrations manually in Supabase SQL editor
```

---

## Supabase Setup

Run each migration block in `supabase/schema.sql` manually via the Supabase SQL editor. Migrations are labeled and should be run in order.

| Migration | Table | Purpose |
|---|---|---|
| `clients_table` | `clients` | One row per client, linked to auth.users |
| `ai_tools_registry` | `ai_tools_registry` | WST database of AI tools and SaaS products |
| `client_tool_usage` | `client_tool_usage` | Per-tool usage tracking per client per period |
| `audit_estimates` (Session 33) | `audit_estimates` | Guest and user audit wizard submissions with generated reports |

All tables: RLS enabled, admin-only write access via `drew@worldshifttech.com`, `uuid DEFAULT gen_random_uuid()` primary keys.

`audit_estimates` also has user-level SELECT and guest INSERT policies so visitors can submit without an account.
