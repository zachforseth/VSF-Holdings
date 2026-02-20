import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPaidProfiles() {
    const { data: profiles, error } = await supabase
        .from('tax_profiles')
        .select('id, user_id, first_name, last_name, filing_status, payment_id')
        .order('created_at', { ascending: false })
        .limit(20)

    console.log('Recent Profiles:', profiles, error);

    const { data: paidButUnpaidStatus, error: error2 } = await supabase
        .from('tax_profiles')
        .select('id, first_name, last_name, filing_status, payment_id')
        .not('payment_id', 'is', null)

    console.log('Profiles with Payment ID:', paidButUnpaidStatus, error2);
}

checkPaidProfiles();
