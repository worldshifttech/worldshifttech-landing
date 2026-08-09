# WST Orchestrator — Design Doc

> Status: all 6 phases from §10 shipped (closed as of `worldshifttech-landing`'s own
> Session 56 — see its NOTES.md) — this describes a live system, not a plan. Still the
> source of truth for the multi-repo Claude Code orchestration system; keep updating it as
> the system evolves, the way NOTES.md treats session history but for the project as a
> whole rather than one session. §2 (fleet) and §3 (data model) were checked against the
> live database directly and corrected on August 9, 2026 (Session 69 follow-up) — both had
> drifted well behind reality by then without anyone noticing, so re-verify them again
> rather than trusting this doc blindly if it's been a while since the date above.

---

## 1. What this is

A system for running Claude Code planning and build sessions against Drew's own fleet of
repos on a schedule, with Drew reviewing and approving from a dashboard instead of sitting
at a terminal for every session. It does **not** replace interactive Claude Code sessions —
it automates the *triggering* of sessions that already follow the existing WST App Standard
(Planning Mode / Build Mode) convention every WST project already documents for itself.

Two things live outside code entirely and are load-bearing for everything else:
- **GitHub is the only source of truth.** Nothing is "real" to this system until it's
  pushed. Local, uncommitted work is invisible to automation and stays Drew's problem to
  push before a repo can be automated.
- **Review gates stay exactly as strict as they are in interactive sessions today.**
  Planning Mode still asks before deciding, Build Mode still flags anything that could
  break production before proceeding — this system automates *when* those modes run, not
  *whether* they ask permission.

---

## 2. Fleet audit (as of this design)

| Repo | Local path | On GitHub | Stack | Auth convention | wst-build-manager scaffolded? |
|---|---|---|---|---|---|
| worldshifttech-landing | `C:\Users\drewg\worldshifttech-landing` | yes | Next.js + Supabase | Supabase Auth (single admin) | no (predates the tool) |
| entos-group-website | `C:\Users\drewg\entos-group-website` | yes | Vite + Vercel functions + Supabase | none needed (public marketing site) | yes |
| drew-griffiths-speak-easy | `C:\Users\drewg\drew-griffiths-speak-easy` | yes | Vite + Vercel functions + Supabase (pgvector) | shared-secret `x-app-token` | yes |
| forgotten-realms-dm | `C:\Users\drewg\Documents\forgotten-realms-dm` | yes — `worldshifttech/forgotten-realms-dm` | Vite + Vercel functions + Supabase | Supabase Auth | no (personal, predates tool) |
| wst-build-manager | `C:\Users\drewg\wst-build-manager` | yes — `worldshifttech/wst-build-manager` | Node CLI, no framework | n/a (local tool) | n/a — it's the tool itself |

Both `forgotten-realms-dm` and `wst-build-manager` were git-initialized and pushed during
Phase 0 (previously neither had any version control at all). `.gitignore` was verified
clean on both before committing — no `.env`/`.env.local` in either repo's history.

Three more client repos surfaced under the `worldshifttech` org while installing the
GitHub App that weren't in the original audit: `mt-courses-training`,
`carri-cameron-ai-social-media-manager`, `c4vl-intake-api`. Not yet folded into the fleet
— decide later whether they join `repos`.

Per Drew: all repos here are his own except `entos-group-website`, which is client work
(currently just a marketing site, no app layer yet).

**Three auth conventions exist across the fleet, not one** — `stack_type` needs to record
auth convention as its own field, not fold it into a single enum with the frontend
framework choice. **Resolved:** this shipped exactly as described — `repos.stack_type`
became two real columns, `framework_type` and `auth_convention`. See §3.

**wst-build-manager's real gaps** (now in scope, see §8): non-idempotent bootstrap (no
rollback, no resume-from-failure), no starter app template is actually scaffolded into new
repos today, and its cost-telemetry pipeline (`log-build-session.js` / `sync-build-costs.js`)
is 100% manually estimated — no timer, no token count, human-guessed hours. This system
doesn't have to fix that last one, but real per-session telemetry (§4) makes it obsolete as
a side effect.

