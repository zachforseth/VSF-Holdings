
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// Ideally use service role needed to bypass RLS if user policies aren't perfect yet
// But let's try anon first if policies are set. If not, failed.
// Actually, let's just print the SQL to run in dashboard since node script env vars might be tricky.

console.log(`
-- Run this SQL in Supabase Dashboard to check status:
SELECT 
    p.id, 
    p.first_name, 
    p.last_name, 
    p.has_unread_admin_message,
    u.email
FROM public.tax_profiles p
JOIN auth.users u ON p.user_id = u.id
ORDER BY p.created_at DESC;
`)
