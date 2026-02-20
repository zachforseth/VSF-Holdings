import { getAdminUserDetails } from '@/app/actions/admin-actions'
import { adminCreateProfile } from '@/app/actions/admin-actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NewProfileForm from '@/components/filing/NewProfileForm'

// This Server Action wrapper guarantees the redirect happens immediately server-side
async function handleAdminCreateProfile(userId: string, formData: FormData) {
    'use server'
    const res = await adminCreateProfile(userId, formData)
    if (res.success && res.profileId) {
        redirect(`/admin/dashboard/${userId}/new-profile/select-year?profileId=${res.profileId}`)
    } else {
        // Technically Next.js form actions can't easily throw an alert, 
        // so we might just redirect back with an error query or rely on user observation
        console.error("Failed", res.error)
    }
}

export default async function AdminNewProfilePage({
    params
}: {
    params: Promise<{ account_id: string }>
}) {
    const { account_id } = await params
    const { success, user } = await getAdminUserDetails(account_id)

    if (!success || !user) redirect('/admin/dashboard')

    return (
        <div className='min-h-screen bg-white flex flex-col justify-center py-12 px-4'>

            <div className='w-full max-w-4xl mx-auto'>

                {/* Back Button */}
                <div className='mb-6 md:mb-0 md:absolute md:top-8 md:left-8'>
                    <Link href={`/admin/dashboard/${account_id}`} className='inline-flex items-center text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors'>
                        <ArrowLeft className='w-4 h-4 mr-1' /> Back to Account
                    </Link>
                </div>

                <div className='text-center mb-10'>
                    <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
                        Create a new profile
                    </h1>
                    <p className='mt-2 text-gray-500 text-lg'>
                        This permanent profile will be used for all future tax returns for {user.email}.
                    </p>
                </div>

                <div className='bg-white shadow-xl border border-gray-100 rounded-3xl p-8 mb-12'>
                    <NewProfileForm
                        userEmail={user.email || ''}
                        actionOverride={handleAdminCreateProfile.bind(null, account_id)}
                    />
                </div>
            </div>
        </div>
    )
}
