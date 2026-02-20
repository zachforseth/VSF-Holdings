-- Migration to add columns required for State-Sync Pricing Logic

-- 1. Add "quoted_plan" to tax_profiles
-- This stores the textual representation of the plan (e.g., "Pro Plan", "Essential Plan")
ALTER TABLE public.tax_profiles
ADD COLUMN IF NOT EXISTS quoted_plan text DEFAULT 'Essential Plan';

-- 2. Ensure other required columns exist (Result of AI Classifier)
-- Just in case previous migrations were skipped
ALTER TABLE public.tax_profiles
ADD COLUMN IF NOT EXISTS final_fee numeric DEFAULT 150,
ADD COLUMN IF NOT EXISTS detected_forms jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_confidence_score numeric,
ADD COLUMN IF NOT EXISTS requires_manual_review boolean DEFAULT false;

-- 3. Add comment for clarity
COMMENT ON COLUMN public.tax_profiles.quoted_plan IS 'The human-readable plan name determined by AI pricing logic (e.g., Pro Plan, Plus Plan)';
