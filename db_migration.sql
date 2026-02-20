-- Existing Columns
ALTER TABLE tax_profiles ADD COLUMN IF NOT EXISTS quoted_plan TEXT;
ALTER TABLE tax_profiles ADD COLUMN IF NOT EXISTS quoted_price NUMERIC;
ALTER TABLE tax_profiles ADD COLUMN IF NOT EXISTS filing_status TEXT DEFAULT 'draft'; -- draft, ready_to_pay, paid, filed

-- New Columns for Payment Success
ALTER TABLE tax_profiles ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE tax_profiles ADD COLUMN IF NOT EXISTS filing_year NUMERIC DEFAULT 2025;
