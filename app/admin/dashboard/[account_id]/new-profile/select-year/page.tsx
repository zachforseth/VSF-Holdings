import { getAdminUserDetails, adminSetFilingYear } from '@/app/actions/admin-actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'

// Action wrapper
async function handleSelectYear(profileId: string, account_id: string, year: number) {
    'use server'
    const res = await adminSetFilingYear(profileId, year.toString())
    if (res.success) {
        redirect(`/admin/filing/${profileId}`)
    } else {
        console.error("Failed to set year", res.error)
    }
}

export default async function AdminSelectYearPage({
    params,
    searchParams
}: {
    params: Promise<{ account_id: string }>,
    searchParams: Promise<{ profileId: string }>
}) {
    const { account_id } = await params
    const { profileId } = await searchParams
    const { success, user } = await getAdminUserDetails(account_id)

    if (!success || !user || !profileId) redirect('/admin/dashboard')

    const years = [2025, 2024, 2023, 2022, 2021, 2020]

    return (
        <div className='min-h-screen bg-white flex flex-col justify-center py-12 px-4'>
            <div className='absolute top-8 left-8'>
                <Link href={`/admin/dashboard/${account_id}`} className='flex items-center text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors'>
                    <ArrowLeft className='w-4 h-4 mr-1' /> Cancel & Return
                </Link>
            </div>

            <div className='w-full max-w-2xl mx-auto'>
                <div className='text-center mb-10'>
                    <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
                        Select Tax Year
                    </h1>
                    <p className='mt-2 text-gray-500 text-lg'>
                        Which year is this return for?
                    </p>
                </div>

                <div className='bg-white shadow-xl border border-gray-100 rounded-3xl p-8 mb-12'>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {years.map(y => (
                            <form key={y} action={handleSelectYear.bind(null, profileId, account_id, y)}>
                                <button type="submit" className="w-full h-full flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-all font-semibold text-gray-700 group">
                                    <Calendar className="w-6 h-6 mb-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-xl">{y}</span>
                                </button>
                            </form>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
