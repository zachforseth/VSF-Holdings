import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ChevronRight, CheckCircle2, Clock } from 'lucide-react';

export default async function ReviewListPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Fetch all profiles for the user
    const { data: profiles } = await supabase
        .from('tax_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-[#FCFCFC] pb-20">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Review Your Filings</h1>
                        <p className="text-gray-500 mt-2 text-lg">Select a profile to review completed returns and provide approval.</p>
                    </div>
                </div>

                {/* Profiles List */}
                <div className="grid gap-6">
                    {profiles && profiles.length > 0 ? (
                        profiles.map((profile) => {
                            const isReady = profile.filing_status?.toUpperCase() === 'IN_REVIEW';
                            const isApproved = profile.filing_status?.toUpperCase() === 'APPROVED';
                            const isFiled = profile.filing_status?.toUpperCase() === 'FILED';
                            const statusDisplay = profile.filing_status?.replace('_', ' ') || 'Processing';

                            return (
                                <Link
                                    key={profile.id}
                                    href={`/dashboard/review/${profile.id}`}
                                    className={`group rounded-3xl border p-8 flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-200 ${isReady ? 'border-gray-100 bg-white hover:border-purple-200 hover:ring-1 hover:ring-purple-100 hover:bg-purple-50/50' : isApproved ? 'border-gray-100 bg-white hover:border-teal-200 hover:ring-1 hover:ring-teal-100 hover:bg-teal-50/50' : isFiled ? 'border-gray-100 bg-white hover:border-green-200 hover:ring-1 hover:ring-green-100 hover:bg-green-50/50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div>
                                            {profile.first_name}&rsquo;s {profile.filing_year ? `${profile.filing_year} Return` : 'Return'}
                                            <div className="flex items-center gap-3 mt-1">
                                                {isReady ? (
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest">
                                                        Ready for Review
                                                    </span>
                                                ) : isApproved ? (
                                                    <span className="text-sm font-bold uppercase tracking-wider text-teal-600">
                                                        Approved for Filing
                                                    </span>
                                                ) : isFiled ? (
                                                    <span className="text-sm font-bold uppercase tracking-wider text-green-600">
                                                        Filed
                                                    </span>
                                                ) : (
                                                    <span className="text-sm font-bold uppercase tracking-wider text-gray-400">
                                                        {statusDisplay}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 md:mt-0 flex items-center gap-4">
                                        {isReady ? (
                                            <div className="flex items-center gap-2 text-purple-700 font-bold text-sm bg-purple-50 px-4 py-2 rounded-xl">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Click to Review
                                            </div>
                                        ) : isApproved ? (
                                            <div className="flex items-center gap-2 text-teal-700 font-bold text-sm bg-teal-50 px-4 py-2 rounded-xl">
                                                <Clock className="w-4 h-4" />
                                                Waiting to be e-filed
                                            </div>
                                        ) : isFiled ? (
                                            <div className="flex items-center gap-2 text-green-700 font-bold text-sm bg-green-50 px-4 py-2 rounded-xl">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Return Filed
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-400 font-bold text-sm bg-gray-50 px-4 py-2 rounded-xl">
                                                <Clock className="w-4 h-4" />
                                                In Progress
                                            </div>
                                        )}
                                        <ChevronRight className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${isReady ? 'text-purple-400' : isApproved ? 'text-teal-400' : isFiled ? 'text-green-500' : 'text-gray-300'}`} />
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-500">No filings found.</h3>
                            <p className="text-gray-400 mt-1">You haven&rsquo;t started any tax returns yet.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
