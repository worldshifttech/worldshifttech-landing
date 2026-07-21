# WST Practitioner Curriculum — Platform Build Spec
*Claude Chat plan → Claude Code execution*
*World Shift Technologies / Drew Griffiths — May 2026*

---

## What this builds

A curriculum learning platform living at `/admin/curriculum` inside the existing WST Next.js app. Internal only — gated to `drew@worldshifttech.com` via existing admin auth. The platform serves two modes:

- **Admin/author view** — Drew manages curriculum content, monitors learner progress, reviews assessment responses and practitioner statements
- **Learner view** — A practitioner works through domains, modules, and lessons in sequence; writes assessment responses; interacts with the Claude AI assistant per lesson

The curriculum content lives in Supabase as structured records. The markdown files are the seed source — they get parsed once into the database and then the app reads from Supabase from that point forward.

---

## Stack

Inherits all WST defaults. No deviations.

| Layer | Choice |
|---|---|
| Framework | Next.js App Router (existing app) |
| Styling | Tailwind CSS + CSS variables (existing) |
| Database | Supabase — same project (`epamlfyuzquekpldfkhk`) |
| AI | Anthropic Claude Sonnet (`claude-sonnet-4-20250514`) |
| Auth | Existing Supabase Auth — gated to drew@worldshifttech.com for admin; separate learner access TBD (Phase 2) |

---

## Database Schema

Six new tables. All migrations additive — nothing touches existing tables.

```sql
-- DOMAINS
CREATE TABLE curriculum_domains (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  number integer NOT NULL UNIQUE,          -- 1–6
  title text NOT NULL,                     -- "Foundations: The State of Work in 2026"
  subtitle text,                           -- short descriptor
  overview_text text NOT NULL,             -- full domain overview prose (from Domain md files)
  estimated_hours text,                    -- "4–6 hours"
  prerequisites text,                      -- "None" or "Domains 1–5"
  practitioner_note text,                  -- closing practitioner note from each domain
  created_at timestamptz DEFAULT now()
);

-- MODULES
CREATE TABLE curriculum_modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id uuid REFERENCES curriculum_domains(id) ON DELETE CASCADE,
  domain_number integer NOT NULL,          -- denormalized for easy sorting
  module_number text NOT NULL,             -- "1A", "2C", "6D"
  title text NOT NULL,
  estimated_time text,                     -- "2.5 hours"
  learning_objectives jsonb DEFAULT '[]',  -- array of strings
  key_sources jsonb DEFAULT '[]',          -- array of strings
  connections jsonb DEFAULT '{}',          -- { before, after, feeds }
  created_at timestamptz DEFAULT now(),
  UNIQUE(domain_id, module_number)
);

-- LESSONS
CREATE TABLE curriculum_lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid REFERENCES curriculum_modules(id) ON DELETE CASCADE,
  module_number text NOT NULL,             -- denormalized
  lesson_number text NOT NULL,             -- "6A-1", "6B-3"
  title text NOT NULL,
  estimated_time text,                     -- "35 minutes"
  teaching_method text,                    -- "Reading", "Case analysis", "Simulation", "Reflection"
  core_content text NOT NULL,              -- full lesson prose
  reflection_prompt text,                  -- the discussion/reflection prompt
  ai_prompt_suggestions jsonb DEFAULT '[]',-- array of suggested Claude prompts
  key_takeaway text,                       -- one sentence
  sort_order integer NOT NULL,             -- for ordering within module
  created_at timestamptz DEFAULT now(),
  UNIQUE(module_id, lesson_number)
);

-- ASSESSMENTS
CREATE TABLE curriculum_assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid REFERENCES curriculum_modules(id) ON DELETE CASCADE,
  module_number text NOT NULL,             -- denormalized
  assessment_type text NOT NULL,           -- "reflection", "simulation", "case_analysis", "statement"
  prompt text NOT NULL,                    -- the full assessment prompt
  what_it_measures text,
  is_capstone boolean DEFAULT false,       -- true for Domain 6 practitioner statement
  created_at timestamptz DEFAULT now()
);

-- LEARNER PROGRESS
CREATE TABLE curriculum_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES curriculum_lessons(id) ON DELETE CASCADE,
  status text DEFAULT 'not_started',       -- not_started | in_progress | complete
  started_at timestamptz,
  completed_at timestamptz,
  UNIQUE(user_id, lesson_id)
);

-- LEARNER ASSESSMENT RESPONSES
CREATE TABLE curriculum_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id uuid REFERENCES curriculum_assessments(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  reviewer_note text,                      -- Drew's written feedback (admin only)
  reviewed_at timestamptz,
  UNIQUE(user_id, assessment_id)           -- one response per assessment per learner
);
```

