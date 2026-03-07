import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, MessageCircle, ChevronRight, CheckCircle2, AlertTriangle, FileText, UploadCloud, FileSearch, DollarSign } from 'lucide-react'

import { uploadTaxDocuments } from '@/app/actions/document-actions'
import UploadButton from '@/app/dashboard/upload-button'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ verified?: string; profileId?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { verified, profileId } = await searchParams

    // Process Stripe Verification Return
    if (verified === 'true' && profileId) {
        await supabase
            .from('tax_profiles')
            .update({ stripe_verification_status: 'verified' })
            .eq('id', profileId)
            .eq('user_id', user.id) // Security check
    }

    // 1. Fetch Profile for Name & Status
    const { data: profiles } = await supabase
        .from('tax_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // 2. Fetch history for activity feed
    const { data: history } = await supabase
        .from('filing_history')
        .select('*')
        .in('profile_id', profiles?.map((p: any) => p.id) || [])
        .order('created_at', { ascending: false })

    // 2. VERIFY PHYSICAL FILE EXISTENCE (Data Integrity Check)
    // DISABLED: This check was too aggressive and wiped data if storage listing was flaky or path mismatch.
    // We will rely on the upload action to set the path correctly.
    /*
    if (profiles && profiles.length > 0) {
        await Promise.all(profiles.map(async (profile: any) => {
            if (profile.void_cheque_path) {
                // ... logic removed ...
            }
        }))
    }
    */



    const primaryProfile = profiles && profiles.length > 0 ? profiles[0] : null

    // BADGE LOGIC: Show if we have profiles AND (banking is missing OR status is ACTION_REQUIRED)
    const hasMissingBanking = profiles && profiles.some((p: any) =>
        (!p.banking_confirmed_at && !p.bank_name) && !p.void_cheque_path
    )
    const hasAdminFlag = profiles && profiles.some((p: any) => p.filing_status === 'ACTION_REQUIRED')

    const profilesReadyForReview = profiles?.filter((p: any) => p.filing_status?.toUpperCase() === 'IN_REVIEW') || []
    const isReadyForReview = profilesReadyForReview.length > 0
    const reviewTarget = profilesReadyForReview.length === 1
        ? `/dashboard/review/${profilesReadyForReview[0].id}`
        : '/dashboard/review'

    const showActionRequired = profiles && profiles.length > 0 && (hasMissingBanking || hasAdminFlag)

    // Use Auth User's name (or email part) as fallback, not the first profile name
    const authName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Client'
    // Get just the first name (capitalized if possible)
    const firstName = authName.split(' ')[0].split('@')[0]

    // DEBUG LOGGING
    console.log('--- DASHBOARD DEBUG ---')
    console.log('User:', user.email, user.id)
    console.log('Profiles Found:', profiles?.length)
    console.log('Profiles Names:', profiles?.map(p => `${p.first_name} (${p.filing_status})`))
    console.log('-----------------------')

    // 5. STATUS LOGIC: 'paid' means 'Received'
    const status = primaryProfile?.filing_status || 'none'
    const s = status.toUpperCase()

    // Check against normalized values
    const isPaid = ['PAID', 'IN_PROGRESS', 'IN_REVIEW', 'APPROVED', 'FILED', 'SUBMITTED', 'READY_TO_PAY', 'ACTION_REQUIRED'].includes(s)
    const isInProgress = ['IN_PROGRESS', 'IN_REVIEW', 'APPROVED', 'FILED'].includes(s)
    const isInReview = ['IN_REVIEW', 'APPROVED', 'FILED'].includes(s)
    const isFiled = s === 'FILED'

    const actionButtons = (
        <div className='grid grid-cols-2 gap-4'>
            <Link href='/filing/select-profile' className='bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:shadow-md transition-all hover:border-gray-300 h-32'>
                <Plus className='w-6 h-6 text-gray-900' />
                <span className='text-xs font-bold text-gray-900 leading-tight'>
                    {primaryProfile ? (
                        <>Start another<br />return</>
                    ) : (
                        <>Start your<br />tax return</>
                    )}
                </span>
            </Link>
            <Link href="/dashboard/chat" className='bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:shadow-md transition-all hover:border-gray-300 h-32 relative'>
                {profiles?.some(p => p.has_unread_admin_message) && (
                    <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
                <MessageCircle className='w-6 h-6 text-gray-900' />
                <span className='text-xs font-bold text-gray-900 leading-tight'>Chat with<br />my Advisor</span>
            </Link>
        </div>
    );

    const quickLinks = (
        <div className='bg-white border border-gray-200 rounded-2xl overflow-hidden'>
            <Link href='/dashboard/review' className='p-5 border-b border-gray-100 block hover:bg-gray-50 cursor-pointer text-sm font-semibold text-gray-700 flex items-center justify-between group transition-colors'>
                Review my return
                <ChevronRight className='w-4 h-4 text-gray-300 group-hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all' />
            </Link>
            <Link href='/documents' className='p-5 border-b border-gray-100 block hover:bg-gray-50 cursor-pointer text-sm font-semibold text-gray-700 flex items-center justify-between group transition-colors'>
                View Receipts
                <ChevronRight className='w-4 h-4 text-gray-300 group-hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all' />
            </Link>
            <Link href='/dashboard/history' className='p-5 border-b border-gray-100 block hover:bg-gray-50 cursor-pointer text-sm font-semibold text-gray-700 flex items-center justify-between group transition-colors'>
                View tax history
                <ChevronRight className='w-4 h-4 text-gray-300 group-hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all' />
            </Link>
            <Link href='/settings/banking' className='p-5 hover:bg-gray-50 cursor-pointer text-sm font-semibold text-gray-700 flex items-center justify-between group transition-colors'>
                Update direct deposit
                {hasMissingBanking ? (
                    <span className='text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded ml-2'>Action Required</span>
                ) : (
                    (primaryProfile?.bank_name || primaryProfile?.void_cheque_path) ? (
                        <span className='text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded ml-2'>Connected</span>
                    ) : null
                )}
                <ChevronRight className='w-4 h-4 text-gray-300 group-hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all' />
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FCFCFC]">
            {/* Navbar is handled by Layout now */}

            <main className='w-full max-w-7xl mx-auto p-0 overflow-x-hidden'>

                <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12'>

                    {/* --- LEFT COLUMN (Main Content) --- */}
                    <div className='lg:col-span-8 space-y-12'>

                        {/* REVIEW QUOTE BANNER */}
                        {profiles?.some(p => p.filing_status === 'draft' && p.quoted_plan) && (
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 mb-4">
                                <div>
                                    <h3 className="text-blue-800 font-bold text-lg flex items-center gap-2">
                                        <FileSearch className="w-5 h-5" />
                                        Quote Ready for Review
                                    </h3>
                                    <p className="text-blue-700 text-sm mt-1">
                                        Your documents have been analyzed. Please review your personalized quote to proceed.
                                    </p>
                                </div>
                                <Link
                                    href={`/filing/intake/processing?profileId=${profiles.find(p => p.filing_status === 'draft' && p.quoted_plan)?.id}`}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all text-sm whitespace-nowrap shadow-sm"
                                >
                                    Review Quote
                                </Link>
                            </div>
                        )}

                        {/* PAYMENT REQUIRED BANNER */}
                        {profiles?.some(p => p.filing_status === 'ready_to_pay') && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4">
                                <div>
                                    <h3 className="text-emerald-800 font-bold text-lg flex items-center gap-2">
                                        <DollarSign className="w-5 h-5" />
                                        Important: Payment Required
                                    </h3>
                                    <p className="text-emerald-700 text-sm mt-1">
                                        Your filing package pricing has been finalized. Please complete payment to officially begin your return.
                                    </p>
                                </div>
                                <Link
                                    href="/filing/intake/payment"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all text-sm whitespace-nowrap shadow-sm"
                                >
                                    Checkout Now
                                </Link>
                            </div>
                        )}

                        {/* UNREAD MESSAGE BANNER */}
                        {profiles?.some(p => p.has_unread_admin_message) && (
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4">
                                <div>
                                    <h3 className="text-blue-800 font-bold text-lg flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5" />
                                        New message from your Advisor
                                    </h3>
                                    <p className="text-blue-700 text-sm mt-1">
                                        We sent you a message regarding your filing. Check it out now.
                                    </p>
                                </div>
                                <Link
                                    href="/dashboard/chat"
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-2 px-5 rounded-xl transition-colors text-sm whitespace-nowrap"
                                >
                                    Go to Chat
                                </Link>
                            </div>
                        )}

                        {/* READY FOR REVIEW BANNER */}
                        {isReadyForReview && (
                            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4">
                                <div>
                                    <h3 className="text-purple-800 font-bold text-lg flex items-center gap-2">
                                        <FileSearch className="w-5 h-5" />
                                        {profilesReadyForReview.length === 1 ? `${profilesReadyForReview[0].filing_year || ''} Return is Ready` : 'Returns are Ready'}
                                    </h3>
                                    <p className="text-purple-700 text-sm mt-1">
                                        {profilesReadyForReview.length === 1
                                            ? `Please use the link to review the final documents and provide your approval so we can e-file to the CRA.`
                                            : `You have ${profilesReadyForReview.length} returns ready for review. Please review and approve them so we can file.`}
                                    </p>
                                </div>
                                <Link
                                    href={reviewTarget}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all text-sm whitespace-nowrap"
                                >
                                    Review & Approve
                                </Link>
                            </div>
                        )}

                        {/* Needs Attention Banner (Detailed Requests) */}
                        {primaryProfile && primaryProfile.missing_info && (
                            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 mb-8 animate-in slide-in-from-top-4 flex flex-col gap-4">
                                <div>
                                    <h3 className="text-yellow-800 font-bold text-lg flex items-center gap-2 mb-2">
                                        Action Required
                                    </h3>

                                    <div className="space-y-3">
                                        {primaryProfile.missing_info ? (
                                            <div>
                                                <p className="text-yellow-700 text-sm font-medium mb-2">
                                                    We need the following to proceed:
                                                </p>
                                                <ul className="list-disc list-inside space-y-1 ml-1 mb-3">
                                                    {primaryProfile.missing_info.documents?.map((doc: string, i: number) => (
                                                        <li key={`doc-${i}`} className="text-yellow-700 text-sm">{doc}</li>
                                                    ))}
                                                    {primaryProfile.missing_info.questions?.map((q: string, i: number) => (
                                                        <li key={`q-${i}`} className="text-yellow-700 text-sm">{q}</li>
                                                    ))}
                                                </ul>
                                                {primaryProfile.missing_info.note && (
                                                    <p className="text-yellow-700 text-sm italic border-l-2 border-yellow-200 pl-3 py-1 bg-yellow-100/30 rounded-r-lg">
                                                        "{primaryProfile.missing_info.note}"
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-yellow-700 text-sm">
                                                We need some additional information. Please check the chat.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/dashboard/documents"
                                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-2.5 px-5 rounded-xl transition-colors text-sm flex items-center gap-2"
                                    >
                                        <UploadCloud className="w-4 h-4" />
                                        Upload Documents
                                    </Link>
                                    <Link
                                        href="/dashboard/chat"
                                        className="bg-white border border-yellow-200 hover:bg-yellow-50 text-yellow-800 font-bold py-2.5 px-5 rounded-xl transition-colors text-sm flex items-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Reply in Chat
                                    </Link>
                                </div>
                            </div>
                        )}
                        {/* NEEDS ATTENTION BANNER (General) */}
                        {showActionRequired && (!primaryProfile || !primaryProfile.missing_info) && (
                            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4">
                                <div>
                                    <h3 className="text-yellow-800 font-bold text-lg flex items-center gap-2">
                                        Hey, we need something from you.
                                    </h3>
                                    <p className="text-yellow-700 text-sm mt-1">
                                        {hasAdminFlag
                                            ? "We have a question about your filing. Please check your email or chat."
                                            : "Please provide direct deposit details so we can file your return."
                                        }
                                    </p>
                                </div>
                                <Link
                                    href={hasAdminFlag ? "/dashboard/chat" : "/settings/banking"}
                                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-2 px-5 rounded-xl transition-colors text-sm whitespace-nowrap"
                                >
                                    {hasAdminFlag ? "Contact Support" : "Add Banking Info"}
                                </Link>
                            </div>
                        )}

                        {/* Greeting */}
                        <div>
                            <h1 className='text-3xl md:text-4xl font-bold text-gray-900 tracking-tight'>
                                Good afternoon, {firstName}.
                            </h1>
                            <p className='text-xl md:text-2xl text-gray-400 font-light mt-2'>
                                {primaryProfile ? `We’re working on your ${primaryProfile.filing_year || 'tax'} return` : "Let's get started on your tax return"}
                            </p>
                        </div>
                        {/* PROGRESS BAR (Continuous Fill) */}
                        {primaryProfile && primaryProfile.intake_responses && Object.keys(primaryProfile.intake_responses).length > 0 && (
                            <div className='relative bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm flex items-center text-[10px] sm:text-xs md:text-sm font-medium text-gray-400 isolate overflow-hidden'>
                                {/* Animated Background Pill */}
                                <div
                                    className='absolute top-1.5 bottom-1.5 left-1.5 rounded-xl bg-[#4F46E5] shadow-md -z-10 transition-all duration-700 ease-out'
                                    style={{
                                        width: isFiled ? 'calc(100% - 12px)' :
                                            isInReview ? 'calc(75% - 9px)' :
                                                isInProgress ? 'calc(50% - 6px)' :
                                                    'calc(25% - 3px)'
                                    }}
                                />

                                <div className={`flex-1 py-3 md:py-4 text-center transition-colors duration-500 ${isPaid ? 'text-white font-semibold' : ''}`}>
                                    Received
                                </div>
                                <div className={`flex-1 py-3 md:py-4 text-center transition-colors duration-500 ${isInProgress ? 'text-white font-semibold' : ''}`}>
                                    <span className="hidden sm:inline">In </span>Progress
                                </div>
                                <div className={`flex-1 py-3 md:py-4 text-center transition-colors duration-500 ${isInReview ? 'text-white font-semibold' : ''}`}>
                                    Review
                                </div>
                                <div className={`flex-1 py-3 md:py-4 text-center transition-colors duration-500 ${isFiled ? 'text-white font-semibold' : ''}`}>
                                    Filed
                                </div>
                            </div>
                        )}



                        {primaryProfile ? (
                            <div className='space-y-2'>
                                <h2 className='text-xl font-bold text-gray-900'>
                                    {isFiled ? "Your return has been filed." :
                                        s === 'APPROVED' ? "Your return has been approved for filing." :
                                            isInReview ? "Your return is ready for review." :
                                                isInProgress ? "We are working on your return." :
                                                    (s === 'READY_TO_PAY' || (s === 'DRAFT' && primaryProfile.quoted_plan)) ? "Your quote is ready for review." :
                                                        s === 'PAID' ? "Your documents have been received." :
                                                            (primaryProfile.intake_responses && Object.keys(primaryProfile.intake_responses).length > 0) ? "Please finish uploading your documents." :
                                                                "Please complete your tax questionnaire to begin."}
                                </h2>
                                <p className='text-gray-500 italic'>
                                    Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        ) : (
                            <div className="pt-4">
                                <Link
                                    href="/filing/select-profile"
                                    className="inline-flex items-center justify-center gap-2 bg-[#4374D4] hover:bg-[#2952E3] text-white text-lg font-bold py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    <Plus className="w-5 h-5" />
                                    Begin New Tax Return
                                </Link>
                            </div>
                        )}

                        {/* MOBILE ACTION BUTTONS */}
                        <div className="block lg:hidden mt-2">
                            {actionButtons}
                        </div>

                        {/* FILINGS SECTION */}
                        <div className='space-y-6'>
                            <h3 className='text-lg font-bold text-gray-900'>Filings</h3>
                            <div className='bg-white border border-gray-200 rounded-2xl overflow-hidden'>
                                {profiles?.map((profile) => {
                                    const needsBanking = !profile.bank_name && !profile.void_cheque_path
                                    const profStatus = (profile.filing_status || '').toUpperCase()
                                    // Progress Detection Logic
                                    // 1. Identity Verification Missing
                                    const needsVerification = profile.stripe_verification_status !== 'verified'

                                    // 2. Questionnaire Missing
                                    const hasStartedReturn = profile.intake_responses && Object.keys(profile.intake_responses).length > 0

                                    // 3. Documents Missing
                                    const needsDocuments = profile.filing_status === 'draft' && !profile.quoted_plan

                                    // 3b. Quote Review Required
                                    const needsQuoteReview = profile.filing_status === 'draft' && !!profile.quoted_plan

                                    // 4. Payment Missing
                                    const needsPayment = profile.filing_status === 'ready_to_pay'

                                    // Default completed state (paid or later)
                                    const isSubmitted = ['PAID', 'IN_PROGRESS', 'IN_REVIEW', 'APPROVED', 'FILED'].includes(profStatus)

                                    if (!isSubmitted) {
                                        let nextStepText = 'Complete Setup'
                                        let nextStepUrl = `/filing/intake/questionnaire?profileId=${profile.id}`

                                        if (needsVerification) {
                                            nextStepText = 'Verify Identity'
                                            nextStepUrl = `/dashboard/verify-identity?profileId=${profile.id}&returnTo=${encodeURIComponent(`/filing/intake/questionnaire?profileId=${profile.id}`)}`
                                        } else if (!hasStartedReturn) {
                                            nextStepText = 'Start Questionnaire'
                                            nextStepUrl = `/filing/intake/questionnaire?profileId=${profile.id}`
                                        } else if (needsDocuments) {
                                            nextStepText = 'Upload Documents'
                                            nextStepUrl = `/filing/intake/documents?profileId=${profile.id}`
                                        } else if (needsQuoteReview) {
                                            nextStepText = 'Review Quote'
                                            nextStepUrl = `/filing/intake/processing?profileId=${profile.id}`
                                        } else if (needsPayment) {
                                            nextStepText = 'View Quote & Pay'
                                            nextStepUrl = `/filing/intake/review-group`
                                        }

                                        return (
                                            <Link key={profile.id} href={nextStepUrl} className='p-6 border-b border-gray-100 last:border-0 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group'>
                                                <div className='flex flex-col'>
                                                    <span className='text-gray-900 font-bold group-hover:text-blue-600 transition-colors'>{profile.first_name}&rsquo;s {profile.filing_year || '2025'} Tax Return</span>
                                                    <span className='text-gray-500 text-sm'>Incomplete</span>
                                                </div>
                                                <span className='text-blue-600 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-2 group-hover:bg-blue-600 group-hover:text-white shadow-sm transition-all'>
                                                    {nextStepText} <ChevronRight className="w-3 h-3 relative top-[0.5px]" />
                                                </span>
                                            </Link>
                                        )
                                    }

                                    const showNeedsAttention = (needsBanking && ['PAID', 'READY_TO_PAY', 'IN_PROGRESS'].includes(profStatus)) || profStatus === 'ACTION_REQUIRED'

                                    return (
                                        <div key={profile.id} className='p-6 border-b border-gray-100 last:border-0 flex items-center justify-between'>
                                            <span className='text-gray-700 font-medium'>{profile.first_name}&rsquo;s {profile.filing_year ? `${profile.filing_year} Tax Return` : 'Tax Return'}</span>
                                            {/* STATUS BADGE */}
                                            {showNeedsAttention ? (
                                                <span className='text-yellow-800 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-2'>
                                                    Needs Attention
                                                </span>
                                            ) : profStatus === 'PAID' ? (
                                                <span className='text-green-600 font-medium text-sm flex items-center gap-2'>
                                                    <CheckCircle2 className='w-4 h-4' /> Received
                                                </span>
                                            ) : (
                                                <span className={`font-medium text-sm flex items-center gap-2 ${profStatus === 'FILED' ? 'text-green-700' :
                                                    profStatus === 'IN_PROGRESS' ? 'text-blue-600' :
                                                        profStatus === 'IN_REVIEW' ? 'text-purple-600' :
                                                            profStatus === 'APPROVED' ? 'text-teal-600' : 'text-gray-400'
                                                    }`}>
                                                    {profStatus === 'IN_PROGRESS' && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                                                    {profStatus === 'IN_REVIEW' ? 'Ready for Review' :
                                                        profStatus === 'APPROVED' ? 'Approved for filing' :
                                                            profile.filing_status?.replace('_', ' ') || 'Draft'}
                                                </span>
                                            )}
                                        </div>
                                    )
                                })}
                                {(!profiles || profiles.length === 0) && (
                                    <div className='p-6 text-center text-gray-500 text-sm'>
                                        No active filings.
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* MOBILE QUICK LINKS */}
                        <div className="block lg:hidden mt-2">
                            {quickLinks}
                        </div>

                        {/* ACTIVITY FEED */}
                        <div className='space-y-6'>
                            <h3 className='text-lg font-bold text-gray-900'>Activity</h3>
                            <div className='bg-white border border-gray-200 rounded-2xl p-8 min-h-[200px] max-h-none overflow-y-visible md:max-h-[300px] md:overflow-y-auto'>
                                {profiles ? (
                                    <div className='space-y-6'>
                                        {/* Flatten all history items from all profiles and sort */}
                                        {profiles.flatMap(p => {
                                            const items = []
                                            const hasStartedReturn = p.intake_responses && Object.keys(p.intake_responses).length > 0

                                            // 1. Created / Received (Paid)
                                            if (p.created_at) {
                                                items.push({
                                                    id: `created-${p.id}`,
                                                    date: p.created_at,
                                                    text: hasStartedReturn
                                                        ? `Documents Uploaded & Payment Received for ${p.first_name}'s ${p.filing_year || '2025'} return`
                                                        : `Profile created for ${p.first_name}`
                                                })
                                            }
                                            return items
                                        })

                                            // 5. Add History from filing_history table
                                            .concat(history?.map(h => {
                                                const p = profiles?.find(prof => prof.id === h.profile_id)
                                                let text = h.action.replace(/_/g, ' ')
                                                if (h.action === 'REQUEST_INFO') text = `Additional information requested for ${p?.first_name || 'your'} ${p?.filing_year || ''} return`
                                                if (h.action === 'RESOLVE_FLAG') text = `Information received/resolved for ${p?.first_name || 'your'} ${p?.filing_year || ''} return`
                                                if (h.action === 'START_WORK') text = `Tax Professional started filing for ${p?.first_name || 'your'} ${p?.filing_year || ''} return`
                                                if (h.action === 'SEND_REVIEW') text = `Return ready for review for ${p?.first_name || 'your'} ${p?.filing_year || ''} return`
                                                if (h.action === 'CLIENT_APPROVED') text = `Return approved for filing by ${p?.first_name || 'client'}`
                                                if (h.action === 'FILE_RETURN') text = `Tax Return successfully filed for ${p?.first_name || 'your'} ${p?.filing_year || ''} return`

                                                return {
                                                    id: `hist-${h.id}`,
                                                    date: h.created_at,
                                                    text: text
                                                }
                                            }) || [])
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .map(item => (
                                                <div key={item.id} className='grid grid-cols-12 gap-4 animate-in fade-in slide-in-from-left-2'>
                                                    <div className='col-span-3 text-gray-500 font-medium text-sm whitespace-nowrap'>
                                                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        <span className="hidden sm:inline">, {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div className='col-span-9 text-gray-900 font-medium text-sm'>
                                                        {item.text}
                                                    </div>
                                                </div>
                                            ))}

                                        {profiles.length === 0 && <div className='text-gray-400 text-sm'>No activity yet.</div>}
                                    </div>
                                ) : (
                                    <div className='text-gray-400 text-sm'>No activity yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* --- RIGHT COLUMN (Sidebar) --- */}
                    <div className='lg:col-span-4 space-y-6'>

                        {/* DESKTOP Action Buttons */}
                        <div className='hidden lg:block'>
                            {actionButtons}
                        </div>

                        {/* Menu List */}
                        <div className='hidden lg:block'>
                            {quickLinks}
                        </div>

                        {/* Tax Tip Card */}
                        <div className='bg-[#D6D3CD] rounded-2xl p-8 h-80 flex flex-col justify-center relative overflow-hidden'>
                            <span className='text-[10px] font-bold tracking-widest text-gray-600 uppercase mb-4'>Tax Tip</span>
                            <h4 className='text-3xl font-serif text-gray-900 leading-tight'>
                                <span className='italic font-serif'>RRSP</span> contributions before March 1 can reduce your tax bill.
                            </h4>
                            <div className='absolute bottom-8 text-sm text-gray-700 font-medium flex items-center gap-1 cursor-pointer hover:gap-2 transition-all'>
                                Learn more <ChevronRight className='w-4 h-4' />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
