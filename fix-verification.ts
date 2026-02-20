import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const { data, error } = await supabase
    .from('tax_profiles')
    .update({ stripe_verification_status: 'verified' })
    .in('filing_status', ['FILED', 'paid', 'payment_pending', 'ready_to_pay', 'in_progress', 'review_pending', 'waiting_on_client'])
  
  console.log('Update result:', data, error);
}
fix();
