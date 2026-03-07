'use server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { encryptSIN, hashSIN, extractSINLast4, validateSIN } from '@/utils/encryption'

// 1. FETCH PROFILES (For the 'Select Profile' page)
export async function getTaxProfiles() {
    const supabase = await createClient()

    // The Database automatically filters this to only show YOUR profiles
    // IMPORTANT: Exclude plaintext/encrypted SIN from the payload.
    // Fetch sin_last4 for UI masking, and sin_hash for grouping.
    const { data: profiles, error } = await supabase
        .from('tax_profiles')
        .select(`id, user_id, first_name, last_name, email, date_of_birth, marital_status,
                is_citizen, phone_number, address, city, province, postal_code, residency_province, 
                stripe_verification_status, filing_year, has_unread_admin_message, has_unread_user_message,
                missing_info, review_link, work_started_at, review_ready_at, filed_at, filing_status,
                final_fee, quoted_price, payment_id, balance_owing, quoted_plan, requires_manual_review,
                created_at, updated_at, sin_last4, sin_hash
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching profiles:', error)
        return []
    }

    return profiles || []
}

// 2. CREATE PROFILE (For the 'New Profile' form)
export async function createTaxProfile(formData: FormData) {
    const supabase = await createClient()

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect('/login')
    }

    // Prepare the data for the database
    const sinRaw = (formData.get('sin') as string || '').replace(/\s/g, '');
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const postalCode = (formData.get('postalCode') as string || '').toUpperCase().replace(/\s/g, '');

    // --- SERVER-SIDE VALIDATION ---
    const maritalStatus = formData.get('maritalStatus') as string;
    const isCitizen = formData.get('isCitizen') as string;

    if (!firstName || firstName.length < 2) throw new Error('Invalid first name');
    if (!lastName || lastName.length < 2) throw new Error('Invalid last name');

    // Fintech-grade SIN validation (length, numerical, Luhn Check)
    if (!validateSIN(sinRaw)) {
        throw new Error('Invalid Social Insurance Number format or checksum');
    }

    const sinEncrypted = encryptSIN(sinRaw);
    const sinLast4 = extractSINLast4(sinRaw);
    const sinHash = hashSIN(sinRaw);

    if (!phone || !/^\d{3}-\d{3}-\d{4}$/.test(phone)) throw new Error('Invalid phone format (000-000-0000)');
    if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(postalCode)) throw new Error('Invalid postal code format');
    if (!maritalStatus) throw new Error('Please select a marital status');
    if (!isCitizen) throw new Error('Please select your citizenship status');

    // Age validation (must be 16+)
    const dob = new Date(formData.get('dob') as string);
    const today = new Date();
    const sixteenYearsAgo = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    if (dob > sixteenYearsAgo) {
        throw new Error('You must be at least 16 years old to create a profile.');
    }

    const yearStr = formData.get('year') as string;
    const filingYear = yearStr ? parseInt(yearStr) : today.getFullYear();

    const profileData = {
        user_id: user.id, // Links to the Main Account
        first_name: firstName,
        last_name: lastName,
        email: formData.get('email') as string,
        sin: sinEncrypted, // Backward compatibility column, populated with ciphertext
        sin_last4: sinLast4, // For safe UI masking
        sin_hash: sinHash,   // For deterministic DB grouping
        date_of_birth: formData.get('dob') as string,
        marital_status: formData.get('maritalStatus') as string,

        // Logic: The dropdown sends 'on' for Citizen, empty for Non-Citizen
        is_citizen: formData.get('isCitizen') === 'on',
        phone_number: phone,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        province: formData.get('province') as string,
        postal_code: postalCode,
        residency_province: formData.get('residencyProvince') as string || 'AB',
        stripe_verification_status: 'pending',
        filing_year: filingYear
    }

    // Insert into Supabase
    const { data, error } = await supabase
        .from('tax_profiles')
        .insert(profileData)
        .select()
        .single()


    if (error) {
        console.error('Error creating profile:', error)
        throw new Error('Failed to create profile')
    }

    // Check if user is in their initial onboarding flow right after signing up
    const isOnboarding = formData.get('onboarding') === 'true';
    const customReturnTo = formData.get('returnTo') as string;

    // Determine Base Return Path
    let returnPath = `/filing/intake/questionnaire?profileId=${data.id}`;

    if (customReturnTo) {
        returnPath = customReturnTo;
    }

    redirect(`/dashboard/verify-identity?profileId=${data.id}&returnTo=${encodeURIComponent(returnPath)}`)
}

// 3. START PRIOR YEAR FILING (Clone existing profile for a new year)
export async function startPriorYearFiling(existingProfileId: string, targetYear: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // 1. Fetch the existing profile data to clone
    const { data: sourceProfile, error: fetchError } = await supabase
        .from('tax_profiles')
        .select('*')
        .eq('id', existingProfileId)
        .eq('user_id', user.id) // Security check
        .single()

    if (fetchError || !sourceProfile) {
        throw new Error('Profile not found')
    }

    // 2. Check if a profile for this year ALREADY exists for this SIN/Person
    // We can check by SIN Hash if available, or just by name/dob
    const { data: existingYearProfile } = await supabase
        .from('tax_profiles')
        .select('id, stripe_verification_status')
        .eq('user_id', user.id)
        .eq('sin_hash', sourceProfile.sin_hash)
        .eq('filing_year', targetYear)
        .single()

    if (existingYearProfile) {
        // If it already exists, redirect based on verification status
        const nextStep = existingYearProfile.stripe_verification_status === 'verified'
            ? `/filing/intake/questionnaire?profileId=${existingYearProfile.id}`
            : `/dashboard/verify-identity?profileId=${existingYearProfile.id}`
        redirect(nextStep)
    }

    // 3. Create the new profile for the target year
    // Safely remove system fields and replace year-specific ones
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
        review_ready_at,
        filed_at,
        ...profileData
    } = sourceProfile

    const newProfileData = {
        ...profileData,
        filing_year: targetYear,
        filing_status: 'CREATED',
        // stripe_verification_status is kept from sourceProfile (part of ...profileData)
    }

    const { data: newProfile, error: insertError } = await supabase
        .from('tax_profiles')
        .insert(newProfileData)
        .select()
        .single()


    if (insertError) {
        console.error('Error creating prior year profile:', insertError)
        throw new Error('Failed to create prior year profile')
    }

    // 4. Redirect to the flow
    const nextStep = newProfile.stripe_verification_status === 'verified'
        ? `/filing/intake/questionnaire?profileId=${newProfile.id}`
        : `/dashboard/verify-identity?profileId=${newProfile.id}`
    redirect(nextStep)
}
