'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function removeProfileFromCart(profileId: string) {
    const supabase = await createClient()

    // 1. Verify User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 2. Set status back to 'draft' (Removes from Cart)
    const { error } = await supabase
        .from('tax_profiles')
        .update({
            filing_status: 'draft',
            quoted_price: 0, // Reset price (optional, but cleaner)
            quoted_plan: null
        })
        .eq('id', profileId)
        .eq('user_id', user.id)

    if (error) throw new Error('Failed to remove profile')

    // 3. Refresh page
    revalidatePath('/filing/intake/review-group')
    revalidatePath('/dashboard')

    return { success: true }
}

export async function approveClientFiling(profileId: string) {
    const supabase = await createClient()

    // 1. Verify User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 2. Set status to APPROVED
    const { error } = await supabase
        .from('tax_profiles')
        .update({ filing_status: 'APPROVED' })
        .eq('id', profileId)
        .eq('user_id', user.id)

    if (error) throw new Error('Failed to approve profile')

    // 2.5 Log history
    await supabase.from('filing_history').insert({
        profile_id: profileId,
        action: 'CLIENT_APPROVED',
        message: 'Client reviewed and approved return for filing',
        created_by: user.id
    })

    // 3. Refresh page context
    revalidatePath('/dashboard/review')
    revalidatePath(`/dashboard/review/${profileId}`)
    revalidatePath('/dashboard')

    return { success: true }
}

export async function getClientFinalReturnUrl(profileId: string) {
    const supabase = await createClient()

    // 1. Verify User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 2. Fetch Profile final_return_path to verify ownership and get path
    const { data: profile } = await supabase
        .from('tax_profiles')
        .select('final_return_path')
        .eq('id', profileId)
        .eq('user_id', user.id)
        .single()

    if (!profile || !profile.final_return_path) return null

    // 3. Generate Signed URL using Admin Client to bypass Storage RLS
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await adminClient.storage
        .from('final-returns')
        .createSignedUrl(profile.final_return_path, 60 * 60) // 1 Hour

    if (error || !data) {
        console.error('Error generating signed URL for Final Return:', error)
        return null
    }

    return data.signedUrl
}

