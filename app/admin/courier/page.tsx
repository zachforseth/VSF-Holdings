import { getCourierJobs } from '@/app/actions/admin-actions'
import { FileText, AlertCircle, Clock, MapPin, Truck, CheckCircle2, PackageCheck } from 'lucide-react'
import CourierStatusSelect from './courier-status-select'
import Link from 'next/link'

export default async function CourierAdminPage({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const { status } = await searchParams
    const { success, jobs, error } = await getCourierJobs(status)

    if (!success) {
        return (
            <div className="p-8 text-center text-red-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                Error loading courier jobs: {error}
            </div>
        )
    }

    const { jobs: allJobs } = await getCourierJobs()
    const stats = {
        pending: allJobs?.filter(j => !j.delivery_status || j.delivery_status === 'pending').length || 0,
        enRoute: allJobs?.filter(j => j.delivery_status === 'courier_on_the_way').length || 0,
        pickedUp: allJobs?.filter(j => j.delivery_status === 'courier_picked_up').length || 0,
        delivered: allJobs?.filter(j => j.delivery_status === 'documents_delivered').length || 0,
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Courier Pickups</h1>
                    <p className="text-gray-500 mt-1">Manage paid, scheduled secure document pickups.</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
                    <Link
                        href="/admin/courier"
                        className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${!status ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                    >
                        All ({allJobs?.length || 0})
                    </Link>
                    <Link
                        href="/admin/courier?status=pending"
                        className={`px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${status === 'pending' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                    >
                        Pending <span className="bg-gray-200 text-gray-700 py-0.5 px-2 rounded-full text-xs">{stats.pending}</span>
                    </Link>
                    <Link
                        href="/admin/courier?status=courier_on_the_way"
                        className={`px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${status === 'courier_on_the_way' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
                    >
                        <Truck className="w-4 h-4" />
                        On the way <span className="bg-purple-100 text-purple-700 py-0.5 px-2 rounded-full text-xs">{stats.enRoute}</span>
                    </Link>
                    <Link
                        href="/admin/courier?status=courier_picked_up"
                        className={`px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${status === 'courier_picked_up' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                    >
                        <PackageCheck className="w-4 h-4" />
                        Picked Up <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs">{stats.pickedUp}</span>
                    </Link>
                    <Link
                        href="/admin/courier?status=documents_delivered"
                        className={`px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${status === 'documents_delivered' ? 'bg-white shadow-sm text-green-700' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'}`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Delivered <span className="bg-green-100 text-green-700 py-0.5 px-2 rounded-full text-xs">{stats.delivered}</span>
                    </Link>
                </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Pickup Address</th>
                            <th className="px-6 py-4">Scheduled For</th>
                            <th className="px-6 py-4">Payment</th>
                            <th className="px-6 py-4">Delivery Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {jobs?.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No {status ? status.replace(/_/g, ' ') : ''} paid courier pickups found.
                                </td>
                            </tr>
                        ) : (
                            jobs?.map((job) => (
                                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-sm">
                                            <span className="font-bold text-gray-900">{job.full_name}</span>
                                            <span className="text-gray-500">{job.email}</span>
                                            <span className="text-gray-500">{job.phone}</span>
                                            {job.courier_notes && (
                                                <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                                                    <span className="font-bold">Notes:</span> {job.courier_notes}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                            <div className="text-sm text-gray-700 max-w-[250px] whitespace-normal">
                                                {job.pickup_address}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium whitespace-nowrap">{job.scheduled_time || 'Not Scheduled'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                                            PAID
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <CourierStatusSelect jobId={job.id} currentStatus={job.delivery_status || 'pending'} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
