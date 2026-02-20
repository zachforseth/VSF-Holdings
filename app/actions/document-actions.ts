'use server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function uploadTaxDocuments(formData: FormData) {
    // Standard client for profile fetch (authenticates user)
    const supabase = await createClient()

    // Service Role client for bypassing RLS on inserts if needed
    const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const profileId = formData.get('profileId') as string
    const profileName = formData.get('profileName') as string || 'Unknown'
    const files = formData.getAll('files') as File[]

    if (!profileId || files.length === 0) return { success: false }

    try {
        // SANITIZATION:
        // 1. Strip any suffix from profileId to ensure we only have the UUID (first 36 chars)
        const cleanProfileId = profileId.substring(0, 36)

        // 2. Fetch Filing Year from Profile
        const { data: profile } = await supabase
            .from('tax_profiles')
            .select('filing_year')
            .eq('id', cleanProfileId)
            .single()

        const filingYear = profile?.filing_year || '2025' // Default to 2025 if missing

        for (const file of files) {
            // NEW FOLDER STRUCTURE: {UUID}/{Timestamp}-{Filename}
            // Explicitly removed name suffix as requested
            // SANITIZE FILENAME: Replace non-alphanumeric chars (except dot/dash) with underscore
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `${cleanProfileId}/${Date.now()}-${sanitizedFileName}`

            // 1. Upload to 'tax-documents' bucket
            // Storage RLS often allows uploads to own folder, so standard client is usually fine.
            // If this fails too, we can switch to adminClient.storage
            const { data: storageData, error: storageError } = await supabase.storage
                .from('tax-documents')
                .upload(filePath, file)

            if (!storageError) {
                // 2. Insert into 'tax_documents' table
                // USING ADMIN CLIENT TO BYPASS RLS ON INSERT
                // This guarantees the record is created even if user RLS for insert is buggy
                const { error: dbError } = await adminClient
                    .from('tax_documents')
                    .insert({
                        profile_id: cleanProfileId, // Use the sanitized UUID
                        file_name: file.name,
                        file_path: filePath,
                        file_type: file.type,
                        filing_year: filingYear // Save the year
                    })

                if (dbError) {
                    console.error('DB Insert Error (Admin):', dbError)
                }
            } else {
                console.error('Storage error:', storageError)
            }
        }

        // 3. AI Classification (New Step)
        // We'll gather all detected forms from this batch
        let batchDetectedForms: any[] = [];

        for (const file of files) {
            // Only classify likely tax docs (PDF/Images)
            if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                const buffer = Buffer.from(await file.arrayBuffer());

                // Import dynamically to avoid build issues (server-only)
                const { classifyDocument } = await import('@/utils/google-ai');
                const result = await classifyDocument(buffer, file.type, file.name);

                if (result && !result.error && result.entities) {
                    batchDetectedForms.push(...result.entities);
                }
            }
        }

        // 4. Update Profile with AI Results
        if (batchDetectedForms.length > 0) {
            // Fetch current profile to get intake answers
            const { data: currentProfile } = await supabase
                .from('tax_profiles')
                .select('intake_responses, detected_forms')
                .eq('id', cleanProfileId)
                .single();

            if (currentProfile) {
                // Merge new forms with existing ones
                const existingForms = (currentProfile.detected_forms as any[]) || [];
                const allForms = [...existingForms, ...batchDetectedForms];

                // Calculate Tier
                const { calculateTier } = await import('@/utils/google-ai');

                // Extract just the types for the calculator
                const formTypes = allForms.map(e => e.type);
                const { tier, price, reason, alert } = calculateTier(formTypes, currentProfile.intake_responses);

                // Update the DB with the merged forms first
                await adminClient
                    .from('tax_profiles')
                    .update({ detected_forms: allForms })
                    .eq('id', cleanProfileId);

                console.log(`AI Batch Classification Complete. Running aggregate recalculation...`);
                await recalculateProfileTier(cleanProfileId);
            }
        }

        revalidatePath('/dashboard')
        revalidatePath('/filing/intake/documents')
        return { success: true }
    } catch (error) {
        console.error('Upload failed:', error)
        // Don't fail the upload just because AI failed, treat it as a warning
        // But do return error for the actual upload if that failed.
        // We are inside the main try/catch so this catches upload errors too.
        // If file save succeeded but AI failed, we should probably still succeed.
        // For now, return false on any error to be safe.
        return { success: false }
    }
}

