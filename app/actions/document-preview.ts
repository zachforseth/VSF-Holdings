'use server'

import { createClient } from '@/utils/supabase/server'

export async function getSignedUrl(filePath: string) {
    const supabase = await createClient()

    // 1. Verify Authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 2. Generate Signed URL (Valid for 60 seconds)
    const { data, error } = await supabase.storage
        .from('tax-documents')
        .createSignedUrl(filePath, 60)

    if (error) {
        console.error('Error creating signed URL:', error)
        return { success: false, error: 'Failed to generate preview' }
    }

    return { success: true, url: data.signedUrl }
}
