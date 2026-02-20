-- Add columns for AI Document Classifier results
ALTER TABLE public.tax_profiles
ADD COLUMN IF NOT EXISTS final_fee numeric,
ADD COLUMN IF NOT EXISTS detected_forms jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_confidence_score numeric,
ADD COLUMN IF NOT EXISTS requires_manual_review boolean DEFAULT false;

-- Add comment
COMMENT ON COLUMN public.tax_profiles.detected_forms IS 'Array of detected form types and confidence scores from Google Document AI';