### RLS Policies

```sql
-- Curriculum content: readable by all authenticated users
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

-- Progress: users own their own rows
ALTER TABLE curriculum_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress"
  ON curriculum_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress"
  ON curriculum_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress"
  ON curriculum_progress FOR UPDATE USING (auth.uid() = user_id);

-- Responses: users own their own rows
ALTER TABLE curriculum_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own responses"
  ON curriculum_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own responses"
  ON curriculum_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own responses"
  ON curriculum_responses FOR UPDATE USING (auth.uid() = user_id);
```

---

## Seed Script

A one-time Node.js script that parses the curriculum markdown files and inserts structured records into the database. Lives at `/scripts/seed-curriculum.ts`. Run once with `npx ts-node scripts/seed-curriculum.ts`.

The script reads from the flat markdown content below (hardcoded — no file parsing required since content is already written). It inserts domains 1–6, all modules, all lessons, and all assessments in sequence.

**The seed script does NOT live in the app route tree.** It is a standalone script run once from the terminal. After seeding, the markdown files are no longer needed by the app — Supabase is the source of truth.

---

## Route Structure

All routes nested under `/admin/curriculum`. Gated to `drew@worldshifttech.com` via existing admin auth check.

```
/admin/curriculum                          — Curriculum home: domain list + overall progress (admin view)
/admin/curriculum/[domainNumber]           — Domain overview + module list
/admin/curriculum/[domainNumber]/[moduleNumber]        — Module overview + lesson list
/admin/curriculum/[domainNumber]/[moduleNumber]/[lessonNumber]  — Lesson view + AI assistant
/admin/curriculum/[domainNumber]/[moduleNumber]/assessment      — Assessment submission
/admin/curriculum/responses                — Admin: all submitted responses across all learners
/admin/curriculum/responses/[responseId]   — Admin: individual response + add reviewer note
```

**Phase 1:** Drew is the only learner. Auth check = existing admin gate. Phase 2 (adding other practitioners) will add a separate learner role — out of scope for now.

---

## Page Specifications

### `/admin/curriculum` — Curriculum Home

**Server component.** Fetches all 6 domains + lesson count + completion count for current user.

Layout:
- Page header: "WST Practitioner Curriculum" + subtitle "Your proprietary consulting training system"
- Domain cards (6): domain number badge, title, estimated hours, lesson count, completion badge (X of Y lessons complete), progress bar, "Continue" or "Start" button
- Domains unlock sequentially — Domain N+1 locked until all lessons in Domain N are marked complete (except Domain 1 which is always open)
- Lock state: grayed card, lock icon, "Complete Domain N first"

---

### `/admin/curriculum/[domainNumber]` — Domain View

**Server component.** Fetches domain record + all modules for this domain + lesson completion counts.

Layout:
- Back link: "← Curriculum"
- Domain number badge + title
- Estimated study time
- Overview text (rendered markdown prose — use a lightweight markdown renderer)
- Prerequisites note
- Module list: cards ordered by module_number. Each card: module code (e.g. "2C"), title, estimated time, lesson count, completion status, "Go →" link
- Practitioner note section at bottom (collapsible)

---

### `/admin/curriculum/[domainNumber]/[moduleNumber]` — Module View

**Server component.** Fetches module record + all lessons + assessment + completion status.

Layout:
- Breadcrumb: Curriculum → Domain N → Module
- Module code + title
- Estimated time + teaching methods
- Learning objectives (rendered as a clean numbered list — not bullet points)
- Lesson list: ordered cards. Each lesson: number, title, estimated time, method badge, completion checkmark if done, "→" link
- Assessment card at bottom: type, prompt preview, "Submit Response" or "View Your Response" button
- Key sources (collapsible)
- Connections block (before / after / feeds)

---

### `/admin/curriculum/[domainNumber]/[moduleNumber]/[lessonNumber]` — Lesson View

