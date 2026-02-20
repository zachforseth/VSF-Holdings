-- Add role column to tax_profiles
alter table public.tax_profiles
add column if not exists role text default 'client';

-- Add check constraint to ensure only valid roles
alter table public.tax_profiles
add constraint tax_profiles_role_check check (role in ('admin', 'client'));

-- Update existing profiles to 'client' (should happen automatically with default, but good to be explicit for existing rows if default wasn't applied)
update public.tax_profiles set role = 'client' where role is null;
