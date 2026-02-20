import { createClient } from '@/utils/supabase/server'
import DocumentsClient from './documents-client'
import { getDocuments } from '@/app/actions/document-actions'

export default async function DocumentsPage({
    searchParams,
}: {
    searchParams: { profileId: string }
}) {
    // 1. Fetch Profile ID
    const { profileId } = await searchParams

    if (!profileId) {
        return <div>Profile ID Missing</div>
    }

    // 2. Fetch Intake Responses (Server Side)
    const supabase = await createClient()
    const { data: profile } = await supabase
        .from('tax_profiles')
        .select('intake_responses')
        .eq('id', profileId)
        .single()

    const intakeData = profile?.intake_responses || null

    // 3. Fetch Existing Documents (Server Side)
    // This runs on the server every request (dynamic)
    // 3. Fetch Existing Documents (Server Side)
    // This runs on the server every request (dynamic)
    const initialDocuments = await getDocuments(profileId)

    // 4. Render Client Component with Initial Data
    return (
        <DocumentsClient
            profileId={profileId}
            initialIntakeData={intakeData}
            initialDocuments={initialDocuments}
        />
    )
}
