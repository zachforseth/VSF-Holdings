require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data: { session }, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'zachforseth@vsfholdings.com',
    password: 'Password123!' // trying a dummy password or maybe we can't test this easily without proper creds
  });
  
  // Actually, I can't sign in without the real password.
}
check();
