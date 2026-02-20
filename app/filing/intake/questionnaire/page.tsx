import IntakeForm from './intake-form'
import { createClient } from '@/utils/supabase/server'

export default async function QuestionnairePage({ searchParams }: { searchParams: Promise<{ profileId: string, verified?: string }> }) {
    const { profileId, verified } = await searchParams

    const supabase = await createClient()

    if (verified === 'true') {
        await supabase
            .from('tax_profiles')
            .update({ stripe_verification_status: 'verified' })
            .eq('id', profileId)
    }

    const { data: profile } = await supabase
        .from('tax_profiles')
        .select('filing_year')
        .eq('id', profileId)
        .single()

    const filingYear = profile?.filing_year || 2025

    return (
        <div className='w-full space-y-8 animate-in fade-in duration-500'>
            <div>
                <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>Tax Questionnaire</h1>
                <p className='mt-2 text-gray-500'>Please fill out the details below so we can prepare your {filingYear} Tax Return.</p>
            </div>

            <IntakeForm profileId={profileId} filingYear={filingYear} />
        </div>
    )
}
