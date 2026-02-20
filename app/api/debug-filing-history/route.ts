import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("Missing Supabase Env Vars in debug-filing-history");
            return Response.json({ error: "Missing Supabase Environment Variables" }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data, error } = await supabase
            .from('filing_history')
            .select('*')
            .limit(1)

        if (error) {
            return Response.json({ error })
        }

        // Check columns by inserting a dummy row and seeing if it fails or by inspecting implicit error
        // Actually, let's just try to insert a dummy row that mimics the admin action
        const { error: insertError } = await supabase.from('filing_history').insert({
            profile_id: '00000000-0000-0000-0000-000000000000', // invalid UUID intentionally to fail FK but prove table exists, or maybe valid one if we knew it
            action: 'TEST',
            new_status: 'TEST',
            admin_user_id: 'system'
        })

        return Response.json({
            selectResult: data,
            selectError: error,
            insertResult: insertError
        })
    } catch (e: any) {
        console.error("DEBUG FILING HISTORY ERROR:", e);
        return Response.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
