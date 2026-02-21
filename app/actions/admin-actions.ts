'use server'

import { createClient as createSupabaseJSClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'

function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error("Missing Supabase Admin Environment Variables");
    }

    return createSupabaseJSClient(
        supabaseUrl,
        supabaseServiceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}

export async function getAdminDashboardData(statusFilter?: string) {
    try {
        const adminClient = getAdminClient();

        // 1. Fetch all users from public.users table (excluding admins)
        const { data: users, error: usersError } = await adminClient
            .from('users')
            .select('*')
            .neq('role', 'admin')
            .order('created_at', { ascending: false })

        if (usersError) throw usersError

        // 2. Fetch all profiles
        const { data: profiles, error: profilesError } = await adminClient
            .from('tax_profiles')
            .select('id, user_id, first_name, last_name, filing_status, has_unread_user_message, missing_info, filing_year')

        if (profilesError) throw profilesError

        // 3. Calculate Global Stats
        const stats = {
            waiting: 0,
            inProgress: 0,
            inReview: 0,
            approved: 0,
            completed: 0,
            actionNeeded: 0,
            total: profiles?.length || 0
        }

        profiles?.forEach(p => {
            const s = (p.filing_status || '').toUpperCase()
            if (!s || s === 'PAID' || s === 'SUBMITTED' || s === 'READY_TO_PAY' || s === 'NOT_STARTED' || s === 'DRAFT') {
                stats.waiting++
            } else if (s === 'IN_PROGRESS' || s === 'ACTION_REQUIRED') {
                stats.inProgress++
            } else if (s === 'IN_REVIEW') {
                stats.inReview++
            } else if (s === 'APPROVED') {
                stats.approved++
            } else if (s === 'FILED') {
                stats.completed++
            }

            // Calculate Action Needed independently
            const isActive = s !== 'FILED' && s !== 'IN_REVIEW' && s !== 'PAID' && s !== 'APPROVED'

            if (isActive && (s === 'ACTION_REQUIRED' || (p.missing_info && Object.keys(p.missing_info).length > 0))) {
                stats.actionNeeded++
            }
        })

        // 4. Merge data and filter
        const dashboardUsers = users.map(user => {
            const userProfiles = profiles?.filter(p => p.user_id === user.id) || []

            return {
                id: user.id,
                email: user.email,
                last_sign_in_at: user.created_at,
                created_at: user.created_at,
                profile_count: userProfiles.length,
                hasUnread: userProfiles.some(p => p.has_unread_user_message),
                profiles: userProfiles
            }
        })

        let filteredProfiles: any[] = []
        if (statusFilter) {
            // Flatten profiles with user context
            filteredProfiles = profiles?.map(p => {
                const user = users.find(u => u.id === p.user_id)
                return {
                    ...p,
                    userEmail: user?.email || 'Unknown'
                }
            }).filter(p => {
                const s = (p.filing_status || '').toUpperCase();
                const filter = statusFilter.toUpperCase();

                if (filter === 'WAITING') {
                    return !s || s === 'PAID' || s === 'SUBMITTED' || s === 'READY_TO_PAY' || s === 'NOT_STARTED' || s === 'DRAFT';
                }
                if (filter === 'IN_PROGRESS') {
                    return s === 'IN_PROGRESS' || s === 'ACTION_REQUIRED';
                }
                if (filter === 'IN_REVIEW') {
                    return s === 'IN_REVIEW';
                }
                if (filter === 'APPROVED') {
                    return s === 'APPROVED';
                }
                if (filter === 'COMPLETED') {
                    return s === 'FILED';
                }
                if (filter === 'ACTION_NEEDED') {
                    const isActive = s !== 'FILED' && s !== 'IN_REVIEW' && s !== 'PAID';
                    return isActive && (s === 'ACTION_REQUIRED' || (p.missing_info && Object.keys(p.missing_info).length > 0));
                }
                return false;
            }) || []

            // Sort by status or date
            filteredProfiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }

        // 5. Identify "Action Needed" Profiles (Regardless of Filter)
        const actionNeededProfiles = profiles?.map(p => {
            const user = users.find(u => u.id === p.user_id)
            return {
                ...p,
                userEmail: user?.email || 'Unknown'
            }
        }).filter(p => {
            const s = (p.filing_status || '').toUpperCase()
            // Logic: ACTION_REQUIRED status OR Unread Message OR Missing Info
            // We want these to show up in the top section
            const isActive = s !== 'FILED' && s !== 'IN_REVIEW' && s !== 'PAID' && s !== 'APPROVED'
            return isActive && (s === 'ACTION_REQUIRED' || (p.missing_info && Object.keys(p.missing_info).length > 0))
        }) || []

        return {
            success: true,
            users: statusFilter ? [] : dashboardUsers,
            filteredProfiles,
            actionNeededProfiles,
            stats
        }

    } catch (error) {
        console.error('Admin Dashboard Data Fetch Error:', error)
        return { success: false, error: 'Failed to fetch admin data' }
    }
}

