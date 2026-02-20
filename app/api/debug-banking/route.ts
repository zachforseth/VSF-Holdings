import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    // USE SERVICE KEY TO BYPASS RLS
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Check Profiles for void cheques
    const { data: profiles, error: profileError } = await supabase
        .from('tax_profiles')
        .select('id, void_cheque_path')
        .not('void_cheque_path', 'is', null)
        .limit(5)

    // 2. Fetch recent docs (any path)
    const { data: docs, error: dbError } = await supabase
        .from('tax_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

    if (dbError) return NextResponse.json({ dbError })

    const results = []

    // Check signed URL for found docs
    if (docs) {
        for (const doc of docs) {
            const { data, error } = await supabase.storage
                .from('tax-documents')
                .createSignedUrl(doc.file_path, 60)

            results.push({
                source: 'tax_documents',
                id: doc.id,
                file_name: doc.file_name,
                file_path: doc.file_path,
                file_type: doc.file_type || 'N/A',
                signed_url: data?.signedUrl
            })
        }
    }

    // Check signed URL for profile paths
    if (profiles) {
        for (const p of profiles) {
            const { data, error } = await supabase.storage
                .from('tax-documents')
                .createSignedUrl(p.void_cheque_path, 60)

            results.push({
                source: 'tax_profiles (void_cheque)',
                id: p.id,
                file_path: p.void_cheque_path,
                signed_url: data?.signedUrl
            })
        }
    }

    return NextResponse.json({ results })
}