**Fleet, as actually registered in `repos` on August 9, 2026 (verified live, not from
memory of this table):** the four repos above, still — plus `wst-orchestrator-runner`
itself, added as a `repos` row in Session 65 so the control plane can dispatch to its own
compute-plane repo (see §4's own note that the GitHub App is "installed on every managed
repo, including the runner repo itself"). `wst-build-manager` is correctly **not** a
`repos` row — it was never meant to be a dispatch target, it's the local provisioning CLI,
consistent with this table's own original "n/a — it's the tool itself." The three surfaced
client repos below are still not folded in, unchanged since this design was written.

---

## 3. Data model

All new tables live in `worldshifttech-landing`'s Supabase project — this is the control
plane. None of it has RLS; access is mediated by the admin login and the orchestrator's own
shared secret, same convention as `build_cost_entries` and `projects`.

### `repos`
One row per codebase under management. Deliberately separate from `projects` (the
client-roadmap table from Session 46) — most repos here have no client, no roadmap, no
budget, and forcing them into that table would pollute its semantics.

**Live columns as of August 9, 2026** (the original `stack_type` design below never
shipped as one field — see §2's "Resolved" note):

```
id                          uuid PK
name                        text
local_path                  text
github_owner                text            -- "worldshifttech"
github_repo                 text            -- "entos-group-website"
vercel_project_id           text nullable
framework_type              text            -- 'nextjs' | 'vite' | 'other'
auth_convention             text            -- 'supabase_auth' | 'shared_secret' | 'none' | 'other'
client_project_id           uuid nullable REFERENCES projects(id)   -- link when there IS a client roadmap
automation_enabled          boolean default false
planning_interval_hours     integer nullable
last_planning_session_at    timestamptz nullable
github_app_installation_id  bigint nullable
system_group                text nullable   -- Session 65; free-text tag — repos sharing a value are treated as one system in dispatch run titles
target_supabase_url         text nullable   -- Session 51; a managed repo's own Supabase project, for reading its feedback backlog
target_supabase_service_role_key text nullable  -- Session 51; write-only end to end, never returned by any route
deployed_sha                text nullable   -- Session 54; Vercel production deployment's git SHA, from the drift-check cron
github_head_sha              text nullable   -- Session 54; GitHub main HEAD SHA, from the drift-check cron
drift_checked_at            timestamptz nullable  -- Session 54
created_at                  timestamptz default now()
updated_at                  timestamptz default now()
```

### `agent_sessions`
One row per planning or build session, automated or manually triggered.

**Live columns as of August 9, 2026** — two added since this table was first designed:

```
id                    uuid PK
repo_id               uuid REFERENCES repos(id)
session_type          text            -- 'planning' | 'build'
status                text            -- 'open' | 'awaiting_review' | 'approved' | 'running' | 'awaiting_verification' | 'done' | 'failed'
brief                 text            -- what this session is working on
build_prompt          text nullable   -- final output of a planning session
pr_url                text nullable   -- set once a build session opens a PR
pr_preview_url        text nullable   -- Vercel's preview deployment for that PR
merged_commit_sha     text nullable
github_run_id         bigint nullable -- the Actions run that executed this
source_review_item_id uuid nullable REFERENCES review_items(id)  -- Session 66; which review card, if any, this build was dispatched from
checkpoint            jsonb nullable  -- Session 68; { progress_status: 'on_track'|'stuck'|'blocked', narrative, remaining_work }, self-reported by a build session at logical stopping points
created_at            timestamptz default now()
updated_at            timestamptz default now()
completed_at          timestamptz nullable
```

### `review_items`
The inbox. A consolidated card, not a back-and-forth chat — see §5 for why.

**Live columns as of August 9, 2026** — a fourth `kind`, a `kb_draft` field, and a third
`status` value all shipped since this table was first designed:

```
id                    uuid PK
session_id            uuid REFERENCES agent_sessions(id)
kind                  text            -- 'consolidated_review' | 'production_risk_flag' | 'kb_entry_draft' | 'build_result'
summary               text            -- what the agent decided on its own
open_questions        jsonb           -- [{ question, suggested_options: [...] }]
proposed_content      text nullable   -- e.g. the build prompt, a drafted KB entry's long-form description, or (build_result cards) SQL pulled from the PR description
kb_draft              jsonb nullable  -- Session 55; kb_entry_draft only — structured metadata (title, problem_solved, tags, tech_stack, artifact_location)
drew_response         text nullable
status                text            -- 'pending' | 'answered' | 'archived'
created_at            timestamptz default now()
answered_at           timestamptz nullable
archived_at           timestamptz nullable  -- Session 68; set only by Drew manually confirming the real thing behind this card is actually live and working — never automatic on merge or deploy
```

### `knowledge_base_entries`

**Live columns as of August 9, 2026** — `category`, `tool_slug`, and `reference_doc` all
shipped in Session 55's Audit Knowledge Base consolidation, folding a second, previously
disconnected system into this table rather than the two staying separate:

```
id                    uuid PK
category              text            -- Session 55; 'audit_reference' | 'build_artifact' — one table now holds both audit reference docs and build-session artifacts
title                 text
tool_slug             text nullable   -- Session 55; audit_reference rows only, ties back to the original content/audit-knowledge/*.md doc it was migrated from
problem_solved        text nullable
tags                  text[]
tech_stack            text[]
artifact_description  text nullable   -- what it is / how it works (build_artifact rows)
artifact_location     text nullable   -- file path + repo + git ref, or an inline snippet
reference_doc         text nullable   -- Session 55; audit_reference rows' full migrated markdown body
source_repo_id        uuid nullable REFERENCES repos(id)
source_session_id     uuid nullable REFERENCES agent_sessions(id)
embedding             vector(1024)    -- Voyage voyage-3, matching the dimension already
                                      -- documented in the WST App Standard's AI table
reuse_count           integer default 0
created_at            timestamptz default now()
```

`create extension if not exists vector;` is enabled on this Supabase project (done during
Phase 3). An `ivfflat` or `hnsw` index still hasn't been added — still not enough data to
make one meaningful as of this check.

### `session_drafts` (not in the original design — added Session 63)
Saved-but-not-dispatched planning/build briefs, so a scoped brief can sit as "a ticket in
the app I can look at later to run" (Drew's own words) instead of only living in a
component's local state until dispatched or lost on refresh.

```
id            uuid PK
repo_id       uuid REFERENCES repos(id)
session_type  text            -- 'planning' | 'build'
title         text
brief         text
created_at    timestamptz default now()
```

---

## 4. The compute plane

**Control plane** (`worldshifttech-landing`): decides what's due, stores state, serves the
review inbox, receives results.

**Compute plane**: a new, separate, minimal repo — `wst-orchestrator-runner` — holding one
GitHub Actions workflow. It does not contain business logic beyond "clone the right repo,
run Claude Code in the right mode, post the result back." Kept separate from
`worldshifttech-landing` the same way `wst-build-manager` is already a separate tool from
the sites it provisions.

**Repo access — GitHub App**, installed on every managed repo (including the runner repo
itself, so the control plane can dispatch to it):
- Permissions, confirmed empirically during Phase 2 (see worldshifttech-landing's
  NOTES.md, Session 49 follow-up, for the debugging trail): Contents (write), Actions
  (write), Workflows (write), Pull requests (write), Metadata (read). Both Actions *and*
  Workflows are required to actually turn an accepted `repository_dispatch` into a
  workflow run — Contents (write) alone is enough for the dispatch call itself to return
  204, which made this genuinely hard to diagnose. GitHub's own docs frame `Workflows` as
  being for updating workflow YAML files, not for triggering runs, but granting it is
  what unblocked things here.
- The App's ID and private key live as secrets in `worldshifttech-landing`'s Vercel
  environment (to dispatch) and the runner repo's Actions secrets (to exchange for a
  clone/push token inside the workflow).
- Installation tokens are exchanged fresh per run (roughly 1-hour lifetime) — nothing
  long-lived sits in a secrets store the way a PAT would.

**Flow for one session:**
1. Something decides a repo is due (Drew clicks "Run Planning Session" on `/admin/repos/[id]`,
   or the scheduler in §7 fires automatically).
2. `worldshifttech-landing` creates an `agent_sessions` row (`status: 'running'`), exchanges
   the GitHub App for a token, fires `repository_dispatch` on `wst-orchestrator-runner` with
   `{ repo_id, session_id, session_type, brief, resume_context? }`.
3. The Actions workflow exchanges its own installation token for the *target* repo,
   clones it, and runs Claude Code non-interactively, instructed to follow that repo's own
   README's Planning Mode or Build Mode exactly as written — the orchestrator does not
   reimplement that protocol, it invokes it.
4. On completion, the workflow POSTs the result to a new `worldshifttech-landing` route
   (`/api/orchestrator/session-result`), authenticated the same shape as `ingest-build-cost`:
   a bearer secret (`WST_ORCHESTRATOR_SECRET`), a fixed JSON body.
5. `worldshifttech-landing` updates the `agent_sessions` row and creates a `review_items`
   row from the result.

---

## 5. How a headless agent asks a question

There is no synchronous human available inside a CI run, so this can't be a back-and-forth
chat. Design: **one full unattended pass per dispatch, ending in exactly one consolidated
review card** — not a multi-round Socratic dialogue. The agent is instructed to behave the
way recent sessions in this very repo have actually gone: explore thoroughly, make every
call it can defend on its own, and surface only what genuinely needs Drew — plus, if
nothing's blocking, the finished build prompt ready for a straight approve.

A `review_items` row therefore always carries three things: `summary` (what it decided
unprompted, so Drew can veto), `open_questions` (what it couldn't resolve, each with
suggested options plus room for free text — same shape as this chat's own
clarifying-question pattern), and `proposed_content` (the build prompt, once fully
specified). Drew's answer in the dashboard becomes the `resume_context` for the *next*
dispatch of that same session — planning can take more than one round trip, it just
shouldn't by default.

Build session review cards are simpler: PR link, preview URL, a one-line summary of what
shipped. Merging the PR is the approval action.

**Proposed, not yet designed (raised by Drew during Session 48 hand-testing):** an "Ask AI"
helper on each review card — a button that opens a small chat scoped to that one card,
so Drew can ask what a `production_risk_flag` or `kb_entry_draft` is actually asking for
before answering it, rather than guessing. Real questions this needs answered before it's
buildable: what context the assistant gets (just the card's own fields, or the source
repo too), whether it can draft an answer into the response field directly or only
explain, and whether it's a new Claude API route or reuses something existing. Natural
fit for Phase 2 or later, once real agent-generated cards exist to test it against — don't
build this speculatively off the Phase 1 seed data.

---

## 6. Knowledge base loop

**Capture:** at the end of a build session, before opening the PR, the agent evaluates
whether anything it built looks reusable. If so, it drafts a `knowledge_base_entries` row
(title, problem, tags, tech stack, artifact description/location) and surfaces it as a
`review_items` row of kind `kb_entry_draft` — approve, edit, or discard. Never silently
inserted, never a manual CLI step to remember either.

**Retrieve:** at the start of a planning session, the runner embeds the session's brief via
Voyage, runs a similarity search against `knowledge_base_entries.embedding`, and injects the
top few matches into the agent's context — same shape as `lib/audit-knowledge.ts`'s
`formatKnowledgeForPrompt()` already does for a different feature in this repo, just backed
by vector similarity instead of a keyword-to-slug map.

---

## 7. Scheduler

Vercel Cron on `worldshifttech-landing` — cheap, already-available, no new infrastructure —
runs on a short interval (e.g. hourly) and, for each `repos` row where
`automation_enabled = true`, checks: is there already an open `agent_sessions` row for this
repo? Has `planning_interval_hours` elapsed since `last_planning_session_at`? Only if both
answers clear does it trigger the dispatch flow in §4. This keeps GitHub Actions minutes
near the free tier (see the earlier cost discussion — at 4–8 repos this is not a meaningful
expense) and, more importantly, means most cron ticks do nothing at all rather than
spinning up agent runs for no reason.

**Controls:** a global "pause all automation" toggle and a per-repo pause, both checked
before the scheduler dispatches anything. A per-session runtime/cost ceiling in the runner
workflow so a stuck session can't run indefinitely.

---

## 8. wst-build-manager upgrade (in scope)

Separate work-stream from the orchestrator itself, but landing in the same initiative per
Drew's call:
- **Idempotency**: each of `bootstrap.js`'s ~10 steps needs a check-before-create (does
  this GitHub repo/Supabase project/Vercel project already exist for this slug?) so a
  retried run after a partial failure doesn't duplicate or error out. Likely needs
  step-level status tracked in `projects.json` rather than the current all-or-nothing
  `printFailureSummary` on fatal error.
