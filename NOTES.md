Last session: 65

## Recent Changes (Session 65, August 8, 2026)

**`repos.system_group` tagging + a real root cause found while investigating "these
sessions aren't working"**

Two separate asks that turned into one investigation. Drew wanted GitHub Actions run
titles to say what they actually are (they'd all shown the same static "Run WST
orchestrator session" regardless of type or target), and — mid-request — asked for a real
"tag repos that are part of the same system" concept rather than hardcoding specific repo
names into the workflow file for that. **`repos.system_group`** (new, free text) does
both: threaded into the dispatch `client_payload` (`lib/orchestrator-dispatch.ts`) purely
as a display label, consumed by `wst-orchestrator-runner`'s own `run-name:` template (its
Session 6) to produce titles like "Planning session — WST App (worldshifttech-landing)."
Surfaced in the admin UI too, not just the payload: a badge on the fleet list
(`RepoFleetClient.tsx`) and an editable field on the repo detail Settings tab
(`RepoDetailClient.tsx`, threaded through `/api/admin-repos/[id]`'s existing PATCH
allow-list). Seeded `'WST App'` on both `worldshifttech-landing` and
`wst-orchestrator-runner` — the latter had never actually been registered as a `repos` row
at all despite being a valid dispatch target since Phase 2, so this session also inserts
that row for the first time (idempotent, `WHERE NOT EXISTS`).

**The real finding, from checking specific GitHub Actions run numbers Drew asked about:**
`entos-group-website`'s scheduled automation had been silently dead since August 6.
`app/api/orchestrator/scheduler-tick/route.ts`'s "is there already an open session for
this repo" guard (`status NOT IN ('done','failed')`) is correct in isolation, but nothing
ever swept a session back to a terminal state if its GitHub Actions run crashed, never
actually got dispatched, or failed to POST back to `/api/orchestrator/session-result`.
Four sessions across two repos (two blocking `entos-group-website` specifically, one of
the other two the literal Phase 1 seed-data row from `supabase/schema.sql`, never cleaned
up since Session 48) had sat non-terminal since August 5–6 — every scheduler tick since
then correctly found an "open" session for `entos-group-website` and backed off, forever,
with nothing anywhere surfacing that as a problem. Manually marked all four `failed` after
confirming each was genuinely stale (oldest first, all from before Session 49's GitHub App
permission fix — plausibly exactly the "accepted before the fix, never replayed" sessions
that fix's own NOTES entry mentioned but didn't enumerate).

**Structural fix, not just a one-time cleanup:** `scheduler-tick` now sweeps and
auto-fails any session non-terminal for more than `STALE_SESSION_HOURS` (3 — comfortably
longer than the workflow's own hard ceiling of 45 minutes for a build, plus buffer for the
report step) on every tick, before the pause checks and before the per-repo dispatch loop.
Runs even when automation is globally paused — this is data hygiene, not a dispatch
action, no reason to skip it. Response body now reports `stale_sessions_failed` so this is
visible in the tick's own output going forward instead of only discoverable by directly
querying the table.

Also checked, while investigating: two real build dispatches (run #18, run #20) both hit
the exact git-remote mismatch bug from `wst-orchestrator-runner`'s own pending KB draft —
confirmed as an active blocker, not a hypothetical, and fixed there (Session 6). Session
65's own operational-triage build prompt (scheduler resilience, Slack fire-and-forget,
`build_cost_entries` FK wiring — three items from this session's own earlier triage brief)
never actually ran because of that bug; needs a fresh dispatch now that it's fixed.

Verified with `npx tsc --noEmit` and `npm run build` (both clean).

**Needs Drew:** run this session's SQL (`repos.system_group` + the `wst-orchestrator-runner`
seed row), merge PR #4 (already open, unrelated to this session — the "messy Answered tab"
fix from run #20), and re-dispatch the operational-triage build now that the git-remote
fix is live.

---

## Recent Changes (Session 64, August 8, 2026)

**Client-facing "action needed" milestone UI — closes out Session 60's backend**

The build prompt handed in for this work labeled itself "Session 61," written back when
Session 60's backend was the most recent entry in this file. By the time it actually ran,
Sessions 61 (control-plane backfill), 62 (nav-cohesion draft), and 63 (real save-draft
feature) had already claimed those numbers for real, unrelated work — the same kind of
stale-label collision Session 59's own NOTES entry describes handling by renumbering
rather than colliding. Renumbered to 64 here; the prompt's own technical content (built on
Session 60's `action_owner`/`action_note`/`milestone_id` columns and `/api/project-feedback`
endpoint) is otherwise followed exactly as written. This is an unattended CI build session
with no live back-and-forth with Drew, so there were no new open design questions answered
mid-build — the build prompt itself had already resolved every design call that would
otherwise have needed one (one shared Turnstile widget per milestone panel rather than one
per submission path, no second query for a milestone's scoped files since `page.tsx`
already fetches all project files, no client-side mutation of a milestone's own
status/action_owner on submit).

