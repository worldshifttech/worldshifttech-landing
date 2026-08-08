CREATE TABLE generated_pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  industry text NOT NULL,
  solution text NOT NULL,
  slug text GENERATED ALWAYS AS (industry || ':' || solution) STORED UNIQUE,
  headline text NOT NULL,
  problem text NOT NULL,
  solution_body text NOT NULL,
  use_cases jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- MIGRATION: Session 1 — projects table
CREATE TABLE projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  status text DEFAULT 'draft',
  answers jsonb DEFAULT '{}',
  scope jsonb DEFAULT '{}',
  demo_url text,
  claude_code_prompt text, -- MIGRATION: Session 8 — demo pipeline
  green_offset_intent boolean DEFAULT false, -- MIGRATION: Session 7 — green layer
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- MIGRATION: Session 7 — green layer
ALTER TABLE projects ADD COLUMN IF NOT EXISTS green_offset_intent boolean DEFAULT false;

-- MIGRATION: Session 8 — demo pipeline
ALTER TABLE projects ADD COLUMN IF NOT EXISTS claude_code_prompt text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS demo_url text; -- if not already present

-- MIGRATION: project_readme
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_readme text;

-- MIGRATION: Session 9 (April 27) — guest boolean for unauthenticated wizard flow
ALTER TABLE projects ADD COLUMN IF NOT EXISTS guest boolean DEFAULT false;
-- Also run: allow unauthenticated inserts for guest projects (RLS policy)
CREATE POLICY "Guest project insert allowed"
ON projects FOR INSERT
WITH CHECK (guest = true AND user_id IS NULL);

-- RLS Policies for projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);

-- MIGRATION: Session 33 — audit_estimates table
CREATE TABLE IF NOT EXISTS audit_estimates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest boolean DEFAULT true,
  business_name text,
  business_type text,
  team_size text,
  departments jsonb,
  tools_by_department jsonb,
  ai_usage jsonb,
  monthly_spend_range text,
  report jsonb,
  status text DEFAULT 'complete',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE audit_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit estimates"
ON audit_estimates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit estimates"
ON audit_estimates FOR INSERT
WITH CHECK (auth.uid() = user_id OR (guest = true AND user_id IS NULL));

CREATE POLICY "Admin full access on audit estimates"
ON audit_estimates FOR ALL
USING (auth.jwt() ->> 'email' = 'drew@worldshifttech.com');

-- MIGRATION: Curriculum platform (Session 41)

CREATE TABLE curriculum_domains (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  number integer NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  overview_text text NOT NULL,
  estimated_hours text,
  prerequisites text,
  practitioner_note text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE curriculum_modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id uuid REFERENCES curriculum_domains(id) ON DELETE CASCADE,
  domain_number integer NOT NULL,
  module_number text NOT NULL,
  title text NOT NULL,
  estimated_time text,
  learning_objectives jsonb DEFAULT '[]',
  key_sources jsonb DEFAULT '[]',
  connections jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(domain_id, module_number)
);

CREATE TABLE curriculum_lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid REFERENCES curriculum_modules(id) ON DELETE CASCADE,
  module_number text NOT NULL,
  lesson_number text NOT NULL,
  title text NOT NULL,
  estimated_time text,
  teaching_method text,
  core_content text NOT NULL,
  reflection_prompt text,
  ai_prompt_suggestions jsonb DEFAULT '[]',
  key_takeaway text,
  sort_order integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(module_id, lesson_number)
);

CREATE TABLE curriculum_assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid REFERENCES curriculum_modules(id) ON DELETE CASCADE,
  module_number text NOT NULL,
  assessment_type text NOT NULL,
  prompt text NOT NULL,
  what_it_measures text,
  is_capstone boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE curriculum_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES curriculum_lessons(id) ON DELETE CASCADE,
  status text DEFAULT 'not_started',
  started_at timestamptz,
  completed_at timestamptz,
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE curriculum_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id uuid REFERENCES curriculum_assessments(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  reviewer_note text,
  reviewed_at timestamptz,
  UNIQUE(user_id, assessment_id)
);

-- RLS: curriculum content readable by all authenticated users
ALTER TABLE curriculum_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read domains"
  ON curriculum_domains FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read modules"
  ON curriculum_modules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read lessons"
  ON curriculum_lessons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read assessments"
  ON curriculum_assessments FOR SELECT USING (auth.role() = 'authenticated');

-- RLS: progress rows owned by the learner
ALTER TABLE curriculum_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON curriculum_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress"
  ON curriculum_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress"
  ON curriculum_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS: response rows owned by the learner