- **Starter template**: `bootstrap.js` currently writes `README.md`/`.env.local`/pricing
  config into the new repo but no actual app skeleton — `npm install` has nothing to
  install. Needs a real starter matching the WST App Standard (Vite + `src/` + `api/`
  skeleton, matching whichever `stack_type` convention is chosen for the new project).
- **Auto-registration**: once bootstrap finishes, it should also register the new project
  as a `repos` row in `worldshifttech-landing`, via a new endpoint following the exact
  `ingest-build-cost` shape (shared secret, POST, done) — closing the gap where new
  projects currently need to be added to the fleet by hand.

---

## 9. Security summary

- GitHub App, not a PAT — per-repo install, short-lived tokens, real audit trail.
- Every new cross-repo sync channel (session results, KB drafts, repo registration) reuses
  the exact `WST_INGEST_SECRET` shape already proven by the build-cost pipeline: one shared
  secret, one bearer header, one fixed JSON contract, mark-as-processed on success.
- **Hard rule, learned the expensive way during this design's own research phase:**
  automated sessions may know a secret exists and what it's named. They should never need
  to read or echo its actual value, and any tooling given to them should not expose raw
  `.env*` contents by default — only a task that explicitly requires rotating or verifying
  a specific key should ever touch a value directly.
- Global and per-repo automation pause switches, checked before every scheduled dispatch.
- Per-session runtime/cost ceiling in the runner workflow.
- Build sessions open a PR, never push directly to `main` — Vercel's automatic preview
  deployment per PR becomes the "did this actually work" check before merge, not an
  afterthought.

