import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('tax_profiles').select('id, filing_year, first_name, filing_status').order('created_at', { ascending: false }).limit(5);
  console.log('DATA:', JSON.stringify(data, null, 2));
  console.log('ERROR:', error);
}
check();