ALTER TABLE curriculum_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own responses"
  ON curriculum_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own responses"
  ON curriculum_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own responses"
  ON curriculum_responses FOR UPDATE USING (auth.uid() = user_id);

-- Build-cost telemetry from wst-build-manager client projects (service-role only, no RLS —
-- same convention as wst_usage_snapshots; never exposed to end clients)
CREATE TABLE build_cost_entries (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_slug text NOT NULL,
  label       text,
  human_hours numeric DEFAULT 0,
  ai_hours    numeric DEFAULT 0,
  ai_tier     text,
  human_cost  numeric DEFAULT 0,
  ai_cost     numeric DEFAULT 0,
  total_cost  numeric DEFAULT 0,
  logged_at   timestamptz,
  created_at  timestamptz DEFAULT now()
);

-- MIGRATION: Session 46 — retire client accounts, rebuild project backend around a roadmap model
--
-- Client accounts are gone everywhere (projects wizard, audit save-flow). Drew is the only
-- login (Supabase Auth, unchanged). Clients reach a project via a direct link, either open
-- or gated by a per-project password (see lib/project-access.ts — salted hash + signed
-- cookie, no Supabase Auth involved). The old wizard/status-queue projects table is archived,
-- not dropped.

ALTER TABLE projects RENAME TO projects_archive_2026;

CREATE TABLE projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  client_name text,
  title text NOT NULL,
  percent_complete integer NOT NULL DEFAULT 0,
  next_update_note text,
  next_due_date date,
  access_mode text NOT NULL DEFAULT 'password' CHECK (access_mode IN ('public', 'password')),
  access_password_hash text,
  budget_type text NOT NULL DEFAULT 'none' CHECK (budget_type IN ('none', 'hourly')),
  budget_hours_cap numeric,
  hourly_rate numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- No RLS — no client accounts to scope rows to. Access is mediated entirely by
-- server-side route handlers: /admin's Supabase Auth check, or the per-project
-- password cookie enforced in app/projects/[slug]/page.tsx.

CREATE TABLE project_milestones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'done')),
  target_date date,
  completed_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tables for Sessions 47–48 — created now so the schema lands in one migration;
-- no UI reads/writes them yet.
CREATE TABLE project_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  uploaded_by text NOT NULL DEFAULT 'client' CHECK (uploaded_by IN ('client', 'drew')),
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE project_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES project_milestones(id) ON DELETE SET NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'resolved')),
  created_at timestamptz DEFAULT now()
);

-- Links build-cost telemetry to a real project. Not backfilled or populated yet
-- (Session 49) — ingest-build-cost still only writes project_slug for now.
ALTER TABLE build_cost_entries ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id);

-- MIGRATION: Session 47 — private storage bucket for project files
--
-- No storage.objects RLS policies: every read and write goes through the
-- service-role client via signed URLs (createSignedUploadUrl / createSignedUrl),
-- generated only after a route handler verifies admin auth or the project's
-- public/password access rule. Nothing touches the bucket directly from the browser.
insert into storage.buckets (id, name, public, file_size_limit)
values ('project-files', 'project-files', false, 26214400)
on conflict (id) do nothing;

-- MIGRATION: Session 48 — WST Orchestrator Phase 1 (control plane)
--
-- Four new tables backing the multi-repo orchestration system described in
-- ORCHESTRATOR_DESIGN.md. `framework_type` / `auth_convention` on `repos` replace the
-- single `stack_type` field from the design doc's own draft schema — ORCHESTRATOR_DESIGN.md
-- §2 flags that a single enum wrongly conflates framework choice with auth convention
-- (three distinct auth conventions exist across the fleet), so this splits them. No RLS on
-- any of the four tables — service-role only, same convention as build_cost_entries. Access
-- is mediated by the /admin auth gate now, and will also be mediated by
-- WST_ORCHESTRATOR_SECRET once Phase 2 adds machine-to-machine routes.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS repos (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                        text NOT NULL,
  local_path                  text NOT NULL,
  github_owner                text NOT NULL,
  github_repo                 text NOT NULL,
  vercel_project_id           text,
  framework_type              text NOT NULL DEFAULT 'other',  -- 'nextjs' | 'vite' | 'other'
  auth_convention             text NOT NULL DEFAULT 'none',   -- 'supabase_auth' | 'shared_secret' | 'none' | 'other'
  client_project_id           uuid REFERENCES projects(id),
  automation_enabled          boolean NOT NULL DEFAULT false,
  planning_interval_hours     integer,
  last_planning_session_at    timestamptz,
  github_app_installation_id  bigint,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_sessions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id            uuid NOT NULL REFERENCES repos(id),
  session_type       text NOT NULL,               -- 'planning' | 'build'
  status             text NOT NULL DEFAULT 'open', -- 'open' | 'awaiting_review' | 'approved' | 'running' | 'awaiting_verification' | 'done' | 'failed'
  brief              text NOT NULL,
  build_prompt       text,
  pr_url             text,
  pr_preview_url     text,
  merged_commit_sha  text,
  github_run_id      bigint,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  completed_at       timestamptz
);

