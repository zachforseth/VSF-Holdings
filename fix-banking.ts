import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    const { data: profiles, error } = await supabase.from('tax_profiles').select('*')
    if (!profiles) return;

    for (const prof of profiles) {
        if (prof.filing_status === 'CREATED' && (!prof.bank_name || !prof.void_cheque_path)) {
            // find their primary
            const primary = profiles.find(p => p.user_id === prof.user_id && p.bank_name && p.void_cheque_path);
            if (primary) {
                await supabase.from('tax_profiles').update({
                    bank_name: primary.bank_name,
                    void_cheque_path: primary.void_cheque_path,
                    banking_confirmed_at: primary.banking_confirmed_at
                }).eq('id', prof.id);
            }
        }
    }

    console.log('Fixed banking info for empty profiles');
}
fix();
