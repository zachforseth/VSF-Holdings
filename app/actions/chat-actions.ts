'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendClientMessage(profileId: string, content: string) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // 1. Insert Message
        const { error: msgError } = await supabase
            .from('messages')
            .insert({
                user_id: user.id,
                profile_id: profileId,
                content,
                is_from_advisor: false,
                is_read: false
            })

        if (msgError) throw msgError

        // 2. Update Profile Notification Flags (Perform as admin/service role if RLS blocks, 
        //    but user "owns" the profile so they should be able to update it via RLS 'update' policy)
        //    Wait, usually users can't update status, but updating a message flag might be needed.
        //    If RLS blocks update, we might need a separate secure action or admin client.
        //    Let's try standard client first. If it fails, we need admin client.
        //    Actually, for reliability, let's just use the same pattern as admin-actions if possible, 
        //    but we don't have admin client imported here. 
        //    The user RLS typically allows updating 'tax_profiles' if user_id matches.

        const { error: profileError } = await supabase
            .from('tax_profiles')
            .update({
                has_unread_user_message: true,
                last_message_at: new Date().toISOString()
            })
            .eq('id', profileId)
            .eq('user_id', user.id)

        if (profileError) throw profileError

        revalidatePath(`/dashboard/chat`)
        return { success: true }
    } catch (error) {
        console.error('Send Client Message Error:', error)
        return { success: false, error: 'Failed to send message' }
    }
}
