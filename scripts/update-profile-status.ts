
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
    console.log('Updating profile status...')

    // Update Zach's profile to 'verified' for testing
    // ID: 92382fb8-f4da-4840-abae-938cff42374f
    const { data, error } = await supabase
        .from('tax_profiles')
        .update({ stripe_verification_status: 'verified' })
        .eq('id', '92382fb8-f4da-4840-abae-938cff42374f')
        .select()

    if (error) {
        console.error('Error updating profile:', error)
        return
    }

    console.log('Updated profile:', data)
}

main()
