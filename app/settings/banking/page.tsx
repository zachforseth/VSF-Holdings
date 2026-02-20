import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, User } from 'lucide-react'
import BankingForm from '@/app/settings/banking/banking-form'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BankingPage({ searchParams }: PageProps) {
    const resolvedSearchParams = await searchParams
    const profileId = resolvedSearchParams.profileId as string | undefined

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profiles } = await supabase
        .from('tax_profiles')
        // Added filing_status to checking for locking
        .select('id, first_name, last_name, bank_name, transit_number, institution_number, account_number, void_cheque_path, filing_status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (!profiles || profiles.length === 0) {
        return <div className="p-12 text-center text-gray-500">No tax profiles found.</div>
    }

    // Step 2: Profile Selected -> Show Form
    if (profileId) {
        const selectedProfile = profiles.find(p => p.id === profileId)
        if (!selectedProfile) redirect('/settings/banking') // Invalid ID, go back

        return (
            <div className='max-w-2xl mx-auto'>
                <div className='mb-12 text-center mt-8'>
                    <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
                        {selectedProfile.first_name}&rsquo;s Direct Deposit
                    </h1>
                </div>

                <BankingForm profile={selectedProfile} />
            </div>
        )
    }

    // Step 1: Profile Selection
    return (
        <div className='max-w-2xl mx-auto'>
            <div className='mb-12'>
                <h1 className='text-4xl font-bold tracking-tight text-gray-900'>Direct Deposit</h1>
                <p className='text-gray-500 text-lg mt-2'>Select a profile to manage banking information.</p>
            </div>

            <div className="grid gap-4">
                {profiles.map(profile => {
                    const hasBanking = !!(profile.bank_name || profile.void_cheque_path)

                    return (
                        <Link
                            key={profile.id}
                            href={`/settings/banking?profileId=${profile.id}`}
                            className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between hover:border-[#4374D4] transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#4374D4] transition-colors">
                                        {profile.first_name} {profile.last_name}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {hasBanking ? (
                                    <span className='text-sm font-medium text-green-600'>Connected</span>
                                ) : (
                                    <span className='text-yellow-800 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full font-bold text-xs inline-flex items-center gap-2'>
                                        Needs Attention
                                    </span>
                                )}
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#4374D4] transition-colors" />
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
