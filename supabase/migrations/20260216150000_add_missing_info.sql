-- Add missing_info column to tax_profiles
alter table public.tax_profiles
add column if not exists missing_info jsonb;
