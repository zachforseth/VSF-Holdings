
import { createClient } from '@/utils/supabase/server'
import { getTaxProfiles } from '@/app/actions/profile-actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ArrowRight } from 'lucide-react'

export default async function SelectProfilePage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login?message=Please log in to continue')
    }

    const profiles = await getTaxProfiles()

    return (
        <div className='min-h-screen bg-white flex flex-col items-center pt-32 px-4'>
            {/* 1. Main Heading */}
            <div className='text-center mb-8'>
                <h1 className='text-4xl font-bold text-gray-900 tracking-tight'>
                    Who will this tax return be for?
                </h1>
            </div>

            {/* 2. Selection List */}
            <div className='w-full max-w-xl'>
                {/* THE LABEL - Matches Figma "Choose one" */}
                {profiles.length > 0 && (
                    <p className='text-sm font-bold text-[#E5E5E5] mb-2 ml-1'>
                        Choose one
                    </p>
                )}

                <div className='space-y-3'>
                    {profiles.length > 0 ? (
                        profiles.map((profile) => (
                            <Link
                                key={profile.id}
                                href={`/dashboard/year-selection?profileId=${profile.id}`}
                                className='group block w-full bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between hover:border-blue-500 hover:shadow-md transition-all cursor-pointer'
                            >
                                <span className='text-xl font-bold text-gray-900'>
                                    {profile.first_name}&rsquo;s Tax Return
                                </span>
                                <ChevronRight className='w-6 h-6 text-gray-300 group-hover:text-blue-500 transition-colors' />
                            </Link>
                        ))
                    ) : (
                        <div className='p-6 text-center text-gray-400 border border-gray-100 rounded-2xl bg-gray-50'>
                            No profiles found. Create one below.
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Bottom Actions */}
            <div className='flex flex-col items-center space-y-6 pt-12'>
                {/* Dark Pill Button */}
                <Link
                    href='/dashboard/new-profile'
                    className='bg-[#2C2C2C] text-white text-lg font-medium py-3 px-10 rounded-full hover:bg-black transition-colors shadow-lg shadow-gray-200'
                >
                    Create a new profile
                </Link>
                {/* Text Link */}
                <Link href='#' className='text-sm font-bold text-gray-900 flex items-center gap-1 hover:opacity-70 transition-opacity'>
                    File for a different year <ArrowRight className='w-4 h-4' />
                </Link>
            </div>
        </div>
    )
}