CREATE TABLE IF NOT EXISTS review_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        uuid NOT NULL REFERENCES agent_sessions(id),
  kind              text NOT NULL,                     -- 'consolidated_review' | 'production_risk_flag' | 'kb_entry_draft'
  summary           text NOT NULL,
  open_questions    jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{ question, suggested_options: [...], answer: null | text }]
  proposed_content  text,
  drew_response     text,
  status            text NOT NULL DEFAULT 'pending',    -- 'pending' | 'answered'
  created_at        timestamptz NOT NULL DEFAULT now(),
  answered_at       timestamptz
);

CREATE TABLE IF NOT EXISTS knowledge_base_entries (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL,
  problem_solved        text NOT NULL,
  tags                  text[] NOT NULL DEFAULT '{}',
  tech_stack            text[] NOT NULL DEFAULT '{}',
  artifact_description  text NOT NULL,
  artifact_location     text,
  source_repo_id        uuid REFERENCES repos(id),
  source_session_id     uuid REFERENCES agent_sessions(id),
  embedding             vector(1024),
  reuse_count           integer NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- Seed data: the 5 known fleet repos from ORCHESTRATOR_DESIGN.md §2. Safe to run once —
-- github_repo has no unique constraint, so running this INSERT a second time duplicates
-- every row rather than erroring. If repos already has 5 rows, skip straight to the test
-- data below instead of re-running this block.
-- github_owner assumed 'worldshifttech' for all 5 (confirmed explicitly in the doc for
-- forgotten-realms-dm and wst-build-manager only) — edit before running if any differ.
INSERT INTO repos (name, local_path, github_owner, github_repo, framework_type, auth_convention) VALUES
('worldshifttech-landing', 'C:\Users\drewg\worldshifttech-landing', 'worldshifttech', 'worldshifttech-landing', 'nextjs', 'supabase_auth'),
('entos-group-website', 'C:\Users\drewg\entos-group-website', 'worldshifttech', 'entos-group-website', 'vite', 'none'),
('drew-griffiths-speak-easy', 'C:\Users\drewg\drew-griffiths-speak-easy', 'worldshifttech', 'drew-griffiths-speak-easy', 'vite', 'shared_secret'),
('forgotten-realms-dm', 'C:\Users\drewg\Documents\forgotten-realms-dm', 'worldshifttech', 'forgotten-realms-dm', 'vite', 'supabase_auth'),
('wst-build-manager', 'C:\Users\drewg\wst-build-manager', 'worldshifttech', 'wst-build-manager', 'other', 'none');
-- entos-group-website is client work per the doc's fleet notes — client_project_id left
-- NULL here; link it to a real projects row via /admin/repos/[id] if one exists.

-- Optional test data: one review_items row per kind, so /admin/reviews can be confirmed
-- by hand before any real agent exists. Delete these three once Phase 2 produces real ones.
INSERT INTO agent_sessions (repo_id, session_type, status, brief)
VALUES (
  (SELECT id FROM repos WHERE github_repo = 'worldshifttech-landing' LIMIT 1),
  'planning', 'awaiting_review', 'Test session seeded for Phase 1 UI verification'
);

INSERT INTO review_items (session_id, kind, summary, open_questions, proposed_content, status)
VALUES (
  (SELECT id FROM agent_sessions WHERE brief = 'Test session seeded for Phase 1 UI verification' ORDER BY created_at DESC LIMIT 1),
  'consolidated_review',
  'Explored the repo, drafted a build prompt for the client feedback UI. One open question before finishing.',
  '[{"question": "Should client feedback be visible to Drew only, or also echoed back to the client as a confirmation?", "suggested_options": ["Drew only", "Echo back to client"], "answer": null}]'::jsonb,
  E'Read README.md and NOTES.md first, then read app/projects/[slug]/page.tsx before touching anything.\nSession 48 (example) — Client feedback UI',
  'pending'
);

INSERT INTO review_items (session_id, kind, summary, status)
VALUES (
  (SELECT id FROM agent_sessions WHERE brief = 'Test session seeded for Phase 1 UI verification' ORDER BY created_at DESC LIMIT 1),
  'production_risk_flag',
  'Flagged: this migration touches build_cost_entries, a table already in production use. Confirm the ALTER is additive-only before this session proceeds.',
  'pending'
);

INSERT INTO review_items (session_id, kind, summary, proposed_content, status)
VALUES (
  (SELECT id FROM agent_sessions WHERE brief = 'Test session seeded for Phase 1 UI verification' ORDER BY created_at DESC LIMIT 1),
  'kb_entry_draft',
  'Drafted a reusable pattern for the signed-URL upload flow used in Session 47.',
  E'Title: Two-step signed upload URL pattern\nProblem: browser uploads bypass Vercel function payload limits\nArtifact: lib/project-files.ts + app/api/project-files/upload-url/route.ts',
  'pending'
);

-- ============================================================
-- MIGRATION: repos.target_supabase_url / target_supabase_service_role_key (Session 51)
-- Lets the control plane read/resolve a target repo's own feedback backlog directly.
-- The key column is write-only from the app's side (see lib/feedback-adapters.ts,
-- app/api/admin-repos/[id]/target-credentials/route.ts) — no route ever returns it, only
-- a derived boolean. Same no-RLS/service-role-only convention as every other column on
-- this table; this is the first one that holds a raw credential for a different live
-- system rather than this project's own metadata. See NOTES.md Session 51.
-- ============================================================
ALTER TABLE repos ADD COLUMN IF NOT EXISTS target_supabase_url text;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS target_supabase_service_role_key text;

