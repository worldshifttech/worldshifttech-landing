Curriculum content files are in /content/curriculum/ — read them directly, do not use subagents.

# World Shift Technologies — Landing App

Next.js marketing site at worldshifttech.com. Personalized front door: visitors answer 4 questions, Claude generates a custom page based on Drew's case study library.

**Companion docs — read these before touching copy or design:**
- `CLAUDE.md` — project bible (brand, positioning, messaging, architecture, what NOT to do)
- `WST_BRAND_GUIDE_2026.md` — brand colors, fonts, tone
- `AGENTS.md` — Next.js version warnings (read before writing any framework code)

**Orchestrator work:** read `ORCHESTRATOR_DESIGN.md` before touching `/admin/repos`,
`/admin/reviews`, or the `repos` / `agent_sessions` / `review_items` /
`knowledge_base_entries` tables — it's the source of truth for the multi-repo Claude Code
orchestration system (design locked, Phase 1 of 6 built as of Session 48).

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
- **GitHub App auth:** `@octokit/auth-app` — exchanges the WST orchestrator's GitHub App for installation tokens (`lib/github-app.ts`)
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
- [x] Session 46 — client accounts retired everywhere (projects wizard, audit save-flow). Drew is the only login.
- [x] `/admin/login` — Drew-only login (Supabase Auth), unlinked from any public nav
- [x] `/admin` — project list (title, client, % complete, next update, access badge) + "New Project"
- [x] `/admin/projects/[id]` — full project management: core fields, milestone editor, budget cap vs. logged hours
- [x] `/projects/[slug]` — public client roadmap page, no login; open or gated by a per-project password (`lib/project-access.ts`)
- [x] Session 47 — file uploads, both sides. Private Supabase Storage bucket (`project-files`), signed upload/download URLs, Turnstile-gated on the public client form, Slack ping on client uploads, admin can delete
- [x] Session 48 — WST Orchestrator Phase 1 (control plane). `repos`, `agent_sessions`, `review_items`, `knowledge_base_entries` tables (no RLS, service-role only). `/admin/repos` — fleet list, New Repo form, `/admin/repos/[id]` full edit. `/admin/reviews` — Pending/Answered inbox with structured per-question answers. See `ORCHESTRATOR_DESIGN.md`. No GitHub App integration, dispatch flow, pgvector search, or scheduler yet (Phases 2-4).
- [x] Session 49 — WST Orchestrator Phase 2a (this repo's half of the dispatch loop). `lib/github-app.ts` exchanges the GitHub App for an installation token. `/api/orchestrator/dispatch` (admin-only) creates an `agent_sessions` row and fires `repository_dispatch` on `wst-orchestrator-runner`. `/api/orchestrator/session-result` (bearer-secret, `WST_ORCHESTRATOR_SECRET`) ingests the runner's result into `agent_sessions` + a `review_items` row. "Run Planning Session" button live on `/admin/repos/[id]`. Same-day follow-up: wired end-to-end and proven working for Planning Mode — a real dispatch against `entos-group-website` produced a real review card. Build Mode (the `build` job in `wst-orchestrator-runner`) exists but is still unexercised — no PR has been created by the system yet.
- [x] Session 50 — Wired the Build dispatch path in the Reviews inbox: `repo_id` threaded through the `/admin/reviews` query, a "Run Build Session" button on answered `consolidated_review` cards that fires `session_type: "build"` using the card's own `proposed_content` as the brief. Same-day follow-up: first live build dispatch surfaced a `claude-code-action` anti-loop guard (fixed in `wst-orchestrator-runner`, see its own README/NOTES.md), and a real "Delete" action was added to pending review cards (`DELETE` on `/api/admin-reviews/[id]`) since there was previously no way to clear a stray/test item from the inbox at all.
- [x] Session 51 — Target-repo feedback visibility + per-repo review views. `repos` gains `target_supabase_url`/`target_supabase_service_role_key` (write-only end to end, never returned by any route — see NOTES.md for the design pass this went through). `lib/feedback-adapters.ts` bridges two repos' genuinely different feedback schemas (`forgotten-realms-dm`'s `feedback_tickets`, `drew-griffiths-speak-easy`'s `app_feedback`). `/admin/repos/[id]` gains a Feedback section (list + Resolve) and its own scoped Reviews list; `/admin/repos` gains an open-reviews badge per repo. `/api/orchestrator/repo-secrets` exists for `wst-orchestrator-runner` to eventually fetch a target repo's credentials during a build session — built, not yet called by anything. Same-day follow-up: **WST Orchestrator Phase 2 fully closed.** A real "Run Build Session" click against `entos-group-website` produced [a real, mergeable PR](https://github.com/worldshifttech/entos-group-website/pull/1) — the first this system has ever created. Both Planning and Build Mode are now proven end-to-end, per `ORCHESTRATOR_DESIGN.md` §10's own definition of the phase.
- [x] Session 52 — WST Orchestrator Phase 4 (scheduler). `vercel.json` cron hits `/api/orchestrator/scheduler-tick` hourly; dispatches planning sessions automatically for any repo with `automation_enabled = true` and a `planning_interval_hours` set, once that interval elapses and no session is already open. Global "Pause All Automation" kill switch on `/admin/repos` (`orchestrator_settings` table), checked before every tick, independent of each repo's own per-repo `automation_enabled` toggle. `lib/orchestrator-dispatch.ts` extracts the actual dispatch logic so the scheduler and the manual "Run Planning/Build Session" buttons share one code path. The per-session runtime/cost ceiling the design called for already existed (`timeout-minutes`/`--max-turns` in `wst-orchestrator-runner` since its own Session 1) — nothing new needed there. Same-day follow-up: `CRON_SECRET` set, `orchestrator_settings` migration run.
- [x] Session 53 — Build result cards + Merge to Production. `wst-orchestrator-runner` now resolves the Vercel preview URL (reads it off Vercel's own PR comment, no new secret/permission) and posts a `build_result` review card on every successful build, closing a real gap: there was previously no dashboard surface for a finished build at all. `/api/admin-reviews/[id]/merge` (new) squash-merges the PR straight from that card's "Merge to Production" button, using the same GitHub App installation-token pattern every other orchestrator route uses. "Discard" marks it reviewed without touching GitHub. Same-day: PR #1 (entos-group-website, predates this feature) squash-merged directly via `gh`, confirmed the auto-deploy mechanism this button relies on actually works — the button/card UI itself is still unexercised, no build has dispatched under the runner's new code yet.
- [x] Session 54 — WST Orchestrator Phase 6 (deployment drift/verification). `/api/orchestrator/drift-check` (new cron, 6-hourly, separate from `scheduler-tick`) compares each repo's live Vercel production deployment (`meta.githubCommitSha`) against GitHub's `main` HEAD, stores both on `repos`. Red "Drift" badge on `/admin/repos`' fleet list; full detail (both SHAs, in-sync/drifted) on each repo's own Settings tab. Setup fully closed same-day: `VERCEL_TEAM_ID`, `VERCEL_API_TOKEN`, and the SQL migration are all done. Still genuinely unverified end-to-end — the cron hasn't fired yet, see NOTES.md.
- [x] Session 55 — WST Orchestrator Phase 3 (knowledge base) + Audit Knowledge Base consolidation. `knowledge_base_entries` (existing table, altered) now holds both audit reference docs and build-session artifacts under one `category` column, searched via a new `match_knowledge_base_entries` cosine-similarity RPC (`lib/voyage.ts` + `lib/knowledge-base.ts`, `voyage-3`/1024-dim). Planning dispatches (`lib/orchestrator-dispatch.ts`) now embed the brief and inject matching entries into the runner's `client_payload` as `knowledge_context`. `/api/admin-reviews/[id]/approve-kb-entry` (new) closes a real gap — the kb_entry_draft "Approve" button has existed since Session 48 but never actually wrote to `knowledge_base_entries` until now; `ReviewInboxClient.tsx` gave that kind its own editable-fields render branch. Investigating "the Audit Knowledge Base" for consolidation found it was three disconnected fragments, one (the `audit_knowledge` table) with zero callers anywhere in the app — `content/audit-knowledge/*.md` (21 docs) and that dead table are now fully migrated (`/api/admin/migrate-audit-knowledge`, one-time) into the unified table and deleted outright; `/admin/knowledge-base` (new) replaces `/admin/audit-knowledge` as one browsable view over both categories. `content/tool-registry.json` (what actually drives the live `/audit` report) deliberately left alone, flagged as a future retire/fold candidate. Same-day: the migration hit four real bugs in a row (delete-before-migrate ordering, a silent Vercel timeout, a retry button that vanished after the first partial run, then a concurrency-related partial failure) before all 21 rows confirmed synced — see NOTES.md for the full trail. Also same-day: **Phase 3 closed the rest of the way** in `wst-orchestrator-runner`'s own Session 2 — the planning job now reads `knowledge_context` into its prompt, and the build job drafts a `kb_entry_draft` before opening its PR when it judges something reusable. Genuinely unverified end-to-end still — no real dispatch has exercised either new runner-side path yet. **Phase 5 (`wst-build-manager` upgrade) is the only phase left** from the original roadmap.
- [x] Session 56 — WST Orchestrator Phase 5 (`wst-build-manager` upgrade). Most of the work is in that repo's own commit (idempotency across GitHub/Supabase/Vercel/ClickUp with a resumable `.bootstrap-state/`, a real Vite+React `starter-template/` so `npm install` finally has something to install, verified end-to-end against a scratch copy). This repo's own piece: `/api/ingest-repo-registration` (new, `WST_INGEST_SECRET`-gated, idempotent on `github_repo`) — `bootstrap.js` now auto-registers every new project into the `repos` fleet instead of Drew adding it by hand. **This closes every phase (0–6) on `ORCHESTRATOR_DESIGN.md` §10's original roadmap.**
- [x] Session 57 — Client Portal link + password generation on the repo dashboard. `/admin/repos/[id]` gets a new Client Portal card whenever "Linked Client Project" resolves to a real project: the copyable `/projects/[slug]` link, current public/password status, and a "Generate Password" button (`/api/admin-projects/[id]/generate-password`, new) that reveals a fresh plaintext password once — same one-time-reveal pattern as a provider showing a freshly-generated API key, never stored or shown again after that response.
- [x] Session 58 — "Run Custom Build Session" on `/admin/repos/[id]`. Mirrors the existing free-text "Run Planning Session" section for `session_type: "build"` — the only prior way to dispatch a build was a fixed button that always sent an answered review card's full, unmodified text, with no way to fire a hand-split or edited brief. Prompted by a real build failure (`is_error: true` after 76 turns against a 60-turn cap, $3.29, no PR) recommending a split into smaller sessions instead of a blind retry.
- [x] Session 59 — Surface SQL migrations from build sessions on the dashboard. `build_result` cards on `/admin/reviews` now render a copyable "SQL to Run" block from `proposed_content` (unused since Session 53, repurposed rather than a new column). Most of the actual capture logic lives in `wst-orchestrator-runner`'s own Session 3 — the build prompt now tells Claude to put SQL under a `## SQL to run` heading in its PR description, and a new workflow step extracts it back out.
- [x] Session 60 — Client feedback backend: milestone ownership model (`project_milestones.action_owner`/`action_note`), an upsert-by-ID fix for the milestone editor's save path (previously delete-all-and-reinsert, which would have silently orphaned any `milestone_id` reference), milestone-scoped file uploads (`project_files.milestone_id`), and the first writer for `project_feedback` (`/api/project-feedback`, new). `lib/project-access.ts` now also owns `verifyClientAccess`/`verifyTurnstile`, shared by all three client-facing routes instead of copy-pasted per route. Backend only — the client-facing "Action needed" UI and the admin feedback inbox are still pending (Session 61 build). Same-day, folded into this entry rather than left as a duplicate heading: a "Dispatching to: {repo name}" badge landed on the Run Planning Session and Run Custom Build Session boxes on `/admin/repos/[id]`, after an earlier dispatch attempt landed against the wrong repo (`wst-build-manager` instead of `worldshifttech-landing`) because both pages look identical apart from the small heading.
- [x] Session 61 — Session 60's real build result (PR #2, real SQL) backfilled directly into the control plane DB after discovering `wst-orchestrator-runner`'s `resolve_pr` step was silently skipped on every build regardless of outcome — see that repo's Session 5 for the root-cause fix.
- [x] Session 62 — Pre-filled a nav-cohesion audit brief into `worldshifttech-landing`'s own Run Planning Session box (component state only, not a new feature/table) — superseded by Session 63.
- [x] Session 63 — Real "save draft" feature: `session_drafts` table (`repo_id`/`session_type`/`title`/`brief`), `/api/admin-repos/[id]/drafts` (POST) + `[draftId]` (DELETE), a "Saved Drafts" list with Load/Delete on `/admin/repos/[id]` above the Planning/Build boxes, each of which gained a "Save as Draft" control. Replaces Session 62's component-state stopgap, which Drew correctly flagged as not durable enough.
- [x] Session 64 — Client-facing "action needed" milestone UI, closing out Session 60's backend. `app/projects/[slug]/MilestoneActionPanel.tsx` (new) is a collapsed-by-default panel rendered per milestone when `action_owner === 'client' && status !== 'done'`: a text-answer path posting to `/api/project-feedback` and a file-upload path reusing the existing signed-upload-url flow, both gated by one shared Turnstile widget per open panel. `/admin/projects/[id]` gets a real Client Feedback inbox (message, milestone or "General", status, relative date, "Mark Resolved" via new `/api/admin-project-feedback/[id]` PATCH) and its admin `FileUploads.tsx` now shows "for: {milestone title}" on milestone-scoped uploads. `notify-slack` gained a `milestone_response` Slack ping and the existing `file_upload` ping now includes the milestone title when set.
- [x] Client feedback is fully wired end to end (schema, submission, admin inbox, Slack notifications) as of Session 64
- [x] Session 65 — `repos.system_group` (badge on the fleet list, editable field on repo detail, threaded into dispatch so `wst-orchestrator-runner`'s run titles can say "WST App (worldshifttech-landing)" instead of a bare generic title). Also registered `wst-orchestrator-runner` itself as a `repos` row for the first time. Bigger finding while investigating specific GitHub Actions runs Drew flagged: `entos-group-website`'s scheduled automation had been silently dead since August 6 — four sessions across two repos stuck non-terminal (nothing ever swept a crashed/never-dispatched session back to `failed`) permanently tripped `scheduler-tick`'s "already open" guard. Cleaned up the four, and `scheduler-tick` now self-heals any session non-terminal for 3+ hours on every tick going forward.
- [x] Session 66 (renumbered from its own "Session 65" — the number collided with the control-plane session above, which landed on `main` first) — Build Status: `consolidated_review` cards on `/admin/reviews` and each repo's own scoped Reviews list now persist whether a build session was dispatched from them (`agent_sessions.source_review_item_id`), replacing the old page-refresh-loses-it local state.
- [x] Session 67 — Fixed a real bug caught live: Session 66's second `review_items`↔`agent_sessions` foreign key made three unhinted PostgREST embeds ambiguous (`/admin/reviews`, `/admin/repos/[id]`, `/admin/repos`' open-review badges), each silently failing and rendering as an empty list with no error surfaced. All three now specify `agent_sessions!review_items_session_id_fkey` explicitly and log real query errors.
- [x] Session 68 — Manual `archived` state for `review_items` (third status, third tab on `ReviewList`, an Archive/Unarchive control on every answered card regardless of kind) so Answered stops accumulating everything ever answered. Plus the control-plane half of a real build-session resume mechanism: `agent_sessions.checkpoint` (jsonb) holds a build session's self-reported progress; `resume_from_session_id` on `/api/orchestrator/dispatch` threads a prior session's checkpoint into `resume_context` (previously always sent `null`); "Retry Build Session" auto-resumes transparently when a checkpoint exists, no new button. Nothing writes a real checkpoint yet — that's `wst-orchestrator-runner`'s own Session 9.
- [x] Session 69 — Shared admin nav + in-app workflow guide. A nav sweep found every `/admin/*` page hand-coding its own `<nav>` with a different subset of links — `/admin/repos/[id]` and `/admin/projects/[id]` in particular only linked back to their own list, no way to reach Reviews, Knowledge Base, or Dashboard without a detour. `app/admin/AdminNav.tsx` (new) is now the one shared nav on all six admin surfaces (`AdminDashboard`, `RepoFleetClient`, `RepoDetailClient`, `ReviewInboxClient`, `KnowledgeBaseClient`, `ProjectDetailClient`), always showing every destination with the current one highlighted; the two detail pages keep their own "back to list" breadcrumb, just no longer as the only way out. `/admin/guide` (new) is a permanent reference page, linked from that nav, walking through the full planning-to-build flow, what each review card kind means, the Pending/Answered/Archived semantics, automation controls, and a short summary of what a client sees on their side. `app/admin/InfoTooltip.tsx` (new) is a click-to-toggle "?" bubble, dropped next to the specific controls worth explaining before you click them (Run Planning/Build Session, Save as Draft, Automation enabled, Merge to Production, Archive, Discard, Approve & Add to Knowledge Base, the review card kind badges, Pause All Automation). Deliberately excludes the client-facing `/projects/[slug]` portal — CLAUDE.md is explicit that side stays founder-led and simple, not SaaS-product styled with help chrome. No schema changes.
- [x] `build_cost_entries.project_id` column exists but isn't populated or surfaced against the budget cap yet — a future session
- [x] `/audit` — 5-phase AI waste estimate wizard (guest-only; the account-creation "save your report" flow was retired in Session 46 — CTA is Book a Call only)
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
| `WST_INGEST_SECRET` | Set |
| `WST_COOKIE_SECRET` | **Needs to be added** (Session 46) — signs the per-project password-gate cookie in `lib/project-access.ts`. Any long random string. |
| `WST_GITHUB_APP_ID` | (Session 49) — the WST Orchestrator's GitHub App ID, used by `lib/github-app.ts` to mint installation tokens. |
| `WST_GITHUB_APP_PRIVATE_KEY` | (Session 49) — same App's private key (PEM). Paste with literal newlines, no `\n` escaping needed in Vercel's env var UI. |
| `WST_ORCHESTRATOR_SECRET` | (Session 49) — bearer secret for `/api/orchestrator/session-result`, same shape as `WST_INGEST_SECRET` but a distinct value. Must match the `wst-orchestrator-runner` repo's own Actions secret of the same name. |
| `WST_ORCHESTRATOR_RUNNER_REPO` | (Session 49) — `worldshifttech/wst-orchestrator-runner`. Read from env in `/api/orchestrator/dispatch` rather than hardcoded. |
| `CRON_SECRET` | Set (Session 52) — Vercel automatically sends `Authorization: Bearer $CRON_SECRET` on requests it triggers via `vercel.json`'s `crons` config; `/api/orchestrator/scheduler-tick` checks this to confirm a hit actually came from Vercel's own scheduler. |

---

## Supabase

Run `/supabase/schema.sql` in the Supabase SQL editor to create all tables and RLS policies.
See NOTES.md for per-session migration SQL history.