export async function deleteDocument(docId: string, filePath: string) {
    const supabase = await createClient()

    // Service Role client for bypassing RLS
    const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        // 1. Get Document Details BEFORE deletion to know what we are removing
        const { data: docToDelete } = await supabase
            .from('tax_documents')
            .select('profile_id, file_name')
            .eq('id', docId)
            .single();

        // 2. Delete from Database
        // Use Admin Client to ensure deletion works regardless of RLS
        const { error: dbError } = await adminClient
            .from('tax_documents')
            .delete()
            .eq('id', docId)

        if (dbError) throw dbError

        // 3. Delete from Storage
        if (filePath) {
            // Use Admin for storage removal to bypass any RLS issues
            const { error: storageError } = await adminClient.storage
                .from('tax-documents')
                .remove([filePath])

            if (storageError) console.error('Storage delete error (non-fatal):', storageError)
        }

        // 4. State-Sync: Immediate Recalculation
        if (docToDelete) {
            console.log(`[DeleteDoc] Document deleted. Triggering State-Sync Recalculation for ${docToDelete.profile_id}...`);
            await recalculateProfileTier(docToDelete.profile_id);
        } else {
            console.warn(`[DeleteDoc] Document ${docId} not found, skipping recalculation.`);
        }

        revalidatePath('/filing/intake/documents');
        revalidatePath('/filing/intake/review');
        revalidatePath('/dashboard');
        return { success: true }
    } catch (error) {
        console.error('Delete failed:', error)
        return { success: false }
    }
}

export async function getDocuments(profileId: string) {
    const { unstable_noStore: noStore } = await import('next/cache');
    noStore();


    // Use Admin Client for reading to ensure we see all docs regardless of RLS
    // (User should see their own docs, but if RLS read policy is flawed, this fixes it)
    const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Clean ID
    const cleanProfileId = profileId.substring(0, 36)

    try {
        const { data: documents, error } = await adminClient
            .from('tax_documents')
            .select('*')
            .eq('profile_id', cleanProfileId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching documents:', error);
            return [];
        }

        return documents || [];
    } catch (err) {
        console.error('Unexpected error fetching documents:', err);
        return [];
    }
}

export async function getSignedDocumentUrl(filePath: string) {
    const supabase = await createClient()

    // 1. Verify User Ownership via Database
    // We check if this file_path exists in tax_documents linked to a profile owned by the user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Admin Client to search for doc across RLS
    const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: doc, error: docError } = await adminClient
        .from('tax_documents')
        .select(`
            *,
            tax_profiles!inner(user_id)
        `)
        .eq('file_path', filePath)
        .eq('tax_profiles.user_id', user.id)
        .single()

    if (docError || !doc) {
        console.error('Unauthorized access or file not found in DB:', filePath)
        return null
    }

    // 2. Use Admin Client to Generate Signed URL
    // This bypasses Storage RLS policies which might fail on 'UUID_Unknown' folder names
    // (Already using adminClient above for consistency)

    // Try 'tax-documents' first (primary)
    let { data, error } = await adminClient.storage
        .from('tax-documents')
        .createSignedUrl(filePath, 60 * 60) // 1 hour

    // Fallback check for 'tax-docs'
    if (error) {
        const { data: databackup, error: errorbackup } = await adminClient.storage
            .from('tax-docs')
            .createSignedUrl(filePath, 60 * 60)

        if (databackup) {
            data = databackup
            error = errorbackup
        }
    }

    if (error || !data) {
        console.error('Error creating signed URL:', error)
        return null
    }

    return data.signedUrl
}

export async function recalculateProfileTier(profileId: string) {
    const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        // 1. Fetch Profile Data ONLY (No DB Validation Step)
        const { data: profile, error: profileError } = await adminClient
            .from('tax_profiles')
            .select('intake_responses, detected_forms')
            .eq('id', profileId)
            .single();

        if (profileError || !profile) throw profileError || new Error('Profile not found');

        // 2. Pure Calculation based on detected_forms
        // We TRUST the input because reprocessAllDocuments provides a fresh scan of the bucket.
        const forms = (profile.detected_forms as any[]) || [];
        const { calculateTier } = await import('@/utils/google-ai');

        // Extract form types for the calculator
        const formTypes = forms.map(f => f.type);
        const { tier, price, reason, alert, needsReview } = calculateTier(formTypes, profile.intake_responses);

        console.log(`[RecalcTier] Profile ${profileId}: ${tier} ($${price}). Reason: ${reason}`);

        // 3. Update Profile Price
        await adminClient
            .from('tax_profiles')
            .update({
                final_fee: price,
                quoted_plan: `${tier} Plan`,
                requires_manual_review: needsReview
            })
            .eq('id', profileId);

        return { success: true, tier, price, needsReview };
    } catch (error) {
        console.error('[RecalcTier] Error:', error);
        return { success: false };
    }
}

