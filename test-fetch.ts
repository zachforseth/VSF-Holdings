import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function test() {
    const { data: jobs, error } = await adminClient
        .from('courier_jobs')
        .select('*')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

    console.log("Error:", error);
    console.log("Jobs count:", jobs?.length);
    
    // Test without payment_status
    if (error) {
       console.log("Trying without payment_status filter...")
       const { error: error2 } = await adminClient.from('courier_jobs').select('*').limit(1);
       console.log("Error 2:", error2);
    }
}
test();