**The primary learning interface.** Mix of server and client components.

Layout (two-column on desktop, stacked on mobile):

**Left column — Lesson content (60% width)**
- Breadcrumb: Curriculum → Domain → Module → Lesson
- Lesson number + title
- Method badge + estimated time
- Core content (rendered markdown — full prose)
- Reflection prompt (visually distinct block — teal left border, slightly inset)
- Key takeaway (bold, bottom of content)
- "Mark Complete" button — fires PATCH to `/api/curriculum/progress`, marks lesson complete, enables next lesson
- Navigation: "← Previous Lesson" / "Next Lesson →"

**Right column — AI Assistant (40% width)**
- Panel header: "AI Assistant" with Claude icon
- Suggested prompts: rendered as clickable chips from `ai_prompt_suggestions` — clicking inserts into the chat input
- Chat interface: scrollable message history, text input, Send button
- System prompt baked in: tells Claude it is the WST curriculum assistant for this specific lesson, injects the lesson title and core_content summary as context
- Conversation is session-only — not persisted to database (Phase 1)
- Loading state: pulsing indicator while Claude responds

**AI Assistant API route: `/api/curriculum/chat`**
- POST: `{ lessonId, messages: [{role, content}] }`
- Fetches lesson record from Supabase (core_content, title, module context)
- Builds system prompt (see below)
- Calls Claude Sonnet with full message history
- Streams response back
- Secondary operation — never blocks lesson view render

**System prompt for curriculum AI assistant:**
```
You are the WST Practitioner Curriculum AI assistant. You are embedded in a proprietary consulting training program built by Drew Griffiths of World Shift Technologies.

The learner is currently working through:
Lesson: {lesson_number} — {lesson_title}
Module: {module_number} — {module_title}
Domain: {domain_number} — {domain_title}

Lesson summary: {core_content_first_500_chars}

Your role:
- Help the learner go deeper on the concepts in this lesson
- Support research, synthesis, and stress-testing of their reasoning
- Generate alternative framings and challenge assumptions when asked
- For simulation work (Domain 6): respond as a realistic engagement participant when the learner asks you to roleplay a scenario
- Never make the learner's decisions for them — you are augmenting their judgment, not replacing it
- Be direct, precise, and practitioner-facing — not academic

You have access to the WST methodology and all prior curriculum content in your training. Draw on it freely.
```

---

### `/admin/curriculum/[domainNumber]/[moduleNumber]/assessment` — Assessment View

**Client component** (form interaction).

Layout:
- Breadcrumb
- Assessment type badge
- Full assessment prompt (rendered, clearly readable)
- "What this measures" note (muted text below prompt)
- If response already submitted: show existing response in a read-only card + "Edit Response" toggle
- Textarea: large, minimum 200px height, auto-grows
- Word count display (live)
- Submit button: "Submit Response" → fires POST to `/api/curriculum/responses`
- On submit: success confirmation, link back to module

**Special case — Domain 6 practitioner statement (`is_capstone = true`):**
- Larger textarea with word count target displayed: "500–800 words"
- Note above form: "This statement is reviewed and reflected back. There is no passing grade."
- On submit: Slack notification fires to Drew with learner name + "Practitioner statement submitted" (reuses existing `/api/notify-slack` pattern)

---

### `/admin/curriculum/responses` — Admin Response Review

**Server component, Drew only.**

Layout:
- Page header: "Assessment Responses"
- Filter tabs: All | Pending Review | Reviewed | Practitioner Statements
- Table: learner email, module, assessment type, submitted date, review status, "Review →" link
- Pending review rows highlighted

---

### `/admin/curriculum/responses/[responseId]` — Individual Response Review

**Server component + client form for reviewer note.**

Layout:
- Learner info + assessment prompt (full)
- Response text (full, rendered)
- Reviewer note form: textarea + "Save Note" button → PATCH to `/api/curriculum/responses/[id]`
- Saved note displayed below response on next load

---

## API Routes

```
POST  /api/curriculum/chat              — AI assistant chat (streams Claude response)
POST  /api/curriculum/progress          — Mark lesson complete (upsert curriculum_progress)
POST  /api/curriculum/responses         — Submit assessment response (insert curriculum_responses)
PATCH /api/curriculum/responses/[id]    — Add reviewer note (Drew only)
```

