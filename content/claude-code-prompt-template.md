# Claude Code Prompt Template
*Used by /api/admin-update-status to generate build prompts for approved WST App Builder projects.*
*Also used manually by Drew when writing prompts in Claude Chat.*
*Last updated: April 2026*

---

## What This Is

This template encodes Drew's prompt style so every generated Claude Code build prompt inherits the same structure, philosophy, and constraints. The goal is a prompt that builds a fully deployed, working client app in a single Claude Code session — not a skeleton, not a prototype.

The `/api/admin-update-status` route reads this file when generating prompts for approved projects. The generated prompt must be complete enough that Drew can paste it into Claude Code, run it, deploy to Vercel, and have a working app ready for the client.

---

## How Claude Should Use This When Generating a Prompt

When generating a Claude Code build prompt for an approved project, Claude must:

1. **Read the full project scope** — title, the_problem, without_it, with_it, answers (Q1–Q12)
2. **Derive the complete feature list** from the scope. Don't summarize — think through every screen, every data model, every AI call, every integration the scope implies. A prompt that covers 60% of the scope produces 60% of an app.
3. **Pick the right stack** using the decision rules below — document the choice in the prompt
4. **Number every logical unit** — one feature per number, files named, behavior explicit
5. **Include companion docs as numbered items** — SETUP.md, schema.sql, CONTEXT.md, README.md are always part of the build
6. **Include deploy instructions** as the final numbered item before the README update

The generated prompt is the spec. If it's vague, the build will be vague. Write it tight.

---

## Prompt Structure (Always Follow Exactly)

```
Yes, and don't ask again
Yes, allow all edits this session

Read the README first, then make these [N] changes:

**1. [Feature name]**
[What it does. Which file(s) to create or touch. What the expected behavior is. What NOT to do if relevant.]

**2. [Feature name]**
...

Update the README with what was just built and what's next.
```

- Always open with: `Read the README first, then make these N changes:`
- Each change is numbered with a bold feature name
- Every change names the exact file(s) to create or touch
- Every change describes expected behavior — not just what it is, but what it does
- Always end with: `Update the README with what was just built and what's next.`

---

## Stack Decision Rules

**Use React + Vite (default for most client builds)**

React + Vite produces a fully static frontend deployed to Vercel's CDN. No server compute on page load. This is the right default for dashboards, internal tools, wizards, and any app where the client isn't SEO-dependent. It's leaner, faster to build, and cheaper to run.

Use React + Vite when:
- The app is a dashboard, internal tool, client portal, or wizard
- The user logs in before seeing meaningful content (SEO irrelevant)
- No server-side rendering is needed
- This covers roughly 80% of WST client builds

**Use Next.js (App Router) when:**
- SEO is a core requirement (public-facing marketing pages)
- The client needs a public site + authenticated app in one codebase
- SSR or SSG is explicitly required by the scope

Document the stack choice in the generated prompt so Drew can explain it to the client.

**Standard file structure for React + Vite:**
```
src/
├── App.jsx                      — Screen router, top-level state
├── hooks/
│   └── useApp.js                — Core state and logic (monolithic is fine if functions share state tightly)
├── lib/
│   ├── supabase.js              — Supabase client (anon key for client, service role for serverless)
│   └── anthropic.js            — AI call wrappers
├── components/                  — Shared UI components
├── tabs/                        — Screen-level tab components (each under 100 lines, delegates to components/)
└── data/                        — Static data, constants, reference files
api/
├── main.js                      — Primary serverless function (if needed)
└── [feature].js                 — One file per logical API route
docs/
├── SETUP.md                     — Accounts, keys, Supabase setup, deploy steps (always created)
supabase/
└── schema.sql                   — Runnable migration (always created)
.env.local.example               — All required env vars with placeholder values (always created)
README.md                        — Claude Code orientation doc (always created)
CONTEXT.md                       — Business and brand context for future sessions (always created)
```

---

## Companion Docs (Always Include in Every Build)

These four items must appear as numbered steps in every generated prompt. They are not optional.

