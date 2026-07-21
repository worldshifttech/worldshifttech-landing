Curriculum content files are in /content/curriculum/ — read them directly, do not use subagents.

# World Shift Technologies — Landing App

Next.js marketing site at worldshifttech.com. Personalized front door: visitors answer 4 questions, Claude generates a custom page based on Drew's case study library.

**Companion docs — read these before touching copy or design:**
- `CLAUDE.md` — project bible (brand, positioning, messaging, architecture, what NOT to do)
- `WST_BRAND_GUIDE_2026.md` — brand colors, fonts, tone
- `AGENTS.md` — Next.js version warnings (read before writing any framework code)

---

## Session Modes

Always read this README and NOTES.md before doing anything else.

### Planning Mode
Triggered when Drew opens with: "Planning session" or "Let's plan [feature/fix]"

- Read README.md, NOTES.md, and any files relevant to the scope being discussed
- Do not write, edit, or create any files
- Do not run any commands
- Ask clarifying questions if scope is ambiguous
- End the session by outputting a complete build prompt using the structure below
- The build prompt is the only output that matters — make it copy-paste ready

**Build prompt output format:**

```
Read README.md and NOTES.md first, then read [specific files] before touching anything.
Session [N] — [Short title]
What we're building: [One paragraph. Goal, not steps.]
1. [Change name] — [Files to touch. Expected behavior. What NOT to touch.]
2. [Change name] — [Same pattern.]
Before deploying, update:
* README.md — [what changed]
* NOTES.md — [session notes, gotchas, decisions]
Output all SQL at the end for Drew to paste into Supabase. Deploy with `vercel --prod` when done.
```

### Build Mode
Triggered when Drew pastes a build prompt directly.

- Execute the prompt exactly as written
- Read every file listed before touching anything
- Do not re-plan or suggest alternatives unless something is broken
- Flag anything that could break production before proceeding
- Follow the documentation update block at the end — no exceptions
- Deploy with `vercel --prod` when the prompt says to

> Session number: pull from `Last session: N` in NOTES.md — do not guess.

---

## Copy Rules

- No em-dashes anywhere in user-facing copy (no `—`, `&mdash;`, or `&#8212;`). Use a comma, period, or restructure the sentence.
- No reassurance language. Do not use "free", "no pitch", "no pressure", or any phrase that tries to convince a hesitant visitor. Assume the visitor is already interested.
- Lead with outcomes, not technology.
- No corporate jargon. Tone: direct, warm, founder-led.

---

## Deploy

Primary workflow is **git push → Vercel auto-deploys to production**. Local dev is occasional, not the norm.

```bash
# Explicit production deploy
vercel --prod

# Local dev (when needed)
npm run dev  # http://localhost:3000
```

---

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS v4 + PostCSS
- **Database/Auth:** Supabase (PostgreSQL + Row Level Security)
- **AI:** Anthropic SDK v0.90 — model `claude-sonnet-4-20250514`
- **Email:** Resend
- **Bot protection:** Cloudflare Turnstile
- **Hosting:** Vercel (auto-deploy on push)

> **Important:** This is Next.js 16 — APIs and conventions differ from training data. Read `AGENTS.md` before writing any Next.js code.

---

## Build Status

- [x] Next.js scaffold deployed to Vercel
- [x] GitHub repo connected
- [x] All Vercel environment variables set (see table below)
- [x] Brand fonts (Playfair Display, DM Sans) and CSS variables configured
- [x] `/meet` — 4-question conversational flow, cookie write, redirect
- [x] Personalization system — `/api/personalize`, `/for-you/[industry]/[solution]`, Supabase cache
- [x] Bot protection — honeypot + Cloudflare Turnstile on `/meet` + `/api/personalize`
- [x] `/fractional` — static ClickUp consultant landing page
- [x] Supabase Auth — login/signup modal, `/projects` dashboard, RLS policies
- [x] `/projects/new` — 3-chapter, 6-question project wizard with scope reveal
- [x] `/api/generate-scope` — Claude scope generation with 3-tier pricing
- [x] `/content/pricing-intelligence.md` — pricing context injected into scope generation
- [x] `/admin` — Drew-only project queue with status controls, prompt + README generation
- [x] `/api/admin-update-status` — admin PATCH with Claude build prompt + README generation
- [x] `/content/claude-code-prompt-template.md` — canonical Claude Code prompt template
- [x] `/api/notify-client` — Resend email to project owner on go-live
- [x] `/audit` — 5-phase AI waste estimate wizard
- [x] `/api/generate-audit` — Claude audit report with tool-registry knowledge base
- [x] `content/tool-registry.json` — ~80 tool knowledge base with waste patterns
- [x] Audit knowledge base — 22 tool-specific markdown files in `/content/audit-knowledge/`
- [x] `/your-team-and-ai` — static editorial page
- [x] `/impact` — static AI accountability org page
- [x] Curriculum platform — 6 tables, seed data (6 domains, 25 modules, 100 lessons, 25 assessments)
- [x] Curriculum learner UI — `/curriculum`, `/curriculum/[domain]/[module]/[lesson]` with progress tracking
- [x] Homepage V4 copy
- [x] `/ai-agent-setup` — static campaign landing page
- [x] `/privacy` — Privacy Policy static page
- [x] `/terms` — Terms and Conditions static page
- [ ] Run `audit_estimates` migration in Supabase SQL editor (Session 33)
- [ ] Visual polish pass on `/for-you/[industry]/[solution]`
- [ ] `/api/ingest-case-study` — Zapier webhook for case study pipeline

---

## Vercel Environment Variables

| Variable | Status |
|---|---|
| `ANTHROPIC_API_KEY` | Set |
| `NEXT_PUBLIC_SUPABASE_URL` | Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Set |
| `SUPABASE_SERVICE_ROLE_KEY` | Set |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Set |
| `TURNSTILE_SECRET_KEY` | Set |
| `SLACK_WEBHOOK_URL` | Set |
| `RESEND_API_KEY` | Set |
| `ANTHROPIC_ADMIN_KEY` | Set |

---

## Supabase

Run `/supabase/schema.sql` in the Supabase SQL editor to create all tables and RLS policies.
See NOTES.md for per-session migration SQL history.
