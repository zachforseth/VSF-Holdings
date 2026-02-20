import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DocumentFilters from './document-filters'
import DocumentsTable from './documents-table'

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ profileId?: string, year?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { profileId: selectedProfileId, year: selectedYearRaw } = await searchParams
    const selectedYear = selectedYearRaw || '2025' // Default to 2025

    // 1. Fetch all profiles for the filter dropdown
    const { data: profiles } = await supabase
        .from('tax_profiles')
        .select('id, first_name')
        .eq('user_id', user.id)

    // 2. Fetch documents
    // We first get all profile IDs for this user
    const profileIds = profiles?.map(p => p.id) || []

    let query = supabase
        .from('tax_documents')
        .select(`
            *,
            tax_profiles (
                filing_year, 
                first_name
            )
        `)
        // Default: Show documents for any of the user's profiles
        .in('profile_id', profileIds)

    // Filter by Profile
    if (selectedProfileId && selectedProfileId !== 'all') {
        const cleanProfileId = selectedProfileId.substring(0, 36)
        query = query.eq('profile_id', cleanProfileId)
    }

    // Filter by Year (Include NULL years for profile-level docs like Void Cheques)
    if (selectedYear && selectedYear !== 'All Years') {
        query = query.or(`filing_year.eq.${selectedYear},filing_year.is.null`)
    }
    // If 'All Years' is selected (or logic implies no filter), we don't apply an eq filter.
    // However, the default is handled upstream. 
    // If selectedYear is present, use the OR logic.

    const { data: documents } = await query

    return (
        <div className="min-h-screen bg-[#FCFCFC]">
            {/* Navbar is handled by Layout now */}

            <main className='w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-12 space-y-6 sm:space-y-12 overflow-x-hidden'>
                <div>
                    <h1 className='text-4xl font-bold text-gray-900 tracking-tight'>Documents</h1>
                    <p className='text-gray-400 text-xl font-light mt-2'>Access and manage your tax files</p>
                </div>

                {/* FILTERS BAR */}
                <DocumentFilters
                    profiles={profiles}
                    selectedProfileId={selectedProfileId}
                    selectedYear={selectedYear}
                />

                {/* DOCUMENTS LIST */}
                <DocumentsTable documents={documents} profiles={profiles} selectedYear={selectedYear} />
            </main>
        </div>
    )
}
