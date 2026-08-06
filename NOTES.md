Last session: 50

## Recent Changes (Session 50, August 6, 2026)

**Wire the Build dispatch path in the Reviews inbox**

Planning Mode dispatches work end to end (Session 49) — `/api/orchestrator/dispatch`
already accepted `session_type: "build"` from the day it was written, but nothing in the
UI could reach it: the Reviews inbox query never selected `repo_id`, so the client had
nothing to target a build dispatch at, and no button anywhere called dispatch with
`session_type: "build"`. This session closes that gap. Code changes only — no live build
dispatch was fired during this session, see "Next" below.

**`app/admin/reviews/page.tsx`**: Supabase select changed from
`"*, agent_sessions(session_type, repos(name))"` to
`"*, agent_sessions(repo_id, session_type, repos(name))"`. `RawReviewRow.agent_sessions`
gained a `repo_id: string` field, mapped into a new `repo_id` field on each `ReviewItem`.

**`app/admin/reviews/ReviewInboxClient.tsx`**: `ReviewItem` type gained
`repo_id: string | null`. `ReviewCard`'s answered-state branch now renders a "Build"
section when `kind === "consolidated_review" && proposed_content && repo_id` — a "Run
Build Session" button that POSTs to `/api/orchestrator/dispatch` with
`{ repo_id, session_type: "build", brief: proposed_content }`, same admin-bearer-token
pattern as `RepoDetailClient.tsx`'s `handleRunPlanningSession`. On success it shows the
returned `session_id` in place of the button; on failure, an inline error in the same
style as the rest of the card.

**Two judgment calls made without asking, flagged here per the established pattern:**
1. No double-dispatch guard, and no persisted "already dispatched" state — the
   confirmation after a successful dispatch is local component state only, so a page
   refresh re-shows the button and lets Drew fire it again. This is a manual click Drew
   controls directly, not something automation can spam, so a DB column to track it felt
   like schema growth the feature doesn't earn yet.
