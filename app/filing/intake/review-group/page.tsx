import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { X, Plus } from 'lucide-react'
import { removeProfileFromCart } from '@/app/actions/intake-actions'
import PlanExplanation from './plan-explanation'

export default async function ReviewGroupPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch profiles that are NOT paid/submitted
    // We want profiles that are "Ready" but not "Paid".
    // Typically status is null or 'ACTION_REQUIRED' or 'READY_TO_PAY'?
    // The Dashboard logic says: isPaid = ['PAID', 'IN_PROGRESS', 'IN_REVIEW', 'FILED', 'SUBMITTED', 'READY_TO_PAY', 'ACTION_REQUIRED']
    // Wait, READY_TO_PAY should be shown! 
    // PAID, IN_PROGRESS, FILED, SUBMITTED should be HIDDEN.
    // So we filter OUT specific statuses.

    // Fetch user profiles first (since supabase filter with OR/IN can be tricky with string arrays)
    const { data: allProfiles } = await supabase
        .from('tax_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

    // Filter logic
    const hiddenStatuses = ['PAID', 'IN_PROGRESS', 'IN_REVIEW', 'FILED', 'SUBMITTED']
    const profiles = allProfiles?.filter(p => {
        const s = (p.filing_status || '').toUpperCase()
        return !hiddenStatuses.includes(s)
    })

    // Calculate Total
    const total = profiles?.reduce((sum, p) => sum + (p.final_fee || p.quoted_price || 0), 0) || 0

    return (
        <div className='flex flex-col items-center justify-center min-h-[60vh] w-full animate-in fade-in zoom-in duration-500'>
            <div className='w-full max-w-2xl space-y-10'>

                {/* Title */}
                <h1 className='text-3xl font-bold text-gray-900 text-left'>
                    Review your Filing Group
                </h1>

                {/* List of Returns */}
                <div className='space-y-4'>
                    {profiles?.map((profile) => (
                        <div key={profile.id} className='bg-white border border-gray-100 rounded-xl p-6 flex items-center justify-between shadow-sm hover:border-gray-200 transition-all'>
                            <div className='flex items-center gap-4'>
                                <span className='text-lg font-bold text-gray-900'>
                                    {profile.first_name}&rsquo;s Tax Return
                                </span>
                            </div>
                            <div className='flex items-center gap-6'>
                                <span className='text-lg font-bold text-gray-900'>
                                    {profile.quoted_plan?.replace('Plan', '').trim()} Plan - ${profile.final_fee || profile.quoted_price}
                                </span>

                                {/* Remove Button */}
                                <form action={removeProfileFromCart.bind(null, profile.id)}>
                                    <button type='submit' className='text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all'>
                                        <X className='w-5 h-5' />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}

                    {(!profiles || profiles.length === 0) && (
                        <div className='text-gray-400 italic text-center'>No returns in your group yet.</div>
                    )}
                </div>

                {/* "Add Another" Button */}
                <div className='flex justify-center pt-4'>
                    <Link
                        href='/filing/select-profile'
                        className='bg-[#333333] text-white text-base font-semibold py-3 px-6 rounded-full hover:bg-black transition-all shadow-md flex items-center gap-2'
                    >
                        <Plus className='w-4 h-4' />
                        Add another return
                    </Link>
                </div>

                {/* Total & Pay */}
                <div className='mt-12 pt-8 flex justify-center'>
                    <Link href='/filing/intake/payment'>
                        <div className='bg-[#4374D4] hover:bg-[#3460b5] text-white rounded-full py-3 px-8 flex items-center gap-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer'>
                            <span className='text-lg font-semibold'>
                                Total: ${total}
                            </span>
                            <span className='text-lg font-bold'>
                                Proceed to payment
                            </span>
                        </div>
                    </Link>
                </div>

            </div>
        </div>
    )
}
