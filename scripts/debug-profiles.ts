
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
    console.log('Fetching profiles...')
    const { data: profiles, error } = await supabase
        .from('tax_profiles')
        .select('*')

    if (error) {
        console.error('Error fetching profiles:', error)
        return
    }

    console.log(`Found ${profiles.length} profiles:`)
    profiles.forEach(p => {
        console.log(`ID: ${p.id}`)
        console.log(`Name: ${p.first_name} ${p.last_name}`)
        console.log(`Email: ${p.email}`)
        console.log(`Stripe Verification Status: ${p.stripe_verification_status}`)
        console.log('---')
    })
}

main()
