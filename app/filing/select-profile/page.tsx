import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Plus } from 'lucide-react'
import DashboardLayout from '../../dashboard/layout'
import { startPriorYearFiling } from '@/app/actions/profile-actions'

export default async function SelectProfilePage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // ... existing logic ...

    const { year } = await searchParams
    const selectedYear = year ? parseInt(year) : 2025

    // ... data fetching & grouping ...

    const isCurrentYear = selectedYear === 2025

    if (!user) {
        redirect('/login')
    }

    // 2. Fetch existing profiles
    const { data: profiles, error } = await supabase
        .from('tax_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

    // Group profiles by SIN (or Name if SIN missing) to find unique "Identities"
    const identities = new Map<string, any[]>()

    profiles?.forEach(p => {
        const key = p.sin || `${p.first_name}-${p.last_name}`
        const existing = identities.get(key) || []
        identities.set(key, [...existing, p])
    })

    return (
        <DashboardLayout>
            <div className="max-w-xl mx-auto pt-10 px-6 space-y-10">
                <div className='text-center'>
                    <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
                        Who will this {selectedYear} tax return be for?
                    </h1>
                </div>
                <div className='space-y-3'>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-widest pl-1'>Your Profiles</p>
                    <div className='flex flex-col space-y-3'>

                        {/* Iterate over unique identities */}
                        {Array.from(identities.values()).map((personProfiles) => {
                            // 1. Check if this person has a profile for the SELECTED year
                            const profileForYear = personProfiles.find(p => p.filing_year === selectedYear)

                            // 2. Use the most recent profile as "Base" for name/info
                            const baseProfile = personProfiles[personProfiles.length - 1]

                            // CASE A: Profile exists for this year -> Resume/View Logic
                            if (profileForYear) {
                                const isPaidOrFiled = ['PAID', 'FILED', 'SUBMITTED', 'IN_PROGRESS', 'IN_REVIEW', 'READY_TO_PAY'].includes((profileForYear.filing_status || '').toUpperCase())

                                if (isPaidOrFiled && profileForYear.filing_status !== 'IN_PROGRESS') {
                                    const isActuallyPaid = ['PAID', 'FILED', 'SUBMITTED', 'IN_REVIEW'].includes((profileForYear.filing_status || '').toUpperCase())
                                    const statusText = isActuallyPaid ? `Already filed for ${selectedYear}` : `Already added for ${selectedYear}`

                                    return (
                                        <div key={baseProfile.id} className='w-full bg-gray-50 border border-gray-200 rounded-2xl p-6 flex items-center justify-between opacity-75 cursor-not-allowed'>
                                            <div className='flex flex-col'>
                                                <span className='text-lg font-bold text-gray-500'>{baseProfile.first_name}&rsquo;s Tax Return</span>
                                            </div>
                                            <span className='text-sm text-gray-400 font-medium'>{statusText}</span>
                                        </div>
                                    )
                                }

                                const isVerified = profileForYear.stripe_verification_status === 'verified'
                                const nextStepUrl = isVerified
                                    ? `/filing/intake/questionnaire?profileId=${profileForYear.id}`
                                    : `/dashboard/verify-identity?profileId=${profileForYear.id}`

                                return (
                                    <Link
                                        key={baseProfile.id}
                                        href={nextStepUrl}
                                        className='group w-full bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between hover:border-[#635BFF] transition-all'
                                    >
                                        <div className='flex flex-col'>
                                            <span className='text-lg font-bold text-gray-900'>{baseProfile.first_name}&rsquo;s Tax Return</span>
                                            <div className='flex items-center gap-2 mt-1'>
                                                <span className='text-xs font-medium text-gray-400'>
                                                    Last modified: {new Date(profileForYear.updated_at || profileForYear.created_at).toLocaleDateString()}
                                                </span>
                                                {isVerified && <span className='text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded'>VERIFIED</span>}
                                            </div>
                                        </div>
                                        <ChevronRight className='w-5 h-5 text-gray-300 group-hover:text-[#635BFF] group-hover:translate-x-1 transition-all' />
                                    </Link>
                                )
                            }

                            // CASE B: Profile does NOT exist for this year, but exists for others -> CREATE Logic
                            // We use a Server Action to clone 'baseProfile' to 'selectedYear'

                            // Bind arguments to the server action
                            const createAction = startPriorYearFiling.bind(null, baseProfile.id, selectedYear)

                            return (
                                <form action={createAction} key={baseProfile.id}>
                                    <button
                                        type="submit"
                                        className='group w-full bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between hover:border-[#635BFF] transition-all text-left'
                                    >
                                        <div className='flex flex-col'>
                                            <span className='text-lg font-bold text-gray-900'>{baseProfile.first_name}&rsquo;s Tax Return</span>
                                        </div>
                                        <ChevronRight className='w-5 h-5 text-gray-300 group-hover:text-[#635BFF] group-hover:translate-x-1 transition-all' />
                                    </button>
                                </form>
                            )
                        })}
                    </div>
                </div>
                <div className='flex flex-col items-center gap-6 pt-6'>
                    <Link href={`/filing/new-profile?year=${selectedYear}`} className='bg-[#2C2C2C] text-white text-base font-semibold py-4 px-12 rounded-full hover:bg-black transition-all shadow-xl flex items-center gap-2'>
                        <Plus className='w-5 h-5' /> Create a new profile
                    </Link>

                    <Link href={isCurrentYear ? '/filing/select-year' : '/filing/select-profile'} className='text-sm font-semibold text-gray-900 hover:text-gray-500 flex items-center gap-1'>
                        {isCurrentYear ? (
                            <>File for a different year &rarr;</>
                        ) : (
                            <>&larr; Back to 2025</>
                        )}
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    )
}
