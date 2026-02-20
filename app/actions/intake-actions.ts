'use server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function submitQuestionnaire(formData: FormData) {
    const supabase = await createClient()
    const profileId = formData.get('profileId') as string

    // Construct the intake responses object from the form data
    const intakeAnswers = {
        // 1. Marital Status Change
        marital_change: formData.get('marital_change') === 'on',
        new_marital_status: formData.get('new_marital_status'),
        marital_change_date: formData.get('marital_change_date'),

        // 2. Income
        has_t4: formData.get('has_t4') === 'on',
        has_t4a: formData.get('has_t4a') === 'on',
        has_t5007: formData.get('has_t5007') === 'on',
        has_t4e: formData.get('has_t4e') === 'on',

        // 3. Tuition & Education
        has_tuition: formData.get('has_tuition') === 'on',
        has_unused_credits: formData.get('has_unused_credits') === 'on',
        tuition_fed_carryforward: formData.get('tuition_fed_carryforward'),
        tuition_prov_carryforward: formData.get('tuition_prov_carryforward'),
        want_transfer_credits: formData.get('want_transfer_credits') === 'on',
        tuition_transfer_rel: formData.get('tuition_transfer_rel'),
        tuition_transfer_amt: formData.get('tuition_transfer_amt'),

        // 4. Investments
        has_t3: formData.get('has_t3') === 'on',
        has_t5: formData.get('has_t5') === 'on',
        capital_gains: formData.get('capital_gains') === 'on' ? 'yes' : 'no',
        foreign_property: formData.get('foreign_property') === 'on' ? 'yes' : 'no',
        foreign_country: formData.get('foreign_country'),
        foreign_asset_desc: formData.get('foreign_asset_desc'),

        // 5. Self-Employment
        self_employed: formData.get('self_employed') === 'on' ? 'yes' : 'no',
        business_name: formData.get('business_name'),
        business_industry: formData.get('business_industry'),
        gst_registered: formData.get('gst_registered') === 'on',

        // 6. Rental
        rental_income: formData.get('rental_income') === 'on' ? 'yes' : 'no',
        rental_properties: JSON.parse(formData.get('rental_properties_json') as string || '[]'),

        // 7. Credits
        disability_credit: formData.get('disability_credit') === 'on',
        moving_expenses: formData.get('moving_expenses') === 'on',
        tuition_credits: formData.get('tuition_credits') === 'on',
        medical_expenses: formData.get('medical_expenses') === 'on',
        charitable_donations: formData.get('charitable_donations') === 'on',
        support_payments: formData.get('support_payments') === 'on',

        // 8. CRA Access
        cra_auth: formData.get('cra_auth'), // 'yes' or 'no'

        // 9. Legal
        certification: formData.get('certification') === 'on',
        timestamp: new Date().toISOString()
    }

    console.log('Saving Intake Answers:', intakeAnswers)

    // Save to database
    const { error } = await supabase
        .from('tax_profiles')
        .update({ intake_responses: intakeAnswers })
        .eq('id', profileId)

    if (error) {
        console.error('Error saving intake responses:', error)
        // In a real app we might redirect to an error page or show a toast
        // For now, we proceed but log the error (or we could throw)
    }

    // Redirect to the next step: Documents
    redirect(`/filing/intake/documents?profileId=${profileId}`)
}

export async function confirmQuote(formData: FormData) {
    const supabase = await createClient()
    const profileId = formData.get('profileId') as string
    const quotedPlan = formData.get('quotedPlan') as string
    const quotedPrice = parseFloat(formData.get('quotedPrice') as string)

    // Update the profile with the quote and change status
    const { error } = await supabase
        .from('tax_profiles')
        .update({
            quoted_plan: quotedPlan,
            quoted_price: quotedPrice,
            filing_status: 'ready_to_pay'
        })
        .eq('id', profileId)

    if (error) {
        console.error('Error confirming quote:', error)
        throw new Error('Failed to confirm quote')
    }

    // If deleted successfully, redirect back to review group
    revalidatePath('/filing/intake/review-group')
    redirect('/filing/intake/review-group')
}

export async function removeProfileFromCart(profileId: string) {
    const supabase = await createClient()

    // Verify ownership before deleting
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Delete the profile
    // This assumes cascade delete is set up for related docs/intake, 
    // or we might leave orphaned records if not careful.
    // For now, we just delete the profile row.
    const { error } = await supabase
        .from('tax_profiles')
        .delete()
        .eq('id', profileId)
        .eq('user_id', user.id) // Security check

    if (error) {
        console.error('Error removing profile:', error)
        throw new Error('Failed to remove profile')
    }

    revalidatePath('/filing/review-group')
}
