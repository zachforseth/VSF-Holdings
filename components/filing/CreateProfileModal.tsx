'use client'

import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Loader2 } from 'lucide-react'
import { createTaxProfile } from '@/app/actions/profile-actions'
import { useRouter } from 'next/navigation'

interface CreateProfileModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function CreateProfileModal({ isOpen, onClose }: CreateProfileModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)

        try {
            await createTaxProfile(formData)
            // If successful, it redirects, so we don't need to do anything here
            // The component will unmount.
        } catch (e: any) {
            // Next.js Redirect throws an error, we need to let it bubble up
            if (e.message === 'NEXT_REDIRECT' || e.digest?.startsWith('NEXT_REDIRECT')) {
                throw e
            }

            console.error('Profile creation error:', e)
            setError(e.message || 'Failed to create profile')
            setIsLoading(false)
        }
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-bold leading-6 text-gray-900"
                                    >
                                        Create New Profile
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <form action={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            id="firstName"
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                            placeholder="Jane"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            id="lastName"
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                            placeholder="Doe"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            name="dob"
                                            id="dob"
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">
                                            Relationship
                                        </label>
                                        <select
                                            id="relationship"
                                            name="relationship"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                            defaultValue="Spouse"
                                        >
                                            <option>Spouse</option>
                                            <option>Dependent</option>
                                            <option>Other</option>
                                            <option>Self</option>
                                        </select>
                                    </div>

                                    {error && (
                                        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                                            {error}
                                        </div>
                                    )}

                                    <div className="mt-6">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="inline-flex justify-center w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                'Create Profile'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