export async function getAdminUserDetails(userId: string) {
    try {
        const adminClient = getAdminClient();
        // 1. Fetch user by ID
        const { data: { user }, error: userError } = await adminClient.auth.admin.getUserById(userId)

        if (userError || !user) throw userError

        // 2. Fetch profiles for this user
        const { data: profiles, error: profilesError } = await adminClient
            .from('tax_profiles')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (profilesError) throw profilesError

        return { success: true, user, profiles }
    } catch (error) {
        console.error('Admin User Details Fetch Error:', error)
        return { success: false, error: 'Failed to fetch user details' }
    }
}

export async function getAdminProfileDetails(profileId: string) {
    try {
        const adminClient = getAdminClient();
        // 1. Fetch profile with intake responses and detected forms
        const { data: profile, error: profileError } = await adminClient
            .from('tax_profiles')
            .select('*')
            .eq('id', profileId)
            .single()

        if (profileError || !profile) throw profileError

        // 2. Fetch associated documents
        const { data: documents, error: docsError } = await adminClient
            .from('tax_documents')
            .select('*')
            .eq('profile_id', profileId)
            .order('created_at', { ascending: false })

        if (docsError) throw docsError

        // 3. Get User Email (for context)
        const { data: { user }, error: userError } = await adminClient.auth.admin.getUserById(profile.user_id)

        return {
            success: true,
            profile,
            documents,
            userEmail: user?.email
        }

    } catch (error) {
        console.error('Admin Profile Details Fetch Error:', error)
        return { success: false, error: 'Failed to fetch profile details' }
    }
}

import { revalidatePath } from 'next/cache'

export async function toggleProfileStatus(profileId: string, currentStatus: string) {
    try {
        const adminClient = getAdminClient();
        const newStatus = currentStatus === 'ACTION_REQUIRED' ? 'in_progress' : 'ACTION_REQUIRED'

        const { error } = await adminClient
            .from('tax_profiles')
            .update({ filing_status: newStatus })
            .eq('id', profileId)

        if (error) throw error

        revalidatePath(`/admin/filing/${profileId}`)
        revalidatePath(`/dashboard`)
        // We can't easily know the account_id here without an extra fetch, 
        // but the user dashboard is the critical one for the 'Action Required' banner.
        return { success: true, newStatus }
    } catch (error) {
        console.error('Toggle Status Error:', error)
        return { success: false, error: 'Failed to update status' }
    }
}

export async function updateReturnAmounts(profileId: string, refundAmount: number | null, balanceOwing: number | null) {
    try {
        const adminClient = getAdminClient();
        const { error } = await adminClient
            .from('tax_profiles')
            .update({
                refund_amount: refundAmount,
                balance_owing: balanceOwing
            })
            .eq('id', profileId)

        if (error) throw error

        revalidatePath(`/admin/filing/${profileId}`)
        revalidatePath('/dashboard/history')
        return { success: true }
    } catch (error) {
        console.error('Update Amounts Error:', error)
        return { success: false, error: 'Failed to update amounts' }
    }
}

export async function updateAdminNotes(profileId: string, notes: string) {
    try {
        const adminClient = getAdminClient();
        const { error } = await adminClient
            .from('tax_profiles')
            .update({ admin_notes: notes })
            .eq('id', profileId)

        if (error) throw error

        // We don't revalidate immediately because it autosaves on every keystroke pause.
        return { success: true }
    } catch (error) {
        console.error('Update Admin Notes Error:', error)
        return { success: false, error: 'Failed to update admin notes' }
    }
}

