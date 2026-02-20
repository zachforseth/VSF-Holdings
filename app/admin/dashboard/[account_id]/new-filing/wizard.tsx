'use client'

import { useState } from 'react'
import { adminCreateChildFiling } from '@/app/actions/admin-actions'
import { Calendar, User, ArrowRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NewFilingWizard({ profiles, accountId }: { profiles: any[], accountId: string }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Determine unique individuals based on SIN (or name combination as fallback)
    const uniquePeopleMap = new Map()
    profiles.forEach(p => {
        const key = p.sin || `${p.first_name}-${p.last_name}`
        if (!uniquePeopleMap.has(key)) {
            uniquePeopleMap.set(key, p)
        }
    })
    const uniquePeople = Array.from(uniquePeopleMap.values())

    // If there is only 1 unique person, auto-select them. Otherwise, null.
    const [selectedPerson, setSelectedPerson] = useState<any>(uniquePeople.length === 1 ? uniquePeople[0] : null)

    const years = [2025, 2024, 2023, 2022, 2021, 2020]

    // Determine what years they have already filed for
    const filedYearsForSelected = selectedPerson
        ? profiles
            .filter(p => (p.sin && p.sin === selectedPerson.sin) || (p.first_name === selectedPerson.first_name && p.last_name === selectedPerson.last_name))
            .map(p => Number(p.filing_year))
        : []

    const handleCreateFiling = async (year: number) => {
        if (!selectedPerson) return
        setIsSubmitting(true)
        const res = await adminCreateChildFiling(selectedPerson.id, year.toString())
        if (res.success && res.newProfileId) {
            router.push(`/admin/filing/${res.newProfileId}`)
        } else {
            console.error("Failed to clone profile", res.error)
            alert("Error creating filing: " + res.error)
            setIsSubmitting(false)
        }
    }

    if (!selectedPerson) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    Step 1: Select Profile
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {uniquePeople.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPerson(p)}
                            className="text-left flex items-center justify-between p-6 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-blue-50 hover:border-blue-500 hover:shadow-md transition-all group"
                        >
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors text-lg">
                                    {p.first_name} {p.last_name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">SIN: ••• ••• {p.sin?.slice(-3) || 'N/A'}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors group-hover:translate-x-1" />
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-4">
            {uniquePeople.length > 1 && (
                <button
                    onClick={() => setSelectedPerson(null)}
                    className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-6"
                >
                    &larr; Back to profile selection
                </button>
            )}

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-bold text-blue-900">{selectedPerson.first_name} {selectedPerson.last_name}</h3>
                    <p className="text-sm text-blue-700">Select the tax year to generate a new filing for this profile.</p>
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                {uniquePeople.length > 1 ? 'Step 2: ' : ''}Select Tax Year
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {years.map(y => {
                    const isFiled = filedYearsForSelected.includes(y)
                    return (
                        <button
                            key={y}
                            onClick={() => handleCreateFiling(y)}
                            disabled={isFiled || isSubmitting}
                            className={`w-full h-full flex flex-col items-center justify-center p-6 border rounded-2xl transition-all font-semibold  ${isFiled
                                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 hover:shadow-md'
                                }`}
                        >
                            <Calendar className={`w-6 h-6 mb-2 ${isFiled ? 'text-gray-300' : 'text-gray-400'}`} />
                            <span className="text-xl">{y}</span>
                            {isFiled && <span className="text-xs mt-2 font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Already Filed</span>}
                        </button>
                    )
                })}
            </div>

            {isSubmitting && (
                <div className="mt-8 flex items-center justify-center text-blue-600 gap-2 font-medium">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating new filing workspace...
                </div>
            )}
        </div>
    )
}