### SETUP.md
A human-readable setup guide Drew uses to configure the project before or after the build. Must include:

- **Accounts to create:** Supabase (new project), Vercel (connect repo), Anthropic Console (new API key or use existing), any integration-specific accounts the scope requires (Slack, Resend, HubSpot, etc.)
- **Environment variables:** full list of every env var the app needs, what it is, where to get it, and whether it's client-safe or server-only
- **Supabase setup steps:** create project, run schema.sql in SQL editor, enable Auth, set redirect URLs, configure RLS
- **Vercel setup steps:** import repo, add env vars, set production domain
- **Google OAuth (if scoped):** where to create credentials, authorized redirect URIs to add
- **First deploy:** exact commands — `vercel --prod`
- **Post-deploy checklist:** what to verify in the browser after first deploy

### supabase/schema.sql
A complete, runnable SQL migration file. Must include:
- All tables with full column definitions
- `id uuid DEFAULT gen_random_uuid() PRIMARY KEY` on every table
- `created_at timestamptz DEFAULT now()` on every table
- `user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE` where users own rows
- `ON DELETE CASCADE` on all foreign key relationships
- `-- MIGRATION: [feature_name]` comment above each table
- All RLS policies: `ALTER TABLE x ENABLE ROW LEVEL SECURITY` + SELECT/INSERT/UPDATE/DELETE policies keyed on `auth.uid() = user_id`
- Any indexes that will matter at modest scale

### CONTEXT.md
Business and brand context for future Claude Code sessions. Must include:
- What the app is and who it's for (1 paragraph)
- The client's business context derived from the scope doc
- Stack choice and why
- Key architectural decisions made during the build
- Any copy or brand rules (tone, terminology, things to avoid)
- Links: Vercel URL, Supabase project URL, repo

### README.md
Claude Code's orientation document. Short, scannable. Must include:
- What the app is (2 sentences)
- What's built (checklist)
- What's next (backlog)
- File structure (key files only)
- How to run locally: `vercel dev`
- How to deploy: `vercel --prod`
- Known issues (if any)
- Environment variables (list of names, no values)

---

## Auth Wiring (Include in Every Build That Has User Accounts)

If the scope implies user accounts, generate a complete auth implementation. Don't leave it as a stub.

```
src/
├── AuthScreen.jsx               — Email/password login + signup, tab toggle, error states
├── lib/
│   └── supabase.js              — getSupabaseBrowser() (anon key) + getSupabase() (service role, serverless only)
```

Auth requirements:
- Login and signup in one component with tab toggle
- Error states: wrong credentials, email already exists, password mismatch
- On success: set session in state, render main app
- Persistent session: check `supabase.auth.getSession()` on mount, subscribe to `onAuthStateChange`
- Sign out: calls `supabase.auth.signOut()`, clears session state, returns to AuthScreen
- Protected routes: redirect to login if no session
- `useEffect` cleanup: always unsubscribe from `onAuthStateChange` on unmount

---

## AI Model Routing (Always Apply)

Every AI call must use the right model. This is both a quality decision and a sustainability decision — Haiku uses significantly less compute than Sonnet. Only use Sonnet when the output is going directly to the user.

| Task | Model |
|---|---|
| User-facing generation, reasoning, narration, long-form output, anything the client reads | `claude-sonnet-4-20250514` |
| Titles, labels, classification, extraction, short structured output, routing decisions, any utility task | `claude-haiku-4-5-20251001` |

Rules:
- The serverless function must accept `model` in the request body and default to Haiku
- Any call that generates user-facing content must explicitly pass Sonnet
- Secondary AI calls (titles, tags, summaries) must always be Haiku, always fire-and-forget, always fail silently
- Never use Sonnet for a task Haiku can handle — document this choice in CONTEXT.md

**Structured JSON from AI:**
```
"Respond only with valid JSON. No preamble, no markdown fences."
```
Always specify the exact schema in the prompt. Always strip fences before parsing. Always wrap in try/catch with a sensible default on failure.

---

## Eco-Build Standards (Apply to Every Build)