**`app/projects/[slug]/MilestoneActionPanel.tsx`** (new): collapsed-by-default "Action
needed" toggle rendered inside a milestone card, only when `action_owner === "client" &&
status !== "done"`. Expanded, shows `action_note` as the instruction line, a text-answer
form (textarea + "Submit Answer" → `POST /api/project-feedback` with `milestoneId`), and a
file-upload form reusing the exact signed-upload-url flow from `FileUploads.tsx`
(`createSignedUploadUrl` → `uploadToSignedUrl` → `POST /api/project-files`), both gated by
one Turnstile widget per open panel (`turnstile.render()` into a unique
`cf-widget-milestone-{id}` div, mounted only once the panel is expanded — same explicit-render
posture as the existing client `FileUploads.tsx`, not an implicit embed). The file list
under the upload form is filtered client-side from the same `files` prop `page.tsx` already
fetches (`f.milestone_id === milestoneId`) — no second Supabase query. Success shows an
inline "Sent. Drew will follow up." under whichever form succeeded (answer and upload track
separate sent-state so submitting one doesn't hide the other) and clears that form's input;
neither path ever writes to the milestone's own `status`/`action_owner`. `app/projects/[slug]/page.tsx`
threads `milestone_id` through its existing `files` mapping (already `select("*")`, just
wasn't projected into the object literal before) and drops the old page-level "Client
feedback — coming in a future session" placeholder entirely, since the real UI is now
per-milestone rather than one generic block.

**Admin milestone-owner visibility + feedback inbox.** `app/admin/projects/[id]/page.tsx`
now also queries `project_feedback` (joined to `project_milestones(title)` for display,
since `milestone_id` can be null) and builds a `milestone_id → title` lookup map reused when
projecting `project_files` rows, so the admin `FileUploads.tsx` can show a "for: {milestone
title}" line under any file whose `milestone_id` is set — Drew can now tell a
milestone-scoped upload apart from a general one without cross-referencing anything by hand.
`ProjectDetailClient.tsx`'s old feedback placeholder is now a real list (message, milestone
title or "General", status, relative date, "Mark Resolved") backed by local component state
so a resolve click updates the row immediately without a full reload. **`/api/admin-project-feedback/[id]/route.ts`**
(new, PATCH) is the admin-only mutation behind that button — same `verifyAdmin` bearer
pattern (Supabase Auth token → `drew@worldshifttech.com` check) as every other
`admin-*`/`admin-projects` route; the only transition it supports is setting `status:
'resolved'`.

**Slack.** `notify-slack/route.ts` gained a `milestone_response` branch (client's text
answer, links to the admin project page), fired fire-and-forget from
`/api/project-feedback` right after a successful insert — same pattern as the existing
`file_upload` ping, including a best-effort lookup of the project/milestone titles for the
message text. The existing `file_upload` branch in both `notify-slack` and
`app/api/project-files/route.ts` was extended (not duplicated) to include the milestone
title in the Slack text whenever a client upload's `milestoneId` is set, so Drew can tell at
a glance whether an upload was general or fulfilling a specific open item.

No new SQL this session — Session 60 already landed every schema change this UI needed
(`action_owner`, `action_note`, `project_files.milestone_id`); this was purely wiring the UI
and admin inbox on top of it.

Verified with `npx tsc --noEmit` and `npm run build` (both clean — `node_modules` had to be
installed first in this CI environment; `/api/admin-project-feedback/[id]` listed among the
built routes). `npm run lint` shows 6 `@typescript-eslint/no-explicit-any` errors: the 4
pre-existing ones already flagged as unrelated in Session 60's own NOTES entry
(`app/meet/page.tsx`, the client `FileUploads.tsx`), plus 2 new ones in
`MilestoneActionPanel.tsx` from the exact same `(window as any).turnstile` cast those files
already use — matching the established convention for calling Cloudflare Turnstile's
untyped global rather than introducing a new pattern.

**Needs Drew:** click through a real "Action needed" milestone on a live client-facing
project page (both the text-answer and file-upload paths) and confirm the Slack pings and
admin inbox both show up as expected — unverified end-to-end past a clean build, same
caveat as most sessions in this file until Drew exercises it for real.

---

## Recent Changes (Session 63, August 8, 2026)

**Real "save draft" feature, replacing Session 62's stopgap**

Session 62 landed a hardcoded default value in `planningBrief`'s component state as a
quick "ticket in the app I can look at later to run." Drew tried it, correctly identified
it wasn't durable enough (component state, no way to hold more than one, gone the moment
it's edited or the page reloads fresh), and asked for the real thing.

**`session_drafts`** (new table): `repo_id`, `session_type` (`'planning' | 'build'`),
`title`, `brief`. Deliberately not a new column on `agent_sessions` — a draft has never
been dispatched and has no status lifecycle (no `github_run_id`, no status transitions,
no result to report), a genuinely different shape from a real session row. Seeded with
Session 62's nav-cohesion brief as a real row, promoting it rather than leaving both
mechanisms around.

**`/api/admin-repos/[id]/drafts`** (new, POST) and **`/api/admin-repos/[id]/drafts/[draftId]`**
(new, DELETE) — same `verifyAdmin` bearer pattern as every other `admin-repos` route.
Title is optional on save (falls back to a truncated snippet of the brief) — a quick
"save this before I lose it" click shouldn't require typing a title first.

**`RepoDetailClient.tsx`**: a "Saved Drafts" list (only rendered when non-empty) sits
above the Planning/Build boxes, each entry tagged planning/build with **Load** (fills the
matching textarea, switches to the Settings tab, never dispatches on its own) and
**Delete**. Both dispatch boxes gained a "Save as Draft" control (title input + button)
next to their existing Run button. Session 62's hardcoded `NAV_COHESION_PLANNING_BRIEF`
default removed entirely — the real seeded draft replaces it.

Verified with `npx tsc --noEmit` and `npm run build` (both clean — confirmed
`/api/admin-repos/[id]/drafts` and its `[draftId]` child both registered as routes).

---

## Recent Changes (Session 62, August 8, 2026)

**A "ticket in the app" for the nav-cohesion complaint — pre-filled, not a new feature**

Drew's ask: the admin nav feels disjointed, and he wants "a ticket in the app I can look
at later to run" as his next planning session, once he's done with Session 61's test —
but explicitly "I don't need to make anything new." First instinct was to insert an `open`
`agent_sessions` row directly, but there's currently no UI anywhere that lists raw
`agent_sessions` rows for Drew to browse — only `review_items` (populated by session
*results*, not pre-planning tickets) and the repo detail page's single free-text Planning
box. Inserting an invisible DB row wouldn't have actually satisfied "look at it later."

Landed on the literal minimal reading instead: `NAV_COHESION_PLANNING_BRIEF` (a real,
specific brief — names every current `/admin/*` route, asks about consistent header/nav,
breadcrumbs, click-count between related sections, explicitly scoped to navigation only,
not a rewrite of any page's functionality) now pre-fills `planningBrief`'s initial state
in `RepoDetailClient.tsx`, but only when `repo.github_repo === "worldshifttech-landing"` —
this is a navigation complaint about the admin app itself, not something that belongs as a
default on every other repo's planning box. Next time Drew opens this repo's own
`/admin/repos/[id]` page, it's just sitting there in the existing Run Planning Session
box, ready to review and click — no new table, no new UI, no persistence beyond React's
own component state (meaning it resets if the textarea is cleared or on a fresh page load
after being edited — genuinely ephemeral, not a durable queue, which is the real tradeoff
of "don't make anything new").

Verified with `npx tsc --noEmit` and `npm run build` (both clean).

---

## Recent Changes (Session 61, August 8, 2026)

**Backfilled a real build session's result after finding it was silently dropped**

Not a code change on this repo's side — the fix lives in `wst-orchestrator-runner`'s own
Session 5. Worth a NOTES entry here anyway since it explains a manual DB write outside
the normal `session-result` flow.

Dispatched Session 60 (the milestone-feedback backend build prompt) against this repo via
the new "Dispatching to" labels' correct target. It completed successfully from Claude's
own side — real commits, [PR #2](https://github.com/worldshifttech/worldshifttech-landing/pull/2)
opened, SQL included per Session 59's own convention — but the dashboard still showed
`status: failed` with no `build_result` card. Reading `wst-orchestrator-runner`'s actual
job log (not guessing) found the cause: `resolve_pr`'s gate on `claude-code-action`'s
`branch_name` output never fires under this workflow's actual usage (Claude creates PRs
manually via Bash, not through the action's own branch-management feature) — silently
skipping PR/preview/SQL resolution on every build, successful or not, likely since Session
53. Fixed there; see that repo's NOTES.md for the full root-cause writeup.

Rather than wait for a fresh dispatch to re-prove a fix that direct log-reading already
confirmed, Session 60's real PR and Vercel preview (both verified live via `gh pr view`
and the PR's own comments) were written directly into `agent_sessions`
(`status: 'done'`, `pr_url`, `pr_preview_url`) and a `build_result` `review_items` row
inserted with the real SQL as `proposed_content` — exactly what the (fixed) workflow's own
report step would have sent. `/admin/reviews` should now show a real, mergeable Session 60
card.

---

## Recent Changes (Session 60, August 8, 2026)

**Client feedback backend: milestone ownership, upsert fix, feedback endpoint**

Data-model and API half of letting a client fulfill an "open item" on their roadmap —
either a text answer or a file upload — scoped to a specific milestone. Deliberately does
not touch the client-facing page or the admin inbox UI; those are Session 61 (build), the
follow-up build dispatch once this one merges — not to be confused with the *control-plane*
Session 61 NOTES entry above, which documents backfilling this very session's result; the
two "Session 61"s are different repos' own numbering, not a second collision.

**The real gotcha this session's own investigation surfaced, worth flagging so nobody
reintroduces it:** `app/api/admin-projects/[id]/route.ts`'s milestone save deleted every
`project_milestones` row for the project on every save and re-inserted fresh ones with
brand-new IDs. Harmless while nothing referenced a milestone by ID — but this session adds
exactly that (`project_files.milestone_id`, and `project_feedback.milestone_id` already
existed unused since Session 46/48). Left as-is, the very next unrelated milestone edit
would have silently orphaned every file/feedback row's milestone reference. Fixed first,
before anything else in this session touched milestones: the PATCH handler now diffs the
submitted array against the milestones that already exist for the project (by `id`),
updates any that matched, inserts any with no `id` (new milestones added client-side start
with `id: null`), and deletes only the `id`s that existed before but are missing from the
new submission — delete run last, so an id is never briefly absent mid-request. The
client-side `Milestone` type in `ProjectDetailClient.tsx` gained `id: string | null`,
threaded from `page.tsx`'s `initialMilestones` mapping.

**Schema + admin milestone editor:** `project_milestones` gained `action_owner text NOT
NULL DEFAULT 'drew' CHECK (action_owner IN ('drew','client'))` and `action_note text`;
`project_files` gained `milestone_id uuid REFERENCES project_milestones(id) ON DELETE SET
NULL`. `project_feedback.milestone_id` (Session 46/48) was already `ON DELETE SET NULL` —
confirmed unchanged, no edit needed. `ProjectDetailClient.tsx`'s milestone editor gained a
"Who owns this" select (Drew / Client, visually mirroring the existing status select) and,
only when set to Client, a one-line `action_note` input ("What do you need from the
client?").

**Shared client-access helper + milestone-scoped uploads:** `verifyClientAccess` and
`verifyTurnstile` were copy-pasted identically into both `app/api/project-files/route.ts`
and `app/api/project-files/upload-url/route.ts`. Extracted into `lib/project-access.ts`
(which already owned `verifyAccessToken`/`accessCookieName`) so the new feedback endpoint
below didn't need a third copy — both existing routes now import from there, no behavior
change. Both routes' request bodies gained an optional `milestoneId?: string`; the
confirm route (`project-files/route.ts`) passes it straight through to the `project_files`
insert as `milestone_id: milestoneId ?? null`. The general Files section's two
`FileUploads.tsx` call sites (admin and client-facing) are unchanged, so existing general
uploads keep landing with `milestone_id: null` exactly as before.

**New endpoint:** `app/api/project-feedback/route.ts` (new, POST) — `project_feedback`'s
first writer ever (the table has existed since the Session 46/48 schema with nothing
inserting into it). Mirrors `project-files`' access pattern using the helpers above:
Turnstile check, then `verifyClientAccess` against the project slug. Inserts `project_id`,
`milestone_id`, `message`, `status: 'new'`. Rejects empty/whitespace-only messages with a
400 before either access check runs.

Verified with `npx tsc --noEmit` and `npm run build` (both clean, `/api/project-feedback`
listed). `npm run lint` shows 4 pre-existing errors in `app/meet/page.tsx` and
`app/projects/[slug]/FileUploads.tsx` (both `@typescript-eslint/no-explicit-any`, unrelated
to any file this session touched) — confirmed via `git status` that none of this session's
changed files appear in the lint output.

**Needs Drew:** run this session's SQL migration (below) in Supabase — done, confirmed via
a direct column check before merging — then confirm the milestone editor still saves
correctly and that a manually inserted `project_files`/`project_feedback` row with a
`milestone_id` survives an unrelated milestone save without orphaning. No real
client-facing caller of `/api/project-feedback` exists yet — that's the Session 61 build.

**Same-day follow-up: "Dispatching to: {repo name}" label on the two dispatch boxes.**
(Originally filed as its own "Session 60" entry, written before this build had actually
dispatched — folded in here on merge rather than left as a duplicate heading.) Real
mix-up, not hypothetical: after fixing an API spend-limit failure, Drew retried a build
dispatch twice more and both landed against `wst-build-manager` instead of
`worldshifttech-landing` — he was on the wrong repo's `/admin/repos/[id]` page, which
looks identical to every other repo's page apart from a small heading up top. The build
session itself ran fine (no error) but had nothing coherent to build against a mismatched
repo's files, so no PR ever resulted. Confirmed by reading the actual GitHub Actions logs
(`repository: worldshifttech/wst-build-manager` in the checkout step, paired with a
`BRIEF` written for `worldshifttech-landing`'s own files). Both **Run Planning Session**
and **Run Custom Build Session** boxes on `RepoDetailClient.tsx` now show a small
"Dispatching to: {repo.name}" badge next to their header. Verified with
`npx tsc --noEmit` and `npm run build` (both clean).

---

## Recent Changes (Session 59, August 7, 2026)

**Surface SQL migrations from build sessions on the dashboard**

Drew's own question after building Session 58's custom-build-dispatch box: once a build
session's SQL output exists, how does he actually get it? Real gap — every WST repo's own
Build Mode convention says "output all SQL at the end," written for an interactive
terminal session Drew would copy from directly; a headless build dispatch has no terminal
for that to land in, and nothing captured or forwarded it anywhere durable before this.
Most of the actual fix lives in `wst-orchestrator-runner`'s own Session 3 (see that repo's
NOTES.md) — the build wrapper prompt now tells Claude to also put SQL under a `## SQL to
run` heading in the PR description, and a new workflow step extracts it back out.

**`ReviewInboxClient.tsx`**: `build_result` cards now render `item.proposed_content` (when
present) as a copyable "SQL to Run" block, right below the PR/Preview links. That field
was unused by every other `build_result` payload since Session 53 introduced the kind
(hardcoded `null`) — repurposed rather than adding a new column, matching how
`kb_entry_draft` already reuses `proposed_content` for its own long-form description.

Verified with `npx tsc --noEmit` and `npm run build` (both clean).

Also renumbering a same-day loose end: the two split build prompts handed to Drew earlier
today for the milestone-feedback feature were labeled Session 59/60 before this
control-plane work claimed 59 for itself. **Bumped to Session 60 and 61** — neither had
been dispatched yet, confirmed by checking `agent_sessions` before renumbering, so nothing
real collides.

---

## Recent Changes (Session 58, August 7, 2026)

**Run Custom Build Session**

Prompted by a real failure: a build dispatch against `worldshifttech-landing` itself
(Session 56's 7-part client-feedback-milestones prompt) ran `is_error: true` after 76
turns / ~9.3 min / $3.29, against the workflow's own `--max-turns 60` — no PR, nothing
survived. Recommended splitting it into two smaller build sessions instead of a blind
retry (cheaper in total and far more likely to each actually land a PR than one oversized
prompt burning turns to a dead end). That surfaced a real gap: the only way to fire a
build dispatch was the fixed "Run Build Session" button on an answered
`consolidated_review` card in `/admin/reviews`, which always sends that card's full,
unmodified `proposed_content` — no way to dispatch a hand-split or edited brief.

**`RepoDetailClient.tsx`**: new "Run Custom Build Session" card on the Settings tab,
directly mirroring the existing "Run Planning Session" free-text section — a textarea +
dispatch button POSTing `{ repo_id, session_type: "build", brief }` to the same
`/api/orchestrator/dispatch` route the fixed button already uses. No route changes needed
— `dispatch` has accepted `session_type: "build"` since it was written, nothing in the UI
could just reach it with a custom brief until now.

Verified with `npx tsc --noEmit` and `npm run build` (both clean). Not yet used for a real
split-and-dispatch — that's the next actual step, once Drew hand-splits the Session 56
build prompt into its two halves (changes 1–4, then 5–7) and runs each through this.

Also same discussion: Drew is switching his own Claude Code subscription from Max to Pro.
Worth being explicit here since it could otherwise read as related to this system's
spend — it isn't. Every orchestrator dispatch (planning and build) authenticates via a
plain `ANTHROPIC_API_KEY` GitHub Actions secret in `wst-orchestrator-runner`, pay-per-token,
entirely separate from Drew's own interactive Claude Code subscription tier. That was true
before this conversation and remains true regardless of Max vs. Pro.

---

## Recent Changes (Session 57, August 7, 2026)

**Client Portal link + password generation on the repo dashboard**

Requested with `entos-group-website` as the sample while Drew was independently watching
Session 55's live build dispatch come back. Turned out most of the client-facing
infrastructure already existed (Session 46's `/projects/[slug]` roadmap page,
`PasswordGate`, `lib/project-access.ts`) — the actual gap was that `repos` and `projects`
are deliberately separate tables (Session 48's own design call) with no surface on the
repo dashboard showing the link between them, and no way to generate a client password
without leaving `/admin/repos/[id]` for the separate project-editing screen.

**`app/api/admin-projects/[id]/generate-password/route.ts`** (new, POST): generates a
12-character unambiguous-charset password (no `0`/`O`/`1`/`l`/`I`), hashes it via the
existing `hashPassword()`, sets `access_mode: 'password'` unconditionally (generating a
password only makes sense as a move toward requiring one), and returns the **plaintext
once** — same one-time-reveal pattern as a provider showing a freshly-generated API key.
Nothing persists the plaintext beyond that single response; only the hash lands in the DB.

**`RepoFleetClient.tsx`'s `ProjectOption`** widened from `{id, title}` to also carry
`slug`/`access_mode`/`has_password` — the last one derived server-side from
`access_password_hash`, never the raw hash itself, same write-only-credential convention
already used for `has_target_supabase_service_role_key`. Both `app/admin/repos/page.tsx`
and `app/admin/repos/[id]/page.tsx` widened their existing `projects` queries accordingly.

**`RepoDetailClient.tsx`**: new **Client Portal** card, rendered whenever the existing
"Linked Client Project" dropdown resolves to a real project — keyed off the dropdown's
live value, not whether the repo-level link has been saved yet, since the `/projects/[slug]`
link itself works independent of that. Shows the copyable client URL, current
public/password-protected status, and a "Generate (New) Password" button that reveals the
plaintext once with its own copy button and an explicit "won't be shown again" label.

Found while investigating: `entos-group-website`'s own `repos` row has `client_project_id`
still null — no project linked yet. A "Client Onboarding" project already exists tagged to
Entos (`client_name: "Entos"`, currently `access_mode: 'public'`), but whether that's the
real intended client portal or leftover test data from earlier sessions wasn't something to
guess at — left for Drew to pick (or replace) via the dropdown himself now that it's visible.

Verified with `npx tsc --noEmit` and `npm run build` (both clean,
`/api/admin-projects/[id]/generate-password` listed). Not yet clicked for real — same
auth-wall limitation as every other admin-gated feature this session: needs Drew's own
login to exercise end-to-end.

---

## Recent Changes (Session 56, August 7, 2026)

**WST Orchestrator Phase 5 — `wst-build-manager` upgrade**

The last phase on the original `ORCHESTRATOR_DESIGN.md` §10 roadmap. Requested and built
while Drew was independently testing Session 55's live dispatch flow — see that session's
own follow-ups above for the real-dispatch proof this ran alongside. Almost all of this
phase's work lives in `wst-build-manager` itself (its own repo, own commit
[`5bdcb43`](https://github.com/worldshifttech/wst-build-manager/commit/5bdcb43) — read
that repo's own README for the full detail, not duplicated here): idempotency
(`findX`-before-`createX` across GitHub/Supabase/Vercel/ClickUp, step-level resume state
in a new gitignored `.bootstrap-state/`), a real Vite+React starter app
(`starter-template/`, verified end-to-end against a scratch copy — `npm install` and
`vite build` both run clean), and this session's own one piece of the auto-registration
half.

**`app/api/ingest-repo-registration/route.ts`** (new, POST): same `WST_INGEST_SECRET`
bearer-secret shape as the existing `ingest-build-cost` route — reuses that secret rather
than minting a new one, since it's the same trust boundary (`wst-build-manager` talking to
this control plane). Inserts a `repos` row for a newly-bootstrapped project
(`framework_type: 'vite'`, `auth_convention: 'shared_secret'` — matching the WST App
Standard's actual documented auth gate, `x-app-token`/`APP_SECRET`, not Supabase Auth).
Idempotent: checks for an existing row by `github_repo` first and returns
`alreadyRegistered: true` rather than duplicating — `repos.github_repo` has no unique
constraint at the DB layer (Session 48's own migration comment already flagged this), so
this app-level check is what actually prevents a retried `bootstrap.js` run from creating
two rows for the same project. `wst-build-manager`'s own new Step 9b calls this,
non-fatally, after every successful bootstrap.

`WST_INGEST_SECRET` was already set in Vercel (used by the existing cost-sync path) —
nothing new to configure on this side.

Verified with `npx tsc --noEmit` and `npm run build` (both clean, `/api/ingest-repo-registration`
listed).

**This closes Phase 5 — and with it, every phase on `ORCHESTRATOR_DESIGN.md` §10's
original roadmap (0 through 6) is now done.** Nothing scoped from that original design
doc remains. Any future orchestrator work from here is a new ask, not a leftover phase.

---

## Recent Changes (Session 55, August 7, 2026)

**WST Orchestrator Phase 3 (knowledge base) + Audit Knowledge Base consolidation**

Planning session started as Phase 3 alone (`ORCHESTRATOR_DESIGN.md` §6: pgvector/Voyage
capture-retrieve loop). Drew then asked to fold the existing "Audit Knowledge Base" into
the same table rather than build a second, separate KB. Investigating that before writing
any code surfaced it wasn't actually one system to fold in — it was three disconnected
fragments: `content/audit-knowledge/*.md` (21 docs, read straight off disk by
`/admin/audit-knowledge`), the `audit_knowledge` Supabase table (`lib/audit-knowledge.ts`'s
`getAuditKnowledge()` — **zero callers anywhere in the app**, and not even present in
`supabase/schema.sql`, so it was created outside the tracked migration history), and
`content/tool-registry.json` (a completely different structured-facts file that's what
actually drives the live `/audit` report via `app/api/generate-audit/route.ts`). Drew's
call: fully migrate the first two into the new unified table and retire them outright;
leave `tool-registry.json` alone but flag it as a future retire/fold candidate (comment
added at the top of `generate-audit/route.ts`).

**`knowledge_base_entries`** (existing table from the Session 48 schema, altered, not
recreated): gained `category` (`'audit_reference' | 'build_artifact'`), `tool_slug`,
`reference_doc`; `problem_solved`/`artifact_description` relaxed from `NOT NULL` since
audit_reference rows don't set them. One table, two shapes, sharing `title`/`tags`/
`tech_stack`/`embedding`/`reuse_count` — deliberately not two tables, and not five more
narrow nullable columns split further than that: `reference_doc` holds the entirety of an
audit doc's prose (matches how it was actually consumed — one rendered block, never split
into sub-fields), `artifact_description`/`artifact_location`/`problem_solved` cover a build
artifact. **`match_knowledge_base_entries`** (new RPC) does cosine-similarity search across
both categories at once — a planning session's brief benefits from relevant audit
knowledge, not just past build artifacts, a real emergent win from merging rather than
just tidiness. **`increment_kb_reuse_count`** (new RPC) bumps `reuse_count` for whatever
gets surfaced into a planning session's context — "offered to an agent" is the usage
signal used, not "a human later confirmed it helped." **`review_items.kb_draft`** (new,
jsonb) holds a `kb_entry_draft` review's structured metadata (title/problem_solved/tags/
tech_stack/artifact_location) ahead of promotion; `proposed_content` continues to carry
the long-form description, unchanged from its original schema comment.

**`lib/voyage.ts`** (new): `embedText()`, a plain `fetch` wrapper, no SDK — same
hand-rolled-REST convention as `lib/github-app.ts`. Model pinned to `voyage-3`, verified
against Voyage's own docs (not assumed) to be fixed at 1024 dimensions — not configurable,
unlike the newer `voyage-3.5`/`voyage-4` families — matching `vector(1024)` exactly.
`VOYAGE_API_KEY` was already set in Vercel (Phase 0, undocumented until now) — nothing new
to configure there.

**`lib/knowledge-base.ts`** (new): `searchKnowledgeBase()` (embed + RPC, best-effort —
returns `[]` on any Voyage/Supabase failure rather than throwing, so a hiccup never blocks
a dispatch) and `formatKnowledgeForPrompt()` (same shape as the now-retired
`lib/audit-knowledge.ts`'s `formatKnowledgeForPrompt()`, just backed by similarity instead
of a keyword-to-slug map).

**Capture (kb_entry_draft → a real KB row):** `session-result`'s `ReviewInput` widened to
accept an optional `kb_draft` object, stored as-is on the new column — no behavior change
for any other review kind. **`/api/admin-reviews/[id]/approve-kb-entry`** (new, POST) is
the actual gap this phase closes: **the "Approve" button on a kb_entry_draft card has
existed since Session 48 but never wrote anything into `knowledge_base_entries` — that
table had zero writers before this session.** Takes title/problem_solved/tags/tech_stack/
artifact_location/artifact_description straight from the request body (whatever Drew last
edited in the card, not a re-read of the original draft), embeds the composed text, inserts
a `category: 'build_artifact'` row, marks the review answered. Mirrors `[id]/merge`'s
structure — same category of one genuinely new, semi-irreversible action per inbox.
**`ReviewInboxClient.tsx`**: `kb_entry_draft` got its own early-return render branch (like
`build_result` already had) instead of the shared open-questions/decision-buttons/textarea
path — always-editable Title/Problem solved/Description/Tags/Tech stack/Artifact location
fields, "Approve & Add to Knowledge Base" / "Discard" buttons. This replaces the old
Approve/Edit/Discard decision-button flow from Session 48 (Edit only ever touched
`proposed_content`; there's more structured metadata to review now, so editing is just
always on rather than a separate mode). `handleDiscardBuild` generalized to
`handleDiscard(message)`, shared by `build_result` and `kb_entry_draft`'s Discard buttons.
Both review pages (`admin/reviews/page.tsx`, `admin/repos/[id]/page.tsx`) thread `kb_draft`
through — both already did `select("*")` on `review_items`, so only the row-mapping and
type needed updating, no query change.

**Retrieve (planning dispatch → injected context):** `lib/orchestrator-dispatch.ts`, for
`session_type: "planning"` only (a build session executes an already-fully-specified
prompt — no second injection needed), embeds `brief`, searches the KB, adds
`knowledge_context: string | null` to the `client_payload` sent to
`wst-orchestrator-runner`. Best-effort end to end — a Voyage/Supabase failure degrades to
`knowledge_context: null`, never fails the dispatch. `reuse_count` bump runs in its own
try/catch, awaited rather than fire-and-forget (a serverless function can be torn down
before an un-awaited promise resolves), and a failure there never marks the whole session
failed.

**Migration + new UI (audit consolidation):** **`/api/admin/migrate-audit-knowledge`**
(new, POST, one-time, idempotent — skips any `tool_slug` already present) reads all 21
`content/audit-knowledge/*.md` files, parses title and category straight out of each doc's
own header line (`# Name — WST Audit Reference` / `**Category:** X | **Infrastructure:**
Y`) rather than hand-maintaining a duplicate mapping, embeds the full doc, inserts as
`category: 'audit_reference'`. **`/admin/knowledge-base`** (new, replaces
`/admin/audit-knowledge` in `AdminDashboard.tsx`'s nav) — the browsable "what have I
collected" view Drew asked for: sidebar grouped by Build Artifacts / audit category (search
across title/tags/tech_stack), detail pane rendering `reference_doc` for audit entries or
the structured fields for build artifacts, plus reuse count and source repo. View-only this
phase — editing an already-approved entry is a reasonable fast-follow, not built.

**Retired:** `app/admin/audit-knowledge/` (page + client), `lib/audit-knowledge.ts`,
`content/audit-knowledge/*.md` (21 files) — all deleted outright, not deprecated in place,
per Drew's "fully migrate" call. Confirmed nothing else imported `lib/audit-knowledge.ts`
before deleting it.

**Left for a separate `wst-orchestrator-runner` session** (read that repo's actual README
before starting, don't guess): the planning job's `claude` CLI call needs to read
`client_payload.knowledge_context` and inject it; the build job's wrapper (not the target
repo's own build prompt) needs a "before opening the PR, evaluate reusability, and if so
POST a second `kb_entry_draft` review" instruction — `session-result` already supports a
second POST with a different `review.kind` against the same `session_id`, no control-plane
change needed for that half.

Verified with `npx tsc --noEmit` and `npm run build` (both clean — `.next` had to be wiped
first, a stale type-check cache still referenced the just-deleted `/admin/audit-knowledge`
page — all new routes listed: `/admin/knowledge-base`, `/api/admin-reviews/[id]/
approve-kb-entry`, `/api/admin/migrate-audit-knowledge`).

**Unverified end-to-end, needs Drew:** ~~(1) run this session's SQL migration~~ done.
~~(2) call `POST /api/admin/migrate-audit-knowledge`~~ done — all 21 `audit_reference` rows
confirmed in `/admin/knowledge-base`, after four same-day fixes (see the follow-ups above:
delete-before-migrate ordering, a silent timeout, a vanished retry button, then a
concurrency-related partial failure). (3) no real `kb_entry_draft` has gone through the new
Approve flow yet — the whole capture path is proven by code review and a clean build, not a
real end-to-end click; (4) the retrieve injection has never fired against a real planning
dispatch either. The `wst-orchestrator-runner` follow-up above is required before
`knowledge_context` does anything even once (4) and this session's own code are both done.

**Same-day follow-up: shipped a real bug, caught by Drew clicking the button for real.**
Ran the SQL, then clicked "Migrate Audit Docs" on the deployed site — it failed
immediately: `ENOENT: no such file or directory, scandir '/var/task/content/audit-knowledge'`.
Root cause: `content/audit-knowledge/*.md` was deleted in the *same* commit as the
migration route that reads those files. Once deployed, the files were already gone before
the route ever got a chance to run — a straightforward sequencing bug (delete-then-migrate
instead of migrate-then-delete), not a Vercel bundling quirk. Fixed by restoring all 21
files from `4e2b4e0` (the commit before the deletion) and redeploying. **Correct order,
for real this time:** run the migration, confirm the 21 rows actually landed in
`knowledge_base_entries` via `/admin/knowledge-base`, *then* delete the source files in a
follow-up commit — not delete-then-migrate, no matter how confident the code looks on a
clean `npm run build` (a local build never re-triggers a route's filesystem reads the way
clicking it on the real deploy does).

**Second same-day follow-up: retried with the files restored, only got 3 of 21.** Silent
partial success, no error shown — `/admin/knowledge-base` read 3 entries after the retry,
alphabetically the first 3 files (`ai-notetaker`, `airtable`, `aws`). Root cause: the
route processed all 21 files as one fully sequential loop of Voyage-embed-then-
Supabase-insert round trips, with no `maxDuration` set — it ran past Vercel's default
execution limit and got killed mid-loop. A timeout kill isn't a catchable JS exception, so
none of the per-file `try/catch` blocks ever saw it or recorded a "failed" result — it just
stopped. Fixed in `app/api/admin/migrate-audit-knowledge/route.ts`: `export const
maxDuration = 60`, plus the remaining files now process in concurrent batches of 5
(`Promise.all` per batch) instead of one at a time, cutting wall-clock enough to comfortably
clear the limit. Still idempotent regardless — the route already skips any `tool_slug`
already present, so clicking it again after a partial run only processes what's missing.

**Third same-day follow-up: Drew went to retry and the button was gone.** A bug in the
button itself, not the route — `KnowledgeBaseClient.tsx` only rendered the "Migrate Audit
Docs" box when `totalAuditCount === 0`, so the moment the first partial run landed 3 rows,
the only way to trigger a retry disappeared from the UI entirely. Changed the condition to
`totalAuditCount < EXPECTED_AUDIT_DOC_COUNT` (a client-side constant, `21`, used only to
decide whether to keep showing the box — not enforced server-side), with copy that adapts
("3 of 21 synced — run again to pull in the rest" instead of "No audit reference docs
yet"). Should have caught this the first time — a one-shot migration trigger needs to stay
reachable until it's actually finished, not just until it's non-zero.

**Fourth same-day follow-up: retried, loop actually completed this time, but "3 added, 3
already there, 15 failed."** Progress — the batching/maxDuration fix from the second
follow-up worked (no more silent timeout kill, the route ran to completion and reported
real per-file outcomes) — but 15 of 18 remaining files genuinely failed. Couldn't diagnose
from what was on screen: the UI only ever showed a failure *count*, discarding each
failure's actual error message. Two changes: (1) `KnowledgeBaseClient.tsx` now keeps each
failed slug + its real error text and lists them under the summary line, so the next
attempt is diagnosable directly from a screenshot instead of guessed at blind; (2) leading
suspect is a burst of `BATCH_SIZE=5` concurrent Voyage calls tripping a rate or connection
limit (not a systemic bug, given 3 of the 5-per-batch did succeed) — dropped to `BATCH_SIZE
= 3` with a 500ms pause between batches in `app/api/admin/migrate-audit-knowledge/route.ts`
as a defensive mitigation, still comfortably inside `maxDuration = 60` even worst-case (21
files ÷ 3 ≈ 7 batches). Unconfirmed until the next real run — if it fails again, the actual
error text will finally be visible rather than requiring another guess.

**Fifth same-day follow-up: all 21 confirmed synced.** The `BATCH_SIZE=3` + pause fix
worked — Drew confirmed all 21 audit reference entries are showing in
`/admin/knowledge-base`. Migration genuinely done this time, not just "loop completed."
`content/audit-knowledge/*.md` deleted for real now — the correct order this time: confirm
success first, delete second, not the reverse that caused the first follow-up above.
Verified with `tsc`/`npm run build` after the deletion.

**Sixth same-day follow-up: Phase 3 closed the rest of the way, in `wst-orchestrator-runner`.**
Drew asked to close Phase 3 all the way rather than leave the runner-side half open. That
repo's own Session 2 (see its NOTES.md there, not duplicated here) wired both remaining
pieces: the planning job now reads `client_payload.knowledge_context` into its prompt when
present, and the build job's wrapper prompt asks Claude, before opening the PR, whether
anything built this session is a genuinely reusable pattern — if so, it writes a validated
`/tmp/kb-draft.json` and a new workflow step POSTs it as a second `kb_entry_draft` review
against the same session, using `session-result`'s already-existing support for an
arbitrary `review.kind` per call (no control-plane change needed here for that). Verified
there only as valid YAML — no real planning or build dispatch has exercised either new path
yet, so this is genuinely unverified end-to-end, same caveat as everything else in this
session's saga until a real dispatch proves it.

**WST Orchestrator phase status entering the next session:** Phases 0, 1, 2, 3, 4, and 6 are
now done (control-plane + runner code for all of them). **Phase 5
(`wst-build-manager` upgrade — idempotency, starter template, auto-registration)** is the
only phase left from the original roadmap in `ORCHESTRATOR_DESIGN.md` §10. Read that doc's
§8 before starting, same as always.

---

## Recent Changes (Session 54, August 7, 2026)

**WST Orchestrator Phase 6 — Deployment drift/verification**

The design doc's own one-line description for this phase: an ongoing check that each
repo's live Vercel deployment matches its GitHub `main` HEAD, surfaced as a badge.
Motivated directly by this same session's own manual verification work (checking
`vercel ls`/PR merge state by hand for entos-group-website) — this automates exactly
that check instead of Drew running it himself each time.

**Data source, chosen over one alternative:** knowing what's live can only come from
Vercel itself — GitHub alone can't answer "did the deploy actually happen." Two ways to
ask Vercel: a new `VERCEL_API_TOKEN` calling its own Deployments API directly, or the
GitHub Deployments API (which Vercel's integration also populates), reusing the existing
GitHub App token but needing a new `Deployments: read` permission granted *and* approved
on the installation — the same class of gap that caused the Session 49 saga, this time
for a lower-stakes feature. Drew picked the new token, consistent with the same call he
made for the preview-URL problem in Session 53.

**Verified the exact API shape before writing code** rather than guessing: fetched
Vercel's own REST API docs for `GET /v7/deployments` (not `/v6` — worth checking, since
the docs describe it that way now) and confirmed via a second search that
`meta.githubCommitSha` is the correct field, auto-populated by Vercel's GitHub
integration — not assumed from memory.

**`app/api/orchestrator/drift-check/route.ts`** (new, GET): `CRON_SECRET`-gated, same
pattern as `scheduler-tick`. Deliberately its **own** cron entry, not folded into
`scheduler-tick` — checking deployment status and deciding whether to dispatch a
session are different concerns, not worth conflating into one route just because both
iterate `repos`. For every repo with both `vercel_project_id` and
`github_app_installation_id` set: fetches Vercel's most recent production deployment
(`target=production&limit=1`) for `meta.githubCommitSha`, fetches GitHub's `main` HEAD
via the existing installation-token pattern (`GET /repos/{owner}/{repo}/commits/main`),
stores both plus a timestamp on `repos`. Default branch is hardcoded to `main` — every
repo in the fleet uses it as of this session; a repo on a different default branch would
need this made configurable, not worth a new column for a fleet that's currently 100%
consistent.

**`repos.deployed_sha` / `github_head_sha` / `drift_checked_at`** (new columns):
"drifted" is computed at read time (`deployed_sha !== github_head_sha`, both non-null)
rather than stored as its own boolean, so it can't get out of sync with the two values
it's derived from.

**`vercel.json`**: second cron entry, `drift-check` on a 6-hourly schedule
(`0 */6 * * *`) — deployment drift doesn't need hourly granularity the way dispatch
timing does, and this keeps API call volume against both Vercel and GitHub reasonable.

**UI**: a red "Drift" badge on `/admin/repos`' fleet list, next to the existing
open-reviews badge, hover-title showing both short SHAs. Repo detail page's Settings tab
gets a read-only "Deployment" line showing both SHAs and in-sync/drifted status, or "Not
checked yet" before the cron has run once. Also fixed a small stale comment while in
there — the Automation checkbox's label still said "nothing reads this until Phase 4's
scheduler," which stopped being true two sessions ago.

**`VERCEL_TEAM_ID`** set directly (not sensitive — an org identifier, not a credential,
same reasoning as why `WST_ORCHESTRATOR_RUNNER_REPO` is a plain env var rather than a
secret). `VERCEL_API_TOKEN` still needs Drew to generate it from his own Vercel account
settings — that one has to come from him, same as every other real credential in this
system.

Verified with `npx tsc --noEmit` and `npm run build` (both clean, `/api/orchestrator/drift-check`
listed). Unverified end-to-end — needs `VERCEL_API_TOKEN` set and the cron to actually
fire before any repo shows real drift data.

**Same-day follow-up: full setup closed out.** `VERCEL_API_TOKEN` generated from Drew's
own Vercel account (team-scoped to `worldshifttech's projects`, not full-account —
least-privilege, and it's all this needs) and piped directly into `vercel env add`
without ever being echoed, same handling as every other real credential this session.
`VERCEL_TEAM_ID` was already set. The `deployed_sha`/`github_head_sha`/`drift_checked_at`
migration run. All four setup pieces (code, both env vars, schema) are in place — nothing
left to configure. Still genuinely unverified end-to-end: the cron hasn't fired yet
(next at the nearest UTC 00:00/06:00/12:00/18:00), and there was no way to trigger it
manually to check sooner — the `CRON_SECRET` needed to hit the route directly was
generated the same never-displayed way, so there's no copy of it available to construct
a manual test request. First real signal will be either a repo showing real SHAs on
`/admin/repos`, or Vercel's own Cron Jobs execution log.

