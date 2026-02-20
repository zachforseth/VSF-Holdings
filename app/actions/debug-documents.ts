'use server'

import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function debugCheckDocuments(profileId: string) {
    console.log(`[DEBUG] Checking DB for profile: ${profileId}`);

    // 1. Check with Admin Client (Bypass RLS)
    const { data: adminDocs, error: adminError } = await adminClient
        .from('tax_documents')
        .select('*')
        .eq('profile_id', profileId)

    if (adminError) {
        console.error('[DEBUG] Admin Fetch Error:', adminError);
    } else {
        console.log(`[DEBUG] Admin Client found ${adminDocs?.length} docs`);
        if (adminDocs?.length > 0) {
            console.log('[DEBUG] Doc IDs:', adminDocs.map(d => d.id));
        }
    }

    return {
        adminCount: adminDocs?.length || 0,
        docs: adminDocs
    };
}