2. The button lives on **answered** `consolidated_review` cards only, with no new
   decision-button layer added (unlike `production_risk_flag`/`kb_entry_draft`, which got
   explicit Approve/Discard-style buttons in Session 48). Flipping a card to "answered" —
   by resolving its open questions or filling in a response — is treated as the approval
   gesture itself; ORCHESTRATOR_DESIGN.md §5 already describes this case ("if nothing's
   blocking, the finished build prompt ready for a straight approve").

Verified with `npx tsc --noEmit` and `npm run build` (both clean, `/admin/reviews` and
`/api/orchestrator/dispatch` both listed). The dispatch flow itself — whether a real
`session_type: "build"` dispatch actually turns into a PR — is still unverified; that
needs a real click against deployed production, not something this session's local
tooling can exercise.

**Next: the actual first live Build Mode test.** Go to `/admin/reviews`, find the
`entos-group-website` `consolidated_review` card from Session 49's planning proof (or, if
it's gone, dispatch a fresh "Run Planning Session" against `entos-group-website` from
`/admin/repos/[id]` to generate a new one). Answer it, then click "Run Build Session."
Watch `wst-orchestrator-runner`'s Actions tab for the `build` job, and
`entos-group-website`'s pull requests for the result. Record whatever happens — clean
success, or the next permission/config gap — as a same-day follow-up here, matching the
Session 49 debugging-trail pattern. Two things flagged as genuinely unverified in
`wst-orchestrator-runner`'s own NOTES.md going into this: whether `--permission-mode
dontAsk` behaves the same way under `claude-code-action` as it does for the bare CLI, and
whether `gh pr create` reliably infers the right repo from the checked-out working
directory.

---

## Recent Changes (Session 49, August 5, 2026)

**WST Orchestrator Phase 2a — dispatch + result ingestion (this repo's half)**

This repo's side of the first real end-to-end orchestrator loop. The other half —
`wst-orchestrator-runner`'s own GitHub Actions workflow — is a separate repo, not built
this session (it didn't exist locally yet when this session ran). Nothing in this session
is testable end-to-end until that repo exists and Drew has confirmed the GitHub App
installation covers it.

**Design decision, applied without asking (defensible, flagged here per the established
pattern):** one shared GitHub App installation across the runner repo and all 5 fleet
repos, rather than a separate installation per repo. `lib/github-app.ts`'s
`getInstallationToken(installationId)` takes whichever installation ID is on the *target*
repo's `repos` row and uses that same token both to fire `repository_dispatch` on the
runner and (later, inside the runner's own workflow) to clone/push the target repo. This
only works if Drew installs the App as one shared installation — if he ends up installing
it separately per repo instead, `dispatch/route.ts` needs a second lookup for whichever
installation actually covers the runner repo.

**`lib/github-app.ts`** (new): `getInstallationToken(installationId: number): Promise<string>`
via `@octokit/auth-app`'s `createAppAuth`, reading `WST_GITHUB_APP_ID` /
`WST_GITHUB_APP_PRIVATE_KEY`. New dependency (`@octokit/auth-app`) — deliberate, over
hand-rolling RS256 JWT signing, given how easy the claim set and clock-skew handling are to
get subtly wrong for something that gates real repo write access.

**`app/api/orchestrator/dispatch/route.ts`** (new, POST): same `verifyAdmin` bearer pattern
as `admin-repos`. Looks up the target repo's `github_owner`/`github_repo`/
`github_app_installation_id` (400 if the installation ID isn't set yet — surfaces cleanly
in the UI rather than failing deep in a token exchange), creates an `agent_sessions` row
(`status: 'running'`), mints an installation token, POSTs `repository_dispatch` to
`WST_ORCHESTRATOR_RUNNER_REPO` with `{ repo_id, session_id, session_type, brief,
github_owner, github_repo, resume_context: null }` as `client_payload`. Marks the session
`failed` if the GitHub API call itself fails (network error or non-2xx) rather than leaving
it stuck on `running` forever. On a successful planning dispatch, also stamps
`repos.last_planning_session_at` — feeds the "Last run" column `/admin/repos` already had
from Session 48 with no changes needed there.

**`app/api/orchestrator/session-result/route.ts`** (new, POST): bearer-secret auth against
`WST_ORCHESTRATOR_SECRET` (plain string comparison, same shape as `ingest-build-cost`, not
the Supabase-auth `verifyAdmin` pattern — this one's called by the runner, not the browser).
Updates the `agent_sessions` row (status, build_prompt, PR fields, sets `completed_at` on
`done`/`failed`), optionally inserts one `review_items` row from a `review` object in the
body. `status` is typed as a bare string, not a literal union — the schema has no CHECK
constraint on `agent_sessions.status`, so the route shouldn't be stricter than the table.

**`app/admin/repos/[id]/RepoDetailClient.tsx`**: replaced the Session 48 placeholder
comment with a real "Run Planning Session" section — brief textarea, dispatch button
(disabled until a `github_app_installation_id` is set on the repo, with an inline hint
telling Drew to set one), redirects to `/admin/reviews` on success rather than staying on
the page waiting for something that won't resolve for minutes.

**New Vercel env vars (not yet set — Drew has the App ID and private key ready but they
still need to land in Vercel):** `WST_GITHUB_APP_ID`, `WST_GITHUB_APP_PRIVATE_KEY`,
`WST_ORCHESTRATOR_SECRET` (new, distinct from `WST_INGEST_SECRET`),
`WST_ORCHESTRATOR_RUNNER_REPO` (`worldshifttech/wst-orchestrator-runner`).

Verified with `npx tsc --noEmit` and `npm run build` (both clean, new routes listed) and a
local dev-server check that `/admin/repos/[id]` still hits the same auth redirect as every
other `/admin` page — the actual dispatch flow can't be verified further until
`wst-orchestrator-runner` exists and both halves are deployed.

**Next: Phase 2b — the `wst-orchestrator-runner` repo itself.** Plain manual repo (not
routed through `wst-build-manager` — it's CI-only, no app layer, no need for the
Supabase/Vercel/ClickUp provisioning that tool does for real client builds). Build prompt
for its first session already drafted in this session's planning conversation: one GitHub
Actions workflow triggered on `repository_dispatch`, branching on `session_type` —
`planning` runs the bare `claude` CLI with a read-only `--allowedTools` (matching this
repo's own Planning Mode, which never writes files or runs commands), `build` runs
`anthropics/claude-code-action@v1` with a scoped `--allowedTools` allowlist (Drew's choice
over `--dangerously-skip-permissions`) and lets the Action handle commit/push/PR natively.

**Same-day follow-up: Phase 2 wired end-to-end and proven working (Planning Mode).**
`wst-orchestrator-runner` was built (separate repo, see its own NOTES.md), and getting a
real "Run Planning Session" click to actually produce a review card took a long debugging
session. Recording the full root-cause chain here since none of it was obvious and most of
it will bite again if this pattern gets reused for another repo's orchestrator setup.

*Root causes found, in the order they were hit:*

1. **Three of four Vercel env vars saved as empty strings.** The dashboard's paste into a
   multi-line-capable textarea silently didn't register for `WST_GITHUB_APP_ID`,
   `WST_GITHUB_APP_PRIVATE_KEY`, and `WST_ORCHESTRATOR_RUNNER_REPO` — `vercel env ls` still
   showed them as "Encrypted" (that only means *a* value exists, even an empty one).
   Fix: re-add via `vercel env add <name> production < file` (pipes the value in directly,
   sidesteps the dashboard textarea entirely) rather than trusting a browser paste.
2. **The regenerated `WST_ORCHESTRATOR_SECRET` had an invisible trailing newline.** Generated
   it with `node -e "console.log(...)"` and piped the whole file into `vercel env add` —
   `console.log` always appends `\n`, so the stored secret was
   `<value>\n`, which never matches a clean copy-paste of what gets displayed. Any secret
   generated for a strict-equality bearer-token check needs `process.stdout.write(...)`
   instead of `console.log`, or the trailing newline rides along silently.
3. **The custom GitHub App was missing the `Actions` repository permission entirely.**
   ORCHESTRATOR_DESIGN.md §4 called this out from the start ("Actions (write, to trigger
   `repository_dispatch`)") but it didn't make it into the App's actual permission
   configuration — easy to miss since it's a separate checkbox from Contents/Issues/PRs.
   Symptom: `repository_dispatch` returned a clean `204` every time (that endpoint only
   checks `Contents: write`), so the request always looked successful, but zero workflow
   runs were ever created and `GET /actions/workflows` / `GET /actions/runs` on the
   installation token both came back `403 Resource not accessible by integration`.
4. **The `Workflows` repository permission was *also* required, separately from `Actions`.**
   Even after granting and approving `Actions: write`, dispatches kept getting accepted
   (204) without ever producing a run — for over an hour, across multiple accounts (both
   Drew's real dispatches through the app and direct API test scripts). Adding
   `Workflows: read and write` and approving it on the installation is what actually
   unblocked things. This isn't how GitHub's own docs frame the permission (they describe
   `Workflows` as being for *updating workflow YAML files*, not for triggering runs) — but
   empirically, granting it is what fixed it. Once granted, GitHub appears to have
   processed the whole backlog of previously-accepted-but-never-triggered dispatches
   (several from earlier in the session finally turned into runs), not just new ones sent
   after the fix.
5. Approving a permission change with the "accept updated permissions" prompt is a
   **separate step** from changing the App's declared permissions — `GET /app` reflects the
   new permission immediately, but installation tokens keep using the old scope until the
   org admin explicitly approves the upgrade.

**Confirmed working GitHub App permission set for this integration:**
`Contents: write`, `Actions: write`, `Workflows: write`, `Pull requests: write`,
`Metadata: read`. Repository access: one shared installation covering the runner repo and
every managed target repo (not per-repo installations) — see the Session 49 main entry
above for why that matters for the token-scoping design.

**First real end-to-end proof:** a "Run Planning Session" click against
`entos-group-website` produced `agent_sessions` row (status `done`) with a real
`review_items` row — Claude Code read the actual repo, found two genuine mobile-viewport
bugs (a `@media (hover: none)` rule forcing desktop-sized tile heights on collapsed mobile
grids, and a sub-16px form input triggering iOS Safari's auto-zoom), and produced a
scoped, numbered build prompt referencing real files. The mechanism works.

**Left over, not cleaned up:** four `agent_sessions` rows from before the `Workflows` fix
(`87650c40`, `181d70b0`, `406c0479`, `7238fd5d`) are permanently stuck at `status: 'running'`
— their dispatches were accepted by GitHub but never turned into runs, and once the
permission was fixed GitHub processed the backlog for *some* pending dispatches but not
these four specifically. Harmless (nothing reads a stuck `running` row except a human
looking at the table), left as-is rather than force-closed.

**Not yet tested: Build Mode.** Everything proven above is the `planning` job only. The
`build` job (checks out the target repo, runs `anthropics/claude-code-action@v1`, expects
it to commit/push/open a PR) has never actually been exercised — no PR has been created by
this system yet. Given how much permission-configuration pain Planning Mode surfaced, Build
Mode (which needs push access to a real branch and PR-creation, not just read access) may
well have its own undiscovered gap. Recommended before calling Phase 2 fully closed per
ORCHESTRATOR_DESIGN.md §10's own definition ("a real approved build prompt, a real PR").

---

## Recent Changes (Session 48, August 5, 2026)

**WST Orchestrator Phase 1 (control plane)**

First implementation session for the multi-repo Claude Code orchestration system designed
in `ORCHESTRATOR_DESIGN.md`. Scoped strictly to Phase 1: the four control-plane tables plus
two admin surfaces, testable by hand with seeded rows. No GitHub App, no runner repo, no
dispatch flow, no pgvector search, no scheduler — those are Phases 2 through 4.

**Two deviations from the design doc's literal schema draft, both intentional:**
1. `repos.stack_type` (single enum) was split into `framework_type` ('nextjs' | 'vite' |
   'other') and `auth_convention` ('supabase_auth' | 'shared_secret' | 'none' | 'other').
   ORCHESTRATOR_DESIGN.md §2 itself flags this as needed — three distinct auth conventions
   exist across the fleet, and folding them into one enum with the frontend framework choice
   was already called out as wrong before any code was written.
2. `review_items.open_questions` items now carry an `answer` field inline (each question
   answered individually, not one shared blob). Decided with Drew before this session was
   billed: structured per-question answers over a single shared textarea, since it's cleaner
   for a future agent dispatch to consume "question → answer" pairs directly. `drew_response`
   remains as a fallback field for kinds with no open_questions (production_risk_flag,
   kb_entry_draft) or general notes alongside answered questions.

**Supabase migration, run in SQL editor (see `supabase/schema.sql`):** creates `repos`,
`agent_sessions`, `review_items`, `knowledge_base_entries` (no RLS on any — service-role
only, same convention as `build_cost_entries`), enables the `vector` extension for
`knowledge_base_entries.embedding` (Phase 3 will actually populate/query it). Seeds the 5
known fleet repos from ORCHESTRATOR_DESIGN.md §2 — `github_owner` assumed `worldshifttech`
for all 5 (only confirmed explicitly for forgotten-realms-dm and wst-build-manager in the
doc); `entos-group-website`'s `client_project_id` left NULL, link it via `/admin/repos/[id]`
if a real projects row exists for that client. Also seeds one test `review_items` row per
`kind` (consolidated_review / production_risk_flag / kb_entry_draft) so `/admin/reviews`
could be confirmed by hand before any real agent exists — delete those three once Phase 2
produces real ones.

**`app/api/admin-repos/route.ts`** (new, POST) and **`app/api/admin-repos/[id]/route.ts`**
(new, PATCH): same `verifyAdmin` bearer-token pattern as `admin-projects`.

**`app/admin/repos/page.tsx` + `RepoFleetClient.tsx`** (new): fleet list (name,
github_owner/repo, framework, auth convention, automation badge, last planning session) +
inline "New Repo" form, same split as `admin/audit-knowledge`. `FRAMEWORK_OPTIONS` and
`AUTH_OPTIONS` are exported from `RepoFleetClient.tsx` and reused by the detail page rather
than duplicated.

**`app/admin/repos/[id]/page.tsx` + `RepoDetailClient.tsx`** (new): full field edit
(name, local_path, github_owner/repo, vercel_project_id, framework_type, auth_convention,
client_project_id via a dropdown of existing `projects`, automation_enabled toggle,
planning_interval_hours, github_app_installation_id). No "Run Planning Session" button yet
— left a `{/* Phase 2: Run Planning Session */}` comment marking where it lands.

**`app/api/admin-reviews/[id]/route.ts`** (new, PATCH): same `verifyAdmin` pattern. Accepts
`{ open_questions?, drew_response? }`, overwrites whichever is provided, sets
`status = 'answered'` and `answered_at`.

**`app/admin/reviews/page.tsx` + `ReviewInboxClient.tsx`** (new): Pending/Answered tabs.
Page does a nested Supabase select (`review_items` → `agent_sessions` → `repos`) to get the
repo name and session type per card without extra round trips. Each card: kind badge (3
colors), repo + session type, summary, `proposed_content` in a monospace block (same
styling as the build-prompt block in `AdminDashboard.tsx`), one input per open question with
its `suggested_options` as chips that append into that question's own input, a
`drew_response` textarea (required when a card has zero open_questions, optional
otherwise), "Submit Answers" disabled until every question has an answer. Answered cards
render read-only with each answer shown beneath its question.

**`app/admin/AdminDashboard.tsx`**: added "Repos" and "Reviews" nav links next to "Audit
KB". Nothing else in this file touched.

Verified with `npx tsc --noEmit` (clean) and `npm run build` (clean, all new routes listed).
Both new pages confirmed to hit the same auth redirect as the existing `/admin` pages
(307 → `/admin/login`) via local dev server logs — the authenticated UI itself needs Drew's
own login to check by eye, no way to verify that part headlessly.

**Next: Phase 2 — `wst-orchestrator-runner` repo, GitHub App token exchange, one manual
"Run Planning Session" button wired end-to-end to a real repo, real review card, real
approved build prompt, real PR (ORCHESTRATOR_DESIGN.md §10).**

**Same-day follow-up:** the migration failed partway on first real run — `repos` seeded
correctly (5 rows), but the `agent_sessions` test-row insert threw `ERROR: 21000: more than
one row returned by a subquery used as an expression` on
`(SELECT id FROM repos WHERE github_repo = 'worldshifttech-landing')`, which had no
`LIMIT 1`. `review_items`/`knowledge_base_entries` were created but stayed empty as a
result. Fixed in `supabase/schema.sql`: added `LIMIT 1` to that subquery, and a comment
warning that the `repos` seed INSERT isn't idempotent (no unique constraint on
`github_repo`) — don't re-run it if `repos` already has rows, skip straight to the test
data. Drew ran the leftover `agent_sessions` + `review_items` inserts by hand to finish
seeding.

**Second same-day follow-up:** hand-testing the review inbox surfaced a real gap —
`production_risk_flag` and `kb_entry_draft` cards only had a generic "your response"
textarea, and Drew's own test answers ("Not sure what this does") confirmed it wasn't
clear what either kind was actually asking for. `ReviewInboxClient.tsx` now renders
decision buttons instead of a blank textarea for these two kinds: Acknowledge & Proceed /
Stop for `production_risk_flag`; Approve / Edit / Discard for `kb_entry_draft`, where Edit
reveals an editable copy of `proposed_content` (an optional notes textarea stays available
under both). `drew_response` is built as `"{decision}\n\n{notes}"` on submit.
`app/api/admin-reviews/[id]/route.ts` extended to accept an optional `proposed_content` so
the Edit path can persist the revised draft, not just record that an edit happened. Also
wrote up Drew's other idea from this same testing pass — a per-card "Ask AI" help chat —
into `ORCHESTRATOR_DESIGN.md` §5 as a proposed Phase 2+ feature, not built yet (needs its
own design pass: what context the assistant gets, whether it drafts answers or only
explains, what route it hits). The two test rows (`production_risk_flag`,
`kb_entry_draft`) were reset back to `status = 'pending'` via direct Supabase write so the
new buttons could be tried against real data instead of just a clean build.

---

## Recent Changes (Session 47, August 5, 2026)

**File uploads, both sides**

Files live in a private Supabase Storage bucket (`project-files`, 25MB cap), never a public one, so a password-protected project's files stay behind the same gate as the page itself. Every read and write goes through the service-role client via signed URLs, there are no `storage.objects` RLS policies. Judgment calls made without asking, flagged here per the Session 46 pattern: shared two-way file list (Drew's uploads and the client's both show in one list, not just client-to-Drew), no client-side delete, Slack notification fires only on client uploads.

**`lib/project-files.ts`** (new): `BUCKET` constant, `MAX_FILE_SIZE` (25MB), `buildStoragePath(projectId, fileName)` — randomized path, never guessable from the original filename.

**`app/api/project-files/upload-url/route.ts`** (new, POST): issues a signed upload URL. Dual auth: `uploadedBy: "drew"` requires the admin bearer token (same pattern as `admin-projects`); `uploadedBy: "client"` requires a valid Turnstile token (verified against Cloudflare's siteverify endpoint, same pattern as `/api/personalize`) plus project access (public project, or a valid `wst_pa_{slug}` cookie for password-protected ones).

**`app/api/project-files/route.ts`** (new, POST): records the `project_files` row after the browser finishes uploading to the signed URL. Re-runs the same access check as the route above, does not re-verify `turnstileToken` since Cloudflare tokens are single-use and already spent. Fires a fire-and-forget POST to `/api/notify-slack` (`type: "file_upload"`) when `uploaded_by === "client"`, using `req.nextUrl.origin` to build the absolute URL since a server-side `fetch` can't resolve a relative path.

**`app/api/project-files/[id]/route.ts`** (new, DELETE): admin-only, removes the storage object then the row.

**`app/api/notify-slack/route.ts`**: added a `file_upload` branch ahead of the existing `audit`/`resubmission`/default chain.

**`app/projects/[slug]/FileUploads.tsx`** (new): client-facing file list + upload form. Turnstile widget rendered explicitly, same pattern as `app/meet/page.tsx`; submit disabled until a token exists. Upload flow: request signed URL, `uploadToSignedUrl` straight from the browser to Supabase Storage (bypasses Vercel's function payload limit entirely), confirm via the POST route, `router.refresh()`. `app/projects/[slug]/page.tsx`: fetches `project_files` + a fresh `createSignedUrl` (1 hour expiry) per file, renders `<FileUploads>` in place of the old placeholder. Feedback placeholder (Session 48) untouched.

**`app/admin/projects/[id]/FileUploads.tsx`** (new): same list, no Turnstile (already behind the admin login), adds a delete (×) per row. `app/admin/projects/[id]/page.tsx` and `ProjectDetailClient.tsx`: fetch/pass `files`, render `<FileUploads>` in place of the old placeholder.

**Supabase migration, run in SQL editor (see `supabase/schema.sql`):** creates the private `project-files` storage bucket with a 25MB `file_size_limit`. No new tables, `project_files` already existed from Session 46.

**Next sessions:** 48 (client feedback, both sides), 49 (wire `ingest-build-cost` to resolve `project_id`, surface real hours/cost against budget caps).

---

## Recent Changes (Session 46, August 4, 2026)

**Backend rehaul: client accounts retired everywhere, project backend rebuilt around a roadmap model**

Drew is now the only login on the site. Clients never sign up or sign in, each project has a direct link, either open or gated by a per-project password (no Supabase Auth involved in that gate at all). The old wizard to account to status-queue system (submitted/reviewed/approved/building/live) is gone. Two judgment calls made during this session, flagged for Drew to sanity-check: (1) `audit_estimates` capture itself was kept (still useful lead data for the Audits tab), only the account-creation "save your report" step was removed. (2) The old id-based `/projects/[id]` client page is fully replaced by `/projects/[slug]`, not kept alongside.

**Retired (deleted, not just disconnected):**
- `app/projects/new/` (ProjectWizard.tsx + page.tsx), the public 6-question scope wizard
- `app/projects/page.tsx`, `app/projects/ProjectList.tsx`, `app/projects/GuestProjectAttacher.tsx`
- `app/projects/[id]/` (old auth-gated client detail page + edit/resubmit client component)
- `app/components/AuthModal.tsx`, the site-wide login/signup modal
- `app/audit/AuthModal.tsx`, the audit tool's "create an account to save your report" modal
- `app/api/attach-guest-project/route.ts`, `app/api/attach-guest-audit/route.ts`
- `app/api/admin-update-status/route.ts`, `app/api/admin-update-demo-url/route.ts`, `app/api/notify-client/route.ts`, `app/api/generate-scope/route.ts`, all exclusively served the old wizard/status-queue flow; orphaned once AdminDashboard and ProjectWizard were gone, so removed rather than left dead. `/content/claude-code-prompt-template.md` is now unused by any route but was left in place (not code, no harm sitting there).

**`app/page.tsx`, `app/your-team-and-ai/page.tsx`**: removed the `<AuthModal />` nav block (Suspense + import). No visible "Log In" entry point on any public page anymore, that's intentional, see `/admin/login` below.

**`app/audit/AuditWizard.tsx`**: removed the `showAuth`/`reportSaved` state, the unused `auditId` state (was only read by the now-deleted AuthModal), and the "Save My Report" / "Log in to save" CTAs. The post-report action is now just the existing "Book a Call" button, styled as the primary CTA. The guest insert into `audit_estimates` (`guest: true, user_id: null`) is unchanged, that data still feeds the admin Audits tab.

**`app/auth/callback/route.ts`**: simplified to a plain `exchangeCodeForSession` + redirect to `/admin`. Removed all `guestProjectId` cookie handling (no guest projects left to attach).

**`app/admin/login/page.tsx`** (new): Drew-only login: email/password via `lib/auth.ts`'s `signIn`, plus a "Continue with Google" option (reuses the OAuth callback above). Not linked from any nav, reached by direct URL only.

**`app/admin/page.tsx`**: auth-gate redirect target changed from `/` to `/admin/login`. Data fetch changed from the old `projects` columns (status/scope/answers/claude_code_prompt/etc.) to the new schema's columns. `audit_estimates` fetch for the Audits tab is unchanged.

**`app/admin/audit-knowledge/page.tsx`**: same gate redirect target change (`/` to `/admin/login`) for consistency with `/admin`.

**`app/admin/AdminDashboard.tsx`**: full rewrite of the Projects tab: a project list (title, client name, percent complete bar, next-update note, access-mode badge) with a "New Project" inline form (title, client name, slug, access mode, password) that POSTs to `/api/admin-projects` and redirects into the new detail page. All the old status-pipeline UI, scope viewer, Claude Code prompt/README blocks, and demo-URL editor are gone. The Audits tab and its types/consts (`AuditFinding`, `AuditReportData`, `AuditEstimate`, `WASTE_SCORE_STYLES`, `IMPACT_TEXT`, `relativeDate`) were carried over unchanged. Impact tab unchanged. Added a `SignOutButton` to the admin nav (wasn't there before, now that there's a real login page, there should be a way out of the session).

**`app/admin/projects/[id]/page.tsx` + `ProjectDetailClient.tsx`** (new): full project management screen: editable core fields (title, client name, percent complete slider, next-update note/date, access mode + password, budget type/hours-cap/hourly-rate), a milestone editor (add/edit/delete, title/description/status/target-date, no persistence until Save), a read-only "logged so far" line computed from `build_cost_entries` matched by `project_slug` (not `project_id` yet, see Session 49 note below), a "View Client Page" link and "Copy Link" button, and two static "coming in a future session" placeholders for files and feedback. Save PATCHes `/api/admin-projects/[id]`, which replaces the project's milestones wholesale (delete-then-reinsert, fine at this list size) alongside the core field update.

**`app/projects/[slug]/page.tsx` + `PasswordGate.tsx`** (new): the client-facing roadmap page. No login. If `access_mode = 'password'`, checks for a signed `wst_pa_{slug}` cookie (HMAC via `WST_COOKIE_SECRET`, see `lib/project-access.ts`); missing or invalid renders `PasswordGate` only, which POSTs to `/api/project-access` and `router.refresh()`s on success. Public projects skip the gate. Renders percent complete, next-update note/date, milestones (read-only), and a budget-vs-logged line if `budget_type = 'hourly'`. Same file/feedback placeholders as the admin side.

**`lib/project-access.ts`** (new): `hashPassword`/`verifyPassword` (Node `crypto.scryptSync`, salted, no new dependency), `signAccessToken`/`verifyAccessToken` (HMAC-SHA256 over the slug, keyed by `WST_COOKIE_SECRET`), `accessCookieName`. Falls back to a fixed dev-only secret if `WST_COOKIE_SECRET` isn't set, so `npm run dev` doesn't break, production must have it set for real.

**`app/api/admin-projects/route.ts`** (new): POST, creates a project. Same bearer-token admin-email verification pattern as the old `admin-update-status` route.

**`app/api/admin-projects/[id]/route.ts`** (new): PATCH, updates core fields + replaces milestones. Same admin verification pattern.

**`app/api/project-access/route.ts`** (new): POST, public. Verifies a project's password and sets the signed access cookie.

**New required Vercel env var: `WST_COOKIE_SECRET`**, any long random string. Added to `.env.local` for local dev (gitignored, not committed); must be added to Vercel's production env vars separately before this goes live, not something this session can do.

**Supabase migration, run in SQL editor before deploying (see `supabase/schema.sql` for the full block):**
- Renames the old `projects` table to `projects_archive_2026` (archived, not dropped)
- Creates a fresh `projects` table with no `user_id`/RLS (no client accounts to scope rows to)
- Creates `project_milestones`, plus `project_files` and `project_feedback` (schema only, no UI reads/writes them until Sessions 47 to 48)
- Adds a `project_id` column to `build_cost_entries` (not populated yet, Session 49 will resolve it from `project_slug` in `ingest-build-cost` and surface real usage against the budget cap)

**Next sessions:** 47 (file uploads, both sides), 48 (client feedback, both sides), 49 (wire `ingest-build-cost` to resolve `project_id`, surface real hours/cost against budget caps instead of the `project_slug` join used today).

---

## Recent Changes (Session 45 â€” June 8, 2026)

**Privacy Policy and Terms and Conditions pages**

`/app/privacy/page.tsx` (new file):
- Static server component. No auth, no data fetching, no “use client”.
- Minimal nav (logo link to / only, no CTA). max-w-3xl content column.
- Sections: Information We Collect, How We Use Your Information, Third-Party Services (Anthropic, Supabase, Vercel, Cloudflare, Resend, Google), Cookies, Guest Submissions (90-day retention), Data Retention, Your Rights, Children, Changes to This Policy, Contact.
- Key disclosure: visitor wizard/audit answers are sent to Anthropic's Claude API â€” explicitly called out in Third-Party Services.

`/app/terms/page.tsx` (new file):
- Static server component. Same layout pattern as privacy page.
- Sections: Acceptance of Terms, What This Site Is, AI-Generated Content (scope docs and audit reports are informational only, not binding quotes), Scope and Pricing Estimates, Audit Reports, Your Account, Acceptable Use, Intellectual Property, Limitation of Liability, Governing Law (State of Colorado), Changes to These Terms, Contact.
- Governing law: State of Colorado â€” WST is a Colorado-registered business.

`/app/page.tsx` (footer updated):
- Added Privacy Policy and Terms links to the footer copyright line, separated by `·` dots.
- Uses Next.js `<Link>` for both. No other content on the page was touched.

No SQL. No schema changes. No new dependencies. Deploy with `vercel --prod`.

---

## Recent Changes (Session 42 â€” May 19, 2026 â€” continued)

**Fix: await params in curriculum dynamic routes**

Next.js 15+ changed `params` to a Promise. Synchronous access returned `undefined`, causing `parseInt(undefined) = NaN` which triggered `notFound()` on every curriculum sub-route (`/curriculum/[domain]`, `/curriculum/[domain]/[module]`, `/curriculum/[domain]/[module]/[lesson]`). Fixed by destructuring after `await params` in all three files.

**Curriculum nav link â€” authenticated only**

`/app/components/CurriculumNavLink.tsx` (new):
- Client component. On mount, calls `getSupabaseBrowser().auth.getSession()`. Renders a "Curriculum" pill link only when a session exists. Invisible to logged-out visitors.
- Wrapped in `<Suspense fallback={null}>` in `/app/page.tsx` alongside `AuthModal`.

**Curriculum access restricted to Drew**

All four curriculum pages (`/curriculum`, `/curriculum/[domain]`, `/curriculum/[domain]/[module]`, `/curriculum/[domain]/[module]/[lesson]`) now redirect to `/` if `session.user.email !== "drew@worldshifttech.com"`. Same gate pattern as `/admin`.

---

## Recent Changes (Session 42 â€” May 19, 2026)

**Curriculum learner UI â€” full read/learn/track flow**

`/scripts/seed-curriculum.ts` (run):
- Seeded 6 domains, 25 modules, 100 lessons, 25 assessments into Supabase. Wipes and reseeds cleanly. Run with: `NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node"}' scripts/seed-curriculum.ts`