WST builds are "Built Lean. Built Green." This is not a marketing claim — it's enforced in every architecture decision.

- **Static-first:** React + Vite on Vercel CDN means zero server compute on page load. Don't add SSR unless it's required.
- **Haiku for utility:** Every AI call that doesn't produce user-visible output must use Haiku. Document the model choice in a comment next to each API call.
- **No unnecessary polling:** Don't poll for data on an interval unless real-time is explicitly required by the scope. Use Supabase Realtime subscriptions only when the user genuinely needs live updates. Fetch on user action by default.
- **Lean API calls:** Batch what can be batched. Don't make two API calls when one will do. Don't fetch the full row when you only need one field.
- **No bloat:** Don't install packages for things that can be done in 10 lines of vanilla JS. Check what's already in the stack before adding a dependency.
- **Include the stack rationale in SETUP.md** — one paragraph explaining why the stack is lean, so Drew can explain it to the client.

---

## Architecture Rules (Do Not Break)

**Secondary operations fail silently.** AI calls for titles, labels, extraction, or any supplementary content must never block the primary operation. Wrap in try/catch. Log to console. The main flow continues regardless.

**Fetch from DB at critical moments, not from React state.** React state goes stale in async contexts. For post-submit writes or any operation where fresh data matters, fetch directly from Supabase.

**Monolithic hooks are sometimes correct.** If functions share refs and state tightly, keep them together. Don't extract sub-hooks for cleanliness — only if it genuinely reduces complexity.

**Thin orchestrators are always correct.** Tab/screen components stay under 100 lines. Logic and UI live in sub-components. New panels = new file + import.

**`useEffect` cleanup matters.** Always clean up subscriptions, intervals, and listeners.

**Environment variables — two copies always.** `.env.local` for local dev. Vercel Dashboard for production. Never commit `.env.local`.

**RLS is on by default.** If queries return empty results unexpectedly, check RLS policies first.

**Cascading deletes.** `ON DELETE CASCADE` on all foreign key child tables.

**`jsonb` null checks.** Always optional-chain or provide defaults when reading jsonb fields.

**`.jsx` vs `.js`.** Files containing JSX must be `.jsx`. Vite throws on `.js` files with JSX content.

---

## Integration Tool Defaults

| Service | Tool | Install |
|---|---|---|
| ClickUp | Direct REST API + `fetch` | none |
| HubSpot | `@hubspot/api-client` | `npm install @hubspot/api-client` |
| Airtable (JS) | `airtable` | `npm install airtable` |
| Airtable (TS) | `airtable-ts` | `npm install airtable-ts` |
| Google Workspace | `googleapis` | `npm install googleapis` |
| Notion | `@notionhq/client` | `npm install @notionhq/client` |
| Slack — webhook | Direct `fetch` POST | none |
| Slack — interactive | `@slack/web-api` | `npm install @slack/web-api` |
| Excel — read | `xlsx` (SheetJS) | `npm install xlsx` |
| Excel — write | `exceljs` | `npm install exceljs` |
| Excel — modify existing | `xlsx-populate` | `npm install xlsx-populate` |
| PDF — read | `pdf-parse` | `npm install pdf-parse` |
| PDF — generate | `pdf-lib` | `npm install pdf-lib` |
| Web scraping — static | `cheerio` + `axios` | `npm install cheerio axios` |
| Web scraping — dynamic | `playwright` | `npm install playwright` |
| Payments | `stripe` | `npm install stripe` |
| QuickBooks Online | `node-quickbooks` | `npm install node-quickbooks` |
| Email | `resend` | `npm install resend` |
| SMS | `twilio` | `npm install twilio` |

---

## Supabase Schema Conventions

- Primary keys: `id uuid DEFAULT gen_random_uuid() PRIMARY KEY`
- Timestamps: `created_at timestamptz DEFAULT now()`, `updated_at timestamptz DEFAULT now()`
- User link: `user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE`
- Migration tags: `-- MIGRATION: feature_name`
- RLS on every user-owned table: enable RLS + four policies (SELECT/INSERT/UPDATE/DELETE) keyed on `auth.uid() = user_id`
- `ON DELETE CASCADE` on all foreign key relationships

