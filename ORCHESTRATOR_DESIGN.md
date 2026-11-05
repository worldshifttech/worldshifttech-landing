# WST Orchestrator (retired)

> Status: **retired in November 2026 (Session 90).** Drew now uses Claude Code directly
> (cloud sessions on each repo) instead of an app that dispatches sessions. Nothing in this
> repo dispatches, schedules or reviews Claude Code sessions any more.

## What it was

A control plane in this repo (`/admin/repos`, `/admin/reviews`, `/api/orchestrator/*`) plus a
compute plane in the `wst-orchestrator-runner` repo (GitHub Actions), which ran planning and
build sessions against Drew's repos on a schedule or on demand and reported back as review
cards. Roughly 90 sessions of design, build and live-test notes went into it.

## Where the full design is

The original design doc (about 570 lines: fleet audit, data model, flows, known risks) is in
git history. To read it:

```
git show d8b060c:ORCHESTRATOR_DESIGN.md
```

`d8b060c` is the last commit before the code was removed; `NOTES.md` Sessions 48 to 88 record
how it was built and what went wrong.

## What replaced it

| Orchestrator feature | Now |
|---|---|
| Dispatch a planning or build session | A Claude Code cloud session on the repo, started from the Claude app or desktop |
| Hourly scheduled planning check-in | A cloud scheduled task per repo, only if wanted |
| Review inbox | The chat itself, plus PR review in the app |
| Context from the knowledge base | `docs/plans/` in each repo, and the `wst-build-manager` repo as the cross-project hub |

## What was left in place

- The database tables (`repos`, `agent_sessions`, `review_items`, `orchestrator_settings`) and
  the schema in `supabase/schema.sql` are untouched. Dropping them is optional and not done.
- `knowledge_base_entries`, `lib/knowledge-base.ts` and `lib/voyage.ts` stay: the public AI
  audit (`/api/generate-audit`) uses them.
- Client projects, client hubs, the feedback portal, curriculum and build costs are unrelated
  to the orchestrator and unchanged.
