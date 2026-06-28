-- LEAP TABLES: 10X Leap Workshop Operating System
-- Created: 2026-06-28

-- Installation progress — one row per step per installation
CREATE TABLE IF NOT EXISTS public.leap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id TEXT NOT NULL,
  step_key TEXT NOT NULL,
  response TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(installation_id, step_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leap_progress TO anon, authenticated;
GRANT ALL ON public.leap_progress TO service_role;
ALTER TABLE public.leap_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open leap_progress" ON public.leap_progress
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Decision Filter — saved filtered decisions
CREATE TABLE IF NOT EXISTS public.leap_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_text TEXT NOT NULL,
  q1_expands_vision TEXT,
  q2_requires_genius TEXT,
  q3_comfort_or_calling TEXT,
  q4_self_abandonment TEXT,
  q5_future_self TEXT,
  output TEXT NOT NULL DEFAULT 'pause',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leap_decisions TO anon, authenticated;
GRANT ALL ON public.leap_decisions TO service_role;
ALTER TABLE public.leap_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open leap_decisions" ON public.leap_decisions
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Weekly Audit — Friday operating system check-in
CREATE TABLE IF NOT EXISTS public.leap_weekly_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_date DATE NOT NULL DEFAULT CURRENT_DATE,
  alignment_score INT CHECK (alignment_score BETWEEN 1 AND 5),
  energy_score INT CHECK (energy_score BETWEEN 1 AND 5),
  calling_score INT CHECK (calling_score BETWEEN 1 AND 5),
  expansion_score INT CHECK (expansion_score BETWEEN 1 AND 5),
  self_abandonment_score INT CHECK (self_abandonment_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leap_weekly_audit TO anon, authenticated;
GRANT ALL ON public.leap_weekly_audit TO service_role;
ALTER TABLE public.leap_weekly_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open leap_weekly_audit" ON public.leap_weekly_audit
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- OS State — current version, expansion goal, recent wins
CREATE TABLE IF NOT EXISTS public.leap_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_version TEXT NOT NULL DEFAULT '1.0',
  expansion_goal TEXT,
  wins JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leap_os TO anon, authenticated;
GRANT ALL ON public.leap_os TO service_role;
ALTER TABLE public.leap_os ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open leap_os" ON public.leap_os
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
