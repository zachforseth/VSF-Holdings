require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const email = `zachforseth+test1@gmail.com`;
  console.log('Testing signup with', email);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'Password123!',
    email_confirm: false
  });
  console.log('Admin create User Error:', error);
  console.log('Data user id:', data?.user?.id);
}
test();
