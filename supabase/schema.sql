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
