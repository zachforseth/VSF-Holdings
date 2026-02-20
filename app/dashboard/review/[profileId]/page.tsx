import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ChevronLeft, HelpCircle, Clock, ExternalLink, CheckCircle2 } from 'lucide-react';
import { approveClientFiling } from '@/app/actions/filing-actions';

export default async function ProfileReviewPage({ params }: { params: Promise<{ profileId: string }> }) {
    const { profileId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Fetch the specific profile
    const { data: profile } = await supabase
        .from('tax_profiles')
        .select('*')
        .eq('id', profileId)
        .eq('user_id', user.id)
        .single();

    if (!profile) return notFound();

    const isReady = profile.filing_status?.toUpperCase() === 'IN_REVIEW';
    const isApproved = profile.filing_status?.toUpperCase() === 'APPROVED';
    const isFiled = profile.filing_status?.toUpperCase() === 'FILED';

    // STATE: FILED
    if (isFiled) {
        return (
            <div className="min-h-screen bg-[#FCFCFC] pt-12 pb-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 md:p-16">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                            Status: SUCCESSFULLY FILED
                        </h1>
                        <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                            This return has been successfully e-filed to the CRA. No further action is required from you at this time.
                        </p>
                        <Link
                            href="/dashboard/review"
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            Back to Review List
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // STATE: APPROVED
    if (isApproved) {
        return (
            <div className="min-h-screen bg-[#FCFCFC] pt-12 pb-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 md:p-16">
                        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-teal-500" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                            Status: APPROVED FOR FILING
                        </h1>
                        <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                            This return has been approved for e-filing to the CRA. We will notify you when it has been successfully e-filed.
                        </p>
                        <Link
                            href="/dashboard/review"
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            Back to Review List
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // STATE A: NOT READY
    if (!isReady) {
        return (
            <div className="min-h-screen bg-[#FCFCFC] pt-12 pb-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Removed Back to Review List link from above the card */}

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 md:p-16">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-gray-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                            Status: {profile.filing_status?.replace('_', ' ') || 'Processing'}
                        </h1>
                        <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                            This return is not currently ready for review. We will notify you when it's ready for your final approval.
                        </p>
                        <Link
                            href="/dashboard/review"
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            Back to Review List
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // STATE B: READY FOR REVIEW
    return (
        <div className="min-h-screen bg-[#FCFCFC] pt-8 pb-24 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/dashboard/review" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Review & Approve: {profile.first_name}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8 items-start">
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Status</h2>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-purple-600">Ready for Review</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                                Please use the link to review the final documents and provide your approval so we can e-file to the CRA.
                            </p>
                        </div>

                        {/* Instructions Card */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Instructions</h3>
                            <ul className="space-y-4 text-sm text-gray-600">
                                <li className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex-shrink-0 flex items-center justify-center font-bold text-[10px]">1</div>
                                    <span>Click the <strong>"Open Review Link"</strong> button to open your return in DocuSign.</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex-shrink-0 flex items-center justify-center font-bold text-[10px]">2</div>
                                    <span>Carefully review all pages of your tax return summary and general return.</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex-shrink-0 flex items-center justify-center font-bold text-[10px]">3</div>
                                    <span>Electronically sign where indicated if everything looks correct.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Action Bar */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-32">
                        <h3 className="font-bold text-gray-900 mb-1">Ready to Approve?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Provide your electronic signature via our secure partner to authorize filing.
                        </p>

                        <div className="space-y-3">
                            {profile.review_link ? (
                                <a
                                    href={profile.review_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-purple-600 text-white rounded-xl py-3.5 font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    Open Review Link
                                </a>
                            ) : (
                                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-800 text-sm text-center">
                                    Review link is being prepared. Please check back in a moment or contact chat.
                                </div>
                            )}

                            {profile.review_link && (
                                <form action={async () => {
                                    'use server'
                                    await approveClientFiling(profile.id)
                                }}>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                                    >
                                        I&apos;ve Signed & Approved
                                    </button>
                                </form>
                            )}

                            <Link
                                href="/dashboard/chat"
                                className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl py-3.5 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <HelpCircle className="w-5 h-5" />
                                I have a question
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
