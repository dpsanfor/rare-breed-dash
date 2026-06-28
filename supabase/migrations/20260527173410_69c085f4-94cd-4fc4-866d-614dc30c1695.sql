
-- VOICE PROFILE
CREATE TABLE public.voice_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  self_descriptors JSONB DEFAULT '[]'::jsonb,
  writing_samples JSONB DEFAULT '[]'::jsonb,
  signature_words JSONB DEFAULT '[]'::jsonb,
  blacklist_words JSONB DEFAULT '[]'::jsonb,
  signoff TEXT,
  swearing_level TEXT DEFAULT 'pg-13',
  synthesized_voice_summary TEXT,
  edit_corrections JSONB DEFAULT '[]'::jsonb,
  last_synthesized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_profile TO anon, authenticated;
GRANT ALL ON public.voice_profile TO service_role;
ALTER TABLE public.voice_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open voice_profile" ON public.voice_profile FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- SEXY UNICORN OFFER
CREATE TABLE public.sexy_unicorn_offer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC,
  length TEXT,
  format TEXT,
  tagline TEXT,
  transformation TEXT,
  curriculum_overview TEXT,
  pricing_tiers JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sexy_unicorn_offer TO anon, authenticated;
GRANT ALL ON public.sexy_unicorn_offer TO service_role;
ALTER TABLE public.sexy_unicorn_offer ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open sexy_unicorn_offer" ON public.sexy_unicorn_offer FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- BRAND UNICORN
CREATE TABLE public.brand_unicorn (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  who_she_is TEXT,
  lights_her_up TEXT,
  biggest_challenges TEXT,
  what_she_tried TEXT,
  what_she_desires TEXT,
  unicorn_signal TEXT,
  last_refined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_unicorn TO anon, authenticated;
GRANT ALL ON public.brand_unicorn TO service_role;
ALTER TABLE public.brand_unicorn ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open brand_unicorn" ON public.brand_unicorn FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- RAINBOW ROAD (framework)
CREATE TABLE public.rainbow_road (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  steps JSONB DEFAULT '[]'::jsonb,
  bridge_gap TEXT,
  linked_sexy_unicorn_offer_id UUID REFERENCES public.sexy_unicorn_offer(id) ON DELETE SET NULL,
  usage_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rainbow_road TO anon, authenticated;
GRANT ALL ON public.rainbow_road TO service_role;
ALTER TABLE public.rainbow_road ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open rainbow_road" ON public.rainbow_road FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- MAGIC GUMDROP
CREATE TABLE public.magic_gumdrop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  tagline_10x TEXT,
  x_factor_statement TEXT,
  unique_mechanism TEXT,
  drool_factor TEXT,
  embodiment_notes TEXT,
  last_refined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.magic_gumdrop TO anon, authenticated;
GRANT ALL ON public.magic_gumdrop TO service_role;
ALTER TABLE public.magic_gumdrop ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open magic_gumdrop" ON public.magic_gumdrop FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- GUMDROP TRAIL
CREATE TABLE public.gumdrop_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Untitled trail',
  status TEXT NOT NULL DEFAULT 'draft',
  linked_sexy_unicorn_offer_id UUID REFERENCES public.sexy_unicorn_offer(id) ON DELETE SET NULL,
  trail_avatar JSONB,
  tagline TEXT,
  framework_id UUID REFERENCES public.rainbow_road(id) ON DELETE SET NULL,
  sales_page_copy TEXT,
  landing_page_copy TEXT,
  welcome_email_subject TEXT,
  welcome_email_body TEXT,
  launch_plan JSONB,
  offer_length TEXT,
  price NUMERIC,
  coach_notes_loved TEXT,
  coach_notes_misaligned TEXT,
  flavor_color TEXT DEFAULT 'fuchsia',
  launched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gumdrop_trail TO anon, authenticated;
GRANT ALL ON public.gumdrop_trail TO service_role;
ALTER TABLE public.gumdrop_trail ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open gumdrop_trail" ON public.gumdrop_trail FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- TRAIL PERFORMANCE
CREATE TABLE public.trail_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id UUID NOT NULL REFERENCES public.gumdrop_trail(id) ON DELETE CASCADE,
  signups INT DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  conversion_rate NUMERIC,
  engagement_metrics JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trail_performance TO anon, authenticated;
GRANT ALL ON public.trail_performance TO service_role;
ALTER TABLE public.trail_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open trail_performance" ON public.trail_performance FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- METAMORPHOSIS ENTRY
CREATE TABLE public.metamorphosis_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_text TEXT NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ai_reflection_prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.metamorphosis_entry TO anon, authenticated;
GRANT ALL ON public.metamorphosis_entry TO service_role;
ALTER TABLE public.metamorphosis_entry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open metamorphosis_entry" ON public.metamorphosis_entry FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