---

## 10. Phased build order

Roughly session-sized chunks, in dependency order:

**Phase 0 — manual setup (Drew, not code):**
Register the GitHub App in GitHub's UI, generate its private key, install it on the
initial repo set. Enable `pgvector` on this Supabase project. Get a Voyage API key.
`git init` + push `forgotten-realms-dm`.

**Phase 1 — control plane:** `repos`, `agent_sessions`, `review_items`,
`knowledge_base_entries` tables; `/admin/repos` fleet view; `/admin/reviews` inbox UI.
Fully testable by hand before any real agent runs — seed rows manually, confirm the UI
works.

**Phase 2 — the runner + one real end-to-end loop:** `wst-orchestrator-runner` repo, the
GitHub App token exchange, one manual "Run Planning Session" button wired all the way
through to a real repo, a real review card, a real approved build prompt, a real PR. This
is the phase that proves the whole idea.

**Phase 3 — knowledge base:** pgvector + Voyage wiring, the capture/draft flow at the end
of build sessions, the retrieve/inject flow at the start of planning sessions.

**Phase 4 — scheduler:** Vercel Cron heartbeat, automation toggles, pause switches, cost
ceiling.

**Phase 5 — wst-build-manager upgrade:** idempotency, starter template, auto-registration
into `repos`.

