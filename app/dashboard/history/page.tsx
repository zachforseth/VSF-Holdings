import { createClient } from '@/utils/supabase/server'
import { Download, FileText, ChevronLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import DownloadReturnButton from './download-button'

export default async function TaxHistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch profiles that are "filed" or "paid" (completed returns)
    // We treat 'paid', 'filed', 'completed' as history
    const { data: historyProfiles } = await supabase
        .from('tax_profiles')
        .select('*')
        .eq('user_id', user.id)
        .in('filing_status', ['paid', 'filed', 'FILED', 'completed', 'COMPLETED', 'review', 'IN_REVIEW', 'in_review', 'ACTION_REQUIRED', 'action_required', 'IN_PROGRESS', 'in_progress', 'APPROVED', 'approved']) // Support variations in capitalization
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-[#FCFCFC] pb-20">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        Tax History
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        View and download your past tax returns.
                    </p>
                </div>

                {/* History List Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {historyProfiles && historyProfiles.length > 0 ? (
                        historyProfiles.map((profile) => {
                            // Safely handle potential missing columns
                            // Note: We use 'any' cast for profile if types aren't fully generated yet, 
                            // or simple property access if we trust the select('*')
                            const p = profile as any
                            const amount = p.refund_amount || p.balance_owing || 0
                            const isRefund = !!p.refund_amount && p.refund_amount > 0
                            const type = isRefund ? 'Refund' : (p.balance_owing > 0 ? 'Owed' : 'N/A')
                            const year = p.filing_year || '' // Default to empty string if missing
                            const date = new Date(p.updated_at || p.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })

                            // Humanize status
                            const statusMap: Record<string, string> = {
                                'paid': 'Received',
                                'review': 'In Review',
                                'IN_REVIEW': 'In Review',
                                'in_review': 'In Review',
                                'ACTION_REQUIRED': 'Action Required',
                                'action_required': 'Action Required',
                                'IN_PROGRESS': 'In Progress',
                                'in_progress': 'In Progress',
                                'filed': 'Filed',
                                'FILED': 'Filed',
                                'completed': 'Filed',
                                'COMPLETED': 'Filed',
                                'APPROVED': 'Approved for E-Filing',
                                'approved': 'Approved for E-Filing'
                            }
                            const displayStatus = statusMap[p.filing_status] || p.filing_status || 'In Progress'

                            const isFiledState = (p.filing_status || '').toLowerCase() === 'filed' || (p.filing_status || '').toLowerCase() === 'completed';

                            return (
                                <div
                                    key={profile.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 gap-4 sm:gap-0"
                                >
                                    {/* Left: Year & Date */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#4374D4] shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{year} Tax Return</h3>
                                            <p className="text-sm text-gray-500">{date}</p>
                                        </div>
                                    </div>

                                    {/* Middle: Amount */}
                                    <div className="flex-1 sm:text-center sm:pl-8">
                                        {/* Only show if we actually have a non-zero amount recorded */}
                                        {amount !== 0 ? (
                                            <span className={`font-medium text-lg ${isRefund ? 'text-green-600' : 'text-gray-900'}`}>
                                                {isRefund ? '+' : ''}{Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('.00', '')}
                                                <span className="text-sm font-normal text-gray-500 ml-1">
                                                    ({type})
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">Amount pending</span>
                                        )}
                                    </div>

                                    {/* Right: Status & Action */}
                                    <div className="flex items-center gap-4 sm:justify-end">
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 ${isFiledState ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${isFiledState ? 'bg-green-600' : 'bg-blue-600'}`}></div>
                                            {displayStatus}
                                        </div>

                                        {/* Download Button */}
                                        {isFiledState && p.final_return_path && (
                                            <DownloadReturnButton profileId={p.id} fileName={`Final_Return_${year}.pdf`} />
                                        )}
                                        {isFiledState && !p.final_return_path && (
                                            <button disabled className="p-2 text-gray-300 rounded-full transition-all" title="Return processing...">
                                                <Download className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                            <div className="bg-gray-100 p-4 rounded-full mb-4">
                                <AlertCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">No tax history found</h3>
                            <p className="max-w-xs mx-auto mt-1">Once you file a return with us, it will appear here.</p>

                            <Link href="/filing/select-profile" className="mt-6 bg-[#4374D4] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#3460b5] transition-colors">
                                Start a Return
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