---

## Environment Variable Conventions

Server-only (API keys, service role keys): no prefix. Never expose to client.
Client-accessible: `VITE_` prefix (React + Vite) or `NEXT_PUBLIC_` prefix (Next.js).

Every generated prompt must include a complete `.env.local.example` file with all required vars and placeholder values.

---

## Deploy Instructions (Always the Final Numbered Item Before README Update)

The second-to-last numbered item in every generated prompt must be deploy instructions:

```
**N. Deploy to production**
- Run: vercel --prod
- After deploy: open the live URL and verify [list the 3 most important things to check]
- If env vars are missing, add them in Vercel Dashboard → Project Settings → Environment Variables and redeploy
- Local dev: vercel dev (not npm run dev — serverless functions only run under vercel dev)
```

---

## What the Generated Prompt Must Cover (Checklist)

Before outputting a generated prompt, verify it includes:

- [ ] Every screen implied by the scope (not just the happy path)
- [ ] Auth (login, signup, session persistence, sign out, protected routes) — if the app has users
- [ ] Supabase schema (as a numbered item that creates `supabase/schema.sql`)
- [ ] All AI calls with correct model routing (Sonnet vs Haiku documented per call)
- [ ] All integrations named in Q10
- [ ] RLS policies on every user-owned table
- [ ] Error states on every async operation
- [ ] SETUP.md (accounts, env vars, Supabase steps, Vercel steps, post-deploy checklist)
- [ ] CONTEXT.md (app context, stack rationale, eco-build note)
- [ ] README.md (what's built, what's next, file structure, run/deploy commands)
- [ ] `.env.local.example` with all required vars
- [ ] Deploy instructions as a numbered item
- [ ] `Update the README with what was just built and what's next.` as the closing line

---

## What NOT to Put in a Generated Prompt

- Vague goals without file names or behavior descriptions
- "I want to..." framing without numbered steps
- Mixed feature + refactor in the same numbered item
- Architecture changes that weren't in the scope
- Phase 2 extensibility hooks or "future-proofing" wrappers
- Explanations of why — just what and where
- More than one logical unit per numbered item
- Skeleton implementations — every feature must be fully wired

---

## Example: Full One-Session Build Prompt (Reference Quality)

This is what a complete generated prompt looks like. Note: every feature is fully specified, companion docs are included as numbered items, and deploy is the second-to-last step.

