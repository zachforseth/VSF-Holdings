'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBankingInfo(formData: FormData) {
    const supabase = await createClient()

    const profileId = formData.get('profileId') as string
    const method = formData.get('method') as string // 'manual' | 'upload' | 'cra_direct'

    // Manual Fields
    const bankName = formData.get('bankName') as string
    const transitNumber = formData.get('transitNumber') as string
    const institutionNumber = formData.get('institutionNumber') as string
    const accountNumber = formData.get('accountNumber') as string

    if (!profileId) return { success: false, message: 'Profile ID is required' }

    try {
        const updateData: any = {
            banking_confirmed_at: new Date().toISOString()
        }

        if (method === 'cra_direct') {
            // Clear banking fields, set a flag/status
            updateData.bank_name = 'CRA_DIRECT'
            updateData.transit_number = null
            updateData.institution_number = null
            updateData.account_number = null
        } else {
            // Manual fallthrough
            if (bankName) updateData.bank_name = bankName
            if (transitNumber) updateData.transit_number = transitNumber
            if (institutionNumber) updateData.institution_number = institutionNumber
            if (accountNumber) updateData.account_number = accountNumber
        }

        const { error } = await supabase
            .from('tax_profiles')
            .update(updateData)
            .eq('id', profileId)

        if (error) throw error

        revalidatePath('/settings/banking')
        return { success: true, message: 'Banking information updated successfully' }
    } catch (error) {
        console.error('Failed to update banking info:', error)
        return { success: false, message: 'Failed to update banking information' }
    }
}

export async function uploadVoidCheque(formData: FormData) {
    const supabase = await createClient()
    const profileId = formData.get('profileId') as string
    const file = formData.get('voidCheque') as File

    if (!profileId || !file) return { success: false, message: 'Missing file or profile ID' }

    try {
        const filePath = `banking/${profileId}/${Date.now()}-${file.name}`

        // 1. Upload to 'tax-documents' bucket
        const { error: uploadError } = await supabase.storage
            .from('tax-documents')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        // 2. Update tax_profiles with the path
        // We set 'bank_name' to 'VOID_CHEQUE_UPLOADED' to indicate the method, and try to save the path.
        // If void_cheque_path fails, at least bank_name is set.
        const { error: dbError } = await supabase
            .from('tax_profiles')
            .update({
                bank_name: 'VOID_CHEQUE_UPLOADED',
                void_cheque_path: filePath,
                banking_confirmed_at: new Date().toISOString(),
            })
            .eq('id', profileId)

        if (dbError) throw dbError

        revalidatePath('/settings/banking')
        return { success: true, message: 'Void cheque uploaded successfully' }

    } catch (error) {
        console.error('Upload failed:', error)
        return { success: false, message: 'Failed to upload void cheque' }
    }
}

export async function deleteProfile(profileId: string, voidChequePath?: string | null) {
    const supabase = await createClient()

    if (!profileId) return { success: false, message: 'Profile ID is required' }

    try {
        // 1. Delete physical file if exists
        if (voidChequePath) {
            const { error: storageError } = await supabase.storage
                .from('tax-documents')
                .remove([voidChequePath])

            if (storageError) {
                console.error('Failed to delete file from storage:', storageError)
            }
        }

        // 2. Delete database row
        const { error: dbError } = await supabase
            .from('tax_profiles')
            .delete()
            .eq('id', profileId)

        if (dbError) throw dbError

        revalidatePath('/dashboard')
        revalidatePath('/settings/banking')
        return { success: true, message: 'Profile deleted successfully' }

    } catch (error) {
        console.error('Delete profile failed:', error)
        return { success: false, message: 'Failed to delete profile' }
    }
}

export async function getVoidChequeUrl(path: string) {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase.storage
            .from('tax-documents')
            .createSignedUrl(path, 3600) // 1 hour expiry

        if (error) throw error

        return { success: true, url: data.signedUrl }
    } catch (error) {
        console.error('Error getting signed URL:', error)
        return { success: false, message: 'Could not retrieve document.' }
    }
}
