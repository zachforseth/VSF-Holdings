
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Calendar, ArrowLeft } from 'lucide-react'
import DashboardLayout from '../../dashboard/layout'

export default async function SelectYearPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const currentYear = new Date().getFullYear()
    // Assuming 2025 is current filing year, prior years are loopable
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i) // 2026, 2025, ... 2021?
    // User specifically mentioned 2025, 2024, 2023...
    // Let's filter to relevant tax years. Maybe 2025 down to 2018?
    const taxYears = [2024, 2023, 2022, 2021, 2020]

    return (
        <DashboardLayout>
            <div className="max-w-xl mx-auto pt-10 px-6 space-y-10">

                {/* Back Button */}
                <div>
                    <Link href='/filing/select-profile' className='flex items-center text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors'>
                        <ArrowLeft className='w-4 h-4 mr-1' /> Back to current year
                    </Link>
                </div>

                <div className='text-center'>
                    <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
                        Which year are you filing for?
                    </h1>
                    <p className='mt-2 text-gray-500'>
                        Select the tax year to proceed.
                    </p>
                </div>

                <div className='flex flex-col space-y-3'>
                    {taxYears.map((year) => (
                        <Link
                            key={year}
                            href={`/filing/select-profile?year=${year}`}
                            className='group w-full bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between hover:border-[#635BFF] transition-all'
                        >
                            <div className='flex items-center gap-4'>
                                <div className='w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors'>
                                    <Calendar className='w-5 h-5 text-gray-400 group-hover:text-[#635BFF]' />
                                </div>
                                <span className='text-lg font-bold text-gray-900'>{year} Tax Return</span>
                            </div>
                            <ChevronRight className='w-5 h-5 text-gray-300 group-hover:text-[#635BFF] group-hover:translate-x-1 transition-all' />
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