`/app/curriculum/page.tsx` (new):
- Auth-protected server component. Fetches all 6 domains via `getDomains()`. Renders domain cards (number, title, subtitle, hours, prerequisites) with links to `/curriculum/[domain]`. Dark brand layout matching the rest of the app.

`/app/curriculum/[domain]/page.tsx` (new):
- Server component. Fetches domain + modules for the domain. Shows domain overview text, practitioner note (teal left-border callout), and a module list with estimated times linking to `/curriculum/[domain]/[module]`. 404 on unknown domain.

`/app/curriculum/[domain]/[module]/page.tsx` (new):
- Server component. Fetches module, all lessons, user progress, and the module assessment. Renders learning objectives, a lesson checklist with teal completion circles, and the assessment prompt. Completion state derived from `curriculum_progress` rows cross-referenced by lesson UUID. 404 on unknown module.

`/app/curriculum/[domain]/[module]/[lesson]/page.tsx` (new):
- Server component. Fetches lesson (with nested module + domain via join), all sibling lessons for prev/next navigation, and user progress. Renders `LessonViewer` client component.

`/app/curriculum/[domain]/[module]/[lesson]/LessonViewer.tsx` (new):
- Client component. Renders lesson content (core_content, reflection_prompt, ai_prompt_suggestions, key_takeaway) with full markdown-style formatting (bold headers, numbered lists, italic, inline bold). "Mark Complete" button fires POST to `/api/curriculum/progress` and updates local state. Prev/Next navigation bar at the bottom. If no next lesson, shows "Back to Module" link.

`/app/api/curriculum/progress/route.ts` (new):
- POST `{ lessonId, status }`. Validates session via cookie-based anon client. Upserts into `curriculum_progress` using service role (sets `completed_at` or `started_at` based on status). Returns 401 if unauthenticated.

`/app/projects/page.tsx` (updated):
- Added "Curriculum" nav link alongside "Your Team & AI" in the authenticated dashboard header.

---

## Recent Changes (Session 41 â€” May 15, 2026)

**Curriculum platform â€” database schema + query helpers (Tasks 1 and 3 of Session 1)**

`/supabase/schema.sql` â€” appended curriculum migration:
- 6 new tables: `curriculum_domains`, `curriculum_modules`, `curriculum_lessons`, `curriculum_assessments`, `curriculum_progress`, `curriculum_responses`
- Schema matches build spec exactly: foreign keys, jsonb defaults, denormalized `module_number`/`domain_number` fields, `is_capstone` flag on assessments, `UNIQUE` constraints on all join columns
- RLS: content tables (`domains`, `modules`, `lessons`, `assessments`) â€” SELECT for `auth.role() = 'authenticated'`; learner tables (`progress`, `responses`) â€” SELECT/INSERT/UPDATE scoped to `auth.uid() = user_id`
- No existing tables touched

