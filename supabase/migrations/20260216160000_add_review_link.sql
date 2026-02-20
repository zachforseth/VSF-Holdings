-- Add review_link column to tax_profiles
alter table public.tax_profiles
add column if not exists review_link text;
