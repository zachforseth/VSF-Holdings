'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2 } from 'lucide-react'
import { adminCreateClientAccount } from '@/app/actions/admin-actions'

export default function CreateClientModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        const res = await adminCreateClientAccount(formData)
        setIsSubmitting(false)

        if (res.success && res.userId) {
            setIsOpen(false)
            router.push(`/admin/dashboard/${res.userId}`)
        } else {
            alert('Failed to create client: ' + res.error)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
            >
                <Plus className="w-4 h-4" />
                New Client
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Create New Client</h2>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form action={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">First Name</label>
                                    <input type="text" name="firstName" required className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Last Name</label>
                                    <input type="text" name="lastName" required className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                <input type="email" name="email" required className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="client@example.com" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Temporary Password</label>
                                <input type="text" name="password" required defaultValue="Welcome123!" className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 flex justify-center items-center gap-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
