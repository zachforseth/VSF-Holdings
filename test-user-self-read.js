require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data: { session }, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'zachforseth@vsfholdings.com',
    password: 'Password123!' // I can't really log in without the password, but what if I check the DB RLS policy?
  });
}
check();
