-- Add missing_info column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'tax_profiles' and column_name = 'missing_info') then
    alter table public.tax_profiles add column missing_info jsonb;
  end if;
end
$$;
