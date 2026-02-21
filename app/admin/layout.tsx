import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, FileText, Settings, ShieldAlert, Clock, Search, CheckCircle2 } from 'lucide-react'
import { getAdminDashboardData } from '@/app/actions/admin-actions'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // SECURITY: Check for 'admin' role in public.users using the authenticated user's credentials
    const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = userProfile?.role
    const email = (user.email || '').toLowerCase()

    // Check role and domain
    const isAdmin = role === 'admin' && email.endsWith('@vsfholdings.com')

    if (!isAdmin) {
        console.warn(`[ADMIN LAYOUT] Unauthorized access attempt by ${email} (Role: ${role})`)
        return redirect('/dashboard') // Send them back to their dashboard
    }

    const { stats } = await getAdminDashboardData()

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold tracking-wider flex items-center gap-3">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 38 38"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="shrink-0"
                        >
                            <g clipPath="url(#clip0_VSF_admin)">
                                <path d="M11.0787 0H0V38H11.0787V0Z" fill="#4374D4" />
                                <path d="M24.5397 0H13.4609V38H24.5397V0Z" fill="#7297DF" />
                                <path d="M37.9996 0H26.9209V38H37.9996V0Z" fill="#A0B9EA" />
                            </g>
                            <defs>
                                <clipPath id="clip0_VSF_admin">
                                    <rect width="38" height="38" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        ADMIN
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Navigation
                    </div>
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                    >
                        <Users className="w-5 h-5" />
                        Users & Accounts
                    </Link>
                    <Link
                        href="/admin/courier"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                    >
                        <FileText className="w-5 h-5" />
                        Courier Pickups
                    </Link>

                    {/* Workload Stats Section */}
                    <div className="pt-6">
                        <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Workload Breakdown
                        </div>
                        <div className="space-y-1">
                            <Link href="/admin/dashboard?status=WAITING" className="flex items-center justify-between px-4 py-2 text-sm text-gray-400 group hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                                    <span>Waiting</span>
                                </div>
                                <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded text-gray-300 group-hover:bg-slate-700">
                                    {stats?.waiting || 0}
                                </span>
                            </Link>
                            <Link href="/admin/dashboard?status=IN_PROGRESS" className="flex items-center justify-between px-4 py-2 text-sm text-gray-400 group hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border-2 border-blue-500/30 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                    </div>
                                    <span>In Progress</span>
                                </div>
                                <span className="font-mono text-xs bg-blue-500/10 px-2 py-0.5 rounded text-blue-400 group-hover:bg-blue-500/20">
                                    {stats?.inProgress || 0}
                                </span>
                            </Link>
                            <Link href="/admin/dashboard?status=IN_REVIEW" className="flex items-center justify-between px-4 py-2 text-sm text-gray-400 group hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <Search className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                                    <span>In Review</span>
                                </div>
                                <span className="font-mono text-xs bg-purple-500/10 px-2 py-0.5 rounded text-purple-400 group-hover:bg-purple-500/20">
                                    {stats?.inReview || 0}
                                </span>
                            </Link>
                            <Link href="/admin/dashboard?status=APPROVED" className="flex items-center justify-between px-4 py-2 text-sm text-gray-400 group hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-teal-400 group-hover:text-teal-300" />
                                    <span>Approved</span>
                                </div>
                                <span className="font-mono text-xs bg-teal-500/10 px-2 py-0.5 rounded text-teal-400 group-hover:bg-teal-500/20">
                                    {stats?.approved || 0}
                                </span>
                            </Link>
                            <Link href="/admin/dashboard?status=COMPLETED" className="flex items-center justify-between px-4 py-2 text-sm text-gray-400 group hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-green-400 group-hover:text-green-300" />
                                    <span>Completed</span>
                                </div>
                                <span className="font-mono text-xs bg-green-500/10 px-2 py-0.5 rounded text-green-400 group-hover:bg-green-500/20">
                                    {stats?.completed || 0}
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Action Needed Section */}
                    {(stats?.actionNeeded || 0) > 0 && (
                        <div className="mt-6">
                            <div className="px-4 py-2 text-[10px] font-bold text-red-500/70 uppercase tracking-widest">
                                Attention Required
                            </div>
                            <Link href="/admin/dashboard?status=ACTION_NEEDED" className="flex items-center justify-between px-4 py-2 text-sm text-red-400 bg-red-500/5 group hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors mx-2 border border-red-500/20">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert className="w-4 h-4 text-red-500" />
                                    <span className="font-bold">Action Needed</span>
                                </div>
                                <span className="font-mono text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                                    {stats?.actionNeeded || 0}
                                </span>
                            </Link>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                            {email.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm overflow-hidden">
                            <p className="font-medium text-white truncate w-32" title={email}>{email}</p>
                            <p className="text-slate-400 text-xs">Admin</p>
                        </div>
                    </div>

                    <form action={async () => {
                        'use server'
                        // Dynamic import to avoid circular dependency issues if any, though regular import is fine here 
                        // since layout is server component
                        const { logout } = await import('@/app/login/actions')
                        await logout()
                    }}>
                        <button
                            type="submit"
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 rounded transition-colors flex items-center gap-2"
                        >
                            Log Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div >
    )
}
