'use client'

import { useState } from 'react'
import { updateReturnAmounts } from '@/app/actions/admin-actions'

export default function ReturnAmountsInput({
    profileId,
    initialRefund,
    initialOwing
}: {
    profileId: string,
    initialRefund: number | null,
    initialOwing: number | null
}) {
    // Keep internal local state as strings so we can represent empty inputs cleanly
    const [refund, setRefund] = useState(initialRefund?.toString() || '')
    const [owing, setOwing] = useState(initialOwing?.toString() || '')
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState('')

    const handleSave = async () => {
        setIsSaving(true)
        setMessage('')

        const r = refund.trim() ? parseFloat(refund) : null
        const o = owing.trim() ? parseFloat(owing) : null

        const res = await updateReturnAmounts(profileId, r, o)
        if (res.success) {
            setMessage('Saved successfully.')
            setTimeout(() => setMessage(''), 3000)
        } else {
            setMessage('Failed to save.')
        }
        setIsSaving(false)
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 tracking-tight">Return Amounts</h3>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Refund Amount ($)
                    </label>
                    <input
                        type="number"
                        value={refund}
                        onChange={(e) => setRefund(e.target.value)}
                        placeholder="0.00"
                        className="w-full text-sm font-medium border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-green-700"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Amount Owing ($)
                    </label>
                    <input
                        type="number"
                        value={owing}
                        onChange={(e) => setOwing(e.target.value)}
                        placeholder="0.00"
                        className="w-full text-sm font-medium border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-red-700"
                    />
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <span className={`text-xs font-semibold ${message.includes('Save') ? 'text-green-600' : 'text-red-500'}`}>
                    {message}
                </span>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#4374D4] hover:bg-[#3460b5] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save Amounts'}
                </button>
            </div>
        </div>
    )
}