export async function updateFilingStatus(profileId: string, action: 'START_WORK' | 'REQUEST_INFO' | 'SEND_REVIEW' | 'FILE_RETURN' | 'RESOLVE_FLAG', missingInfo?: any, reviewLink?: string) {
    console.log('updateFilingStatus called with:', { profileId, action, missingInfo, reviewLink })
    try {
        const adminClient = getAdminClient();
        let status = ''
        const updates: any = {}
        const now = new Date().toISOString()

        // Map action to status
        switch (action) {
            case 'START_WORK':
                status = 'IN_PROGRESS'
                updates.filing_status = status
                updates.work_started_at = now
                // Clear old review link if starting over
                updates.review_link = null
                break
            case 'RESOLVE_FLAG':
                status = 'IN_PROGRESS'
                updates.filing_status = status
                // Explicitly clear missing info to remove from "Action Needed"
                updates.missing_info = null
                // Also clear unread message flag as resolving implies we've handled it
                updates.has_unread_user_message = false
                // Don't necessarily reset start time
                break
            case 'SEND_REVIEW':
                status = 'IN_REVIEW'
                updates.filing_status = status
                updates.review_ready_at = now
                if (reviewLink) {
                    updates.review_link = reviewLink
                }
                break
            case 'FILE_RETURN':
                status = 'FILED'
                updates.filing_status = status
                updates.filed_at = now
                break
            case 'REQUEST_INFO':
                // Automatically move to IN_PROGRESS so the client sees we've started looking at it.
                // We do NOT move to ACTION_REQUIRED anymore (the user's complaint).
                status = 'IN_PROGRESS'
                updates.filing_status = status
                // Clear old review link if we need more info
                updates.review_link = null
                break
        }

        // If status is changing to a working state, clear missing info
        if (status === 'IN_PROGRESS' || status === 'FILED') {
            updates.missing_info = null
        }

        // Always update missing info if provided (overwrites the clear above if both happen, which shouldn't)
        if (missingInfo) {
            updates.missing_info = missingInfo
        }

        // Log to history
        // For REQUEST_INFO, we use the action name but "new_status" might be irrelevant or we should fetch current?
        // Actually filing_history has "new_status". We can leave it null or set it to "ACTION_REQUIRED" just for the log?
        // User wants it in activity. Activity displays "new_status" or text?
        // Activity logic in dashboard: uses "action" or just text based on timestamp columns?
        // Wait, dashboard activity logic (lines 290+) shows: created, work_started, review, filed.
        // It DOES NOT currently show "Request Info" from the `filing_history` table. It infers from columns.
        // I need to update Dashboard to read from `filing_history` or add a column `last_request_at`?
        // The user said "I want the request information to appear in the activity".
        // The `filing_history` table is the right place. I should insert into it.
        // But the Dashboard needs to be updated to READ from `filing_history`.
        // For now, let's just make sure we insert into `filing_history` correctly.

        await adminClient.from('filing_history').insert({
            profile_id: profileId,
            action: action,
            new_status: status || 'UNCHANGED', // Fallback if we didn't change status
            actor_id: null
        })

        const { error } = await adminClient
            .from('tax_profiles')
            .update(updates)
            .eq('id', profileId)

        if (error) throw error

        revalidatePath(`/admin/filing/${profileId}`)
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error: any) {
        console.error('Update Status Error:', error)
        let errorMessage = 'Failed to update status'
        if (error instanceof Error) {
            errorMessage = error.message
        } else if (typeof error === 'object' && error !== null) {
            errorMessage = error.message || JSON.stringify(error)
        } else {
            errorMessage = String(error)
        }
        return { success: false, error: errorMessage }
    }
}

export async function getProfileMessages(profileId: string) {
    try {
        const adminClient = getAdminClient();
        const { data: messages, error } = await adminClient
            .from('messages')
            .select('*')
            .eq('profile_id', profileId)
            .order('created_at', { ascending: true })

        if (error) throw error

        return { success: true, messages }
    } catch (error) {
        console.error('Fetch Messages Error:', error)
        return { success: false, error: 'Failed to fetch messages' }
    }
}

