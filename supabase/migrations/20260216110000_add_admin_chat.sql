-- 1. Create Messages Table
-- Simple structure for now, linking profile and sender (admin or user)
create table if not exists public.messages (
  id uuid not null default gen_random_uuid(),
  profile_id uuid not null references public.tax_profiles(id) on delete cascade,
  sender_id uuid references auth.users(id), -- Nullable if system message, but typically user or admin
  content text not null,
  is_read boolean default false,
  created_at timestamptz not null default now(),
  primary key (id)
);

-- Enable RLS
alter table public.messages enable row level security;

-- Policies for Messages
-- Admins can do anything (via service role or if we add admin role checks)
-- Users can read/insert their own profile's messages
create policy "Users can view messages for own profile"
  on public.messages for select
  using (
    exists (
      select 1 from public.tax_profiles
      where tax_profiles.id = messages.profile_id
      and tax_profiles.user_id = auth.uid()
    )
  );

create policy "Users can insert messages for own profile"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.tax_profiles
      where tax_profiles.id = messages.profile_id
      and tax_profiles.user_id = auth.uid()
    )
  );

-- 2. Add Notification Columns to Tax Profiles
alter table public.tax_profiles
add column if not exists has_unread_admin_message boolean default false,
add column if not exists has_unread_user_message boolean default false,
add column if not exists last_message_at timestamptz;

-- 3. Enable Realtime for messages
alter publication supabase_realtime add table public.messages;
