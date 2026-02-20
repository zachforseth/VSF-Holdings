import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NewProfileForm from '@/components/filing/NewProfileForm'

export default async function NewProfilePage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { year } = await searchParams
    const selectedYear = year ? parseInt(year) : new Date().getFullYear()

    return (
        <div className='bg-white min-h-screen relative flex items-center justify-center p-6'>

            <div className='w-full max-w-4xl'>

                {/* Back Button - loops back to the "Hub" */}
                <div className='mb-6 md:mb-0 md:absolute md:top-8 md:left-8'>
                    <Link href={`/filing/select-profile?year=${selectedYear}`} className='inline-flex items-center text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors'>
                        <ArrowLeft className='w-4 h-4 mr-1' /> Back
                    </Link>
                </div>

                <div className='text-center mb-10'>
                    <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
                        Create a new profile
                    </h1>
                    <p className='mt-2 text-gray-500 text-lg'>
                        This permanent profile will be used for all your future tax returns.
                    </p>
                </div>

                <NewProfileForm userEmail={user.email || ''} year={selectedYear} />
            </div>
        </div>
    )
}