**Phase 6 — drift/verification:** ongoing check that each repo's live Vercel deployment
SHA matches its GitHub default-branch HEAD (or its last merged PR, once PR-based builds
are the norm), surfaced as a badge per repo.

Phases 1–2 are the ones that matter most to get right early — everything after them is
additive, not load-bearing.

---

## 11. Known risks / open concerns (raised during a live end-to-end test, Session 69
follow-up, August 9, 2026)

Surfaced while running a real planning → build → merge test against `forgotten-realms-dm`,
looked at specifically for what could produce high-risk or low-quality outcomes rather than
whether the happy path works. The happy path does work — every step of that test traced
cleanly through `agent_sessions` and `review_items` exactly as designed. These are the gaps
underneath it, not a report that something is currently broken:

- **"Review" can collapse into reading the agent's own account of its own work, not the
  diff.** The `build_result` card shows a summary, a PR link, a preview link — nothing
  inline shows the actual diff. Nothing in the UI requires the extra hop to GitHub before
  the "Merge to Production" button is clickable. A one-line docs fix and a 500-line refactor
  get identical UI friction.
- **Fact-verification inside a build prompt is a convention the planning session chose to
  write in, not something the system enforces.** This test's own build prompt happened to
  tell the build session to re-derive a claimed number itself rather than trust the planning
  session's claim — good discipline, but nothing structural requires every build prompt to
  include a self-check like that. A differently-behaved planning session could assert
  something false with the same confidence and nothing catches it before it merges.