**WST Orchestrator phase status entering the next session:** Phases 0, 1, 2, 4, and 6 are
done. **Phase 3 (knowledge base — pgvector/Voyage capture-retrieve loop)** and **Phase 5
(`wst-build-manager` upgrade — idempotency, starter template, auto-registration)** are
the two phases left from the original roadmap in `ORCHESTRATOR_DESIGN.md` §10. Neither is
inherently next in line over the other — Phase 4 already jumped the original ordering
once at Drew's own call. Whichever gets picked, read `ORCHESTRATOR_DESIGN.md` in full before starting — Phase 3
has its own dedicated section (§6, "Knowledge base loop") and Phase 5 does too (§8,
"wst-build-manager upgrade"), both with more detail than this file carries. Phase 6 had
no such section and had to be designed fresh this session; 3 and 5 don't need that.

---

## Recent Changes (Session 53, August 7, 2026)

**Build result cards + Merge to Production**

Drew noticed PR #1's fix wasn't showing on entos-group-website's live site, which
surfaced two real gaps in the same breath: (1) there was no dashboard surface for a
finished build session at all — only planning sessions ever produced a `review_items`
card, so the only way to know a build finished was checking GitHub/Vercel by hand
(exactly what we'd been doing manually all session); (2) even once you found the PR,
merging it required leaving the dashboard entirely. This session closes both.

`agent_sessions.pr_preview_url` (and `merged_commit_sha`) have existed as columns since
the Session 48 schema but nothing ever populated or displayed them. `wst-orchestrator-runner`
now resolves the Vercel preview URL by reading it off Vercel's own PR comment (see that
repo's own NOTES.md for why — no new secret, no new GitHub App permission, deliberately
chosen over two options that would've needed either) and posts a new review kind,
`build_result`, alongside its existing `pr_url` report.

**`app/api/orchestrator/session-result/route.ts`**: `ReviewInput.kind` widened to
include `"build_result"`. No schema change needed — `review_items.kind` has always been
plain `text`, never a CHECK-constrained enum.

**`app/api/admin-reviews/[id]/merge/route.ts`** (new, POST): the actual "push to
production" action, and the one genuinely irreversible thing anywhere in this inbox.
Looks up the review's session → repo, exchanges the GitHub App installation token (same
`lib/github-app.ts` helper every other orchestrator route already uses), parses the PR
number off `pr_url`, and calls GitHub's merge API directly (`PUT .../pulls/{n}/merge`).
Squash merge — a judgment call, not a requirement, made to keep each target repo's
`main` history to one commit per session rather than whatever intermediate commits a
build session made along the way. On success, stamps `agent_sessions.merged_commit_sha`
(another Session-48 column that's never been populated until now) and marks the review
`answered` with `drew_response: "Merged to production"`.

**`app/admin/reviews/ReviewInboxClient.tsx`**: `build_result` gets its own early-return
render branch in `ReviewCard` — the open-questions/decision-buttons/textarea shape
every other kind uses doesn't fit "a PR either gets merged or it doesn't." Shows PR
link + preview link (when the runner found one) and, on a pending card, **"Merge to
Production"** / **"Discard"** buttons. Discard doesn't touch GitHub at all — it's the
existing `PATCH /api/admin-reviews/[id]` route with a `drew_response` of "Discarded —
not merged," same mechanism every other kind's decision already uses; the PR stays open
on GitHub for Drew to deal with separately if he wants. `ReviewItem` gained `pr_url` /
`pr_preview_url` fields, threaded through both `/admin/reviews/page.tsx`'s global query
and `/admin/repos/[id]/page.tsx`'s repo-scoped one (both already joined `agent_sessions`
for other fields — just extending the existing `select()`).

