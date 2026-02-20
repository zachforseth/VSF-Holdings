import Link from 'next/link'
import { getAdminProfileDetails, getProfileMessages } from '@/app/actions/admin-actions'

export const dynamic = 'force-dynamic'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import AdminChatInterface from './chat-component'
import ActionButtons from './action-buttons'
import IntakeResponsesViewer from './intake-viewer'
import DocumentsList from './documents-list'
import AdminNotes from './admin-notes'
import AdminPaymentLinks from './admin-payment-links'

function JsonViewer({ data }: { data: any }) {
    if (!data) return <span className="text-gray-400 italic">No data</span>

    return (
        <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-gray-200">
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    )
}

export default async function AdminFilingWorkspace({
    params
}: {
    params: Promise<{ profile_id: string }>
}) {
    const { profile_id } = await params
    const { success, profile, documents, userEmail, error } = await getAdminProfileDetails(profile_id)
    const messagesResult = await getProfileMessages(profile_id)
    const messages = messagesResult.messages || []

    if (!success || !profile) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Error loading profile: {error}</p>
                <Link href="/admin/dashboard" className="text-blue-600 hover:underline mt-4 block">
                    &larr; Back to Dashboard
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            {/* HEADER (Fixed) */}
            <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex-shrink-0 z-10">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href={`/admin/dashboard/${profile.user_id}`} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-1 text-xs font-medium uppercase tracking-wide">
                            <ArrowLeft className="w-3 h-3" />
                            Back to Account
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-gray-900">
                                {profile.first_name} {profile.last_name} {profile.filing_year ? `(${profile.filing_year})` : ''}
                            </h1>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border capitalize ${profile.filing_status === 'ACTION_REQUIRED' ? 'bg-red-50 text-red-700 border-red-200' :
                                profile.filing_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                                    'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                {profile.filing_status?.replace('_', ' ') || 'Draft'}
                            </span>
                        </div>
                    </div>

                    <ActionButtons
                        profileId={profile.id}
                        status={profile.filing_status || ''}
                        hasMissingInfo={!!profile.missing_info}
                        initialRefund={profile.refund_amount}
                        initialOwing={profile.balance_owing}
                        finalReturnPath={profile.final_return_path}
                    />
                </div>
            </div>

            {/* MAIN CONTENT (Scrollable Split View) */}
            <div className="flex-1 overflow-hidden">
                <div className="max-w-[1600px] mx-auto h-full flex flex-col lg:flex-row">

                    {/* LEFT COLUMN: Data & Documents (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 lg:border-r border-gray-200 bg-white">


                        {/* Documents List */}
                        <DocumentsList documents={documents || []} userId={profile.user_id} profileId={profile.id} finalReturnPath={profile.final_return_path} />

                        {/* Payment Links */}
                        <AdminPaymentLinks profileId={profile.id} quotedPlan={profile.quoted_plan} quotedPrice={profile.quoted_price} filingStatus={profile.filing_status || ''} paymentId={profile.payment_id} balanceOwing={profile.balance_owing} />

                        {/* Intake Data */}
                        <IntakeResponsesViewer data={profile.intake_responses} profile={profile} />
                    </div>

                    {/* RIGHT COLUMN: Chat & Tools (Fixed width or percent) */}
                    <div className="lg:w-[450px] flex-shrink-0 bg-gray-50 p-6 border-l border-gray-200 h-full overflow-y-auto flex flex-col gap-6">
                        <AdminChatInterface
                            profileId={profile.id}
                            initialMessages={messages}
                            userEmail={userEmail || 'User'}
                        />

                        <AdminNotes
                            profileId={profile.id}
                            initialNotes={profile.admin_notes}
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}