All routes use existing `getSupabase()` (service role) for writes, existing auth patterns for user verification.

---

## File Structure (additions to existing app)

```
/app
  /admin
    /curriculum
      /page.tsx                          — Curriculum home
      /[domainNumber]
        /page.tsx                        — Domain view
        /[moduleNumber]
          /page.tsx                      — Module view
          /[lessonNumber]
            /page.tsx                    — Lesson view (server shell)
            /LessonClient.tsx            — Two-column layout + AI assistant (client)
            /AiAssistant.tsx             — Chat panel component (client)
          /assessment
            /page.tsx                    — Assessment view
      /responses
        /page.tsx                        — Response list (admin)
        /[responseId]
          /page.tsx                      — Individual response review
  /api
    /curriculum
      /chat/route.ts                     — Claude streaming endpoint
      /progress/route.ts                 — Mark lesson complete
      /responses/route.ts                — Submit + review responses
/scripts
  /seed-curriculum.ts                    — One-time DB seed script
/lib
  /curriculum.ts                         — Supabase query helpers for curriculum tables
```

---

## Build Sequence for Claude Code

Execute in this order. Deploy and verify after each session before starting the next.

### Session 1 — Schema + Seed
1. Run migrations: create all 6 curriculum tables + RLS policies in Supabase
2. Write `/scripts/seed-curriculum.ts` — hardcoded content for all 6 domains, modules, lessons, assessments
3. Run seed script, verify all records in Supabase table editor
4. Write `/lib/curriculum.ts` — query helpers: `getDomains()`, `getModules(domainNumber)`, `getLessons(moduleNumber)`, `getLesson(lessonNumber)`, `getAssessment(moduleNumber)`

**Verify:** All tables populated. Query helpers return expected data.

### Session 2 — Curriculum Home + Domain View
1. Build `/admin/curriculum/page.tsx` — domain cards, sequential unlock logic, progress bars
2. Build `/admin/curriculum/[domainNumber]/page.tsx` — domain overview, module list
3. Wire progress fetch: query `curriculum_progress` for current user, compute completion per domain/module

**Verify:** Navigate to `/admin/curriculum`. All 6 domain cards render. Domain 1 open, rest locked. Click Domain 1 → domain view renders with module list.

### Session 3 — Module View + Lesson View (content only, no AI)
1. Build `/admin/curriculum/[domainNumber]/[moduleNumber]/page.tsx`
2. Build lesson view server shell + `LessonClient.tsx` — two-column layout, core content rendered, reflection prompt block, key takeaway, Mark Complete button
3. Wire "Mark Complete" → POST `/api/curriculum/progress` → lesson marked complete → next lesson unlocks
4. Wire previous/next lesson navigation

**Verify:** Open a lesson. Content renders. Mark complete. Next lesson unlocks. Breadcrumb navigation works.

### Session 4 — AI Assistant
1. Build `/api/curriculum/chat/route.ts` — streaming Claude Sonnet response with lesson context in system prompt
2. Build `AiAssistant.tsx` — suggested prompt chips, chat interface, streaming display
3. Wire into lesson view right column

**Verify:** Open a lesson. Click a suggested prompt chip → populates input. Send → Claude responds with lesson-relevant content. Streaming works.

### Session 5 — Assessment Flow
1. Build `/admin/curriculum/[domainNumber]/[moduleNumber]/assessment/page.tsx`
2. Build POST `/api/curriculum/responses/route.ts`
3. Wire Domain 6 practitioner statement Slack notification
4. Build `/admin/curriculum/responses/page.tsx` (admin list)
5. Build `/admin/curriculum/responses/[responseId]/page.tsx` (admin review + note)
6. Build PATCH `/api/curriculum/responses/[id]` for reviewer notes

**Verify:** Submit an assessment response. Appears in admin responses list. Add reviewer note. Note saves and displays.

---

## Claude Code Prompt — Session 1

Use this exact prompt to start Session 1 in Claude Code:

---

*Read WST_BUILD_STANDARDS.md and README.md before touching any files.*

*We are building the WST Practitioner Curriculum platform inside the existing Next.js app at worldshifttech.com. This is a new section living at `/admin/curriculum`. It is internal only — no public-facing routes.*

*Session 1 goal: database schema + seed script. Two tasks only. Do not build any UI.*

*Task 1 — Database migrations*