-- ============================================================
-- MIGRATION: orchestrator_settings (Session 52 — WST Orchestrator Phase 4, scheduler)
-- Singleton table — always exactly one row. Holds the global automation kill switch,
-- checked by /api/orchestrator/scheduler-tick before every cron tick, independent of
-- each repo's own automation_enabled (the per-repo pause). No RLS, service-role only,
-- same convention as every other table here. See NOTES.md Session 52.
-- ============================================================
CREATE TABLE IF NOT EXISTS orchestrator_settings (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_paused  boolean NOT NULL DEFAULT false,
  updated_at         timestamptz NOT NULL DEFAULT now()
);

INSERT INTO orchestrator_settings (automation_paused)
SELECT false
WHERE NOT EXISTS (SELECT 1 FROM orchestrator_settings);

-- ============================================================
-- MIGRATION: repos deployment-drift columns (Session 54 — WST Orchestrator Phase 6)
-- Populated by /api/orchestrator/drift-check, on its own cron separate from
-- scheduler-tick (checking deployment status is a different concern from dispatching
-- sessions). "Is drifted" is computed as deployed_sha !== github_head_sha at read time,
-- not stored as its own redundant boolean. See NOTES.md Session 54.
-- ============================================================
ALTER TABLE repos ADD COLUMN IF NOT EXISTS deployed_sha text;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS github_head_sha text;
ALTER TABLE repos ADD COLUMN IF NOT EXISTS drift_checked_at timestamptz;