export async function reprocessAllDocuments(profileId: string) {
    const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const cleanProfileId = profileId.substring(0, 36);

    console.log(`[Reprocess] Starting STATLESS scan for ${cleanProfileId}...`);

    try {
        // 1. List all files in Storage (Source of Truth)
        const { data: files, error: listError } = await adminClient.storage
            .from('tax-documents')
            .list(cleanProfileId);

        if (listError || !files) {
            console.error('[Reprocess] List error:', listError);
            return { success: false };
        }

        let allDetectedForms: any[] = [];
        const { classifyDocument } = await import('@/utils/google-ai');

        console.log(`[Reprocess] Found ${files.length} files to scan.`);

        // 2. Process each file
        for (const file of files) {
            if (file.name === '.emptyFolderPlaceholder' || !file.id) continue;

            const filePath = `${cleanProfileId}/${file.name}`;

            // CLEAN FILENAME: Strip timestamp prefix (e.g. 174000000-T5.pdf -> T5.pdf)
            // This ensures the AI sees the original name, matching user expectations
            const originalName = file.name.replace(/^\d+-(.+)$/, '$1');

            // Download
            const { data: fileBlob, error: downloadError } = await adminClient.storage
                .from('tax-documents')
                .download(filePath);

            if (downloadError || !fileBlob) {
                console.error(`[Reprocess] Failed to download ${filePath}`, downloadError);
                continue;
            }

            const arrayBuffer = await fileBlob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const mimeType = file.metadata?.mimetype || 'application/pdf';

            console.log(`[Reprocess] Scanning ${originalName} (${mimeType})...`);

            // Pass ORIGINAL NAME to classifier so source_file is correct
            const result = await classifyDocument(buffer, mimeType, originalName);

            if (result && !result.error && result.entities) {
                allDetectedForms.push(...result.entities);
            }
        }

        // 3. PURE CALCULATION (No Write)
        // We fetch the profile just to get intake responses for the calculator logic
        const { data: profile } = await adminClient
            .from('tax_profiles')
            .select('intake_responses')
            .eq('id', cleanProfileId)
            .single();

        if (!profile) throw new Error('Profile not found');

        const { calculateTier } = await import('@/utils/google-ai');
        const formTypes = allDetectedForms.map(f => f.type);
        const { tier, price, reason, alert, needsReview } = calculateTier(formTypes, profile.intake_responses);

        console.log(`[Reprocess] Scan Complete. Result: ${tier} ($${price}). Not saving to DB yet.`);

        // Return everything needed for the Review page to display
        return {
            success: true,
            detectedForms: allDetectedForms,
            tier,
            price,
            reason,
            alert,
            needsReview
        };

    } catch (error) {
        console.error('[Reprocess] Fatal error:', error);
        return { success: false };
    }
}

export async function commitProfileData(formData: FormData) {
    const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const profileId = formData.get('profileId') as string;
    const tier = formData.get('quotedPlan') as string; // "Pro Plan", etc.
    const price = parseFloat(formData.get('quotedPrice') as string);
    const formsJson = formData.get('detectedForms') as string;
    const needsReview = formData.get('needsReview') === 'true';

    console.log(`[Commit] Finalizing Profile ${profileId} with ${tier} ($${price})...`);

    try {
        const detectedForms = JSON.parse(formsJson);

        // 1. Atomic Update of Profile State
        const { error } = await adminClient
            .from('tax_profiles')
            .update({
                detected_forms: detectedForms,
                final_fee: price,
                quoted_plan: tier,
                quoted_price: price, // Legacy field, keeping for compatibility
                requires_manual_review: needsReview,
                filing_status: 'ready_to_pay'
            })
            .eq('id', profileId);

        if (error) throw error;
    } catch (error) {
        console.error('[Commit] Failed to save profile:', error);
        return { success: false };
    }

    // Must happen outside try/catch because redirects throw errors in Next.js actions
    const { redirect } = await import('next/navigation');
    redirect('/filing/intake/review-group');
}