Verified with `npx tsc --noEmit` and `npm run build` (both clean, `/api/admin-reviews/[id]/merge`
listed alongside the existing orchestrator routes). The actual merge flow is unverified
end-to-end — needs a real `build_result` card from a real dispatch under the runner's
new code, which hasn't run yet as of this commit.

**Next:** watch the next real build dispatch (entos-group-website is automation-enabled
now, or trigger one manually) and confirm a `build_result` card actually appears with a
working preview link, then try the Merge button for real.

---

## Recent Changes (Session 52, August 7, 2026)

**WST Orchestrator Phase 4 — Scheduler**

Everything before this session required Drew to click "Run Planning Session" by hand.
This session wires the scheduler `ORCHESTRATOR_DESIGN.md` §7 describes: Vercel Cron ticks
hourly, checks every repo with `automation_enabled = true` and a `planning_interval_hours`
set, and dispatches a planning session automatically once that interval has elapsed and
no session is already open for that repo. The review still lands in the inbox exactly
like a manual dispatch — nothing about this session auto-approves anything or skips human
review anywhere; it only skips *remembering to click the first button*.

**One thing Phase 4 asked for that already existed:** "a per-session runtime/cost ceiling
in the runner workflow so a stuck session can't run indefinitely" — `timeout-minutes` (20
planning / 45 build) and `--max-turns` (30 / 60) have been on both jobs since
`wst-orchestrator-runner`'s Session 1. Nothing new needed there.