`/lib/curriculum.ts` â€” new file, 6 query helpers using `getSupabase()` (service role):
- `getDomains()` â€” all domains ordered by number ascending
- `getModulesByDomain(domainNumber)` â€” modules for one domain ordered by module_number
- `getLessonsByModule(moduleNumber)` â€” lessons for one module ordered by sort_order
- `getLesson(lessonNumber)` â€” single lesson joined with its module and domain via nested select
- `getAssessmentByModule(moduleNumber)` â€” single assessment for a module
- `getUserProgress(userId)` â€” all curriculum_progress rows for a user

**Next: run curriculum migration in Supabase SQL editor, then write `/scripts/seed-curriculum.ts` (Task 2).**

---

## Recent Changes (Session 40 â€” May 12, 2026)

**Audit knowledge base expanded with 9 new infrastructure and productivity tool entries**

Audit knowledge base expanded with 9 new infrastructure and productivity tool entries: Vercel, Supabase, GitHub, Resend, Cloudflare, Slack, ClickUp, Calendly, AI Notetaker. Data sourced from AWS 2024 Sustainability Report, SummarizeMeeting Jan 2026 benchmark, and verified infrastructure provider documentation. TOOL_SLUG_MAP and SLUG_TO_FILE updated in lib/audit-knowledge.ts. 9 new .md reference files added to content/audit-knowledge/.

`/lib/audit-knowledge.ts`:
- TOOL_SLUG_MAP: added `Vercel` â†’ `vercel`, `Supabase` â†’ `supabase`, `GitHub` â†’ `github`, `GitHub Actions` â†’ `github`, `Resend` â†’ `resend`, `Cloudflare` â†’ `cloudflare`, `Calendly` â†’ `calendly`, `Fireflies` / `Fireflies.ai` / `Otter` / `Otter.ai` / `Fathom` / `Read.ai` / `Grain` / `Notta` / `AI Notetaker` / `Meeting Notetaker` â†’ `ai-notetaker`. Updated `Slack` from `general` â†’ `slack`, `Vercel` from `general` â†’ `vercel`.
- SLUG_TO_FILE: added `vercel`, `supabase`, `github`, `resend`, `cloudflare`, `slack`, `calendly`, `ai-notetaker` â†’ corresponding `.md` filenames.

New files in `/content/audit-knowledge/`:
- `vercel.md` â€” AWS infrastructure, serverless/edge, preview deployment cleanup, bundle optimisation
- `supabase.md` â€” AWS infrastructure, database right-sizing, unused projects, Realtime subscriptions
- `github.md` â€” Azure infrastructure, GitHub Actions efficiency, caching, scheduled workflow audit
- `resend.md` â€” AWS infrastructure, transactional email hygiene, bounce suppression, trigger bug detection
- `cloudflare.md` â€” Proprietary network, carbon neutral since 2021, cache hit ratio, Worker audit
- `slack.md` â€” AWS infrastructure, channel proliferation, bot audit, inactive seat removal
- `calendly.md` â€” AWS infrastructure, unused event types, seat audit, integration cleanup
- `ai-notetaker.md` â€” Covers Fireflies, Otter.ai, Fathom, Read.ai, Grain, Notta; opt-in recording, retention policy, SummarizeMeeting Jan 2026 accuracy benchmark (76â€“93%)

Note: `clickup.md` already existed from Session 39 â€” not recreated.

---

## Recent Changes (Session 39 â€” May 12, 2026)

**Audit knowledge base â€” Supabase table, content files, lib module, prompt injection, admin viewer**

**Supabase migration (run manually in SQL editor):**
```sql
CREATE TABLE IF NOT EXISTS audit_knowledge (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_slug text NOT NULL UNIQUE,
  tool_name text NOT NULL,
  category text NOT NULL,
  footprint_summary text NOT NULL,
  reduction_strategies text NOT NULL,
  audit_questions text NOT NULL,
  key_metrics text NOT NULL,
  wst_positioning text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
```
Then run the `INSERT` statement (14 rows â€” 13 tools + general reference) in the same SQL editor session.

`/content/audit-knowledge/` (new directory, 13 files):
- `chatgpt-openai.md`, `claude-anthropic.md`, `gemini-google.md` â€” AI/LLM tools
- `zapier.md`, `make.md`, `n8n.md` â€” Automation platforms
- `clickup.md`, `notion.md`, `airtable.md` â€” Project management / SaaS
- `aws.md`, `gcp.md` â€” Cloud infrastructure
- `intercom-zendesk.md` â€” Customer support platforms
- `general-reference.md` â€” Universal framework for tools without a dedicated doc
- Each file: footprint facts, reduction strategies with specific % metrics, audit questions, recommended actions table, WST positioning note, green scoring rubric

`/lib/audit-knowledge.ts` (new file):
- `AuditKnowledgeBlock` interface
- `TOOL_SLUG_MAP` â€” maps Q10 tool display names to database slugs
- `SLUG_TO_FILE` â€” maps slugs to markdown filenames
- `ALL_AUDIT_TOOLS` â€” ordered list of all 13 tools with slug, name, category, file (used by admin sidebar)
- `getAuditKnowledge(q10Tools, q10Other)` â€” fetches matching rows from `audit_knowledge` Supabase table based on Q10 answers; always appends `general` slug
- `formatKnowledgeForPrompt(blocks)` â€” formats fetched blocks into a structured section for Claude system prompt injection
- `getAuditDoc(slug)` â€” reads the corresponding markdown file from `/content/audit-knowledge/` for server-side rendering in admin viewer

`/app/api/generate-scope/route.ts` (updated):
- Added `getAuditKnowledge` and `formatKnowledgeForPrompt` imports
- Before Claude call: extracts Q10 tools from answers, fetches matching knowledge blocks from Supabase, formats into `knowledgeSection` string
- Knowledge section injected into Claude system prompt immediately before the JSON schema instruction â€” informs `green_score`, `green_score_reason`, and `green_offset_estimate` fields with tool-specific footprint data

`/app/admin/audit-knowledge/page.tsx` (new file):
- Drew-only server component (same JWT gate as `/admin` â€” redirects to `/` if not `drew@worldshifttech.com`)
- Fixed 260px sidebar: WST white logo, "Audit Knowledge Base" label, client-side search input (filters by name/category), tool list grouped by category (AI/LLM, Automation, Project Management, Cloud Infrastructure, Customer Support, Reference), active tool highlighted with teal left border and teal text
- Tool selected via `?tool=<slug>` URL search param
- Main content: reads markdown via `getAuditDoc(slug)`, renders in `<pre>` with `fontFamily: inherit` and `whiteSpace: pre-wrap` (marked not installed â€” no new package added)
- Empty state when no tool selected: centered "Select a tool from the sidebar to view its audit reference."

`/app/admin/audit-knowledge/AuditKnowledgeClient.tsx` (new file):
- Client component for search input + grouped tool list; uses `useState` for query, `useSearchParams` for active slug detection

`/app/admin/AdminDashboard.tsx` (updated):
- "Audit KB" teal nav link added to the admin header, pointing to `/admin/audit-knowledge`

**Next: test scope generation with Zapier + ClickUp + AWS in Q10 to verify `green_score` reflects the knowledge base; test admin viewer renders all 13 docs correctly.**

---

## Recent Changes (Session 38 â€” May 11, 2026)

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

**Supabase migration â€” run in SQL editor before testing:**
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

## Recent Changes (Session 37 â€” May 11, 2026)

**New page: /impact + nav link**

`/app/impact/page.tsx` (new file):
- Static server component. No `"use client"`, no data fetching, no auth required. Publicly accessible.
- Dark background (`#080C14`), Playfair Display headlines, DM Sans body, teal and offwhite brand tokens. Matches site layout.
- Teal small-caps section label ("WHERE THE MONEY GOES"), large Playfair headline, two-paragraph intro at reduced opacity, teal divider.
- Four org cards (navy `#00205C` background, `2px solid #4B858E` top border): AI Now Institute, Distributed AI Research Institute (DAIR), Southern Environmental Law Center, Public Citizen Energy Program.
- Each card: org name (Playfair), meta line (location, status, founded year), teal tag pill, body paragraph, "WHAT THEY'VE DONE" label (small caps gray), wins paragraph. Copy verbatim as specified.

`/app/page.tsx` â€” nav only:
- Added "Impact" link (`href="/impact"`) after "Your Team & AI", before `AuthModal`. Identical teal ghost-pill style.

No API routes, Supabase schema, or other files modified.

**Follow-up: Learn more links added to /impact org cards**

Each of the four org cards now has a teal text "Learn more" link at the bottom opening the org's about page in a new tab. Links: AI Now Institute, DAIR, SELC, Public Citizen Energy Program.

---

## Recent Changes (Session 36 â€” May 8, 2026)

**Content rewrite of /your-team-and-ai + SEO metadata export**

`/app/your-team-and-ai/page.tsx`:
- Added `export const metadata` with new page title (`Your Team & AI â€” World Shift Technologies`) and new meta description per brand brief.
- Section 1 eyebrow unchanged. h2 updated: "Two mistakes, stacked." to "These are the two mistakes." Body paragraph rewritten around the "save money / make it easy" framing and team resistance dynamic.
- Section 2 opening paragraph rewritten to lead with the vision angle ("Vision doesn't come from a system. It comes from people."). New connector sentence added: "Here are the four things AI doesn't replace." Relationships paragraph ending updated to "human interaction." Critical thinking paragraph updated with new example about a long-time partner and explicit statement that "AI doesn't build that."
- Section 3 h2 updated: "More AI is not the answer." to "More AI isn't the answer." Body rewritten: environmental framing replaced with a precise/general-purpose AI contrast. New final paragraph on what the work requires.
- Section 4 eyebrow updated: "HOW TO ACTUALLY DO IT" to "HOW TO TAKE THE RIGHT STEPS." h2 updated: "Six steps. No acronyms." to "Take full accountability for your operations and processes." Intermediate "Practical steps..." paragraph removed. All six bold items rewritten: new content on operations inventory, role documentation, role redefinition, institutional knowledge, cutting waste, and measuring outcomes.
- Section 5 eyebrow updated: "WHEN THE QUESTION IS BIGGER THAN ONE TEAM" to "WHEN YOU'RE OPERATING AT ENTERPRISE SCALE." h2 updated: "If you're past 50 people." to "If you're enterprise." Body rewritten to open with "operating at enterprise scale" framing.
- Zero em-dashes in user-facing copy. Em-dash in the page title metadata and in code comments only.
- No layout, styling, component, or structural changes.

**SEO pass (Task 2) applied.** Updated titles and descriptions across three files:
- `app/layout.tsx` â€” default title and description (homepage + all pages without their own metadata export)
- `app/audit/page.tsx` â€” description updated; title kept
- `app/fractional/page.tsx` â€” metadata export added (was inheriting stale default)

---

## Recent Changes (Session 35 â€” May 8, 2026)

**New page: /your-team-and-ai + nav additions**

`/app/your-team-and-ai/page.tsx` (new file):
- Static server component. No client interactivity, no `"use client"`.
- 6 sections: Hero (eyebrow + H1 + subhead, no CTA), The Framing Most Companies Get Wrong, What Your Team Has That AI Doesn't, Less AI Used Precisely, How to Actually Do It, and a closing section with bottom CTA linking to `/audit`.
- Section 5 includes a POPin handoff: `<a href="https://www.popinrescue.com">POPin</a>` opens in a new tab.
- All body text on dark background uses `--color-offwhite` (`#F4F2EE`). Eyebrows are teal small caps. Headlines use Playfair Display via inline `style={{ fontFamily: 'var(--font-playfair)' }}`.
- No em-dashes anywhere. No reassurance language.
- Footer: centered single line, copyright only, no email link.

