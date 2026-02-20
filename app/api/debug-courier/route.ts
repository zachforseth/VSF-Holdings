import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    console.log("TEST ROUTE HIT");
    try {
        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { data: jobs, error } = await adminClient
            .from('courier_jobs')
            .select('*')
            .eq('payment_status', 'paid')
            .order('created_at', { ascending: false });

        const { error: missingColError } = await adminClient
            .from('courier_jobs')
            .select('*')
            .eq('delivery_status', 'pending');

        return NextResponse.json({
            missingColError
        });
    } catch (e: any) {
        return NextResponse.json({ exception: e.message });
    }
}