export async function sendAdminMessage(profileId: string, content: string) {
    try {
        const adminClient = getAdminClient();
        // 1. Insert Message
        const { error } = await adminClient
            .from('messages')
            .insert({
                profile_id: profileId,
                is_from_advisor: true,
                content,
                is_read: false
            })

        if (error) throw error

        // 2. Update Profile Notification Flags
        await adminClient
            .from('tax_profiles')
            .update({
                has_unread_admin_message: true,
                last_message_at: new Date().toISOString(),
                // If we send a message, we often need info, so maybe set status? 
                // Let's keep status manual for now to avoid side effects.
            })
            .eq('id', profileId)

        revalidatePath(`/admin/filing/${profileId}`)
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Send Message Error:', error)
        return { success: false, error: 'Failed to send message' }
    }
}

export async function getDocumentUrl(userId: string, filePath: string) {
    try {
        const adminClient = getAdminClient();
        // In Admin actions, we can use the adminClient to get a signed URL for any file
        // The filePath is stored in 'tax-documents' bucket
        // Note: The bucket name might be different, let's assume 'tax-documents' based on previous context 
        // (It was used in upload-banking-actions.ts)

        const { data, error } = await adminClient
            .storage
            .from('tax-documents')
            .createSignedUrl(filePath, 60 * 60) // 1 Hour

        if (error) throw error

        return { success: true, url: data.signedUrl }

    } catch (error) {
        console.error('Get Document URL Error:', error)
        return { success: false, error: 'Failed to generate download URL' }
    }
}

