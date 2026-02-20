import Link from 'next/link'
import { getAdminDashboardData } from '@/app/actions/admin-actions'
import { CheckCircle2, AlertCircle, Clock, Search, FileText } from 'lucide-react'
import CreateClientModal from './create-client-modal'

export default async function AdminDashboard({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const { status } = await searchParams
    const { success, users, filteredProfiles, actionNeededProfiles, error } = await getAdminDashboardData(status)

    if (!success) {
        return (
            <div className="p-8 text-center text-red-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                Error loading admin data: {error}
            </div>
        )
    }

    const isFiltered = !!status

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isFiltered ? `${status.charAt(0) + status.slice(1).toLowerCase()} Filings` : 'User Accounts'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isFiltered ? `Viewing all filings currently in ${status.toLowerCase()} status.` : 'Manage users and view their filing status.'}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <CreateClientModal />
                    {status && (
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-tight">Filtering: {status}</span>
                            <Link href="/admin/dashboard" className="text-blue-400 hover:text-blue-600">
                                <AlertCircle className="w-4 h-4 rotate-45" />
                            </Link>
                        </div>
                    )}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search filings or users..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </header>



            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4">{isFiltered ? 'Filing Name' : 'User'}</th>
                            <th className="px-6 py-4">{isFiltered ? 'Client' : 'Status'}</th>
                            <th className="px-6 py-4">{isFiltered ? 'Status' : 'Profiles'}</th>
                            <th className="px-6 py-4">{isFiltered ? 'Updated' : 'Joined'}</th>
                            <th className="px-6 py-4 not-sr-only"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isFiltered ? (
                            // FILINGS WORKLIST VIEW
                            filteredProfiles?.map((profile) => (
                                <tr key={profile.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="font-bold text-gray-900">
                                                {profile.first_name}&rsquo;s {profile.filing_year ? `${profile.filing_year} Return` : 'Return'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {profile.userEmail}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${profile.filing_status === 'FILED' ? 'bg-green-50 text-green-700 border border-green-100' :
                                            profile.filing_status === 'APPROVED' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                                                profile.filing_status === 'IN_REVIEW' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                                    profile.filing_status === 'IN_PROGRESS' || profile.filing_status === 'ACTION_REQUIRED' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                        'bg-gray-50 text-gray-600 border border-gray-200'
                                            }`}>
                                            {profile.filing_status?.replace('_', ' ') || 'New'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(profile.updated_at || profile.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/filing/${profile.id}`}
                                            className="text-purple-600 hover:text-purple-800 font-bold text-sm hover:underline"
                                        >
                                            Go to Filing &rarr;
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // STANDARD USER ACCOUNTS VIEW
                            users?.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {user.email?.charAt(0).toUpperCase()}
                                                </div>
                                                {user.hasUnread && (
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.email}</div>
                                                <div className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.profiles.length > 0 ? (
                                                Array.from(new Set(user.profiles.map(p => p.filing_status))).map((s: string) => (
                                                    <span key={s} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s === 'FILED' ? 'bg-green-50 text-green-700 border border-green-100' :
                                                        s === 'APPROVED' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                                                            s === 'IN_REVIEW' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                                                s === 'IN_PROGRESS' || s === 'ACTION_REQUIRED' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                                    'bg-gray-50 text-gray-600 border border-gray-200'
                                                        }`}>
                                                        {s?.replace('_', ' ') || 'New'}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No Filings</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium">{user.profile_count} Profile{user.profile_count !== 1 && 's'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/dashboard/${user.id}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                                        >
                                            View Details &rarr;
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {((!isFiltered && (!users || users.length === 0)) || (isFiltered && (!filteredProfiles || filteredProfiles.length === 0))) && (
                    <div className="p-12 text-center text-gray-500">
                        {status ? `No users found with filings in ${status} status.` : 'No users found.'}
                        {status && (
                            <div className="mt-4">
                                <Link href="/admin/dashboard" className="text-blue-600 font-bold hover:underline">
                                    Clear Filter
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
