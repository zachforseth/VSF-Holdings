'use client'

import { Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Profile {
    id: string
    first_name: string
}

export default function DocumentFilters({ profiles, selectedProfileId, selectedYear }: { profiles: Profile[] | null, selectedProfileId?: string, selectedYear?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        const params = new URLSearchParams(searchParams.toString())
        if (val) {
            params.set('profileId', val)
        } else {
            params.delete('profileId')
        }
        router.push(`?${params.toString()}`)
    }

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        const params = new URLSearchParams(searchParams.toString())
        if (val) {
            params.set('year', val)
        } else {
            params.delete('year')
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <div className='grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-4 bg-gray-50 p-2 sm:p-4 rounded-2xl border border-gray-100'>
            <div className='flex items-center gap-2 sm:gap-2 bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2 text-sm sm:text-sm font-medium justify-between min-w-0'>
                <Filter className='w-4 h-4 sm:w-4 sm:h-4 text-gray-400 shrink-0' />
                <select
                    className='outline-none bg-transparent cursor-pointer min-w-0 w-[calc(100%-12px)] sm:w-auto truncate'
                    value={selectedProfileId || ''}
                    onChange={handleProfileChange}
                >
                    <option value="">All Profiles</option>
                    {profiles?.map(p => <option key={p.id} value={p.id}>{p.first_name}</option>)}
                </select>
            </div>

            <div className='flex items-center gap-2 sm:gap-2 bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2 text-sm sm:text-sm font-medium justify-between min-w-0'>
                <select
                    className='outline-none bg-transparent cursor-pointer min-w-0 w-full sm:w-auto truncate'
                    value={selectedYear || ''} // Default to empty string for "All Years"
                    onChange={handleYearChange}
                >
                    <option value="">All Years</option>
                    <option value="2025">2025 Tax Year</option>
                    <option value="2024">2024 Tax Year</option>
                    <option value="2023">2023 Tax Year</option>
                    <option value="2022">2022 Tax Year</option>
                </select>
            </div>
        </div>
    )
}
