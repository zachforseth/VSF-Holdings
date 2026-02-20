-- 1. Run this in your Supabase SQL Editor to fix the missing columns

ALTER TABLE courier_jobs 
ADD COLUMN IF NOT EXISTS package_tier text DEFAULT 'Standard',
ADD COLUMN IF NOT EXISTS coinbase_charge_id text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS stripe_payment_id text;

-- 2. Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courier_jobs';
