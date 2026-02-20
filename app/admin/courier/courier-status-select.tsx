'use client'

import { useState } from 'react'
import { updateCourierJobStatus } from '@/app/actions/admin-actions'
import { Check, Loader2, RefreshCw } from 'lucide-react'

const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'courier_on_the_way', label: 'Courier on the way' },
    { value: 'courier_picked_up', label: 'Courier picked up' },
    { value: 'documents_delivered', label: 'Documents delivered' }
]

export default function CourierStatusSelect({ jobId, currentStatus }: { jobId: string, currentStatus: string }) {
    const [isUpdating, setIsUpdating] = useState(false)
    const [status, setStatus] = useState(currentStatus)

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true)
        setStatus(newStatus)
        const result = await updateCourierJobStatus(jobId, newStatus)
        if (!result.success) {
            // Revert on failure
            setStatus(currentStatus)
            alert('Failed to update status')
        }
        setIsUpdating(false)
    }

    return (
        <div className="relative">
            <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                className={`text-sm rounded-lg border-gray-300 py-2 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white 
                    ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${status === 'documents_delivered' ? 'border-green-300 bg-green-50 text-green-700 font-medium' :
                        status === 'courier_picked_up' ? 'border-blue-300 bg-blue-50 text-blue-700 font-medium' :
                            status === 'courier_on_the_way' ? 'border-purple-300 bg-purple-50 text-purple-700 font-medium' :
                                'border-gray-200 text-gray-700'
                    }`}
            >
                {statuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                {isUpdating ? (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                ) : (
                    <RefreshCw className={`w-3 h-3 ${status === 'pending' ? 'text-gray-400' : 'text-blue-500'}`} />
                )}
            </div>
        </div>
    )
}