export async function uploadFinalReturn(profileId: string, formData: FormData) {
    const file = formData.get('file') as File;
    if (!file || !profileId) return { success: false, error: 'Missing file or profile ID' };

    try {
        const adminClient = getAdminClient();
        const filePath = `${profileId}/FINAL-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Upload to 'final-returns' bucket using Admin Client to bypass RLS
        const { error: storageError } = await adminClient.storage
            .from('final-returns')
            .upload(filePath, file);

        if (storageError) {
            console.error('Storage Upload Error:', storageError);
            return { success: false, error: storageError.message };
        }

        // Update the tax_profile with the final_return_path
        const { error: dbError } = await adminClient
            .from('tax_profiles')
            .update({ final_return_path: filePath })
            .eq('id', profileId);

        if (dbError) {
            console.error('DB Update Error:', dbError);
            return { success: false, error: dbError.message };
        }

        revalidatePath(`/admin/filing/${profileId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Upload Final Return Error:', error);
        return { success: false, error: error.message };
    }
}

export async function adminUploadClientDocument(formData: FormData) {
    const profileId = formData.get('profileId') as string
    const files = formData.getAll('files') as File[]
    const skipAI = formData.get('skipAI') === 'true'

    if (!profileId || files.length === 0) return { success: false, error: 'No files provided' }

    try {
        const adminClient = getAdminClient();
        const cleanProfileId = profileId.substring(0, 36)

        // 1. Fetch Filing Year and Current Status
        const { data: profile } = await adminClient
            .from('tax_profiles')
            .select('filing_year, intake_responses, final_fee, quoted_price, payment_id, balance_owing, filing_status')
            .eq('id', cleanProfileId)
            .single()

        const filingYear = profile?.filing_year || 'Wait_it_is_dynamic'
        const safeYear = filingYear === 'Wait_it_is_dynamic' ? '2025' : filingYear;
        let batchDetectedForms: any[] = []

        for (const file of files) {
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
            const filePath = `${cleanProfileId}/${Date.now()}-${sanitizedFileName}`

            const { error: storageError } = await adminClient.storage
                .from('tax-documents')
                .upload(filePath, file)

            if (!storageError) {
                const { error: dbError } = await adminClient
                    .from('tax_documents')
                    .insert({
                        profile_id: cleanProfileId,
                        file_name: file.name,
                        file_path: filePath,
                        file_type: file.type,
                        filing_year: safeYear
                    })

                if (dbError) console.error('Admin DB Insert Error:', dbError)
            } else {
                console.error('Storage error:', storageError)
                return { success: false, error: storageError.message }
            }

            // AI Classification (Only if skipAI is false)
            if (!skipAI && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
                const buffer = Buffer.from(await file.arrayBuffer())
                const { classifyDocument } = await import('@/utils/google-ai')
                const result = await classifyDocument(buffer, file.type, file.name)
                if (result && !result.error && result.entities) {
                    batchDetectedForms.push(...result.entities)
                }
            }
        }

        // Aggregate AI updates
        if (!skipAI && batchDetectedForms.length > 0 && profile) {
            const { data: currentProfile } = await adminClient
                .from('tax_profiles')
                .select('detected_forms')
                .eq('id', cleanProfileId)
                .single()

            const existingForms = (currentProfile?.detected_forms as any[]) || []
            const allForms = [...existingForms, ...batchDetectedForms]

            await adminClient
                .from('tax_profiles')
                .update({ detected_forms: allForms })
                .eq('id', cleanProfileId)

            const { recalculateProfileTier } = await import('./document-actions')
            const aiResult = await recalculateProfileTier(cleanProfileId)

            if (aiResult?.success && aiResult.price !== undefined) {
                const isPaid = ['paid', 'in_review', 'approved', 'filed', 'submitted', 'completed'].includes((profile.filing_status || '').toLowerCase()) || !!profile.payment_id;

                let newBalanceOwing = profile.balance_owing || 0;
                let newFilingStatus = profile.filing_status;

                // If the user has already paid, check if the new price is higher
                if (isPaid) {
                    const oldPrice = profile.final_fee || profile.quoted_price || 0;
                    if (aiResult.price > oldPrice) {
                        const difference = aiResult.price - oldPrice;
                        // Add the difference to any existing balance owing
                        newBalanceOwing += difference;
                        console.log(`[AdminUpload] Tier upgrade for paid profile. Old Price: ${oldPrice}, New Price: ${aiResult.price}. Difference: ${difference}`);
                    }
                } else {
                    // If they haven't paid yet, the status should be ready_to_pay
                    newFilingStatus = 'ready_to_pay';
                }

                await adminClient.from('tax_profiles').update({
                    final_fee: aiResult.price,
                    quoted_plan: aiResult.tier,
                    quoted_price: aiResult.price,
                    requires_manual_review: aiResult.needsReview,
                    filing_status: newFilingStatus,
                    balance_owing: newBalanceOwing
                }).eq('id', cleanProfileId)
            }
        }

        revalidatePath(`/admin/filing/${cleanProfileId}`)
        return { success: true }
    } catch (error: any) {
        console.error('Admin Upload failed:', error)
        return { success: false, error: error.message }
    }
}

export async function adminSubmitQuestionnaire(formData: FormData) {
    const profileId = formData.get('profileId') as string

    const intakeAnswers = {
        marital_change: formData.get('marital_change') === 'on',
        new_marital_status: formData.get('new_marital_status'),
        marital_change_date: formData.get('marital_change_date'),

        has_t4: formData.get('has_t4') === 'on',
        has_t4a: formData.get('has_t4a') === 'on',
        has_t5007: formData.get('has_t5007') === 'on',
        has_t4e: formData.get('has_t4e') === 'on',

        has_tuition: formData.get('has_tuition') === 'on',
        has_unused_credits: formData.get('has_unused_credits') === 'on',
        tuition_fed_carryforward: formData.get('tuition_fed_carryforward'),
        tuition_prov_carryforward: formData.get('tuition_prov_carryforward'),
        want_transfer_credits: formData.get('want_transfer_credits') === 'on',
        tuition_transfer_rel: formData.get('tuition_transfer_rel'),
        tuition_transfer_amt: formData.get('tuition_transfer_amt'),

        has_t3: formData.get('has_t3') === 'on',
        has_t5: formData.get('has_t5') === 'on',
        capital_gains: formData.get('capital_gains') === 'on' ? 'yes' : 'no',
        foreign_property: formData.get('foreign_property') === 'on' ? 'yes' : 'no',
        foreign_country: formData.get('foreign_country'),
        foreign_asset_desc: formData.get('foreign_asset_desc'),

        self_employed: formData.get('self_employed') === 'on' ? 'yes' : 'no',
        business_name: formData.get('business_name'),
        business_industry: formData.get('business_industry'),
        gst_registered: formData.get('gst_registered') === 'on',

        rental_income: formData.get('rental_income') === 'on' ? 'yes' : 'no',
        rental_properties: JSON.parse(formData.get('rental_properties_json') as string || '[]'),

        disability_credit: formData.get('disability_credit') === 'on',
        moving_expenses: formData.get('moving_expenses') === 'on',
        medical_expenses: formData.get('medical_expenses') === 'on',
        charitable_donations: formData.get('charitable_donations') === 'on',
        support_payments: formData.get('support_payments') === 'on',

        cra_auth: formData.get('cra_auth'),
        certification: formData.get('certification') === 'on',
        timestamp: new Date().toISOString()
    }

    try {
        const adminClient = getAdminClient();
        const { error } = await adminClient
            .from('tax_profiles')
            .update({ intake_responses: intakeAnswers })
            .eq('id', profileId)

        if (error) throw error

        const { recalculateProfileTier } = await import('./document-actions')
        await recalculateProfileTier(profileId)

        revalidatePath(`/admin/filing/${profileId}`)
        return { success: true }
    } catch (error: any) {
        console.error('Admin submit questionnaire error:', error)
        return { success: false, error: error.message }
    }
}

export async function adminCreateClientAccount(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    if (!email || !password || !firstName || !lastName) {
        return { success: false, error: 'Missing required fields' }
    }

    try {
        const adminClient = getAdminClient();
        // 1. Create Auth User
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { first_name: firstName, last_name: lastName }
        })

        if (authError) throw authError
        if (!authData.user) throw new Error("Failed to create user record")

        const userId = authData.user.id

        // 2. Explicitly upsert into public.users since we bypassed the frontend login trigger
        const { error: userError } = await adminClient.from('users').upsert({
            id: userId,
            email: email,
            full_name: `${firstName} ${lastName}`.trim(),
            role: 'client'
        }, { onConflict: 'id' })

        if (userError) throw userError

        revalidatePath('/admin/dashboard')
        return { success: true, userId }

    } catch (error: any) {
        console.error('Admin Create Client Error:', error)
        return { success: false, error: error.message }
    }
}