-- ============================================================
-- MIGRATION: unified knowledge_base_entries (Session 55 — WST Orchestrator Phase 3 +
-- Audit Knowledge Base consolidation)
-- Folds the previously-disconnected audit reference library (content/audit-knowledge/*.md,
-- read straight off disk by /admin/audit-knowledge, plus the old `audit_knowledge` table
-- which had zero callers anywhere in the app) into the same table Phase 3 already needed
-- for build-session reusable artifacts. One browsable, embedded knowledge base instead of
-- two unrelated systems — see NOTES.md Session 55 for the full reasoning.
-- `category` distinguishes the two shapes sharing this table. problem_solved and
-- artifact_description are relaxed from NOT NULL since audit_reference rows don't set
-- them — they use tool_slug/reference_doc instead, which build_artifact rows leave null.
-- ============================================================
ALTER TABLE knowledge_base_entries ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'build_artifact';
ALTER TABLE knowledge_base_entries ADD COLUMN IF NOT EXISTS tool_slug text;
ALTER TABLE knowledge_base_entries ADD COLUMN IF NOT EXISTS reference_doc text;
ALTER TABLE knowledge_base_entries ALTER COLUMN problem_solved DROP NOT NULL;
ALTER TABLE knowledge_base_entries ALTER COLUMN artifact_description DROP NOT NULL;

-- review_items.kb_draft holds the structured fields a kb_entry_draft review needs
-- (title/problem_solved/tags/tech_stack/artifact_location) ahead of Drew's Approve
-- promoting them into a real knowledge_base_entries row. proposed_content continues to
-- carry the long-form description, per its own original schema comment ("e.g. the build
-- prompt, or a drafted KB entry").
ALTER TABLE review_items ADD COLUMN IF NOT EXISTS kb_draft jsonb;

-- Cosine-similarity search across both categories at once — a planning session's brief
-- benefits from relevant audit reference knowledge just as much as a past build artifact.
-- Standard Supabase pgvector RPC pattern: supabase-js passes query_embedding as a plain
-- JS number array, which PostgREST casts to `vector` on the way in.
CREATE OR REPLACE FUNCTION match_knowledge_base_entries(
  query_embedding vector(1024),
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  category text,
  title text,
  problem_solved text,
  tags text[],
  tech_stack text[],
  artifact_description text,
  artifact_location text,
  reference_doc text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT id, category, title, problem_solved, tags, tech_stack, artifact_description,
         artifact_location, reference_doc, 1 - (embedding <=> query_embedding) AS similarity
  FROM knowledge_base_entries
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Bumps reuse_count for every entry surfaced into a planning session's context — "was
-- offered to an agent" is the usage signal, not "a human later confirmed it was used".
CREATE OR REPLACE FUNCTION increment_kb_reuse_count(entry_ids uuid[])
RETURNS void
LANGUAGE sql
AS $$
  UPDATE knowledge_base_entries SET reuse_count = reuse_count + 1 WHERE id = ANY(entry_ids);
$$;

-- ============================================================
-- MIGRATION: milestone ownership + milestone-scoped files (Session 60 — client
-- feedback backend). Lets a milestone mark itself as needing something from the
-- client (a text answer or a file upload) rather than being purely a status
-- tracker. project_feedback already had milestone_id (ON DELETE SET NULL) from
-- the Session 46/48 schema — unchanged here. See NOTES.md Session 60.
-- ============================================================
ALTER TABLE project_milestones ADD COLUMN IF NOT EXISTS action_owner text NOT NULL DEFAULT 'drew' CHECK (action_owner IN ('drew', 'client'));
ALTER TABLE project_milestones ADD COLUMN IF NOT EXISTS action_note text;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS milestone_id uuid REFERENCES project_milestones(id) ON DELETE SET NULL;

-- ============================================================
-- MIGRATION: session_drafts (Session 63)
-- Real feature, replacing Session 62's stopgap (a hardcoded default value in
-- RepoDetailClient.tsx's planningBrief state) — Drew wants a durable "ticket in the app"
-- for a not-yet-dispatched planning or build brief, save it now, load and run it later.
-- Deliberately not a new column on agent_sessions: a draft has never been dispatched and
-- has no status lifecycle beyond existing/deleted, a genuinely different shape from a
-- real session (no github_run_id, no status transitions, no result to report). No RLS,
-- service-role only, same convention as every other table here.
-- ============================================================
CREATE TABLE IF NOT EXISTS session_drafts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id       uuid NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  session_type  text NOT NULL,               -- 'planning' | 'build'
  title         text NOT NULL,
  brief         text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Seed: promotes Session 62's hardcoded default into a real draft. Safe to run once —
-- no unique constraint to conflict on, so re-running this INSERT duplicates the row.
INSERT INTO session_drafts (repo_id, session_type, title, brief)
SELECT id, 'planning', 'Admin nav cohesion audit',
  'The admin dashboard''s navigation feels disjointed, not cohesive or friendly. Audit navigation across /admin (dashboard home), /admin/repos (fleet list), /admin/repos/[id] (repo detail -- Settings/Reviews tabs), /admin/reviews (global inbox), /admin/knowledge-base, and /admin/projects/[id] (client project detail). Look at: is there a consistent top nav/header across all of these, or does each page reinvent its own? Is there any breadcrumb or clear way back up a level? Is it obvious which section of the app you''re in at a glance? How many clicks does it take to get from one related page to another (e.g. a repo''s own scoped reviews vs. the global reviews inbox vs. a linked client project)? Propose a more cohesive structure -- consistent header/nav across every admin page, clear active-state or breadcrumbs, fewer redundant clicks between related sections. This is a navigation/UX pass, not a rewrite of any page''s actual functionality -- don''t restructure data models or existing features, just how they''re navigated between.'
FROM repos WHERE github_repo = 'worldshifttech-landing';