**`lib/orchestrator-dispatch.ts`** (new): `dispatchOrchestratorSession()` — the exact
dispatch logic (`agent_sessions` insert, GitHub App token exchange, `repository_dispatch`
fire, `last_planning_session_at` stamp) extracted out of `/api/orchestrator/dispatch` so
the scheduler can call the identical code path rather than a second copy that could
drift. `/api/orchestrator/dispatch/route.ts` is now a thin wrapper: `verifyAdmin`, parse
body, call the helper, translate the result to a response — no behavior change for the
existing "Run Planning/Build Session" buttons.

**`app/api/orchestrator/scheduler-tick/route.ts`** (new, GET): the actual cron target.
Auth is `Authorization: Bearer $CRON_SECRET` — Vercel sends this automatically on
cron-triggered requests when `CRON_SECRET` is set on the project, which is the documented
way to confirm a hit on this otherwise-unauthenticated, guessable URL actually came from
Vercel's own scheduler. Checks `orchestrator_settings.automation_paused` first (global
kill switch, short-circuits everything if true); then for each eligible repo, checks for
an open `agent_sessions` row (`status NOT IN ('done','failed')` — the design doc's own
prose says "open," but the schema's actual status values in practice are `running` /
`awaiting_review` / `approved` / `awaiting_verification`, so "open" is read here as "not
yet terminal," not a literal match against the schema's `'open'` enum value) and whether
`planning_interval_hours` has elapsed since `last_planning_session_at` (never-run repos
are due immediately). Dispatches with a generic, deliberately non-leading brief — see the
`SCHEDULED_PLANNING_BRIEF` constant — that explicitly tells the agent it's fine to report
"nothing worth doing" rather than manufacturing busywork every single tick. Returns a
per-repo `dispatched`/`skipped` summary, useful for reading Vercel's own cron invocation
logs when debugging.

**`app/api/admin-orchestrator-settings/route.ts`** (new, GET + PATCH): `verifyAdmin`-gated
read/write of the one `orchestrator_settings` row (singleton table, seeded by the
migration below).

**`app/admin/repos/page.tsx` + `RepoFleetClient.tsx`**: fleet page now fetches and
displays the global pause state at the top, above the repo list — "Automation running" /
"Automation paused sitewide" with a toggle button. Per-repo pause is unchanged and
untouched: that's still `automation_enabled` on each repo's own detail page, exactly as
it's worked since Session 48.

**`vercel.json`** (new): `crons: [{ path: "/api/orchestrator/scheduler-tick", schedule:
"0 * * * *" }]` — hourly, per the design doc's own suggested interval. Untested whether
the account's Vercel plan tier actually permits hourly cron frequency (some tiers
restrict cron to daily) — will surface clearly in the Vercel dashboard if not; not
something worth guessing about here.

