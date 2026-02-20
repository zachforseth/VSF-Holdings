import { getAdminUserDetails } from '@/app/actions/admin-actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NewFilingWizard from './wizard'

export default async function AdminNewFilingPage({
    params
}: {
    params: Promise<{ account_id: string }>
}) {
    const { account_id } = await params
    const { success, user, profiles } = await getAdminUserDetails(account_id)

    if (!success || !user) redirect('/admin/dashboard')

    if (!profiles || profiles.length === 0) {
        return (
            <div className='min-h-screen bg-white flex flex-col justify-center py-12 px-4 text-center'>
                <h1 className='text-2xl font-bold text-gray-900 mb-4'>No Profiles Found</h1>
                <p className='text-gray-500 mb-8'>This account has no base profiles to clone. You must set up a tax profile first.</p>
                <Link href={`/admin/dashboard/${account_id}/new-profile`} className='mx-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors w-fit'>
                    Setup Tax Profile
                </Link>
                <Link href={`/admin/dashboard/${account_id}`} className='text-blue-600 hover:underline mt-6 block'>
                    &larr; Back to Account
                </Link>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-white flex flex-col justify-center py-12 px-4'>
            <div className='absolute top-8 left-8'>
                <Link href={`/admin/dashboard/${account_id}`} className='flex items-center text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors'>
                    <ArrowLeft className='w-4 h-4 mr-1' /> Cancel & Return
                </Link>
            </div>

            <div className='w-full max-w-4xl mx-auto'>
                <div className='text-center mb-10'>
                    <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
                        Start New Filing
                    </h1>
                    <p className='mt-2 text-gray-500 text-lg'>
                        Create a filing for a new tax year based on an existing profile.
                    </p>
                </div>

                <div className='bg-white shadow-xl border border-gray-100 rounded-3xl p-8 mb-12'>
                    <NewFilingWizard profiles={profiles} accountId={account_id} />
                </div>
            </div>
        </div>
    )
}
