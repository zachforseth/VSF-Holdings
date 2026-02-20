import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDB() {
    console.log('Testing DB Access...')

    // 1. List all tax docs (limit 5)
    const { data: docs, error } = await supabase
        .from('tax_documents')
        .select('*')
        .limit(5)

    if (error) {
        console.error('Error fetching docs:', error)
    } else {
        console.log(`Found ${docs?.length || 0} total docs in DB (sample)`)
        console.log(docs)
    }

    // 2. Check for Profiles
    const { count: profileCount, error: profileError } = await supabase
        .from('tax_profiles')
        .select('*', { count: 'exact', head: true })

    if (profileError) {
        console.error('Error fetching profiles:', profileError)
    } else {
        console.log(`Found ${profileCount} total profiles in DB`)
    }

    // 3. Attempt Insert (Test)
    // Need a valid profile ID first
    const { data: profiles } = await supabase.from('tax_profiles').select('id').limit(1);
    if (profiles && profiles.length > 0) {
        const testProfileId = profiles[0].id;
        console.log(`Attempting insert for profile: ${testProfileId}`);

        const { data: newDoc, error: insertError } = await supabase
            .from('tax_documents')
            .insert({
                profile_id: testProfileId,
                file_name: 'test-script-upload.txt',
                file_path: `${testProfileId}/test-script.txt`,
                file_type: 'text/plain',
                filing_year: '2025'
            })
            .select()

        if (insertError) {
            console.error('Insert Error:', insertError)
        } else {
            console.log('Insert Success:', newDoc)
            // Cleanup
            await supabase.from('tax_documents').delete().eq('id', newDoc[0].id);
            console.log('Cleanup Success');
        }
    } else {
        console.log('No profiles found to test insert');
    }
}

testDB()