**New required Vercel env var: `CRON_SECRET`** — any long random string, must be set for
`scheduler-tick`'s auth check to mean anything (Vercel reads this same env var name to
know what to send itself). Not yet set — Drew needs to add it before the scheduler can
actually authenticate its own cron hits.

Verified with `npx tsc --noEmit` and `npm run build` (both clean, all four routes
listed — the two new ones plus the two existing orchestrator routes, unchanged
behavior confirmed by inspection since the refactor is a pure extraction).

**Next:** the scheduler is built but inert until `CRON_SECRET` is set and at least one
repo has both `automation_enabled = true` and a real `planning_interval_hours` — right
now every repo has the latter unset ("blank = never" per the UI's own placeholder), so
even once deployed, nothing fires until Drew opts a repo in deliberately.

---

## Recent Changes (Session 51, August 7, 2026)

**Target-repo feedback visibility + per-repo review views**

Three things that all serve "see what needs my attention, per repo, without leaving the
dashboard": each managed repo can now store its own Supabase credentials so the control
plane can read/resolve its feedback backlog directly; a small adapter bridges two repos'
genuinely different feedback schemas; and the repo detail page gains its own scoped
review list while the fleet list gains an open-reviews badge per row.

**Real schemas, not guessed** — read both target repos' actual code before designing
anything: `forgotten-realms-dm`'s `feedback_tickets` (`title`, `description`, `status`
`'open'|'in_progress'|'done'`) vs. `drew-griffiths-speak-easy`'s `app_feedback` (`text`,
`notes`, `status` `'open'|'planned'|'closed'`, `closed_at`). Different tables, different
columns, different status vocabularies — confirmed a single hardcoded query wouldn't work
across both before writing one. `entos-group-website` deliberately has no adapter yet,
despite being the repo whose `list-feedback.js` gap started this thread — Drew's explicit
scope call for this session, not an oversight.

