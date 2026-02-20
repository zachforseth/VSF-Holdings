import Link from 'next/link'
import { getAdminUserDetails } from '@/app/actions/admin-actions'
import { ArrowLeft, User, FileText, Calendar, DollarSign } from 'lucide-react'
import { redirect } from 'next/navigation'
import CreateProfileButton from './create-profile-button'

export default async function AdminAccountDetail({
    params
}: {
    params: Promise<{ account_id: string }>
}) {
    const { account_id } = await params
    const { success, user, profiles, error } = await getAdminUserDetails(account_id)

    if (!success || !user) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Error loading user details: {error}</p>
                <Link href="/admin/dashboard" className="text-blue-600 hover:underline mt-4 block">
                    &larr; Back to Dashboard
                </Link>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Accounts
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Account Details
                </h1>
                <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg w-fit">
                    <User className="w-4 h-4" />
                    <span className="font-mono text-sm">{user.email}</span>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center bg-transparent">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        Associated Profiles ({profiles?.length || 0})
                    </h2>
                    <div className="flex items-center gap-3">
                        <Link href={`/admin/dashboard/${account_id}/new-filing`} className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
                            <Calendar className="w-4 h-4" />
                            New Filing
                        </Link>
                        <CreateProfileButton userId={user.id} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profiles?.map((profile) => (
                        <Link
                            key={profile.id}
                            href={`/admin/filing/${profile.id}`}
                            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group block"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {profile.first_name} {profile.last_name}
                                    </h3>
                                    <p className="text-sm text-gray-500">{profile.filing_year ? `${profile.filing_year} Return` : 'Return'}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${profile.filing_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                                    profile.filing_status === 'action_required' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}>
                                    {profile.filing_status || 'Draft'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>Created: {new Date(profile.created_at).toLocaleDateString()}</span>
                                </div>
                                {profile.final_fee && (
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <span>Fee: ${profile.final_fee}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                <span className="text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                    Open Workspace &rarr;
                                </span>
                            </div>
                        </Link>
                    ))}

                    {(!profiles || profiles.length === 0) && (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                            No profiles found for this account.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
