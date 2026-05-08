-- World Shift Technologies — Supabase Schema
-- Run migrations manually in the Supabase SQL editor.
-- Each migration block is labeled. Run them in order.

-- ============================================================
-- MIGRATION: clients_table
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text,
  contact_name text,
  contact_email text,
  subscription_status text DEFAULT 'inactive',
  subscription_tier text,
  monthly_fee_cents integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on clients"
  ON clients FOR ALL
  USING (auth.jwt() ->> 'email' = 'drew@worldshifttech.com');

-- ============================================================
-- MIGRATION: ai_tools_registry
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_tools_registry (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_name text NOT NULL,
  vendor text,
  category text,
  pricing_model text,
  typical_monthly_cost_cents integer,
  uses_ai boolean DEFAULT false,
  ai_model_provider text,
  energy_transparency_rating text DEFAULT 'unknown',
  data_center_info text,
  environmental_notes text,
  harm_rating text DEFAULT 'unknown',
  help_rating text DEFAULT 'unknown',
  verified boolean DEFAULT false,
  last_verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_tools_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on ai_tools_registry"
  ON ai_tools_registry FOR ALL
  USING (auth.jwt() ->> 'email' = 'drew@worldshifttech.com');

CREATE POLICY "Public read on verified tools"
  ON ai_tools_registry FOR SELECT
  USING (verified = true);

-- ============================================================
-- MIGRATION: client_tool_usage
-- ============================================================
CREATE TABLE IF NOT EXISTS client_tool_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  tool_registry_id uuid REFERENCES ai_tools_registry(id) ON DELETE SET NULL,
  tool_name text NOT NULL,
  reporting_period_start date,
  reporting_period_end date,
  monthly_cost_cents integer DEFAULT 0,
  api_calls_count integer,
  active_users integer,
  hours_used numeric,
  is_active boolean DEFAULT true,
  waste_flag boolean DEFAULT false,
  waste_reason text,
  data_source text DEFAULT 'manual',
  raw_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_tool_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on client_tool_usage"
  ON client_tool_usage FOR ALL
  USING (auth.jwt() ->> 'email' = 'drew@worldshifttech.com');

-- ============================================================
-- MIGRATION: audit_estimates (Session 33)
-- ============================================================
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