```
Yes, and don't ask again
Yes, allow all edits this session

Read the README first, then make these 12 changes:

**1. Project scaffold**
Initialize the project structure for a React + Vite app with Tailwind CSS and CSS variables.
- Create: src/App.jsx, src/hooks/useApp.js, src/lib/supabase.js, src/lib/anthropic.js, index.html, vite.config.js, tailwind.config.js
- CSS variables in index.css: --color-navy (#00205C), --color-teal (#4B858E), --color-dark (#080C14), --color-offwhite (#F4F2EE)
- App.jsx is the screen router: renders AuthScreen if no session, renders MainApp if session exists
- Do not build any screens yet — just the scaffold and routing shell

**2. Supabase schema**
Create the complete database migration file.
- File to create: supabase/schema.sql
- [Full table definitions with RLS policies — derived from the scope]
- Tag each table with -- MIGRATION: [table_name]
- Include all ON DELETE CASCADE relationships
- Include all four RLS policies per user-owned table

**3. Authentication**
Build the login and signup screen.
- File to create: src/AuthScreen.jsx
- Two tabs: Log In / Sign Up with tab toggle
- Email + password fields; confirm password field on Sign Up tab
- Error states: wrong credentials, email already exists, password mismatch
- On success: session set in App.jsx via onAuthSuccess callback, renders MainApp
- Persistent session: check getSession() on mount in App.jsx, subscribe to onAuthStateChange, unsubscribe on unmount
- Sign out button in nav triggers supabase.auth.signOut() and returns to AuthScreen

**4. [Core feature 1 — derived from scope]**
[Full specification: files, behavior, edge cases, what NOT to touch]

**5. [Core feature 2 — derived from scope]**
[Full specification]

**6. [AI integration — derived from scope]**
Build the [AI feature] serverless function and wire it to the UI.
- File to create: api/[feature].js
- Use claude-sonnet-4-20250514 for [user-facing output] — this is the only Sonnet call in the app
- Use claude-haiku-4-5-20251001 for [utility task] — comment: // HAIKU — utility, not user-facing
- Accepts model in request body, defaults to Haiku
- Returns structured JSON: [exact schema]
- Prompt instructs: "Respond only with valid JSON. No preamble, no markdown fences."
- Strip fences before parsing; wrap in try/catch; return 500 with message on parse failure
- Secondary calls (titles, tags) fire-and-forget, fail silently, never block primary response

**7. [Integration — derived from Q10]**
[Full specification for each integration the client named]

**8. .env.local.example**
Create the environment variable reference file.
- File to create: .env.local.example
- Include every env var the app needs with placeholder values and a one-line comment per var explaining what it is and where to get it
- Server-only vars: no prefix
- Client vars: VITE_ prefix

**9. SETUP.md**
Create the full setup and deployment guide.
- File to create: docs/SETUP.md
- Accounts to create: [list every service the app uses — Supabase, Vercel, Anthropic, plus any integrations]
- Environment variables: full table — var name, what it is, where to get it, server vs client
- Supabase setup: create new project, run supabase/schema.sql in SQL editor, enable Auth (Email provider), set Site URL to production domain, add redirect URLs
- Vercel setup: import GitHub repo, add all env vars, set production domain, first deploy: vercel --prod
- Post-deploy checklist: [3–5 things to verify after first deploy]
- Stack rationale paragraph: explain why React + Vite was chosen (static-first, CDN-hosted, no server compute on page load, lower resource usage than SSR)

**10. CONTEXT.md**
Create the business and architectural context file for future Claude Code sessions.
- File to create: CONTEXT.md
- App summary: what it is, who it's for, what problem it solves
- Client business context: [derived from scope answers]
- Stack: React + Vite, Supabase, Vercel, Anthropic. Reason: static-first, lean compute, CDN-hosted.
- AI model routing: Sonnet for [specific calls], Haiku for [specific calls] — document every call
- Eco-build note: static frontend = zero server compute on page load; Haiku used for all utility calls; no background polling
- Key architectural decisions made during this build
- Links: [Vercel URL placeholder], [Supabase URL placeholder], [repo URL]

**11. README.md**
Create the Claude Code orientation document.
- File to create: README.md
- What the app is (2 sentences)
- Build status checklist (every feature from this prompt as a checked item)
- What's next (backlog from scope — anything not built in this session)
- File structure: key files and what they do
- Run locally: vercel dev (not npm run dev)
- Deploy: vercel --prod
- Environment variables: list of names only, no values

**12. Deploy to production**
- Run: vercel --prod
- After deploy, verify: [1] login and signup work, [2] [core feature] works end to end, [3] AI call returns expected output
- If env vars are missing, add them in Vercel Dashboard → Project Settings → Environment Variables and redeploy
- Local dev going forward: vercel dev

Update the README with what was just built and what's next.
```

---

## Anti-Patterns (Never Include in Generated Prompts)

- Skeleton implementations that leave features half-wired
- `// TODO: implement this` placeholders
- Phase 2 extensibility hooks
- New config files for things that could be inline
- Sub-hook extraction when functions share state tightly
- Storing in DB what can be derived at runtime
- Using Sonnet for a task Haiku can handle
- Polling on an interval when a user-triggered fetch would do
- Missing error states on async operations
- Missing RLS on user-owned tables
- Companion docs omitted because "the build is simple"

---

*The prompt is the spec. The spec is the contract. Write it tight.*
*Every build ships with SETUP.md, schema.sql, CONTEXT.md, and README.md — no exceptions.*
