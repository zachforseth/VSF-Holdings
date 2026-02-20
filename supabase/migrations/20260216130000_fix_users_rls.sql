-- Enable RLS on public.users if not already enabled
alter table public.users enable row level security;

-- Policy: Users can read their own data
create policy "Users can read own data"
  on public.users for select
  using ( auth.uid() = id );

-- Policy: Service Role (Admin) can read all data
-- (Supabase Service Role bypasses RLS by default, but good to be explicit if needed, 
-- usually not needed for service_role key actions, but helpful for admin users 
-- if we used authenticated admin client)

-- Grant access to authenticated users
grant select on table public.users to authenticated;
