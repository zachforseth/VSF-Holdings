require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const email = `zachforseth+test2@gmail.com`;
  console.log('Testing anon signup with', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
    options: {
      data: { full_name: 'Test Setup' }
    }
  });
  console.log('Error:', error);
  console.log('Data session:', data?.session ? 'ACTIVE' : 'NULL');
}
test();