`/app/page.tsx` â€” nav only:
- Added "Your Team & AI" ghost-style link (matching Book a Call style) between "Book a Call" and the AuthModal block.

`/app/projects/page.tsx` â€” nav only:
- Added "Your Team & AI" ghost-style link before the user email + Sign Out cluster. Hidden on mobile (`hidden sm:inline-flex`).

No API routes, Supabase schema, wizard, or admin changes in this session.

---

## Recent Changes (Session 34b â€” May 8, 2026)

**Nav cleanup and dashboard action buttons**

`/app/page.tsx` â€” removed "Get an Audit" pill link from the homepage nav. Nav now shows only Book a Call + Log In / Get Started.

`/app/projects/page.tsx` â€” added "Get an Audit" (teal outlined) and "Start a New Project" (teal filled) as a button pair in the dashboard header, replacing the single "Start a New Project" button. Both links are wrapped in a flex container to keep them inline.

---

## Recent Changes (Session 34 â€” May 8, 2026)

**Slack notification on audit completion + Admin Audits tab**

`/app/api/notify-slack/route.ts` â€” extended to handle `type: "audit"`:
- New condition for `type: "audit"` formats: `ðŸ” New Audit: *[business_name]* â€” [business_type], [team_size]`, stack list, spend/waste score, and waste estimate range.
- Accepts: `business_name`, `business_type`, `team_size`, `monthly_spend_range`, `tools` (flat deduplicated array), `waste_score`, `estimated_monthly_waste_low`, `estimated_monthly_waste_high`.
- Existing `submission` and `resubmission` handling unchanged.

`/app/audit/AuditWizard.tsx` â€” fires Slack notification after audit report is confirmed:
- After `/api/generate-audit` returns successfully and report is set in state, fires fire-and-forget POST to `/api/notify-slack` with `type: "audit"`.
- Builds flat deduplicated `tools` array from `mergedTools` (all tools across all departments).
- Uses `data.waste_score`, `data.estimated_monthly_waste_low`, `data.estimated_monthly_waste_high` from the report.
- Does not await; fails silently; does not block the reveal state.

`/app/admin/AdminDashboard.tsx` â€” added Audits tab:
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

`/app/admin/page.tsx` â€” fetches audit estimates:
- After existing projects fetch, adds service role fetch from `audit_estimates` ordered by `created_at desc`.
- Maps result to `AuditEstimate[]`; passes as `auditEstimates` prop to `AdminDashboard`.
- Falls back to empty array if fetch fails or returns null.

---

## Recent Changes (Session 33 â€” May 7, 2026)

**AI waste estimate wizard at `/audit`**

`/app/audit/page.tsx` â€” server component, renders `AuditWizard`.

`/app/audit/AuditWizard.tsx` â€” 5-phase client wizard:
- Phase 1: business name, business type (pill select), team size (pill select, auto-advances)
- Phase 2: department checkbox grid (Operations, Sales, Marketing, Customer Support, Finance, HR, Product/Dev, Creative, Legal, Executive)
- Phase 3: per-department tool checkbox grid + free-text "other tools" field; loops through each selected dept
- Phase 4: AI usage toggles (deduplicated tool list) + monthly spend range pills
- Phase 5: 3s animated teal progress bar + cycling loading lines; reveals report card when both bar and API resolve
- Report card: waste score badge (low/medium/high/critical), waste estimate card (monthly $ range + hours), findings sorted high to low impact (max 6), quick wins list, environmental note with redirect estimate, CTA (Save My Report / Book a Call)
- Guest insert to `audit_estimates` (non-fatal if Supabase not configured); `auditId` threaded through to auth modal

`/app/audit/AuthModal.tsx` â€” signup/signin modal scoped to audit save:
- Props: `auditId`, `onSuccess`, `onClose`
- Mode toggle signup/signin; handles email confirmation state
- On session: calls `/api/attach-guest-audit` then fires `onSuccess`

`/app/api/generate-audit/route.ts` â€” POST handler:
- Reads `content/tool-registry.json` at request time; matches tools case-insensitively
- Builds per-tool context string (AI features, energy transparency, waste patterns, alternatives)
- Calls `claude-sonnet-4-6` with system prompt: "respond only with valid JSON, no preamble"
- Strips markdown fences before `JSON.parse`
- Updates `audit_estimates` row via service role (non-fatal if env vars missing)
- Returns parsed report JSON

`/app/api/attach-guest-audit/route.ts` â€” POST `{ auditId, userId }`:
- Service role UPDATE where `id = auditId AND guest = true AND user_id IS NULL`
- Returns 400 if row not found or already claimed

`/content/tool-registry.json` â€” ~80 tool entries:
- Shape: `{ id, name, vendor, category, department[], uses_ai, ai_features, pricing_model, typical_monthly_cost_usd, energy_transparency, environmental_notes, waste_patterns[], leaner_alternatives[] }`
- Covers: project management, automation, AI tools, CRM/sales, communication, Google Workspace, Microsoft, meeting intelligence, email marketing, social media, HR/payroll, finance/accounting, storage, dev/hosting, customer support, legal

**Supabase migration â€” run in SQL editor:**
```sql
-- Session 33 â€” audit_estimates table (see supabase/schema.sql for full definition)
CREATE TABLE IF NOT EXISTS audit_estimates ( ... );
ALTER TABLE audit_estimates ENABLE ROW LEVEL SECURITY;
-- + 3 RLS policies (see schema.sql)
```

**Homepage nav:** "Get an Audit" pill link added before "Book a Call" in `/app/page.tsx`.

---

## Recent Changes (Session 32 â€” May 7, 2026)

**Admin dashboard, Supabase schema, and homepage brand refresh**

`/app/admin/AdminDashboard.tsx` â€” client component (full project queue):
- Active projects: status badge, relative date, inline detail panel (scope doc + raw answers), status transitions (submitted â†’ reviewed â†’ approved â†’ building â†’ live), Claude Code prompt + README block (approved/live), demo URL editable input, Regenerate Prompt, Back to Review
- Incomplete section: collapsible, guest-only rows, scope + answers but no status controls
- `AdminProject` type with `claude_code_prompt`, `project_readme`, `demo_url`, `guest`, `scope` (3-tier pricing), `answers`

`/app/admin/page.tsx` â€” server component: JWT gate (drew@worldshifttech.com), service role fetch, email batch lookup, renders `AdminDashboard`.

`/supabase/schema.sql` â€” full schema file committed:
- `generated_pages`, `projects` (with all column migrations through project_readme), RLS policies
- Session 33 `audit_estimates` table and policies appended

---

## Recent Changes (Session 31 â€” May 4, 2026)

**Homepage copy refresh and wizard collapse to 6 questions / 3 chapters**

Copy-only and structural-only change. No API routes, Supabase schema, auth logic, styling, or layout components were modified.

`/app/page.tsx`:
- Hero headline: "Custom tools and AI, built precisely for your business." â†’ "Finally â€” software that fits." (teal span on "software that fits.")
- Hero sub-headline: replaced with "Custom integrations, internal apps, and AI agents built to do exactly what your business needs. You own what I build."
- CTA button: "See What I'd Build For You" â†’ "Let's Scope Out Your Solution"
- Sub-CTA: replaced with "Get an estimated scope of work in under 5 minutes."
- New "You've been here before." section inserted between hero and WHAT I BUILD strip; matches the existing `mt-20 pt-12 border-t border-white/[0.08]` pattern, no eyebrow, single body paragraph.
- Green by Design heading: "Precise tools cause less harm." â†’ "Built Lean. Built Green."; body replaced with the lean-code / smaller-footprint copy. Eyebrow "GREEN BY DESIGN" unchanged.
- Three service card bodies were already correct from a prior session and were not modified.

`/app/projects/new/ProjectWizard.tsx`:
- Chapter array collapsed from 4 chapters / 12 questions to 3 chapters / 6 questions: `{ The Problem [1] }`, `{ The Vision [2, 3] }`, `{ The Build [4, 5, 6] }`.
- New questions render with new internal step numbers 1â€“6 but write to existing legacy field names so `/api/generate-scope` payload stays backward-compatible: Q1â†’`q3`, Q2â†’`q6`, Q3â†’`q8`, Q4â†’`q10` + `q10_other`, Q5â†’`q11`, Q6â†’`q12`.
- Q1 and Q2 are free-text required, 10+ chars to advance. Q3 and Q5 are single-select with click-to-advance. Q4 is multi-select (9 options including "Other" with text reveal). Q6 is optional free text and triggers "See Your Scope".
- Q4 options replaced specific tool names with category labels: CRM, email/marketing automation, project management, database/spreadsheet, communication tools, e-commerce/payments, accounting/finance, "No existing tools / starting fresh", Other.
- `CUSTOM_BUILD_OPTION` constant removed (no longer used). Removed-field values stay at `INIT` defaults (`""` or `[]`) so the legacy answers object shape is preserved end-to-end.
- `nextEnabled`, `next()` reveal trigger (q===6), Next button label switch (q===6 â†’ "See Your Scope"), and chapter progress all updated to 1â€“6. Footer nav is now always visible (the Q1 auto-advance special-case was removed).
- All other logic preserved unchanged: Supabase insert (`projectId`, `user_id`, `guest`, full answers payload, `status: "draft"`), `/api/generate-scope` call, scope card reveal animation, submit flow, guest CTA + AuthModal flow, `/api/attach-guest-project` PATCH, Slack notification, progress bar.

`/WST_BRAND_COPY.md` (new file):
- Locked copy reference for hero, "You've been here before." section, three service cards, and Green by Design.
- Note that "nothing more" should be used sparingly â€” once per page maximum.

---

## Recent Changes (Session 30 â€” April 28, 2026)

**Fix demo URL not persisting in admin panel**

Root cause: `handleSaveDemoUrl` was calling `getSupabaseBrowser()` (anon key), which RLS blocks for admin writes on other users' project rows.

`/app/api/admin-update-demo-url/route.ts` (new file):
- PATCH endpoint; verifies Bearer token via anon client, rejects if not `drew@worldshifttech.com`
- Updates `projects.demo_url` and `updated_at` via `getSupabase()` (service role, bypasses RLS)
- Returns 400 on missing `projectId`, 403 on auth failure, 500 on Supabase error with message

`/app/admin/AdminDashboard.tsx`:
- `demoUrlSaveErrors: Record<string, string>` state added
- `handleSaveDemoUrl` rewritten: gets session token from browser client, then calls `fetch("/api/admin-update-demo-url")` with Bearer auth â€” same pattern as `handleStatusUpdate`
- `console.log('[DEMO URL SAVE]', projectId, url)` fires before the fetch
- `console.log('[DEMO URL SAVE ERROR]', msg)` fires on non-ok response or catch
- On failure: sets `demoUrlSaveErrors[projectId]`; local state and "Saved âœ“" flash only update on success
- Inline red error message rendered below the Save button when `demoUrlSaveErrors[projectId]` is set

---

## Recent Changes (Session 29 â€” April 28, 2026)

**Demo URL shown on client-facing pages with "coming soon" fallback**

`/app/projects/[id]/ProjectDetailClient.tsx`:
- `demo_url: string | null` added to `ProjectProps` type and destructured
- Below the scope card (and Edit & Resubmit button), a `status === "live"` block renders: teal "View Your Demo â†’" button when `demo_url` is set, muted "Demo coming soon" text when `demo_url` is null

`/app/projects/[id]/page.tsx`:
- `demo_url={project.demo_url ?? null}` passed to `<ProjectDetailClient>`
- Existing server-rendered "live demo" section updated: was `live && demo_url` only; now shows "Demo coming soon" muted text when `live && !demo_url`

`/app/projects/ProjectList.tsx`:
- Desktop and mobile "View Demo â†’" link blocks both updated from `live && demo_url` guard to a ternary: link when `demo_url` is set, muted "Demo coming soon" span when null

