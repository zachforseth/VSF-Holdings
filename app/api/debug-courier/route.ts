import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    console.log("TEST ROUTE HIT");
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error("Missing Supabase Env Vars in debug-courier");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        const adminClient = createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } });

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
        console.error("DEBUG COURIER ERROR:", e);
        return NextResponse.json({ exception: e.message || "Internal Server Error" }, { status: 500 });
    }
}
