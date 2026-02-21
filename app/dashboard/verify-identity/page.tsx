
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import VerificationButton from './verification-button'

import Image from 'next/image'

export default async function VerifyIdentityPage({ searchParams }: { searchParams: Promise<{ profileId: string, returnTo?: string }> }) {
    const supabase = await createClient()
    const { profileId, returnTo } = await searchParams

    const { data: profile, error } = await supabase
        .from('tax_profiles')
        .select('*')
        .eq('id', profileId)
        .single()

    if (error || !profile) {
        redirect('/filing/select-profile')
    }

    // Auto-skip if already verified
    if (profile.stripe_verification_status === 'verified') {
        // Go straight to Questionnaire
        redirect(`/filing/intake/questionnaire?profileId=${profileId}`)
    }

    return (
        <div className='min-h-screen bg-white flex flex-col justify-center items-center py-12 px-4'>

            <div className='w-full max-w-2xl text-center space-y-12'>

                {/* Minimal Header */}
                <div className='flex flex-col items-center'>
                    <h1 className='text-3xl font-bold text-gray-900 tracking-tight mb-4'>
                        Verify your identity
                    </h1>
                    {/* User requested "more of a block" and "same length lines" -> text-balance + max-w constraint */}
                    <p className='text-lg text-gray-500 leading-relaxed max-w-[600px] mx-auto'>
                        To protect your account and comply with CRA regulations, <br className='hidden sm:block' />
                        we need to verify <strong>{profile.first_name} {profile.last_name}&rsquo;s</strong> government ID.
                    </p>
                </div>

                {/* The Action */}
                <div className='flex flex-col items-center space-y-6'>

                    <VerificationButton profileId={profileId} returnTo={returnTo} />
                    <p className='text-sm text-gray-400'>
                        Have your Driver&rsquo;s License or Passport ready.
                    </p>
                </div>

                {/* Trust Indicator - Logo */}

                <div className='pt-8 w-full flex items-center justify-center gap-2'>
                    <span className="text-[13px] text-gray-500 font-medium pb-[1px]">Powered by</span>
                    <Image
                        src="/images/logos/stripe-identity-logo.png"
                        alt="Stripe Identity"
                        width={200}
                        height={83}
                        priority
                        className="h-[18px] w-auto opacity-90"
                    />
                </div>
            </div>
        </div>
    )
}
