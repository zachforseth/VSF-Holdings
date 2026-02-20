import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const { data, error } = await supabase.from('tax_profiles').update({ filing_year: 2024 }).eq('id', 'c6d41fde-cacb-4c4d-b3ff-18af94612b58');
  console.log('Update result:', data, error);
}
fix();