- **Failure is silent by default**, and this already happened once for real: Session 65
  found `entos-group-website`'s scheduled automation dead for four days before anyone
  noticed. The fix that shipped (auto-fail anything stuck non-terminal for 3+ hours) cleans
  up the symptom, not the gap — a failed session today still just sits there with zero
  notification. `notify-slack` has a `file_upload` type and a `milestone_response` type;
  there's no `session_failed` type.
- **No spend visibility anywhere in the dashboard.** Session 58's own README entry
  documents a real failure that burned real cost with no PR to show for it — that's only
  discoverable by reading NOTES.md after the fact. No running total, per-repo or
  time-windowed, exists anywhere in `/admin`.
- **Every repo gets identical trust regardless of what's actually at stake.**
  `entos-group-website` (real client work, `automation_enabled: true`, already dispatching
  unattended on a schedule) gets the exact same one-click merge flow as a personal test
  repo. The only risk gating that exists is whatever the agent itself decides to flag as a
  `production_risk_flag` — self-assessed, not externally imposed.
- **Secrets are centralized in one place, which concentrates blast radius.** Every managed
  repo's target Supabase service-role key lives in this control plane's own database
  (write-only, never echoed back, which is the right call in isolation) — but it means one
  compromise of this database's service role exposes every managed repo's credentials at
  once, not just one repo's.
- **Unverified from this repo's side:** whether `wst-orchestrator-runner`'s build job
  actually runs the target repo's own lint/typecheck/build as a gate before opening a PR, or
  relies on the agent choosing to do that because a prompt told it to — same
  convention-not-guarantee pattern as the fact-verification point above. Check that repo's
  own NOTES.md directly rather than assuming either way.

What's already solid and worth keeping exactly as-is: PR-not-direct-push, admin-only auth
on every route, write-once credential fields, GitHub App short-lived tokens over a PAT, and
Archive being a manual, deliberate action instead of automatic on deploy.
