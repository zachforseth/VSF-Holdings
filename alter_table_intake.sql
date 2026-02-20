-- Add intake_responses column to tax_profiles table
ALTER TABLE tax_profiles
ADD COLUMN IF NOT EXISTS intake_responses JSONB DEFAULT '{}'::jsonb;
