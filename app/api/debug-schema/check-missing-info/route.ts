import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
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
