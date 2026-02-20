import { createClient } from '@/utils/supabase/server'
import { createTaxProfile } from '@/app/actions/profile-actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    return (
        <div className='min-h-screen bg-white flex flex-col justify-center py-12 px-4'>

            <div className='w-full max-w-4xl mx-auto'>

                {/* Back Button */}
                <div className='mb-6 md:mb-0 md:absolute md:top-8 md:left-8'>
                    <Link href='/dashboard/select-profile' className='inline-flex items-center text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors'>
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

                <form action={createTaxProfile} className='space-y-6'>

                    {/* ROW 1: Name */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-1.5'>First Name</label>
                            <input required name='firstName' className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white' placeholder='Legal first name' />
                        </div>
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Last Name</label>
                            <input required name='lastName' className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white' placeholder='Legal last name' />
                        </div>
                    </div>

                    {/* ROW 2: ID Numbers */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Social Insurance Number</label>
                            <input required name='sin' placeholder='000 000 000' className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white' />
                        </div>
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Date of Birth</label>
                            <input required name='dob' type='date' className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white' />
                        </div>
                    </div>

                    {/* ROW 3: Status, Phone, Citizenship (The 3-Col Fix) */}
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Marital Status</label>
                            <select required name='maritalStatus' className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white'>
                                <option value=''>Select...</option>
                                <option value='Single'>Single</option>
                                <option value='Married'>Married</option>
                                <option value='Common-Law'>Common-Law</option>
                                <option value='Separated'>Separated</option>
                                <option value='Divorced'>Divorced</option>
                                <option value='Widowed'>Widowed</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Phone Number</label>
                            <input required name='phone' type='tel' placeholder='(555) 123-4567' className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white' />
                        </div>
                        {/* MOVED HERE: Citizenship Select */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Citizenship Status</label>
                            <select name='isCitizen' className='block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border transition-all hover:bg-white'>
                                {/* value='on' ensures it works with your existing backend logic */}
                                <option value='on'>Canadian Citizen</option>
                                <option value=''>Not a Canadian Citizen</option>
                            </select>
                        </div>
                    </div>

                    {/* ROW 4: Address */}
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Home Address</label>
                        <div className='grid grid-cols-6 gap-3'>
                            <input required name='address' placeholder='Street Address' className='col-span-6 sm:col-span-3 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border hover:bg-white' />
                            <input required name='city' placeholder='City' className='col-span-3 sm:col-span-1 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border hover:bg-white' />
                            <select required name='province' className='col-span-3 sm:col-span-1 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border hover:bg-white'>
                                <option value='AB'>AB</option>
                                <option value='BC'>BC</option>
                                <option value='MB'>MB</option>
                                <option value='NB'>NB</option>
                                <option value='NL'>NL</option>
                                <option value='NS'>NS</option>
                                <option value='NT'>NT</option>
                                <option value='NU'>NU</option>
                                <option value='ON'>ON</option>
                                <option value='PE'>PE</option>
                                <option value='SK'>SK</option>
                                <option value='YT'>YT</option>
                            </select>
                            <input required name='postalCode' placeholder='Postal' className='col-span-6 sm:col-span-1 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3.5 px-4 bg-gray-50 border hover:bg-white' />
                        </div>
                    </div>

                    {/* ROW 5: Footer Actions */}
                    <div className='flex items-center justify-end pt-6'>

                        {/* Hidden Fields */}
                        <input type='hidden' name='email' value={user.email} />
                        <input type='hidden' name='residencyProvince' value='AB' />
                        <button
                            type='submit'
                            className='bg-[#4374D4] text-white text-base font-semibold py-3.5 px-10 rounded-full hover:bg-[#3460b5] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto'
                        >
                            Save & Continue
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
