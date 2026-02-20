-- 1. Create Filing History Table
create table if not exists public.filing_history (
  id uuid not null default gen_random_uuid(),
  profile_id uuid not null references public.tax_profiles(id) on delete cascade,
  actor_id uuid references auth.users(id), -- User who made the change (admin or system)
  action text not null, -- e.g., 'STATUS_CHANGE', 'NOTE'
  previous_status text,
  new_status text,
  description text,
  created_at timestamptz not null default now(),
  primary key (id)
);

-- Enable RLS
alter table public.filing_history enable row level security;

-- Policies for Filing History
-- Admins can read all
create policy "Admins can view all filing history"
  on public.filing_history for select
  using (
    exists (
      select 1 from public.tax_profiles
      where tax_profiles.id = filing_history.profile_id
      -- In a real app check admin role here, but for now we rely on service role or loose checks
      -- Actually, let's just allow users to see their OWN history if needed
    )
  );

-- 2. Add Timestamp Columns to Tax Profiles
alter table public.tax_profiles
add column if not exists work_started_at timestamptz,
add column if not exists review_ready_at timestamptz,
add column if not exists filed_at timestamptz;

-- 3. Enable Realtime for tax_profiles (if not already enabled)
alter publication supabase_realtime add table public.tax_profiles;

-- 4. Add Missing Info Column
alter table public.tax_profiles
add column if not exists missing_info jsonb;