---

## Recent Changes (Session 28 â€” April 28, 2026)

**Editable demo URL in admin panel (`/app/admin/AdminDashboard.tsx`)**

The read-only demo URL link in the Claude Code Prompt section has been replaced with an inline editable input.

- Input is always visible for `approved` and `live` projects (same condition as the prompt block), pre-filled with the current `demo_url` or empty with placeholder `https://your-vercel-url.vercel.app`
- Inline "Save" button PATCHes the new URL directly to the `projects` table via the Supabase browser client; updates local state immediately on success
- Button text cycles: "Save" â†’ "Saving..." â†’ "Saved âœ“" (2s flash) â†’ back to "Save"
- Three new state variables: `demoUrlDrafts` (per-project draft text), `savingDemoUrlIds`, `savedDemoUrlIds`
- New handler: `handleSaveDemoUrl(projectId, url)` â€” updates DB, local state, and confirmation flash; fails silently (no blocking error state)
- No other panel sections, status controls, or logic changed

---

## Recent Changes (Session 27 â€” April 28, 2026)

**Session permission lines added to prompt template (`/content/claude-code-prompt-template.md`)**

Opening lines updated in both the Prompt Structure section and the Example section at the bottom. Every generated Claude Code build prompt now begins with:

```
Yes, and don't ask again
Yes, allow all edits this session
```

This pre-answers Claude Code's permission prompts so sessions can run without interruption. No other content in the template was changed.

---

## Recent Changes (Session 26 â€” April 28, 2026)

**Richer Questions to Resolve in README generation (`/api/admin-update-status/route.ts`)**

`/app/api/admin-update-status/route.ts`:
- README generation user message updated: the `## Questions to Resolve` section instruction now explicitly directs Claude to derive questions from the scope, stack, integrations, and raw answers â€” covering credentials, existing tools, accounts, data sources, compliance requirements, and anything implied but unspecified. Always includes the three standard URLs (GitHub, Supabase, Vercel) plus 5â€“10 project-specific questions. Previously it listed only the three URLs and said "add any additional questions that cannot be answered from the scope alone," which produced thin output.
- No other logic, conditions, or strings changed.

---

## Recent Changes (Session 25 â€” April 28, 2026)

**Tighten build prompt and README generation in `/api/admin-update-status/route.ts`**

Two fixes to prevent Claude from defaulting to Next.js and OpenAI when generating prompts and READMEs for approved projects.

`/app/api/admin-update-status/route.ts`:
- Build prompt user message replaced with an explicit stack-enforcement version: React + Vite + Supabase + Vercel + Anthropic Claude API is the default; Next.js only if SSR or SEO is explicitly required; AI model is always Anthropic (Sonnet for user-facing, Haiku for utility), never OpenAI; companion docs (SETUP.md, schema.sql, CONTEXT.md, README.md, .env.local.example) explicitly required as numbered steps; no skeletons or TODOs allowed.
- README generation system prompt was previously hardcoded and ignored `claude-code-prompt-template.md` entirely. It now reads the same `template` variable already loaded for the build prompt and injects it as the system prompt, with the same stack-enforcement rules (React + Vite default, Anthropic Claude, no invented env vars or file paths).
- README generation user message simplified to match: instructs Claude to follow the template's README.md section exactly and apply the same stack and AI model defaults.
- No other logic, conditions, error handling, or DB writes changed.

---

## Recent Changes (Session 24 â€” April 28, 2026)

**Supabase session refresh proxy**

`/proxy.ts` (new file, replaces the failed middleware.ts attempt):
- Next.js 16 deprecated `middleware.ts` in favour of `proxy.ts`; exports a `proxy` function (Next.js checks `proxy` before `middleware`)
- Uses `createServerClient` from `@supabase/auth-helpers-nextjs` with `cookies: { getAll, setAll }` â€” `createMiddlewareClient` does not exist in this package version
- Intercepts every request (excluding `_next/static`, `_next/image`, `favicon.ico`) and calls `supabase.auth.getSession()`, which silently refreshes the JWT if it's about to expire and writes the updated cookie back in the response
- Without this, Next.js never refreshes the token server-side and the session dies during inactivity

`/lib/supabase.ts`:
- Added comment confirming `persistSession` defaults to true in `createBrowserClient` â€” no manual config needed
- `getSupabase()` (service role) unchanged

---

## Recent Changes (Session 23 â€” April 28, 2026)

**Project README generation alongside build prompt**

`/supabase/schema.sql`:
- Added `-- MIGRATION: project_readme` + `ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_readme text;` â€” run in Supabase SQL editor

`/content/claude-code-prompt-template.md`:
- Full replacement with the authoritative version. Hyperlinked .md filenames (e.g. `[SETUP.md](...)`) replaced with plain filenames. No structural changes.

`/app/api/admin-update-status/route.ts`:
- On `approved`: now fires a second Claude Sonnet call immediately after the build prompt call to generate a project README
- README system prompt instructs Claude to produce a 10-section orientation doc + "Questions to Resolve" section
- README call wrapped in try/catch â€” logs `[README GENERATION FAILED]`, sets `project_readme = null`, never blocks prompt generation
- Supabase update now saves both `claude_code_prompt` and `project_readme` in one call
- API response now includes `project_readme` alongside `claude_code_prompt` and `demo_url`

`/app/admin/page.tsx`:
- Select query extended to include `project_readme`
- `adminProjects` map extended to pass `project_readme` to `AdminDashboard`

`/app/admin/AdminDashboard.tsx`:
- `AdminProject` type: added `project_readme: string | null`
- Added `copiedReadmeId` state and `handleCopyReadme` handler (2s flip to "Copied âœ“")
- `handleStatusUpdate` and `handleRegeneratePrompt`: both now update `project_readme` in local state from API response
- Detail panel: added "PROJECT README" block directly below the Claude Code Prompt section
  - Same teal small-caps label style as "CLAUDE CODE BUILD PROMPT"
  - Shows same loading skeleton as prompt while `isPromptLoading` is true
  - Scrollable monospace pre block (max 400px), same styling as prompt block
  - "Copy README" button; muted fallback text when `project_readme` is null or empty
  - Shown under same `approved || live` condition as the prompt block

---

## Recent Changes (Session 22 â€” April 28, 2026)

**Home page hero headline simplified (`/app/page.tsx`)**

Copy-only change. No layout, styling, colors, or structure modified beyond what the copy change required.

- Hero headline: removed second line and teal span; now reads as a single sentence: "Custom tools and AI, built precisely for your business."
- Subheadline, all three "What I Build" card titles and descriptions, and the "Green by Design" body paragraph were already correct from Session 21 and were not modified.

---

## Recent Changes (Session 21 â€” April 28, 2026)

**Home page copy updates (`/app/page.tsx`)**

Copy-only changes. No layout, styling, colors, or structure modified.

- Hero headline: "Built for your business, not for thousands of others." â†’ "Custom tools and AI, built precisely for your business â€” not adapted from software designed for everyone else."
- Hero subheadline: "Custom tools, built on lean and green solutions." â†’ "Custom tools and AI solutions built specifically for your business â€” get a precise tool within days, built lean on renewable infrastructure."
- "What I Build" card 1: title "Connections" â†’ "Integrations"; description updated to explain integration value (manual handoffs, re-entry, workflow fragility).
- "What I Build" card 2: title unchanged ("Custom Apps"); description updated to emphasize ownership vs. renting off-the-shelf tools.
- "What I Build" card 3: title unchanged ("Precision Tools"); description updated to emphasize single-focus, lean, fast delivery.
- "Green by Design" body paragraph: replaced with copy explaining why mass-market software wastes resources and how custom-built tools cost less to run over time.

---

## Recent Changes (Session 20 â€” April 27, 2026)

**Project card mobile layout fix (`/app/projects/ProjectList.tsx`)**

Layout-only change. No colors, copy, or non-layout styles modified.

The normal card state (non-confirm) was restructured to use a responsive two-path layout:

- **Mobile (default):** outer div is `flex flex-col gap-2`. Title is full-width with no truncation (`sm:truncate` instead of always-truncate). Below the title, a mobile-only `flex flex-col gap-2 sm:hidden` section renders in this order: status badge (`self-start` so it stays pill-shaped), green score badge (if present, same), date, "View Demo â†’" link (if present, `min-h-[44px] flex items-center` for tap target), delete Ã— button (`w-11 h-11`, already 44px).
- **Desktop (`sm:`):** outer div becomes `sm:flex-row sm:items-center sm:justify-between sm:gap-4`. The mobile stacked section is hidden (`sm:hidden`). A desktop-only `hidden sm:flex` right column renders delete Ã— + status badge + green badge in the original order. "View Demo â†’" link and date are `hidden sm:inline-block` / `hidden sm:block` inside the title column, same as before.

The confirm/delete row was not changed.

---

## Recent Changes (Session 19 â€” April 27, 2026)

**Copy, pricing floors, and value-first pricing logic**

`/app/page.tsx`:
- Hero caption: "Takes 60 seconds." â†’ "Takes about 2 minutes."
- Hero subheadline: "Custom tools that do exactly what you need, nothing more, nothing wasted." â†’ "Custom tools, built on lean and green solutions."
- Layout, styling, and all other content unchanged.

`/content/pricing-intelligence.md`:
- Updated tier floors: MVP $2,000â€“$3,000, Polished $3,250â€“$6,000, Perfected $6,500â€“$10,500.
- Reframed the "How to Use" section so value-based reasoning is the primary driver. Claude is now instructed to start from the value the client signaled and price from that first, then verify against the floor â€” not the other way around.
- Updated the Builder Rate section to reflect the new floors.
- Updated all 8 industry baselines: MVP ranges now reflect the new floor; ranges that were below $2,000 have been raised. Each baseline now notes that value signals typically land well above the floor.
- Value Signal Multipliers reframed from additive-to-floor language to value-first language.

`/app/api/generate-scope/route.ts`:
- MVP floor in the example JSON schema raised from $1,500 to $2,000.
- Claude pricing instruction replaced with an explicit 3-step value-first process: (1) derive value from Q5 and Q6/Q9, (2) price from that value, (3) verify against the floor and raise only if needed. High-value projects (e.g., $50K/year saved) must price significantly above the floor even at MVP. No other logic, schema, or tier names changed.

---

## Recent Changes (Session 18 â€” April 27, 2026)

**Mobile readability and layout audit â€” 390px (iPhone 14 baseline)**

Layout-only changes. No copy, logic, colors, or non-layout styles were modified.

`/app/projects/page.tsx`:
- Header row (`"Your Projects"` + `"Start a New Project"` button): `flex justify-between` â†’ `flex flex-wrap justify-between gap-y-3` so they stack on mobile instead of overflowing at ~378px combined width

`/app/projects/ProjectList.tsx`:
- Delete `Ã—` button: `w-7 h-7` (28px) â†’ `w-11 h-11` (44px) to meet minimum tap-target size
- Delete confirm-row "Delete" button: `py-1.5` â†’ `py-2.5` (was ~26px height, now ~40px)
- Delete confirm-row "Cancel" button: `py-1.5` â†’ `py-2.5` (same fix)

`/app/projects/new/ProjectWizard.tsx`:
- Chapter progress indicator: `gap-4` â†’ `gap-2 sm:gap-4` so the four step labels don't truncate aggressively at 390px (each item had only ~73px)
- Footer nav "Back" button: `py-2` (37px) â†’ `py-3` (45px) to meet tap-target minimum

`/app/projects/[id]/ProjectDetailClient.tsx`:
- Edit form actions row: `flex items-center gap-4` â†’ `flex flex-wrap items-center gap-4` so "Regenerate Scope" + "Cancel" stack when the card's 278px inner content can't fit both (~302px combined)
- "Edit & Resubmit" button: `py-2.5` (41px) â†’ `py-3` (45px) to meet tap-target minimum

