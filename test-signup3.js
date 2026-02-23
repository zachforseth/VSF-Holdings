require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: users, error } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(5);
  console.log('Recent Users in DB:', users?.map(u => ({ email: u.email, created: u.created_at })));
  
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  console.log('Recent Auth Users:', authUsers?.users?.slice(0, 5).map(u => ({ email: u.email, created: u.created_at, confirmed: u.email_confirmed_at })));
}
test();