*In Supabase, create these six tables. Run them as migrations against the existing project (`epamlfyuzquekpldfkhk`). Do not touch any existing tables.*

*Tables: `curriculum_domains`, `curriculum_modules`, `curriculum_lessons`, `curriculum_assessments`, `curriculum_progress`, `curriculum_responses`.*

*Schema for each table is defined in WST_Curriculum_Platform_Build_Spec.md — read it before writing any SQL. Apply all RLS policies as specified.*

*Task 2 — Seed script*

*Write `/scripts/seed-curriculum.ts`. This is a standalone Node.js script, not an app route. It uses the Supabase service role key to insert all curriculum content. It does not read markdown files — the content is hardcoded directly in the script.*

*Seed this content in order:*
*- 6 domains (numbers 1–6, titles and overview text from the domain overview markdown files in project knowledge)*
*- Modules for each domain (module_number, title, estimated_time, learning_objectives, key_sources, connections — from WST_Curriculum_Module_Outlines.md)*
*- Lessons for each module (lesson_number, title, estimated_time, teaching_method, core_content, reflection_prompt, ai_prompt_suggestions, key_takeaway — from the domain lesson content files)*
*- One assessment per module (from module outlines — assessment type, prompt, what_it_measures; mark Domain 6 practitioner statement as is_capstone = true)*

*The script should: (1) wipe existing curriculum table rows before inserting (for safe re-runs), (2) insert in correct foreign key order (domains → modules → lessons → assessments), (3) log progress to console as it inserts each domain.*

*Task 3 — Query helpers*

*Write `/lib/curriculum.ts` with these functions using `getSupabase()` (service role):*
*- `getDomains()` — all domains ordered by number*
*- `getModulesByDomain(domainNumber: number)` — modules for a domain ordered by module_number*
*- `getLessonsByModule(moduleNumber: string)` — lessons ordered by sort_order*
*- `getLesson(lessonNumber: string)` — single lesson with module + domain joined*
*- `getAssessmentByModule(moduleNumber: string)` — single assessment*
*- `getUserProgress(userId: string)` — all curriculum_progress rows for a user*

*Do not build any pages or API routes in this session. Schema, seed, and helpers only. Deploy after the migrations are applied and verify the seed script runs without errors.*

*Do not touch any existing files outside of `/scripts/` and `/lib/curriculum.ts`.*

---

## Content Notes for Seed Script

The seed script will pull content from the following project knowledge files. Claude Code should read these files at the start of Session 1 to construct the hardcoded content:

- `WST_Curriculum_Domain1_Foundations.md` through `WST_Curriculum_Domain6_Ethics.md` — domain overviews, practitioner notes
- `WST_Curriculum_Module_Outlines.md` — all module metadata (learning objectives, sources, connections, assessment prompts)
- `WST_Curriculum_Domain6_Lessons.md` (just output this session) — Domain 6 full lesson content
- Domain 1–5 lesson content files (to be written in future sessions before those sessions are seeded)

**Note on lesson content for Domains 1–5:** The full lesson body content (core_content, reflection_prompt, ai_prompt_suggestions, key_takeaway) for Domains 1–5 has not yet been written at this level of detail — the domain files contain domain overviews and module structures, not lesson body prose. Options:

1. **Seed Domain 6 first** (lesson content complete), seed Domains 1–5 with placeholder core_content pulled from module outline descriptions, then fill in full lesson content in a future content-writing session before the platform goes live
2. **Write full lesson content for all domains first**, then seed everything at once

Recommendation: option 1. Seed the schema and Domain 6 now so the platform can be built and tested end-to-end. Fill Domains 1–5 lesson body content in a parallel content session.

---

## What Is Not In Scope (Phase 1)

- Multi-learner access (other practitioners) — Phase 2
- Learner accounts separate from Drew's admin account — Phase 2
- AI assistant conversation persistence — Phase 2
- Mobile optimization — Phase 2 (admin-only tool for now)
- Email notifications to learners on reviewer feedback — Phase 2
- Certificate or completion badge generation — Phase 2

---

*WST Curriculum Platform Build Spec*
*World Shift Technologies / Drew Griffiths — May 2026*
*Cross-reference: WST_App_Project.md · WST_BUILD_STANDARDS.md · WST_Curriculum_Session_Handoff.md*