`/app/admin/AdminDashboard.tsx`:
- Active project row date span: `flex-shrink-0` â†’ `hidden sm:block flex-shrink-0` â€” frees ~61px for the title column on mobile (title was truncating to ~105px)
- Incomplete project row date span: same fix

`/app/components/AuthModal.tsx`:
- Close button: was 20Ã—20px SVG with no padding â†’ `w-11 h-11 flex items-center justify-center rounded-lg` (44px tap target) with hover background
- Tab buttons ("Log In" / "Sign Up"): `pb-3` only (~33px) â†’ `pt-3 pb-3` (~45px) to meet tap-target minimum; active underline (`border-b-2 -mb-px`) unaffected

Not changed: `/app/for-you/[industry]/[solution]/page.tsx` â€” no issues found at 390px (nav logo 180px + button 104px = 284px fits in 326px content area; use-case grid correctly collapses to single column via `auto-fit minmax(260px,1fr)`).

---

## Recent Changes (Session 17 â€” April 27, 2026)

**Readability color pass â€” home page and all app pages**

Color-only changes. No layout, structure, copy, or logic was modified.

`/app/page.tsx`:
- "WHAT I BUILD" section label: gray â†’ teal (`#4B858E`)
- Hero subheadline: gray â†’ offwhite (`#F4F2EE`)
- "Takes 60 seconds." caption: gray â†’ offwhite
- All three proof-strip card descriptions (Connections, Custom Apps, Precision Tools): gray â†’ offwhite
- "GREEN BY DESIGN" body paragraph: gray â†’ offwhite

`/app/projects/ProjectList.tsx`:
- "No projects yet" empty-state message: gray â†’ offwhite

`/app/for-you/[industry]/[solution]/page.tsx`:
- "Save this page..." CTA caption: `--color-gray` â†’ `--color-offwhite`

`/app/projects/[id]/ProjectDetailClient.tsx`:
- Tier descriptions (MVP / Polished / Perfected) in scope card: gray â†’ offwhite
- `value_rationale` italic line: gray â†’ offwhite
- `green_score_reason` caption: gray â†’ offwhite
- "Your project scope is being prepared." empty state: gray â†’ offwhite

`/app/admin/AdminDashboard.tsx`:
- "No projects yet." empty state: gray â†’ offwhite
- Tier descriptions and `value_rationale` in both active and incomplete detail panels: gray â†’ offwhite
- `price_rationale` fallback line: gray â†’ offwhite
- "No scope generated yet." in both panels: gray â†’ offwhite
- "No account created" subtext in incomplete rows: gray â†’ offwhite

`/app/projects/new/ProjectWizard.tsx`:
- Question subtitles: gray â†’ offwhite
- Tier descriptions and `value_rationale` in ThreeTierPricing: gray â†’ offwhite
- "This will only take a moment." loading copy: gray â†’ offwhite
- "Drew will review your scope..." confirmation copy: gray â†’ offwhite
- `green_score_reason` caption in scope card: gray â†’ offwhite
- `price_rationale` fallback line: gray â†’ offwhite
- "Check your email to verify..." guest confirmation copy: gray â†’ offwhite
- "No account needed â€” just pick a time." guest CTA caption: gray â†’ offwhite

Intentionally kept gray: footer copyright, nav email/date meta, relative dates in table rows, "or" modal divider, form field labels, disabled/cancel button text, back-link navigation controls, chapter progress indicators, "Status:" label prefix, "Book a Call" nav link.

---

## Recent Changes (Session 16 â€” April 27, 2026)

**Move guest project attach to server-side OAuth callback**

`/app/auth/callback/route.ts`:
- After `exchangeCodeForSession`, reads `guestProjectId` from the incoming request cookies
- If present and a session user exists: uses service role client (`getSupabase()`) to UPDATE `projects` row (set `user_id`, `guest = false`), then UPDATE `status = 'submitted'`; fires fire-and-forget POST to `https://worldshifttech.com/api/notify-slack`; clears the cookie on the redirect response; logs `[GUEST PROJECT ATTACHED IN CALLBACK]` / `[GUEST PROJECT ATTACH FAILED IN CALLBACK]`
- If no `guestProjectId` cookie, skips all of the above and redirects normally

`/app/components/AuthModal.tsx` â€” `handleGoogleSignIn`:
- Changed from `window.localStorage.setItem('guestProjectId', ...)` to `document.cookie = \`guestProjectId=${guestProjectId};path=/;max-age=3600;SameSite=Lax\`` so the value is available server-side in the callback

`/app/projects/GuestProjectAttacher.tsx`:
- Removed all attach logic, polling, and localStorage references
- Now only: checks for `guestProjectId` cookie on mount; if found, clears it and calls `router.refresh()`; logs `[GUEST ATTACH HANDLED SERVER SIDE]`
- Acts as a defensive client-side cleanup in case the cookie wasn't cleared by the callback

---

## Recent Changes (Session 15 â€” April 27, 2026)

**Replace fixed delay with polling in GuestProjectAttacher.tsx**

`/app/projects/GuestProjectAttacher.tsx`:
- Replaced the fixed 800ms delay before `router.refresh()` with a polling loop: queries `projects` every 400ms (up to 10 attempts, 4s max) until the row is visible to the current user with `status = "submitted"`, then refreshes; falls through to refresh anyway if it never appears

---

## Recent Changes (Session 14 â€” April 27, 2026)

**Auto-submit project after guest account creation**

`/app/projects/GuestProjectAttacher.tsx` (Google OAuth path):
- After a successful `/api/attach-guest-project` call: PATCHes `status = "submitted"` via `getSupabaseBrowser()`, logs `[GUEST PROJECT SUBMITTED]`, fires fire-and-forget POST to `/api/notify-slack` with `type: "submission"`, then waits 800ms before `router.refresh()`

`/app/projects/new/ProjectWizard.tsx` (email/password signup path):
- `onSignupSuccess` handler: after a successful attach, PATCHes `status = "submitted"` via `getSupabaseBrowser()`, fires fire-and-forget POST to `/api/notify-slack` with `type: "submission"`; both steps only run if the attach call returns ok; Slack call is not awaited; `setGuestAttached(true)` still fires regardless

---

## Recent Changes (Session 13 â€” April 27, 2026)

**Fix guest project attach timing on /projects page**

`/app/projects/GuestProjectAttacher.tsx`:
- After a successful attach, added an 800ms delay before `router.refresh()` so the session has time to fully persist before the server component re-renders and fetches the project list
- `AuthListener.tsx` was not modified â€” that file does not exist in this project

---

## Recent Changes (Session 12 â€” April 27, 2026)

**Supabase OAuth callback route**

`/app/auth/callback/route.ts` â€” new route handler:
- Reads `code` from the query string (set by Supabase after Google OAuth consent)
- Exchanges it for a session via `supabase.auth.exchangeCodeForSession(code)`
- Redirects to `https://worldshifttech.com/projects`

`/app/components/AuthModal.tsx`:
- `redirectTo` in `signInWithOAuth` updated from `https://worldshifttech.com/projects` to `https://worldshifttech.com/auth/callback`

**Manual step (Supabase Dashboard):**
- Authentication â†’ URL Configuration â†’ Redirect URLs: add `https://worldshifttech.com/auth/callback`

---

## Recent Changes (Session 11 â€” April 27, 2026)

**Google OAuth in AuthModal + guest project attach via OAuth redirect**

`/app/components/AuthModal.tsx`:
- New optional prop: `guestProjectId?: string`
- Added `getSupabaseBrowser` import
- Google OAuth button added above email/password fields in both Login and Sign Up tabs: white background, inline Google "G" SVG, "Continue with Google" label
- "or" divider between Google button and email/password form
- `handleGoogleSignIn`: if `window.localStorage.getItem('guestProjectId')` is not set and `guestProjectId` prop is provided, writes it to localStorage before firing OAuth; then calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'https://worldshifttech.com/projects' } })`

`/app/projects/new/ProjectWizard.tsx`:
- `guestProjectId={projectId}` prop passed to AuthModal when opened from the guest reveal state ("Create an Account to Save Your Scope" button)

`/app/projects/GuestProjectAttacher.tsx` â€” new client component:
- Mounts on `/projects` page; runs a `useEffect` on mount
- Reads `localStorage.guestProjectId`; if present, calls `getSupabaseBrowser().auth.getUser()`
- If user found: POSTs to `/api/attach-guest-project` with `{ projectId, userId }`; logs `[GUEST PROJECT ATTACHED]` on success / `[GUEST PROJECT ATTACH FAILED]` on failure; calls `router.refresh()` on success
- If no user: clears localStorage anyway
- Always clears localStorage in `finally` block; fails silently (no UI error)

`/app/projects/page.tsx`:
- Imports and renders `<GuestProjectAttacher />` above `<ProjectList>`; runs after server-side auth is confirmed (unauthenticated visitors are already redirected before the component tree renders)

---

## Recent Changes (Session 10 â€” April 27, 2026)

**Status flow corrected (admin)**

Correct order: `draft â†’ scoped â†’ submitted â†’ reviewed â†’ approved â†’ building â†’ live`

`/admin/AdminDashboard.tsx`:
- `STATUS_TRANSITIONS` updated: `submitted â†’ reviewed â†’ approved â†’ building â†’ live` (was wrong: `reviewed â†’ building â†’ approved`)
- Transition button labels: "Mark Reviewed" / "Approve" / "Mark Building" / "Mark Live"
- `resubmitted` status added to transitions: treated as re-entering at reviewed ("Mark Reviewed")
- Optimistic rollback on `approved` failure now rolls back to `reviewed` (was `building`)
- No change to Claude Code prompt generation â€” still fires at `approved`; "â† Back to Review" still shown at `approved`

**`resubmitted` status badge**

- `AdminDashboard.tsx` â€” `resubmitted` added to `STATUS_BADGE` (purple/violet)
- `ProjectList.tsx` â€” `resubmitted` added to `STATUS_STYLES` (purple/violet, label "Resubmitted")
- `/projects/[id]/page.tsx` â€” `resubmitted` added to `STATUS_STYLES`

**Inline edit and resubmit on `/projects/[id]`**

`/app/projects/[id]/ProjectDetailClient.tsx` â€” new client component:
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

**`/api/notify-slack` â€” resubmission message type**

- New optional `type` field: if `"resubmission"`, formats as `ðŸ”„ Resubmission: *[title]* â€” [email] â€” https://worldshifttech.com/admin`
- Default (absent or other) uses existing submission format unchanged

---

## Recent Changes (Session 9 â€” April 27, 2026)

**Home page footer email removed (`/app/page.tsx`)**
- `drew@worldshifttech.com` mailto link removed from the footer
- Copyright line remains; footer layout simplified to centered single line

---

## Recent Changes (Session 8 â€” April 27, 2026)

**Home page CTA updated (`/app/page.tsx`)**
- "See What I'd Build For You" button `href` changed from `/meet` to `/projects/new`
- `/meet` and the old personalization flow remain untouched

---

## Recent Changes (Session 7 â€” April 27, 2026)

**Guest wizard flow â€” unauthenticated users can now complete the full wizard**

`/projects/new/page.tsx` â€” auth redirect removed; passes `isGuest={!session}` to `ProjectWizard`

`ProjectWizard.tsx`:
- Accepts `isGuest: boolean` prop
- Guest insert: `user_id: null, guest: true` (requires RLS guest insert policy â€” run migration in Supabase SQL editor)
- Scope generation and scope card display unchanged for guests
- Scope card bottom: guest users see "Your scope is ready..." copy + two CTAs (Create Account teal filled, Book a Call teal outlined + "No account needed" caption) instead of Submit button
- No Slack notification for guests
- `onSignupSuccess` handler fires PATCH to `/api/attach-guest-project`, then shows inline confirmation (checkmark, "Your scope is saved.", verify email note, secondary Book a Call link)

