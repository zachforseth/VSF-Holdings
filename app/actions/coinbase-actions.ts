'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Client, resources } from 'coinbase-commerce-node' // You likely installed this for the pickup flow

export async function createCoinbaseCheckout() {
    const coinbaseApiKey = process.env.COINBASE_API_KEY;
    if (!coinbaseApiKey) {
        throw new Error('Server Configuration Error: Missing Coinbase API Key');
    }

    // Initialize Coinbase
    Client.init(coinbaseApiKey);

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // 1. Calculate Total from Cart
    const { data: profiles } = await supabase
        .from('tax_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('filing_status', 'ready_to_pay')

    if (!profiles || profiles.length === 0) throw new Error('Cart is empty')

    const totalAmount = profiles.reduce((sum, p) => sum + (p.quoted_price || 0), 0)

    // 2. Create Charge
    const chargeData = {
        name: 'VSF Capital Tax Filing',
        description: `Tax Filing for ${profiles.length} profile(s)`,
        pricing_type: 'fixed_price',
        local_price: {
            amount: totalAmount.toString(),
            currency: 'CAD',
        },
        metadata: {
            user_id: user.id,
            profile_ids: profiles.map(p => p.id).join(','), // Track who we are paying for
        },
        // Dynamically get the base url from env or verify headers if needed, but for now process.env.NEXT_PUBLIC_BASE_URL is a safe bet if configured, or origin
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/filing/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/filing/intake/payment`,
    }

    // 3. Create the Charge via API
    const Charge = resources.Charge
    const charge = await Charge.create(chargeData)

    // 4. Redirect to Coinbase Hosted Page
    if (charge.hosted_url) {
        redirect(charge.hosted_url)
    }
}
