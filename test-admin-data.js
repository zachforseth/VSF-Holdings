require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: users } = await supabase.from('users').select('*').neq('role', 'admin');
  const { data: profiles } = await supabase.from('tax_profiles').select('id, user_id, first_name');
  
  console.log('Users count:', users?.length);
  console.log('Profiles count:', profiles?.length);

  if (users && profiles) {
      console.log('--- USER MATCH TEST ---');
      users.forEach(user => {
          const userProfiles = profiles.filter(p => p.user_id === user.id);
          console.log(`User: ${user.email} (ID: ${user.id}) -> Profiles: ${userProfiles.length}`);
      });
  }
}
test();