`AuthModal.tsx`:
- New optional props: `onSignupSuccess?: (userId: string) => void`, `openSignupOnMount?: boolean`, `hideTriggers?: boolean`
- When `onSignupSuccess` provided and signup succeeds: calls it with `userId` and returns (skips router.push to /projects)
- `openSignupOnMount`: auto-opens in signup tab on mount
- `hideTriggers`: hides nav buttons (Log In / Get Started) â€” used when modal is embedded inside ProjectWizard
- All existing home page usage unchanged (no props = same behavior)

`/api/attach-guest-project/route.ts` â€” new PATCH endpoint (service role, no auth check, row-level conditions as protection)

**Supabase migration (run in SQL editor):**
```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS guest boolean DEFAULT false;
CREATE POLICY "Guest project insert allowed" ON projects FOR INSERT WITH CHECK (guest = true AND user_id IS NULL);
```

**Admin â€” Incomplete section (`/admin/AdminDashboard.tsx`, `/admin/page.tsx`)**
- `AdminProject` type: `user_id` is now `string | null`, new `guest: boolean` field
- `admin/page.tsx`: adds `guest` to select query; null user_ids filtered from email batch lookup; guest rows get `userEmail: "Guest"`
- Active project list: excludes guest rows
- Collapsible Incomplete section after the active list: collapsed by default, count in label, shows title / "No account created" / incomplete badge / date / View toggle; detail panel has full scope + answers but no status controls

---

## Recent Changes (Session 6 â€” April 27, 2026)

**`/projects/[id]` â€” project detail page (new file: `/app/projects/[id]/page.tsx`)**
- Protected server component: auth check via anon client, project fetch via service role with `user_id` filter
- Displays title, status badge, created date, full scope card (3-tier pricing or flat fallback), Energy Footprint badge + reason, teal "View Your Demo â†’" button for live projects with a `demo_url`
- Draft/unscoped projects show a muted placeholder in place of the scope card
- No new shared files created

**Project cards linked to detail page (`/projects/ProjectList.tsx`)**
- Outer card `<div>` replaced with `<Link href="/projects/[id]">` â€” entire card is now a tap target
- Delete button (Ã— and confirm-row) uses `e.preventDefault()` to suppress navigation; "View Demo â†’" anchor uses `e.stopPropagation()`
- Card layout, badge styles, and delete flow unchanged

---

## Recent Changes (Session 5 â€” April 27, 2026)

**"I already know what I want to build." option added to Q1 (`/projects/new/ProjectWizard.tsx`)**
- Q1 now has 7 options. Options 1â€“6 retain click-to-auto-advance behavior.
- Option 7 ("I already know what I want to build.") highlights as selected on click and reveals an inline textarea below the card grid immediately on selection.
- Textarea placeholder: "Describe it in one to two sentences." Footer nav (Back / Next) appears when this option is selected. Next button requires 10+ characters before enabling.
- Value stored as `custom_build_description: string` in `Answers`, `INIT`, Supabase insert, and `/api/generate-scope` fetch body.
- Selecting any of the other 6 cards after option 7 hides the textarea and clears `custom_build_description`.
- No other questions, chapters, or wizard behaviors changed.

---

## Recent Changes (Session 4 â€” April 27, 2026)

**Q5 value signals question added to wizard (`/projects/new/ProjectWizard.tsx`)**
- New Q5 inserted after Q4 in Chapter 2 ("The Pain"): "If this tool worked perfectly, what would it mean for your business?"
- Multi-select, 7 options, minimum 1 required to advance
- Stored as `value_signals: string[]` in the Supabase answers column and passed to `/api/generate-scope`
- Old Q5â€“Q11 renumbered Q6â€“Q12 throughout (types, INIT, CHAPTERS, QuestionView, nextEnabled, footer nav, Supabase insert, fetch body)
- Total wizard questions: 11 â†’ 12

**3-tier pricing in scope generation (`/api/generate-scope/route.ts`)**
- Reads `/content/pricing-intelligence.md` at request time and injects it into the Claude prompt
- Claude now generates a `pricing` object with MVP / Polished / Perfected tiers (low, high, description per tier) plus `value_rationale`
- `price_low` / `price_high` still populated from `pricing.mvp` for backwards compatibility with existing downstream code

**Pricing intelligence content file (`/content/pricing-intelligence.md`)**
- New file: builder rate, MVP floor, value signal multipliers keyed to Q5 options, industry baselines for 8 sectors

**3-tier pricing display in wizard scope card (`/projects/new/ProjectWizard.tsx`)**
- Investment Estimate section replaced with MVP / Polished / Perfected rows showing tier name, price range, and description
- `value_rationale` rendered in gray italic below the three tiers
- Graceful fallback to flat `price_low`â€“`price_high` range for older projects without `pricing` field

**3-tier pricing display in admin panel (`/admin/AdminDashboard.tsx`)**
- Same 3-tier layout in the inline detail panel scope doc
- `ScopeData` type extended with optional `pricing` field
- `Q_LABELS` updated to new answer keys (`value_signals`, Q6â€“Q12, `q10_other`)
- Graceful fallback to flat range for older projects

**Not changed:** chapter labels, chapter count, all other question text, wizard behavior, reveal animation, submission flow, Slack notification, Supabase schema, admin status controls, Claude Code prompt generation.

---

## Recent Changes (Session 3 â€” April 26, 2026)

**Home page copy update (`/app/page.tsx`)**
- Strip label updated from "DOCUMENTED RESULTS FROM REAL IMPLEMENTATIONS" to "WHAT I BUILD"
- Card 1: "Connections" / "Between the tools you already use, so your business finally talks to itself."
- Card 2: "Custom Apps" / "Built from scratch around your idea, your workflow, your team."
- Card 3: "Precision Tools" / "Small, focused, and built to handle exactly what you've been doing manually."

**Not changed:** card layout, styling, component structure, all other sections.

---

## Recent Changes (Session 2 â€” April 26, 2026)

**Home page copy update (`/app/page.tsx`)**
- Hero eyebrow label updated from "DREW GRIFFITHS / WORLD SHIFT TECHNOLOGIES" to "BUILT LEAN. BUILT GREEN."
- Lean/green section heading updated to: "Precise tools cause less harm."
- Lean/green section body copy updated with approved text (fewer API calls, leaner models, renewable infrastructure framing)
- Eyebrow label in lean/green section unchanged: "GREEN BY DESIGN"

**Not changed:** layout, styling, spacing, proof strip, CTA, headshot, nav, footer.

---

## Recent Changes (Session 1 â€” April 26, 2026)

**Home page copy update (`/app/page.tsx`)**
- Hero headline updated to: "Built for your business, not for thousands of others."
- Hero subheadline updated to: "Custom tools that do exactly what you need, nothing more, nothing wasted." (em-dash replaced with comma per copy rules)
- Retired: old headline ("The Tools Your Business Has Been Missing.") and old subheadline ("Your team runs the business. I build the automations and AI agents that handle the rest...")
- Added lean/green section between proof strip and footer: "Built lean. Built green." with approved body copy; styled with teal label, Playfair h2, navy background, consistent padding

**Not changed:** proof strip stats, CTA button text/color/layout, headshot, nav, footer, font sizes, component structure.

---

## Next Tasks

- Run `audit_knowledge` Supabase migration + INSERT (14 rows) in SQL editor (Session 39)
- Test scope generation with Zapier + ClickUp + AWS in Q10 â€” verify green_score reflects knowledge base (Session 39)
- Test admin viewer at `/admin/audit-knowledge` â€” verify all 13 docs render correctly (Session 39)
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
  /page.tsx                          â€” Home (personal intro, Drew photo, CTA â†’ /meet)
  /fractional/page.tsx               â€” ClickUp consultant directory landing page (static)
  /your-team-and-ai/page.tsx         â€” Static editorial page: team vs AI positioning, 6 sections, POPin handoff
  /impact/page.tsx                   â€” Static public page listing the four AI accountability orgs WST donates to. No auth, no data fetching.
  /privacy/page.tsx                  â€” Static Privacy Policy page. Discloses Anthropic API data transfer, third-party services, 90-day guest record retention. No auth.
  /terms/page.tsx                    â€” Static Terms and Conditions page. Colorado governing law. AI-generated content disclaimer. No auth.
  /meet/page.tsx                     â€” Question flow (4 Qs, stores wst_visitor cookie)
  /for-you/page.tsx                  â€” Loading state â†’ POSTs to /api/personalize â†’ redirects
  /for-you/[industry]/[solution]/    â€” Personalized result (pulled from Supabase)
  /projects/[slug]/page.tsx          - Public client roadmap page, no login. Password-gated or open per project.
  /projects/[slug]/PasswordGate.tsx  - Client component: password form, POSTs to /api/project-access
  /auth
    /callback/route.ts               - OAuth callback: exchange code for session, redirect to /admin
  /components
    /SignOutButton.tsx               - Sign out button (client)
  /admin
    /login/page.tsx                  - Drew-only login (client): email/password + Google OAuth, not linked from any nav
    /page.tsx                        - Server component: JWT gate (drew@worldshifttech.com) -> /admin/login, data fetch (projects + audit_estimates)
    /AdminDashboard.tsx              - Client component: Projects tab (list + New Project form) + Audits tab (unchanged) + Impact tab (unchanged) + Audit KB nav link
    /ImpactTab.tsx                   - Client component: Anthropic usage sync and impact display
    /projects/[id]/page.tsx          - Server component: full project fetch + milestones + build-cost sum, admin gate
    /projects/[id]/ProjectDetailClient.tsx - Client component: core fields, milestone editor, budget vs. logged hours, file/feedback placeholders
    /audit-knowledge/page.tsx        - Drew-only server component: sidebar + markdown viewer for audit knowledge docs
    /audit-knowledge/AuditKnowledgeClient.tsx - Client component: search input + grouped tool list
  /api
    /personalize/route.ts            - Classify -> cache check -> generate -> save -> return
    /notify-slack/route.ts           - Posts Slack notification on project submit, resubmit, or audit completion (type: "submission" | "resubmission" | "audit") - submission/resubmission types are now unreachable dead branches, left as-is
    /admin-projects/route.ts         - POST: creates a project (admin auth)
    /admin-projects/[id]/route.ts    - PATCH: updates core fields + replaces milestones (admin auth)
    /project-access/route.ts         - POST, public: verifies a project password, sets the signed access cookie
    /ingest-case-study/route.ts      â€” Zapier webhook for content pipeline
    /admin-usage-snapshots/route.ts  â€” GET: returns all wst_usage_snapshots rows (admin auth)
    /admin-sync-usage/route.ts       â€” POST: pulls token data from Anthropic Admin API, inserts snapshot (admin auth)
    /curriculum
      /progress/route.ts             â€” POST: upsert curriculum_progress row (mark lesson complete/in-progress)
  /curriculum
    /page.tsx                        â€” Domain list (auth-protected server component)
    /[domain]/page.tsx               â€” Domain detail + module list
    /[domain]/[module]/page.tsx      â€” Module detail + lesson list with completion status
    /[domain]/[module]/[lesson]
      /page.tsx                      â€” Lesson server component: fetches lesson + progress, renders LessonViewer
      /LessonViewer.tsx              â€” Client component: content renderer, mark-complete button, prev/next nav
/content
  /case-studies/                     â€” 6 markdown files
  /audit-knowledge/                  â€” 13 markdown files (one per tool + general reference)
/lib
  /case-studies.ts                   â€” Reads and concatenates case study files
  /audit-knowledge.ts                â€” getAuditKnowledge() (Supabase fetch), formatKnowledgeForPrompt() (prompt injection), getAuditDoc() (admin viewer), ALL_AUDIT_TOOLS
  /supabase.ts                       â€” getSupabase() (service role) + getSupabaseBrowser() (anon)
  /auth.ts                           â€” getSession, getUser, signIn, signUp, signOut helpers (signUp unused since Session 46, kept for now)
  /project-access.ts                 - hashPassword/verifyPassword (scrypt), signAccessToken/verifyAccessToken (HMAC), accessCookieName
/supabase
  /schema.sql                        â€” Source of truth for DB schema
```
