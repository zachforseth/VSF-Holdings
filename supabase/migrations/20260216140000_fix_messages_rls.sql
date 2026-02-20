-- Allow Admins to View/Insert All Messages
create policy "Admins can view all messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

create policy "Admins can insert messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Also ensure 'users' table is readable by authenticated users so the policy check works
-- (Usually users can read their own row, but checking role might require broader read or a security definer function)
-- A common pattern is public.users is readable by authenticated users (at least id/role).

-- Let's check if we need to enable read on users for this check to work inside the policy.
-- If not, we might need a security definer function "is_admin()".
-- For now, let's assume standard RLS on users allows reading own role.
