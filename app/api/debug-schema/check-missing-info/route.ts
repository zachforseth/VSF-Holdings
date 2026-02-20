import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ exists: false, error: "Missing Env Vars" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query to get columns of tax_profiles
    const { data, error } = await supabase
        .from('tax_profiles')
        .select('missing_info')
        .limit(1)

    if (error) {
        return NextResponse.json({
            exists: false,
            error: error
        })
    }

    return NextResponse.json({
        exists: true,
        data: data
    })
}
