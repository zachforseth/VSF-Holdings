require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data: users, error: uErr } = await anonClient.from('users').select('*');
  console.log('Anon Users fetch:', users ? users.length : uErr);
  
  const { data: profiles, error: pErr } = await anonClient.from('tax_profiles').select('*');
  console.log('Anon Profiles fetch:', profiles ? profiles.length : pErr);
}
test();