export async function adminCreateProfile(userId: string, formData: FormData) {
    try {
        const adminClient = getAdminClient();
        // Use a temporary default year until the admin selects one on the next page
        const taxYear = new Date().getFullYear().toString()

        const payload = {
            user_id: userId,
            filing_year: taxYear,
            filing_status: 'NEW',
            stripe_verification_status: 'verified', // Admin physically verified it
            first_name: formData.get('firstName') as string,
            last_name: formData.get('lastName') as string,
            date_of_birth: formData.get('dob') as string,
            sin: (formData.get('sin') as string || '').replace(/\D/g, ''),
            phone_number: formData.get('phone') as string,
            marital_status: formData.get('maritalStatus') as string,
            address: formData.get('address') as string,
            city: formData.get('city') as string,
            province: formData.get('province') as string,
            postal_code: formData.get('postalCode') as string,
            residency_province: formData.get('residencyProvince') as string || 'AB',
            is_citizen: formData.get('isCitizen') === 'on'
        }

        const { data: profile, error } = await adminClient
            .from('tax_profiles')
            .insert(payload)
            .select()
            .single()

        if (error) throw error

        revalidatePath(`/admin/dashboard/${userId}`)
        return { success: true, profileId: profile.id }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function adminUpdateProfileCredentials(profileId: string, formData: FormData) {
    try {
        const adminClient = getAdminClient();
        const payload = {
            first_name: formData.get('first_name') as string,
            last_name: formData.get('last_name') as string,
            date_of_birth: formData.get('date_of_birth') as string,
            sin: formData.get('sin') as string,
            phone_number: formData.get('phone_number') as string,
            marital_status: formData.get('marital_status') as string,
            address: formData.get('address') as string,
            city: formData.get('city') as string,
            province: formData.get('province') as string,
            postal_code: formData.get('postal_code') as string,
            is_citizen: formData.get('is_citizen') === 'true'
        }

        const { error } = await adminClient
            .from('tax_profiles')
            .update(payload)
            .eq('id', profileId)

        if (error) throw error

        revalidatePath(`/admin/filing/${profileId}`)
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function adminSetFilingYear(profileId: string, year: string) {
    try {
        const adminClient = getAdminClient();
        const { error } = await adminClient
            .from('tax_profiles')
            .update({ filing_year: year })
            .eq('id', profileId)

        if (error) throw error

        revalidatePath(`/admin/filing/${profileId}`)
        return { success: true }
    } catch (error: any) {
        console.error('Admin Set Year Error:', error)
        return { success: false, error: error.message }
    }
}

export async function adminCreateChildFiling(existingProfileId: string, targetYear: string) {
    try {
        const adminClient = getAdminClient();
        // 1. Fetch the existing profile to clone
        const { data: sourceProfile, error: fetchError } = await adminClient
            .from('tax_profiles')
            .select('*')
            .eq('id', existingProfileId)
            .single()

        if (fetchError || !sourceProfile) {
            throw new Error('Profile not found')
        }

        // 2. Safely remove system fields and replace year-specific ones
        const {
            id,
            created_at,
            updated_at,
            filing_year,
            filing_status,
            payment_id,
            intake_responses,
            detected_forms,
            final_fee,
            work_started_at,
            stripe_verification_status,
            ...personalData // Extracts first_name, last_name, sin, dob, address, etc.
        } = sourceProfile

        const newProfileData = {
            ...personalData,
            filing_year: targetYear,
            filing_status: 'NEW',
            stripe_verification_status: 'verified', // Carry over verification
        }

        // 3. Insert the new row
        const { data: newProfile, error: insertError } = await adminClient
            .from('tax_profiles')
            .insert(newProfileData)
            .select('id')
            .single()

        if (insertError) throw insertError

        revalidatePath(`/admin/dashboard/${sourceProfile.user_id}`)
        return { success: true, newProfileId: newProfile.id }
    } catch (error: any) {
        console.error('Admin Create Child Filing Error:', error)
        return { success: false, error: error.message }
    }
}

export async function adminGeneratePaymentLinks(profileId: string) {
    try {
        const adminClient = getAdminClient();
        const { data: profile, error } = await adminClient
            .from('tax_profiles')
            .select('user_id, first_name, last_name, filing_year, quoted_plan, quoted_price')
            .eq('id', profileId)
            .single()

        if (error || !profile) throw new Error('Profile not found')

        const price = profile.quoted_price || 0
        if (price <= 0) {
            return { success: false, error: 'Cannot generate payment links for a $0 balance.' }
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://platform.vsfcapital.ca'

        let stripeUrl = ''
        let coinbaseUrl = ''

        // Generate Stripe
        if (process.env.STRIPE_SECRET_KEY) {
            const stripeModule = await import('stripe')
            const Stripe = stripeModule.default || stripeModule
            const stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'cad',
                        product_data: {
                            name: `Tax Filing: ${profile.first_name} ${profile.last_name}`,
                            description: `${profile.quoted_plan} (${profile.filing_year} Tax Return)`,
                        },
                        unit_amount: price * 100, // cents
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${baseUrl}/filing/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/filing/payment`,
                metadata: {
                    user_id: profile.user_id,
                    profile_ids: profileId,
                }
            })
            stripeUrl = session.url || ''
        }

        // Generate Coinbase
        if (process.env.COINBASE_API_KEY) {
            const coinbaseModule = await import('coinbase-commerce-node')
            const { Client: CoinbaseClient, resources: CoinbaseResources } = coinbaseModule
            CoinbaseClient.init(process.env.COINBASE_API_KEY)

            const charge = await CoinbaseResources.Charge.create({
                name: 'VSF Capital Tax Filing',
                description: `Tax Filing for ${profile.first_name} ${profile.last_name} (${profile.filing_year})`,
                pricing_type: 'fixed_price',
                local_price: {
                    amount: price.toString(),
                    currency: 'CAD',
                },
                metadata: {
                    user_id: profile.user_id,
                    profile_ids: profileId,
                },
                redirect_url: `${baseUrl}/filing/success`,
                cancel_url: `${baseUrl}/filing/payment`,
            } as any)
            coinbaseUrl = charge.hosted_url || ''
        }

        return { success: true, stripeUrl, coinbaseUrl }
    } catch (error: any) {
        console.error("Admin Generate Links Error", error)
        return { success: false, error: error.message }
    }
}

export async function adminGenerateDifferencePaymentLink(profileId: string) {
    try {
        const adminClient = getAdminClient();
        const { data: profile, error } = await adminClient
            .from('tax_profiles')
            .select('user_id, first_name, last_name, filing_year, balance_owing')
            .eq('id', profileId)
            .single()

        if (error || !profile) throw new Error('Profile not found')

        const balance = profile.balance_owing || 0
        if (balance <= 0) {
            return { success: false, error: 'Cannot generate payment links for a $0 balance.' }
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://platform.vsfcapital.ca'

        let stripeUrl = ''

        // Generate Stripe (Only Stripe for difference payments to keep it simple)
        if (process.env.STRIPE_SECRET_KEY) {
            const stripeModule = await import('stripe')
            const Stripe = stripeModule.default || stripeModule
            const stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'cad',
                        product_data: {
                            name: `Tax Filing Tier Upgrade: ${profile.first_name} ${profile.last_name}`,
                            description: `Balance Owing for Tier Upgrade (${profile.filing_year} Tax Return)`,
                        },
                        unit_amount: Math.round(balance * 100), // cents
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${baseUrl}/filing/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/filing/payment`,
                metadata: {
                    user_id: profile.user_id,
                    profile_ids: profileId,
                    is_upgrade_payment: 'true'
                }
            })
            stripeUrl = session.url || ''
        } else {
            return { success: false, error: 'Stripe is not configured' }
        }

        return { success: true, stripeUrl }
    } catch (error: any) {
        console.error("Admin Generate Difference Links Error", error)
        return { success: false, error: error.message }
    }
}

export async function adminGetReceiptUrl(profileId: string) {
    try {
        const adminClient = getAdminClient();
        const { data } = await adminClient
            .from('tax_profiles')
            .select('payment_id')
            .eq('id', profileId)
            .single()

        if (!data?.payment_id) return { success: false }

        // If it looks like a Stripe Checkout Session ID
        if (data.payment_id.startsWith('cs_')) {
            const Stripe = (await import('stripe')).default
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any })

            const session = await stripe.checkout.sessions.retrieve(data.payment_id, {
                expand: ['payment_intent.latest_charge']
            })

            const charge = (session.payment_intent as any)?.latest_charge
            if (charge?.receipt_url) {
                return { success: true, url: charge.receipt_url }
            }
        }

        // Fallback or non-Stripe
        return { success: false }
    } catch (error) {
        console.error('Error fetching receipt:', error)
        return { success: false }
    }
}

export async function getCourierJobs(deliveryStatus?: string) {
    try {
        const adminClient = getAdminClient();
        let query = adminClient
            .from('courier_jobs')
            .select('*')
            .eq('payment_status', 'paid') // ONLY return PAIDs
            .order('created_at', { ascending: false })

        if (deliveryStatus) {
            query = query.eq('delivery_status', deliveryStatus)
        }

        const { data: jobs, error } = await query

        if (error) throw error

        return { success: true, jobs }
    } catch (error) {
        console.error('Fetch Courier Jobs Error:', error)
        return { success: false, error: 'Failed to fetch courier jobs' }
    }
}

export async function updateCourierJobStatus(jobId: string, status: string) {
    try {
        const adminClient = getAdminClient();
        const { error } = await adminClient
            .from('courier_jobs')
            .update({ delivery_status: status, updated_at: new Date().toISOString() })
            .eq('id', jobId)

        if (error) throw error

        revalidatePath('/admin/courier')
        return { success: true }
    } catch (error) {
        console.error('Update Courier Job Status Error:', error)
        return { success: false, error: 'Failed to update status' }
    }
}
