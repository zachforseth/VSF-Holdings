import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
    // USE SERVICE ROLE KEY
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const sql = `
-- 1. Ensure Messages Table Exists
create table if not exists public.messages (
  id uuid not null default gen_random_uuid(),
  profile_id uuid not null references public.tax_profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  primary key (id)
);

-- 2. Add Possibly Missing Columns (Crucial Fix)
alter table public.messages 
add column if not exists is_read boolean default false,
add column if not exists is_from_advisor boolean default false,
add column if not exists sender_id uuid references auth.users(id);

-- 3. Ensure RLS is Enabled
alter table public.messages enable row level security;

-- 4. Re-Apply Admin Policies
drop policy if exists "Admins can view all messages" on public.messages;
create policy "Admins can view all messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

drop policy if exists "Admins can insert messages" on public.messages;
create policy "Admins can insert messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- 5. Re-Apply User Policies (CRITICAL: Allows user to see admin messages)
drop policy if exists "Users can view messages for own profile" on public.messages;
create policy "Users can view messages for own profile"
  on public.messages for select
  using (
    exists (
      select 1 from public.tax_profiles
      where tax_profiles.id = messages.profile_id
      and tax_profiles.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert messages for own profile" on public.messages;
create policy "Users can insert messages for own profile"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.tax_profiles
      where tax_profiles.id = messages.profile_id
      and tax_profiles.user_id = auth.uid()
    )
  );

-- 6. Add Unread Flags to Tax Profiles (Fixes Admin Dashboard Crash)
alter table public.tax_profiles
add column if not exists has_unread_admin_message boolean default false,
add column if not exists has_unread_user_message boolean default false,
add column if not exists last_message_at timestamptz,
add column if not exists review_link text,
add column if not exists final_fee numeric,
add column if not exists detected_forms jsonb default '[]'::jsonb,
add column if not exists ai_confidence_score numeric,
add column if not exists requires_manual_review boolean default false;
`

    // We can't run raw SQL easily via JS client without an RPC function usually.
    // Return SQL for manual run.

    return NextResponse.json({
        message: "Migration likely missing. Run this SQL in Supabase SQL Editor:",
        sql: sql
    })
}
