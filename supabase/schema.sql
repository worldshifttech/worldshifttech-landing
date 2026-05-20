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