**Secrets design, chosen over two other options:** passing a target repo's credentials
through `client_payload` was rejected outright (`repository_dispatch` payloads are
visible in plaintext in the runner's Actions UI — a real leak, not hypothetical). One
shared GitHub secret on the runner (a JSON blob of every repo's credentials) was also
rejected — every session would technically have read access to every other managed
repo's credentials, not just the one it's working on. Went with a
control-plane-mediated fetch instead: credentials live on the `repos` row, and a new
bearer-secret-gated endpoint (`/api/orchestrator/repo-secrets`) lets a session fetch only
the one repo's credentials it needs. Same trust model `WST_ORCHESTRATOR_SECRET` already
has elsewhere, smallest blast radius of the three.

**A second pass caught something the first design missed:** the repo detail page's
original plan would have sent `target_supabase_service_role_key`'s raw value down to the
browser on every page load (masked visually in a password input, but still present in
the page's data and readable via devtools). Fixed before building: the key is now
write-only end to end — no route ever returns it, the server passes only a
`has_target_supabase_service_role_key` boolean to the client, and the input field never
pre-fills with the real value. Also split into its own endpoint
(`/api/admin-repos/[id]/target-credentials`, POST-only) rather than folding into the
general repo-fields PATCH, so a future edit to that route's dozen unrelated fields can't
accidentally sweep this one into some other response. `target_supabase_url` isn't treated
the same way — it's a project subdomain, not a credential, and displays/edits normally.

**Still true, and deliberately not solved this session:** `target_supabase_service_role_key`
sits in the `repos` table as plaintext at the database layer (no RLS, service-role only —
the same convention as every other table here, but the first time this convention holds
a raw credential for a *different* live system rather than this project's own metadata).
Anyone holding this project's own `SUPABASE_SERVICE_ROLE_KEY` could read it directly,
bypassing the app entirely. Encryption at rest was discussed and deferred as optional,
not built.

**`lib/feedback-adapters.ts`** (new): `FEEDBACK_ADAPTERS` map keyed by `github_repo`,
`getFeedbackAdapter()`. Two entries, per the schemas above.

**`lib/target-supabase.ts`** (new): `getTargetSupabaseClient(url, key)` — a second
Supabase client for a different project's credentials, mirroring `lib/supabase.ts`'s
`getSupabase()` but parameterized instead of reading this project's fixed env vars.

**`app/api/admin-repos/[id]/target-credentials/route.ts`** (new, POST): write-only, as
above. Only overwrites the key when a non-empty value is sent — there's no way to
intentionally clear it through this route, only replace it.

**`app/api/admin-repos/[id]/feedback/route.ts`** (new, GET) and
**`.../feedback/[ticketId]/route.ts`** (new, POST): `verifyAdmin`-gated. GET returns
`{ items: [], configured: false }` (not an error) when a repo has no adapter or no
credentials set — the UI treats this as "nothing to show." POST resolves one ticket via
the adapter's `resolveField`/`resolveValue`/`resolveTimestampField`.

**`app/api/orchestrator/repo-secrets/route.ts`** (new, GET): bearer-secret
(`WST_ORCHESTRATOR_SECRET`) gated, same shape as `session-result` — built this session but
**not yet called by anything**. `wst-orchestrator-runner` doesn't fetch from it yet; that's
a future session in that repo, once build sessions actually need to resolve tickets
themselves rather than just the admin UI doing it manually.

**`app/admin/reviews/ReviewInboxClient.tsx`**: refactored, no behavior change to the
global inbox. `ReviewCard` is now exported; a new exported `ReviewList` (tabbed
Pending/Answered + card rendering) was extracted so the repo detail page can reuse the
exact same UI against a different, filtered item set instead of duplicating the tab logic.

**`app/admin/repos/[id]/page.tsx`**: fetches this repo's own `review_items` via
`agent_sessions!inner(repo_id, ...)` + `.eq("agent_sessions.repo_id", id)` — the `!inner`
modifier is required for a PostgREST embedded-column `.eq` to actually filter rather than
just shape the nested object. Passes `target_supabase_url` normally but computes
`has_target_supabase_service_role_key` as a boolean rather than ever passing the raw
column through.

**`app/admin/repos/[id]/RepoDetailClient.tsx`**: three new sections — Target Supabase
Credentials (URL + write-only key field, separate "Save Credentials" action), Feedback
(only renders when `configured: true` comes back; a "Resolve" button per open ticket),
Reviews (renders `<ReviewList>` against this repo's own items, same Pending/Answered tabs
as the global inbox).

**`app/admin/repos/page.tsx`**: computes an open-reviews count per repo — one query for
all pending `review_items` joined to `agent_sessions(repo_id)`, aggregated in JS rather
than a SQL group-by (no view/RPC exists for this yet; fine at the fleet's current size).

**`app/admin/repos/RepoFleetClient.tsx`**: renders that count as a small orange badge
next to the repo name, hidden at zero.

Verified with `npx tsc --noEmit` and `npm run build` (both clean, all four new routes
listed).

**Next:** wire `wst-orchestrator-runner` to actually call `/api/orchestrator/repo-secrets`
during a build session, so autonomous build work can resolve feedback tickets too, not
just the admin UI's manual path. Also worth a look eventually: encryption at rest for
`target_supabase_service_role_key`, and adapters for any other repos that grow their own
feedback backlog (`entos-group-website` included, deliberately deferred this session).

**Same-day follow-up: tabs.** Drew confirmed the credentials save flow works (added real
credentials for both repos, write-only round-trip held up), then flagged that Feedback and
Reviews were buried at the bottom of a long scrolling page. `RepoDetailClient.tsx`
restructured into three tabs — Settings (core fields, Target Supabase Credentials, Run
Planning Session, Save — everything that was already above Feedback, unchanged, just
grouped), Feedback, Reviews — with open counts in the Feedback/Reviews tab labels. The
Feedback tab now handles its own loading/not-configured/populated states inline instead
of the whole section just not rendering; Reviews unchanged internally, just moved. No
route or data-shape changes, UI-only. Verified with `tsc`/`npm run build`.

**Same-day follow-up: Phase 2 fully closed — first real Build Mode PR.** Everything
proven end-to-end so far had been Planning Mode only (Session 49). Drew ran a fresh
planning session against `entos-group-website` (post "start fresh" cleanup earlier this
session), answered the resulting review, and clicked "Run Build Session." Verified
directly via `gh` (installed this session specifically to check — see below): the
`build` job completed successfully in 19m39s (vs. 3-5 min for planning runs, consistent
with a real checkout → edit → build → push → PR cycle under the `bypassPermissions`
change from earlier today), and produced
[entos-group-website#1](https://github.com/worldshifttech/entos-group-website/pull/1) —
open, mergeable, clean build. Real scoped work (a heading-orphan CSS bug across two
pages), verified programmatically by the build session itself (`getClientRects()`
measurements across 7 viewports, counterfactual testing), plus a sitewide sweep that
correctly logged 49 similar instances to `docs/open-items.md` rather than fixing them
unprompted. Updated that repo's own README/NOTES.md per its documentation convention.
Per its own PR description: no live production check was possible (unattended CI, no
`vercel --prod`) — that's still owed by a human after merge.

**This closes Phase 2 per `ORCHESTRATOR_DESIGN.md` §10's own definition** ("a real
approved build prompt, a real PR"). Both planning and build are now proven working
end-to-end against a real repo, not just planning.

**Tooling note:** `gh` CLI wasn't available in this environment — installed via
`winget install --id GitHub.cli` specifically to verify this. Not on PATH for
already-running shell sessions (Windows doesn't refresh a running process's environment
after an installer runs); invoked by full path (`C:\Program Files\GitHub CLI\gh.exe`)
for the rest of this session. A fresh terminal picks it up normally.

---

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

**Same-day follow-up: first live build dispatch, one more gap, and a "Delete" action.**

The first real `session_type: "build"` dispatch (against `entos-group-website`, from the
"mobile QA pass" card a test planning dispatch produced) failed immediately —
`claude-code-action@v1` has its own anti-loop guard that refuses to run for a non-human
actor, and every `build` dispatch is authenticated via the exchanged GitHub App
installation token, never a human, so it hit this by construction. Fixed in
`wst-orchestrator-runner` (`allowed_bots: "wst-orchestrator[bot]"` on the action step) —
full detail in that repo's own NOTES.md, not duplicated here since this repo holds none of
that workflow's code.

Drew also asked to clear out stray/test planning items for `entos-group-website` before
starting a fresh planning doc for it. The Reviews inbox had no delete path at all — PATCH
only ever marks a card `answered`, nothing removes one — so added a real one rather than
touching Supabase directly by hand (deliberately staying inside the app's own
`verifyAdmin` pattern, not the service-role key, per the hard rule in
ORCHESTRATOR_DESIGN.md §9).

**`app/api/admin-reviews/[id]/route.ts`**: new `DELETE` handler, same `verifyAdmin`
pattern as `PATCH`. Deletes only the `review_items` row, not its parent `agent_sessions`
row — that stays as the historical record that a dispatch happened, same reasoning
already applied to the stuck-`running` rows left alone in Session 49.

**`app/admin/reviews/ReviewInboxClient.tsx`**: a small "Delete" text link on every card
(any kind, any status), `window.confirm()` gated before the request fires. On success, the
card is filtered out of local state immediately.

Verified with `npx tsc --noEmit` and `npm run build` (both clean).

**Same-day follow-up to the follow-up:** Drew asked for Delete on answered cards too —
the reasoning above about answered cards being "a decision on record" was this session's
own judgment call, not something Drew had actually asked for narrowly; he wanted it
everywhere. Removed the `status === "pending"` gate so the control is unconditional.
`window.confirm()` is the only guard on both states — no separate stronger warning for
answered cards specifically. Verified clean again with `tsc`/`npm run build`.

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
